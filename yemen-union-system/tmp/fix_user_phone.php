<?php
require 'backend/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable('backend');
$dotenv->load();

try {
    $db = \App\Core\Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("UPDATE users SET phone_number = '05376439951' WHERE phone_number = '05376439961'");
    $stmt->execute();
    echo "Updated phone number to 05376439951\n";
    
    $stmt = $db->prepare('SELECT id, full_name, phone_number, password, status FROM users WHERE phone_number = ?');
    $stmt->execute(['05376439951']);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if($user) {
        $testPass = 'Doll7722[';
        if(password_verify($testPass, $user['password'])) {
            echo "Password matched correctly for 'Doll7722['!\n";
        } else {
            echo "Password DID NOT match 'Doll7722['\n";
            $newPassword = password_hash($testPass, PASSWORD_BCRYPT);
            $db->prepare("UPDATE users SET password = ? WHERE id = ?")->execute([$newPassword, $user['id']]);
            echo "Password has been forcibly updated to 'Doll7722['\n";
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
