<?php
function loadEnv($path) {
    if (!file_exists($path)) return false;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
    return true;
}

loadEnv(__DIR__ . '/../../.env');

$host = $_ENV['DB_HOST'] ?? 'localhost';
$port = $_ENV['DB_PORT'] ?? '3306';
$dbname = $_ENV['DB_DATABASE'] ?? 'yemen_union_db';
$user = $_ENV['DB_USERNAME'] ?? 'root';
$pass = $_ENV['DB_PASSWORD'] ?? '';

try {
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
    $db = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    // Check if expires_at exists in user_roles
    $stmt = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'user_roles' AND COLUMN_NAME = 'expires_at'");
    $stmt->execute([$dbname]);
    
    if ($stmt->fetchColumn() == 0) {
        echo "Adding expires_at column to user_roles table...\n";
        $db->exec("ALTER TABLE `user_roles` ADD COLUMN `expires_at` TIMESTAMP NULL DEFAULT NULL AFTER `is_active`");
        echo "Column added successfully.\n";
    } else {
        echo "Column expires_at already exists in user_roles table.\n";
    }

} catch (PDOException $e) {
    echo "Error updating database: " . $e->getMessage() . "\n";
}
