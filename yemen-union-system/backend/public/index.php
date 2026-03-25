<?php
/**
 * Yemen Student Union System - API Entry Point
 * All requests are routed through this file
 */
declare(strict_types=1);

// ============================================
// ENVIRONMENT-BASED ERROR HANDLING
// ============================================
// Load env first to determine environment
require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

$isDebug = ($_ENV['APP_DEBUG'] ?? 'false') === 'true';
$isProduction = ($_ENV['APP_ENV'] ?? 'production') === 'production';

if ($isProduction || !$isDebug) {
    // Production: Hide all errors from users
    error_reporting(0);
    ini_set('display_errors', '0');
    ini_set('log_errors', '1');
    ini_set('error_log', __DIR__ . '/../storage/logs/error.log');
} else {
    // Development only: Show errors
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
}

// ============================================
// SECURITY HEADERS
// ============================================
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
header('Strict-Transport-Security: max-age=31536000; includeSubDomains');

// Remove PHP version header
header_remove('X-Powered-By');

// ============================================
// CORE COMPONENTS
// ============================================
use App\Core\Router;
use App\Core\Request;
use App\Core\ExceptionHandler;
use App\Middleware\CorsMiddleware;
use App\Middleware\RateLimitMiddleware;

// Set timezone
date_default_timezone_set('Europe/Istanbul');

// Handle CORS
CorsMiddleware::handle();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Create request object
    $request = new Request();

    // ============================================
    // RATE LIMITING (Before routing)
    // ============================================
    // $rateLimiter = new RateLimitMiddleware();
    // $rateLimitResult = $rateLimiter->handle($request);
    // if ($rateLimitResult !== null) {
    //     http_response_code(429);
    //     echo json_encode($rateLimitResult, JSON_UNESCAPED_UNICODE);
    //     exit;
    // }

    // Initialize router and load routes
    $router = new Router();
    require_once __DIR__ . '/../src/Routes/api.php';

    // Dispatch the request
    $response = $router->dispatch($request);

    // Set response code
    if (isset($response['code'])) {
        http_response_code((int)$response['code']);
    }

    // Send response
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (\Throwable $e) {
    // Handle exceptions
    $handler = new ExceptionHandler();
    $response = $handler->handle($e);

    http_response_code($response['code'] ?? 500);

    // In production, don't expose error details
    if ($isProduction || !$isDebug) {
        $safeResponse = [
            'success' => false,
            'message' => 'حدث خطأ في الخادم',
            'code' => $response['code'] ?? 500
        ];
        echo json_encode($safeResponse, JSON_UNESCAPED_UNICODE);

        // Log the actual error
        error_log(sprintf(
            "[%s] %s in %s:%d\nTrace: %s",
            date('Y-m-d H:i:s'),
            $e->getMessage(),
            $e->getFile(),
            $e->getLine(),
            $e->getTraceAsString()
        ));
    } else {
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
    }
}
