import { useState } from "react";
import { configStore, useConfig } from "../lib/config";
import { useI18n, LANGS, type Lang } from "../lib/i18n";
import { Ic } from "./Ornaments";

/* ── Left floating dock — language + accessibility ──
   Collapsible vertical dock on the left edge. Language picker, text
   size, high-contrast and reduce-motion. Every setting persists via
   the config store / i18n store, and everything is also mirrored in
   the Atelier Console for the backoffice. */
export default function SiteEnhancements() {
  const cfg = useConfig();
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);

  const setSize = (delta: number) => {
    const next = Math.min(20, Math.max(14, Math.round(cfg.design.baseFontSize + delta)));
    configStore.setDesign({ baseFontSize: next });
  };

  return (
    <div className="fixed left-0 top-1/2 z-40 -translate-y-1/2">
      <div className={`flex items-stretch transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-[calc(100%-2.25rem)]"}`}>
        {/* the panel */}
        <div className="flex w-44 flex-col gap-4 rounded-r-[1.4rem] border border-l-0 border-linec bg-surface/95 py-5 pl-4 pr-3 shadow-[var(--shadow-lift)] backdrop-blur-md">
          {/* language */}
          <div>
            <p className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-inkfaint">{t("dock.lang", "Language")}</p>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {LANGS.map((l) => (
                <button key={l.id} onClick={() => setLang(l.id as Lang)} data-cursor="hand" aria-label={l.label} title={l.label}
                  className={`flex h-8 items-center justify-center rounded-lg border font-mono text-[9px] tracking-wide transition-all ${lang === l.id ? "border-gold bg-gold/15 text-ink" : "border-linec text-inksoft hover:border-gold/50 hover:text-ink"}`}>
                  {l.short}
                </button>
              ))}
            </div>
          </div>

          {/* text size */}
          <div>
            <p className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-inkfaint">{t("dock.textSize", "Text size")}</p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <button onClick={() => setSize(-1)} data-cursor="hand" aria-label="Decrease text size" className="flex h-8 items-center justify-center rounded-lg border border-linec font-display text-sm text-inksoft transition-all hover:border-gold/50 hover:text-ink">A−</button>
              <button onClick={() => setSize(1)} data-cursor="hand" aria-label="Increase text size" className="flex h-8 items-center justify-center rounded-lg border border-linec font-display text-base text-inksoft transition-all hover:border-gold/50 hover:text-ink">A+</button>
            </div>
          </div>

          {/* high contrast */}
          <button onClick={() => configStore.setDesign({ contrast: !cfg.design.contrast })} data-cursor="hand" role="switch" aria-checked={cfg.design.contrast}
            className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-all ${cfg.design.contrast ? "border-gold bg-gold/15" : "border-linec hover:border-gold/50"}`}>
            <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-inksoft">{t("dock.contrast", "High contrast")}</span>
            <span className={`relative h-4 w-7 rounded-full transition-colors ${cfg.design.contrast ? "bg-gold" : "bg-linec"}`}>
              <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-surface transition-all ${cfg.design.contrast ? "left-3.5" : "left-0.5"}`} />
            </span>
          </button>

          {/* reduce motion */}
          <button onClick={() => configStore.setDesign({ motion: !cfg.design.motion })} data-cursor="hand" role="switch" aria-checked={!cfg.design.motion}
            className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-all ${!cfg.design.motion ? "border-gold bg-gold/15" : "border-linec hover:border-gold/50"}`}>
            <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-inksoft">{t("dock.motion", "Reduce motion")}</span>
            <span className={`relative h-4 w-7 rounded-full transition-colors ${!cfg.design.motion ? "bg-gold" : "bg-linec"}`}>
              <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-surface transition-all ${!cfg.design.motion ? "left-3.5" : "left-0.5"}`} />
            </span>
          </button>
        </div>

        {/* the tab handle */}
        <button onClick={() => setOpen((o) => !o)} data-cursor="hand" aria-label={t("dock.access", "Accessibility & language")} aria-expanded={open}
          className="flex w-9 items-center justify-center self-center rounded-r-[1rem] border border-l-0 border-linec bg-surface py-4 text-rosedeep shadow-[var(--shadow-lift)]">
          <Ic.Sliders className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
    </div>
  );
}
