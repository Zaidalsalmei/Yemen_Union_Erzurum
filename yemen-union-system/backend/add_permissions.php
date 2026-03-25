<?php
require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$db = \App\Core\Database::getInstance()->getConnection();

echo "=== إضافة جميع الصلاحيات لدور المسؤول ===\n\n";

try {
    $db->beginTransaction();
    
    // 1. إنشاء جميع الصلاحيات الأساسية
    $permissions = [
        // Dashboard
        ['dashboard.read', 'عرض لوحة التحكم', 'View Dashboard'],
        
        // Users
        ['users.read', 'عرض الأعضاء', 'View Users'],
        ['users.create', 'إضافة عضو', 'Create User'],
        ['users.update', 'تعديل عضو', 'Update User'],
        ['users.delete', 'حذف عضو', 'Delete User'],
        ['users.view_all', 'عرض جميع الأعضاء', 'View All Users'],
        ['users.update_all', 'تعديل جميع الأعضاء', 'Update All Users'],
        ['users.verify', 'التحقق من الأعضاء', 'Verify Users'],
        ['users.ban', 'حظر الأعضاء', 'Ban Users'],
        
        // Activities
        ['activities.read', 'عرض الأنشطة', 'View Activities'],
        ['activities.create', 'إضافة نشاط', 'Create Activity'],
        ['activities.update', 'تعديل نشاط', 'Update Activity'],
        ['activities.delete', 'حذف نشاط', 'Delete Activity'],
        ['activities.publish', 'نشر نشاط', 'Publish Activity'],
        ['activities.manage_participants', 'إدارة المشاركين', 'Manage Participants'],
        
        // Memberships
        ['memberships.view_all', 'عرض جميع الاشتراكات', 'View All Memberships'],
        ['memberships.create', 'إضافة اشتراك', 'Create Membership'],
        ['memberships.update', 'تعديل اشتراك', 'Update Membership'],
        
        // Sponsors
        ['sponsors.view', 'عرض الجهات الداعمة', 'View Sponsors'],
        ['sponsors.create', 'إضافة جهة داعمة', 'Create Sponsor'],
        ['sponsors.update', 'تعديل جهة داعمة', 'Update Sponsor'],
        ['sponsors.delete', 'حذف جهة داعمة', 'Delete Sponsor'],
        
        // Sponsorships
        ['sponsorships.view', 'عرض الرعايات', 'View Sponsorships'],
        ['sponsorships.create', 'إضافة رعاية', 'Create Sponsorship'],
        
        // Settings
        ['settings.read', 'عرض الإعدادات', 'View Settings'],
        ['settings.update', 'تعديل الإعدادات', 'Update Settings'],
        ['settings.branding', 'إدارة العلامة التجارية', 'Manage Branding'],
        
        // Roles & Permissions
        ['roles.view', 'عرض الأدوار', 'View Roles'],
        ['roles.manage', 'إدارة الأدوار', 'Manage Roles'],
        ['permissions.manage', 'إدارة الصلاحيات', 'Manage Permissions'],
    ];
    
    $createdCount = 0;
    foreach ($permissions as $perm) {
        $stmt = $db->prepare("
            INSERT INTO permissions (name, display_name_ar, description_ar, is_system_permission, created_at)
            VALUES (?, ?, ?, 1, NOW())
            ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)
        ");
        $stmt->execute([$perm[0], $perm[1], $perm[2]]);
        $createdCount++;
    }
    
    echo "✓ تم إنشاء/تحديث $createdCount صلاحية\n";
    
    // 2. الحصول على ID دور المسؤول
    $stmt = $db->prepare("SELECT id FROM roles WHERE name = 'admin'");
    $stmt->execute();
    $adminRoleId = $stmt->fetchColumn();
    
    if (!$adminRoleId) {
        throw new Exception("دور المسؤول غير موجود!");
    }
    
    echo "✓ دور المسؤول (ID: $adminRoleId)\n";
    
    // 3. ربط جميع الصلاحيات بدور المسؤول
    $stmt = $db->prepare("
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT ?, id
        FROM permissions
        ON DUPLICATE KEY UPDATE role_id=role_id
    ");
    $stmt->execute([$adminRoleId]);
    
    $linkedCount = $stmt->rowCount();
    echo "✓ تم ربط جميع الصلاحيات بدور المسؤول ($linkedCount صلاحية)\n";
    
    $db->commit();
    
    echo "\n=== ✅ اكتمل بنجاح! ===\n\n";
    
    // التحقق
    $stmt = $db->prepare("
        SELECT COUNT(*) as count 
        FROM role_permissions 
        WHERE role_id = ?
    ");
    $stmt->execute([$adminRoleId]);
    $count = $stmt->fetchColumn();
    
    echo "📊 عدد الصلاحيات المرتبطة بدور المسؤول: $count\n";
    
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    echo "\n✗ خطأ: " . $e->getMessage() . "\n";
}
