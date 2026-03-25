<?php
/**
 * Fix President Permissions
 * يتأكد من أن حساب الرئيس لديه صلاحيات كاملة في قاعدة البيانات
 */

declare(strict_types=1);

require_once __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../..');
$dotenv->load();

$dsn = sprintf(
    'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
    $_ENV['DB_HOST'],
    $_ENV['DB_PORT'] ?? '3306',
    $_ENV['DB_DATABASE']
);

$pdo = new PDO($dsn, $_ENV['DB_USERNAME'], $_ENV['DB_PASSWORD'], [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

echo "=== إصلاح صلاحيات الرئيس ===\n\n";

// 1. ابحث عن حساب الرئيس برقم الهاتف
$phone = '05350703570';
$userStmt = $pdo->prepare("SELECT * FROM users WHERE phone_number = ? AND deleted_at IS NULL");
$userStmt->execute([$phone]);
$user = $userStmt->fetch();

if (!$user) {
    die("❌ لم يتم العثور على حساب الرئيس برقم الهاتف: {$phone}\n");
}

echo "✅ تم العثور على الحساب: {$user['full_name']} (ID: {$user['id']})\n";

// 2. تأكد من وجود دور الرئيس
$roleStmt = $pdo->prepare("SELECT * FROM roles WHERE name = 'president'");
$roleStmt->execute();
$presidentRole = $roleStmt->fetch();

if (!$presidentRole) {
    // أنشئ دور الرئيس إذا لم يكن موجوداً
    echo "⚠️ دور president غير موجود، سيتم إنشاؤه...\n";
    $createRoleStmt = $pdo->prepare("
        INSERT INTO roles (name, display_name, display_name_ar, description, level, created_at)
        VALUES ('president', 'President', 'رئيس الاتحاد', 'رئيس اتحاد الطلاب اليمنيين - صلاحيات كاملة', 100, NOW())
    ");
    $createRoleStmt->execute();
    $presidentRoleId = (int)$pdo->lastInsertId();
    echo "✅ تم إنشاء دور president (ID: {$presidentRoleId})\n";
} else {
    $presidentRoleId = (int)$presidentRole['id'];
    echo "✅ دور president موجود (ID: {$presidentRoleId})\n";
}

// 3. تأكد من تعيين دور الرئيس للمستخدم مع is_active = 1
$checkRoleStmt = $pdo->prepare("
    SELECT * FROM user_roles WHERE user_id = ? AND role_id = ?
");
$checkRoleStmt->execute([$user['id'], $presidentRoleId]);
$existingRole = $checkRoleStmt->fetch();

if ($existingRole) {
    // تحديث ليكون نشطاً
    $updateStmt = $pdo->prepare("
        UPDATE user_roles
        SET is_active = 1, granted_at = NOW()
        WHERE user_id = ? AND role_id = ?
    ");
    $updateStmt->execute([$user['id'], $presidentRoleId]);
    echo "✅ تم تحديث دور الرئيس ليكون نشطاً\n";
} else {
    // إدراج جديد
    $insertStmt = $pdo->prepare("
        INSERT INTO user_roles (user_id, role_id, granted_at, is_active)
        VALUES (?, ?, NOW(), 1)
    ");
    $insertStmt->execute([$user['id'], $presidentRoleId]);
    echo "✅ تم تعيين دور الرئيس للحساب\n";
}

// 4. تأكد من أن وضع الحساب = active
if ($user['status'] !== 'active') {
    $activeStmt = $pdo->prepare("UPDATE users SET status = 'active' WHERE id = ?");
    $activeStmt->execute([$user['id']]);
    echo "✅ تم تفعيل الحساب (كان: {$user['status']})\n";
} else {
    echo "✅ الحساب نشط بالفعل\n";
}

// 5. تحقق من الأدوار والصلاحيات النهائية
echo "\n=== التحقق النهائي ===\n";
$finalRolesStmt = $pdo->prepare("
    SELECT r.name, r.display_name_ar, ur.is_active
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = ?
");
$finalRolesStmt->execute([$user['id']]);
$finalRoles = $finalRolesStmt->fetchAll();

echo "الأدوار المعيّنة:\n";
foreach ($finalRoles as $r) {
    $active = $r['is_active'] ? '✅' : '❌';
    echo "  {$active} {$r['name']} ({$r['display_name_ar']})\n";
}

// 6. التحقق من صلاحيات دور الرئيس في قاعدة البيانات
$permCountStmt = $pdo->prepare("
    SELECT COUNT(*) as cnt FROM role_permissions WHERE role_id = ?
");
$permCountStmt->execute([$presidentRoleId]);
$permCount = (int)$permCountStmt->fetch()['cnt'];
echo "\nعدد الصلاحيات المعيّنة لدور president: {$permCount}\n";

if ($permCount === 0) {
    echo "⚠️ دور الرئيس لا يملك صلاحيات في جدول role_permissions!\n";
    echo "   سيتم منح جميع الصلاحيات المتاحة...\n";
    
    // جلب جميع الصلاحيات
    $allPermsStmt = $pdo->query("SELECT id FROM permissions");
    $allPerms = $allPermsStmt->fetchAll();
    
    if (!empty($allPerms)) {
        $insertPermStmt = $pdo->prepare("
            INSERT IGNORE INTO role_permissions (role_id, permission_id)
            VALUES (?, ?)
        ");
        foreach ($allPerms as $perm) {
            $insertPermStmt->execute([$presidentRoleId, $perm['id']]);
        }
        echo "✅ تم منح جميع الصلاحيات (" . count($allPerms) . " صلاحية) لدور الرئيس\n";
    }
}

echo "\n✅ انتهى إصلاح صلاحيات الرئيس بنجاح!\n";
echo "⚡ يرجى تسجيل الخروج وإعادة الدخول ليصبح التغيير فعالاً.\n";
