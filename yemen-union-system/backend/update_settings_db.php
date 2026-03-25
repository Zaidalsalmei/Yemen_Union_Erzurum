<?php
require_once __DIR__ . '/src/Core/Database.php';
$db = \App\Core\Database::getInstance()->getConnection();

$settings = [
    ['logo_path', '/logo.jpg', 'branding', 'string', 'Logo Path'],
    ['accent_color', '#F59E0B', 'branding', 'string', 'Accent Color'],
    ['sidebar_color', '#1F2937', 'branding', 'string', 'Sidebar Color'],
    ['sidebar_text_color', '#FFFFFF', 'branding', 'string', 'Sidebar Text Color'],
    ['watermark_opacity', '0.05', 'branding', 'number', 'Watermark Opacity'],
    ['union_name_ar', 'اتحاد الطلاب اليمنيين', 'branding', 'string', 'Union Name Ar'],
    ['union_name_en', 'Yemen Student Union', 'branding', 'string', 'Union Name En'],
    ['primary_color', '#DC2626', 'branding', 'string', 'Primary Color'],
    ['watermark_enabled', '1', 'branding', 'boolean', 'Watermark Enabled'],
];

$stmt = $db->prepare("INSERT IGNORE INTO settings (setting_key, setting_value, category, data_type, label_ar) VALUES (?, ?, ?, ?, ?)");

foreach ($settings as $s) {
    $stmt->execute($s);
}

echo "Settings updated successfully.\n";
