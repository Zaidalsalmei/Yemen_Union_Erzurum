-- إنشاء مستخدم تجريبي للاختبار
-- رقم الهاتف: 05350703570
-- كلمة المرور: password

INSERT INTO users (full_name, phone_number, password, email, status, created_at, updated_at) 
VALUES (
    'مسؤول النظام',
    '05350703570',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin@yemen-union.com',
    'active',
    NOW(),
    NOW()
);

-- إنشاء دور المسؤول
INSERT INTO roles (name, display_name_ar, display_name_en, description, created_at, updated_at)
VALUES (
    'admin',
    'مسؤول',
    'Administrator',
    'Full system access',
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE id=id;

-- ربط المستخدم بدور المسؤول
INSERT INTO user_roles (user_id, role_id, created_at)
SELECT u.id, r.id, NOW()
FROM users u, roles r
WHERE u.phone_number = '05350703570'
AND r.name = 'admin'
LIMIT 1;

-- إنشاء جميع الصلاحيات للمسؤول
INSERT INTO permissions (name, display_name_ar, display_name_en, description, created_at, updated_at)
VALUES
    ('dashboard.read', 'عرض لوحة التحكم', 'View Dashboard', 'View dashboard', NOW(), NOW()),
    ('users.read', 'عرض الأعضاء', 'View Users', 'View users', NOW(), NOW()),
    ('users.create', 'إضافة عضو', 'Create User', 'Create user', NOW(), NOW()),
    ('users.update', 'تعديل عضو', 'Update User', 'Update user', NOW(), NOW()),
    ('users.delete', 'حذف عضو', 'Delete User', 'Delete user', NOW(), NOW()),
    ('activities.read', 'عرض الأنشطة', 'View Activities', 'View activities', NOW(), NOW()),
    ('activities.create', 'إضافة نشاط', 'Create Activity', 'Create activity', NOW(), NOW()),
    ('settings.read', 'عرض الإعدادات', 'View Settings', 'View settings', NOW(), NOW()),
    ('settings.update', 'تعديل الإعدادات', 'Update Settings', 'Update settings', NOW(), NOW())
ON DUPLICATE KEY UPDATE id=id;

-- ربط جميع الصلاحيات بدور المسؤول
INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, NOW()
FROM roles r, permissions p
WHERE r.name = 'admin'
ON DUPLICATE KEY UPDATE role_id=role_id;
