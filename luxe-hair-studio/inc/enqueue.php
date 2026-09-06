<?php
/**
 * Enqueue the compiled Luxe React application and bridge settings to it.
 *
 * Uses the script_loader_tag filter to guarantee type="module" is added,
 * since wp_script_add_data('type','module') can be suppressed by some
 * WordPress configurations or security plugins.
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

	/* Register the main app script. Version is intentionally null on the
	   script itself: Vite resolves relative chunk URLs against the main
	   script's URL, and a ?ver= query string would make those relative
	   resolutions ambiguous. The version is still printed in style.css
	   header for reference. */
	wp_enqueue_script( 'luxe-app', $uri . '/assets/build/index-dzZerrrB.js', array(), null, true );

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

/**
 * Force type="module" on the main app script tag.
 * This is the reliable method — works on all WordPress 5.0+ installs
 * and survives plugin conflicts that strip wp_script_add_data attributes.
 */
function luxe_script_module_tag( $tag, $handle ) {
	if ( 'luxe-app' === $handle && false === strpos( $tag, 'type="module"' ) ) {
		$tag = str_replace( "<script ", '<script type="module" ', $tag );
	}
	return $tag;
}
add_filter( 'script_loader_tag', 'luxe_script_module_tag', 10, 2 );

/**
 * Strip any ?ver query arg that WordPress or plugins may re-inject on
 * our app script. Vite's relative chunk resolution is URL-sensitive.
 */
function luxe_strip_script_version( $src ) {
	if ( is_admin() ) { return $src; }
	if ( false !== strpos( $src, 'assets/build/index-dzZerrrB.js' ) ) {
		$src = remove_query_arg( 'ver', $src );
	}
	return $src;
}
add_filter( 'script_loader_src', 'luxe_strip_script_version', 99 );
