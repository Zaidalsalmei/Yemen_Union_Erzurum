<?php
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

$db = \App\Core\Database::getInstance()->getConnection();
$userId = 1;

$stmt = $db->prepare("SELECT * FROM notifications WHERE user_id = :userId");
$stmt->execute(['userId' => $userId]);
$notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode([
    'count' => count($notifications),
    'notifications' => $notifications
]);
