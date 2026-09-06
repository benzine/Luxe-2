import { useState } from "react";
import { useConfig } from "../lib/config";
import { Ic, Reveal, SectionHead } from "./Ornaments";
import type { BookPrefill } from "./Services";

const QS = [
  { id: "Hair type", label: "Your hair, in its natural state?", opts: ["Fine & straight", "Thick & wavy", "Curly & coily", "Colour-processed"] },
  { id: "Face shape", label: "Your face shape?", opts: ["Oval", "Round", "Square", "Heart"] },
  { id: "Maintenance", label: "Daily styling effort, honestly?", opts: ["Wash & go", "Ten mindful minutes", "Full ritual, gladly"] },
  { id: "Colour muse", label: "Colour inspiration?", opts: ["Natural glow", "Warm copper & rose", "Cool platinum", "Deep espresso gloss"] },
  { id: "Budget", label: "Budget range?", opts: ["Essential", "Signature", "No ceiling"] },
];

export default function Consultation({ onBook }: { onBook: (p: BookPrefill) => void }) {
  const cfg = useConfig();
  const head = cfg.headings.consultation;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const answer = (id: string, v: string) => {
    const next = { ...answers, [id]: v };
    setAnswers(next);
    if (step === QS.length - 1) setDone(true);
    else setStep((s) => s + 1);
  };
  const looks = [
    { title: "The Sunlit Gloss", tag: "The head-turner", desc: "Dimensional gloss layered with a precision restyle — tuned to your face shape.", price: 195, stylist: cfg.stylists[0]?.name ?? "Team" },
    { title: "The Rosewater Balayage", tag: "The quiet luxury", desc: "Hand-painted warmth at whisper volume, with a bond-repair finish.", price: 265, stylist: cfg.stylists[1]?.name ?? "Team" },
    { title: "The Full Metamorphosis", tag: "The main character", desc: "Colour, restyle, treatment and a soft-glam finish. Bring an afternoon.", price: 410, stylist: cfg.stylists[2]?.name ?? "Team" },
  ];

  return (
    <section id="consultation" className="relative bg-basesoft py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHead eyebrow="AI Hair Consultation" title={head.title} italic={head.italic} desc={head.desc} tr="consultation" />
            <Reveal delay={150} className="mt-9 space-y-4">
              {[
                { ic: Ic.Camera, t: "Optional photo analysis", d: "Your photo stays in your browser — nothing is uploaded." },
                { ic: Ic.Sparkle, t: "Three tailored looks", d: "From quiet luxury to full metamorphosis." },
                { ic: Ic.Clock, t: "Book in one tap", d: "Every recommendation carries its own booking shortcut." },
              ].map((f) => (
                <div key={f.t} className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold-soft text-gold"><f.ic className="h-4.5 w-4.5" /></span>
                  <div>
                    <p className="font-display text-lg text-ink">{f.t}</p>
                    <p className="text-[13px] text-inksoft">{f.d}</p>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>

          <Reveal dir="right">
            <div className="relative overflow-hidden rounded-[2.6rem_2.6rem_2.6rem_0.8rem] border border-rose/30 bg-surface p-7 shadow-[var(--shadow-lift)] sm:p-12">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-rose-ghost blur-3xl" />
              {!done ? (
                <>
                  <div className="mb-9 flex items-center gap-1.5">
                    {QS.map((_, i) => (<span key={i} className={`h-[3px] flex-1 rounded-full transition-all duration-500 ${i < step ? "bg-rosedeep" : i === step ? "bg-gold shadow-[0_0_8px_rgba(201,176,55,0.7)]" : "bg-linesoft"}`} />))}
                  </div>
                  <div key={step} className="phase-swap">
                    <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-gold">Step {String(step + 1).padStart(2, "0")} — {QS[step].id}</p>
                    <h3 className="font-display mt-3 text-3xl font-medium text-ink sm:text-4xl">{QS[step].label}</h3>
                    <div className="mt-7 grid gap-3 sm:grid-cols-2">
                      {QS[step].opts.map((o) => (
                        <button key={o} onClick={() => answer(QS[step].id, o)} data-cursor="hand"
                          className="group flex items-center justify-between gap-3 rounded-[1.5rem_0.4rem_1.5rem_0.4rem] border border-linec bg-base/50 px-5 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-rosedeep/60 hover:bg-surface">
                          <span className="font-display text-lg text-ink">{o}</span>
                          <span className="h-2 w-2 rounded-full border border-inkfaint transition-all group-hover:border-gold group-hover:bg-gold" />
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="phase-swap">
                  <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-gold">Consultation complete</p>
                  <h3 className="font-display mt-2 text-3xl font-medium text-ink sm:text-4xl">Three looks, <em className="font-accenti text-rosedeep">hand-written for you.</em></h3>
                  <div className="mt-9 flex flex-col gap-6">
                    {looks.map((r, i) => (
                      <article key={r.title} className="phase-swap group rounded-[2rem_2rem_0.6rem_2rem] border border-linec bg-base/50 p-6 transition-all hover:border-gold/50 hover:shadow-[var(--shadow-card)] sm:p-7" style={{ animationDelay: `${i * 0.14}s` }}>
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h4 className="font-display text-2xl font-medium text-ink">{r.title}</h4>
                          <span className="font-mono rounded-full bg-rose-ghost px-3 py-1 text-[9px] uppercase tracking-[0.18em] text-rosedeep">{r.tag}</span>
                        </div>
                        <p className="mt-2 text-[13.5px] leading-relaxed text-inksoft">{r.desc}</p>
                        <div className="font-mono mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-inksoft">
                          <span className="flex items-center gap-1.5"><Ic.Gem className="h-3.5 w-3.5 text-gold" />from £{r.price}</span>
                          <span className="flex items-center gap-1.5"><Ic.Heart className="h-3.5 w-3.5 text-gold" />{r.stylist}</span>
                        </div>
                        <button onClick={() => onBook({ service: r.title, stylist: r.stylist })} data-cursor="hand"
                          className="btn-sheen mt-4 rounded-full border border-rosedeep/70 px-6 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink">Book this look</button>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
