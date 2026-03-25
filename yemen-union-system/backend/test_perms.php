<?php
require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use App\Repositories\UserRepository;

$userRepo = new UserRepository();
$roles = $userRepo->getUserRoles(1);
$perms = $userRepo->getUserPermissions(1);

header('Content-Type: application/json');
echo json_encode(['roles' => $roles, 'perms' => array_column($perms, 'name')], JSON_PRETTY_PRINT);
