<?php
require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use App\Core\Database;

$db = Database::getInstance()->getConnection();
$stmt = $db->query("DESCRIBE memberships");
$columns = $stmt->fetchAll(PDO::FETCH_COLUMN);

echo implode(", ", $columns);
