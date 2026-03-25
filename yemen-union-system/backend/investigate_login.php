<?php
require_once __DIR__ . '/src/Core/Database.php';
require_once __DIR__ . '/src/Repositories/UserRepository.php';

$userRepo = new \App\Repositories\UserRepository();
$db = \App\Core\Database::getInstance()->getConnection();

// 1. Find the president
$stmt = $db->query("
    SELECT u.full_name, u.phone_number, r.name as role_name 
    FROM users u 
    JOIN user_roles ur ON u.id = ur.user_id 
    JOIN roles r ON ur.role_id = r.id 
    WHERE r.name = 'president'
");
$president = $stmt->fetch(PDO::FETCH_ASSOC);
echo "President: \n";
print_r($president);

// 2. Check Ryan Al-Qadhi (05350703570)
$ryan = $userRepo->findByPhone('05350703570');
echo "\nRyan Al-Qadhi: \n";
print_r($ryan);

if ($ryan) {
    try {
        $rolesData = $userRepo->getUserRolesAndPermissions((int)$ryan['id']);
        echo "\nRyan Roles & Permissions: \n";
        print_r($rolesData);
    } catch (Exception $e) {
        echo "\nError fetching roles for Ryan: " . $e->getMessage() . "\n";
    }
}

// 3. Reset passwords for test
$password = password_hash('password123', PASSWORD_BCRYPT, ['cost' => 12]);
if ($ryan) {
    $db->prepare("UPDATE users SET password = ? WHERE id = ?")->execute([$password, $ryan['id']]);
    echo "\nPassword for Ryan reset to 'password123'\n";
}
if ($president) {
    $db->prepare("UPDATE users SET password = ? WHERE phone_number = ?")->execute([$password, $president['phone_number']]);
    echo "Password for President reset to 'password123'\n";
}
