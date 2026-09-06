<?php
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
