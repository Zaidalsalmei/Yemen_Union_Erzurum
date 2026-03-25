<?php
require_once __DIR__ . '/src/Core/Database.php';
require_once __DIR__ . '/src/Core/Request.php';
require_once __DIR__ . '/src/Controllers/AuthController.php';

// Setup Mock Request
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['REMOTE_ADDR'] = '127.0.0.1';
$_SERVER['HTTP_USER_AGENT'] = 'TestAgent';

// Capture output to avoid header errors if any
ob_start();

$auth = new \App\Controllers\AuthController();

// Test Ryan
$requestRyan = new \App\Core\Request();
// Manually set body since we can't easily mock php://input here without more work
// We'll use a trick or just call the service directly
require_once __DIR__ . '/src/Services/Auth/AuthService.php';
$authService = new \App\Services\Auth\AuthService();

echo "Testing Login for Ryan (05350703570):\n";
try {
    $res = $authService->login('05350703570', 'password123', '127.0.0.1', 'TestAgent');
    echo "SUCCESS\n";
    print_r($res['user']);
} catch (\Exception $e) {
    echo "FAILED: " . $e->getMessage() . "\n";
}

echo "\nTesting Login for ZAID 1 (05123456789):\n";
try {
    $res = $authService->login('05123456789', 'password123', '127.0.0.1', 'TestAgent');
    echo "SUCCESS\n";
} catch (\Exception $e) {
    echo "FAILED: " . $e->getMessage() . "\n";
}
