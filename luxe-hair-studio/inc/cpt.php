<?php
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
