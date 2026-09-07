import { useCallback, useSyncExternalStore } from "react";

/* ── Multilingual layer ──────────────────────────────────────────
   Components call `t(key, englishFallback)`. In English the fallback
   (the admin-authored/config value) wins, so the backoffice stays the
   source of truth. In other languages the dictionary wins, falling
   back to English when a string isn't translated. */

export type Lang = "en" | "es" | "fr" | "de";
export const LANGS: { id: Lang; label: string; short: string }[] = [
  { id: "en", label: "English", short: "EN" },
  { id: "es", label: "Español", short: "ES" },
  { id: "fr", label: "Français", short: "FR" },
  { id: "de", label: "Deutsch", short: "DE" },
];

type Dict = Record<string, { es: string; fr: string; de: string }>;

const D: Dict = {
  /* nav */
  "nav.services": { es: "Servicios", fr: "Services", de: "Leistungen" },
  "nav.transformations": { es: "Transformaciones", fr: "Transformations", de: "Verwandlungen" },
  "nav.stylists": { es: "Estilistas", fr: "Coiffeurs", de: "Stylisten" },
  "nav.consultation": { es: "Consulta", fr: "Consultation", de: "Beratung" },
  "nav.mirror": { es: "El Espejo", fr: "Le Miroir", de: "Der Spiegel" },
  "nav.booking": { es: "Reservas", fr: "Réservation", de: "Termine" },
  /* dock / accessibility */
  "dock.bookNow": { es: "Reservar", fr: "Réserver", de: "Buchen" },
  "dock.concierge": { es: "Conserje", fr: "Concierge", de: "Concierge" },
  "dock.backTop": { es: "Arriba", fr: "Haut", de: "Nach oben" },
  "dock.lang": { es: "Idioma", fr: "Langue", de: "Sprache" },
  "dock.textSize": { es: "Tamaño de texto", fr: "Taille du texte", de: "Textgröße" },
  "dock.contrast": { es: "Alto contraste", fr: "Contraste élevé", de: "Hoher Kontrast" },
  "dock.motion": { es: "Reducir movimiento", fr: "Réduire le mouvement", de: "Bewegung reduzieren" },
  "dock.access": { es: "Accesibilidad", fr: "Accessibilité", de: "Barrierefreiheit" },
  /* hero */
  "hero.scrollHint": { es: "desliza para transformar", fr: "faites défiler pour transformer", de: "scrollen zum Verwandeln" },
  "hero.cta": { es: "Reserva tu transformación", fr: "Réservez votre transformation", de: "Buchen Sie Ihre Verwandlung" },
  "hero.wander": { es: "o explora el menú", fr: "ou parcourez le menu", de: "oder stöbern Sie im Menü" },
  "hero.0.kicker": { es: "01 · Lo natural", fr: "01 · Le naturel", de: "01 · Das Natürliche" },
  "hero.0.line1": { es: "Cada obra maestra", fr: "Chaque chef-d'œuvre", de: "Jedes Meisterwerk" },
  "hero.0.line2": { es: "comienza al natural.", fr: "commence au naturel.", de: "beginnt ganz natürlich." },
  "hero.0.sub": { es: "Cabello real, luz honesta, cero pretensión. Tu historia empieza tal como eres.", fr: "De vrais cheveux, une lumière honnête, zéro prétention. Votre histoire commence telle que vous êtes.", de: "Echtes Haar, ehrliches Licht, null Prahlerei. Ihre Geschichte beginnt so, wie Sie sind." },
  "hero.1.kicker": { es: "02 · El color", fr: "02 · La couleur", de: "02 · Die Farbe" },
  "hero.1.line1": { es: "Color, pintado", fr: "La couleur, peinte", de: "Farbe, gemalt" },
  "hero.1.line2": { es: "como luz líquida.", fr: "comme une lumière liquide.", de: "wie flüssiges Licht." },
  "hero.1.sub": { es: "Balayage a mano en cobre cálido y rosa — dimensión donde la encontraría el sol.", fr: "Balayage à la main en cuivre chaud et rose — de la dimension là où le soleil la trouverait.", de: "Handgemaltes Balayage in warmem Kupfer und Rosé — Dimension dort, wo die Sonne sie fände." },
  "hero.2.kicker": { es: "03 · La revelación", fr: "03 · La révélation", de: "03 · Die Enthüllung" },
  "hero.2.line1": { es: "Y entonces —", fr: "Et alors —", de: "Und dann —" },
  "hero.2.line2": { es: "la revelación.", fr: "la révélation.", de: "die Enthüllung." },
  "hero.2.sub": { es: "Ondas champán con memoria propia. Llegaste siendo tú, pulida.", fr: "Des vagues champagne avec leur propre mémoire. Vous êtes arrivée telle que vous, sublimée.", de: "Champagner-Wellen mit eigenem Gedächtnis. Sie kamen als Sie selbst — vollendet." },
  "hero.3.kicker": { es: "04 · El atelier", fr: "04 · L'atelier", de: "04 · Das Atelier" },
  "hero.3.line1": { es: "Para los días", fr: "Pour les jours", de: "Für die Tage," },
  "hero.3.line2": { es: "que más importan.", fr: "qui comptent le plus.", de: "die am meisten zählen." },
  "hero.3.sub": { es: "Pruebas, calendarios y una silla tranquila la mañana misma.", fr: "Essais, plannings et un siège calme le matin même.", de: "Proben, Zeitpläne und ein ruhiger Stuhl am Morgen selbst." },
  /* section eyebrows + headings */
  "head.services.eyebrow": { es: "El menú de servicios", fr: "Le menu des services", de: "Die Leistungskarte" },
  "head.services.title": { es: "Oficio, tasado", fr: "Le savoir-faire, tarifé", de: "Handwerk, fair bepreist" },
  "head.services.italic": { es: "con honestidad.", fr: "avec honnêteté.", de: "mit Ehrlichkeit." },
  "head.transformations.eyebrow": { es: "Transformaciones", fr: "Transformations", de: "Verwandlungen" },
  "head.transformations.title": { es: "Desliza la raya,", fr: "Faites glisser la raie,", de: "Ziehen Sie den Scheitel," },
  "head.transformations.italic": { es: "conoce el después.", fr: "découvrez l'après.", de: "entdecken Sie das Danach." },
  "head.stylists.eyebrow": { es: "El equipo del atelier", fr: "L'équipe de l'atelier", de: "Das Atelier-Team" },
  "head.stylists.title": { es: "Manos en las que", fr: "Des mains auxquelles", de: "Hände, denen Sie" },
  "head.stylists.italic": { es: "confiar a ciegas.", fr: "se fier les yeux fermés.", de: "blind vertrauen können." },
  "head.consultation.eyebrow": { es: "Consulta de IA", fr: "Consultation IA", de: "KI-Beratung" },
  "head.consultation.title": { es: "Tu cabello, leído", fr: "Vos cheveux, lus", de: "Ihr Haar, gelesen" },
  "head.consultation.italic": { es: "como una novela.", fr: "comme un roman.", de: "wie ein Roman." },
  "head.mirror.eyebrow": { es: "Prueba virtual", fr: "Essai virtuel", de: "Virtuelle Anprobe" },
  "head.mirror.title": { es: "Acércate", fr: "Approchez-vous", de: "Treten Sie heran" },
  "head.mirror.italic": { es: "al espejo.", fr: "du miroir.", de: "an den Spiegel." },
  "head.booking.eyebrow": { es: "Reserva una silla", fr: "Réservez un siège", de: "Einen Stuhl buchen" },
  "head.booking.title": { es: "Tu cita,", fr: "Votre rendez-vous,", de: "Ihr Termin," },
  "head.booking.italic": { es: "cuatro pasos sencillos.", fr: "quatre petites étapes.", de: "vier kleine Schritte." },
  "head.experience.eyebrow": { es: "El salón sensorial", fr: "Le salon sensoriel", de: "Das Sinnes-Salon" },
  "head.experience.title": { es: "Recordarás", fr: "Vous vous souviendrez", de: "Sie werden erinnern," },
  "head.experience.italic": { es: "cómo se sintió.", fr: "de la sensation.", de: "wie es sich anfühlte." },
  /* booking */
  "booking.step1": { es: "Servicio", fr: "Service", de: "Leistung" },
  "booking.step2": { es: "Estilista", fr: "Coiffeur", de: "Stylist" },
  "booking.step3": { es: "Fecha y hora", fr: "Date et heure", de: "Datum & Zeit" },
  "booking.step4": { es: "Tus datos", fr: "Vos coordonnées", de: "Ihre Daten" },
  "booking.confirm": { es: "Confirmar reserva", fr: "Confirmer la réservation", de: "Buchung bestätigen" },
  "booking.anyStylist": { es: "Cualquiera disponible", fr: "N'importe qui de libre", de: "Wer verfügbar ist" },
  /* concierge */
  "concierge.title": { es: "El Conserje", fr: "Le Concierge", de: "Der Concierge" },
  "concierge.placeholder": { es: "Pregunta al conserje…", fr: "Demandez au concierge…", de: "Fragen Sie den Concierge…" },
  "concierge.greeting": { es: "Buen día — soy el conserje de Luxe. Precios, horarios, estilistas, reservas: pregunta sin miedo.", fr: "Bonjour — je suis le concierge de Luxe. Tarifs, horaires, coiffeurs, réservations : demandez sans hésiter.", de: "Guten Tag — ich bin der Luxe-Concierge. Preise, Öffnungszeiten, Stylisten, Termine: fragen Sie mich." },
  /* footer */
  "footer.explore": { es: "Explorar", fr: "Explorer", de: "Entdecken" },
  "footer.care": { es: "Cuidado", fr: "Soin", de: "Pflege" },
  "footer.newsTitle": { es: "Sabiduría capilar, semanal", fr: "Sagesse capillaire, hebdo", de: "Haar-Wissen, wöchentlich" },
  "footer.takeHome": { es: "Llévate el salón a casa", fr: "Emportez le salon chez vous", de: "Nehmen Sie das Salon mit nach Hause" },
  "footer.themeBtn": { es: "Descargar tema (.zip)", fr: "Télécharger le thème (.zip)", de: "Theme herunterladen (.zip)" },
  "footer.settingsBtn": { es: "Descargar ajustes (.json)", fr: "Télécharger les réglages (.json)", de: "Einstellungen herunterladen (.json)" },
  "footer.privacy": { es: "Privacidad", fr: "Confidentialité", de: "Datenschutz" },
  "footer.terms": { es: "Términos", fr: "Conditions", de: "AGB" },
};

/* ── store (persists the active language) ── */
const KEY = "luxe-lang";
let lang: Lang = load();
const listeners = new Set<() => void>();
function load(): Lang {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "es" || v === "fr" || v === "de" || v === "en") return v;
  } catch { /* private mode */ }
  return "en";
}
function emit() {
  try { localStorage.setItem(KEY, lang); } catch { /* ignore */ }
  document.documentElement.setAttribute("lang", lang);
  listeners.forEach((fn) => fn());
}
emit();

export function setLang(next: Lang) {
  if (next === lang) return;
  lang = next;
  emit();
}
function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function get() {
  return lang;
}

export function useI18n() {
  const current = useSyncExternalStore(subscribe, get);
  const t = useCallback(
    (key: string, fallback: string) => {
      if (current === "en") return fallback;
      return D[key]?.[current] ?? fallback;
    },
    [current]
  );
  return { lang: current, setLang, t };
}
