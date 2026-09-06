import { useEffect, useMemo, useRef, useState } from "react";
import { useConfig, type Stage } from "../lib/config";
import { usePrefersReducedMotion, clamp, seg, lerp } from "../lib/hooks";
import { useI18n } from "../lib/i18n";

/* ── THE FINAL CUT ─────────────────────────────────────────────────
   One scroll = one cut. A gold parting blade splits each scene into two
   shards that drift apart along the blade's normal like parted hair,
   revealing the next look rising beneath — glint + sparks on the blade,
   shockwave, dim punch, shine on the incoming look.
   A "projector" intro auto-plays on load (blade draws → wordmark →
   slash into scene 0); scroll then continues the story seamlessly.
   Fully scrubbed + reversible. Reduced motion → static poster. */

/* timeline pacing (in abstract units). HOLD = dwell on a look + its title
   card; TRANS = the cut itself. Kept so each cut is ~30% of a stage —
   readable titles, snappy cuts, normal scroll distance. */
const INTRO = 0.9;
const HOLD = 2.1;
const TRANS = 0.9;
const OUTRO = 0.7;
const BLADE_DEG = -16.3;
const N_SPARKS = 16;

const rnd = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const bell = (t: number, c: number, w: number) => Math.exp(-((t - c) ** 2) / (2 * w * w));
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/* shard polygons along the parting line (tan 16.3° ≈ 0.292 → 29.2% drop) */
const POLY_TOP = "polygon(0% 0%, 100% 0%, 100% 35.4%, 0% 64.6%)";
const POLY_BOT = "polygon(0% 64.6%, 100% 35.4%, 100% 100%, 0% 100%)";
/* feathered edges along the parting normal — clip on the inner img,
   mask rides the wrapper so the feather follows the drift */
const MASK_TOP = "linear-gradient(164deg, #000 36%, rgba(0,0,0,0.82) 46%, transparent 57%)";
const MASK_BOT = "linear-gradient(344deg, #000 36%, rgba(0,0,0,0.82) 46%, transparent 57%)";

