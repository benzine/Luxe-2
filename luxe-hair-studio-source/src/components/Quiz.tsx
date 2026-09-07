import { useState } from "react";
import { useConfig } from "../lib/config";
import { Reveal, SectionHead, toast } from "./Ornaments";

export default function Quiz() {
  const cfg = useConfig();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);

  const handleSelect = (qId: string, optionLabel: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionLabel }));
  };

  const calculateResult = () => {
    const scores: Record<string, number> = { amara: 0, sofia: 0, elena: 0 };
    
    cfg.quizQuestions.forEach((q) => {
      const answer = answers[q.id];
      if (answer) {
        const option = q.options.find((o) => o.label === answer);
        if (option) {
          Object.entries(option.score).forEach(([stylist, score]) => {
            scores[stylist] += score;
          });
        }
      }
    });

    const bestMatch = Object.entries(scores).reduce((a, b) => (b[1] > a[1] ? b : a));
    const stylist = cfg.stylists.find((s) => s.id === bestMatch[0]);
    setResult(stylist?.name || "We'll find your perfect match");
    toast(`Your match: ${result}`);
  };

  const progress = Math.round((Object.keys(answers).length / cfg.quizQuestions.length) * 100);

  return (
    <section id="quiz" className="relative bg-basesoft py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <SectionHead center eyebrow="Find Your Stylist" title="The Matchmaker" italic="let us guide you" desc="Answer a few questions and we'll pair you with your perfect stylist." tr="quiz" />

        <Reveal className="mt-10">
          <div className="rounded-[2rem_2rem_1rem_2rem] border border-linec bg-surface p-6 sm:p-10">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-inkfaint">Your progress</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-rosedeep">{progress}%</p>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-linesoft">
                <div className="h-full rounded-full bg-rosedeep transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="space-y-8">
              {cfg.quizQuestions.map((q, qi) => (
                <Reveal key={q.id} delay={qi * 80}>
                  <div>
                    <p className="font-display text-lg font-medium text-ink">{q.q}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {q.options.map((opt) => (
                        <button
                          key={opt.label}
                          onClick={() => handleSelect(q.id, opt.label)}
                          data-cursor="hand"
                          className={`rounded-full border px-4 py-2 font-mono text-[11px] tracking-[0.08em] transition-all ${
                            answers[q.id] === opt.label
                              ? "border-rosedeep bg-rosedeep text-surface"
                              : "border-linec text-inksoft hover:border-rosedeep/60 hover:text-ink"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-10 flex items-center justify-between">
              {result && (
                <p className="font-accenti text-xl text-gold">Your match: {result}</p>
              )}
              <button
                onClick={calculateResult}
                disabled={Object.keys(answers).length < cfg.quizQuestions.length}
                data-cursor="hand"
                className="btn-sheen rounded-full border border-rosedeep/70 px-8 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                Find my stylist
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
