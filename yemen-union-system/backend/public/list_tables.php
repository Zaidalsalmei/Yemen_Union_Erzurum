<?php
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

try {
    $db = \App\Core\Database::getInstance()->getConnection();
    $stmt = $db->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    header('Content-Type: application/json');
    echo json_encode(['tables' => $tables], JSON_PRETTY_PRINT);
} catch (\Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
