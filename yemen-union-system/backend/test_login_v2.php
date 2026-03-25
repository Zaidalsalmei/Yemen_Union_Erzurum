<?php
require_once __DIR__ . '/vendor/autoload.php';

use App\Services\Auth\AuthService;
use App\Core\Database;

// Setup environment for testing if needed
// Bootstrap the app
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$authService = new AuthService();

echo "--- TESTING LOGIN FOR RYAN (05350703570) ---\n";
try {
    $res = $authService->login('05350703570', 'password123', '127.0.0.1', 'TestAgent');
    echo "SUCCESS: Logged in as " . $res['user']['full_name'] . "\n";
    echo "Roles: " . implode(', ', $res['user']['roles']) . "\n";
    echo "Token received (start): " . substr($res['access_token'], 0, 20) . "...\n";
} catch (\Exception $e) {
    echo "FAILED: " . $e->getMessage() . "\n";
    echo "Exception type: " . get_class($e) . "\n";
}

echo "\n--- TESTING LOGIN FOR ZAID 1 (05123456789) ---\n";
try {
    $res = $authService->login('05123456789', 'password123', '127.0.0.1', 'TestAgent');
    echo "SUCCESS: Logged in as " . $res['user']['full_name'] . "\n";
} catch (\Exception $e) {
    echo "FAILED: " . $e->getMessage() . "\n";
}
