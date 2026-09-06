import { useConfig } from "../lib/config";
import { Ic, Reveal, SectionHead } from "./Ornaments";

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  coffee: Ic.Coffee,
  flower: Ic.Flower,
  drop: Ic.Drop,
  gem: Ic.Gem,
  sparkle: Ic.Sparkle,
  bag: Ic.Bag,
  glass: Ic.Glass,
};

export default function Amenities() {
  const cfg = useConfig();
  const head = cfg.headings.experience;

  return (
    <section id="amenities" className="relative bg-basesoft py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead eyebrow="The Amenities" title={head.title} italic={head.italic} desc={head.desc} tr="amenities" />
        
        <Reveal className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          {cfg.amenities.map((a, i) => {
            const IconComp = ICON_MAP[a.icon] || Ic.Sparkle;
            return (
              <Reveal key={a.title} delay={i * 100} className="group">
                <div className="flex flex-col items-center text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-rose/30 bg-surface text-rosedeep transition-all group-hover:-translate-y-1 group-hover:border-gold/50 group-hover:text-gold">
                    <IconComp className="h-7 w-7" />
                  </span>
                  <h3 className="font-display mt-4 text-lg font-medium text-ink">{a.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-inksoft">{a.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
