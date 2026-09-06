<?php
/**
 * Luxe Hair Studio — theme bootstrap.
 *
 * Boots the compiled Luxe React application (assets/build) inside WordPress
 * and feeds it the admin's saved configuration. The Customizer, theme options
 * and demo import are gated to users with the edit_theme_options capability.
 *
 * @package luxe
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

define( 'LUXE_VERSION', wp_get_theme()->get( 'Version' ) );

/* 6.12 / 10.1 — detect an active SEO plugin so header.php can defer document
   metadata (title, description, OG, Twitter, JSON-LD) to it and avoid
   duplicate/conflicting tags. */
function luxe_seo_plugin_active() {
	return defined( 'WPSEO_VERSION' )          /* Yoast SEO */
		|| class_exists( 'RankMath' )           /* Rank Math */
		|| defined( 'AIOSEO_FILE' )             /* All in One SEO */
		|| defined( 'SEOPRESS_VERSION' );       /* SEOPress */
}

/* Block non-authorized users from customize.php and strip the capability. */
add_filter( 'user_has_cap', function ( $allcaps, $caps ) {
	if ( in_array( 'edit_theme_options', $caps, true ) && ! current_user_can( 'manage_options' ) && ! in_array( 'administrator', wp_get_current_user()->roles, true ) ) {
		$allcaps['edit_theme_options'] = false;
	}
	return $allcaps;
}, 10, 2 );

add_action( 'admin_init', function () {
	global $pagenow;
	if ( 'customize.php' === $pagenow && ! current_user_can( 'edit_theme_options' ) ) {
		wp_safe_redirect( home_url() );
		exit;
	}
} );

function luxe_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'custom-logo' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'woocommerce' );
	register_nav_menus( array( 'primary' => __( 'Primary Menu', 'luxe' ) ) );
	load_theme_textdomain( 'luxe', get_template_directory() . '/languages' );
}
add_action( 'after_setup_theme', 'luxe_setup' );

/**
 * The Customizer design defaults — exactly the values of the original React
 * build, sourced from inc/defaults.json. Out-of-box the theme is pixel-perfect.
 */
function luxe_customizer_defaults() {
	$defaults_file = get_template_directory() . '/inc/defaults.json';
	$defaults      = file_exists( $defaults_file ) ? json_decode( file_get_contents( $defaults_file ), true ) : array();
	/* Unwrap the {meta, config} structure if present. */
	if ( isset( $defaults['config'] ) && is_array( $defaults['config'] ) ) {
		$defaults = $defaults['config'];
	}
	$design        = isset( $defaults['design'] ) && is_array( $defaults['design'] ) ? $defaults['design'] : array();
	$get           = function ( $key, $fallback ) use ( $design ) {
		return isset( $design[ $key ] ) ? $design[ $key ] : $fallback;
	};
	return array(
		'luxe_color_rose'     => $get( 'rose', '#D4A5A5' ),
		'luxe_color_rose_deep' => $get( 'roseDeep', '#A67B7B' ),
		'luxe_color_gold'     => $get( 'gold', '#C9B037' ),
		'luxe_color_sage'     => $get( 'sage', '#A8B5A0' ),
		'luxe_color_accent'   => $get( 'accent', '#C9B037' ),
		'luxe_font_display'   => $get( 'displayFont', 'cormorant' ),
		'luxe_font_size_base' => $get( 'baseFontSize', 16 ),
		'luxe_radius'         => $get( 'radius', 1 ),
		'luxe_density'        => $get( 'density', 1 ),
		'luxe_anim_speed'     => $get( 'animSpeed', 1 ),
		'luxe_hero_speed'     => $get( 'heroScrollSpeed', 2 ),
		'luxe_anim_master'    => $get( 'motion', true ),
	);
}

