import { useRef, useState } from "react";
import { useConfig, type GalleryItem } from "../lib/config";
import { clamp } from "../lib/hooks";
import { Ic, Reveal, SectionHead } from "./Ornaments";

function BeforeAfter({ item }: { item: GalleryItem }) {
  const [pos, setPos] = useState(58);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const set = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(clamp(((clientX - r.left) / r.width) * 100, 4, 96));
  };
  return (
    <div ref={ref} className="group relative aspect-[4/5] touch-none select-none overflow-hidden" data-cursor="brush"
      onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); set(e.clientX); }}
      onPointerMove={(e) => dragging.current && set(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}>
      <img src={item.image} alt={`${item.title} — after`} draggable={false} loading="lazy" decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-[1.6s] ease-out group-hover:scale-[1.04]" style={{ filter: "saturate(1.14) contrast(1.06)" }} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={item.image} alt={`${item.title} — before`} draggable={false} loading="lazy" decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-top" style={{ filter: "saturate(0.42) contrast(0.86) brightness(0.88) sepia(0.14)" }} />
        <span className="absolute inset-0 bg-[rgba(58,46,47,0.06)]" />
      </div>
      <div className="absolute inset-y-0" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 -left-px w-[2px] bg-gradient-to-b from-transparent via-gold to-transparent shadow-[0_0_16px_rgba(201,176,55,0.85)]" />
        <button aria-label={`Drag to compare ${item.title}`}
          onKeyDown={(e) => { if (e.key === "ArrowLeft") setPos((v) => clamp(v - 4, 4, 96)); if (e.key === "ArrowRight") setPos((v) => clamp(v + 4, 4, 96)); }}
          className="absolute top-1/2 left-0 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold/70 bg-surface/90 text-rosedeep shadow-[var(--glow-rose)] backdrop-blur-sm transition-transform hover:scale-110">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 7l-5 5 5 5M15 7l5 5-5 5" /></svg>
        </button>
      </div>
      <span className="font-mono absolute left-3 top-3 rounded-full border border-linec bg-surface/80 px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-inksoft backdrop-blur-sm">Before</span>
      <span className="font-mono absolute right-3 top-3 rounded-full border border-gold/50 bg-surface/80 px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-gold backdrop-blur-sm">After</span>
    </div>
  );
}

export default function Gallery() {
  const cfg = useConfig();
  const head = cfg.headings.transformations;
  const [filter, setFilter] = useState("all");
  const kinds = ["all", "colour", "cut", "bridal"];
  const shown = cfg.gallery.filter((g) => filter === "all" || g.kind === filter);
  return (
    <section id="transformations" className="relative bg-base py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHead eyebrow="Transformations" title={head.title} italic={head.italic} desc={head.desc} tr="transformations" />
          <Reveal delay={150} className="flex flex-wrap gap-2">
            {kinds.map((k) => (
              <button key={k} onClick={() => setFilter(k)} data-cursor="hand"
                className={`rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-all ${filter === k ? "border-gold/70 bg-gold-soft text-ink" : "border-linec text-inksoft hover:border-gold/50 hover:text-ink"}`}>{k}</button>
            ))}
          </Reveal>
        </div>
        <div className="mt-14 columns-1 gap-6 sm:columns-2 lg:columns-3">
          {shown.map((g, i) => (
            <Reveal key={g.id} delay={(i % 3) * 110} className="mb-6 break-inside-avoid">
              <article className="group overflow-hidden rounded-[2.2rem_2.2rem_1.4rem_1.4rem] border border-linec bg-surface shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)]">
                <BeforeAfter item={g} />
                <div className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-xl font-medium text-ink">{g.title}</h3>
                    <span className="font-mono shrink-0 rounded-full border border-rose/40 px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-rosedeep">{g.kind}</span>
                  </div>
                  <p className="font-mono mt-1 text-[10px] uppercase tracking-[0.2em] text-inkfaint">by {g.stylist}</p>
                  <blockquote className="font-accenti mt-3 text-[16px] leading-snug text-inksoft">“{g.quote}”</blockquote>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-14 flex flex-col items-center gap-3">
          <p className="font-accenti text-xl text-inksoft">Your before is just an appointment away.</p>
          <button onClick={() => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" })} data-cursor="hand"
            className="btn-sheen flex items-center gap-3 rounded-full border border-rosedeep/60 px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.24em] text-ink">
            Start my transformation <Ic.ArrowRight className="h-4 w-4" />
          </button>
        </Reveal>
      </div>
    </section>
  );
}
