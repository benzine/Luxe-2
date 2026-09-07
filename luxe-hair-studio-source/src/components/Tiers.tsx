import { useConfig } from "../lib/config";
import { Reveal, SectionHead } from "./Ornaments";

export default function Tiers() {
  const cfg = useConfig();
  const head = cfg.headings.services;

  return (
    <section id="tiers" className="relative bg-base py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead center eyebrow="Our Stylists" title={head.title} italic={head.italic} desc={head.desc} tr="tiers" />

        <Reveal className="mt-14 grid gap-6 lg:grid-cols-3">
          {cfg.tiers.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 100}>
              <article className="group relative flex h-full flex-col rounded-[2rem_2rem_1rem_2rem] border border-linec bg-surface p-8 transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[var(--shadow-lift)]">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-medium text-ink">{tier.name}</h3>
                  {i === 1 && (
                    <span className="rounded-full border border-gold/50 bg-gold-soft px-3 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-gold">
                      Most popular
                    </span>
                  )}
                </div>
                <p className="font-mono mt-2 text-[10px] uppercase tracking-[0.18em] text-inkfaint">{tier.level}</p>
                <p className="mt-4 flex-1 text-[13.5px] leading-relaxed text-inksoft">{tier.desc}</p>
                
                <div className="mt-8 space-y-3 border-t border-linesoft pt-6">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[13px] text-inksoft">Cut & Style</span>
                    <span className="font-display text-2xl text-rosedeep">from £{tier.cutPrice}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[13px] text-inksoft">Colour</span>
                    <span className="font-display text-2xl text-gold">from £{tier.colourPrice}</span>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
