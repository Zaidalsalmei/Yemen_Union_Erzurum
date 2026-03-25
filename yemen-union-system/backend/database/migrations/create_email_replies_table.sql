-- Create email_replies table for storing email responses from members
-- This table stores replies fetched from the configured email account via IMAP

CREATE TABLE IF NOT EXISTS `email_replies` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `sender_email` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(500) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_sender_email` (`sender_email`),
  INDEX `idx_created_at` (`created_at`),
  
  -- Foreign Key
  CONSTRAINT `fk_email_replies_user` 
    FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) 
    ON DELETE CASCADE
    ON UPDATE CASCADE
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
