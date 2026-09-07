<?php
/**
 * Atelier Console - Native PHP 3-Rail Interface
 * Renders the complete editor without React dependencies
 */

if (!defined('ABSPATH')) exit;

// Capability Check
if (!current_user_can('manage_options')) {
    wp_die(__('You do not have sufficient permissions to access this page.'));
}

// Get Config
$config = get_option('luxe_site_config', []);
$sections = isset($config['sections']) ? $config['sections'] : [];
$design = isset($config['design']) ? $config['design'] : [];
$global_settings = isset($config['global']) ? $config['global'] : [];

// Handle Save
$saved = false;
if (isset($_POST['action']) && $_POST['action'] === 'save_luxe_config' && check_admin_referer('luxe_console_nonce')) {
    $new_config = json_decode(stripslashes($_POST['config_data']), true);
    if ($new_config) {
        update_option('luxe_site_config', $new_config);
        $saved = true;
        $config = $new_config;
        $sections = $config['sections'] ?? [];
    }
}
?>

<div class="wrap luxe-console-wrapper" style="margin: -20px -20px -20px -20px; height: 100vh; display: flex; overflow: hidden; background: #111827; color: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    
    <style>
        .luxe-console-wrapper { --gold: #C9B037; --rose: #D4A5A5; --gray-800: #1F2937; --gray-700: #374151; }
        .luxe-rail-left { width: 260px; background: var(--gray-800); border-right: 1px solid var(--gray-700); display: flex; flex-direction: column; flex-shrink: 0; }
        .luxe-stage-center { flex: 1; display: flex; flex-direction: column; background: #111827; position: relative; }
        .luxe-rail-right { width: 320px; background: var(--gray-800); border-left: 1px solid var(--gray-700); overflow-y: auto; flex-shrink: 0; }
        .luxe-nav-item { padding: 12px 16px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s; }
        .luxe-nav-item:hover { background: rgba(255,255,255,0.05); }
        .luxe-nav-item.active { background: rgba(201, 176, 55, 0.2); border-left: 3px solid var(--gold); }
        .luxe-toolbar { padding: 12px 20px; background: var(--gray-800); border-bottom: 1px solid var(--gray-700); display: flex; justify-content: space-between; align-items: center; }
        .luxe-canvas { flex: 1; overflow-y: auto; padding: 40px; display: flex; justify-content: center; background-image: radial-gradient(#374151 1px, transparent 1px); background-size: 20px 20px; }
        .luxe-device-frame { background: white; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); transition: all 0.3s; max-width: 100%; color: #111; }
        .luxe-device-desktop { width: 100%; max-width: 1200px; border-radius: 4px; }
        .luxe-device-tablet { width: 768px; border-radius: 12px; }
        .luxe-device-mobile { width: 375px; border-radius: 24px; }
        .luxe-section-card { position: relative; border: 1px dashed transparent; padding: 20px; margin-bottom: 2px; transition: all 0.2s; }
        .luxe-section-card:hover { border-color: var(--gold); background: rgba(201, 176, 55, 0.05); cursor: pointer; }
        .luxe-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; background: #374151; color: #9CA3AF; }
        .luxe-input { width: 100%; background: #111827; border: 1px solid #374151; color: white; padding: 8px 12px; border-radius: 4px; margin-bottom: 10px; box-sizing: border-box; }
        .luxe-btn { background: var(--gold); color: black; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 600; }
        .luxe-btn:hover { opacity: 0.9; }
        .luxe-hidden { display: none; }
        /* Section Specific Styles for Preview */
        .preview-hero { padding: 80px 20px; text-align: center; background: #f3f4f6; }
        .preview-stats { display: flex; gap: 20px; padding: 40px 20px; background: #111; color: white; justify-content: center; flex-wrap: wrap; }
        .preview-stat-item { text-align: center; min-width: 100px; }
        .preview-stat-number { font-size: 32px; font-weight: bold; color: var(--gold); display: block; }
        .preview-transformations { padding: 60px 20px; background: white; }
        .preview-mirror { padding: 60px 20px; background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); color: white; text-align: center; }
        .preview-stylists { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 40px; background: #f9fafb; }
        .preview-stylist-card { background: white; padding: 20px; border-radius: 8px; text-align: center; }
        .preview-consultation { padding: 60px 20px; background: #fff; text-align: center; }
        .preview-booking { padding: 60px 20px; background: #f3f4f6; }
        .preview-experience { padding: 60px 20px; background: #111; color: white; }
        .preview-amenities { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 40px; background: #f9fafb; }
        .preview-amenity-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .preview-marquee { padding: 30px 0; background: var(--gold); overflow: hidden; white-space: nowrap; }
        .preview-marquee-content { display: inline-block; animation: marquee 20s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .preview-tiers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 40px; background: white; }
        .preview-tier-card { border: 1px solid #e5e7eb; padding: 30px; border-radius: 8px; text-align: center; }
        .preview-products { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 40px; background: #f9fafb; }
        .preview-product-card { background: white; padding: 20px; border-radius: 8px; }
        .preview-packages { padding: 60px 20px; background: white; }
        .preview-testimonials { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; padding: 40px; background: #f9fafb; }
        .preview-testimonial-card { background: white; padding: 25px; border-radius: 8px; font-style: italic; }
    </style>

    <?php if ($saved): ?>
    <div style="position: fixed; top: 20px; right: 20px; background: #10B981; color: white; padding: 15px 25px; border-radius: 8px; z-index: 9999; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        ✅ Configuration saved successfully!
    </div>
    <?php endif; ?>

    <!-- LEFT RAIL -->
    <div class="luxe-rail-left">
        <div style="padding: 20px; font-weight: 800; font-size: 18px; letter-spacing: 1px; border-bottom: 1px solid var(--gray-700); color: var(--gold);">
            ATELIER CONSOLE
        </div>
        
        <div style="flex: 1; overflow-y: auto;">
            <div class="luxe-nav-item active" onclick="switchTab('sections')">📑 Sections (<?php echo count($sections); ?>)</div>
            <div class="luxe-nav-item" onclick="switchTab('library')">🧩 Module Library</div>
            <div class="luxe-nav-item" onclick="switchTab('global')">🎨 Global Design</div>
            <div class="luxe-nav-item" onclick="switchTab('language')">🌐 Language & API</div>
            <div class="luxe-nav-item" onclick="switchTab('accessibility')">♿ Accessibility</div>
        </div>

        <div style="padding: 15px; border-top: 1px solid var(--gray-700); font-size: 12px; color: #9CA3AF;">
            <p>v2.0 • Native PHP Build</p>
            <p>Auto-save: Enabled</p>
        </div>
    </div>

    <!-- CENTER STAGE -->
    <div class="luxe-stage-center">
        <!-- Toolbar -->
        <div class="luxe-toolbar">
            <div style="display: flex; gap: 10px; align-items: center;">
                <span class="luxe-badge" id="view-mode-badge">Full Page View</span>
                <h3 style="margin: 0; font-size: 14px; color: #9CA3AF;" id="section-title-display">Select a section to edit</h3>
            </div>
            
            <div style="display: flex; gap: 8px;">
                <button class="luxe-btn" style="background:#374151; color:white;" onclick="setDevice('desktop')">Desktop</button>
                <button class="luxe-btn" style="background:#374151; color:white;" onclick="setDevice('tablet')">Tablet</button>
                <button class="luxe-btn" style="background:#374151; color:white;" onclick="setDevice('mobile')">Mobile</button>
                <div style="width: 1px; background: #4B5563; margin: 0 8px;"></div>
                <button class="luxe-btn" onclick="saveConfig()">💾 Save Changes</button>
            </div>
        </div>

        <!-- Canvas -->
        <div class="luxe-canvas">
            <div id="device-frame" class="luxe-device-frame luxe-device-desktop">
                <?php 
                if (empty($sections)) {
                    echo '<div style="padding: 60px; text-align: center; color: #6B7280;"><p>No sections found. Import demo content or add sections.</p></div>';
                }
                foreach ($sections as $index => $section): 
                    $s_type = $section['type'] ?? 'unknown';
                    $s_title = $section['title'] ?? 'Untitled Section';
                    $s_data = $section['data'] ?? [];
                    $s_visible = $section['visible'] ?? 'all';
                ?>
                <div class="luxe-section-card" onclick="selectSection('<?php echo $section['id']; ?>', '<?php echo esc_js($s_title); ?>', '<?php echo $s_type; ?>')">
                    <!-- Render Preview Based on Type -->
                    <?php if ($s_type === 'hero'): ?>
                        <div class="preview-hero">
                            <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #6B7280;"><?php echo esc_html($s_data['kicker'] ?? 'KICKER'); ?></span>
                            <h1 style="font-size: 48px; margin: 15px 0; line-height: 1.1;"><?php echo esc_html($s_data['headline'] ?? 'Your Headline Here'); ?></h1>
                            <p style="font-size: 18px; color: #4B5563; max-width: 600px; margin: 0 auto;"><?php echo esc_html($s_data['subheadline'] ?? 'Your subheadline goes here.'); ?></p>
                            <button style="margin-top: 30px; padding: 12px 30px; background: #C9B037; border: none; border-radius: 4px; font-weight: 600; cursor: pointer;">BOOK NOW</button>
                        </div>
                    <?php elseif ($s_type === 'stats'): ?>
                        <div class="preview-stats">
                            <?php if (!empty($s_data['items'])): foreach($s_data['items'] as $item): ?>
                                <div class="preview-stat-item">
                                    <span class="preview-stat-number"><?php echo esc_html($item['number'] ?? '0'); ?><?php echo esc_html($item['suffix'] ?? ''); ?></span>
                                    <span style="font-size: 14px; opacity: 0.8;"><?php echo esc_html($item['label'] ?? 'Label'); ?></span>
                                </div>
                            <?php endforeach; else: ?>
                                <div class="preview-stat-item"><span class="preview-stat-number">150+</span><span>Happy Clients</span></div>
                                <div class="preview-stat-item"><span class="preview-stat-number">12</span><span>Years Experience</span></div>
                                <div class="preview-stat-item"><span class="preview-stat-number">25</span><span>Awards Won</span></div>
                            <?php endif; ?>
                        </div>
                    <?php elseif ($s_type === 'transformations'): ?>
                        <div class="preview-transformations">
                            <h2 style="text-align:center; margin-bottom: 10px; font-size: 32px;"><?php echo esc_html($s_data['title'] ?? 'Transformations'); ?></h2>
                            <p style="text-align:center; color: #6B7280; margin-bottom: 40px;"><?php echo esc_html($s_data['subtitle'] ?? 'Real results from real clients'); ?></p>
                            <div style="display:flex; gap:20px; justify-content:center; flex-wrap: wrap;">
                                <div style="width:200px; height:250px; background:#e5e7eb; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#9CA3AF;">Before/After</div>
                                <div style="width:200px; height:250px; background:#e5e7eb; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#9CA3AF;">Before/After</div>
                                <div style="width:200px; height:250px; background:#e5e7eb; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#9CA3AF;">Before/After</div>
                            </div>
                        </div>
                    <?php elseif ($s_type === 'mirror'): ?>
                        <div class="preview-mirror">
                            <h2 style="font-size: 36px; margin-bottom: 20px;"><?php echo esc_html($s_data['headline'] ?? 'The Mirror Experience'); ?></h2>
                            <p style="font-size: 18px; opacity: 0.9; max-width: 600px; margin: 0 auto;"><?php echo esc_html($s_data['description'] ?? 'Discover your unique style journey.'); ?></p>
                        </div>
                    <?php elseif ($s_type === 'stylists'): ?>
                        <div class="preview-stylists">
                            <?php if (!empty($s_data['members'])): foreach($s_data['members'] as $member): ?>
                                <div class="preview-stylist-card">
                                    <div style="width: 100px; height: 100px; background: #e5e7eb; border-radius: 50%; margin: 0 auto 15px;"></div>
                                    <h4 style="margin: 0;"><?php echo esc_html($member['name'] ?? 'Stylist Name'); ?></h4>
                                    <p style="font-size: 12px; color: #6B7280;"><?php echo esc_html($member['role'] ?? 'Senior Stylist'); ?></p>
                                </div>
                            <?php endforeach; else: ?>
                                <div class="preview-stylist-card"><div style="width: 100px; height: 100px; background: #e5e7eb; border-radius: 50%; margin: 0 auto 15px;"></div><h4>Lead Stylist</h4><p style="font-size: 12px; color: #6B7280;">Creative Director</p></div>
                                <div class="preview-stylist-card"><div style="width: 100px; height: 100px; background: #e5e7eb; border-radius: 50%; margin: 0 auto 15px;"></div><h4>Color Specialist</h4><p style="font-size: 12px; color: #6B7280;">Master Colorist</p></div>
                            <?php endif; ?>
                        </div>
                    <?php elseif ($s_type === 'amenities'): ?>
                        <div class="preview-amenities">
                            <?php if (!empty($s_data['items'])): foreach($s_data['items'] as $item): ?>
                                <div class="preview-amenity-card">
                                    <div style="font-size: 24px; margin-bottom: 10px;">☕</div>
                                    <strong style="display: block; margin-bottom: 5px;"><?php echo esc_html($item['title'] ?? 'Amenity'); ?></strong>
                                    <p style="font-size: 12px; color: #6B7280; margin: 0;"><?php echo esc_html($item['desc'] ?? 'Description here'); ?></p>
                                </div>
                            <?php endforeach; else: ?>
                                <div class="preview-amenity-card"><strong>Premium Coffee</strong><p style="font-size: 12px; color: #6B7280;">Single-origin espresso</p></div>
                                <div class="preview-amenity-card"><strong>Champagne Bar</strong><p style="font-size: 12px; color: #6B7280;">Complimentary with services</p></div>
                            <?php endif; ?>
                        </div>
                    <?php elseif ($s_type === 'marquee'): ?>
                        <div class="preview-marquee">
                            <div class="preview-marquee-content" style="font-size: 24px; font-weight: bold; color: #111;">
                                <?php echo esc_html($s_data['text'] ?? 'LUXE HAIR STUDIO • TRANSFORM YOUR STYLE • BOOK NOW • '); ?>
                                <?php echo esc_html($s_data['text'] ?? 'LUXE HAIR STUDIO • TRANSFORM YOUR STYLE • BOOK NOW • '); ?>
                            </div>
                        </div>
                    <?php elseif ($s_type === 'tiers'): ?>
                        <div class="preview-tiers">
                            <div class="preview-tier-card">
                                <h4 style="color: #6B7280;">Silver</h4>
                                <div style="font-size: 36px; font-weight: bold; margin: 15px 0;">£50</div>
                                <ul style="list-style: none; padding: 0; font-size: 14px; color: #6B7280;"><li>✂️ Haircut</li><li>💇‍♀️ Blow-dry</li></ul>
                            </div>
                            <div class="preview-tier-card" style="border-color: var(--gold); background: #FFFDF5;">
                                <h4 style="color: var(--gold);">Gold</h4>
                                <div style="font-size: 36px; font-weight: bold; margin: 15px 0;">£85</div>
                                <ul style="list-style: none; padding: 0; font-size: 14px; color: #6B7280;"><li>✂️ Haircut</li><li>🎨 Color</li><li>💇‍♀️ Style</li></ul>
                            </div>
                            <div class="preview-tier-card">
                                <h4 style="color: #6B7280;">Platinum</h4>
                                <div style="font-size: 36px; font-weight: bold; margin: 15px 0;">£150</div>
                                <ul style="list-style: none; padding: 0; font-size: 14px; color: #6B7280;"><li>✂️ Cut</li><li>🎨 Full Color</li><li>✨ Treatment</li></ul>
                            </div>
                        </div>
                    <?php elseif ($s_type === 'testimonials'): ?>
                        <div class="preview-testimonials">
                            <div class="preview-testimonial-card">
                                <p>"Absolutely transformed my look!"</p>
                                <div style="margin-top: 15px; font-weight: bold;">— Sarah J.</div>
                            </div>
                            <div class="preview-testimonial-card">
                                <p>"Best salon experience ever."</p>
                                <div style="margin-top: 15px; font-weight: bold;">— Emma W.</div>
                            </div>
                        </div>
                    <?php else: ?>
                        <div style="padding: 60px 20px; text-align: center; background: #f9fafb;">
                            <h3 style="margin-bottom: 10px;"><?php echo esc_html($s_title); ?></h3>
                            <p style="color: #6B7280;">Section Type: <strong><?php echo esc_html($s_type); ?></strong></p>
                            <p style="font-size: 12px; color: #9CA3AF;">Click to edit content and settings</p>
                        </div>
                    <?php endif; ?>
                    
                    <div style="position:absolute; top:10px; right:10px; background:black; color:white; padding:6px 12px; border-radius:4px; font-size:11px; font-weight: 600; opacity:0; transition:opacity 0.2s;" class="hover-badge">
                        ✏️ Click to Edit
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>

    <!-- RIGHT RAIL (INSPECTOR) -->
    <div class="luxe-rail-right" id="inspector-panel">
        <div style="padding: 30px 20px; color: #9CA3AF; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 15px; opacity: 0.3;">🎨</div>
            <p style="font-size: 14px; line-height: 1.6;">Select any section on the stage<br>to edit its properties,<br>content, and design settings.</p>
        </div>
    </div>

</div>

<script>
let currentConfig = <?php echo json_encode($config, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP); ?>;
let selectedSectionId = null;

function switchTab(tab) {
    document.querySelectorAll('.luxe-nav-item').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    if (tab !== 'sections') {
        alert(tab.toUpperCase() + ' panel coming soon. Currently focused on Section editing.');
    }
}

function setDevice(device) {
    const frame = document.getElementById('device-frame');
    frame.className = 'luxe-device-frame luxe-device-' + device;
}

function selectSection(id, title, type) {
    selectedSectionId = id;
    document.getElementById('view-mode-badge').innerText = 'Editing: ' + title;
    document.getElementById('section-title-display').innerText = title + ' (' + type + ')';
    
    // Find section data
    const section = currentConfig.sections.find(s => s.id === id);
    if (!section) return;

    // Render Inspector
    const inspector = document.getElementById('inspector-panel');
    let html = '<div style="padding:20px;">';
    html += '<h3 style="margin:0 0 20px 0; padding-bottom:15px; border-bottom:1px solid #374151; font-size:16px; color:var(--gold);">⚙️ ' + title + '</h3>';
    
    // Common Fields
    html += '<div style="margin-bottom:20px;">';
    html += '<label style="font-size:11px; text-transform:uppercase; color:#9CA3AF; display:block; margin-bottom:8px; font-weight:600;">Admin Label</label>';
    html += '<input type="text" class="luxe-input" value="' + (section.title || '').replace(/"/g, '&quot;') + '" onchange="updateSectionField(\'' + id + '\', \'title\', this.value)">';
    html += '</div>';

    html += '<div style="margin-bottom:20px;">';
    html += '<label style="font-size:11px; text-transform:uppercase; color:#9CA3AF; display:block; margin-bottom:8px; font-weight:600;">Visibility</label>';
    html += '<select class="luxe-input" onchange="updateSectionField(\'' + id + '\', \'visible\', this.value)">';
    html += '<option value="all" ' + (section.visible === 'all' ? 'selected' : '') + '>All Devices</option>';
    html += '<option value="desktop" ' + (section.visible === 'desktop' ? 'selected' : '') + '>Desktop Only</option>';
    html += '<option value="tablet" ' + (section.visible === 'tablet' ? 'selected' : '') + '>Tablet Only</option>';
    html += '<option value="mobile" ' + (section.visible === 'mobile' ? 'selected' : '') + '>Mobile Only</option>';
    html += '</select>';
    html += '</div>';

    html += '<div style="margin-bottom:20px;">';
    html += '<label style="font-size:11px; text-transform:uppercase; color:#9CA3AF; display:block; margin-bottom:8px; font-weight:600;">Show/Hide</label>';
    html += '<label style="display:flex; align-items:center; gap:10px; cursor:pointer;">';
    html += '<input type="checkbox" ' + (section.hidden ? '' : 'checked') + ' onchange="updateSectionField(\'' + id + '\', \'hidden\', !this.checked)" style="width:18px; height:18px;">';
    html += '<span style="font-size:13px;">Visible on Frontend</span>';
    html += '</label>';
    html += '</div>';

    // Dynamic Fields based on Type
    if (section.type === 'hero' && section.data) {
        html += '<hr style="border:0; border-top:1px solid #374151; margin:25px 0;">';
        html += '<h4 style="font-size:13px; color:var(--gold); margin:0 0 15px 0; text-transform:uppercase;">Hero Content</h4>';
        
        html += '<label style="font-size:11px; color:#9CA3AF; display:block; margin-bottom:6px;">Kicker Text</label>';
        html += '<input type="text" class="luxe-input" value="' + (section.data.kicker || '').replace(/"/g, '&quot;') + '" onchange="updateSectionData(\'' + id + '\', \'kicker\', this.value)">';
        
        html += '<label style="font-size:11px; color:#9CA3AF; display:block; margin-bottom:6px;">Main Headline</label>';
        html += '<input type="text" class="luxe-input" value="' + (section.data.headline || '').replace(/"/g, '&quot;') + '" onchange="updateSectionData(\'' + id + '\', \'headline\', this.value)">';
        
        html += '<label style="font-size:11px; color:#9CA3AF; display:block; margin-bottom:6px;">Subheadline</label>';
        html += '<textarea class="luxe-input" rows="3" onchange="updateSectionData(\'' + id + '\', \'subheadline\', this.value)">' + (section.data.subheadline || '') + '</textarea>';
    }

    if (section.type === 'stats' && section.data) {
        html += '<hr style="border:0; border-top:1px solid #374151; margin:25px 0;">';
        html += '<h4 style="font-size:13px; color:var(--gold); margin:0 0 15px 0; text-transform:uppercase;">Statistics Items</h4>';
        
        if (section.data.items && Array.isArray(section.data.items)) {
            section.data.items.forEach((item, idx) => {
                html += '<div style="background:#111827; padding:12px; border-radius:6px; margin-bottom:12px; border:1px solid #374151;">';
                html += '<div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span style="font-size:12px; font-weight:600; color:#9CA3AF;">Stat #' + (idx+1) + '</span></div>';
                html += '<input type="text" class="luxe-input" placeholder="Number (e.g., 150)" value="' + (item.number || '').replace(/"/g, '&quot;') + '" onchange="updateStatItem(\'' + id + '\', ' + idx + ', \'number\', this.value)" style="margin-bottom:8px; font-size:13px;">';
                html += '<input type="text" class="luxe-input" placeholder="Suffix (e.g., +)" value="' + (item.suffix || '').replace(/"/g, '&quot;') + '" onchange="updateStatItem(\'' + id + '\', ' + idx + ', \'suffix\', this.value)" style="margin-bottom:8px; font-size:13px;">';
                html += '<input type="text" class="luxe-input" placeholder="Label (e.g., Happy Clients)" value="' + (item.label || '').replace(/"/g, '&quot;') + '" onchange="updateStatItem(\'' + id + '\', ' + idx + ', \'label\', this.value)" style="font-size:13px;">';
                html += '</div>';
            });
        }
    }

    if (section.type === 'mirror' && section.data) {
        html += '<hr style="border:0; border-top:1px solid #374151; margin:25px 0;">';
        html += '<h4 style="font-size:13px; color:var(--gold); margin:0 0 15px 0; text-transform:uppercase;">Mirror Section</h4>';
        html += '<label style="font-size:11px; color:#9CA3AF; display:block; margin-bottom:6px;">Headline</label>';
        html += '<input type="text" class="luxe-input" value="' + (section.data.headline || '').replace(/"/g, '&quot;') + '" onchange="updateSectionData(\'' + id + '\', \'headline\', this.value)">';
        html += '<label style="font-size:11px; color:#9CA3AF; display:block; margin-bottom:6px;">Description</label>';
        html += '<textarea class="luxe-input" rows="3" onchange="updateSectionData(\'' + id + '\', \'description\', this.value)">' + (section.data.description || '') + '</textarea>';
    }

    if (section.type === 'marquee' && section.data) {
        html += '<hr style="border:0; border-top:1px solid #374151; margin:25px 0;">';
        html += '<h4 style="font-size:13px; color:var(--gold); margin:0 0 15px 0; text-transform:uppercase;">Marquee Text</h4>';
        html += '<label style="font-size:11px; color:#9CA3AF; display:block; margin-bottom:6px;">Scrolling Text</label>';
        html += '<input type="text" class="luxe-input" value="' + (section.data.text || '').replace(/"/g, '&quot;') + '" onchange="updateSectionData(\'' + id + '\', \'text\', this.value)">';
    }

    if (section.type === 'amenities' && section.data && section.data.items) {
        html += '<hr style="border:0; border-top:1px solid #374151; margin:25px 0;">';
        html += '<h4 style="font-size:13px; color:var(--gold); margin:0 0 15px 0; text-transform:uppercase;">Amenity Items</h4>';
        section.data.items.forEach((item, idx) => {
            html += '<div style="background:#111827; padding:12px; border-radius:6px; margin-bottom:12px; border:1px solid #374151;">';
            html += '<span style="font-size:12px; font-weight:600; color:#9CA3AF;">Amenity #' + (idx+1) + '</span>';
            html += '<input type="text" class="luxe-input" placeholder="Title" value="' + (item.title || '').replace(/"/g, '&quot;') + '" onchange="updateAmenityItem(\'' + id + '\', ' + idx + ', \'title\', this.value)" style="margin-top:8px; margin-bottom:8px;">';
            html += '<textarea class="luxe-input" placeholder="Description" rows="2" onchange="updateAmenityItem(\'' + id + '\', ' + idx + ', \'desc\', this.value)">' + (item.desc || '') + '</textarea>';
            html += '</div>';
        });
    }

    html += '<div style="margin-top:30px; padding-top:20px; border-top:1px solid #374151;">';
    html += '<button class="luxe-btn" style="width:100%; background:#374151; color:white;" onclick="alert(\'Advanced styling options coming soon\')">🎨 Advanced Styling</button>';
    html += '</div>';

    html += '</div>';
    inspector.innerHTML = html;
}

function updateSectionField(id, field, value) {
    const sec = currentConfig.sections.find(s => s.id === id);
    if (sec) {
        sec[field] = value;
        if(field === 'title') selectSection(id, sec.title, sec.type);
    }
}

function updateSectionData(id, key, value) {
    const sec = currentConfig.sections.find(s => s.id === id);
    if (sec) {
        if (!sec.data) sec.data = {};
        sec.data[key] = value;
    }
}

function updateStatItem(id, idx, key, value) {
    const sec = currentConfig.sections.find(s => s.id === id);
    if (sec && sec.data && sec.data.items && sec.data.items[idx]) {
        sec.data.items[idx][key] = value;
    }
}

function updateAmenityItem(id, idx, key, value) {
    const sec = currentConfig.sections.find(s => s.id === id);
    if (sec && sec.data && sec.data.items && sec.data.items[idx]) {
        sec.data.items[idx][key] = value;
    }
}

function saveConfig() {
    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerText = '⏳ Saving...';
    btn.disabled = true;

    const form = document.createElement('form');
    form.method = 'POST';
    form.innerHTML = `
        <input type="hidden" name="action" value="save_luxe_config">
        <input type="hidden" name="_wpnonce" value="<?php echo wp_create_nonce('luxe_console_nonce'); ?>">
        <input type="hidden" name="config_data" value='${JSON.stringify(currentConfig).replace(/'/g, "&#39;")}'>
    `;
    document.body.appendChild(form);
    form.submit();
}

// Hover effects
document.querySelectorAll('.luxe-section-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        const badge = card.querySelector('.hover-badge');
        if (badge) badge.style.opacity = '1';
    });
    card.addEventListener('mouseleave', () => {
        const badge = card.querySelector('.hover-badge');
        if (badge) badge.style.opacity = '0';
    });
});
</script>
