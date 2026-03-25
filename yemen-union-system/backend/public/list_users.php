<?php
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

$db = \App\Core\Database::getInstance()->getConnection();

$stmt = $db->query("SELECT id, email, full_name, status FROM users");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
