import { useState } from "react";
import type { Theme } from "../lib/hooks";
import { useConfig } from "../lib/config";
import { useI18n } from "../lib/i18n";
import { Ic } from "./Ornaments";

const NAV = [
  { label: "Services", id: "services" },
  { label: "Transformations", id: "transformations" },
  { label: "Stylists", id: "stylists" },
  { label: "Consultation", id: "consultation" },
  { label: "The Mirror", id: "mirror" },
  { label: "Booking", id: "booking" },
];

export default function Header({ theme, onToggleTheme, scrolled, onOpenConsole }: { theme: Theme; onToggleTheme: () => void; scrolled: boolean; onOpenConsole: () => void }) {
  const cfg = useConfig();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const go = (id: string) => { setOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };
  const navLabel = (n: { label: string; id: string }) => t(`nav.${n.id}`, n.label);

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${scrolled ? "glass border-b border-linec shadow-[var(--shadow-card)]" : "bg-transparent"}`}>
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <nav className="hidden flex-1 items-center gap-7 lg:flex" aria-label="Primary left">
            {NAV.slice(0, 3).map((n) => (
              <button key={n.id} onClick={() => go(n.id)} data-cursor="hand" className="link-draw font-mono text-[10.5px] uppercase tracking-[0.22em] text-inksoft transition-colors hover:text-ink">{navLabel(n)}</button>
            ))}
          </nav>
          <button onClick={() => go("services")} data-cursor="hand" className="group flex flex-col items-center leading-none" aria-label="Luxe Hair Studio home">
            <span className="font-display text-2xl font-semibold tracking-[0.3em] text-ink transition-colors group-hover:text-rosedeep">{cfg.salon.word}</span>
            <span className="font-mono text-[7.5px] uppercase tracking-[0.5em] text-inkfaint">{cfg.salon.sub}</span>
          </button>
          <div className="flex flex-1 items-center justify-end gap-5">
            <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary right">
              {NAV.slice(2).map((n) => (
                <button key={n.id} onClick={() => go(n.id)} data-cursor="hand" className="link-draw font-mono text-[10.5px] uppercase tracking-[0.22em] text-inksoft transition-colors hover:text-ink">{navLabel(n)}</button>
              ))}
            </nav>
            <button onClick={onToggleTheme} data-cursor="hand" aria-label="Toggle theme" className="flex h-9 w-9 items-center justify-center rounded-full border border-linec text-inksoft transition-all hover:border-gold/60 hover:text-gold">
              {theme === "light" ? <Ic.Moon className="h-4 w-4" /> : <Ic.Sun className="h-4 w-4" />}
            </button>
            <button onClick={() => go("booking")} data-cursor="hand" className="btn-sheen hidden rounded-full border border-rosedeep/70 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink sm:block">{t("dock.bookNow", "Book")}</button>
            <button onClick={() => setOpen(true)} data-cursor="hand" aria-label="Open menu" className="flex h-9 w-9 items-center justify-center rounded-full border border-linec text-inksoft lg:hidden"><Ic.Menu className="h-4 w-4" /></button>
          </div>
        </div>
      </header>

      {/* mobile drawer */}
      <div className={`fixed inset-0 z-50 transition-all duration-500 lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div className={`absolute inset-0 bg-basedeep/60 backdrop-blur-sm transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} />
        <div className={`absolute right-0 top-0 h-full w-[82%] max-w-sm overflow-y-auto rounded-l-[2.6rem] border-l border-linec bg-surface p-8 shadow-[var(--shadow-lift)] transition-transform duration-500 ${open ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between">
            <span className="font-display text-xl font-semibold tracking-[0.25em] text-ink">{cfg.salon.word}</span>
            <button onClick={() => setOpen(false)} data-cursor="hand" aria-label="Close menu" className="flex h-9 w-9 items-center justify-center rounded-full border border-linec text-inksoft"><Ic.X className="h-4 w-4" /></button>
          </div>
          <nav className="mt-10 flex flex-col gap-2" aria-label="Mobile">
            {NAV.map((n, i) => (
              <button key={n.id} onClick={() => go(n.id)} className="group flex items-baseline justify-between border-b border-linesoft py-4 text-left">
                <span className="font-display text-2xl font-medium text-ink transition-all group-hover:translate-x-2 group-hover:text-rosedeep">{navLabel(n)}</span>
                <span className="font-mono text-[10px] text-inkfaint">0{i + 1}</span>
              </button>
            ))}
            <button onClick={onOpenConsole} data-cursor="hand" className="mt-6 self-start rounded-full border border-linec px-5 py-2.5 font-mono text-[9px] uppercase tracking-[0.2em] text-inksoft">Atelier Console</button>
          </nav>
        </div>
      </div>
    </>
  );
}
