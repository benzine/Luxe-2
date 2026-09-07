<?php
/**
 * Form Handler - AJAX form submission and email configuration
 * 
 * Handles form submissions with state persistence, dependent dropdowns,
 * and sends comprehensive emails to admin with all user selections.
 * 
 * @package luxe
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

/**
 * Register REST API routes for form handling
 */
add_action( 'rest_api_init', function () {
    // Submit form endpoint
    register_rest_route( 'luxe/v1', '/form/submit', array(
        'methods'             => 'POST',
        'callback'            => 'luxe_handle_form_submission',
        'permission_callback' => '__return_true',
    ) );
    
    // Get form settings endpoint
    register_rest_route( 'luxe/v1', '/form/settings', array(
        'methods'             => 'GET',
        'callback'            => 'luxe_get_form_settings',
        'permission_callback' => '__return_true',
    ) );
    
    // Update form settings endpoint (admin only)
    register_rest_route( 'luxe/v1', '/form/settings', array(
        'methods'             => 'POST',
        'callback'            => 'luxe_update_form_settings',
        'permission_callback' => function () {
            return current_user_can( 'edit_theme_options' );
        },
    ) );
} );

/**
 * Get default form settings
 */
function luxe_get_default_form_settings() {
    return array(
        'email_recipient'      => get_option( 'admin_email' ),
        'email_subject'        => 'New Inquiry from Luxe Hair Studio',
        'success_message'      => 'Thank you! Your message has been sent. We\'ll be in touch shortly.',
        'error_message'        => 'Something went wrong. Please try again or call us directly.',
        'from_name'            => 'Luxe Hair Studio',
        'reply_to_field'       => 'email',
        'enable_notifications' => true,
        'save_submissions'     => true,
        'required_fields'      => array( 'name', 'email', 'message' ),
    );
}

/**
 * Get current form settings
 */
function luxe_get_form_settings() {
    $defaults = luxe_get_default_form_settings();
    $stored   = get_option( 'luxe_form_settings', array() );
    return wp_parse_args( $stored, $defaults );
}

/**
 * Update form settings (admin only)
 */
function luxe_update_form_settings( $request ) {
    $params = $request->get_json_params();
    
    if ( ! is_array( $params ) ) {
        return new WP_Error( 'luxe_bad_request', 'Invalid payload', array( 'status' => 400 ) );
    }
    
    $allowed_keys = array(
        'email_recipient',
        'email_subject',
        'success_message',
        'error_message',
        'from_name',
        'reply_to_field',
        'enable_notifications',
        'save_submissions',
        'required_fields',
    );
    
    $settings = array();
    foreach ( $allowed_keys as $key ) {
        if ( isset( $params[ $key ] ) ) {
            $settings[ $key ] = $params[ $key ];
        }
    }
    
    update_option( 'luxe_form_settings', $settings );
    
    return array(
        'success'  => true,
        'settings' => luxe_get_form_settings(),
    );
}

/**
 * Handle form submission
 */
function luxe_handle_form_submission( $request ) {
    $params = $request->get_json_params();
    
    if ( ! is_array( $params ) ) {
        return new WP_Error( 'luxe_bad_request', 'Invalid payload', array( 'status' => 400 ) );
    }
    
    // Verify nonce if provided
    if ( isset( $params['nonce'] ) && ! wp_verify_nonce( $params['nonce'], 'luxe_form_submit' ) ) {
        return new WP_Error( 'luxe_invalid_nonce', 'Security check failed', array( 'status' => 403 ) );
    }
    
    // Sanitize and validate input
    $data = luxe_sanitize_form_data( $params );
    
    // Get form settings
    $settings = luxe_get_form_settings();
    
    // Validate required fields
    $errors = array();
    foreach ( $settings['required_fields'] as $field ) {
        if ( empty( $data[ $field ] ) ) {
            $errors[] = ucfirst( $field ) . ' is required';
        }
    }
    
    // Validate email
    if ( ! empty( $data['email'] ) && ! is_email( $data['email'] ) ) {
        $errors[] = 'Please provide a valid email address';
    }
    
    if ( ! empty( $errors ) ) {
        return array(
            'success' => false,
            'errors'  => $errors,
        );
    }
    
    // Prepare email content
    $email_content = luxe_prepare_email_content( $data );
    
    // Send email
    $email_sent = luxe_send_admin_email( $settings, $data, $email_content );
    
    // Save submission if enabled
    if ( $settings['save_submissions'] ) {
        luxe_save_form_submission( $data );
    }
    
    if ( $email_sent ) {
        return array(
            'success' => true,
            'message' => $settings['success_message'],
        );
    } else {
        return array(
            'success' => false,
            'message' => $settings['error_message'],
        );
    }
}

