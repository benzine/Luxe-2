import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_MIRROR, useConfig, type MirrorMuse, type MirrorShade } from "../lib/config";
import { Ic, Reveal, SectionHead, toast } from "./Ornaments";
import type { BookPrefill } from "./Services";

/* ── colour helpers ────────────────────────────────────────────── */
const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};
const rgbToHex = (r: number, g: number, b: number) =>
  "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");

/* shortest-path circular hue interpolation (always takes the near way round) */
function lerpHue(a: number, b: number, t: number): number {
  let d = ((b - a + 540) % 360) - 180;
  return a + d * t;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (mx === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s * 100, l * 100];
}
/* Shortest-path circular interpolation between two hues (degrees).
   Always returns a hue in [0,360). Used to pull a strand's hue toward
   the shade's own hue without ever crossing through the unstable
   region-mean delta (which inverted dark strands to green). */
function hueToward(from: number, to: number, t: number): number {
  let d = ((to - from + 540) % 360) - 180; /* signed shortest arc, [-180,180) */
  return ((from + d * t) % 360 + 360) % 360;
}
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0]; else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x]; else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

/* skin heuristic — used to keep the dye off faces/arms. */
function isSkin(r: number, g: number, b: number): boolean {
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return y > 60 && cb > 77 && cb < 127 && cr > 133 && cr < 173;
}

/* ── hair mask: MediaPipe first, classic region-growing fallback ── */
type MaskFn = (img: HTMLImageElement, w: number, h: number) => Promise<Uint8Array | null>;

let mlMask: MaskFn | null | undefined = undefined;
async function getMlMask(): Promise<MaskFn | null> {
  if (mlMask !== undefined) return mlMask;
  try {
    const [{ FilesetResolver, ImageSegmenter }] = await Promise.all([
      import("@mediapipe/tasks-vision"),
    ]);
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
    );
    const seg = await ImageSegmenter.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_segmenter/hair_segmenter/float32/1/hair_segmenter.tflite",
        delegate: "GPU",
      },
      runningMode: "IMAGE",
      outputCategoryMask: true,
    });
    mlMask = async (img, w, h) => {
      const res = seg.segment(img);
      const cat = res.categoryMask;
      if (!cat) return null;
      const src = cat.getAsUint8Array();
      const mw = cat.width, mh = cat.height;
      const out = new Uint8Array(w * h);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const sx = Math.min(mw - 1, Math.floor((x / w) * mw));
          const sy = Math.min(mh - 1, Math.floor((y / h) * mh));
          out[y * w + x] = src[sy * mw + sx] > 0 ? 1 : 0;
        }
      }
      cat.close();
      res.close();
      return out;
    };
    return mlMask;
  } catch {
    mlMask = null;
    return null;
  }
}

/* Classic fallback: flood from the top, keep pixels close to the muse's
   sampled hair colour, reject skin. Gives an honest, usable mask even
   offline. Texture rescue: slightly desaturated hair still counts. */
function classicMask(data: Uint8ClampedArray, w: number, h: number, hairHex: string, tolerance: number): Uint8Array {
  const [hr, hg, hb] = hexToRgb(hairHex);
  const tol = 60 + tolerance * 1.6;
  const out = new Uint8Array(w * h);
  const seen = new Uint8Array(w * h);
  const stack: number[] = [];
  const near = (r: number, g: number, b: number) => {
    const dr = r - hr, dg = g - hg, db = b - hb;
    return Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db) / 3 <= tol;
  };
  /* seed the top rows (hair lives at the top of a portrait) */
  for (let x = 0; x < w; x += 3) {
    for (let y = 0; y < Math.min(h, Math.floor(h * 0.3)); y += 3) {
      const i = (y * w + x) * 4;
      if (near(data[i], data[i + 1], data[i + 2]) && !isSkin(data[i], data[i + 1], data[i + 2])) {
        const idx = y * w + x;
        if (!seen[idx]) { seen[idx] = 1; stack.push(idx); }
      }
    }
  }
  while (stack.length) {
    const idx = stack.pop()!;
    out[idx] = 1;
    const x = idx % w, y = (idx / w) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const nIdx = ny * w + nx;
      if (seen[nIdx]) continue;
      const i = nIdx * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (isSkin(r, g, b)) continue;
      if (near(r, g, b)) { seen[nIdx] = 1; stack.push(nIdx); }
    }
  }
  return out;
}

