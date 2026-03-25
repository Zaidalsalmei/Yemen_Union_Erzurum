<?php
require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use App\Core\Database;

$db = Database::getInstance()->getConnection();

try {
    $db->exec("ALTER TABLE financial_transactions ADD COLUMN approved_at TIMESTAMP NULL AFTER approved_by");
    echo "Added approved_at column.\n";
} catch (\PDOException $e) {}

try {
    $db->exec("ALTER TABLE financial_transactions ADD COLUMN reference_type VARCHAR(50) AFTER description");
    echo "Added reference_type column.\n";
} catch (\PDOException $e) {}

try {
    $db->exec("ALTER TABLE financial_transactions ADD COLUMN reference_id INT AFTER reference_type");
    echo "Added reference_id column.\n";
} catch (\PDOException $e) {}