/**
 * Sanitize form data
 */
function luxe_sanitize_form_data( $data ) {
    $sanitized = array();
    
    $text_fields = array( 'name', 'email', 'phone', 'subject', 'message', 'service', 'stylist', 'date', 'time', 'budget', 'hair_type', 'face_shape', 'maintenance', 'colour_muse' );
    
    foreach ( $data as $key => $value ) {
        if ( in_array( $key, $text_fields, true ) ) {
            $sanitized[ $key ] = sanitize_text_field( $value );
        } elseif ( 'addons' === $key && is_array( $value ) ) {
            $sanitized[ $key ] = array_map( 'sanitize_text_field', $value );
        } elseif ( 'quiz_answers' === $key && is_array( $value ) ) {
            $sanitized[ $key ] = array_map( 'sanitize_text_field', $value );
        } else {
            $sanitized[ $key ] = sanitize_text_field( $value );
        }
    }
    
    return $sanitized;
}

/**
 * Prepare email content with all form data including dependent selections
 */
function luxe_prepare_email_content( $data ) {
    $content = "New inquiry from Luxe Hair Studio website:\n\n";
    $content .= str_repeat( '=', 50 ) . "\n\n";
    
    // Contact Information
    $content .= "CONTACT INFORMATION\n";
    $content .= str_repeat( '-', 30 ) . "\n";
    if ( ! empty( $data['name'] ) ) {
        $content .= "Name: " . $data['name'] . "\n";
    }
    if ( ! empty( $data['email'] ) ) {
        $content .= "Email: " . $data['email'] . "\n";
    }
    if ( ! empty( $data['phone'] ) ) {
        $content .= "Phone: " . $data['phone'] . "\n";
    }
    $content .= "\n";
    
    // Service Selections (from dependent dropdowns)
    $content .= "SERVICE SELECTIONS\n";
    $content .= str_repeat( '-', 30 ) . "\n";
    if ( ! empty( $data['service'] ) ) {
        $content .= "Service: " . $data['service'] . "\n";
    }
    if ( ! empty( $data['stylist'] ) ) {
        $content .= "Preferred Stylist: " . $data['stylist'] . "\n";
    }
    if ( ! empty( $data['date'] ) ) {
        $content .= "Preferred Date: " . $data['date'] . "\n";
    }
    if ( ! empty( $data['time'] ) ) {
        $content .= "Preferred Time: " . $data['time'] . "\n";
    }
    $content .= "\n";
    
    // Quiz Results (if any)
    if ( ! empty( $data['quiz_answers'] ) && is_array( $data['quiz_answers'] ) ) {
        $content .= "QUIZ RESULTS\n";
        $content .= str_repeat( '-', 30 ) . "\n";
        foreach ( $data['quiz_answers'] as $question => $answer ) {
            $content .= $question . ": " . $answer . "\n";
        }
        $content .= "\n";
    }
    
    // Consultation Answers (if any)
    $consultation_fields = array( 'hair_type', 'face_shape', 'maintenance', 'colour_muse', 'budget' );
    $has_consultation = false;
    foreach ( $consultation_fields as $field ) {
        if ( ! empty( $data[ $field ] ) ) {
            $has_consultation = true;
            break;
        }
    }
    
    if ( $has_consultation ) {
        $content .= "CONSULTATION DETAILS\n";
        $content .= str_repeat( '-', 30 ) . "\n";
        if ( ! empty( $data['hair_type'] ) ) {
            $content .= "Hair Type: " . $data['hair_type'] . "\n";
        }
        if ( ! empty( $data['face_shape'] ) ) {
            $content .= "Face Shape: " . $data['face_shape'] . "\n";
        }
        if ( ! empty( $data['maintenance'] ) ) {
            $content .= "Maintenance Level: " . $data['maintenance'] . "\n";
        }
        if ( ! empty( $data['colour_muse'] ) ) {
            $content .= "Colour Preference: " . $data['colour_muse'] . "\n";
        }
        if ( ! empty( $data['budget'] ) ) {
            $content .= "Budget Range: " . $data['budget'] . "\n";
        }
        $content .= "\n";
    }
    
    // Addons (if any)
    if ( ! empty( $data['addons'] ) && is_array( $data['addons'] ) ) {
        $content .= "SELECTED ADDONS\n";
        $content .= str_repeat( '-', 30 ) . "\n";
        foreach ( $data['addons'] as $addon ) {
            $content .= "- " . $addon . "\n";
        }
        $content .= "\n";
    }
    
    // Message
    $content .= "MESSAGE\n";
    $content .= str_repeat( '-', 30 ) . "\n";
    if ( ! empty( $data['message'] ) ) {
        $content .= $data['message'] . "\n";
    } else {
        $content .= "(No message provided)\n";
    }
    $content .= "\n";
    
    // Metadata
    $content .= "SUBMISSION DETAILS\n";
    $content .= str_repeat( '-', 30 ) . "\n";
    $content .= "Submitted: " . date_i18n( 'F j, Y g:i a' ) . "\n";
    $content .= "IP Address: " . luxe_get_client_ip() . "\n";
    $content .= "User Agent: " . substr( $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown', 0, 100 ) . "\n";
    if ( ! empty( $data['page_url'] ) ) {
        $content .= "Page URL: " . esc_url_raw( $data['page_url'] ) . "\n";
    }
    
    return $content;
}

/**
 * Send admin email
 */
function luxe_send_admin_email( $settings, $data, $content ) {
    $to      = $settings['email_recipient'];
    $subject = $settings['email_subject'];
    
    // Prepare headers
    $headers = array(
        'Content-Type: text/plain; charset=UTF-8',
        'From: ' . $settings['from_name'] . ' <wordpress@' . parse_url( home_url(), PHP_URL_HOST ) . '>',
    );
    
    // Add reply-to if configured
    if ( ! empty( $data[ $settings['reply_to_field'] ] ) ) {
        $headers[] = 'Reply-To: ' . $data[ $settings['reply_to_field'] ];
    }
    
    // Send email
    return wp_mail( $to, $subject, $content, $headers );
}

/**
 * Save form submission to database
 */
function luxe_save_form_submission( $data ) {
    global $wpdb;
    
    $table_name = $wpdb->prefix . 'luxe_form_submissions';
    
    // Create table if it doesn't exist
    luxe_create_submissions_table();
    
    $wpdb->insert(
        $table_name,
        array(
            'submission_data' => json_encode( $data ),
            'submitted_at'    => current_time( 'mysql' ),
            'ip_address'      => luxe_get_client_ip(),
            'status'          => 'new',
        ),
        array( '%s', '%s', '%s', '%s' )
    );
}

/**
 * Create form submissions table
 */
function luxe_create_submissions_table() {
    global $wpdb;
    
    $table_name = $wpdb->prefix . 'luxe_form_submissions';
    $charset_collate = $wpdb->get_charset_collate();
    
    $sql = "CREATE TABLE IF NOT EXISTS $table_name (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        submission_data longtext NOT NULL,
        submitted_at datetime DEFAULT CURRENT_TIMESTAMP,
        ip_address varchar(45) DEFAULT '',
        status varchar(20) DEFAULT 'new',
        PRIMARY KEY (id),
        KEY submitted_at (submitted_at),
        KEY status (status)
    ) $charset_collate;";
    
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta( $sql );
}

