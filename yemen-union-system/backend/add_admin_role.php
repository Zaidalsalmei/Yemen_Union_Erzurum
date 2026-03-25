<?php
require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$db = \App\Core\Database::getInstance()->getConnection();

echo "=== إضافة دور المسؤول وربطه بالمستخدم ===\n\n";

try {
    // 1. إنشاء دور المسؤول
    $stmt = $db->prepare("
        INSERT INTO roles (name, display_name_ar, description_ar, is_system_role, is_active, created_at, updated_at)
        VALUES ('admin', 'مسؤول', 'صلاحيات كاملة للنظام', 1, 1, NOW(), NOW())
        ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)
    ");
    $stmt->execute();
    $adminRoleId = $db->lastInsertId();
    
    echo "✓ دور المسؤول (ID: $adminRoleId)\n";
    
    // 2. الحصول على ID المستخدم
    $stmt = $db->prepare("SELECT id FROM users WHERE phone_number = '05376439960'");
    $stmt->execute();
    $userId = $stmt->fetchColumn();
    
    if ($userId) {
        echo "✓ المستخدم موجود (ID: $userId)\n";
        
        // 3. ربط المستخدم بالدور
        $stmt = $db->prepare("
            INSERT INTO user_roles (user_id, role_id)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE user_id=user_id
        ");
        $stmt->execute([$userId, $adminRoleId]);
        
        echo "✓ تم ربط المستخدم بدور المسؤول\n\n";
        echo "=== ✅ اكتمل! ===\n";
    } else {
        echo "✗ المستخدم غير موجود!\n";
    }
    
} catch (Exception $e) {
    echo "✗ خطأ: " . $e->getMessage() . "\n";
}
