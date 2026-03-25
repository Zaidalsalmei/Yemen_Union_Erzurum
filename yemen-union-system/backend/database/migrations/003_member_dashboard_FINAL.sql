-- ================================================
-- Migration: Member Dashboard Tables & Columns (FIXED)
-- Created: 2025-12-14
-- Description: Add missing tables and columns with correct data types (BIGINT)
-- ================================================

USE yemen_union_db;

-- 1. Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS member_id VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS branch VARCHAR(100) DEFAULT 'أرضروم – تركيا',
ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

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

-- 4. Create payment_proofs table
CREATE TABLE IF NOT EXISTS payment_proofs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    membership_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    proof_image_url VARCHAR(500) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    notes TEXT,
    rejection_reason TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by BIGINT NULL,
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

-- 5. Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    attachment_url VARCHAR(500),
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    assigned_to BIGINT NULL,
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

-- 6. Create support_ticket_replies table
CREATE TABLE IF NOT EXISTS support_ticket_replies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    attachment_url VARCHAR(500),
    is_admin_reply TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_ticket (ticket_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt VARCHAR(500),
    category ENUM('announcement', 'event', 'financial_alert', 'general') DEFAULT 'general',
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    author_id BIGINT NOT NULL,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_published_at (published_at),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Create post_reads table
CREATE TABLE IF NOT EXISTS post_reads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_post_read (post_id, user_id),
    INDEX idx_post (post_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Create faqs table
CREATE TABLE IF NOT EXISTS faqs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
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
