import{J as $}from"./jszip.min-BPBTLaLD.js";import{f as u,a as b,b as w}from"./index-BDKRCmi6.js";function F(t,i){const o=URL.createObjectURL(t);S(o,i),setTimeout(()=>URL.revokeObjectURL(o),4e3)}function S(t,i){const o=document.createElement("a");o.href=t,o.download=i,o.click()}function j(){return new Blob([JSON.stringify(u(),null,2)],{type:"application/json"})}const z=`/*
Theme Name:   Luxe Hair Studio
Theme URI:    https://luxehairstudio.example
Author:       Luxe Atelier
Author URI:   https://luxehairstudio.example
Description:  Ultra-premium hairdressing salon theme. The frontend is the bundled Luxe React application (virtual try-on mirror, scroll-driven transformation hero, AI consultation, booking, drag-and-drop Atelier Console). WordPress manages settings, the Customizer, content and one-click demo import; React renders everything visitors see.
Version:      5.2.0
Requires at least: 6.0
Tested up to: 6.5
Requires PHP: 8.0
License:      GNU General Public License v2 or later
License URI:  http://www.gnu.org/licenses/gpl-2.0.html
Text Domain:  luxe
Tags:         salon, beauty, hair, custom-colors, custom-logo, custom-menu, one-column, translation-ready
*/
`,v=`<?php
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
	$config        = file_exists( $defaults_file ) ? json_decode( file_get_contents( $defaults_file ), true ) : array();
	if ( ! is_array( $config ) ) { $config = array(); }

	$stored = get_option( 'luxe_config', null );
	if ( is_array( $stored ) && ! empty( $stored ) ) {
		$config = array_replace_recursive( $config, $stored );
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

	return $config;
}

require get_template_directory() . '/inc/cpt.php';
require get_template_directory() . '/inc/enqueue.php';
require get_template_directory() . '/inc/customizer.php';
require get_template_directory() . '/inc/rest.php';
require get_template_directory() . '/inc/demo-import.php';
`,k=`<?php
/**
 * Enqueue the compiled Luxe React application and bridge settings to it.
 *
 * @package luxe
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

function luxe_enqueue_app() {
	$uri = get_template_directory_uri();

	/* The compiled application — byte-identical to the demo build. */
	wp_enqueue_style( 'luxe-app', $uri . '/assets/build/index.css', array(), LUXE_VERSION );
	wp_enqueue_style(
		'luxe-google-fonts',
		'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Cormorant+Infant:ital,wght@1,400;1,500&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@300;400;500&family=Playfair+Display:ital,wght@0,500;0,700;1,500&display=swap',
		array(),
		null
	);

	wp_enqueue_script( 'luxe-app', $uri . '/assets/build/index.js', array(), LUXE_VERSION, true );

	/* The bundle is an ES module. */
	wp_script_add_data( 'luxe-app', 'type', 'module' );

	/* Spec bridge: runtime settings + REST endpoint for the app. */
	wp_localize_script(
		'luxe-app',
		'wpReactSettings',
		array(
			'restUrl' => esc_url_raw( rest_url( 'luxe/v1/settings' ) ),
			'homeUrl' => esc_url_raw( home_url( '/' ) ),
			'nonce'   => wp_create_nonce( 'wp_rest' ),
		)
	);
}
add_action( 'wp_enqueue_scripts', 'luxe_enqueue_app' );
`,C=`<?php
/**
 * Luxe Customizer — complete control panel.
 *
 * Every section the React app consumes is exposed here with the original
 * build's values as defaults, so the theme is pixel-perfect out of the box.
 * Saving republishes window.__LUXE_CONFIG__ on the next (preview) load.
 *
 * @package luxe
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

function luxe_customize_register( $wp_customize ) {
	/* Only authorized users ever reach the Customizer. */
	if ( ! current_user_can( 'edit_theme_options' ) ) { return; }

	$d = luxe_customizer_defaults();

	/* ── Colors ─────────────────────────────────────────────── */
	$wp_customize->add_section( 'luxe_colors', array( 'title' => __( 'Luxe Colors', 'luxe' ), 'priority' => 20 ) );
	$colors = array(
		'luxe_color_rose'      => array( __( 'Dusty Rose (primary)', 'luxe' ), $d['luxe_color_rose'] ),
		'luxe_color_rose_deep' => array( __( 'Mauve Taupe (primary deep)', 'luxe' ), $d['luxe_color_rose_deep'] ),
		'luxe_color_gold'      => array( __( 'Soft Gold (luxury accent)', 'luxe' ), $d['luxe_color_gold'] ),
		'luxe_color_sage'      => array( __( 'Sage Mist (cool balance)', 'luxe' ), $d['luxe_color_sage'] ),
		'luxe_color_accent'    => array( __( 'Accent / CTA', 'luxe' ), $d['luxe_color_accent'] ),
	);
	foreach ( $colors as $id => $meta ) {
		$wp_customize->add_setting( $id, array( 'default' => $meta[1], 'sanitize_callback' => 'sanitize_hex_color', 'transport' => 'refresh' ) );
		$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, $id, array( 'label' => $meta[0], 'section' => 'luxe_colors' ) ) );
	}

	/* ── Typography ─────────────────────────────────────────── */
	$wp_customize->add_section( 'luxe_typography', array( 'title' => __( 'Luxe Typography', 'luxe' ), 'priority' => 30 ) );
	$wp_customize->add_setting( 'luxe_font_display', array( 'default' => $d['luxe_font_display'], 'sanitize_callback' => 'sanitize_text_field', 'transport' => 'refresh' ) );
	$wp_customize->add_control( 'luxe_font_display', array(
		'label'   => __( 'Display Typeface', 'luxe' ),
		'section' => 'luxe_typography',
		'type'    => 'select',
		'choices' => array(
			'cormorant' => __( 'Cormorant Garamond (default)', 'luxe' ),
			'fraunces'  => __( 'Fraunces', 'luxe' ),
			'playfair'  => __( 'Playfair Display', 'luxe' ),
		),
	) );
	$wp_customize->add_setting( 'luxe_font_size_base', array( 'default' => $d['luxe_font_size_base'], 'sanitize_callback' => 'absint', 'transport' => 'refresh' ) );
	$wp_customize->add_control( 'luxe_font_size_base', array( 'label' => __( 'Base Font Size (px)', 'luxe' ), 'section' => 'luxe_typography', 'type' => 'number', 'input_attrs' => array( 'min' => 14, 'max' => 18 ) ) );

	/* ── Layout ─────────────────────────────────────────────── */
	$wp_customize->add_section( 'luxe_layout', array( 'title' => __( 'Luxe Layout', 'luxe' ), 'priority' => 40 ) );
	$wp_customize->add_setting( 'luxe_radius', array( 'default' => $d['luxe_radius'], 'sanitize_callback' => 'floatval', 'transport' => 'refresh' ) );
	$wp_customize->add_control( 'luxe_radius', array( 'label' => __( 'Corner Radius Scale', 'luxe' ), 'section' => 'luxe_layout', 'type' => 'range', 'input_attrs' => array( 'min' => 0.3, 'max' => 1.8, 'step' => 0.05 ) ) );
	$wp_customize->add_setting( 'luxe_density', array( 'default' => $d['luxe_density'], 'sanitize_callback' => 'floatval', 'transport' => 'refresh' ) );
	$wp_customize->add_control( 'luxe_density', array( 'label' => __( 'Section Density', 'luxe' ), 'section' => 'luxe_layout', 'type' => 'range', 'input_attrs' => array( 'min' => 0.85, 'max' => 1.15, 'step' => 0.01 ) ) );

	/* ── Header ─────────────────────────────────────────────── */
	$wp_customize->add_section( 'luxe_header', array( 'title' => __( 'Luxe Header', 'luxe' ), 'priority' => 50 ) );
	$wp_customize->add_setting( 'luxe_logo_upload', array( 'default' => '', 'sanitize_callback' => 'esc_url_raw', 'transport' => 'refresh' ) );
	$wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize, 'luxe_logo_upload', array( 'label' => __( 'Logo (optional — default is the brand wordmark)', 'luxe' ), 'section' => 'luxe_header' ) ) );

	/* ── Footer ─────────────────────────────────────────────── */
	$wp_customize->add_section( 'luxe_footer', array( 'title' => __( 'Luxe Footer', 'luxe' ), 'priority' => 60 ) );
	$wp_customize->add_setting( 'luxe_footer_copyright', array( 'default' => '', 'sanitize_callback' => 'sanitize_text_field', 'transport' => 'refresh' ) );
	$wp_customize->add_control( 'luxe_footer_copyright', array( 'label' => __( 'Copyright Line', 'luxe' ), 'section' => 'luxe_footer', 'type' => 'text' ) );

	/* ── Buttons ────────────────────────────────────────────── */
	$wp_customize->add_section( 'luxe_buttons', array( 'title' => __( 'Luxe Buttons', 'luxe' ), 'priority' => 70, 'description' => __( 'Button colour derives from the Accent / Soft Gold tokens above; these variables are published as --luxe-btn-* for child themes.', 'luxe' ) ) );
	$wp_customize->add_setting( 'luxe_btn_radius', array( 'default' => 999, 'sanitize_callback' => 'absint', 'transport' => 'refresh' ) );
	$wp_customize->add_control( 'luxe_btn_radius', array( 'label' => __( 'Button Radius (px)', 'luxe' ), 'section' => 'luxe_buttons', 'type' => 'number', 'input_attrs' => array( 'min' => 0, 'max' => 999 ) ) );

	/* ── Animations ─────────────────────────────────────────── */
	$wp_customize->add_section( 'luxe_animations', array( 'title' => __( 'Luxe Animations', 'luxe' ), 'priority' => 80 ) );
	$wp_customize->add_setting( 'luxe_anim_master', array( 'default' => $d['luxe_anim_master'], 'sanitize_callback' => 'rest_sanitize_boolean', 'transport' => 'refresh' ) );
	$wp_customize->add_control( 'luxe_anim_master', array( 'label' => __( 'Enable Animations', 'luxe' ), 'section' => 'luxe_animations', 'type' => 'checkbox' ) );
	$wp_customize->add_setting( 'luxe_anim_speed', array( 'default' => $d['luxe_anim_speed'], 'sanitize_callback' => 'floatval', 'transport' => 'refresh' ) );
	$wp_customize->add_control( 'luxe_anim_speed', array( 'label' => __( 'Global Speed Multiplier', 'luxe' ), 'section' => 'luxe_animations', 'type' => 'range', 'input_attrs' => array( 'min' => 0.5, 'max' => 1.6, 'step' => 0.05 ) ) );
	$wp_customize->add_setting( 'luxe_hero_speed', array( 'default' => $d['luxe_hero_speed'], 'sanitize_callback' => 'floatval', 'transport' => 'refresh' ) );
	$wp_customize->add_control( 'luxe_hero_speed', array( 'label' => __( 'Hero Scroll Pace', 'luxe' ), 'section' => 'luxe_animations', 'type' => 'range', 'input_attrs' => array( 'min' => 0.5, 'max' => 2.5, 'step' => 0.05 ) ) );

	/* ── Advanced ───────────────────────────────────────────── */
	$wp_customize->add_section( 'luxe_advanced', array( 'title' => __( 'Luxe Advanced', 'luxe' ), 'priority' => 90 ) );
	$wp_customize->add_setting( 'luxe_custom_css', array( 'default' => '', 'sanitize_callback' => 'wp_strip_all_tags', 'transport' => 'refresh' ) );
	$wp_customize->add_control( 'luxe_custom_css', array( 'label' => __( 'Custom CSS', 'luxe' ), 'section' => 'luxe_advanced', 'type' => 'textarea' ) );
}
add_action( 'customize_register', 'luxe_customize_register' );

/* Publish button CSS variables for child themes / custom CSS. */
function luxe_button_css_vars() {
	$accent = get_theme_mod( 'luxe_color_accent', '#C9B037' );
	$radius = absint( get_theme_mod( 'luxe_btn_radius', 999 ) );
	echo '<style id="luxe-button-vars">:root{--luxe-btn-bg:' . esc_attr( $accent ) . ';--luxe-btn-radius:' . esc_attr( $radius ) . 'px;}</style>' . "
";
}
add_action( 'wp_head', 'luxe_button_css_vars', 20 );

/* Inject admin Custom CSS (Advanced section) into the page head. */
function luxe_custom_css_output() {
	$css = get_theme_mod( 'luxe_custom_css', '' );
	if ( $css ) { echo '<style id="luxe-custom-css">' . wp_strip_all_tags( $css ) . '</style>' . "
"; }
}
add_action( 'wp_head', 'luxe_custom_css_output', 30 );
`,T=`<?php
/**
 * REST endpoint exposing the merged Luxe configuration.
 * GET  /wp-json/luxe/v1/settings  — public (the settings are already rendered
 *      into the page; this is for tooling / live refresh).
 * POST /wp-json/luxe/v1/settings  — authorized save (edit_theme_options).
 *
 * @package luxe
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

add_action( 'rest_api_init', function () {
	register_rest_route( 'luxe/v1', '/settings', array(
		array(
			'methods'             => 'GET',
			'callback'            => function () { return luxe_merged_config(); },
			'permission_callback' => '__return_true',
		),
		array(
			'methods'             => 'POST',
			'callback'            => function ( $request ) {
				$body = $request->get_json_params();
				if ( ! is_array( $body ) ) { return new WP_Error( 'luxe_bad_body', 'Invalid payload.', array( 'status' => 400 ) ); }
				update_option( 'luxe_config', $body );
				return luxe_merged_config();
			},
			'permission_callback' => function () { return current_user_can( 'edit_theme_options' ); },
		),
	) );
} );
`,A=`<?php
/**
 * Plugin-free one-click demo import.
 *
 * Reads luxe-config.json, stores it as the luxe_config option, mirrors the
 * design values into the Customizer (theme_mods), assigns a static front
 * page, and publishes the demo pages. The result: the site immediately looks
 * identical to the React demo with zero manual configuration.
 *
 * @package luxe
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

/* Admin notice with the import button after activation. */
function luxe_import_notice() {
	if ( ! current_user_can( 'edit_theme_options' ) ) { return; }
	if ( get_option( 'luxe_demo_imported' ) ) { return; }
	$url = wp_nonce_url( admin_url( 'admin-post.php?action=luxe_demo_import' ), 'luxe_demo_import' );
	echo '<div class="notice notice-info is-dismissible"><p><strong>' . esc_html__( 'Luxe Hair Studio', 'luxe' ) . '</strong> — ' .
		esc_html__( 'Get the exact demo look in one click.', 'luxe' ) .
		' <a class="button button-primary" href="' . esc_url( $url ) . '">' . esc_html__( 'One-Click Import Demo Content', 'luxe' ) . '</a></p></div>';
}
add_action( 'admin_notices', 'luxe_import_notice' );

function luxe_demo_import() {
	if ( ! current_user_can( 'edit_theme_options' ) ) { wp_die( esc_html__( 'Unauthorized.', 'luxe' ) ); }
	check_admin_referer( 'luxe_demo_import' );

	$file = get_template_directory() . '/luxe-config.json';
	if ( file_exists( $file ) ) {
		$config = json_decode( file_get_contents( $file ), true );
		if ( is_array( $config ) ) {
			update_option( 'luxe_config', $config );

			/* Mirror the design values into the Customizer so the panel matches. */
			$design = isset( $config['design'] ) && is_array( $config['design'] ) ? $config['design'] : array();
			$map    = array(
				'rose'            => 'luxe_color_rose',
				'roseDeep'        => 'luxe_color_rose_deep',
				'gold'            => 'luxe_color_gold',
				'sage'            => 'luxe_color_sage',
				'accent'          => 'luxe_color_accent',
				'displayFont'     => 'luxe_font_display',
				'baseFontSize'    => 'luxe_font_size_base',
				'radius'          => 'luxe_radius',
				'density'         => 'luxe_density',
				'animSpeed'       => 'luxe_anim_speed',
				'heroScrollSpeed' => 'luxe_hero_speed',
				'motion'          => 'luxe_anim_master',
			);
			foreach ( $map as $design_key => $mod_key ) {
				if ( isset( $design[ $design_key ] ) ) { set_theme_mod( $mod_key, $design[ $design_key ] ); }
			}
		}
	}

	/* Create (or reuse) a Home page and set it as the static front page. */
	$home_id = luxe_ensure_page( 'Home', 'home' );
	if ( $home_id ) {
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $home_id );
	}

	update_option( 'luxe_demo_imported', 1 );
	wp_safe_redirect( admin_url( 'themes.php?luxe-imported=1' ) );
	exit;
}
add_action( 'admin_post_luxe_demo_import', 'luxe_demo_import' );

/* Create a page if it does not exist (never overwrites existing content). */
function luxe_ensure_page( $title, $slug ) {
	$existing = get_page_by_path( $slug );
	if ( $existing ) { return $existing->ID; }
	$id = wp_insert_post( array(
		'post_title'   => $title,
		'post_name'    => $slug,
		'post_status'  => 'publish',
		'post_type'    => 'page',
		'post_content' => '',
	) );
	return is_wp_error( $id ) ? 0 : $id;
}
`,P=`<?php
/**
 * Luxe content types. The React app renders these via the REST API and the
 * luxe_config store; registering them keeps content editable in WP admin.
 *
 * @package luxe
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

function luxe_register_cpts() {
	$types = array(
		'luxe_service'        => __( 'Services', 'luxe' ),
		'luxe_stylist'        => __( 'Stylists', 'luxe' ),
		'luxe_testimonial'    => __( 'Testimonials', 'luxe' ),
		'luxe_transformation' => __( 'Transformations', 'luxe' ),
	);
	foreach ( $types as $slug => $label ) {
		register_post_type( $slug, array(
			'labels'       => array( 'name' => $label, 'singular_name' => rtrim( $label, 's' ) ),
			'public'       => true,
			'show_in_rest' => true,
			'supports'     => array( 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields' ),
			'menu_icon'    => 'dashicons-schedule',
		) );
	}
}
add_action( 'init', 'luxe_register_cpts' );
`,R=t=>`<!doctype html>
<html <?php language_attributes(); ?>>
<head>
${t}
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
`,L=`<?php
/**
 * The React mount point + configuration bridge, then the enqueued bundle.
 * The inline classic script sets window.__LUXE_CONFIG__ (and wpReactSettings
 * fallback) BEFORE the deferred ES module executes, so the app boots with the
 * admin's saved configuration.
 */
?>
<div id="root"></div>
<script>
	window.__LUXE_CONFIG__ = <?php echo wp_json_encode( luxe_merged_config() ); ?>;
	window.wpReactSettings = window.wpReactSettings || {};
<\/script>
<?php wp_footer(); ?>
</body>
</html>
`,r=`<?php get_header(); get_footer(); ?>
`,E=`<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:wp="http://wordpress.org/export/1.2/">
<channel>
	<title>Luxe Hair Studio</title>
	<item>
		<title>Home</title>
		<wp:post_name>home</wp:post_name>
		<wp:post_type>page</wp:post_type>
		<wp:status>publish</wp:status>
	</item>
</channel>
</rss>
`,I=`[]
`,H=`=== Luxe Hair Studio ===
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
`;function q(){const t=["Services","Transformations","The Mirror","AI Consultation","Stylists","Booking","Reserve a Chair","The Sensory Salon","Book Your Transformation","Wander the menu","Everything","Junior","Senior","Master","Book this shade","Save the look","Hold · before","Your colour","Mix your own","Upload","Camera · live","Preparing the mirror…","AI hair-map · on","Classic engine","Book a chair","Prices","Opening hours","Find my stylist","Message the concierge","Privacy","Terms","Accessibility","Cookie consent","Accept","Decline","Email for newsletter","Join","Download settings & data","Download theme ZIP","One-Click Import Demo Content","Luxe Hair Studio"],i=["# Luxe Hair Studio translation template.","# Copyright (C) Luxe Hair Studio","# This file is distributed under the same license as the theme.",'msgid ""','msgstr ""','"Project-Id-Version: Luxe Hair Studio 1.0.0\\n"','"MIME-Version: 1.0\\n"','"Content-Type: text/plain; charset=UTF-8\\n"','"Content-Transfer-Encoding: 8bit\\n"','"X-Domain: luxe\\n"',""];return t.forEach(o=>i.push(`#: src
msgid "${o}"
msgstr ""
`)),i.join(`
`)}function B(t){const o=new DOMParser().parseFromString(t,"text/html").head;return o.querySelectorAll('script[type="module"][src]').forEach(a=>a.remove()),o.querySelectorAll('link[rel="stylesheet"]').forEach(a=>a.remove()),o.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach(a=>a.remove()),o.innerHTML.trim()}async function l(t,i,o){const a=await fetch(t,{cache:"no-store"});if(!a.ok)throw new Error(`${i}: HTTP ${a.status} for ${t}`);const s=await a.text();if(/^\s*</.test(s)&&i==="app script")throw new Error(`${i}: the server answered with markup, not JavaScript (stale cache / proxy fallback)`);if(s.length<o)throw new Error(`${i}: response too small (${s.length} bytes) — expected the real bundle`);return s}async function O(){try{const t=await fetch(w.wpScreenshot,{cache:"no-store"});return t.ok?await t.arrayBuffer():null}catch{return null}}async function M(t){const i=location.origin+location.pathname,o=await l(i,"page html",500),a=new DOMParser().parseFromString(o,"text/html"),s=a.querySelector('script[type="module"][src]'),_=a.querySelector('link[rel="stylesheet"][href]');if(!s||!_)throw new Error("Could not locate the production bundle in the served page.");const p=s.getAttribute("src"),m=_.getAttribute("href"),h=await l(new URL(p,location.origin).href,"app script",1e5),g=await l(new URL(m,location.origin).href,"stylesheet",1e4),f=JSON.stringify(u(t),null,2),x=JSON.stringify({design:t.design},null,2),y=JSON.stringify(u(b),null,2),n=new $,e=n.folder("luxe-hair-studio");e.file("style.css",z),e.file("functions.php",v),e.file("header.php",R(B(o))),e.file("footer.php",L),e.file("index.php",r),e.file("front-page.php",r),e.file("page.php",r),e.file("single.php",r),e.file("404.php",r),e.file("inc/enqueue.php",k),e.file("inc/customizer.php",C),e.file("inc/rest.php",T),e.file("inc/demo-import.php",A),e.file("inc/cpt.php",P),e.file("inc/defaults.json",y),e.file("assets/build/index.js",h),e.file("assets/build/index.css",g),e.file("demo-import/content.xml",E),e.file("demo-import/customizer.json",x),e.file("demo-import/widgets.json",I),e.file("luxe-config.json",f),e.file("languages/luxe.pot",q()),e.file("readme.txt",H);const c=await O();c&&e.file("screenshot.png",c);const d=n.folder("luxe-hair-studio-child");return d.file("style.css",`/*
Theme Name: Luxe Hair Studio Child
Template: luxe-hair-studio
*/
`),d.file("functions.php",`<?php
function luxe_child_enqueue() { wp_enqueue_style( 'luxe-parent', get_template_directory_uri() . '/style.css' ); }
add_action( 'wp_enqueue_scripts', 'luxe_child_enqueue' );
`),n.generateAsync({type:"blob",compression:"DEFLATE"})}export{M as buildFullThemeZip,F as downloadBlob,j as exportSettingsJson};
