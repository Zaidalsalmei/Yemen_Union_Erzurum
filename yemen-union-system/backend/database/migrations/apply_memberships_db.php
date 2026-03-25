<?php
// Fix path to Database and Config
require_once __DIR__ . '/../../src/Core/Config.php';
require_once __DIR__ . '/../../src/Core/Database.php';

// Load env since we are calling this directly
$envFile = __DIR__ . '/../../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        @list($name, $value) = explode('=', $line, 2);
        if ($name && $value) {
            $_ENV[trim($name)] = trim($value);
        }
    }
}

use App\Core\Database;

$sql = "
CREATE TABLE IF NOT EXISTS memberships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    package_type ENUM('annual','semester','monthly') DEFAULT 'annual',
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'TRY',
    status ENUM('pending','active','expired','cancelled','rejected') DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT NULL,
    payment_proof VARCHAR(255) DEFAULT NULL,
    payment_date DATE DEFAULT NULL,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    approved_by INT DEFAULT NULL,
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS membership_packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('annual','semester','monthly') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'TRY',
    duration_days INT NOT NULL,
    description TEXT DEFAULT NULL,
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO membership_packages (name, type, price, currency, duration_days, description, is_active) VALUES
('اشتراك سنوي', 'annual', 500.00, 'TRY', 365, 'اشتراك سنوي كامل في اتحاد الطلاب', 1),
('اشتراك فصلي', 'semester', 300.00, 'TRY', 180, 'اشتراك لفصل دراسي واحد', 1),
('اشتراك شهري', 'monthly', 100.00, 'TRY', 30, 'اشتراك شهري', 1);
";

try {
    $db = Database::getInstance()->getConnection();
    $db->exec($sql);
    echo "Done";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
