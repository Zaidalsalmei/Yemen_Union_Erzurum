<?php
require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$db = \App\Core\Database::getInstance()->getConnection();

// بيانات الحساب
$phone = '05376439960';
$password = 'Admin@123456';
$fullName = 'المسؤول الرئيسي';
$email = 'main.admin@yemen-union.com';

// توليد hash
$passwordHash = password_hash($password, PASSWORD_BCRYPT);

echo "=== إنشاء حساب المسؤول الرئيسي ===\n\n";
echo "رقم الهاتف: $phone\n";
echo "كلمة المرور: $password\n\n";

try {
    $db->beginTransaction();
    
    // 1. حذف المستخدم إذا كان موجود
    $stmt = $db->prepare("DELETE FROM users WHERE phone_number = ?");
    $stmt->execute([$phone]);
    
    // 2. إنشاء المستخدم
    $stmt = $db->prepare("
        INSERT INTO users (full_name, phone_number, password, email, status, created_at, updated_at) 
        VALUES (?, ?, ?, ?, 'active', NOW(), NOW())
    ");
    $stmt->execute([$fullName, $phone, $passwordHash, $email]);
    $userId = $db->lastInsertId();
    
    echo "✓ تم إنشاء المستخدم (ID: $userId)\n";
    
    // 3. الحصول على دور المسؤول
    $stmt = $db->prepare("SELECT id FROM roles WHERE name = 'admin' LIMIT 1");
    $stmt->execute();
    $adminRoleId = $stmt->fetchColumn();
    
    if ($adminRoleId) {
        // 4. ربط المستخدم بدور المسؤول
        $stmt = $db->prepare("INSERT INTO user_roles (user_id, role_id, created_at) VALUES (?, ?, NOW())");
        $stmt->execute([$userId, $adminRoleId]);
        echo "✓ تم ربط المستخدم بدور المسؤول\n";
    } else {
        echo "⚠ تحذير: دور المسؤول غير موجود\n";
    }
    
    $db->commit();
    
    echo "\n=== ✅ تم إنشاء الحساب بنجاح! ===\n\n";
    
    // التحقق
    $stmt = $db->prepare("SELECT password FROM users WHERE phone_number = ?");
    $stmt->execute([$phone]);
    $storedHash = $stmt->fetchColumn();
    
    if (password_verify($password, $storedHash)) {
        echo "✓ التحقق من كلمة المرور: ناجح ✓\n\n";
    } else {
        echo "✗ التحقق من كلمة المرور: فشل\n\n";
    }
    
    echo "📋 بيانات تسجيل الدخول:\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "رقم الهاتف: $phone\n";
    echo "كلمة المرور: $password\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    echo "\n✗ خطأ: " . $e->getMessage() . "\n";
}
