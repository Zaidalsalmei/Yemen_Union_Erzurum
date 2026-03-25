<?php
/**
 * Role and Permission Controller
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Helpers\ResponseHelper;
use App\Repositories\UserRepository;
use PDO;

class RoleController
{
    private PDO $db;
    private UserRepository $userRepository;

    public function __construct()
    {
        $this->db = \App\Core\Database::getInstance()->getConnection();
        $this->userRepository = new UserRepository();
    }

    public function index(Request $request): array
    {
        try {
            $stmt = $this->db->query("
                SELECT r.*,
                (SELECT COUNT(*) FROM role_permissions rp WHERE rp.role_id = r.id) as permissions_count,
                (SELECT COUNT(*) FROM user_roles ur WHERE ur.role_id = r.id AND ur.is_active = 1) as users_count
                FROM roles r
                ORDER BY r.level DESC
            ");
            $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return ResponseHelper::success('تم جلب الأدوار بنجاح', $roles);
        } catch (\Exception $e) {
            return ResponseHelper::error('فشل في جلب الأدوار: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Dropdown list for roles selection
     */
    public function dropdown(Request $request): array
    {
        try {
            $sql = "SELECT r.*, 
                      (SELECT COUNT(*) FROM role_permissions rp WHERE rp.role_id = r.id) as permissions_count
                    FROM roles r ORDER BY r.level DESC";
            $stmt = $this->db->query($sql);
            return ResponseHelper::success('قائمة الأدوار', $stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch (\Exception $e) {
            return ResponseHelper::error('فشل في جلب قائمة الأدوار: ' . $e->getMessage(), 500);
        }
    }

    public function show(Request $request, array $params): array
    {
        $id = (int) $params['id'];
        try {
            $stmt = $this->db->prepare("SELECT * FROM roles WHERE id = ?");
            $stmt->execute([$id]);
            $role = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$role) return ResponseHelper::error('الدور غير موجود', 404);

            return ResponseHelper::success('تم جلب الدور بنجاح', $role);
        } catch (\Exception $e) {
            return ResponseHelper::error('فشل في جلب الدور: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get all permissions for a specific role with enabled flag
     */
    public function getRolePermissions(Request $request, array $params): array
    {
        $roleId = (int) $params['id'];
        try {
            // Check role
            $stmt = $this->db->prepare("SELECT * FROM roles WHERE id = ?");
            $stmt->execute([$roleId]);
            $role = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$role) return ResponseHelper::error('الدور غير موجود', 404);

            // Fetch all permissions with enabled flag
            $sql = "SELECT p.*,
                      CASE WHEN rp.role_id IS NOT NULL THEN 1 ELSE 0 END as enabled
                    FROM permissions p
                    LEFT JOIN role_permissions rp ON p.id = rp.permission_id AND rp.role_id = :role_id
                    ORDER BY p.category, p.name";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':role_id' => $roleId]);
            $permissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($permissions as &$p) {
                $p['enabled'] = (bool)$p['enabled'];
            }

            return ResponseHelper::success('صلاحيات الدور', [
                'role' => $role,
                'permissions' => $permissions
            ]);
        } catch (\Exception $e) {
            return ResponseHelper::error('فشل في جلب الصلاحيات: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Sync permissions for a role
     */
    public function updateRolePermissions(Request $request, array $params): array
    {
        $roleId = (int) $params['id'];
        $permissionIds = $request->input('permissions', []);
        
        try {
            $this->db->beginTransaction();
            
            // Delete old
            $stmt = $this->db->prepare("DELETE FROM role_permissions WHERE role_id = ?");
            $stmt->execute([$roleId]);
            
            // Insert new
            if (!empty($permissionIds) && is_array($permissionIds)) {
                $insert = $this->db->prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)");
                foreach ($permissionIds as $pId) {
                    $insert->execute([$roleId, $pId]);
                }
            }
            
            $this->db->commit();
            return ResponseHelper::success('تم تحديث صلاحيات الدور بنجاح');
        } catch (\Exception $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            return ResponseHelper::error('فشل في تحديث الصلاحيات: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create role
     * POST /api/roles
     */
    public function store(Request $request): array
    {
        try {
            $data = $request->all();
            
            if (empty($data['name']) || empty($data['display_name'])) {
                return ResponseHelper::error('اسم الدور واسم العرض مطلوبان', 400);
            }

            $this->db->beginTransaction();

            $stmt = $this->db->prepare("
                INSERT INTO roles (name, display_name, description, is_system, created_at, updated_at)
                VALUES (?, ?, ?, 0, NOW(), NOW())
            ");
            $stmt->execute([
                $data['name'], 
                $data['display_name'], 
                $data['description'] ?? null
            ]);
            
            $roleId = (int) $this->db->lastInsertId();

            if (!empty($data['permissions']) && is_array($data['permissions'])) {
                $this->syncRolePermissions($roleId, $data['permissions']);
            }

            $this->db->commit();

            return ResponseHelper::success('تم إنشاء الدور بنجاح', ['id' => $roleId]);
        } catch (\Exception $e) {
            $this->db->rollBack();
            error_log("storeRole error: " . $e->getMessage());
            return ResponseHelper::error('فشل في إنشاء الدور: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update role
     * PUT /api/roles/{id}
     */
    public function update(Request $request, array $params): array
    {
        $id = (int) $params['id'];
        
        try {
            $data = $request->all();
            
            $stmt = $this->db->prepare("SELECT * FROM roles WHERE id = ?");
            $stmt->execute([$id]);
            $role = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$role) {
                return ResponseHelper::error('الدور غير موجود', 404);
            }

            if ((int)$role['is_system'] === 1 && isset($data['name']) && $data['name'] !== $role['name']) {
                return ResponseHelper::error('لا يمكن تغيير الاسم البرمجي لدور النظام الأساسي', 400);
            }

            $this->db->beginTransaction();

            $updateData = [
                'name' => $data['name'] ?? $role['name'],
                'display_name' => $data['display_name'] ?? $role['display_name'],
                'description' => $data['description'] ?? $role['description']
            ];

            $stmt = $this->db->prepare("
                UPDATE roles 
                SET name = ?, display_name = ?, description = ?, updated_at = NOW() 
                WHERE id = ?
            ");
            $stmt->execute([
                $updateData['name'],
                $updateData['display_name'],
                $updateData['description'],
                $id
            ]);

            if (isset($data['permissions']) && is_array($data['permissions'])) {
                $this->syncRolePermissions($id, $data['permissions']);
            }

            $this->db->commit();

            return ResponseHelper::success('تم تحديث الدور بنجاح');
        } catch (\Exception $e) {
            $this->db->rollBack();
            error_log("updateRole error: " . $e->getMessage());
            return ResponseHelper::error('فشل في تحديث الدور: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete role
     * DELETE /api/roles/{id}
     */
    public function destroy(Request $request, array $params): array
    {
        $id = (int) $params['id'];
        
        try {
            $stmt = $this->db->prepare("SELECT * FROM roles WHERE id = ?");
            $stmt->execute([$id]);
            $role = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$role) {
                return ResponseHelper::error('الدور غير موجود', 404);
            }

            if ((int)$role['is_system'] === 1) {
                return ResponseHelper::error('لا يمكن حذف أدوار النظام الأساسية', 400);
            }

            $stmt = $this->db->prepare("DELETE FROM roles WHERE id = ?");
            $stmt->execute([$id]);

            return ResponseHelper::success('تم حذف الدور بنجاح');
        } catch (\Exception $e) {
            error_log("deleteRole error: " . $e->getMessage());
            return ResponseHelper::error('فشل في حذف الدور: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update role permissions directly
     * POST /api/roles/{id}/permissions
     */
    public function assignPermissions(Request $request, array $params): array
    {
        $id = (int) $params['id'];
        
        try {
            $data = $request->all();
            if (!isset($data['permissions']) || !is_array($data['permissions'])) {
                return ResponseHelper::error('قائمة الصلاحيات مطلوبة', 400);
            }

            $stmt = $this->db->prepare("SELECT * FROM roles WHERE id = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                return ResponseHelper::error('الدور غير موجود', 404);
            }

            $this->db->beginTransaction();
            $this->syncRolePermissions($id, $data['permissions']);
            $this->db->commit();

            return ResponseHelper::success('تم تحديث صلاحيات الدور بنجاح');
        } catch (\Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log("assignPermissions error: " . $e->getMessage());
            return ResponseHelper::error('فشل في تحديث صلاحيات الدور: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Helper to sync permissions
     */
    private function syncRolePermissions(int $roleId, array $permissionNames): void
    {
        // Delete existing ones
        $stmt = $this->db->prepare("DELETE FROM role_permissions WHERE role_id = ?");
        $stmt->execute([$roleId]);

        if (empty($permissionNames)) {
            return;
        }

        // Get permission IDs
        $in = str_repeat('?,', count($permissionNames) - 1) . '?';
        $stmt = $this->db->prepare("SELECT id FROM permissions WHERE name IN ($in)");
        $stmt->execute($permissionNames);
        $permIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

        if (empty($permIds)) return;

        // Insert new ones
        $placeholders = implode(',', array_fill(0, count($permIds), '(?, ?)'));
        $values = [];
        foreach ($permIds as $permId) {
            $values[] = $roleId;
            $values[] = $permId;
        }
        
        $stmt = $this->db->prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES $placeholders");
        $stmt->execute($values);
    }

    /**
     * Get all permissions
     * GET /api/permissions
     */
    public function permissions(Request $request): array
    {
        try {
            $stmt = $this->db->query("SELECT id, name, display_name, description, category FROM permissions ORDER BY category, name");
            $permissions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return ResponseHelper::success('تم جلب الصلاحيات بنجاح', $permissions);
        } catch (\Exception $e) {
            error_log("getPermissions error: " . $e->getMessage());
            return ResponseHelper::error('فشل في جلب الصلاحيات: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get user roles and permissions
     * GET /api/users/{id}/permissions
     */
    public function userPermissions(Request $request, array $params): array
    {
        $userId = (int) $params['id'];
        
        try {
            $roles = $this->userRepository->getUserRoles($userId);
            $permissions = $this->userRepository->getUserPermissions($userId);

            $data = [
                'roles' => array_column($roles, 'name'),
                'permissions' => array_column($permissions, 'name')
            ];

            return ResponseHelper::success('تم جلب صلاحيات المستخدم بنجاح', $data);
        } catch (\Exception $e) {
            error_log("userPermissions error: " . $e->getMessage());
            return ResponseHelper::error('فشل في جلب صلاحيات المستخدم: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Assign role to user
     * POST /api/users/{id}/roles
     */
    public function assignRole(Request $request, array $params): array
    {
        $userId = (int) $params['id'];
        
        try {
            $data = $request->all();
            if (empty($data['role_id'])) {
                return ResponseHelper::error('معرف الدور مطلوب', 400);
            }

            // Find role
            $stmt = $this->db->prepare("SELECT id FROM roles WHERE id = ?");
            $stmt->execute([$data['role_id']]);
            $roleId = $stmt->fetchColumn();

            if (!$roleId) {
                return ResponseHelper::error('الدور غير موجود', 404);
            }

            $assignedBy = $request->user['id'] ?? null;
            $this->userRepository->assignRole($userId, (int) $roleId, $assignedBy);

            return ResponseHelper::success('تم إضافة الدور للمستخدم بنجاح');
        } catch (\Exception $e) {
            error_log("assignRole error: " . $e->getMessage());
            return ResponseHelper::error('فشل في إضافة الدور للمستخدم: ' . $e->getMessage(), 500);
        }
    }
}
