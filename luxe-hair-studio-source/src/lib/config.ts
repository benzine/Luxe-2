/* ── Luxe config store ───────────────────────────────────────────
   The single source of truth for design + content. Persists to
   localStorage (mirrors the WP `luxe_config` option in the theme). */
import { useSyncExternalStore } from "react";
import { IMG } from "./images";

export interface DesignConfig {
  rose: string; roseDeep: string; gold: string; sage: string; accent: string;
  radius: number; baseFontSize: number; density: number; animSpeed: number; heroScrollSpeed: number;
  displayFont: "cormorant" | "fraunces" | "playfair";
  grain: boolean; motion: boolean; cursor: boolean; contrast: boolean;
  dockRight: boolean; dockLeft: boolean;
}

export interface Stage { kicker: string; line1: string; line2: string; sub: string; image: string; accent: string; }
export interface ServiceItem { name: string; desc: string; dur: number; price: number; }
export interface ServiceCat { label: string; note: string; items: ServiceItem[]; }
export interface Stylist { id: string; name: string; title: string; specialty: string; personality: string; quote: string; img: string; }
export interface Package { name: string; tag: string; desc: string; dur: string; price: number; }
export interface GalleryItem { id: number; title: string; kind: string; stylist: string; quote: string; image: string; }
export interface Testimonial { quote: string; name: string; service: string; stars: number; }
export interface Product { name: string; kind: string; desc: string; price: number; }
export interface Heading { title: string; italic: string; desc: string; }
export interface Amenity { icon: string; title: string; desc: string; }
export interface Scent { name: string; note: string; }
export interface Stat { value: string; label: string; }
export interface QuizQuestion { id: string; q: string; options: { label: string; score: Record<string, number>; }[]; }
export interface BookingAddon { name: string; desc: string; price: number; icon: string; }
export interface Tier { name: string; level: string; cutPrice: number; colourPrice: number; desc: string; }

/* A custom (admin-added) section. When present on a slot, the slot renders
   this instead of a built-in section. */
export interface CustomSectionData {
  kind: "info" | "cta" | "text";
  title: string;
  italic?: string;
  body: string;
  image?: string;       /* relative path (/images/x.jpg), data-url, or absolute */
  buttonText?: string;
  buttonTarget?: string; /* section id to scroll to, e.g. "booking" */
  accent?: string;
}

export interface Slot { uid: string; id: string; enabled: boolean; custom?: CustomSectionData; }

export interface MirrorShade { id: string; label: string; h: number; s: number; l: number; }
export interface MirrorMuse { id: string; label: string; image: string; hair: string; }
export interface MirrorConfig {
  models: MirrorMuse[];
  shades: MirrorShade[];
  tolerance: number; protectSkin: boolean; warmth: number; shine: number;
}

export interface SiteConfig {
  design: DesignConfig;
  stages: Stage[];
  services: ServiceCat[];
  stylists: Stylist[];
  packages: Package[];
  gallery: GalleryItem[];
  testimonials: Testimonial[];
  products: Product[];
  headings: Record<string, Heading>;
  slots: Slot[];
  mirror: MirrorConfig;
  salon: { name: string; address: string; city: string; phone: string; email: string; word: string; sub: string; copyright: string };
  /* Admin-editable UI text. Keys are dot-namespaced; any key not set falls
     back to the built-in default (and then to the i18n layer). */
  labels: Record<string, string>;
  /* Admin-editable images. Values may be a relative path ("/images/x.jpg"),
     a data-url (from an upload) or an absolute URL. Components call
     useImage(key), which falls back to the bundled IMG map when unset. */
  images: Record<string, string>;
  /* New sections for amenities, scents, stats, quiz, booking addons, tiers */
  amenities: Amenity[];
  scents: Scent[];
  marqueeWords: string[];
  stats: Stat[];
  quizQuestions: QuizQuestion[];
  bookingAddons: BookingAddon[];
  tiers: Tier[];
}

