<!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="UTF-8">
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath d='M16 2c3 6 8 8 8 14a8 8 0 1 1-16 0c0-6 5-8 8-14z' fill='%23C9B037'/%3E%3C/svg%3E">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    
    
    
    
    <!-- Multilingual SEO: hreflang alternates (4.11 / 6.13) -->
    
    
    
    
    
    <!-- Open Graph (Facebook / LinkedIn / WhatsApp) -->
    
    
    
    
    
    <!-- Twitter / X card -->
    
    
    
    
    <!-- Schema.org structured data -->
    
    <!-- Breadcrumb navigation (schema.org) -->
    
    <!-- hero stage imagery at maximum fetch priority — first paint, not afterthought -->
    <link rel="preconnect" href="https://image.qwenlm.ai">
    <link rel="preload" as="image" fetchpriority="high" href="https://image.qwenlm.ai/generated-images/00c49622-d378-41a8-a42e-a1dffb86ba50/_result.png">
    <link rel="preload" as="image" fetchpriority="high" href="https://image.qwenlm.ai/generated-images/02c13cf1-ac55-42ef-a02f-626ee3ec923d/_result.png">
    
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
    <!-- Fonts load non-render-blocking (8.9): applied after first paint, with a
         no-JS fallback so they still load if scripting is disabled. -->
    
    <noscript>
      
    </noscript>
    <script>
      /* apply saved theme before first paint to avoid a flash */
      (function () {
        try {
          var t = localStorage.getItem("luxe-theme");
          if (!t) t = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
          document.documentElement.setAttribute("data-theme", t);
        } catch (e) {
          document.documentElement.setAttribute("data-theme", "light");
        }
      })();
      /* ── inline watchdog ─────────────────────────────────────────
         Lives OUTSIDE the module graph on purpose: it must work even if
         every JS file fails to load or evaluate. Catches (capture-phase)
         module-load failures, eval errors, unhandled rejections, and a
         root that simply never rendered. Shows a real diagnostic instead
         of a silent blank page. */
      (function () {
        var faults = [];
        var shown = false;
        function panel(title, detail) {
          if (shown) return;
          shown = true;
          var el = document.createElement("div");
          el.id = "luxe-crash";
          el.setAttribute(
            "style",
            "position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;" +
              "background:#241c1d;color:#f2e9e1;font-family:Georgia,'Times New Roman',serif;padding:2rem;text-align:center;"
          );
          var inner = document.createElement("div");
          inner.setAttribute("style", "max-width:620px;width:100%");
          var kicker = document.createElement("p");
          kicker.textContent = "LUXE HAIR STUDIO — STARTUP FAULT";
          kicker.setAttribute("style", "font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:.32em;color:#c9b037;margin:0;");
          var h = document.createElement("h1");
          h.textContent = title;
          h.setAttribute("style", "font-size:2.4rem;font-weight:500;margin:.9rem 0;line-height:1.1;");
          var p = document.createElement("p");
          p.setAttribute("style", "color:#c0aea4;line-height:1.65;font-size:15px;margin:0;");
          p.textContent =
            "Your settings and bookings are safe. First try a hard refresh (Ctrl/Cmd + Shift + R). " +
            "If this panel persists, copy the fault detail below and send it along.";
          var pre = document.createElement("pre");
          pre.textContent = detail || "no detail captured";
          pre.setAttribute(
            "style",
            "margin:1.4rem auto 0;text-align:left;background:rgba(242,233,225,.06);border:1px solid rgba(242,233,225,.15);" +
              "border-radius:12px;padding:1rem;font-family:ui-monospace,Menlo,monospace;font-size:11.5px;color:#e3b6b6;" +
              "white-space:pre-wrap;word-break:break-word;max-height:220px;overflow:auto;"
          );
          var row = document.createElement("div");
          row.setAttribute("style", "display:flex;gap:.8rem;justify-content:center;margin-top:1.4rem;flex-wrap:wrap;");
          function btn(label, gold, fn) {
            var b = document.createElement("button");
            b.textContent = label;
            b.setAttribute(
              "style",
              "background:" + (gold ? "#c9b037" : "transparent") + ";color:" + (gold ? "#2b1f1f" : "#f2e9e1") + ";" +
                "border:1px solid " + (gold ? "#c9b037" : "rgba(242,233,225,.3)") + ";border-radius:999px;padding:.85rem 1.9rem;" +
                "font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;cursor:pointer;"
            );
            b.onclick = fn;
            row.appendChild(b);
          }
          btn("Reset settings & reload", true, function () {
            try { localStorage.removeItem("luxe-config-v3"); } catch (e) {}
            location.reload();
          });
          btn("Clear cache & reload", false, function () {
            var clear = (window.caches && caches.keys)
              ? caches.keys().then(function (ks) { return Promise.all(ks.map(function (k) { return caches.delete(k); })); })
              : Promise.resolve();
            clear.then(function () { location.reload(); });
          });
          btn("Just reload", false, function () { location.reload(); });
          inner.appendChild(kicker); inner.appendChild(h); inner.appendChild(p); inner.appendChild(pre); inner.appendChild(row);
          el.appendChild(inner);
          document.body.appendChild(el);
        }
        /* capture-phase: catches module-script load failures (they don't bubble) */
        window.addEventListener("error", function (e) {
          var src = (e.target && (e.target.src || e.target.href)) || e.filename || "?";
          faults.push((e.message || "resource failed to load") + " @ " + src + ":" + (e.lineno || ""));
        }, true);
        window.addEventListener("unhandledrejection", function (e) {
          faults.push("unhandled rejection: " + String((e.reason && e.reason.message) || e.reason));
        });
        /* Vite prints the REAL module error to console.error — capture it */
        var ce = console.error;
        console.error = function () {
          try {
            var msg = Array.prototype.slice.call(arguments).map(function (a) {
              if (a && a.message) return a.message + (a.stack ? "\n" + a.stack : "");
              return String(a);
            }).join(" ");
            if (faults.length < 12) faults.push("[console.error] " + msg.slice(0, 900));
          } catch (e) {}
          ce.apply(console, arguments);
        };
        /* the app may simply be slow (big bundle, slow link) — keep checking,
           and DISMISS the panel the moment the app comes alive. A watchdog
           must never bury a working site. */
        var appAlive = function () {
          return !!(window.__luxeBooted || (document.getElementById("root") && document.getElementById("root").childElementCount > 0));
        };
        setInterval(function () {
          if (appAlive()) {
            var p = document.getElementById("luxe-crash");
            if (p) p.remove();
            shown = false;
          }
        }, 500);
        setTimeout(function () {
          if (appAlive()) return;
          /* actively probe the app script so a delivery fault is NAMED,
             not guessed: status, content-type, size, markup-vs-js */
          /* find the main.tsx entry specifically — querySelector alone grabs
             Vite's injected inline react-refresh preamble (no src) first */
          var scr = null;
          var all = document.querySelectorAll('script[type="module"][src]');
          for (var i = 0; i < all.length; i++) {
            if ((all[i].getAttribute("src") || "").indexOf("main") !== -1) { scr = all[i]; break; }
          }
          var src = scr ? scr.getAttribute("src") : "(no main.tsx module script in page)";
          var finish = function (probe) {
            var resources = "";
            try {
              resources = performance.getEntriesByType("resource").map(function (r) {
                return r.name.split("/").pop() + " · " + Math.round((r.transferSize || 0) / 1024) + " kB · " + Math.round(r.duration || 0) + " ms";
              }).join("\n");
            } catch (e) { resources = "(resource timing unavailable)"; }
            panel(
              "The salon is taking too long to open.",
              "App script: " + src + "\n\nProbe: " + probe +
                "\n\nCaptured errors:\n" + (faults.length ? faults.join("\n") : "(none)") +
                "\n\nLoaded resources:\n" + (resources || "(none)")
            );
          };
          var runProbe = function () {
            if (!src || src.charAt(0) === "(") { finish("no probe target"); return; }
            fetch(src, { cache: "no-store" })
              .then(function (r) {
                return r.text().then(function (txt) {
                  var ct = r.headers.get("content-type") || "(unknown)";
                  var looksHtml = /^\s*</.test(txt);
                  var verdict = "HTTP " + r.status + " · " + ct + " · " + txt.length + " bytes" +
                    (looksHtml ? " · STARTS WITH MARKUP — the wrong file is being served for the app script (stale cache / proxy fallback)" : "");
                  /* one automatic cache-cleared retry before bothering the user */
                  if (!window.sessionStorage.getItem("luxe-auto-retry") && (r.status !== 200 || looksHtml || txt.length < 1000)) {
                    try { window.sessionStorage.setItem("luxe-auto-retry", "1"); } catch (e) {}
                    var clear = (window.caches && caches.keys)
                      ? caches.keys().then(function (ks) { return Promise.all(ks.map(function (k) { return caches.delete(k); })); })
                      : Promise.resolve();
                    clear.then(function () { location.reload(); });
                    return;
                  }
                  finish(verdict);
                });
              })
              .catch(function (err) { finish("probe failed: " + err.message); });
          };
          runProbe();
        }, 9000);
        window.__luxeFaultPanel = panel; /* main.tsx reuses this panel */
        window.__luxeFaults = faults;
      })();
    </script>
