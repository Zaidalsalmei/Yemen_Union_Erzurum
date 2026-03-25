<?php
declare(strict_types=1);

namespace App\Services\Auth;

use App\Repositories\UserRepository;
use App\Exceptions\AuthenticationException;
use App\Exceptions\ValidationException;

class AuthService
{
    private UserRepository $userRepository;
    private JwtService $jwtService;

    public function __construct()
    {
        $this->userRepository = new UserRepository();
        $this->jwtService = new JwtService();
    }

    public function login(string $phoneNumber, string $password, string $ip, string $userAgent, string $deviceType = 'web'): array
    {
        $user = $this->userRepository->findByPhone($phoneNumber);

        if (!$user) {
            throw new AuthenticationException('رقم الهاتف أو كلمة المرور غير صحيحة');
        }

        if ($user['status'] === 'pending') {
            throw new AuthenticationException('الحساب قيد الانتظار للموافقة');
        }

        if ($user['status'] === 'banned') {
            throw new AuthenticationException('تم حظر هذا الحساب');
        }

        if ($user['status'] === 'suspended') {
            throw new AuthenticationException('الحساب معلق مؤقتاً');
        }

        if (empty($user['password']) || !password_verify($password, $user['password'])) {
            throw new AuthenticationException('رقم الهاتف أو كلمة المرور غير صحيحة');
        }

        $rolesAndPermissions = $this->userRepository->getUserRolesAndPermissions((int)$user['id']);

        $expiresAtTimestamp = $this->jwtService->getRefreshExpiryTimestamp();
        $expiresAt = date('Y-m-d H:i:s', $expiresAtTimestamp);

        $sessionId = $this->userRepository->createSession([
            'user_id' => (int)$user['id'],
            'ip_address' => $ip,
            'user_agent' => $userAgent,
            'device_type' => $deviceType,
            'expires_at' => $expiresAt
        ]);

        $accessToken = $this->jwtService->generateAccessToken((int)$user['id'], $user['full_name'] ?? '', $sessionId);
        $refreshToken = $this->jwtService->generateRefreshToken((int)$user['id'], $sessionId);

        $this->userRepository->updateLastLogin((int)$user['id']);

        return [
            'user' => [
                'id' => (int)$user['id'],
                'full_name' => $user['full_name'],
                'phone_number' => $user['phone_number'],
                'email' => $user['email'],
                'status' => $user['status'],
                'roles' => $rolesAndPermissions['roles'],
                'permissions' => array_column($rolesAndPermissions['permissions'], 'name')
            ],
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'token_type' => 'Bearer',
            'expires_at' => date('Y-m-d\TH:i:sP', $this->jwtService->getExpiryTimestamp())
        ];
    }

    public function refreshToken(string $refreshToken): array
    {
        try {
            $payload = $this->jwtService->verifyRefreshToken($refreshToken);
        } catch (\Exception $e) {
            throw new AuthenticationException('رمز التحديث غير صالح أو منتهي الصلاحية');
        }

        $userId = (int)$payload['sub'];
        $sessionId = (int)$payload['session_id'];

        $session = $this->userRepository->findSession($sessionId);
        if (!$session || !empty($session['is_revoked'])) {
            throw new AuthenticationException('الجلسة منتهية أو ملغاة');
        }

        $user = $this->userRepository->findById($userId);
        if (!$user || $user['status'] !== 'active') {
            throw new AuthenticationException('المستخدم غير موجود أو غير نشط');
        }

        $rolesAndPermissions = $this->userRepository->getUserRolesAndPermissions($userId);

        $newAccessToken = $this->jwtService->generateAccessToken($userId, $user['full_name'] ?? '', $sessionId);
        $newRefreshToken = $this->jwtService->generateRefreshToken($userId, $sessionId);

        return [
            'user' => [
                'id' => (int)$user['id'],
                'full_name' => $user['full_name'],
                'phone_number' => $user['phone_number'],
                'email' => $user['email'],
                'status' => $user['status'],
                'roles' => $rolesAndPermissions['roles'],
                'permissions' => array_column($rolesAndPermissions['permissions'], 'name')
            ],
            'access_token' => $newAccessToken,
            'refresh_token' => $newRefreshToken,
            'token_type' => 'Bearer',
            'expires_at' => date('Y-m-d\TH:i:sP', $this->jwtService->getExpiryTimestamp())
        ];
    }

