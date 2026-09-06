<?php
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
				/* The Console always sends a FLAT config object (no {meta,config} wrapper).
				   Store it exactly as received — luxe_merged_config() handles both formats. */
				$to_save = $body;
				/* Safety: if the wrapper somehow arrived, unwrap it before storing. */
				if ( isset( $to_save['config'] ) && is_array( $to_save['config'] ) ) {
					$to_save = $to_save['config'];
				}
				update_option( 'luxe_config', $to_save );
				/* Update the timestamp so clients detect config has changed */
				update_option( 'luxe_config_updated', time() );
				return luxe_merged_config();
			},
			'permission_callback' => function () { return current_user_can( 'edit_theme_options' ); },
		),
	) );
} );