/* ── recolor: natural relative colour transfer ──────────────────
   Rather than painting every strand toward a flat target (which looks
   like a hard dye), we measure the hair region's true average HSL and
   shift each pixel by the SAME relative offset. Every strand keeps its
   exact offset from the average, so the natural brightness & contrast
   curve is preserved — only the colour family changes. The binary mask
   is feathered first so recolored hair blends into the photo, not a
   hard line. */
function recolor(
  src: Uint8ClampedArray, dst: Uint8ClampedArray, mask: Uint8Array,
  w: number, h: number, shade: MirrorShade, warmth: number, shine: number
) {
  const total = w * h;

  /* 1. Feather the mask: 5×5 box blur → soft weights [0..1] for edges. */
  const weight = new Float32Array(total);
  const tmp = new Float32Array(total);
  const R = 2;
  for (let px = 0; px < total; px++) tmp[px] = mask[px] ? 1 : 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let acc = 0, n = 0;
    for (let dx = -R; dx <= R; dx++) { const xx = x + dx; if (xx < 0 || xx >= w) continue; acc += tmp[y * w + xx]; n++; }
    weight[y * w + x] = acc / n;
  }

  /* 2. Measure the hair region's true average HSL (circular hue mean). */
  let hx = 0, hy = 0, bS = 0, bL = 0, bN = 0;
  for (let px = 0; px < total; px++) {
    if (!mask[px]) continue;
    const i = px * 4;
    const [ph, ps, pl] = rgbToHsl(src[i], src[i + 1], src[i + 2]);
    hx += Math.cos((ph * Math.PI) / 180); hy += Math.sin((ph * Math.PI) / 180);
    bS += ps; bL += pl; bN++;
  }
  if (bN === 0) { dst.set(src); return; } /* no hair found — leave photo untouched */
  let bH = (Math.atan2(hy, hx) * 180) / Math.PI; if (bH < 0) bH += 360;
  bS /= bN; bL /= bN;

  /* 3. Natural recolor — the strand keeps its own brightness and contrast.
        Fluorescence came from replacing saturation with the shade's; instead
        we derive it from the ORIGINAL pixel (capped low) and let hue rotation
        carry the colour. Brightness: each strand keeps its offset from the
        region average (its highlight/shadow position) while the overall depth
        eases toward the shade — so the photo's natural contrast survives. */
  const dh = (warmth - 50) * 0.10;                    /* gentle warmth nudge */
  const dl = (shine - 50) * 0.05;                     /* gentle shine lift */
  const targetH = shade.h + dh;                       /* sane target — the shade's own hue */
  const satF = Math.min(shade.s, 55) / 55;            /* shade strength, capped */
  /* base lightness eases 60% toward the shade's depth (blonde lifts, espresso
     deepens); the per-strand offset is kept at 94% so contrast is preserved */
  const baseL = bL + (shade.l + dl - bL) * 0.6;
  const CONTRAST_KEEP = 0.94;
  const SAT_CAP = 52;                                 /* hard ceiling — never neon */

  for (let i = 0, px = 0; i < src.length; i += 4, px++) {
    const wt = weight[px];
    if (wt < 0.02) { dst[i] = src[i]; dst[i + 1] = src[i + 1]; dst[i + 2] = src[i + 2]; dst[i + 3] = 255; continue; }
    const [ph, ps, pl] = rgbToHsl(src[i], src[i + 1], src[i + 2]);
    /* hue: shortest-path blend toward the shade's OWN hue (never a delta off
       the unstable region mean — that's what inverted dark strands to green).
       The blend weight rises with the strand's own chroma, so truly dark /
       gray shadow spots stay neutral instead of flipping colour. */
    const huePull = 0.55 + Math.min(1, ps / 45) * 0.43; /* 0.55 → 0.98 */
    const nh = hueToward(ph, targetH, huePull);
    /* saturation: from the strand's OWN chroma, scaled modestly, hard-capped.
       Low-chroma (dark) pixels stay low-chroma → neutral shadow, no green. */
    const ns = Math.max(3, Math.min(SAT_CAP, ps * (0.5 + satF * 0.65)));
    /* lightness: shade depth + the strand's preserved contrast offset */
    const nl = Math.max(2, Math.min(98, baseL + (pl - bL) * CONTRAST_KEEP));
    const [r, g, b] = hslToRgb(nh, ns, nl);
    /* blend by feather weight so the edge melts into the photo */
    dst[i] = src[i] + (r - src[i]) * wt;
    dst[i + 1] = src[i + 1] + (g - src[i + 1]) * wt;
    dst[i + 2] = src[i + 2] + (b - src[i + 2]) * wt;
    dst[i + 3] = 255;
  }
}