const sp = (): Slot => ({ uid: "", id: "", enabled: true });

/* ── Admin-editable UI text (default copy) ──
   Every string a visitor reads has a key here. The admin overrides any key
   in the Console → Text tab; components read it via useLabel(key). */
export const DEFAULT_LABELS: Record<string, string> = {
  /* nav */
  "nav.services": "Services", "nav.transformations": "Transformations", "nav.stylists": "Stylists",
  "nav.consultation": "Consultation", "nav.mirror": "The Mirror", "nav.booking": "Booking",
  "nav.book": "Book",
  /* hero */
  "hero.cta": "Book your transformation", "hero.wander": "or wander the menu",
  "hero.scrollHint": "scroll to begin the cut",
  /* section eyebrows */
  "eyebrow.services": "The Service Menu", "eyebrow.packages": "Signature Packages",
  "eyebrow.transformations": "Transformations", "eyebrow.stylists": "The Atelier Team",
  "eyebrow.consultation": "AI Hair Consultation", "eyebrow.mirror": "The Virtual Mirror",
  "eyebrow.booking": "Reserve a Chair", "eyebrow.experience": "The Sensory Salon",
  "eyebrow.apothecary": "The Apothecary",
  "packages.title": "Three ways to", "packages.italic": "disappear for an afternoon",
  "apothecary.title": "Take the ritual", "apothecary.italic": "home with you",
  "apothecary.desc": "Salon-exclusive formulas, mixed in small batches.",
  /* booking */
  "booking.step1": "Service", "booking.step2": "Stylist", "booking.step3": "Date & time", "booking.step4": "Your details",
  "booking.anyStylist": "Any available", "booking.confirm": "Confirm booking", "booking.back": "← Back",
  "booking.namePh": "Your name", "booking.emailPh": "Email", "booking.phonePh": "Phone (optional)",
  "booking.extras": "Little extras", "booking.paySalon": "Pay at salon", "booking.payCard": "Card on the day",
  /* gallery */
  "gallery.before": "Before", "gallery.after": "After", "gallery.by": "by",
  "gallery.all": "All", "gallery.startCta": "Start my transformation",
  /* mirror */
  "mirror.book": "Book this shade", "mirror.save": "Save the look", "mirror.hold": "hold · before",
  "mirror.warmth": "Warmth", "mirror.shine": "Shine", "mirror.match": "Match range",
  /* consultation */
  "consult.start": "Begin consultation", "consult.book": "Book this look",
  /* concierge / docks */
  "dock.bookNow": "Book now", "dock.concierge": "Concierge", "dock.backTop": "Back to top",
  "dock.lang": "Language", "dock.textSize": "Text size", "dock.contrast": "High contrast",
  "dock.motion": "Reduce motion", "dock.access": "Accessibility & language",
  "concierge.title": "The Concierge", "concierge.placeholder": "Ask the concierge…",
  "concierge.greeting": "Good day — I'm the Luxe concierge. Prices, hours, stylists, bookings: ask away.",
  /* footer */
  "footer.explore": "Explore", "footer.newsTitle": "Hair wisdom, weekly",
  "footer.newsDesc": "One elegant email a week — care rituals, trend forecasts, first dibs on cancelled chairs.",
  "footer.join": "Join", "footer.newsDone": "Welcome in — your first letter arrives Sunday.",
  "footer.takeHome": "Take the salon home",
  "footer.themeBtn": "Download theme (.zip)", "footer.settingsBtn": "Download settings (.json)",
  "footer.sourceBtn": "Download source (.zip)", "footer.compiledBtn": "Download compiled site (.zip)",
  "footer.privacy": "Privacy", "footer.terms": "Terms",
  /* console */
  "console.title": "Atelier Console",
};

/* Image slots the admin can point at their own files. Empty by default so
   useImage() falls back to the bundled editorial photography. */
