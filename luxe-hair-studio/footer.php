<?php
/**
 * The React mount point + configuration bridge, then the enqueued bundle.
 * The inline classic script sets window.__LUXE_CONFIG__ (and wpReactSettings
 * fallback) BEFORE the deferred ES module executes, so the app boots with the
 * admin's saved configuration.
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
<?php wp_footer(); ?>
</body>
</html>
