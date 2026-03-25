<?php
require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$db = \App\Core\Database::getInstance()->getConnection();
$stmt = $db->query("SELECT * FROM roles");
$roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($roles, JSON_PRETTY_PRINT);
