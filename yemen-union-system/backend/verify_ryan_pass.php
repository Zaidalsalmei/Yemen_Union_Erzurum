<?php
require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

require_once __DIR__ . '/src/Core/Database.php';
require_once __DIR__ . '/src/Repositories/UserRepository.php';
$userRepo = new \App\Repositories\UserRepository();
$db = \App\Core\Database::getInstance()->getConnection();

$phone = '05350703570';
$user = $userRepo->findByPhone($phone);

if ($user) {
    echo "User found: " . $user['full_name'] . "\n";
    $testPass = 'password123';
    if (password_verify($testPass, $user['password'])) {
        echo "Password verification SUCCESS for '$testPass'\n";
    } else {
        echo "Password verification FAILED for '$testPass'\n";
        echo "Hashed password in DB: " . $user['password'] . "\n";
        $newHash = password_hash($testPass, PASSWORD_BCRYPT, ['cost' => 12]);
        echo "New hash would be: " . $newHash . "\n";
    }
} else {
    echo "User not found for $phone\n";
}
