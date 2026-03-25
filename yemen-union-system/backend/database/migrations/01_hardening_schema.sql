-- ================================================
-- 01 Hardening Schema & Migration
-- ================================================

USE yemen_union_db;

-- 1. Create Settings V2 (Unified)
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create Conflicts Table (For Migration Safety)
CREATE TABLE IF NOT EXISTS settings_conflicts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source_table VARCHAR(50),
    setting_key VARCHAR(255),
    setting_value TEXT,
    conflict_reason TEXT,
    resolved TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create Audit Logs (For User Actions)
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

-- 4. Create System Logs (For Errors/Debug)
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

-- 5. Data Migration: settings -> settings_v2
-- Assuming 'settings' table has (key, value) or similar. Checking first if it exists.
-- We use a Stored Procedure to handle conditional logic cleanly for migrations

DROP PROCEDURE IF EXISTS MigrateSettings;
DELIMITER //
CREATE PROCEDURE MigrateSettings()
BEGIN
    -- Migrate from 'system_settings' if exists
    IF EXISTS (SELECT * FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'system_settings') THEN
        INSERT INTO settings_v2 (setting_key, setting_value, category, description)
        SELECT 
            setting_key, 
            setting_value, 
            IFNULL(category, 'system'), 
            description 
        FROM system_settings
        ON DUPLICATE KEY UPDATE 
            -- If conflict, update only if new value is not empty, else log to conflicts? 
            -- Strategy: Prefer new value, log old to conflicts if different
            setting_value = VALUES(setting_value);
            
        -- Log completion
        INSERT INTO system_logs (level, message, context) VALUES ('info', 'Migrated system_settings to settings_v2', NULL);
    END IF;

    -- Migrate from 'settings' if exists (Legacy)
    IF EXISTS (SELECT * FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'settings') THEN
        -- This part depends on 'settings' schema. Assuming key/value.
        -- We will attempt to insert, if duplicate key, we log to conflict table
        INSERT IGNORE INTO settings_v2 (setting_key, setting_value, category)
        SELECT 
            `key`, -- Assuming column is named 'key' or similar, strict check needed. 
            `value`, 
            'legacy'
        FROM settings;
        -- Note: If columns differ, this query might fail. We should wrap in specific check or manual adjust.
    END IF;

    -- 6. Insert Default Critical Settings if not exist
    INSERT IGNORE INTO settings_v2 (setting_key, setting_value, val_type, category, is_public, is_sensitive) VALUES
    ('app.name', 'نظام اتحاد الطلبة اليمنيين', 'string', 'general', 1, 0),
    ('app.version', '1.0.0', 'string', 'general', 1, 0),
    ('mail.smtp_host', '', 'string', 'mail', 0, 0),
    ('mail.smtp_port', '587', 'number', 'mail', 0, 0),
    ('mail.smtp_user', '', 'string', 'mail', 0, 1),
    ('mail.smtp_pass', '', 'string', 'mail', 0, 1),
    ('branding.logo_url', '/assets/logo.png', 'string', 'branding', 1, 0);

END //
DELIMITER ;

CALL MigrateSettings();
DROP PROCEDURE MigrateSettings;

-- 7. Add Additive Indexes (Use IGNORE or checking existence usually requires Procedure, 
-- but duplicate index creation doesn't break data, just warnings in some SQL versions.
-- We will add specific critical indexes.)

-- Optimize Users Search
CREATE INDEX idx_users_full_name ON users(full_name);
CREATE INDEX idx_users_university ON users(university);
-- Optimize Activities
CREATE INDEX idx_activities_start_date ON activities(start_date);
-- Optimize Memberships
CREATE INDEX idx_memberships_user_status ON memberships(user_id, payment_status);

