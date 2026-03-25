-- ================================================
-- جدول سجل النظام - System Logs
-- Yemen Student Union System - Error Logging Table
-- ================================================
-- Migration: 004_create_system_logs_table.sql
-- Date: 2025-12-14
-- Purpose: Centralized error and activity logging

CREATE TABLE IF NOT EXISTS system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_name VARCHAR(255) NOT NULL COMMENT 'The page or endpoint where the event occurred',
    action VARCHAR(100) NOT NULL COMMENT 'The action being performed (e.g., create, update, delete, login)',
    error_type ENUM('info', 'warning', 'error', 'critical') DEFAULT 'info' COMMENT 'Severity level of the log entry',
    message TEXT NOT NULL COMMENT 'Detailed description of the event or error',
    user_id INT NULL COMMENT 'ID of the user who triggered the event (NULL for anonymous actions)',
    ip_address VARCHAR(45) NULL COMMENT 'IP address of the client',
    user_agent TEXT NULL COMMENT 'Browser/client information',
    request_data JSON NULL COMMENT 'Request payload if relevant (sanitized)',
    stack_trace TEXT NULL COMMENT 'Stack trace for errors',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for efficient querying
    INDEX idx_page (page_name),
    INDEX idx_action (action),
    INDEX idx_error_type (error_type),
    INDEX idx_user (user_id),
    INDEX idx_created (created_at),
    
    -- Foreign key (optional - allows NULL for anonymous logs)
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Centralized system logging table for auditing and error tracking';

-- ================================================
-- End of Migration
-- ================================================
