-- إصلاح شامل لجميع الجداول المطلوبة لنظام تذاكر الدعم والإشعارات
USE yemen_union_db;

-- ======================================================
-- 1. إصلاح جدول notifications
-- ======================================================

-- التحقق من البنية الحالية
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'yemen_union_db' 
AND TABLE_NAME = 'notifications';

-- إضافة الأعمدة المفقودة
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS title VARCHAR(255) NOT NULL DEFAULT '' AFTER type;

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS action_url VARCHAR(255) NULL AFTER message;

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL AFTER is_read;

-- إضافة indexes للأداء
ALTER TABLE notifications 
ADD INDEX IF NOT EXISTS idx_user_id (user_id);

ALTER TABLE notifications 
ADD INDEX IF NOT EXISTS idx_is_read (is_read);

ALTER TABLE notifications 
ADD INDEX IF NOT EXISTS idx_created_at (created_at);

-- ======================================================
-- 2. إنشاء جدول support_tickets
-- ======================================================

CREATE TABLE IF NOT EXISTS support_tickets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('open', 'pending', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    attachment_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_ticket_number (ticket_number),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================================
-- 3. إنشاء جدول support_ticket_replies
-- ======================================================

CREATE TABLE IF NOT EXISTS support_ticket_replies (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    message TEXT NOT NULL,
    is_admin_reply BOOLEAN DEFAULT FALSE,
    attachment_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================================
-- 4. إنشاء جدول post_reads (لتتبع قراءة المنشورات)
-- ======================================================

CREATE TABLE IF NOT EXISTS post_reads (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_post_user (post_id, user_id),
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================================
-- 5. التحقق من النجاح
-- ======================================================

-- عرض بنية جدول notifications بعد التعديل
DESCRIBE notifications;

-- عرض جميع الجداول المُنشأة
SHOW TABLES LIKE '%ticket%';
SHOW TABLES LIKE '%notification%';
SHOW TABLES LIKE '%post_read%';

-- ======================================================
-- 6. اختبار بسيط
-- ======================================================

-- عد السجلات في كل جدول
SELECT 'support_tickets' as table_name, COUNT(*) as count FROM support_tickets
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'support_ticket_replies', COUNT(*) FROM support_ticket_replies
UNION ALL
SELECT 'post_reads', COUNT(*) FROM post_reads;

SELECT '✅ جميع الجداول جاهزة!' as status;
