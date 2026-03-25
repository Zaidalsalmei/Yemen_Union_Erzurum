<?php
require 'backend/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable('backend');
$dotenv->load();

try {
    $db = \App\Core\Database::getInstance()->getConnection();
    $phone = '05376439951';
    $password = 'Doll7722[';

    $stmt = $db->prepare('SELECT * FROM users WHERE phone_number = ?');
    $stmt->execute([$phone]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if(!$user) {
        echo "User NOT FOUND\n";
    } else {
        echo "User Found. Status: {$user['status']}\n";
        
        if ($user['status'] === 'pending') {
            echo "Error: Account is pending\n";
        } elseif ($user['status'] === 'banned') {
            echo "Error: Account is banned\n";
        } elseif ($user['status'] === 'suspended') {
            echo "Error: Account is suspended\n";
        }
        
        if (empty($user['password'])) {
            echo "Error: Password is empty in DB\n";
        } elseif (!password_verify($password, $user['password'])) {
            echo "Error: Password mismatch\n";
        } else {
            echo "Password verification passed!\n";
        }
    }
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage();
}
