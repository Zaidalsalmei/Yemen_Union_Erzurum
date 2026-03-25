<?php
require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$db = \App\Core\Database::getInstance()->getConnection();
$stmt = $db->query("SELECT name, display_name_ar FROM roles");
$roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach($roles as $role) {
    echo $role['name'] . " - " . ($role['display_name_ar'] ?? 'N/A') . "\n";
}