/**
 * Get client IP address
 */
function luxe_get_client_ip() {
    $ip_keys = array( 'REMOTE_ADDR', 'HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 'HTTP_X_CLUSTER_CLIENT_IP', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED' );
    
    foreach ( $ip_keys as $key ) {
        if ( array_key_exists( $key, $_SERVER ) === true ) {
            foreach ( explode( ',', $_SERVER[ $key ] ) as $ip ) {
                $ip = trim( $ip );
                if ( filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE ) !== false ) {
                    return $ip;
                }
            }
        }
    }
    
    return 'Unknown';
}

/**
 * Add admin menu for form submissions
 */
add_action( 'admin_menu', function () {
    add_submenu_page(
        'tools.php',
        'Form Submissions',
        'Form Submissions',
        'manage_options',
        'luxe-form-submissions',
        'luxe_render_form_submissions_page'
    );
} );

/**
 * Render form submissions admin page
 */
function luxe_render_form_submissions_page() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'luxe_form_submissions';
    
    // Handle delete action
    if ( isset( $_GET['action'] ) && isset( $_GET['id'] ) && 'delete' === $_GET['action'] ) {
        check_admin_referer( 'luxe_delete_submission' );
        $id = intval( $_GET['id'] );
        $wpdb->delete( $table_name, array( 'id' => $id ) );
        echo '<div class="notice notice-success"><p>Submission deleted.</p></div>';
    }
    
    // Pagination
    $per_page = 20;
    $current_page = isset( $_GET['paged'] ) ? max( 1, intval( $_GET['paged'] ) ) : 1;
    $offset = ( $current_page - 1 ) * $per_page;
    
    // Get total count
    $total = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name" );
    $total_pages = ceil( $total / $per_page );
    
    // Get submissions
    $submissions = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT * FROM $table_name ORDER BY submitted_at DESC LIMIT %d OFFSET %d",
            $per_page,
            $offset
        )
    );
    ?>
    <div class="wrap">
        <h1 class="wp-heading-inline">Form Submissions</h1>
        <a href="<?php echo esc_url( admin_url( 'admin.php?page=luxe-form-submissions&action=export' ) ); ?>" class="page-title-action">Export CSV</a>
        <hr class="wp-header-end">
        
        <?php if ( empty( $submissions ) ) : ?>
            <p>No submissions yet.</p>
        <?php else : ?>
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Service</th>
                        <th>Stylist</th>
                        <th>Date</th>
                        <th>Submitted</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ( $submissions as $submission ) : 
                        $data = json_decode( $submission->submission_data, true );
                    ?>
                    <tr>
                        <td><?php echo esc_html( $submission->id ); ?></td>
                        <td><?php echo esc_html( $data['name'] ?? '-' ); ?></td>
                        <td><?php echo esc_html( $data['email'] ?? '-' ); ?></td>
                        <td><?php echo esc_html( $data['service'] ?? '-' ); ?></td>
                        <td><?php echo esc_html( $data['stylist'] ?? '-' ); ?></td>
                        <td><?php echo esc_html( $data['date'] ?? '-' ); ?></td>
                        <td><?php echo esc_html( date_i18n( 'M j, Y g:i a', strtotime( $submission->submitted_at ) ) ); ?></td>
                        <td><span class="status-<?php echo esc_attr( $submission->status ); ?>"><?php echo esc_html( ucfirst( $submission->status ) ); ?></span></td>
                        <td>
                            <a href="<?php echo esc_url( wp_nonce_url( admin_url( 'admin.php?page=luxe-form-submissions&action=delete&id=' . $submission->id ), 'luxe_delete_submission' ) ); ?>" class="button button-small button-link-delete" onclick="return confirm('Delete this submission?')">Delete</a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            
            <?php if ( $total_pages > 1 ) : ?>
                <div class="tablenav">
                    <div class="tablenav-pages">
                        <?php
                        echo paginate_links( array(
                            'base'      => add_query_arg( 'paged', '%#%' ),
                            'format'    => '',
                            'prev_text' => '&laquo;',
                            'next_text' => '&raquo;',
                            'total'     => $total_pages,
                            'current'   => $current_page,
                        ) );
                        ?>
                    </div>
                </div>
            <?php endif; ?>
        <?php endif; ?>
    </div>
    <?php
}

