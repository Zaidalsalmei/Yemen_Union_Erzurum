<?php
require 'vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

try {
    $db = \App\Config\Database::getInstance();
    $stmt = $db->query('SELECT username, password FROM users');
    echo str_pad("Username", 30) . " | Password\n";
    echo str_repeat("-", 80) . "\n";
    foreach ($stmt->fetchAll() as $row) {
        echo str_pad($row['username'], 30) . " | " . $row['password'] . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
