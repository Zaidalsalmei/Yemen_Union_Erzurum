<?php
require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use App\Core\Request;
use App\Controllers\MembershipController;

// Mock SERVER variables
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['REQUEST_URI'] = '/api/memberships';
$_GET['page'] = 1;
$_GET['per_page'] = 10;

$request = new Request();

$controller = new MembershipController();
$result = $controller->index($request);

header('Content-Type: application/json');
echo json_encode($result, JSON_PRETTY_PRINT);
