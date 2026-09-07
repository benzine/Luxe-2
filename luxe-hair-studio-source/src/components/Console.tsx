import { useState } from "react";
import { configStore, useConfig, DEFAULT_DESIGN, type DesignConfig } from "../lib/config";
import { Ic, toast } from "./Ornaments";

type Tab = "design" | "content" | "mirror" | "layout" | "system";

const PRESETS: { name: string; design: Partial<DesignConfig> }[] = [
  { name: "Day Salon", design: { rose: "#D4A5A5", roseDeep: "#A67B7B", gold: "#C9B037", sage: "#A8B5A0", displayFont: "cormorant" } },
  { name: "Evening Glamour", design: { rose: "#E3B6B6", roseDeep: "#C89A9A", gold: "#E0C766", sage: "#9FAE97", displayFont: "playfair" } },
  { name: "Sage Atelier", design: { rose: "#B5C4AC", roseDeep: "#8FA386", gold: "#C9B037", sage: "#A8B5A0", displayFont: "fraunces" } },
  { name: "Copper House", design: { rose: "#D9A08F", roseDeep: "#B47462", gold: "#D98E4A", sage: "#B5A98F", displayFont: "fraunces" } },
  { name: "Platinum", design: { rose: "#C8C8CF", roseDeep: "#9C9CA8", gold: "#D8D8DE", sage: "#B4B4BC", displayFont: "playfair" } },
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#f2e9e1]/8 py-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c0aea4]">{label}</span>
      <div className="flex items-center gap-3">{children}</div>
    </div>
  );
}
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Row label={label}>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-12 cursor-pointer rounded-lg border border-[#f2e9e1]/15 bg-transparent" />
      <span className="font-mono text-[11px] text-[#8f7d74]">{value}</span>
    </Row>
  );
}
function SliderField({ label, value, min, max, step, onChange, fmt }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; fmt?: (v: number) => string }) {
  return (
    <Row label={label}>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} className="range-luxe w-32" />
      <span className="font-mono w-14 text-right text-[11px] text-[#d9c25a]">{fmt ? fmt(value) : value}</span>
    </Row>
  );
}
function ToggleField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Row label={label}>
      <button onClick={() => onChange(!value)} data-cursor="hand" role="switch" aria-checked={value}
        className={`relative h-6 w-11 rounded-full border transition-colors ${value ? "border-[#a8b5a0] bg-[#a8b5a0]/30" : "border-[#f2e9e1]/20 bg-transparent"}`}>
        <span className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-all ${value ? "left-6 bg-[#a8b5a0]" : "left-1 bg-[#8f7d74]"}`} />
      </button>
    </Row>
  );
}

export default function Console({ onClose }: { onClose: () => void }) {
  const cfg = useConfig();
  const [tab, setTab] = useState<Tab>("design");
  const d = cfg.design;
  const set = (patch: Partial<DesignConfig>) => configStore.setDesign(patch);
  const TABS: { id: Tab; label: string }[] = [
    { id: "design", label: "Design" }, { id: "content", label: "Content" }, { id: "mirror", label: "Mirror" }, { id: "layout", label: "Sections" }, { id: "system", label: "System" },
  ];

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-label="Atelier Console">
      <div className="absolute inset-0 bg-basedeep/70 backdrop-blur-sm" onClick={onClose} />
      <div className="phase-swap absolute right-0 top-0 h-full w-[min(94vw,460px)] overflow-y-auto border-l border-[#f2e9e1]/10 bg-[#241c1d] p-6 text-[#f2e9e1] shadow-[var(--shadow-lift)] sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#d9c25a]">Atelier Console</p>
            <h2 className="font-display mt-1 text-2xl font-medium">Customize everything</h2>
          </div>
          <button onClick={onClose} data-cursor="hand" aria-label="Close console" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#f2e9e1]/15 text-[#c0aea4] hover:text-[#f2e9e1]"><Ic.X className="h-4 w-4" /></button>
        </div>

        <div className="mt-6 flex gap-2">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} data-cursor="hand"
              className={`rounded-full border px-4 py-2 font-mono text-[9px] uppercase tracking-[0.16em] transition-all ${tab === t.id ? "border-[#d9c25a]/60 bg-[#d9c25a]/10 text-[#d9c25a]" : "border-[#f2e9e1]/15 text-[#c0aea4]"}`}>{t.label}</button>
          ))}
        </div>

        {tab === "design" && (
          <div className="mt-6">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Palette</p>
            <ColorField label="Dusty Rose" value={d.rose} onChange={(v) => set({ rose: v })} />
            <ColorField label="Mauve Taupe" value={d.roseDeep} onChange={(v) => set({ roseDeep: v })} />
            <ColorField label="Soft Gold" value={d.gold} onChange={(v) => set({ gold: v })} />
            <ColorField label="Sage Mist" value={d.sage} onChange={(v) => set({ sage: v })} />
            <p className="font-mono mt-6 text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Typography & scale</p>
            <Row label="Display face">
              <select value={d.displayFont} onChange={(e) => set({ displayFont: e.target.value as DesignConfig["displayFont"] })} className="rounded-lg border border-[#f2e9e1]/15 bg-[#1c1516] px-3 py-1.5 text-[12px] text-[#f2e9e1]">
                <option value="cormorant">Cormorant Garamond</option><option value="fraunces">Fraunces</option><option value="playfair">Playfair Display</option>
              </select>
            </Row>
            <SliderField label="Base font size" value={d.baseFontSize} min={14} max={18} step={0.5} onChange={(v) => set({ baseFontSize: v })} fmt={(v) => `${v}px`} />
            <SliderField label="Section density" value={d.density} min={0.85} max={1.15} step={0.05} onChange={(v) => set({ density: v })} fmt={(v) => `${v}×`} />
            <p className="font-mono mt-6 text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Shape & motion</p>
            <SliderField label="Corner radius" value={d.radius} min={0.3} max={1.8} step={0.1} onChange={(v) => set({ radius: v })} fmt={(v) => `${v}×`} />
            <SliderField label="Hero scroll pace" value={d.heroScrollSpeed} min={1} max={4} step={0.5} onChange={(v) => set({ heroScrollSpeed: v })} fmt={(v) => `${v}×`} />
            <ToggleField label="Film grain" value={d.grain} onChange={(v) => set({ grain: v })} />
            <ToggleField label="Motion" value={d.motion} onChange={(v) => set({ motion: v })} />
            <ToggleField label="Custom cursor" value={d.cursor} onChange={(v) => set({ cursor: v })} />
            <ToggleField label="High contrast" value={d.contrast} onChange={(v) => set({ contrast: v })} />
            <ToggleField label="Right dock (book / concierge)" value={d.dockRight} onChange={(v) => set({ dockRight: v })} />
            <ToggleField label="Left dock (language / access)" value={d.dockLeft} onChange={(v) => set({ dockLeft: v })} />
            <p className="font-mono mt-6 text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Presets</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button key={p.name} onClick={() => { set(p.design); toast(`${p.name} preset applied.`); }} data-cursor="hand"
                  className="rounded-full border border-[#f2e9e1]/15 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-[#c0aea4] transition-all hover:border-[#d9c25a]/50 hover:text-[#d9c25a]">{p.name}</button>
              ))}
            </div>
            <button onClick={() => { set({ ...DEFAULT_DESIGN }); toast("Design reset to defaults."); }} data-cursor="hand"
              className="mt-6 rounded-full border border-[#e3b6b6]/40 px-5 py-2.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[#e3b6b6] hover:bg-[#e3b6b6]/10">Reset design defaults</button>
          </div>
        )}

        {tab === "content" && (
          <div className="mt-6">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Salon identity</p>
            <Row label="Wordmark"><input value={cfg.salon.word} onChange={(e) => configStore.setSalon({ word: e.target.value })} className="w-32 rounded-lg border border-[#f2e9e1]/15 bg-[#1c1516] px-3 py-1.5 text-[12px] text-[#f2e9e1]" /></Row>
            <Row label="Phone"><input value={cfg.salon.phone} onChange={(e) => configStore.setSalon({ phone: e.target.value })} className="w-44 rounded-lg border border-[#f2e9e1]/15 bg-[#1c1516] px-3 py-1.5 text-[12px] text-[#f2e9e1]" /></Row>
            <Row label="Email"><input value={cfg.salon.email} onChange={(e) => configStore.setSalon({ email: e.target.value })} className="w-52 rounded-lg border border-[#f2e9e1]/15 bg-[#1c1516] px-3 py-1.5 text-[12px] text-[#f2e9e1]" /></Row>
            <p className="font-mono mt-6 text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Section headings</p>
            {Object.entries(cfg.headings).map(([key, h]) => (
              <div key={key} className="mt-3 rounded-[1rem_1rem_0.3rem_1rem] border border-[#f2e9e1]/10 bg-[#1c1516] p-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#d9c25a]">{key}</p>
                <input value={h.title} onChange={(e) => configStore.setContent({ headings: { ...cfg.headings, [key]: { ...h, title: e.target.value } } })} className="mt-2 w-full rounded-lg border border-[#f2e9e1]/15 bg-[#241c1d] px-3 py-1.5 text-[12px] text-[#f2e9e1]" />
                <input value={h.italic} onChange={(e) => configStore.setContent({ headings: { ...cfg.headings, [key]: { ...h, italic: e.target.value } } })} className="mt-2 w-full rounded-lg border border-[#f2e9e1]/15 bg-[#241c1d] px-3 py-1.5 text-[12px] text-[#f2e9e1]" />
              </div>
            ))}
          </div>
        )}

        {tab === "mirror" && (
          <div className="mt-6">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Muses (models)</p>
            {cfg.mirror.models.map((m, i) => (
              <div key={m.id} className="mt-3 rounded-[1rem_1rem_0.3rem_1rem] border border-[#f2e9e1]/10 bg-[#1c1516] p-4">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#d9c25a]">Muse {i + 1}</p>
                  <button onClick={() => configStore.setContent({ mirror: { ...cfg.mirror, models: cfg.mirror.models.filter((x) => x.id !== m.id) } })} data-cursor="hand" className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#c98d8d] hover:text-[#e3b6b6]">Remove</button>
                </div>
                <input value={m.label} placeholder="Label" onChange={(e) => configStore.setContent({ mirror: { ...cfg.mirror, models: cfg.mirror.models.map((x) => x.id === m.id ? { ...x, label: e.target.value } : x) } })} className="mt-2 w-full rounded-lg border border-[#f2e9e1]/15 bg-[#241c1d] px-3 py-1.5 text-[12px] text-[#f2e9e1]" />
                <input value={m.image} placeholder="Image URL" onChange={(e) => configStore.setContent({ mirror: { ...cfg.mirror, models: cfg.mirror.models.map((x) => x.id === m.id ? { ...x, image: e.target.value } : x) } })} className="mt-2 w-full rounded-lg border border-[#f2e9e1]/15 bg-[#241c1d] px-3 py-1.5 text-[12px] text-[#f2e9e1]" />
                <Row label="Base hair colour"><input type="color" value={m.hair} onChange={(e) => configStore.setContent({ mirror: { ...cfg.mirror, models: cfg.mirror.models.map((x) => x.id === m.id ? { ...x, hair: e.target.value } : x) } })} className="h-8 w-12 cursor-pointer rounded-lg border border-[#f2e9e1]/15 bg-transparent" /></Row>
              </div>
            ))}
            <button onClick={() => configStore.setContent({ mirror: { ...cfg.mirror, models: [...cfg.mirror.models, { id: `muse-${Date.now().toString(36)}`, label: "New Muse", image: "", hair: "#6b4f3a" }] } })} data-cursor="hand" className="mt-3 rounded-full border border-[#a8b5a0]/50 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[#a8b5a0] hover:bg-[#a8b5a0]/10">+ Add muse</button>

            <p className="font-mono mt-8 text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Shade library</p>
            {cfg.mirror.shades.map((s, i) => (
              <div key={s.id} className="mt-3 rounded-[1rem_1rem_0.3rem_1rem] border border-[#f2e9e1]/10 bg-[#1c1516] p-4">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#d9c25a]">{s.label}</p>
                  <button onClick={() => configStore.setContent({ mirror: { ...cfg.mirror, shades: cfg.mirror.shades.filter((x) => x.id !== s.id) } })} data-cursor="hand" className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#c98d8d] hover:text-[#e3b6b6]">Remove</button>
                </div>
                <input value={s.label} placeholder="Shade name" onChange={(e) => configStore.setContent({ mirror: { ...cfg.mirror, shades: cfg.mirror.shades.map((x) => x.id === s.id ? { ...x, label: e.target.value } : x) } })} className="mt-2 w-full rounded-lg border border-[#f2e9e1]/15 bg-[#241c1d] px-3 py-1.5 text-[12px] text-[#f2e9e1]" />
                <div className="mt-2 grid grid-cols-3 gap-3">
                  <label className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-[#8f7d74]">Hue
                    <input type="range" min={0} max={360} value={s.h} onChange={(e) => configStore.setContent({ mirror: { ...cfg.mirror, shades: cfg.mirror.shades.map((x) => x.id === s.id ? { ...x, h: +e.target.value } : x) } })} className="range-luxe mt-1 w-full" /></label>
                  <label className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-[#8f7d74]">Sat
                    <input type="range" min={0} max={100} value={s.s} onChange={(e) => configStore.setContent({ mirror: { ...cfg.mirror, shades: cfg.mirror.shades.map((x) => x.id === s.id ? { ...x, s: +e.target.value } : x) } })} className="range-luxe mt-1 w-full" /></label>
                  <label className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-[#8f7d74]">Light
                    <input type="range" min={0} max={100} value={s.l} onChange={(e) => configStore.setContent({ mirror: { ...cfg.mirror, shades: cfg.mirror.shades.map((x) => x.id === s.id ? { ...x, l: +e.target.value } : x) } })} className="range-luxe mt-1 w-full" /></label>
                </div>
              </div>
            ))}
            <button onClick={() => configStore.setContent({ mirror: { ...cfg.mirror, shades: [...cfg.mirror.shades, { id: `shade-${Date.now().toString(36)}`, label: "New Shade", h: 30, s: 45, l: 55 }] } })} data-cursor="hand" className="mt-3 rounded-full border border-[#a8b5a0]/50 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[#a8b5a0] hover:bg-[#a8b5a0]/10">+ Add shade</button>

            <p className="font-mono mt-8 text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Engine</p>
            <SliderField label="Match range" value={cfg.mirror.tolerance} min={5} max={80} step={1} onChange={(v) => configStore.setContent({ mirror: { ...cfg.mirror, tolerance: v } })} />
            <ToggleField label="Protect skin tones" value={cfg.mirror.protectSkin} onChange={(v) => configStore.setContent({ mirror: { ...cfg.mirror, protectSkin: v } })} />
            <SliderField label="Default warmth" value={cfg.mirror.warmth} min={0} max={100} step={1} onChange={(v) => configStore.setContent({ mirror: { ...cfg.mirror, warmth: v } })} />
            <SliderField label="Default shine" value={cfg.mirror.shine} min={0} max={100} step={1} onChange={(v) => configStore.setContent({ mirror: { ...cfg.mirror, shine: v } })} />
          </div>
        )}

        {tab === "layout" && (
          <div className="mt-6">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Sections — toggle & reorder</p>
            {cfg.slots.map((s, i) => (
              <div key={s.uid} className="mt-3 flex items-center justify-between rounded-[1rem_1rem_0.3rem_1rem] border border-[#f2e9e1]/10 bg-[#1c1516] p-4">
                <span className="font-display text-lg capitalize text-[#f2e9e1]">{s.id}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => i > 0 && configStore.moveSlot(i, i - 1)} data-cursor="hand" aria-label="Move up" className="rounded-full border border-[#f2e9e1]/15 px-2.5 py-1 text-[#c0aea4] hover:text-[#f2e9e1] disabled:opacity-30" disabled={i === 0}>↑</button>
                  <button onClick={() => i < cfg.slots.length - 1 && configStore.moveSlot(i, i + 1)} data-cursor="hand" aria-label="Move down" className="rounded-full border border-[#f2e9e1]/15 px-2.5 py-1 text-[#c0aea4] hover:text-[#f2e9e1] disabled:opacity-30" disabled={i === cfg.slots.length - 1}>↓</button>
                  <ToggleField label="" value={s.enabled} onChange={() => configStore.toggleSlot(s.uid)} />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "system" && (
          <div className="mt-6">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Data</p>
            <button onClick={() => { configStore.resetAll(); toast("All settings reset to the demo defaults."); }} data-cursor="hand"
              className="mt-3 rounded-full border border-[#e3b6b6]/40 px-5 py-2.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[#e3b6b6] hover:bg-[#e3b6b6]/10">Reset everything to demo defaults</button>
            <p className="mt-6 text-[12px] leading-relaxed text-[#8f7d74]">
              Settings persist in this browser (mirroring the WP <span className="font-mono text-[#d9c25a]">luxe_config</span> option in the theme).
              In WordPress the same panel is the Customizer, gated to authorized users only.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
