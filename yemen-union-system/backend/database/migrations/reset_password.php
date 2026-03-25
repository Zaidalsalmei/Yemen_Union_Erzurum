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
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $newPassword = password_hash('password', PASSWORD_DEFAULT);
    
    $stmt = $db->prepare("UPDATE users SET password = :password, status = 'active' WHERE phone_number = '05350703570'");
    $stmt->execute(['password' => $newPassword]);
    
    echo "Password reset for user 05350703570: 'password'\n";
    echo "Rows affected: " . $stmt->rowCount() . "\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
