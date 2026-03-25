<?php
require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$db = \App\Core\Database::getInstance()->getConnection();

$phone = '05350703570';
$stmt = $db->prepare("SELECT id, full_name, phone_number, password, status, LENGTH(password) as hash_len FROM users WHERE phone_number = ?");
$stmt->execute([$phone]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo "User found:\n";
    echo "ID: " . $user['id'] . "\n";
    echo "Name: " . $user['full_name'] . "\n";
    echo "Phone: " . $user['phone_number'] . "\n";
    echo "Status: " . $user['status'] . "\n";
    echo "Hash Length: " . $user['hash_len'] . "\n";
    echo "Hash: " . $user['password'] . "\n\n";
    
    $password = 'password';
    if (password_verify($password, $user['password'])) {
        echo "Password MATCHES!\n";
    } else {
        echo "Password DOES NOT MATCH!\n";
    }
} else {
    echo "User NOT found!\n";
}
