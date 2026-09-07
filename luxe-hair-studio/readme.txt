=== Luxe Hair Studio ===
Contributors: luxestudio
Requires at least: 6.0
Tested up to: 6.5
Requires PHP: 8.0
License: Proprietary - All Rights Reserved
License URI: https://example.com/license
Tags: salon, hair, beauty, booking, one-column, custom-colors, custom-logo, translation-ready

A React-native WordPress theme for a luxury hairdressing salon. The frontend is the
compiled React application (embedded byte-exact in assets/build/), so the installed
site renders identically to the demo. WordPress provides the Customizer, content via
custom post types (Services, Stylists, Testimonials, Transformations), a gated admin,
REST settings endpoints, and a one-click demo import.

== Description ==
Luxe Hair Studio pairs a cinematic, scroll-driven React frontend with a fully
customizable WordPress backoffice. Every color, font, layout and content value is
editable from Appearance > Customize or the bundled Atelier Console. Features include
a virtual try-on mirror, AI hair consultation, stylist matchmaker, online booking,
transformation gallery, and an AI concierge.

== Installation ==
1. Upload the theme ZIP via Appearance > Themes > Add New > Upload Theme.
2. Activate Luxe Hair Studio.
3. On the admin notice, click "One-Click Import Demo Content" to restore the demo.
4. Customize via Appearance > Customize (colors, typography, layout, animations).

== Frequently Asked Questions ==
= Does the theme require a page builder? =
No. It works standalone; the React app renders the entire frontend.

= Are settings preserved across updates? =
Yes. Settings live in the database (luxe_config option + theme mods), not in theme files.

= Can I use a child theme? =
Yes. A child theme (luxe-hair-studio-child) is included for safe overrides.

= Is the theme translation-ready? =
Yes. All strings use the "luxe" text domain. A starter template is included at
languages/luxe.pot. See the "Translating" section below.

= Does it work with WooCommerce / SEO / form plugins? =
Yes. The theme declares WooCommerce support, leaves SEO meta to your SEO plugin
(Yoast, Rank Math), and uses standard hooks so plugins can extend it.

== Translating ==
1. Open languages/luxe.pot in Poedit (or run "wp i18n make-pot . languages/luxe.pot").
2. Create a catalog for your language, e.g. languages/luxe-fr_FR.po, and translate.
3. Export the .mo alongside the .po in the languages/ folder.
4. Set the site language under Settings > General; WordPress loads your catalog.
All user-facing strings (navigation, labels, booking, mirror) honour the active locale.

== Support ==
* Documentation: see the "Description", "Installation" and "Translating" sections above.
* Email: hello@luxehairstudio.co.uk - replies within one business day.
* Support covers theme installation, the Customizer, demo import and bundled features.
* Support hours: Monday to Friday, 09:00-18:00 GMT.
* Before contacting us, please note your WordPress version, PHP version and the exact
  steps that reproduce the issue.

== Changelog ==
= 1.0.0 =
* Initial release.

== Upgrade Notice ==
= 1.0.0 =
Initial release.
