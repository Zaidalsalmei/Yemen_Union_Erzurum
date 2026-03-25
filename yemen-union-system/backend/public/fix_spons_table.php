<?php
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..'); $dotenv->load();
$db = App\Core\Database::getInstance()->getConnection();
header('Content-Type: text/plain');
try {
    $db->exec("ALTER TABLE sponsorships ADD COLUMN status VARCHAR(50) DEFAULT 'pending' AFTER notes");
    echo "Column 'status' added successfully!";
} catch (Exception $e) { echo "Error: " . $e->getMessage(); }
