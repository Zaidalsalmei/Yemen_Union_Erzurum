<?php
require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use App\Core\Request;
use App\Controllers\MembershipController;

// Mock session/user
$_SERVER['REQUEST_METHOD'] = 'POST';

$request = new Request();
$request->user = ['id' => 1]; // Mock admin

// Input data
$_POST = [
    'user_id' => 3,
    'package_type' => 'annual',
    'amount' => 500,
    'currency' => 'TRY',
    'payment_method' => 'cash',
    'status' => 'active',
    'start_date' => date('Y-m-d'),
    'notes' => 'Test membership creation'
];
// Re-init request to capture POST
$request = new Request();
$request->user = ['id' => 1];

$controller = new MembershipController();
$result = $controller->store($request);

header('Content-Type: application/json');
echo json_encode($result, JSON_PRETTY_PRINT);
