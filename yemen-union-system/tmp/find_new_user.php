<?php
require 'backend/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable('backend');
$dotenv->load();

try {
    $db = \App\Core\Database::getInstance()->getConnection();
    $phone = '05376439951';
    
    $stmt = $db->prepare('SELECT id, full_name, phone_number, password, status FROM users WHERE phone_number = ?');
    $stmt->execute([$phone]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if($user) {
        print_r($user);
        
        $testPass = 'Doll7722[';
        if(password_verify($testPass, $user['password'])) {
            echo "Password matched correctly!\n";
        } else {
            echo "Password DID NOT match 'Doll7722['\n";
            // Check if it matches without bracket
            if(password_verify('Doll7722', $user['password'])) {
                echo "Matches 'Doll7722'\n";
            }
        }
    } else {
        echo "User with phone $phone NOT FOUND\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
