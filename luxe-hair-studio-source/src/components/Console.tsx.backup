import { useState, useRef, useEffect } from "react";
import { configStore, useConfig, DEFAULT_DESIGN, PRESETS, type DesignConfig, type Slot, type CustomSectionData, type ServiceItem, type ServiceCat, type Stylist, type Package, type GalleryItem, type Testimonial, type Product, type Heading, type Amenity, type Stat, type QuizQuestion, type BookingAddon, type Tier, type MirrorMuse, type MirrorShade } from "../lib/config";
import { Ic, toast } from "./Ornaments";

type Tab = "design" | "content" | "mirror" | "layout" | "system" | "forms";
type SectionViewMode = "fullpage" | "isolated";

interface InspectorState {
  selectedType: "section" | "element" | null;
  selectedSectionUid: string | null;
  selectedElementId: string | null;
  selectedElementType: "heading" | "text" | "button" | "image" | "list-item" | null;
}

const SECTION_TYPES = [
  { id: "services", label: "Services Menu", icon: "menu" },
  { id: "transformations", label: "Transformations", icon: "image" },
  { id: "stylists", label: "Stylists", icon: "users" },
  { id: "consultation", label: "AI Consultation", icon: "sparkle" },
  { id: "mirror", label: "Virtual Mirror", icon: "mirror" },
  { id: "booking", label: "Booking", icon: "calendar" },
  { id: "experience", label: "Experience", icon: "flower" },
  { id: "amenities", label: "Amenities", icon: "coffee" },
  { id: "marquee", label: "Marquee Ticker", icon: "trending" },
  { id: "stats", label: "Stats Counter", icon: "chart" },
  { id: "quiz", label: "Style Quiz", icon: "question" },
  { id: "tiers", label: "Pricing Tiers", icon: "layers" },
  { id: "booking-addons", label: "Booking Addons", icon: "bag" },
  { id: "custom", label: "Custom Section", icon: "plus" },
];

const MODULE_LIBRARY = [
  { category: "Basic", modules: [
    { id: "heading", label: "Heading", icon: "type" },
    { id: "text", label: "Text Block", icon: "paragraph" },
    { id: "button", label: "Button/CTA", icon: "pointer" },
    { id: "divider", label: "Divider", icon: "minus" },
    { id: "spacer", label: "Spacer", icon: "arrows-up-down" },
  ]},
  { category: "Media", modules: [
    { id: "image", label: "Image", icon: "image" },
    { id: "video", label: "Video", icon: "video" },
    { id: "icon", label: "Icon", icon: "star" },
  ]},
  { category: "Interactive", modules: [
    { id: "accordion", label: "Accordion", icon: "chevron-down" },
    { id: "tabs", label: "Tabs", icon: "layout" },
    { id: "form", label: "Form", icon: "mail" },
    { id: "search", label: "Search", icon: "search" },
  ]},
  { category: "Dynamic", modules: [
    { id: "testimonials", label: "Testimonials", icon: "quote" },
    { id: "team", label: "Team Members", icon: "users" },
    { id: "pricing", label: "Pricing Table", icon: "tag" },
    { id: "blog", label: "Blog Posts", icon: "file-text" },
    { id: "counters", label: "Counters", icon: "counter" },
    { id: "timeline", label: "Timeline", icon: "clock" },
    { id: "logo-carousel", label: "Logo Carousel", icon: "repeat" },
  ]},
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#f2e9e1]/8 py-2.5">
      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#c0aea4]">{label}</span>
      <div className="flex items-center gap-3">{children}</div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Row label={label}>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-7 w-10 cursor-pointer rounded border border-[#f2e9e1]/15 bg-transparent" />
      <span className="font-mono text-[10px] text-[#8f7d74]">{value}</span>
    </Row>
  );
}

function SliderField({ label, value, min, max, step, onChange, fmt }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; fmt?: (v: number) => string }) {
  return (
    <Row label={label}>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} className="range-luxe w-28" />
      <span className="font-mono w-12 text-right text-[10px] text-[#d9c25a]">{fmt ? fmt(value) : value}</span>
    </Row>
  );
}

