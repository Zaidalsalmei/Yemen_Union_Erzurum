<?php
/**
 * User Repository - Data access layer for users
 * FIXED: Compatible with actual database schema
 */

declare(strict_types=1);

namespace App\Repositories;

use PDO;

class UserRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = \App\Core\Database::getInstance()->getConnection();
    }

    // ============================================
    // 🔍 FIND METHODS
    // ============================================

    /**
     * Find user by ID
     */
    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("
            SELECT * FROM users
            WHERE id = :id AND deleted_at IS NULL
        ");
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch();

        return $result ?: null;
    }

    /**
     * Find user by phone number
     */
    public function findByPhone(string $phoneNumber): ?array
    {
        $stmt = $this->db->prepare("
            SELECT * FROM users
            WHERE phone_number = :phone AND deleted_at IS NULL
        ");
        $stmt->execute(['phone' => $phoneNumber]);
        $result = $stmt->fetch();

        return $result ?: null;
    }

    /**
     * Find user by email
     */
    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare("
            SELECT * FROM users
            WHERE email = :email AND deleted_at IS NULL
        ");
        $stmt->execute(['email' => $email]);
        $result = $stmt->fetch();

        return $result ?: null;
    }

    // ============================================
    // 📋 LIST METHODS
    // ============================================

    /**
     * Get all users with pagination
     */
    public function getAll(array $filters = [], int $page = 1, int $perPage = 20): array
    {
        $offset = ($page - 1) * $perPage;
        $where = ['u.deleted_at IS NULL'];
        $params = [];

        // Apply filters
        if (!empty($filters['status'])) {
            $where[] = 'u.status = :status';
            $params['status'] = $filters['status'];
        }

        if (!empty($filters['search'])) {
            $where[] = '(u.full_name LIKE :search_name OR u.phone_number LIKE :search_phone OR u.email LIKE :search_email)';
            $searchTerm = '%' . $filters['search'] . '%';
            $params['search_name'] = $searchTerm;
            $params['search_phone'] = $searchTerm;
            $params['search_email'] = $searchTerm;
        }

        if (!empty($filters['city'])) {
            $where[] = 'u.city = :city';
            $params['city'] = $filters['city'];
        }

        if (!empty($filters['university'])) {
            $where[] = 'u.university = :university';
            $params['university'] = $filters['university'];
        }

        $whereClause = implode(' AND ', $where);

        // Get total count
        $countStmt = $this->db->prepare("SELECT COUNT(*) as total FROM users u WHERE {$whereClause}");
        foreach ($params as $key => $value) {
            $countStmt->bindValue(":{$key}", $value);
        }
        $countStmt->execute();
        $total = (int) $countStmt->fetch()['total'];

        // Get paginated results
        $stmt = $this->db->prepare("
            SELECT u.id, u.full_name, u.phone_number, u.email, u.status,
                   u.membership_expiry_date, u.profile_photo, u.university,
                   u.faculty, u.city, u.created_at, u.last_login_at
            FROM users u
            WHERE {$whereClause}
            ORDER BY u.created_at DESC
            LIMIT :limit OFFSET :offset
        ");

        $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

        foreach ($params as $key => $value) {
            $stmt->bindValue(":{$key}", $value);
        }

        $stmt->execute();
        $data = $stmt->fetchAll();

        return [
            'data' => $data,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => (int) ceil($total / $perPage)
        ];
    }

    // ============================================
    // ✏️ CRUD METHODS
    // ============================================

    /**
     * Create a new user
     */
    public function create(array $data): int
    {
        $stmt = $this->db->prepare("
            INSERT INTO users (full_name, phone_number, email, password, date_of_birth,
                gender, nationality, university, faculty, study_level, city, status, phone_verified_at, created_at)
            VALUES (:full_name, :phone_number, :email, :password, :date_of_birth,
                :gender, :nationality, :university, :faculty, :study_level, :city, :status, :phone_verified_at, NOW())
        ");

        $stmt->execute([
            'full_name' => $data['full_name'],
            'phone_number' => $data['phone_number'],
            'email' => $data['email'] ?? null,
            'password' => $data['password'] ?? null,
            'date_of_birth' => $data['date_of_birth'] ?? null,
            'gender' => $data['gender'] ?? null,
            'nationality' => $data['nationality'] ?? 'يمني',
            'university' => $data['university'] ?? null,
            'faculty' => $data['faculty'] ?? null,
            'study_level' => $data['study_level'] ?? null,
            'city' => $data['city'] ?? 'أرضروم',
            'status' => $data['status'] ?? 'pending',
            'phone_verified_at' => $data['phone_verified_at'] ?? null
        ]);

        return (int) $this->db->lastInsertId();
    }

    /**
     * Update user
     */
    public function update(int $id, array $data): void
    {
        $sets = [];
        $params = ['id' => $id];

        // Only allow safe columns to be updated
        $allowedColumns = [
            'full_name', 'phone_number', 'email', 'date_of_birth',
            'gender', 'nationality', 'university', 'faculty',
            'study_level', 'city', 'profile_photo', 'status',
            'membership_expiry_date'
        ];

        foreach ($data as $key => $value) {
            if (in_array($key, $allowedColumns)) {
                $sets[] = "`{$key}` = :{$key}";
                $params[$key] = $value;
            }
        }

        if (empty($sets)) {
            return;
        }

        $setClause = implode(', ', $sets);

        $stmt = $this->db->prepare("UPDATE users SET {$setClause}, updated_at = NOW() WHERE id = :id");
        $stmt->execute($params);
    }

    /**
     * Soft delete user
     */
    public function delete(int $id): void
    {
        $stmt = $this->db->prepare("UPDATE users SET deleted_at = NOW(), updated_at = NOW() WHERE id = :id");
        $stmt->execute(['id' => $id]);

        // Revoke all sessions
        $this->revokeAllSessions($id);
    }

    // ============================================
    // 🎭 ROLES & PERMISSIONS
    // ============================================

    /**
     * Get user roles
     * ✅ FIXED: Compatible with actual roles table structure
     */
    public function getUserRoles(int $userId): array
    {
        $stmt = $this->db->prepare("
            SELECT r.id, r.name, r.display_name, r.description
            FROM roles r
            INNER JOIN user_roles ur ON r.id = ur.role_id
            WHERE ur.user_id = :user_id AND ur.is_active = 1
        ");
        $stmt->execute(['user_id' => $userId]);

        return $stmt->fetchAll();
    }

    /**
     * Get user permissions through roles
     * ✅ FIXED: Compatible with actual permissions table structure
     */
    public function getUserPermissions(int $userId): array
    {
        $stmt = $this->db->prepare("
            SELECT DISTINCT p.id, p.name, p.display_name, p.description, p.category
            FROM permissions p
            INNER JOIN role_permissions rp ON p.id = rp.permission_id
            INNER JOIN user_roles ur ON rp.role_id = ur.role_id
            WHERE ur.user_id = :user_id AND ur.is_active = 1
        ");
        $stmt->execute(['user_id' => $userId]);

        return $stmt->fetchAll();
    }

    /**
     * Get user roles AND permissions in one call
     * Used by AuthMiddleware for fresh data on each request
     */
    public function getUserRolesAndPermissions(int $userId): array
    {
        return [
            'roles' => array_column($this->getUserRoles($userId), 'name'),
            'permissions' => array_column($this->getUserPermissions($userId), 'name')
        ];
    }

    /**
     * Assign role to user
     * ✅ FIXED: Uses correct column name "assigned_by" instead of "granted_by"
     */
    public function assignRole(int $userId, int $roleId, ?int $assignedBy = null): void
    {
        // Check if role assignment already exists
        $checkStmt = $this->db->prepare("
            SELECT COUNT(*) as cnt FROM user_roles
            WHERE user_id = :user_id AND role_id = :role_id
        ");
        $checkStmt->execute(['user_id' => $userId, 'role_id' => $roleId]);

        if ((int)$checkStmt->fetch()['cnt'] > 0) {
            // Update existing
            $stmt = $this->db->prepare("
                UPDATE user_roles
                SET assigned_by = :assigned_by, granted_at = NOW(), is_active = 1
                WHERE user_id = :user_id AND role_id = :role_id
            ");
        } else {
            // Insert new
            $stmt = $this->db->prepare("
                INSERT INTO user_roles (user_id, role_id, assigned_by, granted_at, is_active)
                VALUES (:user_id, :role_id, :assigned_by, NOW(), 1)
            ");
        }

        $stmt->execute([
            'user_id' => $userId,
            'role_id' => $roleId,
            'assigned_by' => $assignedBy
        ]);
    }

    /**
     * Remove role from user (deactivate, don't delete)
     */
    public function removeRole(int $userId, int $roleId): void
    {
        $stmt = $this->db->prepare("
            DELETE FROM user_roles
            WHERE user_id = :user_id AND role_id = :role_id
        ");
        $stmt->execute([
            'user_id' => $userId,
            'role_id' => $roleId
        ]);
    }

    /**
     * Check if user has a specific role
     */
    public function hasRole(int $userId, string $roleName): bool
    {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as cnt
            FROM user_roles ur
            INNER JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = :user_id AND r.name = :role_name
        ");
        $stmt->execute([
            'user_id' => $userId,
            'role_name' => $roleName
        ]);

        return (int)$stmt->fetch()['cnt'] > 0;
    }

    /**
     * Check if user has a specific permission
     */
    public function hasPermission(int $userId, string $permissionName): bool
    {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as cnt
            FROM permissions p
            INNER JOIN role_permissions rp ON p.id = rp.permission_id
            INNER JOIN user_roles ur ON rp.role_id = ur.role_id
            WHERE ur.user_id = :user_id AND p.name = :perm_name
        ");
        $stmt->execute([
            'user_id' => $userId,
            'perm_name' => $permissionName
        ]);

        return (int)$stmt->fetch()['cnt'] > 0;
    }

    // ============================================
    // 🔐 SESSION MANAGEMENT
    // ✅ FIXED: Uses "sessions" table (not "user_sessions")
    // ============================================

    /**
     * Create user session
     * ✅ FIXED: Uses correct table name "sessions"
     */
    public function createSession(array $data): int
    {
        $tokenHash = hash('sha256', uniqid((string)$data['user_id'], true));

        $stmt = $this->db->prepare("
            INSERT INTO sessions (user_id, token_hash, ip_address, user_agent, device_type, expires_at, created_at)
            VALUES (:user_id, :token_hash, :ip_address, :user_agent, :device_type, :expires_at, NOW())
        ");

        $stmt->execute([
            'user_id' => $data['user_id'],
            'token_hash' => $tokenHash,
            'ip_address' => $data['ip_address'] ?? null,
            'user_agent' => $data['user_agent'] ?? null,
            'device_type' => $data['device_type'] ?? $this->detectDeviceType($data['user_agent'] ?? ''),
            'expires_at' => $data['expires_at']
        ]);

        return (int) $this->db->lastInsertId();
    }

    /**
     * Find session by ID
     * ✅ FIXED: Uses correct table name "sessions"
     */
    public function findSession(int $sessionId): ?array
    {
        $stmt = $this->db->prepare("
            SELECT *,
                CASE
                    WHEN revoked_at IS NOT NULL THEN 1
                    WHEN is_revoked = 1 THEN 1
                    ELSE 0
                END as is_revoked
            FROM sessions
            WHERE id = :id
        ");
        $stmt->execute(['id' => $sessionId]);
        $result = $stmt->fetch();

        return $result ?: null;
    }

    /**
     * Revoke session
     * ✅ FIXED: Uses correct table name "sessions"
     */
    public function revokeSession(int $sessionId): void
    {
        $stmt = $this->db->prepare("
            UPDATE sessions
            SET is_revoked = 1, revoked_at = NOW()
            WHERE id = :id
        ");
        $stmt->execute(['id' => $sessionId]);
    }

    /**
     * Revoke all user sessions
     * ✅ FIXED: Uses correct table name "sessions"
     */
    public function revokeAllSessions(int $userId): void
    {
        $stmt = $this->db->prepare("
            UPDATE sessions
            SET is_revoked = 1, revoked_at = NOW()
            WHERE user_id = :user_id AND is_revoked = 0
        ");
        $stmt->execute(['user_id' => $userId]);
    }

    /**
     * Update session last activity
     */
    public function updateSessionActivity(int $sessionId): void
    {
        $stmt = $this->db->prepare("
            UPDATE sessions
            SET last_activity_at = NOW()
            WHERE id = :id
        ");
        $stmt->execute(['id' => $sessionId]);
    }

    /**
     * Get active sessions for a user
     */
    public function getActiveSessions(int $userId): array
    {
        $stmt = $this->db->prepare("
            SELECT id, ip_address, user_agent, device_type,
                   created_at, expires_at, last_activity_at
            FROM sessions
            WHERE user_id = :user_id
                AND is_revoked = 0
                AND revoked_at IS NULL
                AND expires_at > NOW()
            ORDER BY created_at DESC
        ");
        $stmt->execute(['user_id' => $userId]);

        return $stmt->fetchAll();
    }

    // ============================================
    // 👤 USER STATUS METHODS
    // ============================================

    /**
     * Update last login timestamp
     */
    public function updateLastLogin(int $userId): void
    {
        $stmt = $this->db->prepare("UPDATE users SET last_login_at = NOW() WHERE id = :id");
        $stmt->execute(['id' => $userId]);
    }

    /**
     * Update password
     */
    public function updatePassword(int $userId, string $hashedPassword): void
    {
        $stmt = $this->db->prepare("UPDATE users SET password = :password, updated_at = NOW() WHERE id = :id");
        $stmt->execute(['id' => $userId, 'password' => $hashedPassword]);
    }

    /**
     * Verify a pending user
     */
    public function verify(int $userId): void
    {
        $stmt = $this->db->prepare("UPDATE users SET status = 'active', updated_at = NOW() WHERE id = :id");
        $stmt->execute(['id' => $userId]);
    }

    /**
     * Mark phone as verified
     */
    public function markPhoneAsVerified(int $userId): void
    {
        $stmt = $this->db->prepare("UPDATE users SET phone_verified_at = NOW(), updated_at = NOW() WHERE id = :id");
        $stmt->execute(['id' => $userId]);
    }

    /**
     * Ban a user
     */
    public function ban(int $userId): void
    {
        $stmt = $this->db->prepare("UPDATE users SET status = 'banned', updated_at = NOW() WHERE id = :id");
        $stmt->execute(['id' => $userId]);

        // Revoke all sessions
        $this->revokeAllSessions($userId);
    }

    /**
     * Suspend a user
     */
    public function suspend(int $userId): void
    {
        $stmt = $this->db->prepare("UPDATE users SET status = 'suspended', updated_at = NOW() WHERE id = :id");
        $stmt->execute(['id' => $userId]);

        // Revoke all sessions
        $this->revokeAllSessions($userId);
    }

    /**
     * Activate a user
     */
    public function activate(int $userId): void
    {
        $stmt = $this->db->prepare("UPDATE users SET status = 'active', updated_at = NOW() WHERE id = :id");
        $stmt->execute(['id' => $userId]);
    }

    // ============================================
    // 🔧 ROLE LOOKUP HELPERS
    // ============================================

    /**
     * Get role by name
     */
    public function getRoleByName(string $name): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM roles WHERE name = :name");
        $stmt->execute(['name' => $name]);
        $result = $stmt->fetch();

        return $result ?: null;
    }

    /**
     * Get all roles
     */
    public function getAllRoles(): array
    {
        $stmt = $this->db->query("SELECT * FROM roles ORDER BY id ASC");
        return $stmt->fetchAll();
    }

    // ============================================
    // 🛠️ HELPER METHODS
    // ============================================

    /**
     * Detect device type from user agent
     */
    private function detectDeviceType(string $userAgent): string
    {
        $userAgent = strtolower($userAgent);

        if (preg_match('/mobile|android|iphone|ipod|blackberry|windows phone/i', $userAgent)) {
            return 'mobile';
        }

        if (preg_match('/tablet|ipad|kindle|silk/i', $userAgent)) {
            return 'tablet';
        }

        return 'desktop';
    }
}
