import { useCallback, useEffect, useState } from "react";

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

export type Theme = "light" | "dark";

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document !== "undefined") {
      const t = document.documentElement.getAttribute("data-theme");
      if (t === "dark" || t === "light") return t;
    }
    return "light";
  });

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("luxe-theme", next);
      } catch { /* private mode */ }
      return next;
    });
  }, []);

  return [theme, toggle];
}

export function usePrefersReducedMotion(): boolean {
  const [prm, setPrm] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => setPrm(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return prm;
}

export function useFinePointer(): boolean {
  const [fine, setFine] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const fn = () => setFine(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return fine;
}

export function useScrolledPast(px: number): boolean {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const fn = () => setPast(window.scrollY > px);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [px]);
  return past;
}
