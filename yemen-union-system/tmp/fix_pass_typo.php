<?php
require 'backend/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable('backend');
$dotenv->load();

try {
    $db = \App\Core\Database::getInstance()->getConnection();
    
    $stmt = $db->prepare('SELECT id, password FROM users WHERE phone_number = ?');
    $stmt->execute(['05376439951']);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if($user) {
        $testPass = 'Doll7722';
        $newPassword = password_hash($testPass, PASSWORD_BCRYPT);
        $db->prepare("UPDATE users SET password = ? WHERE id = ?")->execute([$newPassword, $user['id']]);
        echo "Password has been forcibly updated to 'Doll7722'\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
