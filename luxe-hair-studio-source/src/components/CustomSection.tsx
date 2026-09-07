import type { CustomSectionData } from "../lib/config";
import { useImage, useLabel } from "../lib/config";
import { Ic, Reveal } from "./Ornaments";
import { IMG } from "../lib/images";

/* Renders an admin-added section (info box / CTA banner / text block).
   Every field is editable in the Atelier Console → Sections tab. */
export default function CustomSection({ data }: { data: CustomSectionData }) {
  const image = useImage();
  const L = useLabel();
  const accent = data.accent || "var(--gold)";
  const go = () => {
    if (data.buttonTarget) document.getElementById(data.buttonTarget)?.scrollIntoView({ behavior: "smooth" });
  };

  const btn = data.buttonText ? (
    <button
      onClick={go}
      data-cursor="hand"
      className="btn-sheen mt-6 inline-flex items-center gap-2.5 rounded-full border px-7 py-3 font-mono text-[10px] uppercase tracking-[0.22em] transition-all hover:-translate-y-0.5"
      style={{ borderColor: accent, color: "var(--ink)" }}
    >
      {data.buttonText} <Ic.ArrowRight className="h-3.5 w-3.5" />
    </button>
  ) : null;

  if (data.kind === "cta") {
    return (
      <section className="relative overflow-hidden bg-basesoft py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <Reveal>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em]" style={{ color: accent }}>
              {data.italic || L("eyebrow.packages", "Signature")}
            </p>
            <h2 className="font-display mt-4 text-4xl font-medium leading-[1.05] text-ink sm:text-5xl">{data.title}</h2>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-inksoft">{data.body}</p>
            {btn}
          </Reveal>
        </div>
      </section>
    );
  }

  if (data.kind === "text") {
    return (
      <section className="relative bg-base py-20 sm:py-24">
        <div className="mx-auto max-w-2xl px-5 sm:px-8">
          <Reveal>
            <h2 className="font-display text-3xl font-medium leading-tight text-ink sm:text-4xl">
              {data.title} {data.italic && <em className="font-accenti font-normal text-rosedeep">{data.italic}</em>}
            </h2>
            <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed text-inksoft">{data.body}</p>
          </Reveal>
        </div>
      </section>
    );
  }

  /* info box: image + text side by side */
  const src = data.image ? image(data.image, data.image) : image("salon", IMG.salon);
  return (
    <section className="relative bg-base py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2">
        <Reveal dir="left">
          <div className="shape-arch-soft overflow-hidden shadow-[var(--shadow-lift)]">
            <img src={src} alt={data.title} loading="lazy" className="h-[340px] w-full object-cover sm:h-[420px]" />
          </div>
        </Reveal>
        <Reveal dir="right">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em]" style={{ color: accent }}>
            {data.italic || L("eyebrow.experience", "The Sensory Salon")}
          </p>
          <h2 className="font-display mt-4 text-4xl font-medium leading-[1.05] text-ink sm:text-5xl">{data.title}</h2>
          <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed text-inksoft">{data.body}</p>
          {btn}
        </Reveal>
      </div>
    </section>
  );
}
