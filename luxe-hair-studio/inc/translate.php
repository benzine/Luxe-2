<?php
/**
 * Translation API integration for Luxe Hair Studio theme.
 * Supports three providers: MyMemory (no key), Google Gemini (free API key), Groq (free API key).
 * Translations are managed per-language in the backoffice and stored in luxe_config option.
 *
 * @package luxe
 */

if (!defined('ABSPATH')) { exit; }

/**
 * Get available translation providers
 */
function luxe_get_translation_providers() {
    return array(
        'mymemory' => array(
            'name' => 'MyMemory (Free, No Setup)',
            'requires_key' => false,
            'endpoint' => 'https://api.mymemory.translated.net/get',
            'model' => null,
        ),
        'gemini' => array(
            'name' => 'Google Gemini (Free API Key Required)',
            'requires_key' => true,
            'endpoint' => 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
            'model' => 'gemini-2.0-flash',
            'key_field' => 'luxe_gemini_api_key',
        ),
        'groq' => array(
            'name' => 'Groq (Free API Key Required)',
            'requires_key' => true,
            'endpoint' => 'https://api.groq.com/openai/v1/chat/completions',
            'model' => 'llama-3.3-70b-versatile',
            'key_field' => 'luxe_groq_api_key',
        ),
    );
}

/**
 * Get stored API keys
 */
function luxe_get_api_keys() {
    return array(
        'gemini' => get_option('luxe_gemini_api_key', ''),
        'groq' => get_option('luxe_groq_api_key', ''),
        'mymemory_email' => get_option('luxe_mymemory_email', ''),
    );
}

/**
 * Save API key
 */
function luxe_save_api_key($provider, $key) {
    if ($provider === 'mymemory') {
        update_option('luxe_mymemory_email', sanitize_text_field($key));
    } elseif ($provider === 'gemini') {
        update_option('luxe_gemini_api_key', sanitize_text_field($key));
    } elseif ($provider === 'groq') {
        update_option('luxe_groq_api_key', sanitize_text_field($key));
    }
}

/**
 * Translate text using specified provider
 * 
 * @param string $text Text to translate
 * @param string $source Source language code (en, es, fr, de)
 * @param string $target Target language code (en, es, fr, de)
 * @param string $provider Provider ID (mymemory, gemini, groq)
 * @return array {success: bool, text: string|null, error: string|null}
 */
function luxe_translate_text($text, $source, $target, $provider = 'mymemory') {
    if ($source === $target) {
        return array('success' => true, 'text' => $text, 'error' => null);
    }
    
    $providers = luxe_get_translation_providers();
    if (!isset($providers[$provider])) {
        return array('success' => false, 'text' => null, 'error' => 'Invalid provider');
    }
    
    $keys = luxe_get_api_keys();
    
    switch ($provider) {
        case 'mymemory':
            return luxe_translate_mymemory($text, $source, $target, $keys['mymemory_email']);
        case 'gemini':
            return luxe_translate_gemini($text, $source, $target, $keys['gemini']);
        case 'groq':
            return luxe_translate_groq($text, $source, $target, $keys['groq']);
        default:
            return array('success' => false, 'text' => null, 'error' => 'Unknown provider');
    }
}

/**
 * Translate using MyMemory API (free, no key required for limited use)
 */
function luxe_translate_mymemory($text, $source, $target, $email = '') {
    $lang_pair = $source . '|' . $target;
    $url = 'https://api.mymemory.translated.net/get?q=' . urlencode($text) . '&langpair=' . $lang_pair;
    
    if (!empty($email)) {
        $url .= '&de=' . urlencode($email);
    }
    
    $response = wp_remote_get($url, array(
        'timeout' => 15,
        'user-agent' => 'LuxeHairStudio/1.0',
    ));
    
    if (is_wp_error($response)) {
        return array('success' => false, 'text' => null, 'error' => $response->get_error_message());
    }
    
    $body = json_decode(wp_remote_retrieve_body($response), true);
    
    if (isset($body['responseData']['translatedText'])) {
        return array('success' => true, 'text' => $body['responseData']['translatedText'], 'error' => null);
    }
    
    return array('success' => false, 'text' => null, 'error' => 'No translation returned');
}

/**
 * Translate using Google Gemini API
 */
