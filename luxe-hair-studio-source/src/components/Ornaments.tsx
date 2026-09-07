import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { useI18n } from "../lib/i18n";

/* ── hand-drawn icon set ── */
type IconProps = { className?: string; style?: CSSProperties };
const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;
export const Ic = {
  Scissors: ({ className, style }: IconProps) => (<svg viewBox="0 0 24 24" className={className} style={style} {...S}><circle cx="6" cy="6.5" r="2.6" /><circle cx="6" cy="17.5" r="2.6" /><path d="M8.3 8.2 20.5 17M8.3 15.8 20.5 7M13.6 12.1l1.6 1.1" /></svg>),
  Brush: ({ className, style }: IconProps) => (<svg viewBox="0 0 24 24" className={className} style={style} {...S}><rect x="7" y="2.8" width="10" height="9.5" rx="5" /><path d="M12 12.3v6.2M9.4 5.4v3M12 4.6v3.8M14.6 5.4v3M12 18.5c-1.3 0-2.3 1-2.3 2.3h4.6c0-1.3-1-2.3-2.3-2.3z" /></svg>),
  Sparkle: ({ className, style }: IconProps) => (<svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" stroke="none"><path d="M12 2.5c.7 4.4 2.6 6.3 7 7-4.4.7-6.3 2.6-7 7-.7-4.4-2.6-6.3-7-7 4.4-.7 6.3-2.6 7-7zM19 15l.6 2.4L22 18l-2.4.6L19 21l-.6-2.4L16 18l2.4-.6L19 15z" /></svg>),
  Sun: ({ className, style }: IconProps) => (<svg viewBox="0 0 24 24" className={className} style={style} {...S}><circle cx="12" cy="12" r="4.2" /><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7" /></svg>),
  Moon: ({ className, style }: IconProps) => (<svg viewBox="0 0 24 24" className={className} style={style} {...S}><path d="M20 13.6A8.4 8.4 0 0 1 10.4 4a8.4 8.4 0 1 0 9.6 9.6z" /></svg>),
  ArrowUp: ({ className, style }: IconProps) => (<svg viewBox="0 0 24 24" className={className} style={style} {...S}><path d="M12 19V5M6 11l6-6 6 6" /></svg>),
  ArrowRight: ({ className, style }: IconProps) => (<svg viewBox="0 0 24 24" className={className} style={style} {...S}><path d="M4.5 12h15M13.5 6l6 6-6 6" /></svg>),
  Star: ({ className, style }: IconProps) => (<svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" stroke="none"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9L12 2.6z" /></svg>),
  Drop: ({ className, style }: IconProps) => (<svg viewBox="0 0 24 24" className={className} style={style} {...S}><path d="M12 3.2s6.4 6.8 6.4 11a6.4 6.4 0 1 1-12.8 0c0-4.2 6.4-11 6.4-11z" /><path d="M9.2 14.2a2.9 2.9 0 0 0 2 2.7" /></svg>),
  Gem: ({ className, style }: IconProps) => (<svg viewBox="0 0 24 24" className={className} style={style} {...S}><path d="M7 4h10l4 5.5L12 21 3 9.5 7 4zM3 9.5h18M9.5 9.5 12 21l2.5-11.5M7 4l2.5 5.5L12 4l2.5 5.5L17 4" /></svg>),
  Flower: ({ className, style }: IconProps) => (<svg viewBox="0 0 24 24" className={className} style={style} {...S}><circle cx="12" cy="12" r="2.6" /><path d="M12 9.4c-2.8 0-3.6-5.4 0-5.4s2.8 5.4 0 5.4zM12 14.6c2.8 0 3.6 5.4 0 5.4s-2.8-5.4 0-5.4zM9.4 12c0-2.8-5.4-3.6-5.4 0s5.4 2.8 5.4 0zM14.6 12c0 2.8 5.4 3.6 5.4 0s-5.4-2.8-5.4 0z" /></svg>),
  Coffee: ({ className, style }: IconProps) => (<svg viewBox="0 0 24 24" className={className} style={style} {...S}><path d="M4 9.5h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5v-6zM16 10.5h1.6a2.7 2.7 0 0 1 0 5.4H16M7.5 3.5c-.8 1 .8 1.7 0 2.8M11.5 3.5c-.8 1 .8 1.7 0 2.8" /></svg>),
  Clock: ({ className, style }: IconProps) => (<svg viewBox="0 0 24 24" className={className} style={style} {...S}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>),
  MapPin: ({ className, style }: IconProps) => (<svg viewBox="0 0 24 24" className={className} style={style} {...S}><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.6" /></svg>),
  Phone: ({ className, style }: IconProps) => (<svg viewBox="0 0 24 24" className={className} style={style} {...S}><path d="M5.5 3.5h3l1.5 4.5-2 1.5a12 12 0 0 0 6.5 6.5l1.5-2 4.5 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3.5 5.7a2 2 0 0 1 2-2.2z" /></svg>),
  Mail: ({ className, style }: IconProps) => (<svg viewBox="0 0 24 24" className={className} style={style} {...S}><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="m4 7.5 8 6 8-6" /></svg>),
  Check: ({ className, style }: IconProps) => (<svg viewBox="0 0 24 24" className={className} style={style} {...S}><path d="m4.5 12.5 5 5L19.5 7" /></svg>),
  Menu: ({ className, style }: IconProps) => (<svg viewBox="0 0 24 24" className={className} style={style} {...S}><path d="M3.5 9h17M7 15h13.5" /></svg>),
  X: ({ className, style }: IconProps) => (<svg viewBox="0 0 24 24" className={className} style={style} {...S}><path d="m6 6 12 12M18 6 6 18" /></svg>),
  Camera: ({ className, style }: IconProps) => (<svg viewBox="0 0 24 24" className={className} style={style} {...S}><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2L9 4.8h6L16.5 7h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9z" /><circle cx="12" cy="12.8" r="3.4" /></svg>),
  Heart: ({ className, style }: IconProps) => (<svg viewBox="0 0 24 24" className={className} style={style} {...S}><path d="M12 20s-8-5-8-10.5A4.5 4.5 0 0 1 12 6.7a4.5 4.5 0 0 1 8 2.8C20 15 12 20 12 20z" /></svg>),
  Hand: ({ className, style }: IconProps) => (<svg viewBox="0 0 24 24" className={className} style={style} {...S}><path d="M9 11.5V5a1.5 1.5 0 0 1 3 0v5.5m0-6.8a1.5 1.5 0 0 1 3 0V11m0-5a1.5 1.5 0 0 1 3 0v7.5c0 4.1-2.7 7-6.5 7S5.6 18 5.4 15l-1.2-3.6a1.4 1.4 0 0 1 2.5-1.2L8 12.5" /></svg>),
  Sliders: ({ className, style }: IconProps) => (<svg viewBox="0 0 24 24" className={className} style={style} {...S}><path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h13M19.5 17h.5" /><circle cx="15" cy="7" r="1.8" /><circle cx="9" cy="12" r="1.8" /><circle cx="17.5" cy="17" r="1.8" /></svg>),
};

/* ── scroll reveal ── */
export function Reveal({ children, className = "", delay = 0, dir }: { children: ReactNode; className?: string; delay?: number; dir?: "left" | "right" | "scale" }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${dir ? `rv-${dir}` : ""} ${className}`} style={{ "--rd": `${delay}ms` } as CSSProperties}>{children}</div>;
}

/* ── section furniture ── */
export function Eyebrow({ children, tone = "var(--rose-deep)" }: { children: ReactNode; tone?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="hairline w-10 shrink-0" style={{ background: `linear-gradient(90deg, transparent, ${tone})` }} />
      <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-inksoft">{children}</span>
    </div>
  );
}

export function SectionHead({ eyebrow, title, italic, desc, center, tr }: { eyebrow: string; title: string; italic?: string; desc?: string; center?: boolean; tr?: string }) {
  const { t } = useI18n();
  const ey = tr ? t(`head.${tr}.eyebrow`, eyebrow) : eyebrow;
  const ti = tr ? t(`head.${tr}.title`, title) : title;
  const it = italic ? (tr ? t(`head.${tr}.italic`, italic) : italic) : undefined;
  const de = tr ? t(`head.${tr}.desc`, desc ?? "") : desc;
  return (
    <Reveal className={center ? "flex flex-col items-center text-center" : ""}>
      <Eyebrow>{ey}</Eyebrow>
      <h2 className="font-display mt-4 text-4xl font-medium leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
        {ti} {it && <em className="font-accenti font-normal text-rosedeep">{it}</em>}
      </h2>
      {de && <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-inksoft">{de}</p>}
    </Reveal>
  );
}

export function Wave({ fill = "var(--bg-soft)", flip = false, className = "" }: { fill?: string; flip?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 1440 110" preserveAspectRatio="none" aria-hidden="true" className={`block h-[52px] w-full sm:h-[80px] ${className}`} style={flip ? { transform: "scaleY(-1)" } : undefined}>
      <path d="M0,62 C200,108 380,14 620,44 C860,74 1080,108 1250,62 C1340,38 1400,42 1440,54 L1440,110 L0,110 Z" fill={fill} />
    </svg>
  );
}

export function HairPart({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center ${className}`} aria-hidden="true">
      <div className="hairline flex-1" />
      <svg viewBox="0 0 12 12" className="mx-3 h-2.5 w-2.5 text-gold"><path d="M6 0 12 6 6 12 0 6Z" fill="currentColor" /></svg>
      <div className="hairline w-16" />
    </div>
  );
}

/* ── toast ── */
let pushToast: ((msg: string) => void) | null = null;
export function toast(msg: string) { pushToast?.(msg); }
export function ToastHost() {
  const [items, setItems] = useState<{ id: number; msg: string }[]>([]);
  useEffect(() => {
    pushToast = (msg) => {
      const id = Date.now() + Math.random();
      setItems((cur) => [...cur, { id, msg }]);
      setTimeout(() => setItems((cur) => cur.filter((x) => x.id !== id)), 3400);
    };
    return () => { pushToast = null; };
  }, []);
  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-[95] flex -translate-x-1/2 flex-col items-center gap-2">
      {items.map((t) => (
        <div key={t.id} className="glass phase-swap flex items-center gap-2.5 rounded-full border border-gold/40 px-5 py-2.5 text-[13px] font-medium text-ink shadow-[var(--shadow-card)]">
          <Ic.Sparkle className="h-3.5 w-3.5 text-gold" />{t.msg}
        </div>
      ))}
    </div>
  );
}

/* ── ambient strand backdrop ── */
export function StrandBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <svg className="anim-drift absolute -left-24 top-[8%] h-[70vh] w-[40vw] opacity-[0.16] text-rosedeep" viewBox="0 0 400 700" fill="none">
        <path d="M40 0 C 200 140, 40 260, 180 400 C 320 540, 120 620, 200 700" stroke="currentColor" strokeWidth="1.2" />
        <path d="M90 0 C 250 160, 90 300, 230 440 C 360 570, 170 640, 250 700" stroke="currentColor" strokeWidth="0.7" opacity="0.7" />
      </svg>
      <svg className="anim-drift absolute -right-28 top-[38%] h-[75vh] w-[42vw] opacity-[0.13] text-gold" style={{ animationDuration: "30s", animationDelay: "-8s" }} viewBox="0 0 400 700" fill="none">
        <path d="M360 0 C 180 160, 340 300, 200 440 C 80 570, 280 630, 200 700" stroke="currentColor" strokeWidth="1.1" />
      </svg>
    </div>
  );
}
