<?php
require_once __DIR__ . '/src/Core/Database.php';
$db = \App\Core\Database::getInstance()->getConnection();
$stmt = $db->query('SELECT full_name, phone_number, status FROM users LIMIT 5');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