/** Read the admin's Customizer design choices (defaults = React values). */
function luxe_design_theme_mods() {
	$d = luxe_customizer_defaults();
	return array(
		'rose'            => get_theme_mod( 'luxe_color_rose', $d['luxe_color_rose'] ),
		'roseDeep'        => get_theme_mod( 'luxe_color_rose_deep', $d['luxe_color_rose_deep'] ),
		'gold'            => get_theme_mod( 'luxe_color_gold', $d['luxe_color_gold'] ),
		'sage'            => get_theme_mod( 'luxe_color_sage', $d['luxe_color_sage'] ),
		'accent'          => get_theme_mod( 'luxe_color_accent', $d['luxe_color_accent'] ),
		'displayFont'     => get_theme_mod( 'luxe_font_display', $d['luxe_font_display'] ),
		'baseFontSize'    => (float) get_theme_mod( 'luxe_font_size_base', $d['luxe_font_size_base'] ),
		'radius'          => (float) get_theme_mod( 'luxe_radius', $d['luxe_radius'] ),
		'density'         => (float) get_theme_mod( 'luxe_density', $d['luxe_density'] ),
		'animSpeed'       => (float) get_theme_mod( 'luxe_anim_speed', $d['luxe_anim_speed'] ),
		'heroScrollSpeed' => (float) get_theme_mod( 'luxe_hero_speed', $d['luxe_hero_speed'] ),
		'motion'          => (bool) get_theme_mod( 'luxe_anim_master', $d['luxe_anim_master'] ),
	);
}

/**
 * Build the configuration object handed to the React app.
 * Order of precedence (later wins):
 *   1. inc/defaults.json            — the original React defaults
 *   2. luxe_config option           — content/design saved by demo import or the app
 *   3. Customizer design choices    — only where the admin changed a value
 *   4. Custom CSS / logo / footer   — header & footer Customizer fields
 */
function luxe_merged_config() {
	$defaults_file = get_template_directory() . '/inc/defaults.json';
	$raw           = file_exists( $defaults_file ) ? json_decode( file_get_contents( $defaults_file ), true ) : array();
	/* Unwrap the {meta, config} structure — React expects the flat inner object. */
	$config = array();
	if ( is_array( $raw ) ) {
		$config = isset( $raw['config'] ) && is_array( $raw['config'] ) ? $raw['config'] : $raw;
	}

	$stored = get_option( 'luxe_config', null );
	if ( is_array( $stored ) && ! empty( $stored ) ) {
		/* Unwrap stored config too if it came from luxe-config.json / demo import. */
		if ( isset( $stored['config'] ) && is_array( $stored['config'] ) ) {
			$stored = $stored['config'];
		}
		$config = array_replace_recursive( $config, $stored );
	}

	/* Ensure all content arrays/objects that React components .map() over
	   are initialized — prevents "cannot read map of undefined" errors and
	   ensures sections like Amenities and Booking Addons always render. */
	$ensure_content = array(
		'amenities'       => array(),
		'bookingAddons'   => array(),
		'scents'          => array(),
		'marquee'         => array(),
		'stats'           => array(),
		'quiz'            => array(),
		'consult'         => array(),
		'products'        => array(),
		'packages'        => array(),
		'testimonials'    => array(),
		'services'        => array(),
		'stylists'        => array(),
		'gallery'         => array(),
		'tiers'           => array(),
		'bookingSteps'    => array(),
		'conciergeChips'  => array(),
		'booking'         => array(),  /* booking section wrapper */
		'experience'      => array(),  /* experience section wrapper */
		'hero'            => array(),
		'salon'           => array(),
		'footer'          => array(),
		'headings'        => array(),
		'labels'          => array(),
		'galleryFilters'  => array(),
	);
	if ( ! isset( $config['content'] ) || ! is_array( $config['content'] ) ) {
		$config['content'] = array();
	}
	foreach ( $ensure_content as $key => $default ) {
		if ( ! isset( $config['content'][ $key ] ) ) {
			$config['content'][ $key ] = $default;
		}
	}

	/* Apply Customizer design values that differ from their defaults — i.e. the
	   admin actually changed them. Unchanged Customizer values must not clobber
	   design choices already saved in luxe_config. */
	$defaults = luxe_customizer_defaults();
	$map      = array(
		'luxe_color_rose'      => 'rose',
		'luxe_color_rose_deep' => 'roseDeep',
		'luxe_color_gold'      => 'gold',
		'luxe_color_sage'      => 'sage',
		'luxe_color_accent'    => 'accent',
		'luxe_font_display'    => 'displayFont',
		'luxe_font_size_base'  => 'baseFontSize',
		'luxe_radius'          => 'radius',
		'luxe_density'         => 'density',
		'luxe_anim_speed'      => 'animSpeed',
		'luxe_hero_speed'      => 'heroScrollSpeed',
		'luxe_anim_master'     => 'motion',
	);
	$design = luxe_design_theme_mods();
	/* Ensure the design key exists before writing. */
	if ( ! isset( $config['design'] ) || ! is_array( $config['design'] ) ) {
		$config['design'] = array();
	}
	foreach ( $map as $mod_key => $design_key ) {
		$value = $design[ $design_key ];
		$def   = $defaults[ $mod_key ];
		// phpcs:ignore WordPress.PHP.StrictComparisons -- intentional loose compare for numeric strings
		if ( $value != $def ) {
			$config['design'][ $design_key ] = $value;
		}
	}

	$css = get_theme_mod( 'luxe_custom_css', '' );
	if ( $css ) { $config['customCss'] = $css; }

	$logo = get_theme_mod( 'luxe_logo_upload', '' );
	if ( $logo ) { $config['logoUrl'] = $logo; }

	$copy = get_theme_mod( 'luxe_footer_copyright', '' );
	if ( $copy && isset( $config['content']['footer'] ) ) {
		$config['content']['footer']['copyright'] = $copy;
	}

		/* Inject authentication context so React knows to show the Console. */
	$config['auth'] = luxe_auth_context();

	/* Add a version stamp so React can detect when server config changes.
	   This also helps bust any stale localStorage caching. */
	$config['_version'] = LUXE_VERSION;
	$config['_updated'] = get_option( 'luxe_config_updated', time() );

	return $config;
}



