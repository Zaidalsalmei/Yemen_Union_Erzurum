<?php
require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$db = \App\Core\Database::getInstance()->getConnection();

$password = 'password';
$hash = password_hash($password, PASSWORD_BCRYPT);

echo "Generated hash: $hash\n";
echo "Hash length: " . strlen($hash) . "\n\n";

$stmt = $db->prepare("UPDATE users SET password = ? WHERE phone_number = ?");
$result = $stmt->execute([$hash, '05350703570']);

if ($result) {
    echo "Password updated successfully!\n\n";
    
    // Verify it was stored correctly
    $stmt2 = $db->prepare("SELECT password, LENGTH(password) as len FROM users WHERE phone_number = ?");
    $stmt2->execute(['05350703570']);
    $user = $stmt2->fetch(PDO::FETCH_ASSOC);
    
    echo "Stored hash: " . $user['password'] . "\n";
    echo "Stored length: " . $user['len'] . "\n\n";
    
    if (password_verify($password, $user['password'])) {
        echo "✓ Password verification SUCCESSFUL!\n";
    } else {
        echo "✗ Password verification FAILED!\n";
    }
} else {
    echo "Failed to update password!\n";
}
