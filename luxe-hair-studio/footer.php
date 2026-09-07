<?php
/**
 * The React mount point + configuration bridge, then the enqueued bundle.
 * The inline classic script sets window.__LUXE_CONFIG__ (and wpReactSettings
 * fallback) BEFORE the deferred ES module executes, so the app boots with the
 * admin's saved configuration.
 *
 * Also includes a small runtime patch that:
 *   1. Prevents the header.php watchdog from auto-reloading the page
 *   2. Intercepts #console anchor clicks to avoid navigation
 *   3. Renders sections that the compiled Vite build doesn't yet wire into
 *      renderSection() (Amenities, Tiers, Stats, Booking Add-ons) using the
 *      same Tailwind classes and design language as the rest of the site.
 */
?>
<div id="root"></div>
<script>
	window.__LUXE_CONFIG__ = <?php
		/* Resolve bundled-image placeholders to this theme's images/ directory
		   so content never depends on absolute external URLs (12.4). */
		$luxe_json = wp_json_encode( luxe_merged_config() );
		$luxe_json = str_replace( '__LUXE_IMAGES__', get_template_directory_uri() . '/images', $luxe_json );
		echo $luxe_json; // Already JSON-encoded + escaped by wp_json_encode.
	?>;
	window.wpReactSettings = window.wpReactSettings || {};