function luxe_translate_gemini($text, $source, $target, $api_key) {
    if (empty($api_key)) {
        return array('success' => false, 'text' => null, 'error' => 'API key not configured');
    }
    
    $lang_names = array(
        'en' => 'English',
        'es' => 'Spanish',
        'fr' => 'French',
        'de' => 'German',
    );
    
    $prompt = sprintf(
        'Translate the following text from %s to %s. Return ONLY the translation, nothing else:\n\n%s',
        $lang_names[$source] ?? $source,
        $lang_names[$target] ?? $target,
        $text
    );
    
    $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . $api_key;
    
    $response = wp_remote_post($url, array(
        'timeout' => 30,
        'headers' => array(
            'Content-Type' => 'application/json',
        ),
        'body' => json_encode(array(
            'contents' => array(
                array(
                    'parts' => array(
                        array('text' => $prompt),
                    ),
                ),
            ),
        )),
    ));
    
    if (is_wp_error($response)) {
        return array('success' => false, 'text' => null, 'error' => $response->get_error_message());
    }
    
    $body = json_decode(wp_remote_retrieve_body($response), true);
    
    if (isset($body['candidates'][0]['content']['parts'][0]['text'])) {
        $translated = trim($body['candidates'][0]['content']['parts'][0]['text']);
        return array('success' => true, 'text' => $translated, 'error' => null);
    }
    
    $error_msg = isset($body['error']['message']) ? $body['error']['message'] : 'Gemini API error';
    return array('success' => false, 'text' => null, 'error' => $error_msg);
}

/**
 * Translate using Groq API
 */
function luxe_translate_groq($text, $source, $target, $api_key) {
    if (empty($api_key)) {
        return array('success' => false, 'text' => null, 'error' => 'API key not configured');
    }
    
    $lang_names = array(
        'en' => 'English',
        'es' => 'Spanish',
        'fr' => 'French',
        'de' => 'German',
    );
    
    $url = 'https://api.groq.com/openai/v1/chat/completions';
    
    $response = wp_remote_post($url, array(
        'timeout' => 30,
        'headers' => array(
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $api_key,
        ),
        'body' => json_encode(array(
            'model' => 'llama-3.3-70b-versatile',
            'messages' => array(
                array(
                    'role' => 'system',
                    'content' => sprintf(
                        'You are a professional translator. Translate text from %s to %s. Return ONLY the translation, no explanations.',
                        $lang_names[$source] ?? $source,
                        $lang_names[$target] ?? $target
                    ),
                ),
                array(
                    'role' => 'user',
                    'content' => $text,
                ),
            ),
            'temperature' => 0.3,
        )),
    ));
    
    if (is_wp_error($response)) {
        return array('success' => false, 'text' => null, 'error' => $response->get_error_message());
    }
    
    $body = json_decode(wp_remote_retrieve_body($response), true);
    
    if (isset($body['choices'][0]['message']['content'])) {
        $translated = trim($body['choices'][0]['message']['content']);
        return array('success' => true, 'text' => $translated, 'error' => null);
    }
    
    $error_msg = isset($body['error']['message']) ? $body['error']['message'] : 'Groq API error';
    return array('success' => false, 'text' => null, 'error' => $error_msg);
}

/**
 * Test connection to a translation provider
 */
function luxe_test_translation_provider($provider) {
    $keys = luxe_get_api_keys();
    
    switch ($provider) {
        case 'mymemory':
            $result = luxe_translate_text('Hello', 'en', 'es', 'mymemory');
            return $result['success'];
        case 'gemini':
            if (empty($keys['gemini'])) return false;
            $result = luxe_translate_text('Hello', 'en', 'es', 'gemini');
            return $result['success'];
        case 'groq':
            if (empty($keys['groq'])) return false;
            $result = luxe_translate_text('Hello', 'en', 'es', 'groq');
            return $result['success'];
        default:
            return false;
    }
}

/**
 * Batch translate content for all languages
 * This is called from the REST API when admin clicks "Translate all"
 */
function luxe_batch_translate_content($config, $provider = 'mymemory') {
    $languages = array('es', 'fr', 'de');
    $translations = isset($config['translations']) ? $config['translations'] : array();
    
    // Extract all translatable strings from config
    $strings_to_translate = luxe_extract_content_keys($config);
    
    foreach ($languages as $lang) {
        if (!isset($translations[$lang])) {
            $translations[$lang] = array();
        }
        
        foreach ($strings_to_translate as $key => $english_text) {
            // Skip if already translated
            if (isset($translations[$lang][$key]) && !empty($translations[$lang][$key])) {
                continue;
            }
            
            $result = luxe_translate_text($english_text, 'en', $lang, $provider);
            if ($result['success']) {
                $translations[$lang][$key] = $result['text'];
            }
        }
    }
    
    return $translations;
}

