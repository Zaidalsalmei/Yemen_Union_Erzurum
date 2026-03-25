<?php
require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use App\Core\Database;

$db = Database::getInstance()->getConnection();
$stmt = $db->query("SELECT * FROM financial_transactions");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r($rows);
