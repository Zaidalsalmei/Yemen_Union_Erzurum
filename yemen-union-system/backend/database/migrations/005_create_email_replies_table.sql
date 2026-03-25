-- Create email_replies table
CREATE TABLE IF NOT EXISTS email_replies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  activity_id BIGINT UNSIGNED NULL,
  sender_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_sender_email (sender_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
