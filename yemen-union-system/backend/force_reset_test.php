<?php
// backend/force_reset_test.php

require_once __DIR__ . '/vendor/autoload.php';

use App\Config\Database;
use App\Services\Auth\AuthService;
use Dotenv\Dotenv;

// Load environment variables
if (file_exists(__DIR__ . '/.env')) {
    $dotenv = Dotenv::createImmutable(__DIR__);
    $dotenv->load();
}

$phone = '05376439960';
$otp = '123456';
$newPassword = 'NewPassword789!';

echo "--- Forcing Password Reset Test for $phone ---\n";

try {
    $db = Database::getInstance();
    $authService = new AuthService();
    
    // 0. Check Timezone
    $timeCheck = $db->query("SELECT NOW() as db_time, @@global.time_zone as global_tz, @@session.time_zone as session_tz")->fetch();
    echo "DEBUG: DB Time: " . $timeCheck['db_time'] . "\n";
    echo "DEBUG: PHP Time: " . date('Y-m-d H:i:s') . "\n";

    // 1. Manually Inject OTP
    echo "1. Injecting valid OTP '123456' into database...\n";
    $expiresAt = date('Y-m-d H:i:s', strtotime('+10 minutes'));
    $stmt = $db->prepare("INSERT INTO verification_codes (phone_number, otp, expires_at, created_at) VALUES (:phone, :otp, :expiry, NOW())");
    $stmt->execute([
        'phone' => $phone,
        'otp' => $otp,
        'expiry' => $expiresAt
    ]);
    echo "✅ OTP Injected.\n";
    
    // Check what we injected
    $check = $db->prepare("SELECT * FROM verification_codes WHERE phone_number = :phone ORDER BY created_at DESC LIMIT 1");
    $check->execute(['phone' => $phone]);
    $rec = $check->fetch();
    echo "DEBUG: Injected Record: OTP='{$rec['otp']}', Expires='{$rec['expires_at']}'\n";
    
    // 2. Call Reset Password

    echo "2. Calling AuthService::resetPasswordWithOtp...\n";
    $authService->resetPasswordWithOtp($phone, $otp, $newPassword);
    echo "✅ Password Reset Function returned successfully.\n";
    
    // 3. Verify Login
    echo "3. Verifying new password...\n";
    $stmt = $db->prepare("SELECT * FROM users WHERE phone_number = :phone");
    $stmt->execute(['phone' => $phone]);
    $user = $stmt->fetch();
    
    if (password_verify($newPassword, $user['password'])) {
        echo "✅ SUCCESS! Password verified.\n";
        echo "   (User Phone Verified At: " . ($user['phone_verified_at'] ?? 'NULL') . ")\n";
    } else {
        echo "❌ FAILED! Password mismatch.\n";
    }

} catch (Exception $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
}
