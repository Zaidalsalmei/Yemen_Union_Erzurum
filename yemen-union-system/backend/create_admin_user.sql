USE yemen_union_db;

-- 1. التأكد من وجود دور 'president'
INSERT INTO roles (name, display_name_ar, description_ar)
SELECT 'president', 'رئيس الاتحاد', 'صلاحيات كاملة على النظام'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'president');

-- 2. بيانات المدير (تم التحديث)
SET @phone = '05376439960';
SET @pass_hash = '$2y$10$QxCaTAvfDEEJLpkdPbsW8Omn8B3XABbAig6HoMlG8qfd9ExKyGn7O'; -- Admin@123456
SET @full_name = 'مدير النظام';

-- 3. إضافة أو تحديث المستخدم
INSERT INTO users (full_name, phone_number, password, status, nationality, gender, created_at)
SELECT @full_name, @phone, @pass_hash, 'active', 'يمني', 'male', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE phone_number = @phone);

-- تحديث البيانات في حال كان موجوداً (أو لتحديث الرقم القديم لنفس الاسم)
-- ملاحظة: هنا سنقوم بتحديث المستخدم الذي يحمل نفس الاسم "مدير النظام" ليأخذ الرقم الجديد
UPDATE users 
SET phone_number = @phone, password = @pass_hash, status = 'active', deleted_at = NULL
WHERE full_name = @full_name;

-- 4. منح الصلاحيات
SET @user_id = (SELECT id FROM users WHERE phone_number = @phone);
SET @role_id = (SELECT id FROM roles WHERE name = 'president');

INSERT INTO user_roles (user_id, role_id)
SELECT @user_id, @role_id
WHERE NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = @user_id AND role_id = @role_id);

-- 5. عرض النتيجة للتأكيد
SELECT u.id, u.full_name, u.phone_number, r.name as role_name 
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
JOIN roles r ON ur.role_id = r.id 
WHERE u.phone_number = @phone;