export const DEFAULT_IMAGES: Record<string, string> = {
  heroBefore: "", heroAfter: "", salon: "", amara: "", sofia: "", elena: "", bride: "", color: "",
};

export const DEFAULT_MIRROR: MirrorConfig = {
  models: [
    { id: "muse", label: "Muse · Natural", image: IMG.heroBefore, hair: "#6b4f3a" },
    { id: "muse2", label: "Muse · Waves", image: IMG.heroAfter, hair: "#c98d6b" },
    { id: "muse3", label: "Muse · Colour", image: IMG.color, hair: "#b47462" },
  ],
  shades: [
    { id: "natural", label: "Natural", h: 28, s: 38, l: 42 },
    { id: "champagne", label: "Champagne", h: 40, s: 52, l: 66 },
    { id: "rosewater", label: "Rosewater", h: 8, s: 45, l: 62 },
    { id: "copper", label: "Warm Copper", h: 18, s: 62, l: 48 },
    { id: "glacier", label: "Glacier Blonde", h: 48, s: 24, l: 78 },
    { id: "espresso", label: "Espresso Gloss", h: 22, s: 30, l: 22 },
    { id: "platinum", label: "Cool Platinum", h: 220, s: 10, l: 82 },
  ],
  tolerance: 38, protectSkin: true, warmth: 40, shine: 45,
};

export const DEFAULT_DESIGN: DesignConfig = {
  rose: "#D4A5A5", roseDeep: "#A67B7B", gold: "#C9B037", sage: "#A8B5A0", accent: "#C9B037",
  radius: 1, baseFontSize: 16, density: 1, animSpeed: 1, heroScrollSpeed: 1.5,
  displayFont: "cormorant", grain: true, motion: true, cursor: true, contrast: false,
  dockRight: true, dockLeft: true,
};