/* ── camera capture ────────────────────────────────────────────── */
function CameraStudio({ onCapture, onClose }: { onCapture: (dataUrl: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 1280 }, audio: false });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        const v = videoRef.current;
        if (v) { v.srcObject = stream; await v.play(); setReady(true); }
      } catch {
        setErr("Camera unavailable or permission denied. Upload a photo instead.");
      }
    })();
    return () => { cancelled = true; stream?.getTracks().forEach((t) => t.stop()); };
  }, []);

  const snap = () => {
    setCountdown(3);
    const tick = (n: number) => {
      if (n <= 0) {
        setCountdown(0);
        const v = videoRef.current;
        if (!v) return;
        const c = document.createElement("canvas");
        c.width = v.videoWidth; c.height = v.videoHeight;
        c.getContext("2d")!.drawImage(v, 0, 0);
        onCapture(c.toDataURL("image/jpeg", 0.92));
        return;
      }
      setCountdown(n);
      setTimeout(() => tick(n - 1), 800);
    };
    tick(3);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0b0808]/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[1.6rem] border border-[#c9b037]/30 bg-[#161112] shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#c9b037]">The fitting room</p>
          <button onClick={onClose} aria-label="Close camera" className="text-[#c0aea4] transition-colors hover:text-[#f2e9e1]"><Ic.X /></button>
        </div>
        <div className="relative aspect-[4/5] bg-black">
          {err ? (
            <div className="flex h-full items-center justify-center px-8 text-center text-sm leading-relaxed text-[#c0aea4]">{err}</div>
          ) : (
            <>
              <video ref={videoRef} playsInline muted className="h-full w-full -scale-x-100 object-cover" />
              {countdown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <span className="font-display text-8xl font-semibold text-[#f5e6d3] drop-shadow-lg">{countdown}</span>
                </div>
              )}
              <div className="pointer-events-none absolute inset-6 rounded-[1rem] border border-dashed border-[#f5e6d3]/25" />
            </>
          )}
        </div>
        <div className="flex items-center justify-center gap-4 py-4">
          <button onClick={snap} disabled={!ready || countdown > 0} aria-label="Take photo"
            className="group relative h-14 w-14 rounded-full border-2 border-[#c9b037] transition-transform hover:scale-105 disabled:opacity-40">
            <span className="absolute inset-1.5 rounded-full bg-[#c9b037] transition-transform group-active:scale-90" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── main Mirror ───────────────────────────────────────────────── */