<?php if ( ! luxe_seo_plugin_active() ) : ?>
<title>Luxe Hair Studio — Ultra-Premium Salon &amp; Colour Atelier</title>
<meta name="description" content="Precision cuts, dimensional colour and bridal artistry. A luxury salon experience with a virtual try-on mirror and AI consultation.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="/">
<link rel="alternate" hreflang="en" href="/">
<link rel="alternate" hreflang="es" href="/?lang=es">
<link rel="alternate" hreflang="fr" href="/?lang=fr">
<link rel="alternate" hreflang="de" href="/?lang=de">
<link rel="alternate" hreflang="x-default" href="/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Luxe Hair Studio">
<meta property="og:title" content="Luxe Hair Studio — Ultra-Premium Salon &amp; Colour Atelier">
<meta property="og:description" content="Precision cuts, dimensional colour and bridal artistry. A luxury salon experience with a virtual try-on mirror and AI consultation.">
<meta property="og:image" content="https://image.qwenlm.ai/generated-images/00c49622-d378-41a8-a42e-a1dffb86ba50/_result.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Luxe Hair Studio — Ultra-Premium Salon &amp; Colour Atelier">
<meta name="twitter:description" content="Precision cuts, dimensional colour and bridal artistry. A luxury salon experience with a virtual try-on mirror and AI consultation.">
<meta name="twitter:image" content="https://image.qwenlm.ai/generated-images/00c49622-d378-41a8-a42e-a1dffb86ba50/_result.png">
<script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "BeautySalon",
        "name": "Luxe Hair Studio",
        "description": "Ultra-premium hairdressing salon and colour atelier offering precision cuts, dimensional colour, treatments, bridal artistry and makeup.",
        "image": "https://image.qwenlm.ai/generated-images/00c49622-d378-41a8-a42e-a1dffb86ba50/_result.png",
        "priceRange": "£££",
        "currenciesAccepted": "GBP",
        "paymentAccepted": "Credit Card, Cash",
        "address": { "@type": "PostalAddress", "streetAddress": "12 Rosewater Lane", "addressLocality": "Mayfair", "addressRegion": "London", "postalCode": "W1K", "addressCountry": "GB" },
        "telephone": "+44 20 7946 0958",
        "email": "hello@luxehairstudio.co.uk",
        "openingHours": ["Tu-Fr 09:00-19:00", "Sa 08:00-18:00", "Su 10:00-16:00"],
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Salon Services",
          "itemListElement": [
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Cut & Styling" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Colour & Highlights" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Treatments & Rituals" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Bridal & Events" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Makeup" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Men's Grooming" } }
          ]
        }
      }
    </script>
<script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "/" },
          { "@type": "ListItem", "position": 2, "name": "Luxe Hair Studio", "item": "/#top" }
        ]
      }
    </script>
<?php endif; ?>

<?php wp_head(); ?>
</head>
<body <?php body_class( current_user_can( "edit_theme_options" ) ? "luxe-admin" : "" ); ?>>
<?php wp_body_open(); ?>
