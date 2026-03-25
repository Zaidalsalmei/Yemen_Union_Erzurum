<?php
/**
 * Authentication Middleware - Verifies JWT tokens
 * SECURED: No sensitive data logging
 */
declare(strict_types=1);

namespace App\Middleware;

use App\Core\Request;
use App\Services\Auth\JwtService;
use App\Repositories\UserRepository;
use App\Helpers\ResponseHelper;

class AuthMiddleware
{
    private JwtService $jwtService;
    private UserRepository $userRepository;
    private bool $isDebug;

    public function __construct()
    {
        $this->jwtService = new JwtService();
        $this->userRepository = new UserRepository();
        $this->isDebug = ($_ENV['APP_DEBUG'] ?? 'false') === 'true'
                      && ($_ENV['APP_ENV'] ?? 'production') !== 'production';
    }

    public function handle(Request $request): ?array
    {
        // Get token from header
        $token = $request->getBearerToken();

        if (!$token) {
            $this->debugLog("Auth failed: No bearer token");
            return ResponseHelper::error('رمز المصادقة مفقود', 401);
        }

        try {
            // Verify JWT token
            $payload = $this->jwtService->verify($token);

            // Check if session is revoked
            if (isset($payload['session_id'])) {
                if ($this->isSessionRevoked($payload['session_id'])) {
                    $this->debugLog("Auth failed: Session revoked for user " . ($payload['sub'] ?? 'unknown'));
                    return ResponseHelper::error('انتهت صلاحية الجلسة', 401);
                }
            }

            // Get fresh user data from DB (don't trust JWT roles/permissions)
            $user = $this->userRepository->findById($payload['sub']);

            if (!$user) {
                $this->debugLog("Auth failed: User not found");
                return ResponseHelper::error('المستخدم غير موجود', 401);
            }

            if ($user['status'] !== 'active') {
                $this->debugLog("Auth failed: User inactive");
                return ResponseHelper::error('المستخدم غير نشط أو غير موجود', 401);
            }

            // Fetch fresh roles and permissions from database
            $rolesAndPermissions = $this->userRepository->getUserRolesAndPermissions($user['id']);

            // Attach user to request with FRESH data from DB
            $request->user = [
                'id' => (int) $user['id'],
                'name' => $user['full_name'],
                'roles' => $rolesAndPermissions['roles'] ?? [],
                'permissions' => $rolesAndPermissions['permissions'] ?? [],
                'session_id' => $payload['session_id'] ?? null
            ];

            return null; // Success - continue to controller

        } catch (\Exception $e) {
            $this->debugLog("Auth failed: Token verification error");
            return ResponseHelper::error('رمز المصادقة غير صالح', 401);
        }
    }

    /**
     * Check if session is revoked
     */
    private function isSessionRevoked(int $sessionId): bool
    {
        $session = $this->userRepository->findSession($sessionId);
        return !$session || ($session['is_revoked'] ?? false);
    }

    /**
     * Log only in development mode - NEVER log sensitive data
     */
    private function debugLog(string $message): void
    {
        if ($this->isDebug) {
            error_log("[AuthMiddleware] " . $message);
        }
    }
}