    public function logout(int $sessionId): void
    {
        $this->userRepository->revokeSession($sessionId);
    }

    public function getProfile(int $userId): array
    {
        $user = $this->userRepository->findById($userId);

        if (!$user) {
            throw new AuthenticationException('المستخدم غير موجود');
        }

        $rolesAndPermissions = $this->userRepository->getUserRolesAndPermissions($userId);

        return [
            'id' => (int)$user['id'],
            'full_name' => $user['full_name'],
            'phone_number' => $user['phone_number'],
            'email' => $user['email'],
            'date_of_birth' => $user['date_of_birth'] ?? null,
            'gender' => $user['gender'] ?? null,
            'nationality' => $user['nationality'] ?? null,
            'university' => $user['university'] ?? null,
            'faculty' => $user['faculty'] ?? null,
            'study_level' => $user['study_level'] ?? null,
            'city' => $user['city'] ?? null,
            'status' => $user['status'],
            'membership_expiry_date' => $user['membership_expiry_date'] ?? null,
            'profile_photo' => $user['profile_photo'] ?? null,
            'roles' => $rolesAndPermissions['roles'],
            'permissions' => array_column($rolesAndPermissions['permissions'], 'name')
        ];
    }

    public function changePassword(int $userId, string $currentPassword, string $newPassword): void
    {
        $user = $this->userRepository->findById($userId);

        if (!$user) {
            throw new AuthenticationException('المستخدم غير موجود');
        }

        if (empty($user['password']) || !password_verify($currentPassword, $user['password'])) {
            throw new ValidationException('كلمة المرور الحالية غير صحيحة');
        }

        if (strlen($newPassword) < 8) {
            throw new ValidationException('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل');
        }

        $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
        if (method_exists($this->userRepository, 'updatePassword')) {
            $this->userRepository->updatePassword($userId, $hashedPassword);
        } else {
            throw new \Exception("لا توجد دالة updatePassword في UserRepository");
        }

        $this->userRepository->revokeAllSessions($userId);
    }

    public function register(array $data): void
    {
        $phoneNumber = $data['phone_number'];
        $adminOtp = $data['admin_otp'] ?? '';

        if (empty($adminOtp)) {
            throw new ValidationException('كود التحقق مطلوب للتسجيل');
        }

        // 1. Determine role based on code prefix
        $roleName = 'member';
        if (strpos($adminOtp, 'AD-') === 0) {
            $roleName = 'president';
        } elseif (strpos($adminOtp, 'MB-') === 0) {
            $roleName = 'member';
        } else {
            throw new ValidationException('تنسيق كود التحقق غير صحيح');
        }

        // 2. Check if user already exists
        $existingUser = $this->userRepository->findByPhone($phoneNumber);
        if ($existingUser) {
            throw new ValidationException('رقم الهاتف مسجل مسبقاً');
        }

        // 3. Verify Code with AdminOtpService
        if (class_exists(\App\Services\AdminOtpService::class)) {
            $adminOtpService = new \App\Services\AdminOtpService();
            $verificationRecord = $adminOtpService->verifyAdminOtp($phoneNumber, $adminOtp);
            if (!$verificationRecord) {
                throw new ValidationException('كود التحقق غير صحيح أو منتهي الصلاحية');
            }
        } else {
            throw new \Exception("AdminOtpService غير موجود في النظام");
        }

        // 4. Hash password and set initial status
        $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
        $data['status'] = 'active';
        $data['phone_verified_at'] = date('Y-m-d H:i:s');

        // 5. Create the user
        if (method_exists($this->userRepository, 'create')) {
            $userId = $this->userRepository->create($data);

            // 6. Assign appropriate role determined by code
            if (method_exists($this->userRepository, 'getRoleByName')) {
                $role = $this->userRepository->getRoleByName($roleName);
                if ($role) {
                    $this->userRepository->assignRole((int)$userId, (int)$role['id'], null);
                }
            }
        } else {
            throw new \Exception("لا توجد دالة create في UserRepository");
        }
    }

