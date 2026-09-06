import { useMemo, useState } from "react";
import { useConfig } from "../lib/config";
import { Ic, Reveal, SectionHead } from "./Ornaments";
import type { BookPrefill } from "./Services";

const QUESTIONS: { q: string; opts: { label: string; w: Record<string, number> }[] }[] = [
  { q: "Chatty, or blissfully quiet in the chair?", opts: [{ label: "Love a good gossip", w: { sofia: 3, amara: 1, elena: 1 } }, { label: "Quiet, please", w: { elena: 3, amara: 2 } }] },
  { q: "Trend-forward or timeless?", opts: [{ label: "Runway, darling", w: { sofia: 3, elena: 2 } }, { label: "Timeless", w: { amara: 3, elena: 2, sofia: 1 } }] },
  { q: "Your texture?", opts: [{ label: "Curls & coils", w: { amara: 4, sofia: 1 } }, { label: "Straight to wavy", w: { elena: 3, sofia: 2 } }] },
  { q: "Colour ambition?", opts: [{ label: "Big, bold change", w: { sofia: 4 } }, { label: "Subtle dimension", w: { elena: 3, amara: 2, sofia: 1 } }] },
  { q: "Your ideal outcome?", opts: [{ label: "Turn heads", w: { sofia: 4, elena: 1 } }, { label: "Feel like myself, refined", w: { amara: 4, elena: 3 } }] },
];

