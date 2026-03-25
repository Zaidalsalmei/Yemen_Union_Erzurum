<?php
require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use App\Core\Request;
use App\Controllers\FinanceController;

$_SERVER['REQUEST_METHOD'] = 'GET';
$request = new Request();

$controller = new FinanceController();
$result = $controller->overview($request);

header('Content-Type: application/json');
echo json_encode($result, JSON_PRETTY_PRINT);
