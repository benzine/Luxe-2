import { useState } from "react";
import { useConfig } from "../lib/config";
import { HairPart, Ic, Reveal, SectionHead, toast } from "./Ornaments";

export interface BookPrefill { service?: string; stylist?: string; }

export default function Services({ onBook }: { onBook: (p: BookPrefill) => void }) {
  const cfg = useConfig();
  const head = cfg.headings.services;
  const [cat, setCat] = useState("all");
  const cats = [{ id: "all", label: "Everything" }, ...cfg.services.map((c, i) => ({ id: `c${i}`, label: c.label }))];
  const shown = cfg.services.map((c, i) => ({ ...c, id: `c${i}` })).filter((c) => cat === "all" || c.id === cat);

  return (
    <section id="services" className="relative bg-basesoft py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[380px_1fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHead eyebrow="The Service Menu" title={head.title} italic={head.italic} desc={head.desc} tr="services" />
            <Reveal delay={120} className="mt-9 flex flex-wrap gap-2">
              {cats.map((c) => (
                <button key={c.id} onClick={() => setCat(c.id)} data-cursor="hand"
                  className={`rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-all ${cat === c.id ? "border-rosedeep bg-rosedeep text-surface shadow-[var(--glow-rose)]" : "border-linec text-inksoft hover:border-rosedeep/60 hover:text-ink"}`}>{c.label}</button>
              ))}
            </Reveal>
            <Reveal delay={200} className="mt-10 hidden lg:block">
              <div className="rounded-[2rem_2rem_2rem_0.5rem] border border-gold/30 bg-gold-soft p-6">
                <p className="font-accenti text-lg leading-snug text-ink">“Prices are beginnings, not verdicts — every head of hair tells us the rest.”</p>
                <p className="font-mono mt-3 text-[10px] uppercase tracking-[0.22em] text-inksoft">— Elena, co-founder</p>
              </div>
            </Reveal>
          </div>

          <div>
            {shown.map((c, ci) => (
              <div key={c.id}>
                {ci > 0 && <HairPart className="my-10" />}
                <Reveal>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-3xl font-medium text-ink">{c.label}</h3>
                    <p className="font-accenti text-[15px] text-inksoft">{c.note}</p>
                  </div>
                </Reveal>
                <div className="mt-6">
                  {c.items.map((s, i) => (
                    <Reveal key={s.name} delay={i * 70}>
                      <button onClick={() => onBook({ service: s.name })} data-cursor="scissors"
                        className="group relative grid w-full grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 overflow-hidden border-b border-linesoft px-2 py-5 text-left transition-colors hover:bg-surface/80 sm:grid-cols-[1fr_auto_auto] sm:px-4">
                        <span className="pointer-events-none absolute inset-y-0 left-0 w-0 bg-gradient-to-r from-rose-ghost to-transparent transition-all duration-500 group-hover:w-full" />
                        <span className="relative">
                          <span className="font-display block text-[21px] text-ink transition-transform duration-300 group-hover:translate-x-1.5">{s.name}</span>
                          <span className="mt-0.5 block text-[13px] text-inksoft">{s.desc}</span>
                        </span>
                        <span className="font-mono relative flex items-center gap-1.5 text-[11px] text-inkfaint"><Ic.Clock className="h-3.5 w-3.5" />{s.dur}m</span>
                        <span className="font-mono relative col-span-2 text-[13px] tabular-nums sm:col-span-1">
                          <span className="text-sage">£{Math.round(s.price * 0.78)}</span><span className="text-inkfaint"> · </span>
                          <span className="text-rosedeep">£{s.price}</span><span className="text-inkfaint"> · </span>
                          <span className="text-gold">£{Math.round(s.price * 1.27)}</span>
                        </span>
                      </button>
                    </Reveal>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* signature packages */}
        <div className="mt-28">
          <Reveal className="flex items-end justify-between gap-6">
            <div>
              <SectionHead eyebrow="Signature Packages" title="Three ways to" italic="disappear for an afternoon" />
            </div>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-12">
            {cfg.packages.map((pk, i) => (
              <Reveal key={pk.name} delay={i * 120} className={i === 0 ? "md:col-span-5" : i === 1 ? "md:col-span-4 md:mt-14" : "md:col-span-3 md:-mt-6"}>
                <div className="group relative overflow-hidden rounded-[2.4rem_2.4rem_2.4rem_0.6rem] border border-linec bg-surface p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[var(--shadow-lift)]">
                  <span className="absolute inset-x-8 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-gold to-transparent transition-transform duration-700 group-hover:scale-x-100" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-gold">{pk.tag}</span>
                  <h4 className="font-display mt-3 text-2xl font-medium text-ink">{pk.name}</h4>
                  <p className="mt-3 min-h-[72px] text-[13.5px] leading-relaxed text-inksoft">{pk.desc}</p>
                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-inkfaint">{pk.dur}</p>
                      <p className="font-display mt-1 text-3xl text-rosedeep">£{pk.price}<span className="font-accenti text-base text-inkfaint"> pp</span></p>
                    </div>
                    <button onClick={() => onBook({ service: pk.name })} data-cursor="hand" aria-label={`Book ${pk.name}`}
                      className="btn-sheen flex h-11 w-11 items-center justify-center rounded-full border border-rosedeep/60 text-rosedeep transition-transform duration-300 group-hover:rotate-45">
                      <Ic.ArrowRight className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
