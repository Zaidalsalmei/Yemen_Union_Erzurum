<?php
/**
 * OTP Service - Handles OTP generation, sending, and verification
 */

declare(strict_types=1);

namespace App\Services;

use App\Services\WasenderService;
use PDO;
use Exception;

class OtpService
{
    private PDO $db;
    private WasenderService $waSender;
    
    public function __construct()
    {
        $this->db = \App\Core\Database::getInstance()->getConnection();
        $this->waSender = new WasenderService();
    }
    
    /**
     * Generate and send OTP to phone number
     */
    public function sendOtp(string $phoneNumber): array
    {
        // Rate Limiting Check (1 minute)
        $stmt = $this->db->prepare("
            SELECT created_at FROM verification_codes 
            WHERE phone_number = :phone 
            ORDER BY created_at DESC LIMIT 1
        ");
        $stmt->execute(['phone' => $phoneNumber]);
        $lastCode = $stmt->fetch();
        
        if ($lastCode && (strtotime($lastCode['created_at']) > strtotime('-1 minute'))) {
            throw new Exception('يرجى الانتظار دقيقة قبل طلب رمز جديد');
        }
        
        // Check daily limit (50 attempts - generous for now)
        $stmtCount = $this->db->prepare("
            SELECT COUNT(*) as count FROM verification_codes 
            WHERE phone_number = :phone 
            AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
        ");
        $stmtCount->execute(['phone' => $phoneNumber]);
        $attempts = $stmtCount->fetch()['count'];
        
        if ($attempts >= 50) {
            throw new Exception('تم تجاوز العدد المسموح من المحاولات اليوم');
        }
        
        // Generate OTP
        $otp = (string) random_int(100000, 999999);
        $expiresAt = date('Y-m-d H:i:s', strtotime('+5 minutes'));
        
        // Store in DB
        $insertStmt = $this->db->prepare("
            INSERT INTO verification_codes (phone_number, otp, expires_at, created_at, updated_at)
            VALUES (:phone, :otp, :expires_at, NOW(), NOW())
        ");
        
        $insertStmt->execute([
            'phone' => $phoneNumber,
            'otp' => $otp,
            'expires_at' => $expiresAt
        ]);
        
        // Send via Wasender
        $message = "رمز التحقق الخاص بك هو: $otp";
        $result = $this->waSender->sendMessage($phoneNumber, $message);
        
        if (!$result['success']) {
            throw new Exception('فشل إرسال رمز التحقق: ' . ($result['message'] ?? 'خطأ غير معروف'));
        }
        
        // For development/debugging, you might return the OTP, but not in production
        return [
            'success' => true,
            'message' => 'تم إرسال رمز التحقق بنجاح',
             // 'debug_otp' => $otp 
        ];
    }
    
    /**
     * Verify OTP code
     */
    public function verifyOtp(string $phoneNumber, string $otp, bool $consume = false): bool
    {
        $stmt = $this->db->prepare("
            SELECT * FROM verification_codes 
            WHERE phone_number = :phone 
            AND otp = :otp 
            AND expires_at > NOW()
            ORDER BY created_at DESC LIMIT 1
        ");
        
        $stmt->execute(['phone' => $phoneNumber, 'otp' => $otp]);
        $record = $stmt->fetch();
        
        if ($record) {
            // Valid OTP
            
            if ($consume) {
                // Delete used OTP
                $deleteStmt = $this->db->prepare("DELETE FROM verification_codes WHERE phone_number = :phone");
                $deleteStmt->execute(['phone' => $phoneNumber]);
            }
            
            return true;
        }
        
        return false;
    }
}