/**
 * Tell the React app whether the current user can access the Atelier Console.
 * Published into window.__LUXE_CONFIG__.auth so the UI shows the Console
 * entry button (and protects the route) only for authorized users.
 */
function luxe_auth_context() {
	return array(
		'isLoggedIn'     => is_user_logged_in(),
		'canAccessConsole' => current_user_can( 'edit_theme_options' ),
		'isAdmin'        => current_user_can( 'manage_options' ),
		'username'       => is_user_logged_in() ? wp_get_current_user()->display_name : '',
	);
}

/**
 * Admin menu: direct link to the Atelier Console from the WP sidebar.
 * Opens the React SPA route in a new tab for a full-screen editing experience.
 */
function luxe_add_console_menu() {
	add_menu_page(
		__( 'Atelier Console', 'luxe' ),
		__( 'Atelier Console', 'luxe' ),
		'edit_theme_options',
		'luxe-console',
		'luxe_render_console_admin_page',
		'dashicons-art',
		30
	);
	/* Also add a submenu shortcut under Appearance */
	add_submenu_page(
		'themes.php',
		__( 'Atelier Console', 'luxe' ),
		__( 'Atelier Console', 'luxe' ),
		'edit_theme_options',
		'luxe-console-sub',
		'luxe_render_console_admin_page'
	);
}
add_action( 'admin_menu', 'luxe_add_console_menu' );

/**
 * Admin page that renders the Atelier Console inside an iframe.
 * This gives a full-screen editing experience without leaving WP Admin.
 */
function luxe_render_console_admin_page() {
	$console_url = home_url( '/#console' );
	?>
	<div class="wrap" style="margin:0;padding:0;">
		<div style="padding:12px 20px;background:#1c1617;border-bottom:1px solid rgba(247,241,231,.1);display:flex;align-items:center;justify-content:space-between;">
			<div style="display:flex;align-items:center;gap:14px;">
				<span style="font-family:'Cormorant Garamond',Georgia,serif;font-size:28px;font-weight:500;letter-spacing:.15em;color:#C9B037;">ATELIER</span>
				<span style="font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#a89c94;">Console · Live Customization</span>
			</div>
			<a href="<?php echo esc_url( $console_url ); ?>" target="_blank" style="font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#C9B037;text-decoration:none;border:1px solid rgba(201,176,55,.4);padding:8px 16px;border-radius:999px;">Open in new tab ↗</a>
		</div>
		<iframe src="<?php echo esc_url( $console_url ); ?>" style="width:100%;height:calc(100vh - 100px);border:none;background:#161112;"></iframe>
	</div>
	<?php
}

