import { useConfig } from "../lib/config";
import { Reveal, SectionHead } from "./Ornaments";

export default function Stats() {
  const cfg = useConfig();

  return (
    <section id="stats" className="relative bg-rosedeep py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {cfg.stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 100} className="text-center">
              <p className="font-accenti text-4xl font-medium text-surface sm:text-5xl">{stat.value}</p>
              <p className="font-mono mt-3 text-[10px] uppercase tracking-[0.22em] text-rose-soft">{stat.label}</p>
            </Reveal>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
