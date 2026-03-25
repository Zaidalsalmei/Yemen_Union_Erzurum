<?php
declare(strict_types=1);

namespace App\Services;

use App\Core\Database;
use App\Services\TelegramService;
use Exception;
use PDO;

class AdminOtpService
{
    private PDO $db;
    private TelegramService $telegramService;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
        $this->telegramService = new TelegramService();
    }

    /**
     * Generate and send admin/member verification OTPs via Telegram.
     */
    public function sendAdminOtp(string $fullName, string $phoneNumber): array
    {
        // 1. Generate two distinct codes
        $adCode = "AD-" . random_int(1000, 9999);
        $mbCode = "MB-" . random_int(1000, 9999);
        $expiresAt = date('Y-m-d H:i:s', strtotime('+60 minutes')); // Codes valid for 1 hour

        // 2. Store in DB (one set of active codes per phone)
        try {
            // Delete previous codes for this phone to avoid ambiguity
            $this->db->prepare("DELETE FROM admin_verification_codes WHERE phone_number = :phone")
                     ->execute(['phone' => $phoneNumber]);

            // Store Admin Code
            $stmtAd = $this->db->prepare("
                INSERT INTO admin_verification_codes (full_name, phone_number, otp, expires_at)
                VALUES (:full_name, :phone, :otp, :expires_at)
            ");
            $stmtAd->execute([
                'full_name' => $fullName,
                'phone' => $phoneNumber,
                'otp' => $adCode,
                'expires_at' => $expiresAt
            ]);

            // Store Member Code
            $stmtMb = $this->db->prepare("
                INSERT INTO admin_verification_codes (full_name, phone_number, otp, expires_at)
                VALUES (:full_name, :phone, :otp, :expires_at)
            ");
            $stmtMb->execute([
                'full_name' => $fullName,
                'phone' => $phoneNumber,
                'otp' => $mbCode,
                'expires_at' => $expiresAt
            ]);

        } catch (Exception $e) {
            error_log("Admin OTP DB Storage Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'حدث خطأ أثناء حفظ كود التحقق.'];
        }

        // 3. Prepare Telegram message
        $message = "<b>📩 طلب تسجيل جديد:</b>\n";
        $message .= "<b>📌 الاسم:</b> {$fullName}\n";
        $message .= "<b>📱 الهاتف:</b> {$phoneNumber}\n\n";
        $message .= "<b>👑 لجعله رئيساً أعطه (Admin):</b>\n<code>{$adCode}</code>\n\n";
        $message .= "<b>🎓 لجعله عضواً أعطه (Member):</b>\n<code>{$mbCode}</code>\n\n";
        $message .= "<i>⚠️ الأكواد صالحة لمدة ساعة واحدة.</i>";

        // 4. Send via Telegram
        $result = $this->telegramService->sendAdminNotification($message);

        if (!$result['success']) {
            return [
                'success' => false,
                'message' => 'فشل إرسال كود التحقق عبر تلجرام: ' . $result['message']
            ];
        }

        return [
            'success' => true,
            'message' => 'تم إرسال طلب الكود للمسؤول. سيصلك الكود قريباً.'
        ];
    }

    /**
     * Verify the provided OTP and return user identity if found.
     */
    public function verifyAdminOtp(string $phoneNumber, string $otp): ?array
    {
        $stmt = $this->db->prepare("
            SELECT * FROM admin_verification_codes 
            WHERE phone_number = :phone 
            AND otp = :otp 
            AND expires_at > NOW()
            ORDER BY created_at DESC LIMIT 1
        ");
        
        $stmt->execute(['phone' => $phoneNumber, 'otp' => $otp]);
        $record = $stmt->fetch();
        
        if ($record) {
            // Success: delete the code so it can't be reused
            $this->db->prepare("DELETE FROM admin_verification_codes WHERE phone_number = :phone")
                     ->execute(['phone' => $phoneNumber]);
            return $record;
        }
        
        return null;
    }
}
