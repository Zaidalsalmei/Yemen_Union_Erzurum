<?php
require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use App\Config\Database;

try {
    $pdo = Database::getInstance();
    
    echo "Connected to database.\n";
    
    // Read SQL file
    $sql = file_get_contents(__DIR__ . '/scripts/fix_database_tables.sql');
    
    // Execute
    $pdo->exec($sql);
    
    echo "Database table fix executed successfully.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