/**
 * SPA route support: ensure WordPress serves the React app for known
 * client-side routes instead of returning a 404. The React router then
 * handles the actual route.
 */
function luxe_spa_route_support() {
	/* Only on the frontend, not admin, and only for 404s that match our routes */
	if ( is_admin() ) { return; }

	global $wp_query;

	/* If WordPress thinks this is a 404 but the path matches a known React route,
	   convert it to a 200 and load the home page template (which mounts React). */
	if ( is_404() ) {
		$request_uri = isset( $_SERVER['REQUEST_URI'] ) ? $_SERVER['REQUEST_URI'] : '';
		$path = trim( parse_url( $request_uri, PHP_URL_PATH ), '/' );

		$known_react_routes = array(
			'mirror', 'consultation', 'booking', 'services',
			'stylists', 'gallery', 'transformations', 'experience',
		);
		/* /atelier-console is NOT a route — it's a hash-triggered overlay.
		   Redirect legacy attempts to the homepage with the correct hash. */
		if ( $first_segment === 'atelier-console' || $first_segment === 'console' ) {
			wp_safe_redirect( home_url( '/#console' ), 301 );
			exit;
		}

		/* Check if the first path segment matches a known route */
		$first_segment = explode( '/', $path )[0];

		if ( in_array( $first_segment, $known_react_routes, true ) ) {
			/* Tell WordPress this is NOT a 404 */
			$wp_query->is_404 = false;
			$wp_query->is_home = true;
			status_header( 200 );

			/* Load the front page template */
			include( get_template_directory() . '/index.php' );
			exit;
		}
	}
}
add_action( 'template_redirect', 'luxe_spa_route_support', 1 );

/**
 * Add a quick-access admin bar link to the Atelier Console.
 */
function luxe_admin_bar_console_link( $wp_admin_bar ) {
	if ( ! current_user_can( 'edit_theme_options' ) ) { return; }
	$wp_admin_bar->add_node( array(
		'id'    => 'luxe-console',
		'title' => '<span style="color:#C9B037;">✦</span> Atelier Console',
		'href'  => home_url( '/#console' ),
	) );
}
add_action( 'admin_bar_menu', 'luxe_admin_bar_console_link', 100 );







/**
 * Atelier Console width fix:
 * The panel uses max-w-md (448px) which is too narrow for the customization
 * options. Widen it and ensure proper internal layout.
 */
function luxe_console_width_fix() {
    if ( ! current_user_can( 'edit_theme_options' ) ) { return; }
    ?>
    <style id="luxe-console-width-fix">
    /* Widen the Atelier Console side panel.
       Target ONLY the Console by combining: fixed overlay + right-side absolute panel + max-w-md.
       The Console is the ONLY element with aria-label containing "Atelier" or "Console". */
    [aria-label*="Atelier"][aria-label*="Console"] > div[class*="absolute"][class*="right-0"][class*="max-w-md"],
    [aria-label*="Console"] > div[class*="absolute"][class*="right-0"][class*="max-w-md"],
    div[class*="fixed"][class*="inset-0"][class*="bg-black"][class*="backdrop-blur"] > div[class*="absolute"][class*="right-0"][class*="max-w-md"] {
        max-width: 42rem !important;  /* 672px - gives room for nav + content */
        width: 90vw !important;       /* Responsive on smaller screens */
    }
    
    /* Ensure internal flex layout uses the extra space properly */
    [aria-label*="Console"] > div[class*="absolute"][class*="right-0"] > div[class*="flex"] {
        width: 100% !important;
    }
    
    /* Make sure the close button header doesn't stretch */
    [aria-label*="Console"] > div[class*="absolute"][class*="right-0"] > div:first-child,
    [aria-label*="Console"] div[class*="justify-between"] {
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        flex-shrink: 0 !important;
    }
    
    /* Content area scrolls */
    [aria-label*="Console"] > div[class*="absolute"][class*="right-0"] > div[class*="flex-1"] {
        min-height: 0 !important;
        overflow-y: auto !important;
    }
    
    /* Sidebar nav scrolls if items overflow */
    [aria-label*="Console"] nav[class*="flex-col"],
    [aria-label*="Console"] div[class*="flex-col"][class*="gap-"] {
        overflow-y: auto !important;
        padding-bottom: 20px !important;
    }
    </style>
    <?php
}
add_action( 'wp_head', 'luxe_console_width_fix', 15 );