/**
 * Extract all translatable content keys from config
 */
function luxe_extract_content_keys($config, $prefix = '') {
    $keys = array();
    
    if (!isset($config['content']) || !is_array($config['content'])) {
        return $keys;
    }
    
    $content = $config['content'];
    
    // Hero stages
    if (isset($content['hero']['stages']) && is_array($content['hero']['stages'])) {
        foreach ($content['hero']['stages'] as $i => $stage) {
            $keys["hero.{$i}.kicker"] = $stage['kicker'] ?? '';
            $keys["hero.{$i}.line1"] = $stage['line1'] ?? '';
            $keys["hero.{$i}.line2"] = $stage['line2'] ?? '';
            $keys["hero.{$i}.sub"] = $stage['sub'] ?? '';
        }
    }
    
    // Salon info
    if (isset($content['salon'])) {
        $keys['salon.tagline'] = $content['salon']['tagline'] ?? '';
    }
    
    // Footer
    if (isset($content['footer'])) {
        $keys['footer.copyright'] = $content['footer']['copyright'] ?? '';
        $keys['footer.newsHeading'] = $content['footer']['newsHeading'] ?? '';
        $keys['footer.newsText'] = $content['footer']['newsText'] ?? '';
    }
    
    // Services
    if (isset($content['services']) && is_array($content['services'])) {
        foreach ($content['services'] as $i => $section) {
            $keys["services.{$i}.label"] = $section['label'] ?? '';
            $keys["services.{$i}.note"] = $section['note'] ?? '';
            if (isset($section['items']) && is_array($section['items'])) {
                foreach ($section['items'] as $j => $item) {
                    $keys["services.{$i}.items.{$j}.name"] = $item['name'] ?? '';
                    $keys["services.{$i}.items.{$j}.desc"] = $item['desc'] ?? '';
                }
            }
        }
    }
    
    // Stylists
    if (isset($content['stylists']) && is_array($content['stylists'])) {
        foreach ($content['stylists'] as $i => $stylist) {
            $keys["stylists.{$i}.quote"] = $stylist['quote'] ?? '';
        }
    }
    
    // Testimonials
    if (isset($content['testimonials']) && is_array($content['testimonials'])) {
        foreach ($content['testimonials'] as $i => $testimonial) {
            $keys["testimonials.{$i}.quote"] = $testimonial['quote'] ?? '';
        }
    }
    
    // Products
    if (isset($content['products']) && is_array($content['products'])) {
        foreach ($content['products'] as $i => $product) {
            $keys["products.{$i}.name"] = $product['name'] ?? '';
            $keys["products.{$i}.desc"] = $product['desc'] ?? '';
        }
    }
    
    // Packages
    if (isset($content['packages']) && is_array($content['packages'])) {
        foreach ($content['packages'] as $i => $pkg) {
            $keys["packages.{$i}.name"] = $pkg['name'] ?? '';
            $keys["packages.{$i}.desc"] = $pkg['desc'] ?? '';
            $keys["packages.{$i}.tag"] = $pkg['tag'] ?? '';
        }
    }
    
    // Amenities
    if (isset($content['amenities']) && is_array($content['amenities'])) {
        foreach ($content['amenities'] as $i => $amenity) {
            $keys["amenities.{$i}.title"] = $amenity['title'] ?? '';
            $keys["amenities.{$i}.desc"] = $amenity['desc'] ?? '';
        }
    }
    
    // Booking addons
    if (isset($content['bookingAddons']) && is_array($content['bookingAddons'])) {
        foreach ($content['bookingAddons'] as $i => $addon) {
            $keys["bookingAddons.{$i}.name"] = $addon['name'] ?? '';
        }
    }
    
    // Marquee
    if (isset($content['marquee']) && is_array($content['marquee'])) {
        foreach ($content['marquee'] as $i => $item) {
            $keys["marquee.{$i}"] = $item ?? '';
        }
    }
    
    // Headings
    if (isset($content['headings']) && is_array($content['headings'])) {
        foreach ($content['headings'] as $section => $heading) {
            $keys["headings.{$section}.title"] = $heading['title'] ?? '';
            $keys["headings.{$section}.italic"] = $heading['italic'] ?? '';
        }
    }
    
    return $keys;
}

