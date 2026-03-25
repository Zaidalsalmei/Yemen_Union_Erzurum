<?php
// backend/test_reset_flow.php

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
$newPassword = 'NewPassword123!';

echo "--- Testing Password Reset Flow for $phone ---\n";

try {
    $db = Database::getInstance();
    $authService = new AuthService();
    
    // 1. Check if user exists
    echo "\n1. Checking if user exists...\n";
    $stmt = $db->prepare("SELECT * FROM users WHERE phone_number = :phone");
    $stmt->execute(['phone' => $phone]);
    $user = $stmt->fetch();
    
    if (!$user) {
        die("❌ User not found in database! (Phone: $phone)\n   Please make sure this number is registered first.\n");
    }
    echo "✅ User found: " . ($user['full_name'] ?? 'Unknown User') . " (ID: " . $user['id'] . ")\n";

    // 2. Simulate Sending OTP
    echo "\n2. Generating OTP...\n";
    try {
        // This will try to send SMS via Wasender. Even if SMS fails, DB insert should happen.
        $result = $authService->sendRecoveryOtp($phone);
        echo "✅ sendRecoveryOtp API called successfully.\n";
    } catch (Exception $e) {
        echo "⚠️  sendRecoveryOtp returned error (might be API connection): " . $e->getMessage() . "\n";
        echo "   Continuing check to see if OTP was generated in DB anyway...\n";
    }
    
    // 3. Retrieve OTP from DB (Simulating receiving SMS)
    echo "\n3. Retrieving OTP from Database...\n";
    $stmt = $db->prepare("SELECT otp, created_at FROM verification_codes WHERE phone_number = :phone ORDER BY created_at DESC LIMIT 1");
    $stmt->execute(['phone' => $phone]);
    $codeRecord = $stmt->fetch();
    $otp = $codeRecord['otp'] ?? null;
    
    if (!$otp) {
        die("❌ OTP not generated in database.\n");
    }
    echo "✅ OTP Retrieved: $otp (Created: " . $codeRecord['created_at'] . ")\n";
    
    // 4. Verify OTP (Step 1 of Wizard done via API)
    echo "\n4. Verifying OTP (Simulating Step 2)...\n";
    $verification = $authService->verifyRecoveryOtp($phone, $otp);
    if ($verification['verified'] ?? false) {
        echo "✅ OTP Verified successfully by AuthService.\n";
    } else {
        die("❌ OTP Verification failed in AuthService.\n");
    }
    
    // 5. Reset Password (Step 2 of Wizard)
    echo "\n5. Resetting Password (Simulating Step 3)...\n";
    $authService->resetPasswordWithOtp($phone, $otp, $newPassword);
    echo "✅ AuthService::resetPasswordWithOtp completed without error.\n";
    
    // 6. Verify Reset
    echo "\n6. Verifying New Password in Database...\n";
    $stmt = $db->prepare("SELECT password FROM users WHERE id = :id");
    $stmt->execute(['id' => $user['id']]);
    $updatedUser = $stmt->fetch();
    
    if (password_verify($newPassword, $updatedUser['password'])) {
        echo "✅ SUCCESS! Password has been securely updated.\n";
        echo "   New Password: $newPassword\n";
    } else {
        echo "❌ FAILED! Database password does not match new password.\n";
    }

} catch (Exception $e) {
    echo "\n❌ CRITICAL ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " on line " . $e->getLine() . "\n";
}
