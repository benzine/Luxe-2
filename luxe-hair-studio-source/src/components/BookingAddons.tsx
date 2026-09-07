import { useConfig } from "../lib/config";
import { Ic, Reveal, SectionHead, toast } from "./Ornaments";

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  sparkle: Ic.Sparkle,
  drop: Ic.Drop,
  bag: Ic.Bag,
  glass: Ic.Glass,
};

export default function BookingAddons() {
  const cfg = useConfig();
  const head = cfg.headings.booking;

  return (
    <section id="booking-addons" className="relative bg-base py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <SectionHead center eyebrow="Enhance Your Visit" title="Little extras" italic="because you deserve it" desc="Add a touch of luxury to your appointment." tr="booking-addons" />
        
        <Reveal className="mt-12 grid gap-4 sm:grid-cols-2">
          {cfg.bookingAddons.map((addon, i) => {
            const IconComp = ICON_MAP[addon.icon] || Ic.Sparkle;
            return (
              <Reveal key={addon.name} delay={i * 100}>
                <article className="group flex items-start gap-4 rounded-[1.6rem_1.6rem_0.5rem_1.6rem] border border-linec bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-[var(--shadow-card)]">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-rose/30 bg-rose-ghost text-rosedeep transition-colors group-hover:border-gold/50 group-hover:text-gold">
                    <IconComp className="h-6 w-6" />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg font-medium text-ink">{addon.name}</h3>
                      <span className="font-display text-xl text-gold">£{addon.price}</span>
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-inksoft">{addon.desc}</p>
                    <button 
                      onClick={() => toast(`${addon.name} added to your booking`)}
                      data-cursor="hand"
                      className="link-draw mt-3 font-mono text-[9px] uppercase tracking-[0.18em] text-rosedeep"
                    >
                      Add to booking
                    </button>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
