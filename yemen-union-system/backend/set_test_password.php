<?php
require_once __DIR__ . '/src/Core/Database.php';
$db = \App\Core\Database::getInstance()->getConnection();
$password = password_hash('password123', PASSWORD_BCRYPT, ['cost' => 12]);
$stmt = $db->prepare('UPDATE users SET password = :password WHERE phone_number = "05123456789"');
$stmt->execute(['password' => $password]);
echo "Password updated for ZAID 1 (05123456789) to 'password123'";
