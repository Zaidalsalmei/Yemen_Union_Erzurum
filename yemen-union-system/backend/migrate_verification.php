<?php
require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$host = $_ENV['DB_HOST'];
$db   = $_ENV['DB_DATABASE'];
$user = $_ENV['DB_USERNAME'];
$pass = $_ENV['DB_PASSWORD'];
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    
    // Create verification_codes table
    $sql = "CREATE TABLE IF NOT EXISTS verification_codes (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        phone_number VARCHAR(191) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_phone_otp (phone_number, otp)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    
    $pdo->exec($sql);
    echo "Table verification_codes created successfully.\n";

    // Add phone_verified_at to users if not exists
    $checkCol = $pdo->query("SHOW COLUMNS FROM users LIKE 'phone_verified_at'");
    if ($checkCol->rowCount() == 0) {
        $pdo->exec("ALTER TABLE users ADD COLUMN phone_verified_at TIMESTAMP NULL AFTER status");
        echo "Column phone_verified_at added to users table.\n";
    } else {
        echo "Column phone_verified_at already exists.\n";
    }

} catch (\PDOException $e) {
    throw new \PDOException($e->getMessage(), (int)$e->getCode());
}