export const DEFAULT_CONFIG: SiteConfig = {
  design: { ...DEFAULT_DESIGN },
  stages: [
    { kicker: "01 · The Natural", line1: "Every masterpiece", line2: "begins au naturel.", sub: "Real hair, honest light, zero pretence. Your story starts exactly as you are.", image: IMG.heroBefore, accent: "#c9b037" },
    { kicker: "02 · The Colour", line1: "Colour, painted", line2: "like liquid light.", sub: "Hand-drawn balayage in warm copper and rose — dimension where the sun would find it.", image: IMG.color, accent: "#e0b2b2" },
    { kicker: "03 · The Reveal", line1: "And then —", line2: "the reveal.", sub: "Champagne waves with a memory of their own. You arrived as yourself, polished.", image: IMG.heroAfter, accent: "#f5e6d3" },
    { kicker: "04 · The Atelier", line1: "For the days", line2: "that matter most.", sub: "Bridal artistry, trials and timelines — calm hands for the loudest morning.", image: IMG.bride, accent: "#a8b5a0" },
  ],
  services: [
    { label: "Cut & Styling", note: "Every cut opens with a consultation and closes with a finish lesson.", items: [
      { name: "Signature Cut & Finish", desc: "Consultation, precision cut, luxury wash & blow-dry.", dur: 75, price: 110 },
      { name: "Restyle & Reinvent", desc: "A full silhouette change — bring references, leave transformed.", dur: 105, price: 145 },
      { name: "Blowout & Waves", desc: "Round-brush silk, editorial volume, red-carpet finish.", dur: 60, price: 78 },
    ] },
    { label: "Colour & Highlights", note: "Hand-painted, never foiled by numbers. Olaplex in every formula.", items: [
      { name: "Full Balayage", desc: "Hand-painted dimension, root melt, gloss finish.", dur: 180, price: 240 },
      { name: "Global Colour", desc: "Single-process richness, root to tip, gloss sealed.", dur: 105, price: 145 },
      { name: "Colour Correction", desc: "The rescue mission. Strand tests and honest timelines.", dur: 240, price: 340 },
    ] },
    { label: "Treatments & Rituals", note: "Warm towels, scalp massage, and formulas worth the quiet.", items: [
      { name: "Bond Repair Therapy", desc: "Olaplex rebuild for colour-processed, heat-weary hair.", dur: 45, price: 70 },
      { name: "Scalp Detox Ritual", desc: "Exfoliation, lymphatic massage, ten quiet minutes.", dur: 50, price: 72 },
    ] },
    { label: "Bridal & Events", note: "Trials, timelines and a calm chair on the morning itself.", items: [
      { name: "Bridal Trial", desc: "A full run-through with photos, pins and honest notes.", dur: 90, price: 120 },
      { name: "Wedding-Day Styling", desc: "On-site or in-atelier, with reception touch-up kit.", dur: 120, price: 230 },
    ] },
  ],
  stylists: [
    { id: "amara", name: "Amara Okafor", title: "Master Stylist · Texture", specialty: "Textured & coily hair", personality: "Warm, attentive, quietly brilliant", quote: "Your curls have a memory. I just help them remember.", img: IMG.amara },
    { id: "sofia", name: "Sofia Reyes", title: "Colour Director", specialty: "Balayage & colour correction", personality: "Bold, creative, endlessly curious", quote: "Colour is light you get to keep.", img: IMG.sofia },
    { id: "elena", name: "Elena Marchetti", title: "Founder · Editorial", specialty: "Editorial styling & bridal", personality: "Precise, calming, quietly opinionated", quote: "A haircut should argue with no one and flatter everyone.", img: IMG.elena },
  ],
  packages: [
    { name: "The Full Makeover", tag: "Most booked", desc: "Restyle, balayage, bond repair and a gloss finish — one long, luxurious afternoon with champagne.", dur: "4h 30m", price: 380 },
    { name: "Bridal Suite", tag: "For the big day", desc: "Trial, wedding-day hair and makeup, bridesmaid discount and a calm morning with your own stylist.", dur: "Trial + day-of", price: 495 },
    { name: "Colour Reset", tag: "The rescue", desc: "Correction consultation, strand tests, the correction itself and two follow-up gloss visits.", dur: "Two visits", price: 460 },
  ],
  gallery: [
    { id: 1, title: "Rosewater Balayage", kind: "colour", stylist: "Sofia", quote: "I caught my reflection and didn't recognise her — in the best way.", image: IMG.color },
    { id: 2, title: "The Bridal Chignon", kind: "bridal", stylist: "Elena", quote: "It survived rain, tears and an hour of dancing.", image: IMG.bride },
    { id: 3, title: "Champagne Reveal", kind: "colour", stylist: "Sofia", quote: "Strangers ask where I holiday. It's a haircut, not a holiday.", image: IMG.heroAfter },
    { id: 4, title: "The Natural Study", kind: "cut", stylist: "Amara", quote: "Amara listened for twenty minutes before she lifted a section.", image: IMG.heroBefore },
  ],
  testimonials: [
    { quote: "I've chased this exact shade for six years and three salons. Sofia mixed it on the first try.", name: "Charlotte H.", service: "Full Balayage", stars: 5 },
    { quote: "Amara gave my curls their dignity back. I cried a little. She pretended not to notice.", name: "Priya S.", service: "Restyle & Reinvent", stars: 5 },
    { quote: "Elena ran the morning like a conductor — calm, precise, and the chignon outlasted a storm.", name: "Megan & Tom", service: "Bridal Suite", stars: 5 },
  ],
  products: [
    { name: "Silk No. 9 Shampoo", kind: "Daily care · 250ml", desc: "Sulfate-free cleanse with rice protein and a whisper of jasmine.", price: 34 },
    { name: "Cloud Rinse", kind: "Conditioner · 250ml", desc: "Weightless slip and marshmallow-root softness, mid-lengths to ends.", price: 36 },
    { name: "Liquid Shine Serum", kind: "Finishing · 50ml", desc: "Glass-hair gloss with heat protection to 230°. Two drops, no more.", price: 42 },
  ],
  headings: {
    services: { title: "Craft, priced", italic: "with honesty.", desc: "Three tiers — Junior, Senior, Master — one uncompromising ritual." },
    transformations: { title: "Drag the parting,", italic: "meet the after.", desc: "Real clients, real chairs, no retouching. Slide each golden parting back to the before." },
    stylists: { title: "Hands you can", italic: "trust blindly.", desc: "Three philosophies, one standard. Hover to meet them — or let the matchmaker decide." },
    consultation: { title: "Your hair, read", italic: "like a novel.", desc: "Five questions and three complete looks — services, stylist, time and honest pricing." },
    mirror: { title: "Step up to", italic: "the mirror.", desc: "Pick a muse, pour a shade, and watch real hair take real colour — on-device, private, instant." },
    booking: { title: "Your appointment,", italic: "four small steps.", desc: "Live availability, honest durations, and a confirmation code you'll remember." },
    experience: { title: "You'll remember", italic: "how it felt.", desc: "Linen-warm light, good scissors, and our signature scent." },
  },
  slots: [
    { ...sp(), uid: "sl-services", id: "services" },
    { ...sp(), uid: "sl-gallery", id: "transformations" },
    { ...sp(), uid: "sl-stylists", id: "stylists" },
    { ...sp(), uid: "sl-consult", id: "consultation" },
    { ...sp(), uid: "sl-mirror", id: "mirror" },
    { ...sp(), uid: "sl-booking", id: "booking" },
    { ...sp(), uid: "sl-experience", id: "experience" },
    { ...sp(), uid: "sl-amenities", id: "amenities" },
    { ...sp(), uid: "sl-marquee", id: "marquee" },
    { ...sp(), uid: "sl-stats", id: "stats" },
    { ...sp(), uid: "sl-quiz", id: "quiz" },
    { ...sp(), uid: "sl-tiers", id: "tiers" },
    { ...sp(), uid: "sl-booking-addons", id: "booking-addons" },
  ],
  mirror: structuredClone(DEFAULT_MIRROR),
  salon: {
    name: "Luxe Hair Studio", address: "12 Rosewater Lane", city: "Mayfair, London W1K",
    phone: "+44 20 7946 0958", email: "hello@luxehairstudio.co.uk",
    word: "LUXE", sub: "Hair Studio", copyright: "Crafted strand by strand — a flagship salon experience.",
  },
  labels: { ...DEFAULT_LABELS },
  images: { ...DEFAULT_IMAGES },
  amenities: [
    { icon: "coffee", title: "Coffee & tea cart", desc: "Single-origin espresso, jasmine pearls, oat anything." },
    { icon: "flower", title: "Fresh flowers, weekly", desc: "The peonies arrive every Tuesday. It's a whole event." },
    { icon: "drop", title: "Head massage rituals", desc: "Warm oil and ten minutes that erase the week." },
    { icon: "gem", title: "Quiet alcove chairs", desc: "Two chairs behind the arch, for introverts and naps." },
  ],
  scents: [
    { name: "Lavender", note: "Calming" },
    { name: "Jasmine", note: "Uplifting" },
    { name: "Warm vanilla", note: "Comforting" },
    { name: "Bergamot", note: "Energizing" },
    { name: "Fresh linen", note: "Clean" },
  ],
  marqueeWords: ["Precision Cuts", "Balayage & Colour", "Bridal Artistry", "Scalp Rituals", "Editorial Styling", "Liquid Shine", "The Quiet Luxury"],
  stats: [
    { value: "12+", label: "Years of craft" },
    { value: "8k+", label: "Happy clients" },
    { value: "15", label: "Awards won" },
    { value: "100%", label: "Dedication" },
  ],
  quizQuestions: [
    { id: "texture", q: "What's your hair texture?", options: [{ label: "Fine", score: { amara: 1, sofia: 2, elena: 1 } }, { label: "Medium", score: { amara: 2, sofia: 2, elena: 2 } }, { label: "Coarse/Coily", score: { amara: 3, sofia: 1, elena: 1 } }] },
    { id: "goal", q: "What's your goal?", options: [{ label: "Low maintenance", score: { amara: 1, sofia: 1, elena: 2 } }, { label: "Bold change", score: { amara: 1, sofia: 3, elena: 2 } }, { label: "Special event", score: { amara: 1, sofia: 1, elena: 3 } }] },
  ],
  bookingAddons: [
    { name: "Express scalp treatment", desc: "10-min detox massage", price: 25, icon: "sparkle" },
    { name: "Bond repair booster", desc: "Olaplex stand-alone", price: 35, icon: "drop" },
    { name: "Take-home styling kit", desc: "Mini products to recreate the look", price: 45, icon: "bag" },
    { name: "Champagne upgrade", desc: "Dom Pérignon at the basin", price: 55, icon: "glass" },
  ],
  tiers: [
    { name: "Junior", level: "Rising talent", cutPrice: 85, colourPrice: 180, desc: "Recently certified, endlessly passionate. Trained in our signature methods." },
    { name: "Senior", level: "Chair leader", cutPrice: 110, colourPrice: 240, desc: "Five years plus, with a book full of regulars. Precision meets intuition." },
    { name: "Master", level: "Atelier head", cutPrice: 140, colourPrice: 310, desc: "Fifteen years minimum. The hands behind our award-winning transformations." },
  ],
};

