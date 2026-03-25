<?php
require 'backend/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable('backend');
$dotenv->load();

try {
    $db = \App\Core\Database::getInstance()->getConnection();
    $phone = '05350703570';
    
    $stmt = $db->prepare('SELECT id, full_name, phone_number, status, password FROM users WHERE phone_number = ?');
    $stmt->execute([$phone]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "User Found:\n";
        print_r($user);
        
        // Check if password match "123456" (common demo password)
        if (password_verify('123456', $user['password'])) {
            echo "Password matches '123456'\n";
        } else {
            echo "Password DOES NOT match '123456'\n";
        }
    } else {
        echo "User NOT found for phone: $phone\n";
        
        // List all users to see what's there
        $users = $db->query('SELECT full_name, phone_number, status FROM users LIMIT 10')->fetchAll(PDO::FETCH_ASSOC);
        echo "\nExisting Users:\n";
        print_r($users);
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
