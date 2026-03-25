<?php
require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use App\Core\Database;

$db = Database::getInstance()->getConnection();

$queries = [
    "ALTER TABLE memberships ADD COLUMN payment_date DATE AFTER payment_method",
    "ALTER TABLE memberships ADD COLUMN approved_by INT NULL AFTER notes",
    "ALTER TABLE memberships ADD COLUMN approved_at TIMESTAMP NULL AFTER approved_by",
    "ALTER TABLE memberships ADD COLUMN rejection_reason TEXT NULL AFTER approved_at",
    "ALTER TABLE memberships MODIFY COLUMN package_name VARCHAR(100) NULL",
    "ALTER TABLE memberships ADD CONSTRAINT fk_memberships_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL"
];

foreach ($queries as $sql) {
    try {
        $db->exec($sql);
        echo "Success: $sql\n";
    } catch (\PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column name') !== false || strpos($e->getMessage(), 'Duplicate key name') !== false || strpos($e->getMessage(), 'Constraint already exists') !== false) {
            echo "Skipped (already exists): $sql\n";
        } else {
            echo "Error: " . $e->getMessage() . " | SQL: $sql\n";
        }
    }
}
echo "Database schema update check completed.\n";
