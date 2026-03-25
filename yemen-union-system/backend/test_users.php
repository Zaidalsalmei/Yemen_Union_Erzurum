<?php
require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use App\Repositories\UserRepository;

$userRepo = new UserRepository();
$results = $userRepo->getAll([], 1, 5);

header('Content-Type: application/json');
echo json_encode($results, JSON_PRETTY_PRINT);
