# LUXE HAIR STUDIO — Rebuild Lock

> If the server resets, paste `dist/luxe-rebuild-paste.txt` (or `luxe-rebuild-paste.txt`)
> back into the chat. It contains every source file, marker-delimited, byte-for-byte of the
> last build. The compiled, deployable site is `dist/luxe-compiled-site.zip`.

## What this build is
A luxury hairdressing salon single-page app (React 18 + Vite + Tailwind v4), rebuilt from the
design-token system. Signature: "The Final Cut" hero — see below.

## Signature hero — "The Final Cut" (`src/components/Hero.tsx`)
One scroll = one cut. Pinned, scroll-scrubbed, fully reversible (pure functions of progress).
- Timeline units INTRO 0.9 / HOLD 2.1 / TRANS 0.9 / OUTRO 0.7; `TOTAL = INTRO + N·HOLD +
  (N−1)·TRANS + OUTRO`; pin height `≈ TOTAL·26·heroScrollSpeed vh` (default pace 1.5× →
  ≈117vh per scene: ~82vh dwell + ~35vh cut — normal, unhurried scroll). Saved configs
  still on the old default heroScrollSpeed=3 are migrated to 1.5 automatically.
- **Projector intro** auto-plays ~2.6s on load (blade draws → LUXE wordmark rises → slash
  into scene 0); skipped if loaded mid-story; scroll maps `[introEndFrac → 1]` where
  `introEndAbs = INTRO + 0.35`. Drive: single rAF loop, smoothing 0.09/frame.
- **The cut**: gold blade at −16.3° ignites from centre (scaleX), a glint rides the parting;
  the scene splits into two shards (POLY_TOP/POLY_BOT) that drift along the blade normal
  (≈±11%/±10%, rot ±0.9°, scale 1+0.2·drift) under constant `blur(6px)`; each shard wrapper
  carries a mask gradient along the parting normal (top 164°, bottom 344°; clip stays on the
  inner img) so edges feather into light — no hard seam. The TOP shard lingers (fades
  0.55→0.96 local) — a soft slab melting off the left; the bottom releases earlier
  (0.5→0.78). Incoming look brightens beneath (0.16→0.62 in, brightness sweep).
- Shockwave pulse (bell at 0.3), dim punch (bell 0.24, 30%), 16 sparks per cut with lateral
  scatter, one diagonal light sweep per scene mid-hold, Ken Burns 1.05→1.095 per hold.
- **Title cards**: every cut has its own big card, same bottom-left position — kicker hairline
  draws (scaleX), headline lines rise from `blur(7px)` with stagger inside overflow-hidden
  masks, sub fades up, gold shine sweeps the card once as it lands.
- Chrome: CUT NN/NN counter top-right, titled progress rail (clickable) with idle shimmer,
  letterbox bars breathing during transitions, film grain (`.luxe-cine-grain`), vignette.
- **Idle life**: ambient projector glow drifts, scroll-hint breathes (real-scroll keyed),
  mouse parallax on the scene stack (±11px, scale 1.03 hides edges).
- Reduced motion → static poster of the final stage. All copy/images/accents come from
  `cfg.stages` + `cfg.salon` (admin-editable in the Atelier Console).

## Files
- `index.html` — shell: fonts (non-render-blocking), pre-paint theme, schema.org, file:// guard
- `vite.config.js` — emits `luxe-rebuild-paste.txt` + `luxe-compiled-site.zip` every build
- `src/index.css` — design tokens (light + dark), keyframes, reveal/shape/grain utilities
- `src/lib/config.ts` — config store (design + content + slots), persists to localStorage
- `src/lib/hooks.ts` — useTheme, usePrefersReducedMotion, useFinePointer, clamp/lerp/seg
- `src/lib/images.ts` — generated editorial photography URLs
- `src/components/` — Ornaments (icons/reveal/wave/toast), Header, Hero, Services, Gallery,
  Stylists (+matchmaker), Consultation, **Mirror (virtual try-on: on-device hair recolor)**,
  Booking, Experience (+marquee/testimonials/apothecary),
  Footer, Chrome (Preloader/Cursor/Concierge), Console (Atelier admin)

## Virtual Mirror (virtual try-on)
On-device hair recolor, no photo ever leaves the browser.
- Engine: MediaPipe `selfie_multiclass_256x256` hair segmentation (lazy `vision_bundle`
  chunk, ~46KB gz) → falls back to a classic region-growing mask (color + skin rejection)
  so it works offline. Engine badge shows "AI" or "classic".
- Recolor is a **natural, luminance-preserving tint** (not a dye). Three rules keep it
  from going fluorescent: (1) **hue** rotates 92% toward the shade (warmth nudges ±);
  (2) **saturation** is derived from the strand's OWN chroma (`ps × (0.5 + satF×0.65)`,
  `satF = min(shade.s,55)/55`) and **hard-capped at 52%** — it is NEVER replaced by the
  shade's saturation, which is what used to cause neon/fluorescent hair; (3) **lightness**
  keeps each strand's offset from the region average (`(pl−bL)×0.94`) added to a base that
  eases 60% toward the shade's depth — so natural brightness AND the highlight/shadow
  contrast curve survive. Shine lifts lightness gently (±0.05). The binary mask is
  **feathered** (5×5 box blur) so recolored strands blend with no hard edge.
