<?php
require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../src/Core/Database.php';

$db = App\Core\Database::getInstance()->getConnection();
$stmt = $db->query("DESCRIBE sponsors");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