/**
 * Clear stale localStorage config cache for admin users.
 * The React app checks window.__LUXE_CONFIG__ first, but if anything
 * goes wrong with that injection, stale localStorage could take over.
 * This ensures the server-injected config is always the source of truth.
 */
function luxe_clear_stale_config_cache() {
    if ( ! current_user_can( 'edit_theme_options' ) ) { return; }
    $updated = get_option( 'luxe_config_updated', '0' );
    ?>
    <script>
    (function() {
        try {
            var serverUpdated = "<?php echo esc_js( $updated ); ?>";
            var lastSeen = localStorage.getItem("luxe-config-server-updated");
            
            /* If server config is newer than what we've seen, clear localStorage config
               to guarantee the PHP-injected window.__LUXE_CONFIG__ is used. */
            if (serverUpdated && lastSeen !== serverUpdated) {
                var keysToClear = [
                    "luxe-config-v3",
                    "luxe-presets-v3",
                    "luxe-presets-v2",
                    "luxe-custom-shade"
                ];
                keysToClear.forEach(function(k) {
                    try { localStorage.removeItem(k); } catch(e) {}
                });
                localStorage.setItem("luxe-config-server-updated", serverUpdated);
                console.log("%c[Luxe] Server config updated — cleared stale localStorage cache", "color:#C9B037;font-weight:bold;");
            }
        } catch(e) {
            /* localStorage might be unavailable in private mode */
        }
    })();
    </script>
    <?php
}
add_action( 'wp_footer', 'luxe_clear_stale_config_cache', 5 );



/**
 * Admin diagnostic: log the active config source to browser console.
 * Helps verify that PHP-injected config is reaching React correctly.
 */
function luxe_config_diagnostic() {
    if ( ! current_user_can( 'edit_theme_options' ) ) { return; }
    $updated = get_option( 'luxe_config_updated', 'never' );
    $has_stored = get_option( 'luxe_config', null ) ? 'yes' : 'no (using defaults only)';
    ?>
    <script>
    console.log("%c╔══════════════════════════════════════════════════╗", "color:#C9B037;font-weight:bold;");
    console.log("%c║  LUXE CONFIG DIAGNOSTIC (admin only)            ║", "color:#C9B037;font-weight:bold;");
    console.log("%c╠══════════════════════════════════════════════════╣", "color:#C9B037;font-weight:bold;");
    console.log("%c║  Config from DB: <?php echo esc_js( $has_stored ); ?>", "color:#f7f1e7;");
    console.log("%c║  Last updated:   <?php echo esc_js( $updated ); ?>", "color:#f7f1e7;");
    console.log("%c║  window.__LUXE_CONFIG__ keys: " + Object.keys(window.__LUXE_CONFIG__ || {}).length, "color:#f7f1e7;");
    if (window.__LUXE_CONFIG__ && window.__LUXE_CONFIG__.design) {
        console.log("%c║  Design.gold:    " + (window.__LUXE_CONFIG__.design.gold || "(not set)"), "color:#f7f1e7;");
        console.log("%c║  Design.rose:    " + (window.__LUXE_CONFIG__.design.rose || "(not set)"), "color:#f7f1e7;");
    }
    if (window.__LUXE_CONFIG__ && window.__LUXE_CONFIG__.content && window.__LUXE_CONFIG__.content.hero) {
        var hero = window.__LUXE_CONFIG__.content.hero;
        if (hero.stages && hero.stages[0]) {
            console.log("%c║  Hero stage 0 kicker: " + (hero.stages[0].kicker || "(not set)"), "color:#f7f1e7;");
        }
    }
    /* Check amenities and booking addons */
    var c = window.__LUXE_CONFIG__ && window.__LUXE_CONFIG__.content;
    if (c) {
        console.log("%c║  Amenities: " + (c.amenities ? c.amenities.length + " items" : "MISSING"), "color:#f7f1e7;");
        console.log("%c║  Booking Addons: " + (c.bookingAddons ? c.bookingAddons.length + " items" : "MISSING"), "color:#f7f1e7;");
        console.log("%c║  Slots enabled: " + (window.__LUXE_CONFIG__.slots ? window.__LUXE_CONFIG__.slots.filter(function(s){return s.enabled;}).map(function(s){return s.id;}).join(", ") : "MISSING"), "color:#f7f1e7;");
        if (c.amenities && c.amenities.length > 0) {
            console.log("%c║  Amenity[0]: " + c.amenities[0].title + " — " + c.amenities[0].desc, "color:#a8b5a0;");
        }
        if (c.bookingAddons && c.bookingAddons.length > 0) {
            console.log("%c║  Addon[0]: " + c.bookingAddons[0].name + " (£" + c.bookingAddons[0].price + ")", "color:#a8b5a0;");
        }
    }
    console.log("%c╚══════════════════════════════════════════════════╝", "color:#C9B037;font-weight:bold;");
    console.log("%c💡 After saving in Atelier Console, HARD REFRESH (Ctrl+Shift+R) to see changes.", "color:#a89c94;font-style:italic;");
    </script>
    <?php
}
add_action( 'wp_footer', 'luxe_config_diagnostic', 10 );

