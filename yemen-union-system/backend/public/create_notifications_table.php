<?php
require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../src/Core/Database.php';

try {
    $db = App\Core\Database::getInstance()->getConnection();
    
    // Drop first in case of partial or corrupted state
    $db->exec("DROP TABLE IF EXISTS notifications");
    
    // Detect users.id column type
    $stmt = $db->query("DESCRIBE users");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $idType = 'INT';
    foreach ($columns as $c) {
        if ($c['Field'] === 'id') {
            $idType = $c['Type'];
            break;
        }
    }
    
    $sql = "
    CREATE TABLE notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id {$idType} NULL,
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
    echo "Notifications table created successfully with user_id matching {$idType}.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