- **Reset to natural** button restores warmth=50, shine=50, shade=Natural (clears custom
  shade) — returns the photo to its own hair.
- Controls: 3 muses + upload-your-own + camera capture (getUserMedia, 3-2-1 countdown),
  7 shade presets + "Mix your own" (hue/sat/lightness), match-range, protect-skin toggle,
  warmth + shine sliders, hold-to-compare (before/after), show-mask debug overlay,
  save-as-PNG, "Book this shade" → prefills booking.
- Fully customizable in Atelier Console → mirror config: muses (add/remove/upload),
  shades (add/remove/edit HSL), tolerance, protectSkin, warmth, shine.
- Rendered as content section `mirror` (between Consultation and Booking), linked in the
  header nav (3/3 split) and footer Explore column.

## Design tokens (light / dark)
- bg #f5f0e8 / #241c1d · surface #fffdf8 / #362a2b · ink #3a2e2f / #f2e9e1
- rose #d4a5a5 · rose-deep #a67b7b · gold #c9b037 · sage #a8b5a0
- hero base #161112 · hero ink #f7f1e7 · hero gold #c9b037 · champagne #f5e6d3
- display Cormorant Garamond · accent Cormorant Infant italic · body Inter · mono JetBrains Mono

## Customization
Atelier Console (⌘/Ctrl+Shift+A): Design (palette, type, radius, density, hero pace, grain,
motion, cursor, high contrast, right dock, left dock, 5 presets), Content (wordmark, phone,
email, all section headings), Sections (toggle + reorder), System (reset). Persists to
localStorage key `luxe-config-v4`.

## Floating docks
- Right dock (`Chrome.tsx` → `FloatingDock`): gold Book button → Concierge chat → back-to-top.
  Gated by `design.dockRight`.
- Left dock (`SiteEnhancements.tsx`): collapsible tab on the left edge with Language (EN/ES/FR/DE),
  Text size A+/A−, High contrast, Reduce motion. Gated by `design.dockLeft`.

## Multilingual (site-wide)
`src/lib/i18n.ts` is the single source of truth. `t(key, englishFallback)`: English returns the
admin/config value (backoffice = source of truth); ES/FR/DE return the dictionary, falling back
to English. Translated: nav, hero (all 4 stages), both docks, every section heading
(`SectionHead tr="…"` → `head.{key}.{eyebrow|title|italic}`), booking steps, concierge, footer.
Language persists to localStorage `luxe-lang` and sets `<html lang>`. To translate a new string,
add it to the `D` dictionary keyed by section.

## Recovery
1. Paste `luxe-rebuild-paste.txt` back into the chat (splits on `=== FILE: ===` markers).
2. `npm install` then `npm run build` (or dev). Both artifacts re-emit automatically.

Both recovery artifacts are generated DYNAMICALLY at build time by walking the real file tree
(`pasteFiles()` in vite.config.js), so they are always complete and never drift from the source.
Do not hand-maintain a file list. `package-lock.json` is excluded from the paste file
(regenerated by `npm install`) but included in `luxe-source-code.zip`.

## Complete source-code download (client-side, every file)
Footer button "Download all source code (.zip)" → `luxe-source-code.zip`, assembled in the
browser by `src/lib/sourceZip.ts`. It embeds EVERY source file byte-for-byte at BUILD time via
Vite `import.meta.glob([...root configs, /src/**, /public/**], { query: "?raw" })` (lazy), so
the download works anywhere the site loads and matches the build exactly. Requires
`src/vite-env.d.ts` (`/// <reference types="vite/client" />`) for the glob typing. The zip
contains: package.json, package-lock.json, tsconfig.json, vite.config.js, index.html, LOCK.md,
lock.json, all of src/, all of public/, plus a README-SOURCE.txt. To run: npm install, npm run dev.

## Compiled-site download (client-side packager)
The footer "Download compiled site (.zip)" does NOT fetch a pre-made file — the static host
only serves the app shell + `/assets/`, so a dist-root zip 404s. Instead Footer.tsx builds
the ZIP **in the browser**: it pre-warms lazy chunks (`@mediapipe/tasks-vision`), collects every
same-origin hashed `/assets/*.{js,css}` (from DOM + performance entries), fetches their bytes,
fetches the served HTML and rewrites `src="/…` → `src="./…` (or synthesizes a production shell
if the dev shell is detected), adds robots.txt / sitemap.xml / README-DEPLOY.txt, and zips via
`import("jszip")` (own lazy chunk). Works anywhere the site itself loads. Do not revert to a
plain `fetch("./luxe-compiled-site.zip")` — it fails in the served preview.
