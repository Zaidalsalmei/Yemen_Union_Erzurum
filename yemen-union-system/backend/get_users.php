<?php
require 'vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

try {
    $dsn = "mysql:host={$_ENV['DB_HOST']};port={$_ENV['DB_PORT']};dbname={$_ENV['DB_DATABASE']}";
    $pdo = new PDO($dsn, $_ENV['DB_USERNAME'], $_ENV['DB_PASSWORD']);
    $stmt = $pdo->query('SELECT username, name, password, role FROM users');
    echo str_pad("Username", 20) . " | " . str_pad("Name", 30) . " | " . str_pad("Role", 15) . " | Password\n";
    echo str_repeat("-", 80) . "\n";
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        echo str_pad($row['username'], 20) . " | " . str_pad($row['name'], 30) . " | " . str_pad($row['role'], 15) . " | " . $row['password'] . "\n";
    }
} catch (Exception $e) {
    echo "Error: ". $e->getMessage() . "\n";
}
