<?php
/**
 * User Controller
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Repositories\UserRepository;
use App\Helpers\ResponseHelper;
use App\Exceptions\NotFoundException;
use App\Helpers\NotificationHelper;


class UserController
{
    private UserRepository $userRepository;
    private \PDO $db;
    
    public function __construct()
    {
        $this->db = \App\Core\Database::getInstance()->getConnection();
        $this->userRepository = new UserRepository();
    }
    
    /**
     * GET /api/users
     */
    public function index(Request $request): array
    {
        try {
            $filters = [
                'status' => $request->query('status'),
                'search' => $request->query('search')
            ];
            
            $page = (int) $request->query('page', 1);
            $perPage = min((int) $request->query('per_page', 20), 100);
            
            $result = $this->userRepository->getAll($filters, $page, $perPage);
            
            return ResponseHelper::paginated(
                $result['data'],
                $result['total'],
                $page,
                $perPage
            );
        } catch (\Exception $e) {
            error_log('UserController::index Error: ' . $e->getMessage());
            return ResponseHelper::error('حدث خطأ أثناء جلب الأعضاء: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * GET /api/users/{id}
     */
    public function show(Request $request, array $params): array
    {
        $id = (int) $params['id'];
        $user = $this->userRepository->findById($id);
        
        if (!$user) {
            throw new NotFoundException('المستخدم غير موجود');
        }
        
        // Get roles
        $user['roles'] = $this->userRepository->getUserRoles($id);
        
        return ResponseHelper::success('تم جلب البيانات بنجاح', $user);
    }
    
    /**
     * POST /api/users
     * إنشاء عضو جديد
     */
    public function store(Request $request): array
    {
        try {
            // 1. استلام البيانات من الطلب
            $fullName = $request->input('full_name');
            $phoneNumber = $request->input('phone_number');
            $email = $request->input('email');
            $password = $request->input('password');
            $roleId = $request->input('role_id'); // حقل اختيار العضوية

            // 2. التحقق من الحقول الإلزامية
            if (!$fullName || !$phoneNumber || !$email) {
                return ResponseHelper::error('الاسم ورقم الهاتف والبريد الإلكتروني حقول مطلوبة', 400);
            }

            // 3. التحقق من تكرار البريد الإلكتروني
            $checkEmail = $this->db->prepare("SELECT id FROM users WHERE email = :email AND deleted_at IS NULL");
            $checkEmail->execute([':email' => $email]);
            if ($checkEmail->fetch()) {
                return ResponseHelper::error('البريد الإلكتروني مستخدم مسبقاً', 409);
            }

            // 4. التحقق من تكرار الهاتف
            $checkPhone = $this->db->prepare("SELECT id FROM users WHERE phone_number = :phone AND deleted_at IS NULL");
            $checkPhone->execute([':phone' => $phoneNumber]);
            if ($checkPhone->fetch()) {
                return ResponseHelper::error('رقم الهاتف مستخدم مسبقاً', 409);
            }

            $this->db->beginTransaction();

            // 5. إعداد كلمة المرور (الافتراضية: Union@2026)
            if (!$password) {
                $password = 'Union@2026';
            }
            $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

            // 6. الإدخال في قاعدة البيانات
            $sql = "INSERT INTO users (
                        full_name, phone_number, email, password, 
                        profile_photo, date_of_birth, gender, nationality, 
                        university, faculty, study_level, 
                        city, status, created_at, updated_at
                    ) VALUES (
                        :full_name, :phone_number, :email, :password,
                        :profile_photo, :date_of_birth, :gender, :nationality,
                        :university, :faculty, :study_level,
                        :city, :status, NOW(), NOW()
                    )";

            $stmt = $this->db->prepare($sql);
            
            $stmt->bindValue(':full_name', $fullName);
            $stmt->bindValue(':phone_number', $phoneNumber);
            $stmt->bindValue(':email', $email);
            $stmt->bindValue(':password', $hashedPassword);
            $stmt->bindValue(':profile_photo', $request->input('profile_photo'));
            $stmt->bindValue(':date_of_birth', !empty($request->input('date_of_birth')) ? $request->input('date_of_birth') : null);
            $stmt->bindValue(':gender', $request->input('gender') ?? 'male');
            $stmt->bindValue(':nationality', $request->input('nationality') ?? 'يمني');
            $stmt->bindValue(':university', !empty($request->input('university')) ? $request->input('university') : null);
            $stmt->bindValue(':faculty', !empty($request->input('faculty')) ? $request->input('faculty') : null);
            $stmt->bindValue(':study_level', $request->input('study_level') ?? 'bachelor');
            $stmt->bindValue(':city', !empty($request->input('city')) ? $request->input('city') : null);
            $stmt->bindValue(':status', $request->input('status') ?? 'active');
            
            $stmt->execute();
            $newUserId = (int)$this->db->lastInsertId();

            if (!$newUserId) {
                throw new \Exception("فشل في استرداد معرف المستخدم الجديد");
            }

            // 7. تعيين الدور (الافتراضي: member)
            $finalRoleId = (int)($roleId ?: 9); // الدور المختار أو عضو

            $currentUserId = $request->user['id'] ?? $request->user['sub'];
            $assignRole = $this->db->prepare("INSERT INTO user_roles (user_id, role_id, assigned_by, granted_at, is_active) 
                                             VALUES (:user_id, :role_id, :assigned_by, NOW(), 1)");
            $assignRole->execute([
                ':user_id' => $newUserId, 
                ':role_id' => $finalRoleId, 
                ':assigned_by' => $currentUserId
            ]);

            $this->db->commit();

            // 8. إرسال إشعار للرئيس
            NotificationHelper::notifyRole($this->db, 'president', '👤 عضو جديد', "تم إضافة عضو جديد: {$fullName}", 'info', "/users/{$newUserId}");

            return ResponseHelper::success('تم إضافة العضو بنجاح', [
                'id' => $newUserId,
                'full_name' => $fullName
            ], 201);

        } catch (\Exception $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            error_log("UserController::store error: " . $e->getMessage());
            return ResponseHelper::error('حدث خطأ في إضافة العضو: ' . $e->getMessage(), 500);
        }
    }


    
    /**
     * PUT /api/users/{id}
     */
    public function update(Request $request, array $params): array
    {
        try {
            $userId = (int) $params['id'];
            $user = $this->userRepository->findById($userId);
            if (!$user) {
                return ResponseHelper::error('المستخدم غير موجود', 404);
            }

            // الحقول المسموح تعديلها
            $allowedFields = [
                'full_name', 'phone_number', 'email', 'date_of_birth', 
                'gender', 'nationality', 'university', 'faculty', 
                'study_level', 'city', 'profile_photo', 'status'
            ];

            // بناء الاستعلام ديناميكياً
            $updates = [];
            $queryParams = [':id' => $userId];

            foreach ($allowedFields as $field) {
                $value = $request->input($field);
                if ($value !== null) {
                    $updates[] = "{$field} = :{$field}";
                    $queryParams[":{$field}"] = $value;
                }
            }

            // كلمة المرور (إذا أرسلت)
            $password = $request->input('password');
            if ($password) {
                $updates[] = "password = :password";
                $queryParams[':password'] = password_hash($password, PASSWORD_BCRYPT);
            }

            if (empty($updates)) {
                return ResponseHelper::error('لا يوجد بيانات للتعديل', 400);
            }

            // تحقق تكرار الإيميل
            $newEmail = $request->input('email');
            if ($newEmail && $newEmail !== $user['email']) {
                $checkEmail = $this->db->prepare("SELECT id FROM users WHERE email = :email AND id != :id AND deleted_at IS NULL");
                $checkEmail->execute([':email' => $newEmail, ':id' => $userId]);
                if ($checkEmail->fetch()) {
                    return ResponseHelper::error('البريد الإلكتروني مستخدم مسبقاً', 409);
                }
            }

            // تحقق تكرار الهاتف
            $newPhone = $request->input('phone_number');
            if ($newPhone && $newPhone !== $user['phone_number']) {
                $checkPhone = $this->db->prepare("SELECT id FROM users WHERE phone_number = :phone AND id != :id AND deleted_at IS NULL");
                $checkPhone->execute([':phone' => $newPhone, ':id' => $userId]);
                if ($checkPhone->fetch()) {
                    return ResponseHelper::error('رقم الهاتف مستخدم مسبقاً', 409);
                }
            }

            $sql = "UPDATE users SET " . implode(', ', $updates) . ", updated_at = NOW() WHERE id = :id AND deleted_at IS NULL";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($queryParams);

            $updatedUser = $this->userRepository->findById($userId);
            return ResponseHelper::success('تم تعديل بيانات العضو بنجاح', $updatedUser);
        } catch (\Exception $e) {
            error_log("UserController::update error: " . $e->getMessage());
            return ResponseHelper::error('حدث خطأ في تعديل العضو: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * DELETE /api/users/{id}
     */
    public function destroy(Request $request, array $params): array
    {
        $id = (int) $params['id'];
        $user = $this->userRepository->findById($id);
        
        if (!$user) {
            throw new NotFoundException('المستخدم غير موجود');
        }
        
        // Cannot delete yourself
        if ($id === $request->user['id']) {
            return ResponseHelper::error('لا يمكنك حذف حسابك الشخصي', 400);
        }
        
        $this->userRepository->delete($id);
        
        return ResponseHelper::success('تم حذف العضو بنجاح');
    }
    
    /**
     * POST /api/users/{id}/verify
     * Approve a pending user membership
     */
    public function verify(Request $request, array $params): array
    {
        $id = (int) $params['id'];
        $user = $this->userRepository->findById($id);
        
        if (!$user) {
            throw new NotFoundException('المستخدم غير موجود');
        }
        
        if ($user['status'] !== 'pending') {
            return ResponseHelper::error('المستخدم ليس في حالة انتظار', 400);
        }
        
        $this->userRepository->verify($id);
        
        // Get updated user data
        $updatedUser = $this->userRepository->findById($id);
        $updatedUser['roles'] = $this->userRepository->getUserRoles($id);
        
        return ResponseHelper::success('تمت الموافقة على العضوية بنجاح', $updatedUser);
    }
    
    /**
     * GET /api/profile
     * Get current user's profile
     */
    public function profile(Request $request): array
    {
        $userId = $request->user['id'];
        $user = $this->userRepository->findById($userId);
        
        if (!$user) {
            throw new NotFoundException('المستخدم غير موجود');
        }
        
        // Get roles
        $user['roles'] = $this->userRepository->getUserRoles($userId);
        
        return ResponseHelper::success('تم جلب البيانات بنجاح', $user);
    }
    
    /**
     * PUT /api/profile
     * Update current user's profile
     */
    public function updateProfile(Request $request): array
    {
        try {
            $userId = (int)($request->user['id'] ?? $request->user['sub']);

            // الحقول المسموح تعديلها
            $allowedFields = [
                'full_name', 'phone_number', 'email', 'date_of_birth', 
                'gender', 'nationality', 'university', 'faculty', 
                'study_level', 'city', 'profile_photo'
            ];

            // بناء الاستعلام ديناميكياً
            $updates = [];
            $params = [':id' => $userId];

            foreach ($allowedFields as $field) {
                $value = $request->input($field);
                if ($value !== null) {
                    $updates[] = "{$field} = :{$field}";
                    $params[":{$field}"] = $value;
                }
            }

            if (empty($updates)) {
                return ResponseHelper::error('لا يوجد بيانات للتعديل', 400);
            }

            // تحقق تكرار الإيميل (إذا تم تغييره)
            $newEmail = $request->input('email');
            if ($newEmail) {
                $checkEmail = $this->db->prepare("SELECT id FROM users WHERE email = :email AND id != :id AND deleted_at IS NULL");
                $checkEmail->execute([':email' => $newEmail, ':id' => $userId]);
                if ($checkEmail->fetch()) {
                    return ResponseHelper::error('البريد الإلكتروني مستخدم مسبقاً', 409);
                }
            }

            // تحقق تكرار الهاتف
            $newPhone = $request->input('phone_number');
            if ($newPhone) {
                $checkPhone = $this->db->prepare("SELECT id FROM users WHERE phone_number = :phone AND id != :id AND deleted_at IS NULL");
                $checkPhone->execute([':phone' => $newPhone, ':id' => $userId]);
                if ($checkPhone->fetch()) {
                    return ResponseHelper::error('رقم الهاتف مستخدم مسبقاً', 409);
                }
            }

            $sql = "UPDATE users SET " . implode(', ', $updates) . ", updated_at = NOW() WHERE id = :id AND deleted_at IS NULL";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            $updatedUser = $this->userRepository->findById($userId);
            $updatedUser['roles'] = $this->userRepository->getUserRoles($userId);

            return ResponseHelper::success('تم تعديل البيانات بنجاح', $updatedUser);
        } catch (\Exception $e) {
            error_log("UserController::updateProfile error: " . $e->getMessage());
            return ResponseHelper::error('حدث خطأ في تحديث البروفايل: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * PUT /api/profile/password
     * Update current user's password
     */
    public function updatePassword(Request $request): array
    {
        $userId = $request->user['id'];
        $currentPassword = $request->input('current_password');
        $newPassword = $request->input('new_password');
        $confirmPassword = $request->input('confirm_password');
        
        // Validate input
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
        
        // Get current user
        $user = $this->userRepository->findById($userId);
        
        if (!$user) {
            throw new NotFoundException('المستخدم غير موجود');
        }
        
        // Verify current password
        if (!password_verify($currentPassword, $user['password'])) {
            return ResponseHelper::validationError('خطأ في البيانات المدخلة', [
                'current_password' => ['كلمة المرور الحالية غير صحيحة']
            ]);
        }
        
        // Hash and update new password
        $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
        $this->userRepository->update($userId, ['password' => $hashedPassword]);
        
        return ResponseHelper::success('تم تغيير كلمة المرور بنجاح');
    }
    
    /**
     * POST /api/users/{id}/ban
     */
    public function ban(Request $request, array $params): array
    {
        $id = (int) $params['id'];
        $user = $this->userRepository->findById($id);
        
        if (!$user) {
            throw new NotFoundException('المستخدم غير موجود');
        }
        
        // Cannot ban yourself
        if ($id === $request->user['id']) {
            return ResponseHelper::error('لا يمكنك حظر حسابك الشخصي', 400);
        }
        
        $this->userRepository->ban($id);
        
        return ResponseHelper::success('تم حظر العضو بنجاح');
    }

    /**
     * Get user's active roles
     */
    public function getUserRole(Request $request, array $params): array
    {
        $userId = $params['id'];

        $sql = "SELECT ur.*, r.name as role_name, r.display_name, r.display_name_ar, r.level,
                       assigner.full_name as assigned_by_name
                FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                LEFT JOIN users assigner ON ur.assigned_by = assigner.id
                WHERE ur.user_id = :user_id AND ur.is_active = 1
                ORDER BY r.level DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':user_id' => $userId]);
        $userRoles = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        return ResponseHelper::success('أدوار العضو', $userRoles);
    }

    /**
     * Assign a new role to the user
     */
    public function assignRole(Request $request, array $params): array
    {
        $userId = $params['id'];
        $roleId = $request->input('role_id');
        $currentUserId = $request->user['id'] ?? $request->user['sub'] ?? null;

        if (!$roleId) {
            return ResponseHelper::error('الدور مطلوب', 400);
        }

        // Verify user exists
        $userCheck = $this->db->prepare("SELECT id FROM users WHERE id = ? AND deleted_at IS NULL");
        $userCheck->execute([$userId]);
        if (!$userCheck->fetch()) {
            return ResponseHelper::error('العضو غير موجود', 404);
        }

        // Verify role exists
        $roleCheck = $this->db->prepare("SELECT id, name FROM roles WHERE id = ?");
        $roleCheck->execute([$roleId]);
        $role = $roleCheck->fetch(\PDO::FETCH_ASSOC);
        if (!$role) {
            return ResponseHelper::error('الدور غير موجود', 404);
        }

        $this->db->beginTransaction();
        try {
            // Deactivate existing roles
            $deactivate = $this->db->prepare("UPDATE user_roles SET is_active = 0 WHERE user_id = :user_id");
            $deactivate->execute([':user_id' => $userId]);

            // Check if user previously had this role
            $existing = $this->db->prepare("SELECT user_id FROM user_roles WHERE user_id = :user_id AND role_id = :role_id");
            $existing->execute([':user_id' => $userId, ':role_id' => $roleId]);

            if ($existing->fetch()) {
                // Reactivate and update assigner
                $reactivate = $this->db->prepare("UPDATE user_roles SET is_active = 1, assigned_by = :assigned_by, granted_at = NOW() WHERE user_id = :user_id AND role_id = :role_id");
                $reactivate->execute([':user_id' => $userId, ':role_id' => $roleId, ':assigned_by' => $currentUserId]);
            } else {
                // Create new assignment
                $insert = $this->db->prepare("INSERT INTO user_roles (user_id, role_id, assigned_by, granted_at, is_active) VALUES (:user_id, :role_id, :assigned_by, NOW(), 1)");
                $insert->execute([':user_id' => $userId, ':role_id' => $roleId, ':assigned_by' => $currentUserId]);
            }

            $this->db->commit();
            return ResponseHelper::success('تم تعيين الدور بنجاح: ' . ($role['name'] ?? ''), null);
        } catch (\Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }

    /**
     * Deactivate a specific user role
     */
    public function removeRole(Request $request, array $params): array
    {
        $userId = $params['id'];
        $roleId = $request->input('role_id');

        $stmt = $this->db->prepare("UPDATE user_roles SET is_active = 0 WHERE user_id = :user_id AND role_id = :role_id");
        $stmt->execute([':user_id' => $userId, ':role_id' => $roleId]);

        return ResponseHelper::success('تم إزالة الدور بنجاح', null);
    }
    /**
     * GET /api/me/permissions
     */
    public function myPermissions(Request $request): array
    {
        try {
            $userId = (int)($request->user['id'] ?? $request->user['sub']);

            // بيانات المستخدم
            $userStmt = $this->db->prepare("SELECT id, full_name, phone_number, email, university, faculty, profile_photo, status, last_login_at FROM users WHERE id = :userId AND deleted_at IS NULL");
            $userStmt->execute([':userId' => $userId]);
            $user = $userStmt->fetch(\PDO::FETCH_ASSOC);

            if (!$user) {
                return ResponseHelper::error('مستخدم غير موجود', 404);
            }

            // الدور النشط
            $roleStmt = $this->db->prepare("
                SELECT r.id, r.name, r.display_name, r.display_name_ar, r.level
                FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = :userId AND ur.is_active = 1
                ORDER BY r.level DESC LIMIT 1
            ");
            $roleStmt->execute([':userId' => $userId]);
            $role = $roleStmt->fetch(\PDO::FETCH_ASSOC);

            $permissions = [];
            if ($role) {
                // الصلاحيات
                $permStmt = $this->db->prepare("
                    SELECT p.name
                    FROM role_permissions rp
                    JOIN permissions p ON rp.permission_id = p.id
                    WHERE rp.role_id = :roleId
                ");
                $permStmt->execute([':roleId' => $role['id']]);
                $permissions = $permStmt->fetchAll(\PDO::FETCH_COLUMN);
            }

            // الاشتراك النشط
            $memStmt = $this->db->prepare("
                SELECT id, package_name, package_type, amount, currency, status, payment_status,
                    start_date, end_date,
                    DATEDIFF(end_date, CURDATE()) as days_remaining,
                    DATEDIFF(end_date, start_date) as total_days
                FROM memberships
                WHERE user_id = :userId AND status = 'active'
                ORDER BY created_at DESC LIMIT 1
            ");
            $memStmt->execute([':userId' => $userId]);
            $membership = $memStmt->fetch(\PDO::FETCH_ASSOC);

            if ($membership) {
                $total = (int)$membership['total_days'];
                $remaining = (int)$membership['days_remaining'];
                $membership['progress_percentage'] = $total > 0 ? round(($remaining / $total) * 100, 1) : 0;
            }

            // الإشعارات غير المقروءة
            $unreadStmt = $this->db->prepare("SELECT COUNT(*) as count FROM notifications WHERE user_id = :userId AND is_read = 0");
            $unreadStmt->execute([':userId' => $userId]);
            $unreadNotifications = (int)$unreadStmt->fetch(\PDO::FETCH_ASSOC)['count'];

            return ResponseHelper::success('تم جلب بيانات المستخدم والصلاحيات', [
                'user' => $user,
                'role' => $role,
                'permissions' => $permissions,
                'membership' => $membership,
                'unread_notifications' => $unreadNotifications
            ]);
        } catch (\Exception $e) {
            return ResponseHelper::error('Error: ' . $e->getMessage(), 500);
        }
    }
}
