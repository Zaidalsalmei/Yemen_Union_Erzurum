-- =====================================================
-- Yemen Student Union Database Schema
-- Enhanced Enterprise-Grade Design
-- Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- =====================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS yemen_union_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE yemen_union_db;

-- =====================================================
-- 1. CORE AUTHENTICATION & AUTHORIZATION
-- =====================================================

-- Roles Table
CREATE TABLE roles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL COMMENT 'Internal: president, finance_manager',
    display_name_ar VARCHAR(100) NOT NULL COMMENT 'Arabic: الرئيس',
    description_ar TEXT NULL,
    parent_role_id INT UNSIGNED NULL COMMENT 'For role inheritance',
    level INT UNSIGNED DEFAULT 0 COMMENT 'Hierarchy level: 0=highest',
    is_system_role BOOLEAN DEFAULT FALSE COMMENT 'Cannot be deleted',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_role_id) REFERENCES roles(id) ON DELETE SET NULL,
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Permissions Table
CREATE TABLE permissions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL COMMENT 'users.create, finance.view',
    display_name_ar VARCHAR(150) NOT NULL COMMENT 'Arabic display',
    description_ar TEXT NULL,
    module VARCHAR(50) NOT NULL COMMENT 'users, finance, activities',
    action VARCHAR(50) NOT NULL COMMENT 'create, read, update, delete',
    resource_type VARCHAR(50) NULL COMMENT 'For specific resource permissions',
    is_system_permission BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_module (module),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Role-Permission Pivot Table
CREATE TABLE role_permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_id INT UNSIGNED NOT NULL,
    permission_id INT UNSIGNED NOT NULL,
    constraints JSON NULL COMMENT 'Additional conditions',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role_id, permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users Table
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL COMMENT 'Arabic full name',
    email VARCHAR(191) UNIQUE NULL COMMENT 'Optional email',
    phone_number VARCHAR(20) UNIQUE NOT NULL COMMENT 'Primary identifier',
    password VARCHAR(255) NULL COMMENT 'Nullable for pending users',
    date_of_birth DATE NULL,
    gender ENUM('male', 'female') NULL,
    nationality VARCHAR(50) DEFAULT 'اليمن' COMMENT 'Arabic',
    passport_number VARCHAR(50) UNIQUE NULL,
    university VARCHAR(150) NULL COMMENT 'Arabic university name',
    faculty VARCHAR(150) NULL COMMENT 'Arabic faculty name',
    study_level ENUM('undergraduate', 'masters', 'phd') NULL,
    enrollment_year YEAR NULL,
    city VARCHAR(100) DEFAULT 'أرضروم' COMMENT 'Arabic city',
    address TEXT NULL COMMENT 'Full address in Arabic',
    status ENUM('pending', 'active', 'suspended', 'banned', 'archived') DEFAULT 'pending',
    email_verified_at TIMESTAMP NULL,
    phone_verified_at TIMESTAMP NULL,
    membership_expiry_date DATE NULL,
    is_founding_member BOOLEAN DEFAULT FALSE,
    profile_photo VARCHAR(255) NULL,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_status (status),
    INDEX idx_phone (phone_number),
    INDEX idx_membership_expiry (membership_expiry_date),
    INDEX idx_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User-Role Pivot Table
CREATE TABLE user_roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    role_id INT UNSIGNED NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL COMMENT 'For temporary roles',
    granted_by BIGINT UNSIGNED NULL COMMENT 'Who assigned this role',
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_role (user_id, role_id),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Sessions Table
CREATE TABLE user_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token_hash VARCHAR(255) UNIQUE NOT NULL COMMENT 'Hashed JWT token',
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    device_type VARCHAR(50) NULL COMMENT 'mobile, desktop, tablet',
    expires_at TIMESTAMP NOT NULL,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token_hash),
    INDEX idx_user_active (user_id, is_revoked),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. FINANCIAL MANAGEMENT
-- =====================================================

