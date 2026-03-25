<?php

namespace App\Controllers;

use App\Core\Request;
use App\Config\Database;
use App\Services\OtpService;
use App\Helpers\ResponseHelper;

class VerificationController
{
    private OtpService $otpService;


    public function __construct()
    {
        $this->otpService = new \App\Services\OtpService();
    }

    /**
     * Send OTP
     * POST /api/auth/send-otp
     */
    public function sendOtp(Request $request): array
    {
        try {
            $phone = $request->input('phone_number');

            if (empty($phone)) {
                return ResponseHelper::validationError('رقم الهاتف مطلوب', []);
            }

            $result = $this->otpService->sendOtp($phone);

            return ResponseHelper::success($result['message'] /*, $result */);
            
        } catch (\Exception $e) {
            $code = $e->getMessage() === 'تم تجاوز العدد المسموح من المحاولات اليوم' || 
                    str_contains($e->getMessage(), 'يرجى الانتظار') ? 429 : 500;
            return ResponseHelper::error($e->getMessage(), $code);
        }
    }

    /**
     * Verify OTP
     * POST /api/auth/verify-otp
     */
    public function verifyOtp(Request $request): array
    {
        $phone = $request->input('phone_number');
        $otp = $request->input('otp');

        if (empty($phone) || empty($otp)) {
            return ResponseHelper::validationError('رقم الهاتف ورمز التحقق مطلوبان', []);
        }

        try {
            $isValid = $this->otpService->verifyOtp($phone, $otp, true);

            if ($isValid) {
                // Mark user as verified if they exist
                 $db = Database::getInstance();
                 $updateUser = $db->prepare("UPDATE users SET phone_verified_at = NOW() WHERE phone_number = :phone");
                 $updateUser->execute(['phone' => $phone]);

                return ResponseHelper::success('تم التحقق من رقم الهاتف بنجاح');
            } else {
                return ResponseHelper::error('رمز التحقق غير صحيح أو منتهي الصلاحية', 400);
            }
        } catch (\Exception $e) {
             return ResponseHelper::error($e->getMessage(), 500);
        }
    }
}

