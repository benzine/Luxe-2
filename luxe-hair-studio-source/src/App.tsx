import { Fragment, useEffect, useState } from "react";
import Booking from "./components/Booking";
import { Cursor, FloatingDock, Preloader } from "./components/Chrome";
import Console from "./components/Console";
import SiteEnhancements from "./components/SiteEnhancements";
import Consultation from "./components/Consultation";
import Experience, { MarqueeRibbon } from "./components/Experience";
import Footer from "./components/Footer";
import Gallery from "./components/Gallery";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Mirror from "./components/Mirror";
import Services, { type BookPrefill } from "./components/Services";
import Stylists from "./components/Stylists";
import CustomSection from "./components/CustomSection";
import Amenities from "./components/Amenities";
import BookingAddons from "./components/BookingAddons";
import Stats from "./components/Stats";
import Quiz from "./components/Quiz";
import Tiers from "./components/Tiers";
import { StrandBackdrop, ToastHost, Wave } from "./components/Ornaments";
import { useConfig, type Slot } from "./lib/config";
import { useTheme } from "./lib/hooks";

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const [booting, setBooting] = useState(true);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [prefill, setPrefill] = useState<BookPrefill | null>(null);
  const cfg = useConfig();

  useEffect(() => {
    document.body.style.overflow = booting ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [booting]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  /* ⌘⇧A opens the Atelier Console */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "a") { e.preventDefault(); setConsoleOpen((o) => !o); }
    };
    addEventListener("keydown", h);
    return () => removeEventListener("keydown", h);
  }, []);

  const handleBook = (p: BookPrefill) => {
    setPrefill(p);
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  const SECTION_BG: Record<string, string> = {
    services: "var(--bg-soft)", transformations: "var(--bg)", stylists: "var(--bg)",
    consultation: "var(--bg-soft)", mirror: "var(--bg-soft)", booking: "var(--bg)", experience: "var(--bg-soft)",
    amenities: "var(--bg-soft)", stats: "var(--bg-deep)", quiz: "var(--bg-soft)", tiers: "var(--bg)", "booking-addons": "var(--bg)",
  };
  const renderSection = (id: string) => {
    switch (id) {
      case "services": return <Services onBook={handleBook} />;
      case "transformations": return <Gallery />;
      case "stylists": return <Stylists onBook={handleBook} />;
      case "consultation": return <Consultation onBook={handleBook} />;
      case "mirror": return <Mirror onBook={handleBook} />;
      case "booking": return <Booking prefill={prefill} />;
      case "experience": return <Experience />;
      case "amenities": return <Amenities />;
      case "stats": return <Stats />;
      case "quiz": return <Quiz />;
      case "tiers": return <Tiers />;
      case "booking-addons": return <BookingAddons />;
      default: return null;
    }
  };

  const active = cfg.slots.filter((s) => s.enabled);
  let prevBg = "var(--bg)";

  return (
    <div className={`${cfg.design.grain ? "luxe-grain " : ""}relative min-h-screen bg-base text-ink`}>
      {booting && <Preloader onDone={() => setBooting(false)} />}
      <Cursor />
      <StrandBackdrop />
      <Header theme={theme} onToggleTheme={toggleTheme} scrolled={scrolled} onOpenConsole={() => setConsoleOpen(true)} />
      <main id="main-content" className="relative z-10">
        <Hero />
        <div className="relative bg-base"><MarqueeRibbon /></div>
        {active.map((s: Slot) => {
          const bg = SECTION_BG[s.id] ?? "var(--bg)";
          const wave = <div style={{ background: prevBg }}><Wave fill={bg} /></div>;
          prevBg = bg;
          /* admin-added custom sections render from their own data */
          const body = s.custom ? <CustomSection data={s.custom} /> : renderSection(s.id);
          return <Fragment key={s.uid}>{wave}{body}</Fragment>;
        })}
        <div style={{ background: prevBg }}><Wave fill="var(--bg-deep)" /></div>
        <Footer />
      </main>
      {cfg.design.dockRight && <FloatingDock />}
      {cfg.design.dockLeft && <SiteEnhancements />}
      <ToastHost />
      {consoleOpen && <Console onClose={() => setConsoleOpen(false)} />}
    </div>
  );
}
