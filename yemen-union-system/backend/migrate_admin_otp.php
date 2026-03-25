<?php
require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$db = \App\Core\Database::getInstance()->getConnection();
$sql = "
CREATE TABLE IF NOT EXISTS admin_verification_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);";

try {
    $db->exec($sql);
    echo "✓ Table admin_verification_codes created successfully!\n";
} catch (Exception $e) {
    echo "✗ Error creating table: " . $e->getMessage() . "\n";
}