function ToggleField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Row label={label}>
      <button onClick={() => onChange(!value)} data-cursor="hand" role="switch" aria-checked={value}
        className={`relative h-5 w-9 rounded-full border transition-colors ${value ? "border-[#a8b5a0] bg-[#a8b5a0]/30" : "border-[#f2e9e1]/20 bg-transparent"}`}>
        <span className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full transition-all ${value ? "left-5 bg-[#a8b5a0]" : "left-0.5 bg-[#8f7d74]"}`} />
      </button>
    </Row>
  );
}

function SectionToolbar({ section, onBack, onMoveUp, onMoveDown, onDuplicate, onDelete, onToggleVisibility }: { 
  section: Slot; 
  onBack: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
}) {
  const [deviceView, setDeviceView] = useState<"desktop" | "tablet" | "mobile">("desktop");
  
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#f2e9e1]/10 bg-[#241c1d]/95 px-6 py-3 backdrop-blur">
      <div className="flex items-center gap-4">
        <button onClick={onBack} data-cursor="hand" className="flex items-center gap-2 rounded-full border border-[#f2e9e1]/15 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#c0aea4] hover:text-[#f2e9e1]">
          <Ic.ChevronLeft className="h-3.5 w-3.5" /> Back to Full Page
        </button>
        <div className="h-5 w-px bg-[#f2e9e1]/10" />
        <span className="font-display text-lg capitalize text-[#f2e9e1]">{section.id}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-lg border border-[#f2e9e1]/15 bg-[#1c1516]">
          {(["desktop", "tablet", "mobile"] as const).map((device) => (
            <button
              key={device}
              onClick={() => setDeviceView(device)}
              data-cursor="hand"
              className={`p-2 transition-colors ${deviceView === device ? "text-[#d9c25a]" : "text-[#c0aea4] hover:text-[#f2e9e1]"}`}
              title={`${device} view`}
            >
              {device === "desktop" && <Ic.Monitor className="h-4 w-4" />}
              {device === "tablet" && <Ic.Tablet className="h-4 w-4" />}
              {device === "mobile" && <Ic.Smartphone className="h-4 w-4" />}
            </button>
          ))}
        </div>
        
        <div className="h-5 w-px bg-[#f2e9e1]/10" />
        
        <button onClick={onToggleVisibility} data-cursor="hand" className={`rounded-full border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] ${section.enabled ? "border-[#a8b5a0]/50 text-[#a8b5a0]" : "border-[#c98d8d]/50 text-[#c98d8d]"}`}>
          {section.enabled ? <><Ic.Eye className="mr-1 inline h-3.5 w-3.5" /> Visible</> : <><Ic.EyeOff className="mr-1 inline h-3.5 w-3.5" /> Hidden</>}
        </button>
        
        <button onClick={onMoveUp} data-cursor="hand" className="rounded-full border border-[#f2e9e1]/15 p-2 text-[#c0aea4] hover:text-[#f2e9e1]" title="Move Up">
          <Ic.ArrowUp className="h-4 w-4" />
        </button>
        <button onClick={onMoveDown} data-cursor="hand" className="rounded-full border border-[#f2e9e1]/15 p-2 text-[#c0aea4] hover:text-[#f2e9e1]" title="Move Down">
          <Ic.ArrowDown className="h-4 w-4" />
        </button>
        <button onClick={onDuplicate} data-cursor="hand" className="rounded-full border border-[#f2e9e1]/15 p-2 text-[#c0aea4] hover:text-[#f2e9e1]" title="Duplicate">
          <Ic.Copy className="h-4 w-4" />
        </button>
        <button onClick={onDelete} data-cursor="hand" className="rounded-full border border-[#e3b6b6]/40 p-2 text-[#e3b6b6] hover:bg-[#e3b6b6]/10" title="Delete">
          <Ic.Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function InspectorPanel({ inspector, onClose }: { inspector: InspectorState; onClose: () => void }) {
  const cfg = useConfig();
  const section = cfg.slots.find(s => s.uid === inspector.selectedSectionUid);
  
  if (!inspector.selectedSectionUid || !section) return null;
  
  return (
    <div className="w-80 border-l border-[#f2e9e1]/10 bg-[#241c1d] p-5 overflow-y-auto">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#d9c25a]">
          {inspector.selectedType === "section" ? "Section Settings" : "Element Settings"}
        </h3>
        <button onClick={onClose} data-cursor="hand" className="text-[#c0aea4] hover:text-[#f2e9e1]">
          <Ic.X className="h-4 w-4" />
        </button>
      </div>
      
      {inspector.selectedType === "section" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#f2e9e1]/10 bg-[#1c1516] p-4">
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#8f7d74] mb-3">Layout</p>
            <Row label="Width">
              <select className="rounded border border-[#f2e9e1]/15 bg-[#241c1d] px-2 py-1 text-[10px] text-[#f2e9e1]">
                <option>Full Width</option>
                <option>Contained</option>
                <option>Custom</option>
              </select>
            </Row>
            <SliderField label="Max Width" value={1200} min={960} max={1600} step={40} onChange={() => {}} fmt={(v) => `${v}px`} />
            <Row label="Columns">
              <input type="number" min={1} max={12} defaultValue={1} className="w-16 rounded border border-[#f2e9e1]/15 bg-[#241c1d] px-2 py-1 text-[10px] text-[#f2e9e1]" />
            </Row>
          </div>
          
          <div className="rounded-lg border border-[#f2e9e1]/10 bg-[#1c1516] p-4">
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#8f7d74] mb-3">Spacing</p>
            <SliderField label="Padding Top" value={80} min={0} max={200} step={10} onChange={() => {}} fmt={(v) => `${v}px`} />
            <SliderField label="Padding Bottom" value={80} min={0} max={200} step={10} onChange={() => {}} fmt={(v) => `${v}px`} />
          </div>
          
          <div className="rounded-lg border border-[#f2e9e1]/10 bg-[#1c1516] p-4">
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#8f7d74] mb-3">Background</p>
            <ColorField label="Color" value="#241c1d" onChange={() => {}} />
            <Row label="Image">
              <button data-cursor="hand" className="rounded border border-[#f2e9e1]/15 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#c0aea4] hover:text-[#f2e9e1]">
                Upload
              </button>
            </Row>
          </div>
          
          <div className="rounded-lg border border-[#f2e9e1]/10 bg-[#1c1516] p-4">
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#8f7d74] mb-3">Animation</p>
            <Row label="Entrance">
              <select className="rounded border border-[#f2e9e1]/15 bg-[#241c1d] px-2 py-1 text-[10px] text-[#f2e9e1]">
                <option>Fade In</option>
                <option>Slide Up</option>
                <option>Zoom</option>
                <option>None</option>
              </select>
            </Row>
            <SliderField label="Duration" value={600} min={200} max={2000} step={100} onChange={() => {}} fmt={(v) => `${v}ms`} />
          </div>
        </div>
      )}
      
      {inspector.selectedType === "element" && inspector.selectedElementType === "heading" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#f2e9e1]/10 bg-[#1c1516] p-4">
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#8f7d74] mb-3">Typography</p>
            <Row label="Tag">
              <select className="rounded border border-[#f2e9e1]/15 bg-[#241c1d] px-2 py-1 text-[10px] text-[#f2e9e1]">
                <option>H1</option>
                <option>H2</option>
                <option>H3</option>
                <option>H4</option>
                <option>p</option>
              </select>
            </Row>
            <SliderField label="Font Size" value={48} min={12} max={96} step={2} onChange={() => {}} fmt={(v) => `${v}px`} />
            <ColorField label="Color" value="#f2e9e1" onChange={() => {}} />
          </div>
          
          <div className="rounded-lg border border-[#f2e9e1]/10 bg-[#1c1516] p-4">
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#8f7d74] mb-3">Spacing</p>
            <SliderField label="Margin Bottom" value={24} min={0} max={100} step={4} onChange={() => {}} fmt={(v) => `${v}px`} />
          </div>
        </div>
      )}
      
      {inspector.selectedType === "element" && inspector.selectedElementType === "button" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#f2e9e1]/10 bg-[#1c1516] p-4">
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#8f7d74] mb-3">Content</p>
            <Row label="Text">
              <input type="text" defaultValue="Book Now" className="w-full rounded border border-[#f2e9e1]/15 bg-[#241c1d] px-2 py-1.5 text-[11px] text-[#f2e9e1]" />
            </Row>
            <Row label="Link URL">
              <input type="text" defaultValue="#booking" className="w-full rounded border border-[#f2e9e1]/15 bg-[#241c1d] px-2 py-1.5 text-[11px] text-[#f2e9e1]" />
            </Row>
            <ToggleField label="Open in new tab" value={false} onChange={() => {}} />
          </div>
          
          <div className="rounded-lg border border-[#f2e9e1]/10 bg-[#1c1516] p-4">
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#8f7d74] mb-3">Style</p>
            <Row label="Variant">
              <select className="rounded border border-[#f2e9e1]/15 bg-[#241c1d] px-2 py-1 text-[10px] text-[#f2e9e1]">
                <option>Solid</option>
                <option>Outline</option>
                <option>Gradient</option>
                <option>Ghost</option>
              </select>
            </Row>
            <ColorField label="Background" value="#d9c25a" onChange={() => {}} />
            <ColorField label="Text" value="#241c1d" onChange={() => {}} />
          </div>
        </div>
      )}
      
      {inspector.selectedType === "element" && inspector.selectedElementType === "image" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#f2e9e1]/10 bg-[#1c1516] p-4">
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#8f7d74] mb-3">Source</p>
            <Row label="Image">
              <button data-cursor="hand" className="w-full rounded border border-[#f2e9e1]/15 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-[#c0aea4] hover:text-[#f2e9e1]">
                <Ic.Upload className="mr-2 inline h-3.5 w-3.5" /> Upload / Replace
              </button>
            </Row>
            <Row label="Alt Text">
              <input type="text" placeholder="Describe the image" className="w-full rounded border border-[#f2e9e1]/15 bg-[#241c1d] px-2 py-1.5 text-[11px] text-[#f2e9e1]" />
            </Row>
          </div>
          
          <div className="rounded-lg border border-[#f2e9e1]/10 bg-[#1c1516] p-4">
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#8f7d74] mb-3">Appearance</p>
            <SliderField label="Width" value={100} min={20} max={100} step={5} onChange={() => {}} fmt={(v) => `${v}%`} />
            <SliderField label="Radius" value={0.5} min={0} max={2} step={0.1} onChange={() => {}} fmt={(v) => `${v}×`} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Console({ onClose }: { onClose: () => void }) {
  const cfg = useConfig();
  const [tab, setTab] = useState<Tab>("design");
  const d = cfg.design;
  const set = (patch: Partial<DesignConfig>) => configStore.setDesign(patch);
  const TABS: { id: Tab; label: string }[] = [
    { id: "design", label: "Design" }, { id: "content", label: "Content" }, { id: "mirror", label: "Mirror" }, { id: "layout", label: "Sections" }, { id: "system", label: "System" }, { id: "forms", label: "Forms" },
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

        {tab === "forms" && <FormSettingsPanel />}
      </div>
    </div>
  );
}

interface FormSettingsState {
  emailRecipient: string;
  emailSubject: string;
  successMessage: string;
  errorMessage: string;
  fromName: string;
  saveSubmissions: boolean;
}

function FormSettingsPanel() {
  const [settings, setSettings] = useState<FormSettingsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/wp-json/luxe/v1/form/settings')
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await fetch('/wp-json/luxe/v1/form/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      toast('Form settings saved!');
    } catch {
      toast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="mt-6 text-center text-[#8f7d74]">Loading...</div>;
  }

  return (
    <div className="mt-6 space-y-6">
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74] mb-4">Email Configuration</p>
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] text-[#c0aea4] mb-1">Recipient Email</label>
            <input
              type="email"
              value={settings?.emailRecipient || ''}
              onChange={(e) => setSettings({ ...settings!, emailRecipient: e.target.value })}
              className="w-full rounded-lg border border-[#f2e9e1]/15 bg-[#1c1516] px-3 py-2 text-[12px] text-[#f2e9e1]"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[#c0aea4] mb-1">Email Subject</label>
            <input
              type="text"
              value={settings?.emailSubject || ''}
              onChange={(e) => setSettings({ ...settings!, emailSubject: e.target.value })}
              className="w-full rounded-lg border border-[#f2e9e1]/15 bg-[#1c1516] px-3 py-2 text-[12px] text-[#f2e9e1]"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[#c0aea4] mb-1">From Name</label>
            <input
              type="text"
              value={settings?.fromName || ''}
              onChange={(e) => setSettings({ ...settings!, fromName: e.target.value })}
              className="w-full rounded-lg border border-[#f2e9e1]/15 bg-[#1c1516] px-3 py-2 text-[12px] text-[#f2e9e1]"
            />
          </div>
        </div>
      </div>

      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74] mb-4">Messages</p>
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] text-[#c0aea4] mb-1">Success Message</label>
            <textarea
              value={settings?.successMessage || ''}
              onChange={(e) => setSettings({ ...settings!, successMessage: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-[#f2e9e1]/15 bg-[#1c1516] px-3 py-2 text-[12px] text-[#f2e9e1]"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[#c0aea4] mb-1">Error Message</label>
            <textarea
              value={settings?.errorMessage || ''}
              onChange={(e) => setSettings({ ...settings!, errorMessage: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-[#f2e9e1]/15 bg-[#1c1516] px-3 py-2 text-[12px] text-[#f2e9e1]"
            />
          </div>
        </div>
      </div>

      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74] mb-4">Options</p>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings?.saveSubmissions || false}
            onChange={(e) => setSettings({ ...settings!, saveSubmissions: e.target.checked })}
            className="h-4 w-4 rounded border-[#f2e9e1]/15 bg-[#1c1516] text-[#d9c25a]"
          />
          <span className="text-[11px] text-[#c0aea4]">Save submissions to database</span>
        </label>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-full border border-[#d9c25a]/60 bg-[#d9c25a]/10 px-5 py-3 font-mono text-[9px] uppercase tracking-[0.16em] text-[#d9c25a] disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>

      <p className="text-[11px] text-[#8f7d74]">
        Configure how form submissions are handled. All selections from dependent dropdowns (service, stylist, date, time, quiz answers, consultation details) will be included in the email sent to the admin.
      </p>
    </div>
  );
}
