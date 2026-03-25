-- ================================================
-- Migration: Member Dashboard Tables & Columns
-- Created: 2025-12-14
-- Description: Add missing tables and columns for member dashboard
-- ================================================

USE yemen_union_db;

-- 1. Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS member_id VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS branch VARCHAR(100) DEFAULT 'أرضروم – تركيا',
ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- Add index for member_id if column was added
CREATE INDEX IF NOT EXISTS idx_member_id ON users(member_id);

-- 2. Add missing columns to memberships table  
ALTER TABLE memberships 
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'TRY',
ADD COLUMN IF NOT EXISTS is_paid TINYINT(1) DEFAULT 0;

-- 3. Add missing columns to activities table
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS title_ar VARCHAR(255),
ADD COLUMN IF NOT EXISTS description_ar TEXT,
ADD COLUMN IF NOT EXISTS location_ar VARCHAR(255),
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME,
ADD COLUMN IF NOT EXISTS registration_required TINYINT(1) DEFAULT 1;

-- 4. Add token column to user_sessions table (if exists)
-- First check if table exists, skip if not
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables 
    WHERE table_schema = 'yemen_union_db' AND table_name = 'user_sessions');

SET @sql_add_token = IF(@table_exists > 0,
    'ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS token VARCHAR(500) UNIQUE',
    'SELECT "user_sessions table not found, skipping token column" AS info');

PREPARE stmt FROM @sql_add_token;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. Create payment_proofs table
CREATE TABLE IF NOT EXISTS payment_proofs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    membership_id INT NOT NULL,
    user_id INT NOT NULL,
    proof_image_url VARCHAR(500) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    notes TEXT,
    rejection_reason TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INT NULL,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (membership_id) REFERENCES memberships(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_membership (membership_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_uploaded_at (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    attachment_url VARCHAR(500),
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    assigned_to INT NULL,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_ticket_number (ticket_number),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Create support_ticket_replies table
CREATE TABLE IF NOT EXISTS support_ticket_replies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    attachment_url VARCHAR(500),
    is_admin_reply TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_ticket (ticket_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500),
    is_read TINYINT(1) DEFAULT 0,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt VARCHAR(500),
    category ENUM('announcement', 'event', 'financial_alert', 'general') DEFAULT 'general',
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    author_id INT NOT NULL,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_published_at (published_at),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Create post_reads table
CREATE TABLE IF NOT EXISTS post_reads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_post_read (post_id, user_id),
    INDEX idx_post (post_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Create faqs table
CREATE TABLE IF NOT EXISTS faqs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    category ENUM('subscription', 'activities', 'profile', 'general') DEFAULT 'general',
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_is_active (is_active),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- End of Migration
-- ================================================
