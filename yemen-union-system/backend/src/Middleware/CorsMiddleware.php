<?php
/**
 * CORS Middleware - Handles Cross-Origin Resource Sharing
 * Prevents refresh loops and handles preflight requests properly
 */

declare(strict_types=1);

namespace App\Middleware;

class CorsMiddleware
{
    /**
     * Allowed origins (can be extended)
     */
    private static array $allowedOrigins = [
        'http://localhost:5176',
        'http://127.0.0.1:5176',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ];

    /**
     * Set CORS headers
     */
    public static function handle(): void
    {
        // Get origin from request
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        
        // Get allowed origin from environment or use default
        $envOrigin = $_ENV['CORS_ORIGIN'] ?? 'http://localhost:5176';
        
        // Build list of allowed origins
        $allowedOrigins = array_merge(self::$allowedOrigins, [$envOrigin]);
        
        // ✅ السماح لأي IP على البورت 5176 أو 5173 (للتطوير)
        $isAllowed = in_array($origin, $allowedOrigins, true)
            || preg_match('/^http:\/\/\d+\.\d+\.\d+\.\d+:(5176|5173)$/', $origin);

        $allowedOrigin = $isAllowed ? $origin : $envOrigin;

        // Set CORS headers
        header("Access-Control-Allow-Origin: {$allowedOrigin}");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control');
        header('Access-Control-Max-Age: 86400');
        header('Access-Control-Expose-Headers: Content-Length, X-Request-Id');
        
        // Handle preflight OPTIONS request
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            // Return 200 OK for preflight
            http_response_code(200);
            
            // Prevent any further processing
            exit(0);
        }
    }

    /**
     * Check if origin is allowed
     */
    public static function isOriginAllowed(string $origin): bool
    {
        $envOrigin = $_ENV['CORS_ORIGIN'] ?? 'http://localhost:5176';
        $allowedOrigins = array_merge(self::$allowedOrigins, [$envOrigin]);
        
        return in_array($origin, $allowedOrigins, true)
            || preg_match('/^http:\/\/\d+\.\d+\.\d+\.\d+:(5176|5173)$/', $origin);
    }
}
