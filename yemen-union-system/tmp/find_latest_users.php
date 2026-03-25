<?php
require 'backend/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable('backend');
$dotenv->load();

try {
    $db = \App\Core\Database::getInstance()->getConnection();
    
    $stmt = $db->query('SELECT id, full_name, phone_number, created_at FROM users ORDER BY id DESC LIMIT 5');
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Latest 5 users in database:\n";
    foreach($users as $u) {
        echo "- ID: {$u['id']} | Name: {$u['full_name']} | Phone: {$u['phone_number']} | Created: {$u['created_at']}\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