export default function Stylists({ onBook }: { onBook: (p: BookPrefill) => void }) {
  const cfg = useConfig();
  const head = cfg.headings.stylists;
  const [step, setStep] = useState(-1);
  const [scores, setScores] = useState<Record<string, number>>({});

  const pick = (oi: number) => {
    const w = QUESTIONS[step].opts[oi].w;
    setScores((s) => { const n = { ...s }; for (const k in w) n[k] = (n[k] ?? 0) + w[k]; return n; });
    setStep((v) => (v === QUESTIONS.length - 1 ? QUESTIONS.length : v + 1));
  };
  const result = useMemo(() => {
    const best = cfg.stylists.map((s) => ({ s, v: scores[s.id] ?? 0 })).sort((a, b) => b.v - a.v)[0];
    const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
    return best ? { ...best, pct: Math.min(98, Math.round(52 + (best.v / total) * 80)) } : null;
  }, [scores, cfg.stylists]);
  const reset = () => { setStep(-1); setScores({}); };

  return (
    <section id="stylists" className="relative bg-base py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHead eyebrow="The Atelier Team" title={head.title} italic={head.italic} desc={head.desc} tr="stylists" />
          <Reveal delay={150}>
            <button onClick={() => { reset(); setStep(0); document.getElementById("matchmaker")?.scrollIntoView({ behavior: "smooth", block: "center" }); }} data-cursor="hand"
              className="btn-sheen flex items-center gap-3 rounded-full border border-gold/60 px-7 py-3.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink">
              <Ic.Heart className="h-3.5 w-3.5" /> Take the matchmaker quiz
            </button>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {cfg.stylists.map((st, i) => (
            <Reveal key={st.id} delay={i * 130} className={i === 1 ? "md:mt-12" : ""}>
              <article className="group relative overflow-hidden rounded-t-[999px] rounded-b-[1.6rem] border border-linec bg-surface shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[var(--shadow-lift)]">
                <div className="relative overflow-hidden rounded-t-[999px]" data-cursor="brush">
                  <img src={st.img} alt={st.name} loading="lazy" decoding="async" className="aspect-[832/1024] w-full object-cover object-top transition-all duration-[1.4s] ease-out group-hover:scale-[1.05] group-hover:brightness-[1.06]" />
                  <span className="absolute inset-0 bg-gradient-to-t from-basedeep/60 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                  <p className="font-accenti absolute inset-x-6 bottom-5 translate-y-4 text-lg text-surface opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">“{st.quote}”</p>
                </div>
                <div className="p-7">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-2xl font-medium text-ink">{st.name}</h3>
                      <p className="font-mono mt-1 text-[10px] uppercase tracking-[0.18em] text-rosedeep">{st.title}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-rose-ghost px-3 py-1 text-[11px] text-rosedeep">{st.specialty}</span>
                  </div>
                  <p className="mt-4 text-[13px] leading-relaxed text-inksoft">{st.personality}.</p>
                  <button onClick={() => onBook({ stylist: st.name })} data-cursor="hand"
                    className="btn-sheen mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-rosedeep/60 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink">
                    Book with {st.name.split(" ")[0]} <Ic.ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <div id="matchmaker" className="mt-28 scroll-mt-32">
          <Reveal>
            <div className="shape-blob-b relative overflow-hidden border border-rose/30 bg-surface px-6 py-14 shadow-[var(--shadow-lift)] sm:px-14 lg:px-24 lg:py-16">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-soft blur-3xl" />
              {step === -1 && (
                <div className="relative mx-auto max-w-xl text-center">
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold">The Stylist Matchmaker</p>
                  <h3 className="font-display mt-4 text-4xl font-medium text-ink sm:text-5xl">Eight questions. <em className="font-accenti text-rosedeep">One soulmate.</em></h3>
                  <p className="mt-4 text-[14.5px] leading-relaxed text-inksoft">We weigh your answers against each stylist's craft, temperament and chair-side manner.</p>
                  <button onClick={() => setStep(0)} data-cursor="hand" className="btn-sheen mx-auto mt-8 rounded-full border border-rosedeep/70 px-9 py-4 font-mono text-[11px] uppercase tracking-[0.24em] text-ink shadow-[var(--glow-rose)]">Begin the ritual</button>
                </div>
              )}
              {step >= 0 && step < QUESTIONS.length && (
                <div className="relative mx-auto max-w-xl">
                  <div className="mb-10 flex items-center gap-1.5">
                    {QUESTIONS.map((_, i) => (<span key={i} className={`h-[3px] flex-1 rounded-full transition-all duration-500 ${i < step ? "bg-rosedeep" : i === step ? "bg-gold shadow-[0_0_8px_rgba(201,176,55,0.7)]" : "bg-linesoft"}`} />))}
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-inkfaint">Question {step + 1} of {QUESTIONS.length}</p>
                  <h3 key={step} className="font-display phase-swap mt-3 min-h-[84px] text-3xl font-medium leading-tight text-ink sm:text-4xl">{QUESTIONS[step].q}</h3>
                  <div key={`o${step}`} className="phase-swap mt-8 flex flex-col gap-3" style={{ animationDelay: "0.08s" }}>
                    {QUESTIONS[step].opts.map((o, oi) => (
                      <button key={o.label} onClick={() => pick(oi)} data-cursor="hand"
                        className="group flex items-center justify-between rounded-[1.6rem_0.4rem_1.6rem_0.4rem] border border-linec bg-base/60 px-6 py-4 text-left transition-all hover:translate-x-1.5 hover:border-rosedeep/60 hover:bg-surface">
                        <span className="font-display text-xl text-ink">{o.label}</span>
                        <Ic.ArrowRight className="h-4 w-4 shrink-0 text-inkfaint transition-all group-hover:translate-x-1 group-hover:text-gold" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {step === QUESTIONS.length && result && (
                <div className="relative mx-auto max-w-3xl">
                  <p className="font-mono text-center text-[10px] uppercase tracking-[0.3em] text-gold">Your perfect match</p>
                  <div className="mt-8 grid items-center gap-10 md:grid-cols-[240px_1fr]">
                    <div className="relative mx-auto">
                      <div className="shape-arch overflow-hidden border-2 border-gold/60 shadow-[var(--glow-rose)]">
                        <img src={result.s.img} alt={result.s.name} className="aspect-[832/1024] w-56 object-cover object-top" />
                      </div>
                      <span className="font-mono absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-rosedeep px-4 py-1.5 text-[11px] text-surface shadow-[var(--shadow-card)]">{result.pct}% match</span>
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="font-display text-4xl font-medium text-ink sm:text-5xl">It's <em className="font-accenti text-rosedeep">{result.s.name.split(" ")[0]}</em>, obviously.</h3>
                      <p className="mt-3 text-[14.5px] leading-relaxed text-inksoft">{result.s.personality}. “{result.s.quote}”</p>
                      <div className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start">
                        <button onClick={() => onBook({ stylist: result.s.name })} data-cursor="hand" className="btn-sheen rounded-full border border-rosedeep/70 px-7 py-3.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink shadow-[var(--glow-rose)]">Book with {result.s.name.split(" ")[0]}</button>
                        <button onClick={reset} data-cursor="hand" className="link-draw font-accenti text-lg text-inksoft">retake the quiz</button>
                      </div>
                    </div>
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
