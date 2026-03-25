<?php
function loadEnv($path) {
    if (!file_exists($path)) return false;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
    return true;
}

loadEnv(__DIR__ . '/../../.env');

$host = $_ENV['DB_HOST'] ?? 'localhost';
$port = $_ENV['DB_PORT'] ?? '3306';
$dbname = $_ENV['DB_DATABASE'] ?? 'yemen_union_db';
$user = $_ENV['DB_USERNAME'] ?? 'root';
$pass = $_ENV['DB_PASSWORD'] ?? '';

try {
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
    $db = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => 1
    ]);

    // Function to check if a column exists
    function columnExists($db, $table, $column, $dbname) {
        $stmt = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?");
        $stmt->execute([$dbname, $table, $column]);
        return $stmt->fetchColumn() > 0;
    }

    echo "Starting migration...\n";
    $db->exec("SET NAMES utf8mb4; SET FOREIGN_KEY_CHECKS = 0;");

    // ==========================================
    // الخطوة 1: تحديث هيكل جدول roles
    // ==========================================
    echo "Updating roles table...\n";
    if (!columnExists($db, 'roles', 'display_name_ar', $dbname)) {
        $db->exec("ALTER TABLE `roles` ADD COLUMN `display_name_ar` VARCHAR(100) NULL AFTER `display_name`");
    }
    if (!columnExists($db, 'roles', 'level', $dbname)) {
        $db->exec("ALTER TABLE `roles` ADD COLUMN `level` TINYINT UNSIGNED DEFAULT 1 AFTER `description`");
    }
    if (!columnExists($db, 'roles', 'is_system', $dbname)) {
        $db->exec("ALTER TABLE `roles` ADD COLUMN `is_system` TINYINT(1) DEFAULT 0 AFTER `level`");
    }

    // ==========================================
    // الخطوة 2: تحديث هيكل جدول permissions
    // ==========================================
    echo "Updating permissions table...\n";
    if (!columnExists($db, 'permissions', 'display_name_ar', $dbname)) {
        $db->exec("ALTER TABLE `permissions` ADD COLUMN `display_name_ar` VARCHAR(150) NULL AFTER `display_name`");
    }
    if (!columnExists($db, 'permissions', 'module', $dbname)) {
        $db->exec("ALTER TABLE `permissions` ADD COLUMN `module` VARCHAR(50) NULL AFTER `category`");
    }

    // ==========================================
    // الخطوة 3: تحديث هيكل جدول user_roles
    // ==========================================
    echo "Updating user_roles table...\n";
    if (!columnExists($db, 'user_roles', 'assigned_by', $dbname)) {
        $db->exec("ALTER TABLE `user_roles` ADD COLUMN `assigned_by` INT NULL AFTER `role_id`");
    }
    if (!columnExists($db, 'user_roles', 'is_active', $dbname)) {
        $db->exec("ALTER TABLE `user_roles` ADD COLUMN `is_active` TINYINT(1) DEFAULT 1 AFTER `granted_at`");
    }

    // ==========================================
    // الخطوة 4: تحديث هيكل جدول sessions
    // ==========================================
    echo "Updating sessions table...\n";
    if (!columnExists($db, 'sessions', 'is_revoked', $dbname)) {
        $db->exec("ALTER TABLE `sessions` ADD COLUMN `is_revoked` TINYINT(1) DEFAULT 0 AFTER `revoked_at`");
    }
    if (!columnExists($db, 'sessions', 'device_type', $dbname)) {
        $db->exec("ALTER TABLE `sessions` ADD COLUMN `device_type` VARCHAR(50) NULL AFTER `user_agent`");
    }
    if (!columnExists($db, 'sessions', 'last_activity_at', $dbname)) {
        $db->exec("ALTER TABLE `sessions` ADD COLUMN `last_activity_at` TIMESTAMP NULL AFTER `expires_at`");
    }

    // ==========================================
    // الخطوة 5-7: إنشاء الجداول الجديدة
    // ==========================================
    echo "Creating new tables (audit_logs, financial_transactions, refresh_tokens)...\n";
    $db->exec("
        CREATE TABLE IF NOT EXISTS `audit_logs` (
            `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            `user_id` INT NULL,
            `action` VARCHAR(100) NOT NULL,
            `table_name` VARCHAR(100) NULL,
            `record_id` INT NULL,
            `old_data` JSON NULL,
            `new_data` JSON NULL,
            `ip_address` VARCHAR(45) NULL,
            `user_agent` VARCHAR(500) NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_audit_user` (`user_id`),
            KEY `idx_audit_action` (`action`),
            KEY `idx_audit_table` (`table_name`, `record_id`),
            KEY `idx_audit_created` (`created_at`),
            CONSTRAINT `audit_logs_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    $db->exec("
        CREATE TABLE IF NOT EXISTS `financial_transactions` (
            `id` INT NOT NULL AUTO_INCREMENT,
            `type` ENUM('income', 'expense') NOT NULL,
            `category` VARCHAR(100) NULL,
            `amount` DECIMAL(10,2) NOT NULL,
            `description` TEXT NULL,
            `reference_type` VARCHAR(50) NULL,
            `reference_id` INT NULL,
            `payment_method` ENUM('cash', 'bank_transfer', 'online') DEFAULT 'cash',
            `receipt_photo` VARCHAR(500) NULL,
            `recorded_by` INT NULL,
            `approved_by` INT NULL,
            `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
            `transaction_date` DATE NOT NULL,
            `notes` TEXT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_ft_type` (`type`),
            KEY `idx_ft_category` (`category`),
            KEY `idx_ft_status` (`status`),
            KEY `idx_ft_date` (`transaction_date`),
            KEY `idx_ft_reference` (`reference_type`, `reference_id`),
            CONSTRAINT `ft_recorded_by_fk` FOREIGN KEY (`recorded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
            CONSTRAINT `ft_approved_by_fk` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    $db->exec("
        CREATE TABLE IF NOT EXISTS `refresh_tokens` (
            `id` INT NOT NULL AUTO_INCREMENT,
            `user_id` INT NOT NULL,
            `session_id` INT NOT NULL,
            `token_hash` VARCHAR(255) NOT NULL,
            `expires_at` TIMESTAMP NOT NULL,
            `is_revoked` TINYINT(1) DEFAULT 0,
            `revoked_at` TIMESTAMP NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `idx_rt_token_hash` (`token_hash`),
            KEY `idx_rt_user` (`user_id`),
            KEY `idx_rt_session` (`session_id`),
            KEY `idx_rt_expires` (`expires_at`),
            CONSTRAINT `rt_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
            CONSTRAINT `rt_session_fk` FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // ==========================================
    // الخطوة 8-11: إدخال البيانات
    // ==========================================
    echo "Seeding data...\n";
    $db->beginTransaction();

    $db->exec("DELETE FROM `role_permissions`");
    $db->exec("DELETE FROM `user_roles`");
    $db->exec("DELETE FROM `permissions`");
    $db->exec("DELETE FROM `roles`");

    $db->exec("
        INSERT INTO `roles` (`id`, `name`, `display_name`, `display_name_ar`, `description`, `level`, `is_system`, `created_at`) VALUES
        (1, 'president',              'President',              'رئيس الاتحاد',    'المسؤول الأعلى عن الاتحاد - صلاحيات كاملة',                    10, 1, NOW()),
        (2, 'vice_president',         'Vice President',         'نائب الرئيس',     'نائب رئيس الاتحاد - صلاحيات شبه كاملة',                       9,  1, NOW()),
        (3, 'secretary',              'Secretary',              'السكرتير',        'سكرتير الاتحاد - التوثيق وإدارة العضويات',                     8,  1, NOW()),
        (4, 'activities_coordinator', 'Activities Coordinator', 'منسق الأنشطة',    'مسؤول تنظيم الأنشطة والفعاليات',                              7,  0, NOW()),
        (5, 'finance_manager',        'Finance Manager',        'مسؤول المالية',   'مسؤول الحسابات والاشتراكات والميزانية',                        7,  0, NOW()),
        (6, 'media_manager',          'Media Manager',          'مسؤول الإعلام',   'مسؤول المنشورات والإعلانات والهوية البصرية',                    7,  0, NOW()),
        (7, 'academic_coordinator',   'Academic Coordinator',   'منسق أكاديمي',    'مسؤول الشؤون الأكاديمية والتواصل مع الجامعات',                  7,  0, NOW()),
        (8, 'relations_coordinator',  'Relations Coordinator',  'منسق العلاقات',   'مسؤول العلاقات الخارجية والرعاة',                              7,  0, NOW()),
        (9, 'member',                 'Member',                 'عضو',            'عضو عادي في الاتحاد',                                        1,  1, NOW());
    ");

    $db->exec("
        INSERT INTO `permissions` (`id`, `name`, `display_name`, `display_name_ar`, `description`, `category`, `module`) VALUES
        (1,  'users.view_all',        'View All Users',         'عرض جميع الأعضاء',       'عرض قائمة كل الأعضاء',                'users',         'users'),
        (2,  'users.view_own',        'View Own Profile',       'عرض ملفي الشخصي',        'عرض بياناتي فقط',                    'users',         'users'),
        (3,  'users.create',          'Create User',            'إضافة عضو جديد',         'إنشاء حساب عضو جديد',                'users',         'users'),
        (4,  'users.update_all',      'Update Any User',        'تعديل أي عضو',           'تعديل بيانات أي عضو',                'users',         'users'),
        (5,  'users.update_own',      'Update Own Profile',     'تعديل ملفي',             'تعديل بياناتي فقط',                  'users',         'users'),
        (6,  'users.delete',          'Delete User',            'حذف عضو',               'حذف حساب عضو نهائياً',               'users',         'users'),
        (7,  'users.verify',          'Verify User',            'تفعيل عضو',             'تفعيل حساب عضو جديد',               'users',         'users'),
        (8,  'users.ban',             'Ban User',               'حظر عضو',               'حظر أو تعليق حساب عضو',             'users',         'users'),
        (9,  'activities.view',               'View Activities',         'عرض الأنشطة',            'عرض قائمة الأنشطة',                  'activities',    'activities'),
        (10, 'activities.create',             'Create Activity',         'إنشاء نشاط',             'إنشاء نشاط جديد',                    'activities',    'activities'),
        (11, 'activities.update',             'Update Activity',         'تعديل نشاط',             'تعديل تفاصيل نشاط',                  'activities',    'activities'),
        (12, 'activities.delete',             'Delete Activity',         'حذف نشاط',              'حذف نشاط نهائياً',                   'activities',    'activities'),
        (13, 'activities.publish',            'Publish Activity',        'نشر نشاط',              'نشر نشاط للأعضاء',                   'activities',    'activities'),
        (14, 'activities.manage_participants','Manage Participants',     'إدارة المشاركين',        'إضافة أو إزالة مشاركين',             'activities',    'activities'),
        (15, 'activities.checkin',            'Check-in Participants',   'تسجيل حضور',            'تسجيل حضور المشاركين',               'activities',    'activities'),
        (16, 'activities.join',               'Join Activity',           'المشاركة في نشاط',       'التسجيل كمشارك',                     'activities',    'activities'),
        (17, 'finance.view',          'View Finance',           'عرض المالية',            'عرض المعاملات المالية',               'finance',       'finance'),
        (18, 'finance.create',        'Create Transaction',     'إضافة معاملة مالية',     'تسجيل إيراد أو مصروف',               'finance',       'finance'),
        (19, 'finance.update',        'Update Transaction',     'تعديل معاملة مالية',     'تعديل معاملة مالية',                  'finance',       'finance'),
        (20, 'finance.delete',        'Delete Transaction',     'حذف معاملة مالية',      'حذف معاملة مالية',                    'finance',       'finance'),
        (21, 'finance.approve',       'Approve Transaction',    'اعتماد معاملة مالية',    'الموافقة على معاملة',                 'finance',       'finance'),
        (22, 'finance.reports',       'Finance Reports',        'تقارير مالية',           'عرض التقارير المالية',                'finance',       'finance'),
        (23, 'memberships.view_all',  'View All Memberships',   'عرض كل الاشتراكات',      'عرض اشتراكات كل الأعضاء',            'memberships',   'memberships'),
        (24, 'memberships.view_own',  'View Own Membership',    'عرض اشتراكي',            'عرض حالة اشتراكي',                   'memberships',   'memberships'),
        (25, 'memberships.create',    'Create Membership',      'إنشاء اشتراك',           'تسجيل اشتراك جديد',                  'memberships',   'memberships'),
        (26, 'memberships.update',    'Update Membership',      'تعديل اشتراك',           'تعديل حالة اشتراك',                  'memberships',   'memberships'),
        (27, 'posts.view',            'View Posts',             'عرض المنشورات',          'عرض المنشورات',                       'posts',         'posts'),
        (28, 'posts.create',          'Create Post',            'إنشاء منشور',            'كتابة منشور جديد',                   'posts',         'posts'),
        (29, 'posts.update',          'Update Post',            'تعديل منشور',            'تعديل منشور',                        'posts',         'posts'),
        (30, 'posts.delete',          'Delete Post',            'حذف منشور',             'حذف منشور',                          'posts',         'posts'),
        (31, 'posts.publish',         'Publish Post',           'نشر منشور',             'نشر منشور للأعضاء',                  'posts',         'posts'),
        (32, 'sponsors.view',         'View Sponsors',          'عرض الجهات الداعمة',      'عرض قائمة الرعاة',                   'sponsors',      'sponsors'),
        (33, 'sponsors.create',       'Create Sponsor',         'إضافة جهة داعمة',        'إضافة راعي جديد',                    'sponsors',      'sponsors'),
        (34, 'sponsors.update',       'Update Sponsor',         'تعديل جهة داعمة',        'تعديل بيانات راعي',                  'sponsors',      'sponsors'),
        (35, 'sponsors.delete',       'Delete Sponsor',         'حذف جهة داعمة',         'حذف راعي نهائياً',                   'sponsors',      'sponsors'),
        (36, 'sponsorships.view',     'View Sponsorships',      'عرض الرعايات',           'عرض قائمة الرعايات',                 'sponsorships',  'sponsorships'),
        (37, 'sponsorships.create',   'Create Sponsorship',     'إنشاء رعاية',            'ربط رعاية بنشاط',                    'sponsorships',  'sponsorships'),
        (38, 'academic.view',         'View Academic',          'عرض الموارد الأكاديمية',   'عرض المحتوى الأكاديمي',              'academic',      'academic'),
        (39, 'academic.create',       'Create Academic',        'إضافة مورد أكاديمي',      'رفع محتوى أكاديمي',                  'academic',      'academic'),
        (40, 'academic.update',       'Update Academic',        'تعديل مورد أكاديمي',      'تعديل محتوى أكاديمي',                'academic',      'academic'),
        (41, 'academic.delete',       'Delete Academic',        'حذف مورد أكاديمي',       'حذف محتوى أكاديمي',                  'academic',      'academic'),
        (42, 'notifications.view_own','View Own Notifications', 'عرض إشعاراتي',           'عرض إشعاراتي',                       'notifications', 'notifications'),
        (43, 'notifications.send',    'Send Notification',      'إرسال إشعار',            'إرسال إشعار لأعضاء محددين',          'notifications', 'notifications'),
        (44, 'notifications.send_all','Send To All',            'إرسال إشعار للجميع',      'إرسال إشعار جماعي',                  'notifications', 'notifications'),
        (45, 'support.view_all',      'View All Tickets',       'عرض كل التذاكر',         'عرض كل تذاكر الدعم',                 'support',       'support'),
        (46, 'support.view_own',      'View Own Tickets',       'عرض تذاكري',            'عرض تذاكري فقط',                     'support',       'support'),
        (47, 'support.create',        'Create Ticket',          'إنشاء تذكرة',            'فتح تذكرة دعم جديدة',                'support',       'support'),
        (48, 'support.respond',       'Respond To Ticket',      'الرد على تذكرة',         'الرد على تذكرة دعم',                 'support',       'support'),
        (49, 'support.close',         'Close Ticket',           'إغلاق تذكرة',           'إغلاق تذكرة دعم',                    'support',       'support'),
        (50, 'settings.view',         'View Settings',          'عرض الإعدادات',          'عرض إعدادات النظام',                 'settings',      'settings'),
        (51, 'settings.update',       'Update Settings',        'تعديل الإعدادات',        'تعديل إعدادات النظام',               'settings',      'settings'),
        (52, 'settings.branding',     'Manage Branding',        'تعديل الهوية البصرية',    'تعديل الشعار والألوان',              'settings',      'settings'),
        (53, 'roles.view',            'View Roles',             'عرض الأدوار',            'عرض قائمة الأدوار',                  'roles',         'roles'),
        (54, 'roles.manage',          'Manage Roles',           'إدارة الأدوار',          'إنشاء وتعديل وحذف الأدوار',          'roles',         'roles'),
        (55, 'permissions.manage',    'Manage Permissions',     'إدارة الصلاحيات',        'تعيين وإزالة صلاحيات',               'roles',         'roles'),
        (56, 'reports.members',       'Members Report',         'تقارير الأعضاء',         'تقارير بيانات الأعضاء',              'reports',       'reports'),
        (57, 'reports.activities',    'Activities Report',      'تقارير الأنشطة',         'تقارير الأنشطة والحضور',             'reports',       'reports'),
        (58, 'reports.finance',       'Finance Report',         'تقارير مالية',           'التقارير المالية المفصلة',            'reports',       'reports'),
        (59, 'reports.memberships',   'Memberships Report',     'تقارير الاشتراكات',      'تقارير الاشتراكات والدفعات',         'reports',       'reports'),
        (60, 'calendar.view',         'View Calendar',          'عرض التقويم',            'عرض تقويم الأنشطة',                  'calendar',      'calendar'),
        (61, 'calendar.manage',       'Manage Calendar',        'إدارة التقويم',          'إضافة وتعديل أحداث',                 'calendar',      'calendar'),
        (62, 'card.view_own',         'View Own Card',          'عرض بطاقتي',            'عرض بطاقة عضويتي',                   'card',          'card'),
        (63, 'card.generate_all',     'Generate All Cards',     'توليد كل البطاقات',      'توليد بطاقات لكل الأعضاء',           'card',          'card'),
        (64, 'dashboard.view_full',   'View Full Dashboard',    'لوحة تحكم كاملة',        'لوحة التحكم بكل الإحصائيات',         'dashboard',     'dashboard'),
        (65, 'dashboard.view_own',    'View Own Dashboard',     'لوحة تحكم شخصية',        'إحصائياتي الشخصية',                  'dashboard',     'dashboard');
    ");

    $db->exec("INSERT INTO `role_permissions` (`role_id`, `permission_id`) SELECT 1, `id` FROM `permissions`;");
    $db->exec("INSERT INTO `role_permissions` (`role_id`, `permission_id`) SELECT 2, `id` FROM `permissions` WHERE `name` NOT IN ('users.delete', 'finance.delete', 'sponsors.delete', 'academic.delete', 'roles.manage', 'permissions.manage', 'settings.update');");
    $db->exec("INSERT INTO `role_permissions` (`role_id`, `permission_id`) SELECT 3, `id` FROM `permissions` WHERE `name` IN ('users.view_all', 'users.view_own', 'users.create', 'users.update_own', 'users.verify', 'activities.view', 'activities.join', 'memberships.view_all', 'memberships.view_own', 'memberships.create', 'posts.view', 'notifications.view_own', 'support.view_all', 'support.view_own', 'support.create', 'support.respond', 'support.close', 'reports.members', 'reports.memberships', 'calendar.view', 'card.view_own', 'card.generate_all', 'dashboard.view_full');");
    $db->exec("INSERT INTO `role_permissions` (`role_id`, `permission_id`) SELECT 4, `id` FROM `permissions` WHERE `name` IN ('users.view_own', 'users.update_own', 'activities.view', 'activities.create', 'activities.update', 'activities.delete', 'activities.publish', 'activities.manage_participants', 'activities.checkin', 'activities.join', 'sponsorships.view', 'posts.view', 'notifications.view_own', 'notifications.send', 'support.view_own', 'support.create', 'reports.activities', 'calendar.view', 'calendar.manage', 'card.view_own', 'dashboard.view_own');");
    $db->exec("INSERT INTO `role_permissions` (`role_id`, `permission_id`) SELECT 5, `id` FROM `permissions` WHERE `name` IN ('users.view_own', 'users.update_own', 'activities.view', 'activities.join', 'finance.view', 'finance.create', 'finance.update', 'finance.reports', 'memberships.view_all', 'memberships.view_own', 'memberships.create', 'memberships.update', 'sponsors.view', 'sponsorships.view', 'posts.view', 'notifications.view_own', 'support.view_own', 'support.create', 'reports.finance', 'reports.memberships', 'calendar.view', 'card.view_own', 'dashboard.view_own');");
    $db->exec("INSERT INTO `role_permissions` (`role_id`, `permission_id`) SELECT 6, `id` FROM `permissions` WHERE `name` IN ('users.view_own', 'users.update_own', 'activities.view', 'activities.join', 'posts.view', 'posts.create', 'posts.update', 'posts.delete', 'posts.publish', 'settings.branding', 'notifications.view_own', 'notifications.send', 'notifications.send_all', 'support.view_own', 'support.create', 'calendar.view', 'card.view_own', 'dashboard.view_own');");
    $db->exec("INSERT INTO `role_permissions` (`role_id`, `permission_id`) SELECT 7, `id` FROM `permissions` WHERE `name` IN ('users.view_all', 'users.view_own', 'users.update_own', 'activities.view', 'activities.create', 'activities.join', 'academic.view', 'academic.create', 'academic.update', 'posts.view', 'notifications.view_own', 'notifications.send', 'support.view_own', 'support.create', 'reports.members', 'calendar.view', 'calendar.manage', 'card.view_own', 'dashboard.view_own');");
    $db->exec("INSERT INTO `role_permissions` (`role_id`, `permission_id`) SELECT 8, `id` FROM `permissions` WHERE `name` IN ('users.view_own', 'users.update_own', 'activities.view', 'activities.create', 'activities.join', 'sponsors.view', 'sponsors.create', 'sponsors.update', 'sponsorships.view', 'sponsorships.create', 'posts.view', 'notifications.view_own', 'support.view_own', 'support.create', 'calendar.view', 'card.view_own', 'dashboard.view_own');");
    $db->exec("INSERT INTO `role_permissions` (`role_id`, `permission_id`) SELECT 9, `id` FROM `permissions` WHERE `name` IN ('users.view_own', 'users.update_own', 'activities.view', 'activities.join', 'memberships.view_own', 'posts.view', 'academic.view', 'notifications.view_own', 'support.view_own', 'support.create', 'calendar.view', 'card.view_own', 'dashboard.view_own');");

    $db->commit();
    echo "Data seeded successfully!\n";

    $db->exec("SET FOREIGN_KEY_CHECKS = 1;");

    // Run the verification query
    $verifyQuery = "
        SELECT
            r.id,
            r.name AS role_name,
            r.display_name_ar,
            r.level,
            COUNT(rp.permission_id) AS total_permissions,
            CONCAT(ROUND(COUNT(rp.permission_id) * 100.0 / 65, 1), '%') AS percentage
        FROM roles r
        LEFT JOIN role_permissions rp ON r.id = rp.role_id
        GROUP BY r.id, r.name, r.display_name_ar, r.level
        ORDER BY r.level DESC, r.id ASC;
    ";

    $stmt = $db->query($verifyQuery);
    $results = $stmt->fetchAll();

    echo "\nVerification Results:\n";
    echo str_pad("ID", 5) . " | " . str_pad("Role Name", 25) . " | " . str_pad("Level", 6) . " | " . str_pad("Perms", 6) . " | " . "Percentage\n";
    echo str_repeat("-", 65) . "\n";

    foreach ($results as $row) {
        echo str_pad($row['id'], 5) . " | " .
             str_pad($row['role_name'], 25) . " | " .
             str_pad($row['level'], 6) . " | " .
             str_pad($row['total_permissions'], 6) . " | " .
             $row['percentage'] . "\n";
    }

} catch (PDOException $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    echo "Error executing migration: " . $e->getMessage() . "\n";
}
