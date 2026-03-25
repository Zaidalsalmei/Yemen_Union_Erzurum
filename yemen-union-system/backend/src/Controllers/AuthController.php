<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Database;
use App\Services\Auth\AuthService;
use App\Helpers\ResponseHelper;
use App\Exceptions\ValidationException;

class AuthController
{
    private AuthService $authService;

    public function __construct()
    {
        $this->authService = new AuthService();
    }

    public function login(Request $request): array
    {
        $phoneNumber = $request->input('phone_number');
        $password = $request->input('password');

        $errors = [];
        if (empty($phoneNumber)) {
            $errors['phone_number'][] = 'رقم الهاتف مطلوب';
        }
        if (empty($password)) {
            $errors['password'][] = 'كلمة المرور مطلوبة';
        }

        if (!empty($errors)) {
            return ResponseHelper::validationError('خطأ في البيانات المدخلة', $errors);
        }

        try {
            $result = $this->authService->login(
                $phoneNumber,
                $password,
                $request->getClientIp(),
                $request->getUserAgent(),
                $request->input('device_type', 'web')
            );

            return ResponseHelper::success('تم تسجيل الدخول بنجاح', $result);
        } catch (\Exception $e) {
            return ResponseHelper::error('DEBUG: ' . $e->getMessage() . ' | Phone: ' . $phoneNumber . ' | PassLength: ' . strlen($password ?? ''), 401);
        }
    }