-- Membership Packages Table
CREATE TABLE membership_packages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name_ar VARCHAR(100) NOT NULL COMMENT 'Arabic package name',
    duration_months INT NOT NULL COMMENT '3, 6, or 12',
    price DECIMAL(10,2) NOT NULL,
    description_ar TEXT NULL,
    benefits JSON NULL COMMENT 'Array of benefits',
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Memberships Table
CREATE TABLE memberships (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    package_id INT UNSIGNED NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    payment_method ENUM('cash', 'bank_transfer', 'card', 'other') NOT NULL,
    reference_id VARCHAR(30) UNIQUE NOT NULL COMMENT 'YEM-2025-XXXX',
    receipt_number VARCHAR(50) NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('pending', 'active', 'expired', 'cancelled', 'refunded') DEFAULT 'active',
    notes TEXT NULL COMMENT 'Arabic notes',
    approved_by BIGINT UNSIGNED NULL,
    approved_at TIMESTAMP NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES membership_packages(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_reference (reference_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sponsors Table
CREATE TABLE sponsors (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL COMMENT 'Arabic name',
    type ENUM('individual', 'company', 'organization', 'government') DEFAULT 'individual',
    contact_person VARCHAR(150) NULL,
    phone VARCHAR(20) NULL,
    email VARCHAR(191) NULL,
    address TEXT NULL,
    description_ar TEXT NULL,
    logo_url VARCHAR(255) NULL,
    website VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    total_sponsored DECIMAL(12,2) DEFAULT 0.00 COMMENT 'Cached total',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_active (is_active),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sponsorships Table
CREATE TABLE sponsorships (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sponsor_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    purpose_ar VARCHAR(255) NOT NULL COMMENT 'Sponsorship purpose',
    category ENUM('general', 'activity', 'project', 'scholarship', 'emergency') DEFAULT 'general',
    activity_id BIGINT UNSIGNED NULL COMMENT 'If linked to activity',
    reference_id VARCHAR(30) UNIQUE NOT NULL,
    receipt_number VARCHAR(50) NULL,
    received_date DATE NOT NULL,
    status ENUM('pending', 'received', 'allocated', 'refunded') DEFAULT 'received',
    notes TEXT NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (sponsor_id) REFERENCES sponsors(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_sponsor (sponsor_id),
    INDEX idx_status (status),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions Table (General Ledger)
CREATE TABLE transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    type ENUM('membership', 'sponsorship', 'expense', 'refund', 'adjustment') NOT NULL,
    reference_type VARCHAR(50) NULL COMMENT 'memberships, sponsorships',
    reference_id BIGINT UNSIGNED NULL COMMENT 'ID of source record',
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    direction ENUM('debit', 'credit') NOT NULL COMMENT 'debit=income, credit=expense',
    description_ar VARCHAR(255) NOT NULL,
    category VARCHAR(50) NULL COMMENT 'For reporting',
    transaction_date DATE NOT NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_type (type),
    INDEX idx_direction (direction),
    INDEX idx_date (transaction_date),
    INDEX idx_reference (reference_type, reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Expenses Table
CREATE TABLE expenses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title_ar VARCHAR(150) NOT NULL,
    description_ar TEXT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    category VARCHAR(50) NOT NULL COMMENT 'utilities, supplies, events',
    reference_id VARCHAR(30) UNIQUE NOT NULL,
    receipt_number VARCHAR(50) NULL,
    vendor_name VARCHAR(150) NULL,
    expense_date DATE NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'paid') DEFAULT 'pending',
    approved_by BIGINT UNSIGNED NULL,
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT NULL,
    paid_by BIGINT UNSIGNED NULL,
    paid_at TIMESTAMP NULL,
    payment_method ENUM('cash', 'bank_transfer', 'card', 'check') NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (paid_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_date (expense_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. ACTIVITY & EVENT MANAGEMENT
-- =====================================================

-- Activities Table
CREATE TABLE activities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title_ar VARCHAR(200) NOT NULL,
    description_ar TEXT NULL,
    cover_image VARCHAR(255) NULL,
    gallery JSON NULL COMMENT 'Array of image URLs',
    activity_date DATETIME NOT NULL,
    end_date DATETIME NULL COMMENT 'For multi-day events',
    location_ar VARCHAR(200) NULL,
    max_participants INT NULL,
    registration_required BOOLEAN DEFAULT FALSE,
    registration_deadline DATETIME NULL,
    status ENUM('draft', 'published', 'ongoing', 'completed', 'cancelled') DEFAULT 'draft',
    visibility ENUM('public', 'members_only', 'invited_only') DEFAULT 'members_only',
    has_fee BOOLEAN DEFAULT FALSE,
    fee_amount DECIMAL(8,2) NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_date (activity_date),
    INDEX idx_visibility (visibility)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Participants Table
CREATE TABLE activity_participants (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    activity_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('registered', 'confirmed', 'attended', 'cancelled', 'no_show') DEFAULT 'registered',
    payment_status ENUM('pending', 'paid', 'refunded') NULL,
    payment_reference VARCHAR(50) NULL,
    attended_at TIMESTAMP NULL,
    checked_in_by BIGINT UNSIGNED NULL,
    notes TEXT NULL,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (checked_in_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_participant (activity_id, user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. COMMUNICATION & NOTIFICATIONS
-- =====================================================

-- Notifications Table
CREATE TABLE notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL COMMENT 'NULL for broadcast',
    title_ar VARCHAR(150) NOT NULL,
    message_ar TEXT NOT NULL,
    type VARCHAR(50) NOT NULL COMMENT 'membership_expiry, activity_reminder',
    action_url VARCHAR(255) NULL COMMENT 'Deep link',
    action_label_ar VARCHAR(50) NULL,
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    data JSON NULL COMMENT 'Additional context',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Announcements Table
CREATE TABLE announcements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title_ar VARCHAR(200) NOT NULL,
    content_ar TEXT NOT NULL,
    target_audience ENUM('all', 'members', 'admins', 'specific_roles') DEFAULT 'all',
    target_roles JSON NULL COMMENT 'Array of role IDs',
    priority ENUM('low', 'normal', 'high') DEFAULT 'normal',
    is_pinned BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_published (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. FILE & MEDIA MANAGEMENT
-- =====================================================

-- Attachments Table
CREATE TABLE attachments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT UNSIGNED NOT NULL COMMENT 'Bytes',
    mime_type VARCHAR(100) NOT NULL,
    file_extension VARCHAR(10) NOT NULL,
    attachable_type VARCHAR(50) NOT NULL COMMENT 'users, activities, expenses',
    attachable_id BIGINT UNSIGNED NOT NULL,
    type VARCHAR(50) DEFAULT 'document' COMMENT 'document, image, receipt',
    uploaded_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    INDEX idx_attachable (attachable_type, attachable_id),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. AUDIT & LOGGING
-- =====================================================

-- Audit Logs Table
CREATE TABLE audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL COMMENT 'NULL for system actions',
    user_name VARCHAR(150) NULL COMMENT 'Cached for deleted users',
    action VARCHAR(100) NOT NULL COMMENT 'created, updated, deleted',
    entity_type VARCHAR(50) NOT NULL COMMENT 'users, memberships, expenses',
    entity_id BIGINT UNSIGNED NOT NULL,
    old_values JSON NULL COMMENT 'Before state',
    new_values JSON NULL COMMENT 'After state',
    description_ar TEXT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. SYSTEM CONFIGURATION
-- =====================================================

-- Settings Table
CREATE TABLE settings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL COMMENT 'app.name, finance.currency',
    setting_value TEXT NOT NULL,
    category VARCHAR(50) NOT NULL COMMENT 'general, finance, notification',
    data_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    label_ar VARCHAR(150) NOT NULL,
    description_ar TEXT NULL,
    is_public BOOLEAN DEFAULT FALSE COMMENT 'Accessible to frontend',
    is_editable BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert Essential Roles
INSERT INTO roles (name, display_name_ar, description_ar, level, is_system_role) VALUES
('president', 'الرئيس', 'رئيس الاتحاد - صلاحيات كاملة على النظام', 0, TRUE),
('vice_president', 'نائب الرئيس', 'نائب رئيس الاتحاد - صلاحيات إدارية واسعة', 1, TRUE),
('finance_manager', 'المسؤول المالي', 'مسؤول عن جميع العمليات المالية', 2, TRUE),
('activities_coordinator', 'منسق الأنشطة', 'مسؤول عن تنظيم وإدارة الأنشطة', 3, TRUE),
('secretary', 'السكرتير', 'مسؤول عن التوثيق والإعلانات', 3, TRUE),
('media_manager', 'مسؤول الإعلام', 'مسؤول عن الإعلام والتواصل', 3, TRUE),
('member', 'عضو', 'عضو عادي في الاتحاد', 4, TRUE);

-- Insert Membership Packages
INSERT INTO membership_packages (name_ar, duration_months, price, description_ar, is_active, display_order) VALUES
('باقة 3 أشهر', 3, 100.00, 'اشتراك لمدة 3 أشهر', TRUE, 1),
('باقة 6 أشهر', 6, 180.00, 'اشتراك لمدة 6 أشهر - خصم 10%', TRUE, 2),
('باقة سنوية', 12, 300.00, 'اشتراك لمدة سنة كاملة - خصم 25%', TRUE, 3);

-- Insert Default Settings
INSERT INTO settings (setting_key, setting_value, category, data_type, label_ar, is_public) VALUES
('app.name', 'اتحاد الطلاب اليمنيين - أرضروم', 'general', 'string', 'اسم التطبيق', TRUE),
('app.logo', '/assets/logo.png', 'general', 'string', 'شعار التطبيق', TRUE),
('finance.currency', 'TRY', 'finance', 'string', 'العملة الافتراضية', TRUE),
('finance.currency_symbol', '₺', 'finance', 'string', 'رمز العملة', TRUE),
('membership.grace_period_days', '30', 'membership', 'number', 'فترة السماح (أيام)', FALSE),
('notification.expiry_reminder_days', '30', 'notification', 'number', 'تذكير انتهاء العضوية (أيام)', FALSE);

-- Insert Permissions
INSERT INTO permissions (name, display_name_ar, module, action) VALUES
-- Users Module
('users.view_all', 'عرض جميع الأعضاء', 'users', 'view'),
('users.view_own', 'عرض الملف الشخصي', 'users', 'view'),
('users.create', 'إضافة عضو جديد', 'users', 'create'),
('users.update_all', 'تعديل بيانات الأعضاء', 'users', 'update'),
('users.update_own', 'تعديل الملف الشخصي', 'users', 'update'),
('users.delete', 'حذف الأعضاء', 'users', 'delete'),
('users.ban', 'حظر/إيقاف الأعضاء', 'users', 'ban'),
('users.verify', 'توثيق الأعضاء', 'users', 'verify'),
('users.export', 'تصدير بيانات الأعضاء', 'users', 'export'),
-- Roles Module
('roles.view', 'عرض الأدوار', 'roles', 'view'),
('roles.assign', 'تعيين الأدوار', 'roles', 'assign'),
('permissions.manage', 'إدارة الصلاحيات', 'permissions', 'manage'),
-- Memberships Module
('memberships.view_all', 'عرض جميع الاشتراكات', 'memberships', 'view'),
('memberships.view_own', 'عرض الاشتراك الشخصي', 'memberships', 'view'),
('memberships.create', 'تسجيل اشتراك جديد', 'memberships', 'create'),
('memberships.update', 'تعديل الاشتراكات', 'memberships', 'update'),
('memberships.approve', 'الموافقة على الاشتراكات', 'memberships', 'approve'),
('memberships.refund', 'استرجاع الاشتراكات', 'memberships', 'refund'),
-- Sponsors Module
('sponsors.view', 'عرض الجهات الداعمة', 'sponsors', 'view'),
('sponsors.create', 'إضافة جهة داعمة', 'sponsors', 'create'),
('sponsors.update', 'تعديل الجهات الداعمة', 'sponsors', 'update'),
('sponsors.delete', 'حذف الجهات الداعمة', 'sponsors', 'delete'),
('sponsorships.create', 'تسجيل رعاية جديدة', 'sponsorships', 'create'),
('sponsorships.view', 'عرض الرعايات', 'sponsorships', 'view'),
-- Expenses Module
('expenses.create', 'تسجيل مصروف', 'expenses', 'create'),
('expenses.view', 'عرض المصروفات', 'expenses', 'view'),
('expenses.approve', 'الموافقة على المصروفات', 'expenses', 'approve'),
('expenses.pay', 'صرف المصروفات', 'expenses', 'pay'),
-- Activities Module
('activities.view_all', 'عرض جميع الأنشطة', 'activities', 'view'),
('activities.view_published', 'عرض الأنشطة المنشورة', 'activities', 'view'),
('activities.create', 'إنشاء نشاط جديد', 'activities', 'create'),
('activities.update', 'تعديل الأنشطة', 'activities', 'update'),
('activities.delete', 'حذف الأنشطة', 'activities', 'delete'),
('activities.publish', 'نشر الأنشطة', 'activities', 'publish'),
('activities.manage_participants', 'إدارة المشاركين', 'activities', 'manage'),
('activities.checkin', 'تسجيل الحضور', 'activities', 'checkin'),
-- Reports Module
('reports.finance', 'التقارير المالية', 'reports', 'view'),
('reports.membership', 'تقارير العضوية', 'reports', 'view'),
('reports.activities', 'تقارير الأنشطة', 'reports', 'view'),
('reports.audit', 'سجل المراجعة', 'reports', 'view'),
-- Communication Module
('notifications.send', 'إرسال إشعارات', 'notifications', 'send'),
('announcements.create', 'إنشاء إعلان', 'announcements', 'create'),
('announcements.manage', 'إدارة الإعلانات', 'announcements', 'manage'),
-- Settings Module
('settings.view', 'عرض الإعدادات', 'settings', 'view'),
('settings.update', 'تعديل الإعدادات', 'settings', 'update'),
('attachments.upload', 'رفع الملفات', 'attachments', 'upload'),
('attachments.delete', 'حذف الملفات', 'attachments', 'delete');

-- Assign ALL permissions to President (role_id = 1)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- Assign permissions to Member (role_id = 7)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 7, id FROM permissions WHERE name IN ('users.view_own', 'users.update_own', 'memberships.view_own', 'activities.view_published');

-- Assign permissions to Finance Manager (role_id = 3)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE module IN ('memberships', 'sponsors', 'sponsorships', 'expenses', 'reports') OR name = 'users.view_all';

-- Create initial President user (password: Admin@123)
INSERT INTO users (full_name, phone_number, password, status, created_at) VALUES
('مدير النظام', '05001234567', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.OXB3Fq.VpVEVtq', 'active', NOW());

-- Assign President role to initial user
INSERT INTO user_roles (user_id, role_id, granted_at) VALUES
(1, 1, NOW());

-- =====================================================
-- 10. SYSTEM SETTINGS (Key-Value Store)
-- =====================================================
CREATE TABLE IF NOT EXISTS system_settings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL COMMENT 'Unique key: union_name, timezone, etc.',
    setting_value TEXT NULL COMMENT 'Setting value as string',
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    category VARCHAR(50) DEFAULT 'general' COMMENT 'branding, system, notifications',
    description_ar VARCHAR(255) NULL COMMENT 'Arabic description',
    is_editable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 11. USER PERMISSION OVERRIDES
-- =====================================================
CREATE TABLE IF NOT EXISTS user_permission_overrides (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    permission_id INT UNSIGNED NOT NULL,
    is_granted BOOLEAN DEFAULT TRUE COMMENT 'TRUE=grant, FALSE=revoke',
    granted_by BIGINT UNSIGNED NULL COMMENT 'Admin who set override',
    reason TEXT NULL COMMENT 'Optional reason for override',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_permission (user_id, permission_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 12. DEFAULT SYSTEM SETTINGS DATA
-- =====================================================
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description_ar) VALUES
-- Branding Settings
('union_name_ar', 'اتحاد الطلاب اليمنيين', 'string', 'branding', 'اسم الاتحاد بالعربية'),
('union_name_en', 'Yemeni Students Union', 'string', 'branding', 'اسم الاتحاد بالإنجليزية'),
('logo_path', NULL, 'string', 'branding', 'مسار شعار الاتحاد'),
('primary_color', '#DC2626', 'string', 'branding', 'اللون الأساسي'),
('accent_color', '#F59E0B', 'string', 'branding', 'اللون الثانوي'),
('sidebar_color', '#1F2937', 'string', 'branding', 'لون الشريط الجانبي'),
('sidebar_text_color', '#FFFFFF', 'string', 'branding', 'لون نص الشريط الجانبي'),
('watermark_enabled', 'true', 'boolean', 'branding', 'تفعيل العلامة المائية'),
('watermark_opacity', '0.05', 'number', 'branding', 'شفافية العلامة المائية'),
-- System Settings
('default_language', 'ar', 'string', 'system', 'اللغة الافتراضية'),
('timezone', 'Europe/Istanbul', 'string', 'system', 'المنطقة الزمنية'),
('date_format', 'DD/MM/YYYY', 'string', 'system', 'صيغة التاريخ'),
('default_currency', 'TRY', 'string', 'system', 'العملة الافتراضية'),
('max_activities_per_day', '5', 'number', 'system', 'الحد الأقصى للأنشطة اليومية'),
('auto_approve_activities', 'false', 'boolean', 'system', 'الموافقة التلقائية على الأنشطة'),
('membership_duration_months', '12', 'number', 'system', 'مدة العضوية بالأشهر'),
-- Notification Settings
('notify_new_members', 'true', 'boolean', 'notifications', 'إشعار الأعضاء الجدد'),
('notify_subscriptions', 'true', 'boolean', 'notifications', 'إشعار الاشتراكات'),
('notify_expiring_memberships', 'true', 'boolean', 'notifications', 'تذكير انتهاء العضوية'),
('notify_activities', 'true', 'boolean', 'notifications', 'إشعار الأنشطة'),
('email_notifications_enabled', 'false', 'boolean', 'notifications', 'تفعيل إشعارات البريد')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Additional Permissions for Settings Module
INSERT INTO permissions (name, display_name_ar, module, action) VALUES
('settings.branding', 'إدارة العلامة التجارية', 'settings', 'branding'),
('roles.view', 'عرض الأدوار', 'roles', 'view'),
('roles.manage', 'إدارة الأدوار', 'roles', 'manage'),
('permissions.manage', 'إدارة الصلاحيات', 'permissions', 'manage')
ON DUPLICATE KEY UPDATE display_name_ar = VALUES(display_name_ar);
