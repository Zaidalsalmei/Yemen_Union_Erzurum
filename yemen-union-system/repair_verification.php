<?php
require_once __DIR__ . '/backend/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/backend');
$dotenv->load();

try {
    $db = \App\Core\Database::getInstance()->getConnection();
    
    // Create verification_codes table
    echo "Checking/Creating 'verification_codes' table...\n";
    $sql = "CREATE TABLE IF NOT EXISTS verification_codes (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        phone_number VARCHAR(20) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_phone_otp (phone_number, otp)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    
    $db->exec($sql);
    echo "Table 'verification_codes' is ready.\n";
    
    // Check if phone_verified_at exists in users
    echo "Checking 'phone_verified_at' column in 'users' table...\n";
    try {
        $stmt = $db->query("SELECT phone_verified_at FROM users LIMIT 1");
    } catch (PDOException $e) {
        // Column likely missing, add it
        echo "Column missing, adding it...\n";
        $db->exec("ALTER TABLE users ADD COLUMN phone_verified_at TIMESTAMP NULL AFTER status");
        echo "Column added.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