/**
 * Inject a floating "Open Atelier Console" button for authorized users.
 * The keyboard shortcut (⌘⇧A) works too, but a visible button ensures
 * discoverability. This is rendered into the footer via wp_footer.
 */
function luxe_inject_console_button() {
    if ( ! current_user_can( 'edit_theme_options' ) ) { return; }
    ?>
    <script>
    (function() {
        /* Wait for React to mount, then add the Console entry button to the footer area.
           The button triggers the same state as pressing ⌘⇧A or visiting #console. */
        function tryOpenConsole() {
            /* Method 1: Set the hash — React's App component checks for #console on mount */
            if (window.location.hash !== '#console') {
                window.location.hash = 'console';
            }
            /* Method 2: Dispatch the keyboard shortcut event */
            var evt = new KeyboardEvent('keydown', {
                key: 'A',
                code: 'KeyA',
                metaKey: true,
                shiftKey: true,
                ctrlKey: true,
                bubbles: true
            });
            document.dispatchEvent(evt);
        }

        /* Create a floating button */
        var btn = document.createElement('button');
        btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px;font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;"><span style="color:#C9B037;">✦</span> Open Atelier Console</span>';
        btn.setAttribute('style',
            'position:fixed;bottom:24px;left:24px;z-index:99998;' +
            'background:rgba(28,22,23,.92);backdrop-filter:blur(12px);' +
            'border:1px solid rgba(201,176,55,.4);color:#f7f1e7;' +
            'padding:12px 20px;border-radius:999px;cursor:pointer;' +
            'box-shadow:0 8px 32px rgba(0,0,0,.4);transition:all .2s;'
        );
        btn.onmouseenter = function() {
            btn.style.background = 'rgba(201,176,55,.15)';
            btn.style.borderColor = 'rgba(201,176,55,.7)';
            btn.style.transform = 'translateY(-1px)';
        };
        btn.onmouseleave = function() {
            btn.style.background = 'rgba(28,22,23,.92)';
            btn.style.borderColor = 'rgba(201,176,55,.4)';
            btn.style.transform = 'translateY(0)';
        };
        btn.onclick = tryOpenConsole;

        /* Also add a keyboard hint tooltip */
        btn.title = 'Keyboard shortcut: Cmd/Ctrl + Shift + A';

        /* Don't add if already present */
        if (!document.getElementById('luxe-console-btn')) {
            btn.id = 'luxe-console-btn';
            document.body.appendChild(btn);
        }
    })();
    </script>
    <?php
}
add_action( 'wp_footer', 'luxe_inject_console_button', 20 );


require get_template_directory() . '/inc/cpt.php';
require get_template_directory() . '/inc/enqueue.php';
require get_template_directory() . '/inc/customizer.php';
require get_template_directory() . '/inc/rest.php';
require get_template_directory() . '/inc/demo-import.php';
require get_template_directory() . '/inc/translate.php';
