import { useEffect, useRef, useState } from "react";
import { useConfig } from "../lib/config";
import { useFinePointer, usePrefersReducedMotion, lerp } from "../lib/hooks";
import { useI18n } from "../lib/i18n";
import { Ic, toast } from "./Ornaments";

/* ── Preloader — strand-weaver braid ── */
export function Preloader({ onDone }: { onDone: () => void }) {
  const prm = usePrefersReducedMotion();
  const cfg = useConfig();
  const [pct, setPct] = useState(0);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const MIN = prm ? 400 : 1800;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / MIN);
      setPct(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else { setLeaving(true); setTimeout(onDone, prm ? 150 : 500); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone, prm]);
  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-base transition-all duration-700 ${leaving ? "pointer-events-none opacity-0" : "opacity-100"}`} aria-label="Luxe is preparing your visit">
      <svg viewBox="0 0 200 260" className="h-44 w-auto" aria-hidden="true">
        {[
          { d: "M100 10 C 145 60, 55 100, 100 150 C 145 200, 55 235, 100 250", c: "var(--rose-deep)", delay: "0s", w: 2 },
          { d: "M100 10 C 55 60, 145 100, 100 150 C 55 200, 145 235, 100 250", c: "var(--gold)", delay: "0.25s", w: 1.6 },
          { d: "M100 10 C 122 60, 78 100, 100 150 C 122 200, 78 235, 100 250", c: "var(--ink-faint)", delay: "0.5s", w: 1.1 },
        ].map((s, i) => (
          <path key={i} d={s.d} fill="none" stroke={s.c} strokeWidth={s.w} strokeLinecap="round" pathLength={1} strokeDasharray={1}
            style={prm ? undefined : { animation: `lux-draw 1.4s cubic-bezier(0.65,0,0.35,1) ${s.delay} both` }} />
        ))}
      </svg>
      <p className="font-display mt-6 text-4xl font-semibold tracking-[0.32em] text-ink" style={{ textIndent: "0.32em" }}>{cfg.salon.word}</p>
      <p className="font-mono mt-2 text-[10px] uppercase tracking-[0.5em] text-inksoft" style={{ textIndent: "0.5em" }}>{cfg.salon.sub}</p>
      <div className="mt-8 h-px w-28 overflow-hidden bg-linesoft"><div className="h-full bg-gold transition-[width] duration-200" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

/* ── Custom cursor — dot + trailing halo, morphs on interactive ── */
export function Cursor() {
  const cfg = useConfig();
  const fine = useFinePointer();
  const prm = usePrefersReducedMotion();
  const dot = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLDivElement>(null);
  const [variant, setVariant] = useState<"default" | "hand" | "scissors">("default");
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!fine || prm || !cfg.design.cursor) return;
    document.documentElement.classList.add("luxe-cursor");
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const hp = { x: pos.x, y: pos.y };
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX; pos.y = e.clientY; setVisible(true);
      const t = e.target as HTMLElement | null;
      const cv = t?.closest?.("[data-cursor]") as HTMLElement | null;
      setVariant(cv?.dataset.cursor === "scissors" ? "scissors" : cv || t?.closest?.("a,button") ? "hand" : "default");
    };
    const loop = () => {
      hp.x = lerp(hp.x, pos.x, 0.18); hp.y = lerp(hp.y, pos.y, 0.18);
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px,${pos.y}px,0) translate(-50%,-50%)`;
      if (halo.current) halo.current.style.transform = `translate3d(${hp.x}px,${hp.y}px,0) translate(-50%,-50%) scale(${variant === "default" ? 1 : 1.5})`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    addEventListener("mousemove", onMove, { passive: true });
    const onLeave = () => setVisible(false);
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("luxe-cursor");
      removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [fine, prm, cfg.design.cursor]);
  if (!fine || prm || !cfg.design.cursor) return null;
  return (
    <>
      <div ref={halo} aria-hidden="true" className={`pointer-events-none fixed left-0 top-0 z-[97] h-10 w-10 rounded-full border border-rosedeep/60 transition-[opacity,transform] duration-200 ${visible ? "opacity-100" : "opacity-0"}`} style={{ boxShadow: "0 0 18px -4px rgba(212,165,165,0.6)" }} />
      <div ref={dot} aria-hidden="true" className={`pointer-events-none fixed left-0 top-0 z-[98] flex items-center justify-center transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}>
        {variant === "scissors" ? <Ic.Scissors className="h-4 w-4 text-rosedeep" /> : <span className="block h-1.5 w-1.5 rounded-full bg-rosedeep" />}
      </div>
    </>
  );
}

/* ── Concierge chatbot — auto-opens once, answers FAQs ── */
const FAQS: { match: RegExp; a: string }[] = [
  { match: /price|cost|how much/i, a: "Cuts from £78, balayage from £180, treatments from £70. Every visit opens with a free consultation." },
  { match: /hour|open|when/i, a: "Tue–Fri 09:00–19:00, Sat 08:00–18:00, Sun 10:00–16:00. We rest on Mondays." },
  { match: /book|appointment|chair/i, a: "Scroll to Booking and reserve in four small steps — or I can take you there now." },
  { match: /stylist|who/i, a: "Amara (texture), Sofia (colour), Elena (editorial/bridal). The Matchmaker quiz finds your fit in five questions." },
  { match: /bridal|wedding/i, a: "We do trials, day-of styling and party hair. Book the Bridal Suite package for the full calm morning." },
];

/* ── Floating dock (right edge) — booking + concierge + back-to-top ──
   A single vertical dock so the two most-used actions live together. */
export function FloatingDock() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [msgs, setMsgs] = useState<{ from: "bot" | "you"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 400);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (seen) return;
    const t1 = setTimeout(() => { setOpen(true); setSeen(true); setMsgs([{ from: "bot", text: t("concierge.greeting", "Good day — I'm the Luxe concierge. Prices, hours, stylists, bookings: ask away.") }]); }, 3500);
    const t2 = setTimeout(() => { setSeen((s) => { if (s) setOpen(false); return s; }); }, 8000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen]);

  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [msgs, typing, open]);

  const send = (text: string) => {
    if (!text.trim() || typing) return;
    setMsgs((m) => [...m, { from: "you", text }]);
    setInput(""); setTyping(true);
    setTimeout(() => {
      const hit = FAQS.find((f) => f.match.test(text));
      setMsgs((m) => [...m, { from: "bot", text: hit?.a ?? "I'll fetch a human for that one — meanwhile, the Booking section has live availability." }]);
      setTyping(false);
    }, 700);
  };

  const goBooking = () => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="phase-swap flex w-[min(86vw,340px)] flex-col overflow-hidden rounded-[1.6rem_1.6rem_0.5rem_1.6rem] border border-linec bg-surface shadow-[var(--shadow-lift)]" style={{ height: 420 }}>
          <div className="flex items-center justify-between border-b border-linesoft px-4 py-3">
            <p className="font-display text-lg text-ink">{t("concierge.title", "The Concierge")}</p>
            <button onClick={() => setOpen(false)} data-cursor="hand" aria-label="Close chat" className="flex h-8 w-8 items-center justify-center rounded-full border border-linec text-inksoft"><Ic.X className="h-3.5 w-3.5" /></button>
          </div>
          <div ref={listRef} className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {msgs.map((m, i) => (
              <p key={i} className={`max-w-[88%] rounded-[1.2rem_1.2rem_1.2rem_0.3rem] px-3.5 py-2.5 text-[13px] leading-relaxed ${m.from === "you" ? "ml-auto rounded-[1.2rem_1.2rem_0.3rem_1.2rem] bg-rosedeep text-surface" : "border border-linesoft bg-base/70 text-ink"}`}>{m.text}</p>
            ))}
            {typing && <p className="w-fit rounded-[1.2rem_1.2rem_1.2rem_0.3rem] border border-linesoft bg-base/70 px-3.5 py-2.5 text-[13px] text-inkfaint">typing…</p>}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 border-t border-linesoft px-3 py-2.5">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("concierge.placeholder", "Ask the concierge…")} aria-label={t("concierge.title", "Message the concierge")}
              className="w-full rounded-full border border-linec bg-base/60 px-4 py-2 text-[13px] text-ink outline-none placeholder:text-inkfaint focus:border-gold/60" />
            <button type="submit" data-cursor="hand" aria-label="Send" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rosedeep text-surface transition-transform hover:scale-110"><Ic.ArrowRight className="h-4 w-4" /></button>
          </form>
        </div>
      )}

      {/* the dock pill: booking (prominent) → concierge → back-to-top */}
      <div className="flex flex-col items-center gap-2.5 rounded-full border border-linec bg-surface/90 p-2.5 shadow-[var(--shadow-lift)] backdrop-blur-md">
        <button onClick={goBooking} data-cursor="hand" aria-label={t("dock.bookNow", "Book now")} title={t("dock.bookNow", "Book now")}
          className="btn-sheen flex h-12 w-12 items-center justify-center rounded-full border border-gold/70 bg-gold text-[#2b1f1f] transition-all hover:-translate-y-0.5">
          <Ic.Clock className="h-5 w-5" />
        </button>
        <button onClick={() => { setOpen((o) => !o); setSeen(true); }} data-cursor="hand" aria-label={t("dock.concierge", "Concierge")} title={t("dock.concierge", "Concierge")}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-rosedeep/50 text-rosedeep transition-all hover:-translate-y-0.5">
          <Ic.Sparkle className="h-5 w-5" />
        </button>
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} data-cursor="hand" aria-label={t("dock.backTop", "Back to top")} title={t("dock.backTop", "Back to top")}
          className={`flex h-11 w-11 items-center justify-center rounded-full border border-linec text-inksoft transition-all hover:-translate-y-0.5 ${scrolled ? "opacity-100" : "pointer-events-none opacity-0"}`}>
          <Ic.ArrowUp className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