/* ── store ── */
const KEY = "luxe-config-v4";
let state: SiteConfig = load();
const listeners = new Set<() => void>();

function load(): SiteConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<SiteConfig>;
      const base = structuredClone(DEFAULT_CONFIG);
      /* Guarantee every default section slot survives an older saved config
         (e.g. one saved before The Mirror existed). */
      const savedSlots = Array.isArray(p.slots) ? p.slots : [];
      const slots = [...savedSlots];
      for (const d of base.slots) {
        if (!slots.some((s) => s.id === d.id)) slots.push({ ...d });
      }
      return {
        ...base,
        ...p,
        slots,
        /* heroScrollSpeed 3 was the old default and scrolled far too slowly —
           anyone still on it gets the new, normal pace automatically. */
        design: { ...DEFAULT_DESIGN, ...(p.design ?? {}), ...(p.design?.heroScrollSpeed === 3 ? { heroScrollSpeed: 1.5 } : {}) },
        mirror: { ...structuredClone(DEFAULT_MIRROR), ...(p.mirror ?? {}) },
        salon: { ...DEFAULT_CONFIG.salon, ...(p.salon ?? {}) },
        labels: { ...DEFAULT_LABELS, ...(p.labels ?? {}) },
        images: { ...DEFAULT_IMAGES, ...(p.images ?? {}) },
      };
    }
  } catch { /* corrupted — defaults */ }
  return structuredClone(DEFAULT_CONFIG);
}
function emit() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode */ }
  applyDesign(state.design);
  listeners.forEach((fn) => fn());
}