    public function requestAdminOtp(string $fullName, string $phoneNumber): array
    {
        if (class_exists(\App\Services\AdminOtpService::class)) {
            $adminOtpService = new \App\Services\AdminOtpService();
            return $adminOtpService->sendAdminOtp($fullName, $phoneNumber);
        }
        throw new \Exception("AdminOtpService غير موجود");
    }

    public function sendOtp(string $phoneNumber): array
    {
        if (class_exists(\App\Services\OtpService::class)) {
            $otpService = new \App\Services\OtpService();
            return $otpService->sendOtp($phoneNumber);
        }
        throw new \Exception("OtpService غير موجود");
    }

    public function verifyOtp(string $phoneNumber, string $otp): bool
    {
        if (class_exists(\App\Services\OtpService::class)) {
            $otpService = new \App\Services\OtpService();
            return $otpService->verifyOtp($phoneNumber, $otp);
        }
        throw new \Exception("OtpService غير موجود");
    }

    public function sendRecoveryOtp(string $email): array
    {
        $user = $this->userRepository->findByEmail($email);
        if (!$user) {
            throw new AuthenticationException('البريد الإلكتروني غير مسجل في النظام');
        }

        if ($user['status'] === 'banned') {
            throw new AuthenticationException('تم حظر هذا الحساب');
        }

        // 1. Generate OTP using existing table structure
        $otp = (string) random_int(100000, 999999);
        $expiresAt = date('Y-m-d H:i:s', strtotime('+15 minutes'));
        
        $db = \App\Core\Database::getInstance()->getConnection();
        $stmt = $db->prepare("INSERT INTO verification_codes (phone_number, otp, expires_at, created_at) VALUES (?, ?, ?, NOW())");
        $stmt->execute([$email, $otp, $expiresAt]);

        // 2. Prepare Email
        $subject = "رمز استرداد كلمة المرور - اتحاد الطلبة اليمنيين";
        $body = "
            <div dir='rtl' style='font-family: sans-serif; text-align: center; border: 1px solid #ddd; padding: 20px; border-radius: 10px;'>
                <h2 style='color: #DC2626;'>رمز التحقق الخاص بك</h2>
                <p>مرحباً <b>" . htmlspecialchars($user['full_name']) . "</b>،</p>
                <p>لقد طلبت استرداد كلمة المرور الخاصة بك في نظام اتحاد الطلبة اليمنيين - أرضروم.</p>
                <div style='background: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; border-radius: 5px; margin: 20px 0;'>
                    {$otp}
                </div>
                <p style='color: #666;'>هذا الرمز صالح لمدة 15 دقيقة فقط.</p>
                <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>
                <p style='font-size: 12px; color: #aaa;'>إذا لم تطلب هذا الرمز، فيرجى تجاهل هذه الرسالة.</p>
            </div>
        ";

        // 3. Send Email using MailerService
        if (class_exists(\App\Services\MailerService::class)) {
            $mailer = new \App\Services\MailerService();
            $success = $mailer->sendEmail($email, $subject, $body, true);
            if (!$success) {
                throw new \Exception('فشل إرسال كود التحقق إلى بريدك الإلكتروني. يرجى المحاولة لاحقاً');
            }
        } else {
            throw new \Exception('MailerService غير موجود');
        }

        return [
            'success' => true,
            'message' => 'تم إرسال رمز التحقق إلى بريدك الإلكتروني بنجاح',
            'email' => $email
        ];
    }

