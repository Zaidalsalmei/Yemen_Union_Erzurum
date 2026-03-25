<?php
/**
 * Router - Handles API routing and dispatching
 */

declare(strict_types=1);

namespace App\Core;

use App\Middleware\AuthMiddleware;
use App\Middleware\PermissionMiddleware;
use App\Helpers\ResponseHelper;

class Router
{
    private static array $routes = [];
    private static array $groupMiddleware = [];
    private static string $groupPrefix = '';
    
    /**
     * Register a GET route
     */
    public static function get(string $path, array|callable $handler, array $middleware = []): void
    {
        self::addRoute('GET', $path, $handler, $middleware);
    }
    
    /**
     * Register a POST route
     */
    public static function post(string $path, array|callable $handler, array $middleware = []): void
    {
        self::addRoute('POST', $path, $handler, $middleware);
    }
    
    /**
     * Register a PUT route
     */
    public static function put(string $path, array|callable $handler, array $middleware = []): void
    {
        self::addRoute('PUT', $path, $handler, $middleware);
    }
    
    /**
     * Register a DELETE route
     */
    public static function delete(string $path, array|callable $handler, array $middleware = []): void
    {
        self::addRoute('DELETE', $path, $handler, $middleware);
    }
    
    /**
     * Create a route group with shared middleware
     */
    public static function group(array $options, callable $callback): void
    {
        $previousPrefix = self::$groupPrefix;
        $previousMiddleware = self::$groupMiddleware;
        
        self::$groupPrefix = $previousPrefix . ($options['prefix'] ?? '');
        self::$groupMiddleware = array_merge($previousMiddleware, $options['middleware'] ?? []);
        
        $callback();
        
        self::$groupPrefix = $previousPrefix;
        self::$groupMiddleware = $previousMiddleware;
    }
    
    /**
     * Add a route to the routes array
     */
    private static function addRoute(string $method, string $path, array|callable $handler, array $middleware): void
    {
        $fullPath = self::$groupPrefix . $path;
        $allMiddleware = array_merge(self::$groupMiddleware, $middleware);
        
        self::$routes[] = [
            'method' => $method,
            'path' => $fullPath,
            'pattern' => self::pathToPattern($fullPath),
            'handler' => $handler,
            'middleware' => $allMiddleware
        ];
    }
    
    /**
     * Convert path to regex pattern
     */
    private static function pathToPattern(string $path): string
    {
        // Replace {param} with named capture group
        $pattern = preg_replace('/\{([a-zA-Z_]+)\}/', '(?P<$1>[^/]+)', $path);
        return '#^' . $pattern . '$#';
    }
    
    /**
     * Dispatch the request to the appropriate handler
     */
    public function dispatch(Request $request): array
    {
        $method = $request->getMethod();
        $uri = $request->getUri();
        
        foreach (self::$routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }
            
            if (preg_match($route['pattern'], $uri, $matches)) {
                // Extract route parameters
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                
                // Run middleware
                $middlewareResult = $this->runMiddleware($route['middleware'], $request);
                if ($middlewareResult !== null) {
                    return $middlewareResult;
                }
                
                // Call the controller method
                return $this->callHandler($route['handler'], $request, $params);
            }
        }
        
        // No route found
        http_response_code(404);
        return ResponseHelper::error('المسار غير موجود', 404);
    }
    
    /**
     * Run middleware chain
     */
    private function runMiddleware(array $middleware, Request $request): ?array
    {
        foreach ($middleware as $mw) {
            if ($mw === 'auth') {
                $authMiddleware = new AuthMiddleware();
                $result = $authMiddleware->handle($request);
                if ($result !== null) {
                    http_response_code(401);
                    return $result;
                }
            } elseif (strpos($mw, 'permission:') === 0) {
                $permission = substr($mw, 11);
                $permMiddleware = new PermissionMiddleware($permission);
                $result = $permMiddleware->handle($request);
                if ($result !== null) {
                    http_response_code(403);
                    return $result;
                }
            }
        }
        
        return null;
    }
    
    /**
     * Call the controller handler
     */
    private function callHandler(array|callable $handler, Request $request, array $params): array
    {
        // If handler is a closure/callable, call it directly
        if (is_callable($handler) && !is_array($handler)) {
            return $handler($request, $params);
        }
        
        // Otherwise, it's a controller array
        [$controllerClass, $method] = $handler;
        
        if (!class_exists($controllerClass)) {
            throw new \RuntimeException("Controller not found: {$controllerClass}");
        }
        
        $controller = new $controllerClass();
        
        if (!method_exists($controller, $method)) {
            throw new \RuntimeException("Method not found: {$controllerClass}::{$method}");
        }
        
        // Call with request and params
        return $controller->$method($request, $params);
    }
}
