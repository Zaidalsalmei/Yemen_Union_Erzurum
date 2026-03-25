<?php
require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../src/Core/Database.php';

try {
    $db = App\Core\Database::getInstance()->getConnection();
    
    $sql = "
    CREATE TABLE IF NOT EXISTS membership_packages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT NULL,
        price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'TRY',
        duration_days INT NOT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $db->exec($sql);
    
    // Insert some defaults if empty
    $count = $db->query("SELECT COUNT(*) FROM membership_packages")->fetchColumn();
    if ($count == 0) {
        $db->exec("
            INSERT INTO membership_packages (type, name, description, price, currency, duration_days, is_active)
            VALUES 
            ('annual', 'اشتراك سنوي', 'اشتراك لمدة عام كامل', 500.00, 'TRY', 365, 1),
            ('half_year', 'اشتراك نصف سنوي', 'اشتراك لمدة ستة أشهر', 300.00, 'TRY', 180, 1)
        ");
    }
    
    echo "Membership packages table created and seeded.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
