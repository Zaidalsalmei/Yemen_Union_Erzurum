-- ================================================
-- Migration 008: New Core Tables
-- Yemen Student Union System
-- Date: 2026-03-02
-- ================================================
USE yemen_union_db;

-- ================================================
-- 1. جدول المعاملات المالية
-- Financial Transactions Table
-- ================================================
CREATE TABLE IF NOT EXISTS financial_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('income', 'expense') NOT NULL,
    category VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    reference_type VARCHAR(50) COMMENT 'membership, sponsorship, activity, other',
    reference_id INT,
    payment_method VARCHAR(50),
    receipt_photo VARCHAR(255),
    recorded_by INT,
    approved_by INT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_transaction_date (transaction_date),
    INDEX idx_recorded_by (recorded_by),
    INDEX idx_reference (reference_type, reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- 2. جدول سجل النشاطات (Audit Log)
-- Audit Logs Table - للأمان وتتبع التغييرات
-- ================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL COMMENT 'create, update, delete, login, logout, etc.',
    table_name VARCHAR(100),
    record_id INT,
    old_data JSON,
    new_data JSON,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at),
    INDEX idx_record (table_name, record_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- 3. جدول الرسائل الداخلية
-- Internal Messages Table
-- ================================================
CREATE TABLE IF NOT EXISTS internal_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT,
    group_type ENUM('all', 'role', 'individual') DEFAULT 'individual',
    target_role VARCHAR(50) COMMENT 'Used when group_type = role',
    subject VARCHAR(255),
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    deleted_by_sender BOOLEAN DEFAULT FALSE,
    deleted_by_receiver BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_is_read (is_read),
    INDEX idx_group_type (group_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- 4. جدول المحتوى الأكاديمي
-- Academic Resources Table
-- ================================================
CREATE TABLE IF NOT EXISTS academic_resources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) COMMENT 'lecture_notes, books, exams, guides, other',
    university VARCHAR(200),
    faculty VARCHAR(200),
    file_url VARCHAR(500),
    file_type VARCHAR(50) COMMENT 'pdf, doc, ppt, image, video, link',
    file_size_kb INT,
    thumbnail_url VARCHAR(500),
    uploaded_by INT,
    downloads_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    status ENUM('draft', 'published', 'rejected') DEFAULT 'draft',
    tags VARCHAR(500) COMMENT 'JSON array of tags',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_university (university),
    INDEX idx_faculty (faculty),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_created_at (created_at),
    FULLTEXT INDEX ft_search (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- التحقق من النجاح
-- ================================================
SELECT 'financial_transactions' as table_name, COUNT(*) as rows FROM financial_transactions
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs
UNION ALL
SELECT 'internal_messages', COUNT(*) FROM internal_messages
UNION ALL
SELECT 'academic_resources', COUNT(*) FROM academic_resources;

SELECT '✅ تم إنشاء الجداول الأربعة بنجاح!' as status;
