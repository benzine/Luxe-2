import { useState } from "react";
import { useConfig } from "../lib/config";
import { fullDataPackage } from "../lib/config";
import { Ic, Wave, toast } from "./Ornaments";

export default function Footer() {
  const cfg = useConfig();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast("That email looks a little windswept — try again?"); return; }
    setDone(true);
  };

  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };
  const downloadSettings = () => {
    downloadBlob(new Blob([JSON.stringify(fullDataPackage(), null, 2)], { type: "application/json" }), "luxe-settings.json");
    toast("luxe-settings.json is downloading");
  };
  /* Build the compiled-site ZIP right here in the browser, from the very
     assets this page is running on. The static host only serves the app
     shell + /assets/, so we cannot fetch a pre-made zip file — but every
     compiled asset below is provably servable (the page depends on them).
     Collect them, grab the served HTML, rewrite paths to relative, zip. */
  const downloadCompiled = async () => {
    toast("Packaging the compiled site…");
    try {
      const { default: JSZip } = await import("jszip");
      /* Pre-warm lazy chunks so the shipped site is complete (Mirror, etc.). */
      await import("@mediapipe/tasks-vision").catch(() => undefined);

      /* 1. Collect every same-origin compiled asset (hashed /assets/* js+css). */
      const urls = new Set<string>();
      const add = (u: string) => {
        try {
          const abs = new URL(u, location.href);
          if (abs.origin !== location.origin) return;
          if (!/\/assets\/.+\.(js|css)(\?.*)?$/.test(abs.pathname)) return;
          urls.add(abs.pathname);
        } catch { /* ignore */ }
      };
      document.querySelectorAll<HTMLScriptElement>("script[src]").forEach((s) => add(s.src));
      document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]').forEach((l) => add(l.href));
      try {
        performance.getEntriesByType("resource").forEach((r) => add(r.name));
      } catch { /* older browsers */ }
      if (urls.size === 0) throw new Error("no assets");

      /* 2. Fetch each asset's bytes. */
      const files = new Map<string, BlobPart>();
      for (const p of urls) {
        const res = await fetch(p, { cache: "no-store" });
        if (!res.ok) continue; /* never fail the whole zip over one optional chunk */
        files.set(p.replace(/^\//, ""), await res.arrayBuffer());
      }

      /* 3. Grab the served HTML and make asset paths relative. */
      let html = "";
      try {
        html = await (await fetch(location.pathname || "/", { cache: "no-store" })).text();
      } catch { /* fall through to shell below */ }
      const isCompiled = /\/assets\/.+\.js/.test(html);
      if (!isCompiled) {
        /* Dev shell detected — synthesize a production shell for the assets. */
        const js = [...files.keys()].filter((f) => f.endsWith(".js"));
        const css = [...files.keys()].filter((f) => f.endsWith(".css"));
        html =
          `<!doctype html><html lang="en"><head><meta charset="UTF-8"/>` +
          `<meta name="viewport" content="width=device-width,initial-scale=1.0"/>` +
          `<title>${cfg.salon.word} ${cfg.salon.sub}</title>` +
          css.map((c) => `<link rel="stylesheet" href="./${c}"/>`).join("") +
          `</head><body><div id="root"></div>` +
          js.map((j) => `<script type="module" src="./${j}"></script>`).join("") +
          `</body></html>`;
      } else {
        html = html
          .replace(/(src|href)="\//g, '$1="./')
          .replace(/(src|href)='\/(?=[^/])/g, "$1='./");
      }

      /* 4. Assemble the zip. */
      const zip = new JSZip();
      const root = zip.folder("luxe-hair-studio-site")!;
      root.file("index.html", html);
      files.forEach((data, p) => root.file(p, data));
      root.file(
        "robots.txt",
        "User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n"
      );
      root.file(
        "sitemap.xml",
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>/</loc></url></urlset>\n`
      );
      root.file(
        "README-DEPLOY.txt",
        [
          "LUXE HAIR STUDIO — COMPILED SITE",
          "This ZIP is the production build, exactly as served. Static & self-contained.",
          "",
          "TO DEPLOY: unzip, upload the contents of 'luxe-hair-studio-site' to any static",
          "host (Netlify, Vercel, S3, cPanel) at the DOMAIN ROOT, or run `npx serve` here.",
          "",
          "NOTE: do not open index.html by double-clicking — browsers block ES-module apps",
          "from file://. Serve over http (npx serve / python3 -m http.server 4173).",
        ].join("\n")
      );
      const buf = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
      downloadBlob(buf, "luxe-compiled-site.zip");
      toast(`luxe-compiled-site.zip — ${files.size + 4} files, unzip & host anywhere`);
    } catch (err) {
      toast(`Couldn't package the site (${err instanceof Error ? err.message : "error"}). Try again.`);
    }
  };

  /* Complete source-code ZIP: every file, byte-for-byte, assembled in the
     browser from the build-embedded source (see src/lib/sourceZip.ts). */
  const downloadSource = async () => {
    toast("Bundling every line of source code…");
    try {
      const { buildSourceZip } = await import("../lib/sourceZip");
      const { blob, count } = await buildSourceZip();
      downloadBlob(blob, "luxe-source-code.zip");
      toast(`luxe-source-code.zip — ${count} files, every line of code`);
    } catch (err) {
      toast(`Couldn't bundle the source (${err instanceof Error ? err.message : "error"}). Try again.`);
    }
  };

  return (
    <footer className="relative">
      <div className="bg-basesoft"><Wave fill="var(--bg-deep)" /></div>
      <div className="bg-basedeep pb-10 pt-8 text-[#f2e9e1]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="luxe-footer-grid grid gap-12">
            <div>
              <p className="font-display text-3xl font-semibold tracking-[0.3em]" style={{ textIndent: "0.3em" }}>{cfg.salon.word}</p>
              <p className="font-mono mt-1.5 text-[9px] uppercase tracking-[0.5em] text-[#c0aea4]" style={{ textIndent: "0.5em" }}>{cfg.salon.sub}</p>
              <p className="font-accenti mt-6 max-w-xs text-xl leading-relaxed text-[#e3d5ca]">Where soft geometry meets warm luxury — and you leave looking like the rumours say.</p>
              <div className="mt-6 space-y-2 text-[13px] text-[#c0aea4]">
                <p className="flex items-center gap-3"><Ic.MapPin className="h-4 w-4 shrink-0 text-[#d9c25a]" />{cfg.salon.address}, {cfg.salon.city}</p>
                <p className="flex items-center gap-3"><Ic.Phone className="h-4 w-4 shrink-0 text-[#d9c25a]" />{cfg.salon.phone}</p>
                <p className="flex items-center gap-3"><Ic.Mail className="h-4 w-4 shrink-0 text-[#d9c25a]" />{cfg.salon.email}</p>
              </div>
            </div>
            <nav aria-label="Explore">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#8f7d74]">Explore</p>
              <ul className="mt-5 space-y-3">
                {[["Services", "services"], ["Transformations", "transformations"], ["Stylists", "stylists"], ["The Mirror", "mirror"], ["Booking", "booking"]].map(([l, id]) => (
                  <li key={id}><button onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })} data-cursor="hand" className="link-draw font-display text-lg text-[#e3d5ca] transition-colors hover:text-[#d9c25a]">{l}</button></li>
                ))}
              </ul>
            </nav>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#8f7d74]">Hair wisdom, weekly</p>
              <p className="font-accenti mt-5 text-xl leading-snug text-[#e3d5ca]">One elegant email a week — care rituals, trend forecasts, first dibs on cancelled chairs.</p>
              {done ? (
                <p className="phase-swap mt-5 flex items-center gap-2.5 rounded-full border border-[#a8b5a0]/50 bg-[#a8b5a0]/10 px-5 py-3 text-[13px] text-[#a8b5a0]"><Ic.Check className="h-4 w-4" /> Welcome in — your first letter arrives Sunday.</p>
              ) : (
                <form onSubmit={subscribe} className="mt-5 flex items-center gap-2 rounded-full border border-[#f2e9e1]/20 bg-[#f2e9e1]/5 p-1.5 focus-within:border-[#d9c25a]/60">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" aria-label="Email for newsletter" className="w-full bg-transparent px-4 py-2 text-[13.5px] text-[#f2e9e1] outline-none placeholder:text-[#8f7d74]" />
                  <button type="submit" data-cursor="hand" className="shrink-0 rounded-full bg-[#d4a5a5] px-5 py-2.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#3a2e2f] transition-colors hover:bg-[#d9c25a]">Join</button>
                </form>
              )}
              <div className="mt-6 flex flex-col gap-2.5">
                <button onClick={downloadCompiled} data-cursor="hand" className="flex items-center justify-center gap-2.5 rounded-full border border-[#a8b5a0]/50 px-6 py-3 font-mono text-[9px] uppercase tracking-[0.18em] text-[#a8b5a0] transition-all hover:-translate-y-0.5 hover:text-[#f2e9e1]"><Ic.ArrowUp className="h-3.5 w-3.5 rotate-180" />Download compiled site (.zip)</button>
                <button onClick={downloadSource} data-cursor="hand" className="flex items-center justify-center gap-2.5 rounded-full border border-[#d4a5a5]/50 px-6 py-3 font-mono text-[9px] uppercase tracking-[0.18em] text-[#e3b6b6] transition-all hover:-translate-y-0.5 hover:text-[#f2e9e1]"><Ic.Scissors className="h-3.5 w-3.5" />Download all source code (.zip)</button>
                <button onClick={downloadSettings} data-cursor="hand" className="flex items-center justify-center gap-2.5 rounded-full border border-[#d9c25a]/50 px-6 py-3 font-mono text-[9px] uppercase tracking-[0.18em] text-[#d9c25a] transition-all hover:-translate-y-0.5 hover:text-[#f2e9e1]"><Ic.Gem className="h-3.5 w-3.5" />Download settings & data (.json)</button>
              </div>
            </div>
          </div>
          <div className="mt-14 flex flex-col items-center gap-4 border-t border-[#f2e9e1]/10 pt-7 sm:flex-row sm:justify-between">
            <p className="font-mono text-[10px] tracking-[0.14em] text-[#8f7d74]">© {new Date().getFullYear()} {cfg.salon.name} · {cfg.salon.address}, {cfg.salon.city}</p>
            <p className="font-accenti text-[15px] text-[#c0aea4]">{cfg.salon.copyright}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
