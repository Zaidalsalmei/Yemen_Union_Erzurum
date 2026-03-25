-- ================================================
-- New Database Structures (Hardening Phase)
-- ================================================

USE yemen_union_db;

-- 1. Unified Settings Table (settings_v2)
-- Replaces old 'settings' and 'system_settings' for better organization
CREATE TABLE IF NOT EXISTS settings_v2 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    val_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    category VARCHAR(50) DEFAULT 'general',
    is_public TINYINT(1) DEFAULT 0,
    is_sensitive TINYINT(1) DEFAULT 0,
    is_editable TINYINT(1) DEFAULT 1,
    description TEXT,
    updated_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Settings Conflicts Table
-- Used during migration to store any conflicting keys safely
CREATE TABLE IF NOT EXISTS settings_conflicts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source_table VARCHAR(50),
    setting_key VARCHAR(255),
    setting_value TEXT,
    conflict_reason TEXT,
    resolved TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Audit Logs Table
-- Tracks who did what (Security & Accountability)
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100) NULL,
    resource_id VARCHAR(100) NULL,
    old_values TEXT NULL,
    new_values TEXT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_action (user_id, action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. System Logs Table
-- Tracks application errors and system events
CREATE TABLE IF NOT EXISTS system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    level VARCHAR(20) DEFAULT 'info', -- info, warning, error, critical
    message TEXT NOT NULL,
    context JSON NULL,
    trace TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_level (level),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Performance Indexes (Safe to run if not exists)
-- Note: MySQL 5.7+ doesn't support "IF NOT EXISTS" for indexes easily in simple CREATE syntax.
-- These commands might fail if index exists, but standard CREATE INDEX is safe to re-run in many tools (ignores or errors harmlessly).

-- Users Search Optimization
CREATE INDEX idx_users_full_name ON users(full_name);
CREATE INDEX idx_users_university ON users(university);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Activities Sorting
CREATE INDEX idx_activities_start_date ON activities(start_date);

-- Membership Filtering
CREATE INDEX idx_memberships_user_status ON memberships(user_id, payment_status);

-- 6. Insert Default Critical Settings
INSERT IGNORE INTO settings_v2 (setting_key, setting_value, val_type, category, is_public, is_sensitive) VALUES
('app.name', 'نظام اتحاد الطلبة اليمنيين', 'string', 'general', 1, 0),
('app.description', 'بوابة الخدمات الطلابية', 'string', 'general', 1, 0),
('app.version', '1.0.0', 'string', 'general', 1, 0),
('mail.smtp_host', 'smtp.gmail.com', 'string', 'mail', 0, 0),
('mail.smtp_port', '587', 'number', 'mail', 0, 0),
('mail.smtp_user', '', 'string', 'mail', 0, 1),
('mail.smtp_pass', '', 'string', 'mail', 0, 1),
('branding.logo_url', '/assets/logo.png', 'string', 'branding', 1, 0),
('branding.watermark_enabled', '1', 'boolean', 'branding', 1, 0);