    public function refresh(Request $request): array
    {
        $refreshToken = $request->input('refresh_token');

        if (empty($refreshToken)) {
            return ResponseHelper::error('رمز التحديث مطلوب', 400);
        }

        try {
            $result = $this->authService->refreshToken($refreshToken);
            return ResponseHelper::success('تم تحديث التوكن بنجاح', $result);
        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage(), 401);
        }
    }

    public function register(Request $request): array
    {
        $data = $request->only(['full_name', 'phone_number', 'email', 'password', 'role', 'admin_otp']);

        $errors = [];
        if (empty($data['full_name'])) {
            $errors['full_name'][] = 'الاسم الكامل مطلوب';
        }

        if (empty($data['phone_number'])) {
            $errors['phone_number'][] = 'رقم الهاتف مطلوب';
        } elseif (!preg_match('/^05\d{9}$/', $data['phone_number'])) {
            $errors['phone_number'][] = 'رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 11 رقم';
        }

        if (empty($data['password'])) {
            $errors['password'][] = 'كلمة المرور مطلوبة';
        } elseif (strlen($data['password']) < 6) {
            $errors['password'][] = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
        }

        $role = $data['role'] ?? 'member';
        if ($role === 'president' && empty($data['admin_otp'])) {
            $errors['admin_otp'][] = 'كود التحقق الإداري مطلوب لرتبة الرئيس';
        }

        if (!empty($errors)) {
            return ResponseHelper::validationError('خطأ في البيانات المدخلة', $errors);
        }

        try {
            $this->authService->register($data);
            return ResponseHelper::success('تم إنشاء الحساب بنجاح. يرجى تسجيل الدخول');
        } catch (ValidationException $e) {
            return ResponseHelper::validationError($e->getMessage());
        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage(), 400);
        }
    }

    public function requestAdminOtp(Request $request): array
    {
        $fullName = $request->input('full_name');
        $phoneNumber = $request->input('phone_number');

        if (empty($fullName) || empty($phoneNumber)) {
            return ResponseHelper::validationError('الاسم الكامل ورقم الهاتف مطلوبين لطلب الكود');
        }

        try {
            $result = $this->authService->requestAdminOtp($fullName, $phoneNumber);
            return ResponseHelper::success($result['message'] ?? 'تم إرسال الكود بنجاح');
        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage(), 400);
        }
    }

    public function logout(Request $request): array
    {
        $sessionId = (int)($request->user['session_id'] ?? 0);

        if ($sessionId > 0) {
            try {
                $this->authService->logout($sessionId);
            } catch (\Exception $e) {
                // Ignore errors
            }
        }

        return ResponseHelper::success('تم تسجيل الخروج بنجاح');
    }

    public function me(Request $request): array
    {
        try {
            $userId = (int)($request->user['id'] ?? 0);
            if ($userId <= 0) {
                throw new \Exception('مستخدم غير مصرح له');
            }

            $profile = $this->authService->getProfile($userId);
            return ResponseHelper::success('تم جلب البيانات بنجاح', $profile);
        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage(), 401);
        }
    }

    public function sendOtp(Request $request): array
    {
        $phoneNumber = $request->input('phone_number');

        if (empty($phoneNumber)) {
            return ResponseHelper::validationError('رقم الهاتف مطلوب');
        }

        if (!preg_match('/^05\d{9}$/', $phoneNumber)) {
            return ResponseHelper::validationError('رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 11 رقم');
        }

        try {
            $result = $this->authService->sendOtp($phoneNumber);
            return ResponseHelper::success('تم إرسال رمز التحقق بنجاح', $result);
        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage(), 400);
        }
    }

    public function verifyOtp(Request $request): array
    {
        $phoneNumber = $request->input('phone_number');
        $otp = $request->input('otp');

        $errors = [];
        if (empty($phoneNumber)) {
            $errors['phone_number'][] = 'رقم الهاتف مطلوب';
        }
        if (empty($otp)) {
            $errors['otp'][] = 'رمز التحقق مطلوب';
        }

        if (!empty($errors)) {
            return ResponseHelper::validationError('خطأ في البيانات المدخلة', $errors);
        }

        try {
            $verified = $this->authService->verifyOtp($phoneNumber, $otp);
            if (!$verified) {
                return ResponseHelper::error('رمز التحقق غير صحيح أو منتهي الصلاحية', 400);
            }
            return ResponseHelper::success('تم التحقق من رقم الهاتف بنجاح');
        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage(), 400);
        }
    }

    public function changePassword(Request $request): array
    {
        $currentPassword = $request->input('current_password');
        $newPassword = $request->input('new_password');
        $confirmPassword = $request->input('confirm_password');

        $errors = [];
        if (empty($currentPassword)) {
            $errors['current_password'][] = 'كلمة المرور الحالية مطلوبة';
        }
        if (empty($newPassword)) {
            $errors['new_password'][] = 'كلمة المرور الجديدة مطلوبة';
        } elseif (strlen($newPassword) < 8) {
            $errors['new_password'][] = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
        }
        if ($newPassword !== $confirmPassword) {
            $errors['confirm_password'][] = 'كلمة المرور غير متطابقة';
        }

        if (!empty($errors)) {
            return ResponseHelper::validationError('خطأ في البيانات المدخلة', $errors);
        }

        try {
            $userId = (int)($request->user['id'] ?? 0);
            $this->authService->changePassword($userId, $currentPassword, $newPassword);
            return ResponseHelper::success('تم تغيير كلمة المرور بنجاح');
        } catch (ValidationException $e) {
            return ResponseHelper::validationError($e->getMessage());
        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage(), 400);
        }
    }

    public function sendRecoveryOtp(Request $request): array
    {
        $email = $request->input('email');

        if (empty($email)) {
            return ResponseHelper::validationError('البريد الإلكتروني مطلوب');
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ResponseHelper::validationError('البريد الإلكتروني غير صالح');
        }

        try {
            $result = $this->authService->sendRecoveryOtp($email);
            return ResponseHelper::success('تم إرسال رمز التحقق بنجاح', $result);
        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage(), 400);
        }
    }

    public function verifyRecoveryOtp(Request $request): array
    {
        $email = $request->input('email');
        $otp = $request->input('otp');

        $errors = [];
        if (empty($email)) {
            $errors['email'][] = 'البريد الإلكتروني مطلوب';
        }
        if (empty($otp)) {
            $errors['otp'][] = 'رمز التحقق مطلوب';
        }

        if (!empty($errors)) {
            return ResponseHelper::validationError('خطأ في البيانات المدخلة', $errors);
        }

        try {
            $result = $this->authService->verifyRecoveryOtp($email, $otp);
            return ResponseHelper::success('تم التحقق بنجاح', $result);
        } catch (ValidationException $e) {
            return ResponseHelper::validationError($e->getMessage());
        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage(), 400);
        }
    }

    public function loginWithOtp(Request $request): array
    {
        $phoneNumber = $request->input('phone_number');
        $otp = $request->input('otp');

        $errors = [];
        if (empty($phoneNumber)) {
            $errors['phone_number'][] = 'رقم الهاتف مطلوب';
        }
        if (empty($otp)) {
            $errors['otp'][] = 'رمز التحقق مطلوب';
        }

        if (!empty($errors)) {
            return ResponseHelper::validationError('خطأ في البيانات المدخلة', $errors);
        }

        try {
            $result = $this->authService->loginWithOtp(
                $phoneNumber,
                $otp,
                $request->getClientIp(),
                $request->getUserAgent(),
                $request->input('device_type', 'web')
            );

            return ResponseHelper::success('تم تسجيل الدخول بنجاح', $result);
        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage(), 401);
        }
    }

    public function resetPasswordWithOtp(Request $request): array
    {
        $email = $request->input('email');
        $otp = $request->input('otp');
        $newPassword = $request->input('new_password');
        $confirmPassword = $request->input('confirm_password');

        $errors = [];
        if (empty($email)) {
            $errors['email'][] = 'البريد الإلكتروني مطلوب';
        }
        if (empty($otp)) {
            $errors['otp'][] = 'رمز التحقق مطلوب';
        }
        if (empty($newPassword)) {
            $errors['new_password'][] = 'كلمة المرور الجديدة مطلوبة';
        } elseif (strlen($newPassword) < 6) {
            $errors['new_password'][] = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
        }
        if ($newPassword !== $confirmPassword) {
            $errors['confirm_password'][] = 'كلمة المرور غير متطابقة';
        }

        if (!empty($errors)) {
            return ResponseHelper::validationError('خطأ في البيانات المدخلة', $errors);
        }

        try {
            $this->authService->resetPasswordWithOtp($email, $otp, $newPassword);
            return ResponseHelper::success('تم إعادة تعيين كلمة المرور بنجاح');
        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage(), 400);
        }
    }

    public function logoutAllDevices(Request $request): array
    {
        $userId = (int)($request->user['id'] ?? 0);
        $currentSessionId = (int)($request->user['session_id'] ?? 0);

        if ($userId <= 0) {
            return ResponseHelper::error('غير مصرح', 401);
        }

        try {
            $db = Database::getInstance()->getConnection();

            $stmt = $db->prepare("
                SELECT COUNT(*) as count
                FROM sessions
                WHERE user_id = :user_id
                    AND id != :current_session_id
                    AND is_revoked = 0
            ");
            $stmt->execute([
                'user_id' => $userId,
                'current_session_id' => $currentSessionId
            ]);
            $revokedCount = (int) $stmt->fetch()['count'];

            $stmt = $db->prepare("
                UPDATE sessions
                SET is_revoked = 1, revoked_at = NOW()
                WHERE user_id = :user_id
                    AND id != :current_session_id
                    AND is_revoked = 0
            ");
            $stmt->execute([
                'user_id' => $userId,
                'current_session_id' => $currentSessionId
            ]);

            return ResponseHelper::success('تم تسجيل الخروج من جميع الأجهزة بنجاح', [
                'revoked_sessions_count' => $revokedCount
            ]);

        } catch (\Exception $e) {
            if (($_ENV['APP_DEBUG'] ?? 'false') === 'true') {
                error_log("Logout All Devices Error: " . $e->getMessage());
            }
            return ResponseHelper::error('حدث خطأ في تسجيل الخروج', 500);
        }
    }

    public function getPermissions(Request $request): array
    {
        try {
            $userId = (int)($request->user['id'] ?? 0);
            if ($userId <= 0) {
                return ResponseHelper::error('غير مصرح', 401);
            }

            $profile = $this->authService->getProfile($userId);
            return ResponseHelper::success('تم جلب الصلاحيات بنجاح', $profile['permissions'] ?? []);
        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage(), 401);
        }
    }
}
