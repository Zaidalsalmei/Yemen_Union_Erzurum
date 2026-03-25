<?php
/**
 * COMPREHENSIVE SEED DATA
 * Creates sample data for testing the UI
 */

require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$db = \App\Core\Database::getInstance()->getConnection();

echo "=== CREATING SEED DATA ===\n\n";

try {
    $db->beginTransaction();
    
    // 1. Create Sample Users
    echo "Creating sample users...\n";
    $users = [
        ['أحمد محمد علي', '05301234567', 'ahmed@example.com'],
        ['فاطمة حسن', '05302345678', 'fatima@example.com'],
        ['محمود سعيد', '05303456789', 'mahmoud@example.com'],
        ['نور الدين', '05304567890', 'noor@example.com'],
        ['سارة أحمد', '05305678901', 'sara@example.com'],
    ];
    
    $password = password_hash('password', PASSWORD_BCRYPT);
    
    foreach ($users as [$name, $phone, $email]) {
        $stmt = $db->prepare("
            INSERT INTO users (full_name, phone_number, email, password, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'active', NOW(), NOW())
            ON DUPLICATE KEY UPDATE id=id
        ");
        $stmt->execute([$name, $phone, $email, $password]);
    }
    
    echo "✓ Created " . count($users) . " sample users\n\n";
    
    // 2. Create Sample Activities
    echo "Creating sample activities...\n";
    $activities = [
        ['حفل استقبال الطلاب الجدد', 'قاعة المؤتمرات', date('Y-m-d H:i:s', strtotime('+7 days'))],
        ['ندوة ثقافية', 'المركز الثقافي', date('Y-m-d H:i:s', strtotime('+14 days'))],
        ['رحلة ترفيهية', 'إسطنبول', date('Y-m-d H:i:s', strtotime('+21 days'))],
        ['دورة تدريبية', 'مقر الاتحاد', date('Y-m-d H:i:s', strtotime('+28 days'))],
    ];
    
    foreach ($activities as [$title, $location, $date]) {
        $stmt = $db->prepare("
            INSERT INTO activities (title_ar, location_ar, activity_date, status, created_at, updated_at)
            VALUES (?, ?, ?, 'published', NOW(), NOW())
        ");
        $stmt->execute([$title, $location, $date]);
    }
    
    echo "✓ Created " . count($activities) . " sample activities\n\n";
    
    // 3. Create Sample Notifications
    echo "Creating sample notifications...\n";
    $notifications = [
        ['إعلان', 'مرحباً بك في نظام الاتحاد', 'تم تفعيل حسابك بنجاح'],
        ['تنبيه', 'فعالية قادمة', 'لا تنسى حضور حفل الاستقبال'],
        ['معلومة', 'تحديث النظام', 'تم إضافة ميزات جديدة'],
    ];
    
    foreach ($notifications as [$type, $title, $message]) {
        $stmt = $db->prepare("
            INSERT INTO notifications (type, title, message, created_at)
            VALUES (?, ?, ?, NOW())
        ");
        $stmt->execute([$type, $title, $message]);
    }
    
    echo "✓ Created " . count($notifications) . " sample notifications\n\n";
    
    $db->commit();
    
    echo "\n=== ✅ SEED DATA CREATED SUCCESSFULLY! ===\n\n";
    echo "📊 Summary:\n";
    echo "  • " . count($users) . " users\n";
    echo "  • " . count($activities) . " activities\n";
    echo "  • " . count($notifications) . " notifications\n";
    echo "\n🎉 You can now see data in the UI!\n";
    
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    echo "\n✗ Error: " . $e->getMessage() . "\n";
}