export default function Mirror({ onBook }: { onBook: (p: BookPrefill) => void }) {
  const cfg = useConfig();
  const head = cfg.headings.mirror;
  const mcfg = cfg.mirror ?? DEFAULT_MIRROR;

  const [museId, setMuseId] = useState(mcfg.models[0]?.id ?? "muse");
  const [custom, setCustom] = useState<{ image: string; label: string } | null>(null);
  const [shade, setShade] = useState<MirrorShade>(mcfg.shades[0] ?? { id: "natural", label: "Natural", h: 28, s: 38, l: 42 });
  const [customShade, setCustomShade] = useState<MirrorShade | null>(null);
  const [warmth, setWarmth] = useState(mcfg.warmth);
  const [shine, setShine] = useState(mcfg.shine);
  const [comparing, setComparing] = useState(false);
  const [showMask, setShowMask] = useState(false);
  const [busy, setBusy] = useState(false);
  const [engine, setEngine] = useState<"…" | "AI" | "classic">("…");
  const [camOpen, setCamOpen] = useState(false);
  const [mixedOpen, setMixedOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const dispRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<Uint8Array | null>(null);
  const srcDataRef = useRef<{ data: Uint8ClampedArray; w: number; h: number } | null>(null);

  const muse: MirrorMuse | null = custom
    ? { id: "custom", label: custom.label, image: custom.image, hair: "#6b4f3a" }
    : mcfg.models.find((m) => m.id === museId) ?? mcfg.models[0] ?? null;
  const activeShade = customShade ?? shade;

  /* load + segment + paint */
  const load = useCallback(async (m: MirrorMuse) => {
    setBusy(true); setEngine("…");
    const img = imgRef.current;
    const disp = dispRef.current;
    if (!img || !disp || !m) { setBusy(false); return; }
    await new Promise<void>((res) => {
      if (img.complete && img.naturalWidth) res();
      else { img.onload = () => res(); img.onerror = () => res(); }
    });
    if (!img.naturalWidth) { setBusy(false); return; }
    const max = 760;
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(2, Math.round(img.naturalWidth * scale));
    const h = Math.max(2, Math.round(img.naturalHeight * scale));
    disp.width = w; disp.height = h;
    const ctx = disp.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(img, 0, 0, w, h);
    const imgData = ctx.getImageData(0, 0, w, h);
    srcDataRef.current = { data: imgData.data, w, h };

    let mask: Uint8Array | null = null;
    const ml = await getMlMask();
    if (ml) {
      try { mask = await ml(img, w, h); } catch { mask = null; }
    }
    if (mask) setEngine("AI");
    else { mask = classicMask(imgData.data, w, h, m.hair, mcfg.tolerance); setEngine("classic"); }
    maskRef.current = mask;
    setBusy(false);
    paint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [museId, custom, mcfg.tolerance]);

  /* repaint with current shade */
  const paint = useCallback(() => {
    const disp = dispRef.current, src = srcDataRef.current, mask = maskRef.current;
    if (!disp || !src || !mask) return;
    const ctx = disp.getContext("2d")!;
    if (comparing) {
      ctx.putImageData(new ImageData(new Uint8ClampedArray(src.data), src.w, src.h), 0, 0);
    } else {
      const out = new Uint8ClampedArray(src.data.length);
      recolor(src.data, out, mask, src.w, src.h, activeShade, warmth, shine);
      ctx.putImageData(new ImageData(out, src.w, src.h), 0, 0);
    }
    if (showMask) {
      ctx.save();
      ctx.fillStyle = "rgba(201,176,55,0.28)";
      for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) if (mask[y * src.w + x]) ctx.fillRect(x, y, 1, 1);
      ctx.restore();
    }
  }, [comparing, showMask, activeShade, warmth, shine]);

  useEffect(() => { if (muse) void load(muse); }, [museId, custom, load]);
  useEffect(() => { paint(); }, [paint]);

  const onUpload = (f: File | null | undefined) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { setCustom({ image: String(r.result), label: "Your photo" }); setMuseId(""); };
    r.readAsDataURL(f);
  };

  const savePng = () => {
    const disp = dispRef.current;
    if (!disp) return;
    const a = document.createElement("a");
    a.download = `luxe-${activeShade.label.toLowerCase().replace(/\s+/g, "-")}.png`;
    a.href = disp.toDataURL("image/png");
    a.click();
    toast("Look saved to your downloads.");
  };

  const mix = customShade ?? { id: "mix", label: "Your mix", h: 28, s: 50, l: 50 };

  return (
    <section id="mirror" className="relative overflow-hidden bg-basesoft py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[420px_1fr] lg:gap-16">
          {/* ── sticky mirror canvas ── */}
          <Reveal dir="left" className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative mx-auto w-full max-w-[420px]">
              <div className="relative overflow-hidden rounded-[2rem_2rem_2rem_0.6rem] border border-[#c9b037]/25 bg-[#161112] shadow-[var(--shadow-lift)]">
                <div className="relative aspect-[4/5]">
                  {muse && <img ref={imgRef} src={muse.image} alt={muse.label} crossOrigin="anonymous" className="absolute h-0 w-0 opacity-0" />}
                  <canvas ref={dispRef} className="absolute inset-0 h-full w-full object-cover" />
                  {busy && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#161112]/70">
                      <Ic.Sparkle className="h-7 w-7 animate-pulse text-[#c9b037]" />
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#c0aea4]">Reading your hair…</p>
                    </div>
                  )}
                  {/* engine + muse chips */}
                  <div className="absolute left-3 top-3 flex gap-2">
                    <span className="rounded-full bg-[#0b0808]/60 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[#c9b037] backdrop-blur-sm">
                      {engine === "AI" ? "AI hair-map" : engine === "classic" ? "Classic map" : "…"}
                    </span>
                    {muse && <span className="rounded-full bg-[#0b0808]/60 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[#c0aea4] backdrop-blur-sm">{muse.label}</span>}
                  </div>
                  {/* shade chip */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-[#0b0808]/60 px-3 py-1.5 backdrop-blur-sm">
                    <span className="h-3 w-3 rounded-full border border-[#f5e6d3]/40" style={{ background: `hsl(${activeShade.h} ${activeShade.s}% ${activeShade.l}%)` }} />
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#f5e6d3]">{comparing ? "Before" : activeShade.label}</span>
                  </div>
                </div>
              </div>

              {/* actions under the mirror */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  onPointerDown={() => setComparing(true)}
                  onPointerUp={() => setComparing(false)}
                  onPointerLeave={() => setComparing(false)}
                  data-cursor="hand"
                  className="rounded-full border border-[#c9b037]/50 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink transition-colors hover:bg-[#c9b037]/10"
                >
                  Hold · before
                </button>
                <button onClick={() => setShowMask((v) => !v)} data-cursor="hand"
                  className={`rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${showMask ? "border-[#c9b037] bg-[#c9b037]/15 text-ink" : "border-linec text-inksoft hover:bg-[#c9b037]/10"}`}>
                  {showMask ? "Hide selection" : "Show selection"}
                </button>
                <button onClick={savePng} data-cursor="hand" className="rounded-full border border-linec px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-inksoft transition-colors hover:bg-[#c9b037]/10">
                  Save PNG
                </button>
              </div>
            </div>
          </Reveal>

          {/* ── controls ── */}
          <div className="space-y-10">
            <SectionHead eyebrow="The Virtual Mirror" title={head?.title ?? "Step up to"} italic={head?.italic} desc={head?.desc} tr="mirror" />

            {/* muse picker */}
            <Reveal>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-inkfaint">01 · Choose your canvas</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {mcfg.models.map((m) => (
                  <button key={m.id} onClick={() => { setCustom(null); setMuseId(m.id); }} data-cursor="hand"
                    className={`group relative h-24 w-20 overflow-hidden rounded-t-full rounded-b-lg border-2 transition-all ${museId === m.id && !custom ? "border-[#c9b037]" : "border-transparent opacity-70 hover:opacity-100"}`}>
                    <img src={m.image} alt={m.label} loading="lazy" className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0b0808]/85 to-transparent px-1 pb-1 pt-4 text-center font-mono text-[8px] uppercase tracking-[0.08em] text-[#f5e6d3]">{m.label.split("·")[0]}</span>
                  </button>
                ))}
                <button onClick={() => setCamOpen(true)} data-cursor="hand"
                  className={`flex h-24 w-20 flex-col items-center justify-center gap-1.5 rounded-t-full rounded-b-lg border-2 border-dashed transition-all ${custom ? "border-[#c9b037]" : "border-linec text-inksoft hover:border-[#c9b037]/60 hover:text-ink"}`}>
                  <Ic.Camera className="h-5 w-5" /><span className="font-mono text-[8px] uppercase tracking-[0.1em]">Camera</span>
                </button>
                <button onClick={() => fileRef.current?.click()} data-cursor="hand"
                  className="flex h-24 w-20 flex-col items-center justify-center gap-1.5 rounded-t-full rounded-b-lg border-2 border-dashed border-linec text-inksoft transition-all hover:border-[#c9b037]/60 hover:text-ink">
                  <Ic.ArrowUp className="h-5 w-5" /><span className="font-mono text-[8px] uppercase tracking-[0.1em]">Upload</span>
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e.target.files?.[0])} />
              </div>
              <p className="mt-3 text-[12px] leading-relaxed text-inkfaint">
                Everything is processed on your device — your photo never leaves the browser.
              </p>
            </Reveal>

            {/* shade picker */}
            <Reveal delay={60}>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-inkfaint">02 · Pour the shade</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {mcfg.shades.map((s) => (
                  <button key={s.id} onClick={() => { setShade(s); setCustomShade(null); }} data-cursor="hand"
                    className="group flex flex-col items-center gap-1.5" aria-label={s.label}>
                    <span
                      className="block h-11 w-11 rounded-full border-2 shadow-sm transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: `radial-gradient(circle at 32% 28%, hsl(${s.h} ${Math.min(90, s.s + 18)}% ${Math.min(92, s.l + 16)}%), hsl(${s.h} ${s.s}% ${s.l}%) 62%, hsl(${s.h} ${s.s}% ${Math.max(6, s.l - 16)}%))`,
                        borderColor: activeShade.id === s.id && !customShade ? "var(--gold)" : "transparent",
                        boxShadow: activeShade.id === s.id && !customShade ? "0 0 0 3px color-mix(in srgb, var(--gold) 30%, transparent)" : undefined,
                      }}
                    />
                    <span className={`font-mono text-[8px] uppercase tracking-[0.08em] ${activeShade.id === s.id && !customShade ? "text-ink" : "text-inkfaint"}`}>{s.label}</span>
                  </button>
                ))}
                <button onClick={() => setMixedOpen((v) => !v)} data-cursor="hand" className="group flex flex-col items-center gap-1.5" aria-label="Mix your own shade">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed border-linec text-inksoft transition-all group-hover:scale-110 group-hover:border-[#c9b037] group-hover:text-[#c9b037]"
                    style={customShade ? { background: `hsl(${customShade.h} ${customShade.s}% ${customShade.l}%)`, borderColor: "var(--gold)", borderStyle: "solid" } : undefined}>
                    {!customShade && <Ic.Sparkle className="h-4 w-4" />}
                  </span>
                  <span className="font-mono text-[8px] uppercase tracking-[0.08em] text-inkfaint">{customShade ? "Your mix" : "Mix your own"}</span>
                </button>
              </div>

              {mixedOpen && (
                <div className="phase-swap mt-4 rounded-[1.2rem_1.2rem_1.2rem_0.3rem] border border-linec bg-surface p-5">
                  <div className="flex items-center gap-4">
                    <span className="h-12 w-12 shrink-0 rounded-full border border-linec" style={{ background: `hsl(${mix.h} ${mix.s}% ${mix.l}%)` }} />
                    <div className="flex-1 space-y-2.5">
                      {([["Hue", "h", 0, 360], ["Saturation", "s", 0, 90], ["Depth", "l", 10, 85]] as const).map(([label, key, min, max]) => (
                        <label key={key} className="flex items-center gap-3">
                          <span className="w-20 font-mono text-[9px] uppercase tracking-[0.12em] text-inkfaint">{label}</span>
                          <input type="range" min={min} max={max} value={mix[key]}
                            onChange={(e) => setCustomShade({ ...mix, id: "mix", label: "Your mix", [key]: +e.target.value })}
                            className="range-luxe flex-1" />
                          <span className="w-8 text-right font-mono text-[10px] tabular-nums text-inksoft">{mix[key]}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Reveal>

            {/* finish */}
            <Reveal delay={120}>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-inkfaint">03 · The finish</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-3">
                  <span className="w-16 font-mono text-[9px] uppercase tracking-[0.12em] text-inkfaint">Warmth</span>
                  <input type="range" min={0} max={100} value={warmth} onChange={(e) => setWarmth(+e.target.value)} className="range-luxe flex-1" />
                  <span className="w-8 text-right font-mono text-[10px] tabular-nums text-inksoft">{warmth}</span>
                </label>
                <label className="flex items-center gap-3">
                  <span className="w-16 font-mono text-[9px] uppercase tracking-[0.12em] text-inkfaint">Shine</span>
                  <input type="range" min={0} max={100} value={shine} onChange={(e) => setShine(+e.target.value)} className="range-luxe flex-1" />
                  <span className="w-8 text-right font-mono text-[10px] tabular-nums text-inksoft">{shine}</span>
                </label>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => { setWarmth(50); setShine(50); setCustomShade(null); setShade(mcfg.shades[0] ?? { id: "natural", label: "Natural", h: 28, s: 38, l: 42 }); }}
                  data-cursor="hand"
                  className="rounded-full border border-linec px-5 py-2.5 font-mono text-[9px] uppercase tracking-[0.2em] text-inksoft transition-all hover:border-rosedeep/60 hover:text-ink"
                >
                  Reset to natural
                </button>
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-inkfaint">returns warmth, shine & shade to the photo's own hair</span>
              </div>
            </Reveal>

            {/* CTA */}
            <Reveal delay={180}>
              <div className="flex flex-wrap items-center gap-4">
                <button onClick={() => onBook({ service: `Full Balayage — ${activeShade.label}` })} data-cursor="hand"
                  className="btn-sheen rounded-full border border-rosedeep/60 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.24em] text-ink">
                  Book this shade
                </button>
                <p className="font-accenti text-lg text-inksoft">
                  {activeShade.label} · {warmth > 60 ? "warm" : warmth < 40 ? "cool" : "balanced"} · {shine > 60 ? "high shine" : shine < 40 ? "soft matte" : "natural lustre"}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {camOpen && <CameraStudio onCapture={(url) => { setCustom({ image: url, label: "Your portrait" }); setMuseId(""); setCamOpen(false); toast("Portrait captured — colouring your hair."); }} onClose={() => setCamOpen(false)} />}
    </section>
  );
}