    public function verifyRecoveryOtp(string $email, string $otp): array
    {
        $user = $this->userRepository->findByEmail($email);
        if (!$user) {
            throw new AuthenticationException('البريد الإلكتروني غير مسجل في النظام');
        }

        if (class_exists(\App\Services\OtpService::class)) {
            $otpService = new \App\Services\OtpService();
            if (method_exists($otpService, 'verifyOtp')) {
                $verified = $otpService->verifyOtp($email, $otp);
                if (!$verified) {
                    throw new ValidationException('رمز التحقق غير صحيح أو منتهي الصلاحية');
                }
            } else {
                throw new \Exception("لا يمكن التحقق من OTP");
            }
        }

        return [
            'verified' => true,
            'message' => 'تم التحقق بنجاح',
            'user' => [
                'id' => (int)$user['id'],
                'full_name' => $user['full_name'],
                'email' => $user['email']
            ]
        ];
    }

    public function loginWithOtp(string $phoneNumber, string $otp, string $ip, string $userAgent, string $deviceType = 'web'): array
    {
        $this->verifyRecoveryOtp($phoneNumber, $otp);

        $user = $this->userRepository->findByPhone($phoneNumber);
        if (!$user) {
            throw new AuthenticationException('المستخدم غير موجود');
        }

        if ($user['status'] === 'pending') {
            throw new AuthenticationException('الحساب قيد الانتظار للموافقة');
        }

        if ($user['status'] === 'banned') {
            throw new AuthenticationException('تم حظر هذا الحساب');
        }

        if ($user['status'] === 'suspended') {
            throw new AuthenticationException('الحساب معلق مؤقتاً');
        }

        $rolesAndPermissions = $this->userRepository->getUserRolesAndPermissions((int)$user['id']);

        $expiresAtTimestamp = $this->jwtService->getRefreshExpiryTimestamp();
        $expiresAt = date('Y-m-d H:i:s', $expiresAtTimestamp);

        $sessionId = $this->userRepository->createSession([
            'user_id' => (int)$user['id'],
            'ip_address' => $ip,
            'user_agent' => $userAgent,
            'device_type' => $deviceType,
            'expires_at' => $expiresAt
        ]);

        $accessToken = $this->jwtService->generateAccessToken((int)$user['id'], $user['full_name'] ?? '', $sessionId);
        $refreshToken = $this->jwtService->generateRefreshToken((int)$user['id'], $sessionId);

        $this->userRepository->updateLastLogin((int)$user['id']);

        if (empty($user['phone_verified_at']) && method_exists($this->userRepository, 'markPhoneAsVerified')) {
            $this->userRepository->markPhoneAsVerified((int)$user['id']);
        }

        return [
            'user' => [
                'id' => (int)$user['id'],
                'full_name' => $user['full_name'],
                'phone_number' => $user['phone_number'],
                'email' => $user['email'],
                'status' => $user['status'],
                'roles' => $rolesAndPermissions['roles'],
                'permissions' => array_column($rolesAndPermissions['permissions'], 'name')
            ],
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'token_type' => 'Bearer',
            'expires_at' => date('Y-m-d\TH:i:sP', $this->jwtService->getExpiryTimestamp())
        ];
    }

    public function resetPasswordWithOtp(string $email, string $otp, string $newPassword): void
    {
        $this->verifyRecoveryOtp($email, $otp);

        $user = $this->userRepository->findByEmail($email);
        if (!$user) {
            throw new AuthenticationException('المستخدم غير موجود');
        }

        if (strlen($newPassword) < 6) {
            throw new ValidationException('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        }

        $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
        if (method_exists($this->userRepository, 'updatePassword')) {
            $this->userRepository->updatePassword((int)$user['id'], $hashedPassword);
        } else {
            throw new \Exception("لا توجد دالة updatePassword في UserRepository");
        }

        $this->userRepository->revokeAllSessions((int)$user['id']);

        if (empty($user['phone_verified_at']) && method_exists($this->userRepository, 'markPhoneAsVerified')) {
            $this->userRepository->markPhoneAsVerified((int)$user['id']);
        }
    }
}
