<?php
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
		$raw = json_decode( file_get_contents( $file ), true );
		if ( is_array( $raw ) ) {
			/* Unwrap the {meta, config} structure before storing. */
			$config = isset( $raw['config'] ) && is_array( $raw['config'] ) ? $raw['config'] : $raw;
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
