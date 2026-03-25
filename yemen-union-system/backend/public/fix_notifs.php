<?php
require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../src/Core/Database.php';

try {
    $db = App\Core\Database::getInstance()->getConnection();
    
    // Drop first
    try {
        $db->exec("DROP TABLE IF EXISTS notifications");
    } catch (Exception $e) {}
    
    $sql = "
    CREATE TABLE table_notifs_tmp (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NULL,
        type VARCHAR(20) DEFAULT 'info',
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        action_url VARCHAR(500),
        is_read TINYINT(1) DEFAULT 0,
        read_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_is_read (is_read),
        INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $db->exec($sql);
    
    // Rename to bypass weird constraints
    $db->exec("RENAME TABLE table_notifs_tmp TO notifications");
    
    echo "Done resolving table.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
