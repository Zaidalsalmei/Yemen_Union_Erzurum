-- ====================================================
-- POSTS MODULE - DATABASE SCHEMA
-- ====================================================
-- Created: 2025-12-10
-- Description: Complete database structure for Posts Management System
-- ====================================================

-- 1) Main Posts Table
CREATE TABLE IF NOT EXISTS `posts` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `thumbnail` VARCHAR(255) NULL,
  `media_type` ENUM('image','video','youtube','instagram','canva','file') DEFAULT 'image',
  `media_url` VARCHAR(500) NULL,
  `status` ENUM('draft','review','published') DEFAULT 'draft',
  `created_by` BIGINT UNSIGNED NOT NULL,
  `activity_id` BIGINT UNSIGNED NULL,
  `scheduled_at` DATETIME NULL,
  `published_at` DATETIME NULL,
  `is_pinned` TINYINT(1) DEFAULT 0,
  `is_locked` TINYINT(1) DEFAULT 0,
  `views_count` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`),
  INDEX `idx_created_by` (`created_by`),
  INDEX `idx_activity_id` (`activity_id`),
  INDEX `idx_scheduled_at` (`scheduled_at`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2) Post Revisions (Version History)
CREATE TABLE IF NOT EXISTS `post_revisions` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `post_id` BIGINT UNSIGNED NOT NULL,
  `title` TEXT NOT NULL,
  `description` TEXT NULL,
  `media_url` TEXT NULL,
  `edited_by` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_post_id` (`post_id`),
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`edited_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3) Internal Admin Comments
CREATE TABLE IF NOT EXISTS `post_comments_internal` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `post_id` BIGINT UNSIGNED NOT NULL,
  `comment` TEXT NOT NULL,
  `added_by` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_post_id` (`post_id`),
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`added_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4) Media Library
CREATE TABLE IF NOT EXISTS `media_library` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_type` ENUM('image','video','pdf','document') DEFAULT 'image',
  `file_size` BIGINT NULL COMMENT 'Size in bytes',
  `uploaded_by` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_file_type` (`file_type`),
  INDEX `idx_uploaded_by` (`uploaded_by`),
  FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5) Social Media Accounts
CREATE TABLE IF NOT EXISTS `social_accounts` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL UNIQUE,
  `instagram_token` TEXT NULL,
  `instagram_user_id` VARCHAR(100) NULL,
  `whatsapp_number` VARCHAR(20) NULL,
  `canva_connected` TINYINT(1) DEFAULT 0,
  `canva_api_key` TEXT NULL,
  `youtube_connected` TINYINT(1) DEFAULT 0,
  `youtube_channel_id` VARCHAR(100) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6) Post Tags (Optional - for categorization)
CREATE TABLE IF NOT EXISTS `post_tags` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7) Post-Tag Relationship
CREATE TABLE IF NOT EXISTS `post_tag_relations` (
  `post_id` BIGINT UNSIGNED NOT NULL,
  `tag_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`post_id`, `tag_id`),
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`tag_id`) REFERENCES `post_tags`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- SAMPLE DATA (Optional - for testing)
-- ====================================================

-- Insert sample tags
INSERT INTO `post_tags` (`name`, `slug`) VALUES
('أخبار', 'news'),
('فعاليات', 'events'),
('إعلانات', 'announcements'),
('تعليمي', 'educational'),
('ترفيهي', 'entertainment')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ====================================================
-- PERMISSIONS (Add to existing permissions table if exists)
-- ====================================================

-- Note: These should be added to your existing permissions system
-- INSERT INTO `permissions` (`name`, `description`) VALUES
-- ('posts.view', 'View posts'),
-- ('posts.create', 'Create posts'),
-- ('posts.edit', 'Edit posts'),
-- ('posts.delete', 'Delete posts'),
-- ('posts.publish', 'Publish posts'),
-- ('posts.moderate', 'Moderate posts (review, approve)'),
-- ('posts.schedule', 'Schedule posts'),
-- ('posts.pin', 'Pin posts'),
-- ('posts.lock', 'Lock posts from editing'),
-- ('media.upload', 'Upload media files'),
-- ('media.delete', 'Delete media files');

-- ====================================================
-- END OF SCHEMA
-- ====================================================
