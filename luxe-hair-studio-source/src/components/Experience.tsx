import { useEffect, useState } from "react";
import { useConfig } from "../lib/config";
import { IMG } from "../lib/images";
import { Ic, Reveal, SectionHead, toast } from "./Ornaments";

const AMENITIES = [
  { ic: Ic.Coffee, t: "Coffee & tea cart", d: "Single-origin espresso, jasmine pearls, oat anything." },
  { ic: Ic.Flower, t: "Fresh flowers, weekly", d: "The peonies arrive every Tuesday. It's a whole event." },
  { ic: Ic.Drop, t: "Head massage rituals", d: "Warm oil and ten minutes that erase the week." },
  { ic: Ic.Gem, t: "Quiet alcove chairs", d: "Two chairs behind the arch, for introverts and naps." },
];

export function MarqueeRibbon() {
  const words = ["Precision Cuts", "Balayage & Colour", "Bridal Artistry", "Scalp Rituals", "Editorial Styling", "Liquid Shine", "The Quiet Luxury"];
  const row = (
    <div className="flex shrink-0 items-center">
      {words.map((w) => (
        <span key={w} className="flex items-center">
          <span className="font-accenti px-6 text-2xl tracking-wide text-surface">{w}</span>
          <Ic.Sparkle className="h-3 w-3 text-gold" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="relative -mt-10 -rotate-[1.2deg] overflow-hidden bg-rosedeep py-[18px] shadow-[0_18px_50px_-20px_rgba(166,123,123,0.6)]" style={{ width: "104%", marginLeft: "-2%" }}>
      <div className="marquee-track">{row}{row}</div>
    </div>
  );
}

export default function Experience() {
  const cfg = useConfig();
  const head = cfg.headings.experience;
  const [tIdx, setTIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTIdx((i) => (i + 1) % cfg.testimonials.length), 5200);
    return () => clearInterval(t);
  }, [cfg.testimonials.length]);
  const t = cfg.testimonials[tIdx];

  return (
    <section id="experience" className="relative bg-basesoft pt-24 sm:pt-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal dir="left" className="relative">
            <div className="shape-blob-a overflow-hidden shadow-[var(--shadow-lift)]">
              <img src={IMG.salon} alt="Inside the Luxe atelier" loading="lazy" decoding="async" className="anim-breathe h-[420px] w-full object-cover sm:h-[500px]" />
            </div>
          </Reveal>
          <div>
            <SectionHead eyebrow="The Sensory Salon" title={head.title} italic={head.italic} desc={head.desc} tr="experience" />
            <Reveal delay={140} className="mt-9">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-inkfaint">Today in the air</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Lavender", "Jasmine", "Warm vanilla", "Bergamot", "Fresh linen"].map((s) => (
                  <span key={s} className="rounded-full border border-sage/50 bg-sage/15 px-4 py-1.5 text-[12.5px] text-ink">{s}</span>
                ))}
              </div>
            </Reveal>
            <Reveal delay={220} className="mt-9 grid grid-cols-2 gap-x-6 gap-y-5">
              {AMENITIES.map((a) => (
                <div key={a.t} className="group">
                  <span className="text-rosedeep transition-colors group-hover:text-gold"><a.ic className="h-6 w-6" /></span>
                  <p className="font-display mt-2 text-[17px] leading-tight text-ink">{a.t}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-inksoft">{a.d}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </div>

        {/* testimonials */}
        <div className="mt-28">
          <Reveal>
            <div className="relative overflow-hidden rounded-[3rem_3rem_3rem_1rem] border border-rose/30 bg-surface px-6 py-14 shadow-[var(--shadow-lift)] sm:px-16 lg:px-28 lg:py-16"
              onMouseEnter={() => setTIdx(tIdx)} >
              <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gold-soft blur-3xl" />
              <div key={tIdx} className="phase-swap relative mx-auto max-w-3xl text-center">
                <div className="flex justify-center gap-1 text-gold">
                  {Array.from({ length: t.stars }).map((_, i) => (<Ic.Star key={i} className="h-4 w-4" />))}
                </div>
                <blockquote className="font-accenti mt-6 text-2xl leading-snug text-ink sm:text-[28px]">“{t.quote}”</blockquote>
                <p className="font-mono mt-7 text-[10px] uppercase tracking-[0.26em] text-inksoft">{t.name} · {t.service}</p>
              </div>
              <div className="relative mt-9 flex items-center justify-center gap-2">
                {cfg.testimonials.map((_, i) => (
                  <button key={i} onClick={() => setTIdx(i)} aria-label={`Testimonial ${i + 1}`} data-cursor="hand"
                    className={`h-1.5 rounded-full transition-all duration-500 ${i === tIdx ? "w-7 bg-gold" : "w-1.5 bg-linec hover:bg-inkfaint"}`} />
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* apothecary */}
        <div className="mt-28 pb-24">
          <SectionHead eyebrow="The Apothecary" title="Take the ritual" italic="home with you" desc="Salon-exclusive formulas, mixed in small batches." />
          <div className="mt-12 grid grid-cols-2 gap-5 lg:grid-cols-3">
            {cfg.products.map((p, i) => (
              <Reveal key={p.name} delay={i * 100}>
                <article className="group flex flex-col items-center rounded-[2rem_2rem_0.6rem_2rem] border border-linec bg-surface px-5 pb-6 pt-9 text-center shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-[var(--shadow-lift)]">
                  <Ic.Drop className="h-12 w-12 text-rosedeep transition-colors group-hover:text-gold" />
                  <h3 className="font-display mt-4 text-xl font-medium text-ink">{p.name}</h3>
                  <p className="font-mono mt-0.5 text-[9px] uppercase tracking-[0.18em] text-inkfaint">{p.kind}</p>
                  <p className="mt-2 min-h-[54px] text-[12.5px] leading-relaxed text-inksoft">{p.desc}</p>
                  <div className="mt-4 flex w-full items-center justify-between">
                    <span className="font-display text-2xl text-rosedeep">£{p.price}</span>
                    <button onClick={() => toast(`${p.name} will be waiting at your chair`)} data-cursor="hand"
                      className="btn-sheen rounded-full border border-rosedeep/60 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-ink">Add to visit</button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
