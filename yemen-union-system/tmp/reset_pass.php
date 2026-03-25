<?php
require 'backend/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable('backend');
$dotenv->load();

try {
    $db = \App\Core\Database::getInstance()->getConnection();
    $phone = '05350703570';
    $password = '123456';
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    
    $stmt = $db->prepare('UPDATE users SET password = ? WHERE phone_number = ?');
    $stmt->execute([$hashedPassword, $phone]);
    
    echo "Password updated successfully to '123456' for phone: $phone\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
