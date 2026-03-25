<?php
require_once __DIR__ . '/vendor/autoload.php';

use App\Config\Database;

// Simple dotenv loader for the script if not using composer autoload for env
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && substr($line, 0, 1) !== '#') {
            list($name, $value) = explode('=', $line, 2);
            $_ENV[$name] = trim($value);
            putenv("$name=" . trim($value));
        }
    }
}

try {
    $host = getenv('DB_HOST') ?: 'localhost';
    $db   = getenv('DB_DATABASE') ?: 'yemen_union_db';
    $user = getenv('DB_USERNAME') ?: 'root';
    $pass = getenv('DB_PASSWORD') ?: '';
    $port = getenv('DB_PORT') ?: '3306';

    $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    echo "Connecting to database...\n";
    $pdo = new PDO($dsn, $user, $pass, $options);

    echo "Reading migration file...\n";
    $sql = file_get_contents(__DIR__ . '/database/migrations/005_create_email_replies_table.sql');

    if (!$sql) {
        die("Error: Could not read migration file.\n");
    }

    echo "Executing migration...\n";
    $pdo->exec($sql);

    echo "Migration 005_create_email_replies_table.sql executed successfully!\n";

} catch (\PDOException $e) {
    die("Database Error: " . $e->getMessage() . "\n");
}