export function applyDesign(d: DesignConfig) {
  const el = document.documentElement;
  const set = (k: string, v: string) => el.style.setProperty(k, v);
  set("--rose", d.rose); set("--rose-deep", d.roseDeep); set("--gold", d.gold); set("--sage", d.sage);
  set("--ru", String(d.radius)); set("--speed", String(d.animSpeed));
  el.style.fontSize = `${(d.baseFontSize * d.density).toFixed(2)}px`;
  set("--display-font", d.displayFont === "fraunces" ? '"Fraunces", Georgia, serif' : d.displayFont === "playfair" ? '"Playfair Display", Georgia, serif' : '"Cormorant Garamond", Georgia, serif');
  el.classList.toggle("anim-off", !d.motion);
  el.classList.toggle("high-contrast", d.contrast);
}

export const configStore = {
  subscribe: (fn: () => void) => { listeners.add(fn); return () => listeners.delete(fn); },
  get: (): SiteConfig => state,
  setDesign: (patch: Partial<DesignConfig>) => { state = { ...state, design: { ...state.design, ...patch } }; emit(); },
  setSalon: (patch: Partial<SiteConfig["salon"]>) => { state = { ...state, salon: { ...state.salon, ...patch } }; emit(); },
  setContent: (patch: Partial<Omit<SiteConfig, "design" | "salon">>) => { state = { ...state, ...patch }; emit(); },
  toggleSlot: (uid: string) => { state = { ...state, slots: state.slots.map((s) => (s.uid === uid ? { ...s, enabled: !s.enabled } : s)) }; emit(); },
  moveSlot: (from: number, to: number) => {
    const arr = [...state.slots];
    const [it] = arr.splice(from, 1);
    arr.splice(to, 0, it);
    state = { ...state, slots: arr }; emit();
  },
  /* labels */
  setLabel: (key: string, value: string) => {
    state = { ...state, labels: { ...state.labels, [key]: value } }; emit();
  },
  /* images (relative path, data-url or absolute url) */
  setImage: (key: string, value: string) => {
    state = { ...state, images: { ...state.images, [key]: value } }; emit();
  },
  /* custom sections */
  addCustomSlot: (custom: CustomSectionData) => {
    const slot: Slot = { uid: `sl-custom-${Date.now().toString(36)}`, id: "custom", enabled: true, custom };
    state = { ...state, slots: [...state.slots, slot] }; emit();
  },
  updateSlotCustom: (uid: string, patch: Partial<CustomSectionData>) => {
    state = { ...state, slots: state.slots.map((s) => (s.uid === uid && s.custom ? { ...s, custom: { ...s.custom, ...patch } } : s)) }; emit();
  },
  removeSlot: (uid: string) => { state = { ...state, slots: state.slots.filter((s) => s.uid !== uid) }; emit(); },
  duplicateSlot: (uid: string) => {
    const src = state.slots.find((s) => s.uid === uid);
    if (!src) return;
    const copy: Slot = { ...structuredClone(src), uid: `${src.uid}-copy-${Date.now().toString(36)}` };
    const i = state.slots.findIndex((s) => s.uid === uid);
    const arr = [...state.slots];
    arr.splice(i + 1, 0, copy);
    state = { ...state, slots: arr }; emit();
  },
  setSlots: (slots: Slot[]) => { state = { ...state, slots }; emit(); },
  resetAll: () => { state = structuredClone(DEFAULT_CONFIG); emit(); },
};

export function useConfig(): SiteConfig {
  return useSyncExternalStore(configStore.subscribe, configStore.get);
}

/* Admin-editable UI text. Falls back to DEFAULT_LABELS, then the provided
   fallback (used by the i18n layer for EN copy). */
export function useLabel() {
  const cfg = useConfig();
  return (key: string, fallback?: string) => cfg.labels[key] ?? DEFAULT_LABELS[key] ?? fallback ?? key;
}

/* Admin-editable images. Falls back to the bundled editorial photography. */
export function useImage() {
  const cfg = useConfig();
  return (key: string, fallback: string) => cfg.images[key] || fallback;
}

/* Full settings + content snapshot for export (settings.json / theme ZIP). */
export function fullDataPackage() {
  return { version: 5, exportedAt: new Date().toISOString(), config: configStore.get() };
}

/* Read an image file, downscale to a max edge, and return a data-url so the
   upload travels with the settings export (fully self-contained). */
export function fileToDataUrl(file: File, maxEdge = 1400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas unavailable"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.88));
      };
      img.onerror = () => reject(new Error("not an image"));
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
