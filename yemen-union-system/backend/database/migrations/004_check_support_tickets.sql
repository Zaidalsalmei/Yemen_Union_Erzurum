-- التحقق من وجود جدول support_tickets وإنشائه إذا لم يكن موجوداً
-- MANUAL CHECK SCRIPT

-- 1. التحقق من وجود الجدول
SELECT COUNT(*) as table_exists 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'yemen_union_db' 
AND TABLE_NAME = 'support_tickets';

-- 2. إذا كان الجدول غير موجود، أنشئه:
CREATE TABLE IF NOT EXISTS support_tickets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('open', 'pending', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    attachment_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. التحقق من وجود جدول support_ticket_replies
CREATE TABLE IF NOT EXISTS support_ticket_replies (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    message TEXT NOT NULL,
    is_admin_reply BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. عرض التذاكر الموجودة
SELECT 
    st.*,
    u.full_name as member_name
FROM support_tickets st
LEFT JOIN users u ON st.user_id = u.id
WHERE st.deleted_at IS NULL
ORDER BY st.created_at DESC
LIMIT 10;

-- 5. عرض الإشعارات المُنشأة
SELECT * FROM notifications 
WHERE title LIKE '%تذكرة دعم%'
ORDER BY created_at DESC 
LIMIT 10;