</script>
<script>
/* ═══════════════════════════════════════════════════════════════════
   LUXE FRONTEND RUNTIME PATCH
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  var CFG = window.__LUXE_CONFIG__ || {};
  var CONTENT = CFG.content || {};
  var HEADINGS = CONTENT.headings || CFG.headings || {};

  /* ── 1. Prevent watchdog auto-reload ── */
  try { sessionStorage.setItem("luxe-auto-retry", "1"); } catch (e) {}

  /* ── 2. Intercept #console links ── */
  document.addEventListener("click", function (e) {
    var t = e.target;
    while (t && t !== document) {
      if (t.tagName === "A" && t.getAttribute("href") === "#console") {
        e.preventDefault();
        break;
      }
      t = t.parentElement;
    }
  }, true);

  /* ── 3. Inline SVG icons (matches theme's Ornaments component) ── */
  var ICONS = {
    coffee:  '<svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8z"/><path d="M16 10h2a2 2 0 0 1 0 4h-2"/><path d="M8 3v3M12 3v3"/></svg>',
    flower:  '<svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 3a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3z"/><path d="M12 15a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3z"/><path d="M5 10.5a3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3z"/><path d="M13.5 10.5a3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3z"/></svg>',
    drop:    '<svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11z"/></svg>',
    gem:     '<svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9l4-6z"/><path d="M2 9h20M10 3l-2 6 4 12M14 3l2 6-4 12"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>',
    bag:     '<svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>',
    glass:   '<svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h10l-1 9a4 4 0 0 1-8 0L7 3z"/><path d="M12 16v5M8 21h8"/></svg>',
    scissors:'<svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/></svg>',
    default: '<svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/></svg>'
  };
  function icon(k) { return ICONS[k] || ICONS.default; }

  /* ── 4. Section renderers ── */

  function renderSectionHeading(eyebrow, data) {
    var h = data || {};
    var title = h.title || '';
    var italic = h.italic || '';
    var desc = h.desc || '';
    return '<p class="font-mono text-[10px] uppercase tracking-[0.28em]" style="color:var(--gold,#c9b037)">' + eyebrow + '</p>' +
      '<h2 class="font-display mt-2 text-3xl font-medium sm:text-4xl" style="color:var(--ink,#3a2e2f)">' +
        title + (italic ? ' <em class="font-accenti" style="color:var(--rose-deep,#a67b7b)">' + italic + '</em>' : '') +
      '</h2>' +
      (desc ? '<p class="mt-3 max-w-xl text-[14px] leading-relaxed" style="color:var(--ink-soft,#6d5f56)">' + desc + '</p>' : '');
  }

  function renderAmenities() {
    var items = CONTENT.amenities || CFG.amenities || [];
    if (!items.length) return '';
    var h = HEADINGS.experience || HEADINGS.amenities || {};
    var html = '<section id="amenities" class="relative py-24 sm:py-32" style="background:var(--bg-soft,#eee6d9)">' +
      '<div class="mx-auto max-w-7xl px-5 sm:px-8">' +
        renderSectionHeading('The Amenities', h) +
        '<div class="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">';
    items.forEach(function (a) {
      html += '<div class="group flex flex-col items-center text-center">' +
        '<div class="flex h-14 w-14 items-center justify-center rounded-full" style="background:rgba(201,176,55,.12);color:var(--gold,#c9b037)">' + icon(a.icon) + '</div>' +
        '<p class="font-display mt-4 text-lg" style="color:var(--ink,#3a2e2f)">' + (a.title || '') + '</p>' +
        '<p class="mt-2 text-[13px] leading-relaxed" style="color:var(--ink-soft,#6d5f56)">' + (a.desc || '') + '</p>' +
      '</div>';
    });
    html += '</div></div></section>';
    return html;
  }

  function renderTiers() {
    var items = CONTENT.tiers || CFG.tiers || [];
    if (!items.length) return '';
    var h = HEADINGS.tiers || {};
    var html = '<section id="tiers" class="relative py-24 sm:py-32" style="background:var(--bg,#f5f0e8)">' +
      '<div class="mx-auto max-w-7xl px-5 sm:px-8">' +
        renderSectionHeading('Three tiers, one ritual', h) +
        '<div class="mt-14 grid gap-5 md:grid-cols-3">';
    items.forEach(function (t) {
      html += '<div class="rounded-[2rem_2rem_0.5rem_2rem] border p-7 transition-all hover:-translate-y-1 hover:shadow-lg" style="border-color:rgba(212,165,165,.25);background:var(--surface,#fffdf8)">' +
        '<p class="font-mono text-[9px] uppercase tracking-[0.24em]" style="color:var(--gold,#c9b037)">' + (t.level || '') + '</p>' +
        '<p class="font-display mt-2 text-2xl font-medium" style="color:var(--ink,#3a2e2f)">' + (t.name || '') + '</p>' +
        '<p class="mt-3 text-[13px] leading-relaxed" style="color:var(--ink-soft,#6d5f56)">' + (t.desc || '') + '</p>' +
        '<div class="mt-6 space-y-2 border-t pt-5" style="border-color:rgba(212,165,165,.18)">' +
          '<div class="flex items-baseline justify-between"><span class="text-[12px]" style="color:var(--ink-soft,#6d5f56)">Cut from</span><span class="font-display text-xl" style="color:var(--ink,#3a2e2f)">£' + (t.cutPrice || 0) + '</span></div>' +
          '<div class="flex items-baseline justify-between"><span class="text-[12px]" style="color:var(--ink-soft,#6d5f56)">Colour from</span><span class="font-display text-xl" style="color:var(--ink,#3a2e2f)">£' + (t.colourPrice || 0) + '</span></div>' +
        '</div></div>';
    });
    html += '</div></div></section>';
    return html;
  }

  function renderStats() {
    var items = CONTENT.stats || CFG.stats || [];
    if (!items.length) return '';
    var html = '<section id="stats" class="relative py-20" style="background:var(--bg-deep,#1c1516)">' +
      '<div class="mx-auto max-w-7xl px-5 sm:px-8">' +
        '<div class="grid grid-cols-2 gap-8 md:grid-cols-4">';
    items.forEach(function (s) {
      html += '<div class="text-center">' +
        '<p class="font-display text-4xl font-medium sm:text-5xl" style="color:var(--gold,#c9b037)">' + (s.value || s.end || '') + (s.suffix || '') + '</p>' +
        '<p class="mt-2 text-[12px]" style="color:rgba(242,233,225,.6)">' + (s.label || '') + '</p>' +
      '</div>';
    });
    html += '</div></div></section>';
    return html;
  }

  function renderBookingAddons() {
    var items = CONTENT.bookingAddons || CFG.bookingAddons || [];
    if (!items.length) return '';
    var h = HEADINGS['booking-addons'] || HEADINGS.extras || {};
    var html = '<section id="booking-addons" class="relative py-24 sm:py-32" style="background:var(--bg,#f5f0e8)">' +
      '<div class="mx-auto max-w-7xl px-5 sm:px-8">' +
        renderSectionHeading('Little extras', h) +
        '<div class="mt-12 grid gap-4 sm:grid-cols-2">';
    items.forEach(function (a) {
      html += '<div class="flex items-center justify-between rounded-[1.2rem] border px-5 py-4 transition-all hover:border-gold/40" style="border-color:rgba(212,165,165,.25);background:var(--surface,#fffdf8)">' +
        '<div class="flex items-center gap-4">' +
          '<div class="flex h-10 w-10 items-center justify-center rounded-full" style="background:rgba(201,176,55,.1);color:var(--gold,#c9b037)">' + icon(a.icon) + '</div>' +
          '<div><p class="font-display text-[15px]" style="color:var(--ink,#3a2e2f)">' + (a.name || '') + '</p>' +
          (a.desc ? '<p class="text-[12px]" style="color:var(--ink-soft,#6d5f56)">' + a.desc + '</p>' : '') + '</div>' +
        '</div>' +
        '<span class="font-display text-lg" style="color:var(--ink,#3a2e2f)">+£' + (a.price || 0) + '</span>' +
      '</div>';
    });
    html += '</div></div></section>';
    return html;
  }

  /* ── 5. Insert sections after React mounts ── */
  function insertSections() {
    var main = document.getElementById("main-content");
    if (!main) return false;
    if (document.getElementById("luxe-patch-sections")) return true;

    var slots = CFG.slots || [];
    var sectionOrder = [];
    slots.forEach(function (s) {
      if (s.enabled === false) return;
      if (s.id === "amenities" || s.id === "tiers" || s.id === "stats" || s.id === "booking-addons") {
        sectionOrder.push(s.id);
      }
    });

    if (!sectionOrder.length) return true;

    var wrapper = document.createElement("div");
    wrapper.id = "luxe-patch-sections";
    var html = "";
    sectionOrder.forEach(function (id) {
      switch (id) {
        case "amenities":      html += renderAmenities(); break;
        case "tiers":          html += renderTiers(); break;
        case "stats":          html += renderStats(); break;
        case "booking-addons": html += renderBookingAddons(); break;
      }
    });

    if (!html) return true;
    wrapper.innerHTML = html;

    var footer = document.querySelector("footer");
    if (footer && footer.parentNode) {
      footer.parentNode.insertBefore(wrapper, footer);
    } else {
      document.body.appendChild(wrapper);
    }
    return true;
  }

  var attempts = 0;
  var timer = setInterval(function () {
    attempts++;
    if (insertSections() || attempts > 50) {
      clearInterval(timer);
    }
  }, 200);

  if (window.location.hash === "#console") {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }
})();
</script>
<?php wp_footer(); ?>
</body>
</html>