/**
 * Handle CSV export
 */
add_action( 'admin_init', function () {
    if ( isset( $_GET['page'] ) && 'luxe-form-submissions' === $_GET['page'] && isset( $_GET['action'] ) && 'export' === $_GET['action'] ) {
        check_admin_referer( 'luxe_export_submissions' );
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'luxe_form_submissions';
        $submissions = $wpdb->get_results( "SELECT * FROM $table_name ORDER BY submitted_at DESC", ARRAY_A );
        
        header( 'Content-Type: text/csv; charset=utf-8' );
        header( 'Content-Disposition: attachment; filename=form-submissions-' . date( 'Y-m-d' ) . '.csv' );
        
        $output = fopen( 'php://output', 'w' );
        
        // Headers
        fputcsv( $output, array( 'ID', 'Name', 'Email', 'Phone', 'Service', 'Stylist', 'Date', 'Time', 'Message', 'Submitted At', 'IP Address' ) );
        
        // Data
        foreach ( $submissions as $submission ) {
            $data = json_decode( $submission['submission_data'], true );
            fputcsv( $output, array(
                $submission['id'],
                $data['name'] ?? '',
                $data['email'] ?? '',
                $data['phone'] ?? '',
                $data['service'] ?? '',
                $data['stylist'] ?? '',
                $data['date'] ?? '',
                $data['time'] ?? '',
                $data['message'] ?? '',
                $submission['submitted_at'],
                $submission['ip_address'],
            ) );
        }
        
        fclose( $output );
        exit;
    }
} );