/**
 * Register REST endpoints for translation management
 */
add_action('rest_api_init', function () {
    // Get translation settings
    register_rest_route('luxe/v1', '/translations', array(
        'methods' => 'GET',
        'callback' => function () {
            $config = get_option('luxe_config', array());
            $translations = isset($config['translations']) ? $config['translations'] : array();
            $keys = luxe_get_api_keys();
            $providers = luxe_get_translation_providers();
            
            return array(
                'translations' => $translations,
                'apiKeys' => $keys,
                'providers' => $providers,
                'autoTranslate' => isset($config['autoTranslate']) ? $config['autoTranslate'] : true,
            );
        },
        'permission_callback' => function () {
            return current_user_can('edit_theme_options');
        },
    ));
    
    // Save translation / update single key
    register_rest_route('luxe/v1', '/translations', array(
        'methods' => 'POST',
        'callback' => function ($request) {
            $params = $request->get_json_params();
            $config = get_option('luxe_config', array());
            
            if (!isset($config['translations'])) {
                $config['translations'] = array();
            }
            
            // Handle single translation update
            if (isset($params['key']) && isset($params['lang']) && isset($params['value'])) {
                $config['translations'][$params['lang']][$params['key']] = $params['value'];
            }
            
            // Handle bulk translations
            if (isset($params['translations']) && is_array($params['translations'])) {
                foreach ($params['translations'] as $lang => $dict) {
                    if (!isset($config['translations'][$lang])) {
                        $config['translations'][$lang] = array();
                    }
                    foreach ($dict as $key => $value) {
                        $config['translations'][$lang][$key] = $value;
                    }
                }
            }
            
            // Handle autoTranslate setting
            if (isset($params['autoTranslate'])) {
                $config['autoTranslate'] = (bool) $params['autoTranslate'];
            }
            
            update_option('luxe_config', $config);
            update_option('luxe_config_updated', time());
            
            return array('success' => true, 'translations' => $config['translations']);
        },
        'permission_callback' => function () {
            return current_user_can('edit_theme_options');
        },
    ));
    
    // Trigger batch translation
    register_rest_route('luxe/v1', '/translations/batch', array(
        'methods' => 'POST',
        'callback' => function ($request) {
            $params = $request->get_json_params();
            $provider = isset($params['provider']) ? $params['provider'] : 'mymemory';
            
            $config = get_option('luxe_config', array());
            $new_translations = luxe_batch_translate_content($config, $provider);
            
            if (!isset($config['translations'])) {
                $config['translations'] = array();
            }
            
            // Merge new translations
            foreach ($new_translations as $lang => $dict) {
                if (!isset($config['translations'][$lang])) {
                    $config['translations'][$lang] = array();
                }
                foreach ($dict as $key => $value) {
                    $config['translations'][$lang][$key] = $value;
                }
            }
            
            update_option('luxe_config', $config);
            update_option('luxe_config_updated', time());
            
            return array(
                'success' => true,
                'translations' => $config['translations'],
                'languages_processed' => array_keys($new_translations),
            );
        },
        'permission_callback' => function () {
            return current_user_can('edit_theme_options');
        },
    ));
    
    // Save API key
    register_rest_route('luxe/v1', '/translations/api-key', array(
        'methods' => 'POST',
        'callback' => function ($request) {
            $params = $request->get_json_params();
            $provider = isset($params['provider']) ? $params['provider'] : '';
            $key = isset($params['key']) ? $params['key'] : '';
            
            if (empty($provider)) {
                return new WP_Error('missing_provider', 'Provider required', array('status' => 400));
            }
            
            luxe_save_api_key($provider, $key);
            
            return array('success' => true);
        },
        'permission_callback' => function () {
            return current_user_can('edit_theme_options');
        },
    ));
    
    // Test provider connection
    register_rest_route('luxe/v1', '/translations/test', array(
        'methods' => 'POST',
        'callback' => function ($request) {
            $params = $request->get_json_params();
            $provider = isset($params['provider']) ? $params['provider'] : 'mymemory';
            
            $success = luxe_test_translation_provider($provider);
            
            return array(
                'success' => $success,
                'provider' => $provider,
            );
        },
        'permission_callback' => function () {
            return current_user_can('edit_theme_options');
        },
    ));
});
