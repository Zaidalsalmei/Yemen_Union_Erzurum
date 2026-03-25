<?php
/**
 * Role and Permission Controller
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\ResponseHelper;
use App\Helpers\ResponseHelper as Helpers;

class RolePermissionController
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = \App\Core\Database::getInstance()->getConnection();
    }

    /**
     * Get all roles with their permissions count
     */
    public function getRoles(Request $request): array
    {
        try {
            $stmt = $this->db->query("
                SELECT 
                    r.*,
                    (SELECT COUNT(*) FROM role_permissions WHERE role_id = r.id) as permissions_count,
                    (SELECT COUNT(*) FROM user_roles WHERE role_id = r.id AND is_active = TRUE) as users_count
                FROM roles r
                WHERE r.is_active = TRUE
                ORDER BY r.level ASC
            ");
            $roles = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            return ResponseHelper::success('تم جلب الأدوار بنجاح', $roles);
        } catch (\Exception $e) {
            error_log("getRoles error: " . $e->getMessage());
            return ResponseHelper::error('فشل في جلب الأدوار: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get single role with full permissions
     */
    public function getRole(Request $request, array $params): array
    {
        $id = (int) $params['id'];
        
        try {
            $stmt = $this->db->prepare("
                SELECT * FROM roles WHERE id = ?
            ");
            $stmt->execute([$id]);
            $role = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$role) {
                return ResponseHelper::error('الدور غير موجود', 404);
            }

            // Get role permissions
            $stmt = $this->db->prepare("
                SELECT p.*
                FROM permissions p
                INNER JOIN role_permissions rp ON p.id = rp.permission_id
                WHERE rp.role_id = ?
                ORDER BY p.module, p.action
            ");
            $stmt->execute([$id]);
            $role['permissions'] = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            return ResponseHelper::success('تم جلب الدور بنجاح', $role);
        } catch (\Exception $e) {
            error_log("getRole error: " . $e->getMessage());
            return ResponseHelper::error('فشل في جلب الدور: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get all permissions grouped by module
     */
    public function getPermissions(Request $request): array
    {
        try {
            $stmt = $this->db->query("
                SELECT * FROM permissions ORDER BY module, action
            ");
            $permissions = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // Group by module
            $grouped = [];
            foreach ($permissions as $permission) {
                $module = $permission['module'];
                if (!isset($grouped[$module])) {
                    $grouped[$module] = [];
                }
                $grouped[$module][] = $permission;
            }

            return ResponseHelper::success('تم جلب الصلاحيات بنجاح', $grouped);
        } catch (\Exception $e) {
            error_log("getPermissions error: " . $e->getMessage());
            return ResponseHelper::error('فشل في جلب الصلاحيات: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update role permissions
     */
    public function updateRolePermissions(Request $request, array $params): array
    {
        $roleId = (int) $params['id'];
        
        try {
            $data = $request->all();
            $permissionIds = $data['permissions'] ?? [];

            // Check if role is system role
            $stmt = $this->db->prepare("SELECT is_system_role FROM roles WHERE id = ?");
            $stmt->execute([$roleId]);
            $role = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$role) {
                return ResponseHelper::error('الدور غير موجود', 404);
            }

            $this->db->beginTransaction();

            // Delete existing permissions
            $stmt = $this->db->prepare("DELETE FROM role_permissions WHERE role_id = ?");
            $stmt->execute([$roleId]);

            // Insert new permissions
            if (!empty($permissionIds)) {
                $placeholders = implode(',', array_fill(0, count($permissionIds), '(?, ?)'));
                $values = [];
                foreach ($permissionIds as $permId) {
                    $values[] = $roleId;
                    $values[] = $permId;
                }
                $stmt = $this->db->prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES $placeholders");
                $stmt->execute($values);
            }

            $this->db->commit();

            return ResponseHelper::success('تم تحديث صلاحيات الدور بنجاح');
        } catch (\Exception $e) {
            $this->db->rollBack();
            error_log("updateRolePermissions error: " . $e->getMessage());
            return ResponseHelper::error('فشل في تحديث صلاحيات الدور: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get user's effective permissions (role + overrides)
     */
    public function getUserPermissions(Request $request, array $params): array
    {
        $userId = (int) $params['id'];
        
        try {
            // Get role permissions
            $stmt = $this->db->prepare("
                SELECT DISTINCT p.name
                FROM permissions p
                INNER JOIN role_permissions rp ON p.id = rp.permission_id
                INNER JOIN user_roles ur ON rp.role_id = ur.role_id
                WHERE ur.user_id = ? AND ur.is_active = TRUE
            ");
            $stmt->execute([$userId]);
            $rolePermissions = $stmt->fetchAll(\PDO::FETCH_COLUMN);

            // Get permission overrides
            $stmt = $this->db->prepare("
                SELECT p.name, upo.is_granted
                FROM user_permission_overrides upo
                INNER JOIN permissions p ON upo.permission_id = p.id
                WHERE upo.user_id = ?
            ");
            $stmt->execute([$userId]);
            $overrides = $stmt->fetchAll(\PDO::FETCH_KEY_PAIR);

            // Merge permissions
            $effectivePermissions = [];
            
            // Add role permissions (that aren't revoked)
            foreach ($rolePermissions as $perm) {
                if (!isset($overrides[$perm]) || $overrides[$perm] == true) {
                    $effectivePermissions[] = $perm;
                }
            }
            
            // Add granted overrides
            foreach ($overrides as $perm => $granted) {
                if ($granted && !in_array($perm, $effectivePermissions)) {
                    $effectivePermissions[] = $perm;
                }
            }

            return ResponseHelper::success('تم جلب صلاحيات المستخدم بنجاح', [
                'permissions' => $effectivePermissions,
                'role_permissions' => $rolePermissions,
                'overrides' => $overrides
            ]);
        } catch (\Exception $e) {
            error_log("getUserPermissions error: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return ResponseHelper::error('فشل في جلب صلاحيات المستخدم: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Set user permission override
     */
    public function setUserPermissionOverride(Request $request, array $params): array
    {
        $userId = (int) $params['id'];
        
        try {
            $data = $request->all();
            $permissionId = $data['permission_id'] ?? null;
            $isGranted = $data['is_granted'] ?? true;
            $reason = $data['reason'] ?? null;

            if (!$permissionId) {
                return ResponseHelper::error('معرف الصلاحية مطلوب', 400);
            }

            // Get current user ID from auth
            $grantedBy = $request->user['id'] ?? null;

            $stmt = $this->db->prepare("
                INSERT INTO user_permission_overrides (user_id, permission_id, is_granted, granted_by, reason)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE is_granted = VALUES(is_granted), granted_by = VALUES(granted_by), reason = VALUES(reason), updated_at = NOW()
            ");
            $stmt->execute([$userId, $permissionId, $isGranted, $grantedBy, $reason]);

            return ResponseHelper::success('تم تحديث صلاحية المستخدم بنجاح');
        } catch (\Exception $e) {
            error_log("setUserPermissionOverride error: " . $e->getMessage());
            return ResponseHelper::error('فشل في تحديث صلاحية المستخدم: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Remove user permission override
     */
    public function removeUserPermissionOverride(Request $request, array $params): array
    {
        $userId = (int) $params['id'];
        $permissionId = (int) $params['permissionId'];
        
        try {
            $stmt = $this->db->prepare("
                DELETE FROM user_permission_overrides 
                WHERE user_id = ? AND permission_id = ?
            ");
            $stmt->execute([$userId, $permissionId]);

            return ResponseHelper::success('تم إزالة تجاوز الصلاحية بنجاح');
        } catch (\Exception $e) {
            error_log("removeUserPermissionOverride error: " . $e->getMessage());
            return ResponseHelper::error('فشل في إزالة تجاوز الصلاحية: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get users with their roles
     */
    public function getUsersWithRoles(Request $request): array
    {
        try {
            $stmt = $this->db->query("
                SELECT 
                    u.id, u.full_name, u.email, u.phone_number, u.status,
                    GROUP_CONCAT(r.display_name_ar) as roles,
                    GROUP_CONCAT(r.name) as role_names
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = TRUE
                LEFT JOIN roles r ON ur.role_id = r.id
                WHERE u.deleted_at IS NULL
                GROUP BY u.id
                ORDER BY u.full_name
                LIMIT 100
            ");
            $users = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            return ResponseHelper::success('تم جلب المستخدمين بنجاح', $users);
        } catch (\Exception $e) {
            error_log("getUsersWithRoles error: " . $e->getMessage());
            return ResponseHelper::error('فشل في جلب المستخدمين: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Assign role to user
     */
    public function assignRole(Request $request, array $params): array
    {
        $userId = (int) $params['id'];
        
        try {
            $data = $request->all();
            $roleId = $data['role_id'] ?? null;

            if (!$roleId) {
                return ResponseHelper::error('معرف الدور مطلوب', 400);
            }

            $grantedBy = $request->user['id'] ?? null;

            $stmt = $this->db->prepare("
                INSERT INTO user_roles (user_id, role_id, granted_by, is_active)
                VALUES (?, ?, ?, TRUE)
                ON DUPLICATE KEY UPDATE is_active = TRUE, granted_by = VALUES(granted_by), granted_at = NOW()
            ");
            $stmt->execute([$userId, $roleId, $grantedBy]);

            return ResponseHelper::success('تم إسناد الدور للمستخدم بنجاح');
        } catch (\Exception $e) {
            error_log("assignRole error: " . $e->getMessage());
            return ResponseHelper::error('فشل في إسناد الدور: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Remove role from user
     */
    public function removeRole(Request $request, array $params): array
    {
        $userId = (int) $params['id'];
        $roleId = (int) $params['roleId'];
        
        try {
            $stmt = $this->db->prepare("
                UPDATE user_roles SET is_active = FALSE WHERE user_id = ? AND role_id = ?
            ");
            $stmt->execute([$userId, $roleId]);

            return ResponseHelper::success('تم إزالة الدور من المستخدم بنجاح');
        } catch (\Exception $e) {
            error_log("removeRole error: " . $e->getMessage());
            return ResponseHelper::error('فشل في إزالة الدور: ' . $e->getMessage(), 500);
        }
    }
}
