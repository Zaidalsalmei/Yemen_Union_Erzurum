-- فحص وإصلاح جدول notifications
USE yemen_union_db;

-- 1. عرض البنية الحالية للجدول
DESCRIBE notifications;

-- 2. إضافة الأعمدة المفقودة إذا لم تكن موجودة
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS title VARCHAR(255) AFTER type;

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS action_url VARCHAR(255) AFTER message;

-- 3. التحقق من البنية الجديدة
DESCRIBE notifications;

-- 4. الآن يمكنك البحث
SELECT * FROM notifications WHERE title LIKE '%تذكرة%';

-- 5. عرض جميع الإشعارات
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;