export default function Hero() {
  const cfg = useConfig();
  const prm = usePrefersReducedMotion();
  const stages = cfg.stages;
  const { t } = useI18n();
  /* translate a stage field by index, falling back to the admin/config value */
  const sf = (i: number, field: "kicker" | "line1" | "line2" | "sub", fb: string) => t(`hero.${i}.${field}`, fb);
  const N = Math.max(1, stages.length);
  const TOTAL = INTRO + N * HOLD + (N - 1) * TRANS + OUTRO;
  const introEndAbs = INTRO + 0.35;
  const introEndFrac = introEndAbs / TOTAL;

  const wrapRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const ambientRef = useRef<HTMLDivElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const [active, setActive] = useState(0);
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  /* scene windows: hold start + transition start per stage (fractions) */
  const wins = useMemo(() => {
    return stages.map((_, i) => ({
      hold: (INTRO + i * (HOLD + TRANS)) / TOTAL,
      trans: (INTRO + i * (HOLD + TRANS) + HOLD) / TOTAL,
      holdLen: HOLD / TOTAL,
      transLen: TRANS / TOTAL,
    }));
  }, [stages, TOTAL]);

  /* single drive loop: intro tween + scroll mapping + smoothing +
     ambient life (glow drift, shimmer, parallax) without extra renders */
  useEffect(() => {
    if (prm) {
      setP(1 - OUTRO / TOTAL - 0.0001);
      setActive(N - 1);
      return;
    }
    let raf = 0;
    let pCur = 0;
    let introStart = -1;
    let introDone = false;
    let started = false;
    const t0 = performance.now();

    const loop = (ts: number) => {
      raf = requestAnimationFrame(loop);
      const el = wrapRef.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      const scrollProg = total > 0 ? clamp(-el.getBoundingClientRect().top / total) : 0;

      if (!started) {
        started = true;
        /* already mid-story (refresh) → skip the projector intro */
        introStart = scrollProg > 0.001 ? -2 : ts + 350;
      }
      let introProg = introEndFrac;
      if (introStart >= 0 && !introDone) {
        const t = clamp((ts - introStart) / 2600);
        introProg = easeOutCubic(t) * introEndFrac;
        if (t >= 1) introDone = true;
      }
      const userScrolled = scrollProg > 0.001;
      const mapped = introEndFrac + scrollProg * (1 - introEndFrac);
      const target = !introDone && !userScrolled ? introProg : Math.max(mapped, introProg);
      pCur += (target - pCur) * 0.09;
      if (Math.abs(target - pCur) < 0.0004) pCur = target;
      setP(pCur);

      /* which scene owns the frame */
      let act = 0;
      for (let i = 0; i < N; i++) {
        if (pCur >= wins[i].hold) act = i;
      }
      setActive(act);

      /* ambient projector life (time-based, independent of scroll) */
      const t = (ts - t0) / 1000;
      if (ambientRef.current) {
        ambientRef.current.style.transform = `translate3d(${Math.sin(t * 0.13) * 44}px, ${Math.cos(t * 0.09) * 30}px, 0)`;
      }
      if (shimmerRef.current) {
        const cycle = (t % 4.6) / 4.6;
        shimmerRef.current.style.left = `${-14 + cycle * 114}%`;
        shimmerRef.current.style.opacity = String(Math.sin(cycle * Math.PI) * 0.9);
      }
      /* mouse parallax on the scene stack */
      const m = mouse.current;
      m.x = lerp(m.x, m.tx, 0.05);
      m.y = lerp(m.y, m.ty, 0.05);
      if (stackRef.current) {
        stackRef.current.style.transform = `translate3d(${m.x * 11}px, ${m.y * 8}px, 0) scale(1.03)`;
      }
    };
    raf = requestAnimationFrame(loop);
    const onMove = (e: MouseEvent) => {
      mouse.current.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, [prm, N, TOTAL, introEndFrac, wins]);

  const goto = (i: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.offsetTop + (wins[i].hold + wins[i].holdLen / 2) * total, behavior: prm ? "auto" : "smooth" });
  };

  /* opacity of each scene: fades in (scene 0 with the slash, others during
     the previous transition) and out as its own cut begins */
  const sceneOp = (i: number) => {
    if (prm) return i === N - 1 ? 1 : 0;
    let op = 0;
    if (i === 0) op = seg(p, (INTRO * 0.8) / TOTAL, introEndAbs / TOTAL);
    else op = seg((p - wins[i - 1].trans) / wins[i - 1].transLen, 0.16, 0.62);
    if (i < N - 1) op *= 1 - seg((p - wins[i].trans) / wins[i].transLen, 0.45, 0.92);
    return clamp(op);
  };

  /* ── reduced motion: honest static poster ── */
  if (prm) {
    const s = stages[N - 1];
    return (
      <section className="relative h-screen overflow-hidden bg-[#161112]" aria-label="Luxe Hair Studio">
        <img src={s.image} alt={s.kicker} className="absolute inset-0 h-full w-full object-cover object-[50%_22%]" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(205deg, rgba(12,9,9,0.16) 38%, rgba(12,9,9,0.66) 100%)" }} />
        <div className="absolute inset-x-6 bottom-[14svh] sm:inset-x-12 lg:inset-x-[7%]">
          <p className="font-mono flex items-center gap-3 text-[11px] uppercase tracking-[0.3em]" style={{ color: s.accent }}>
            <span className="inline-block h-px w-10" style={{ background: s.accent }} />{s.kicker}
          </p>
          <h1 className="font-display mt-4 max-w-3xl text-[clamp(2.7rem,6.8vw,5.4rem)] font-semibold leading-[1.02] text-[#f7f1e7]">
            {s.line1} <em className="font-accenti font-normal" style={{ color: s.accent }}>{s.line2}</em>
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#f7f1e7]/78">{s.sub}</p>
          <button onClick={() => document.getElementById("booking")?.scrollIntoView()} data-cursor="hand" className="btn-sheen mt-7 rounded-full border border-gold/70 px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.24em] text-[#f7f1e7]">
            Book your transformation
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={wrapRef}
      className="relative"
      /* 26vh per timeline unit → at default pace (~1.5×) each scene ≈ 117vh
         total (≈82vh dwell + ≈35vh cut): a normal, unhurried scroll. */
      style={{ height: `${Math.max(320, Math.round(TOTAL * 26 * cfg.design.heroScrollSpeed))}vh` }}
      aria-label="Luxe transformation story — scroll to cut"
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-[#161112]">
        {/* ── scene stack (parallax target) ── */}
        <div ref={stackRef} className="absolute inset-0 will-change-transform">
          {stages.map((s, i) => {
            const op = sceneOp(i);
            const holdLocal = clamp((p - wins[i].hold) / wins[i].holdLen);
            const kb = 1.05 + holdLocal * 0.045; /* Ken Burns breathing */
            /* one diagonal light sweep per scene, mid-hold */
            const sweep = bell(holdLocal, 0.5, 0.16) * 0.16;
            return (
              <div key={s.kicker} className="absolute inset-0" style={{ opacity: op }} aria-hidden={i !== active}>
                <div className="absolute inset-0 will-change-transform" style={{ transform: `scale(${kb})` }}>
                  <img src={s.image} alt={i === active ? s.kicker : ""} loading={i < 2 ? "eager" : "lazy"} decoding="async" className="h-full w-full object-cover object-[50%_22%]" />
                </div>
                <div className="absolute inset-0" style={{ background: "linear-gradient(205deg, rgba(12,9,9,0.14) 38%, rgba(12,9,9,0.62) 100%)" }} />
                <div className="absolute inset-0 mix-blend-screen" style={{ opacity: sweep, background: "linear-gradient(115deg, transparent 32%, rgba(245,230,211,0.5) 50%, transparent 68%)", transform: `translateX(${(holdLocal - 0.5) * 60}%)` }} />
              </div>
            );
          })}
        </div>

        {/* ── ambient projector glow (idle life) ── */}
        <div ref={ambientRef} className="pointer-events-none absolute -inset-[18%] z-10 will-change-transform" aria-hidden="true"
          style={{ background: "radial-gradient(40% 32% at 30% 24%, rgba(201,176,55,0.10), transparent 70%), radial-gradient(34% 28% at 74% 76%, rgba(212,165,165,0.09), transparent 70%)" }} />

        {/* ── the cuts: shards + blade + sparks, one assembly per transition ── */}
        {stages.slice(0, -1).map((s, i) => {
          const local = clamp((p - wins[i].trans) / wins[i].transLen);
          if (local <= 0 || local >= 1) return null;
          const ignite = easeOutCubic(seg(local, 0, 0.18)); /* blade ignites from centre */
          const drift = easeOutCubic(seg(local, 0.08, 0.9));
          const topOp = seg(local, 0.06, 0.14) * (1 - seg(local, 0.55, 0.96)); /* left shard lingers */
          const botOp = seg(local, 0.06, 0.14) * (1 - seg(local, 0.5, 0.78)); /* right releases earlier */
          const glintT = seg(local, 0.05, 0.92);
          const pulse = bell(local, 0.3, 0.09);
          const dim = bell(local, 0.24, 0.1) * 0.3;
          const brightIn = seg(local, 0.2, 0.7);
          const nx = Math.sin((BLADE_DEG * Math.PI) / 180 + Math.PI / 2); /* blade normal */
          const ny = Math.cos((BLADE_DEG * Math.PI) / 2 + Math.PI / 2) * -1;
          const dx = drift * 11 * -nx;
          const dy = drift * 10 * -ny;
          return (
            <div key={`cut-${s.kicker}`} className="pointer-events-none absolute inset-0 z-[25]" aria-hidden="true">
              {/* incoming look brightens beneath the parting */}
              <div className="absolute inset-0 mix-blend-screen" style={{ opacity: brightIn * 0.22, background: "radial-gradient(90% 70% at 50% 42%, rgba(245,230,211,0.5), transparent 72%)" }} />
              {/* top shard — lingers long, melting off the left */}
              <div className="absolute inset-0 will-change-transform" style={{ opacity: topOp, transform: `translate3d(${-dx * 1.15}%, ${-dy * 1.05}%, 0) rotate(-0.9deg) scale(${1 + drift * 0.2})`, filter: "blur(6px)", WebkitMaskImage: MASK_TOP, maskImage: MASK_TOP }}>
                <img src={s.image} alt="" className="h-full w-full object-cover object-[50%_22%]" style={{ clipPath: POLY_TOP }} />
              </div>
              {/* bottom shard — releases sooner */}
              <div className="absolute inset-0 will-change-transform" style={{ opacity: botOp, transform: `translate3d(${dx}%, ${dy}%, 0) rotate(0.9deg) scale(${1 + drift * 0.2})`, filter: "blur(6px)", WebkitMaskImage: MASK_BOT, maskImage: MASK_BOT }}>
                <img src={s.image} alt="" className="h-full w-full object-cover object-[50%_22%]" style={{ clipPath: POLY_BOT }} />
              </div>
              {/* the blade — gold, igniting from the centre */}
              <div className="absolute left-1/2 top-1/2 w-[150%] origin-center" style={{ transform: `translate(-50%, -50%) rotate(${BLADE_DEG}deg) scaleX(${ignite})`, opacity: ignite * (1 - seg(local, 0.8, 0.98)) }}>
                <div className="h-[2px] w-full" style={{ background: "linear-gradient(90deg, transparent, #c9b037 30%, #f5e6d3 50%, #c9b037 70%, transparent)", boxShadow: "0 0 24px 4px rgba(201,176,55,0.55)" }} />
                {/* glint riding the parting */}
                <div className="absolute top-1/2 h-8 w-8 -translate-y-1/2 rounded-full" style={{ left: `${-8 + glintT * 116}%`, background: "radial-gradient(circle, rgba(245,230,211,0.95), rgba(201,176,55,0.5) 45%, transparent 70%)", filter: "blur(1px)", opacity: Math.sin(glintT * Math.PI) }} />
              </div>
              {/* shockwave at the moment of the cut */}
              <div className="absolute left-1/2 top-1/2 h-[80vmax] w-[80vmax] -translate-x-1/2 -translate-y-1/2 rounded-full border" style={{ opacity: pulse * 0.5, borderColor: "rgba(245,230,211,0.4)", transform: `translate(-50%,-50%) scale(${0.2 + pulse * 1.3})`, background: "radial-gradient(circle, rgba(245,230,211,0.10), rgba(201,176,55,0.07) 45%, transparent 66%)" }} />
              {/* sparks bursting along the blade */}
              {Array.from({ length: N_SPARKS }).map((_, j) => {
                const seed = i * 97 + j;
                const along = rnd(seed) * 100; /* start position along blade % */
                const life = bell(local, 0.28 + rnd(seed + 1) * 0.3, 0.14);
                const dist = easeOutCubic(seg(local, 0.1, 0.66)) * (26 + rnd(seed + 2) * 60);
                const lat = (rnd(seed + 3) - 0.5) * 44;
                const ang = ((BLADE_DEG + 90) * Math.PI) / 180;
                const ox = Math.cos(ang) * dist * (j % 2 === 0 ? 1 : -1) + Math.cos((BLADE_DEG * Math.PI) / 180) * lat;
                const oy = Math.sin(ang) * dist * (j % 2 === 0 ? 1 : -1) + Math.sin((BLADE_DEG * Math.PI) / 180) * lat;
                const bx = 50 + (along - 50) * Math.cos((BLADE_DEG * Math.PI) / 180) * 1.4;
                const by = 50 + (along - 50) * Math.sin((BLADE_DEG * Math.PI) / 180) * 1.4;
                return (
                  <span key={j} className="absolute h-[5px] w-[5px] rounded-full" style={{ left: `${bx}%`, top: `${by}%`, opacity: life * (0.55 + rnd(seed + 4) * 0.45), transform: `translate(${ox}px, ${oy}px)`, background: j % 3 === 0 ? "#f5e6d3" : "#c9b037", boxShadow: "0 0 10px 2px rgba(245,230,211,0.7)" }} />
                );
              })}
              {/* dim punch — the room dips, then recovers */}
              <div className="absolute inset-0 bg-[#0b0808]" style={{ opacity: dim }} />
            </div>
          );
        })}

        {/* ── title cards: one per cut, same bottom-left position ── */}
        <div className="absolute inset-x-6 bottom-[15svh] z-30 sm:inset-x-12 lg:inset-x-[7%]">
          {stages.map((s, i) => {
            /* card rises as the scene lands; exits as its cut begins */
            const inStart = i === 0 ? (INTRO + 0.1) / TOTAL : wins[i - 1].trans + wins[i - 1].transLen * 0.55;
            const inEnd = inStart + 0.045;
            const rise = seg(p, inStart, inEnd);
            const exit = i < N - 1 ? seg((p - wins[i].trans) / wins[i].transLen, 0, 0.3) : 0;
            const op = rise * (1 - exit);
            if (op <= 0.001 && p > inEnd) return null;
            const lineRise = (k: number) => seg(p, inStart + 0.012 + k * 0.02, inStart + 0.05 + k * 0.02);
            const subRise = seg(p, inStart + 0.05, inStart + 0.085);
            const hairline = seg(p, inStart, inStart + 0.04);
            const shine = bell(seg(p, inStart, inStart + 0.1), 0.6, 0.22);
            return (
              <div key={s.kicker} className="absolute inset-x-0 bottom-0" style={{ opacity: op, transform: `translateY(${(1 - rise) * 30 - exit * 26}px)` }} aria-hidden={op < 0.5}>
                <p className="font-mono flex items-center gap-3 text-[11px] uppercase tracking-[0.3em]" style={{ color: s.accent }}>
                  <span className="inline-block h-px w-10 origin-left" style={{ background: s.accent, transform: `scaleX(${hairline})` }} />
                  {sf(i, "kicker", s.kicker)}
                </p>
                <h1 className="font-display mt-4 max-w-3xl text-[clamp(2.7rem,6.8vw,5.4rem)] font-semibold leading-[1.02] text-[#f7f1e7]">
                  {[sf(i, "line1", s.line1), sf(i, "line2", s.line2)].map((ln, k) => {
                    const r = lineRise(k);
                    return (
                      <span key={k} className="block overflow-hidden pb-[0.08em]">
                        <span className="block will-change-transform" style={{ transform: `translateY(${(1 - r) * 112}%)`, filter: `blur(${(1 - r) * 7}px)` }}>
                          {k === 0 ? ln : <em className="font-accenti font-normal" style={{ color: s.accent }}>{ln}</em>}
                        </span>
                      </span>
                    );
                  })}
                  {/* gold shine sweeping the card as it lands */}
                  <span className="pointer-events-none absolute -inset-y-4 left-0 w-1/3 -skew-x-12 mix-blend-screen" style={{ opacity: shine, background: "linear-gradient(100deg, transparent 20%, rgba(245,230,211,0.4) 50%, transparent 80%)", transform: `translateX(${-140 + shine * 420}%) skewX(-12deg)` }} />
                </h1>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#f7f1e7]/78" style={{ opacity: subRise, transform: `translateY(${(1 - subRise) * 14}px)` }}>{sf(i, "sub", s.sub)}</p>
              </div>
            );
          })}
        </div>

        {/* ── CUT counter (top-right) ── */}
        <div className="absolute right-7 top-[11vh] z-30 hidden items-center gap-3 lg:flex" aria-hidden="true">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#f7f1e7]/50">Cut</span>
          <span className="font-display text-3xl font-semibold tabular-nums text-[#c9b037]">{String(active + 1).padStart(2, "0")}</span>
          <span className="font-mono text-[10px] tabular-nums tracking-[0.2em] text-[#f7f1e7]/40">/ {String(N).padStart(2, "0")}</span>
        </div>

        {/* ── CTAs rise on the final look ── */}
        <div className="absolute bottom-[15svh] right-6 z-30 hidden flex-col items-end gap-3 lg:flex" style={{ opacity: seg(p, 1 - (OUTRO + 0.5) / TOTAL, 1 - OUTRO / TOTAL), transform: `translateY(${(1 - seg(p, 1 - (OUTRO + 0.5) / TOTAL, 1 - OUTRO / TOTAL)) * 24}px)` }}>
          <div className="h-px w-16 origin-right bg-[#c9b037]" style={{ transform: `scaleX(${seg(p, 1 - (OUTRO + 0.5) / TOTAL, 1 - OUTRO / TOTAL)})` }} />
          <button onClick={() => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" })} data-cursor="hand" className="btn-sheen rounded-full border border-gold/70 px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.24em] text-[#f7f1e7]">{t("hero.cta", "Book your transformation")}</button>
          <button onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })} data-cursor="hand" className="link-draw font-accenti text-lg text-[#f7f1e7]/85">{t("hero.wander", "or wander the menu")}</button>
        </div>

        {/* ── titled progress rail ── */}
        <div className="absolute right-7 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-5 lg:flex" aria-hidden="true">
          <div className="relative h-[34vh] w-px bg-[#f7f1e7]/15">
            <div className="absolute inset-y-0 left-0 w-full origin-top bg-[#c9b037]" style={{ transform: `scaleY(${clamp((p - introEndFrac) / (1 - introEndFrac))})` }} />
            <div ref={shimmerRef} className="absolute top-0 h-8 w-[3px] -translate-x-1/3 rounded-full" style={{ background: "linear-gradient(180deg, transparent, #f5e6d3, transparent)", filter: "blur(0.5px)", opacity: 0 }} />
            {stages.map((s, i) => (
              <button key={s.kicker} onClick={() => goto(i)} data-cursor="hand" className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ top: `${(i / Math.max(1, N - 1)) * 100}%` }} aria-label={`Go to ${s.kicker}`}>
                <span className={`block h-[7px] w-[7px] rotate-45 border transition-all duration-300 ${i <= active ? "border-[#c9b037] bg-[#c9b037]" : "border-[#f7f1e7]/30 bg-transparent"}`} />
                <span className={`absolute right-5 top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[8.5px] uppercase tracking-[0.18em] transition-all duration-300 ${i === active ? "text-[#c9b037]" : "text-[#f7f1e7]/40"}`}>{s.kicker}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── projector intro: wordmark over the dark before the slash ── */}
        <div className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center" style={{ opacity: 1 - seg(p, (INTRO * 0.7) / TOTAL, introEndAbs / TOTAL) }} aria-hidden="true">
          <p className="font-display text-[clamp(3rem,9vw,6.5rem)] font-semibold tracking-[0.28em] text-[#f7f1e7]" style={{ textIndent: "0.28em", opacity: seg(p, 0.005, (INTRO * 0.3) / TOTAL), transform: `translateY(${(1 - seg(p, 0.005, (INTRO * 0.35) / TOTAL)) * 26}px)`, filter: `blur(${(1 - seg(p, 0.005, (INTRO * 0.35) / TOTAL)) * 8}px)` }}>
            {cfg.salon.word}
          </p>
          <p className="font-mono mt-3 text-[10px] uppercase tracking-[0.5em] text-[#c9b037]" style={{ textIndent: "0.5em", opacity: seg(p, (INTRO * 0.2) / TOTAL, (INTRO * 0.45) / TOTAL) }}>
            {cfg.salon.sub}
          </p>
          {/* the drawing blade */}
          <div className="mt-10 w-[42vw] max-w-[440px] origin-center" style={{ transform: `rotate(${BLADE_DEG}deg) scaleX(${easeOutCubic(seg(p, 0.004, (INTRO * 0.5) / TOTAL))})` }}>
            <div className="h-[2px] w-full" style={{ background: "linear-gradient(90deg, transparent, #c9b037 30%, #f5e6d3 50%, #c9b037 70%, transparent)", boxShadow: "0 0 26px 5px rgba(201,176,55,0.6)" }} />
          </div>
        </div>

        {/* ── film grain + vignette + letterbox ── */}
        {cfg.design.grain && <div className="luxe-cine-grain pointer-events-none absolute inset-0 z-[45]" aria-hidden="true" />}
        <div className="pointer-events-none absolute inset-0 z-[45]" style={{ background: "radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(8,6,6,0.5) 100%)" }} aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[50] origin-top bg-[#0b0808]" style={{ height: "7vh", transform: `scaleY(${1 + bell((p * TOTAL - INTRO) % (HOLD + TRANS), HOLD + TRANS / 2, 0.5) * 0.2})` }} aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[50] origin-bottom bg-[#0b0808]" style={{ height: "7vh", transform: `scaleY(${1 + bell((p * TOTAL - INTRO) % (HOLD + TRANS), HOLD + TRANS / 2, 0.5) * 0.2})` }} aria-hidden="true" />

        {/* ── scroll hint (real-scroll keyed, breathes while idle) ── */}
        <div className="pointer-events-none absolute bottom-[10svh] left-1/2 z-[55] -translate-x-1/2" style={{ opacity: 1 - seg(p, introEndFrac + 0.005, introEndFrac + 0.05) }} aria-hidden="true">
          <div className="animate-pulse flex flex-col items-center gap-2 text-[#f7f1e7]/55">
            <span className="font-mono text-[9px] uppercase tracking-[0.34em]">scroll to cut</span>
            <svg viewBox="0 0 20 34" className="h-7 w-4" fill="none"><path d="M4 6 L16 20 M16 6 L4 20" stroke="#c9b037" strokeWidth="1.2" strokeLinecap="round" /><path d="M6 26 L10 31 L14 26" stroke="#f5e6d3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
      </div>
    </section>
  );
}

export type { Stage };
