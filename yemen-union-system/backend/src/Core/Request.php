<?php
/**
 * HTTP Request Handler
 * Parses and provides access to request data
 * Secured: Removed excessive logging, fixed IP spoofing
 */

declare(strict_types=1);

namespace App\Core;

class Request
{
    private string $method;
    private string $uri;
    private array $query;
    private array $body;
    private array $headers;
    public ?array $user = null;

    public function __construct()
    {
        $this->method = $_SERVER['REQUEST_METHOD'];
        $this->uri = $this->parseUri();
        $this->query = $_GET;
        $this->body = $this->parseBody();
        $this->headers = $this->parseHeaders();
    }

    /**
     * Parse request URI without query string
     */
    private function parseUri(): string
    {
        $uri = $_SERVER['REQUEST_URI'] ?? '/';

        // Remove query string
        if (($pos = strpos($uri, '?')) !== false) {
            $uri = substr($uri, 0, $pos);
        }

        // Handle multiple possible base paths (for subdirectory installations)
        $basePaths = [
            '/projects/yemen-union-system/backend/public',
            '/yemen-union-system/backend/public'
        ];

        foreach ($basePaths as $basePath) {
            if (strpos($uri, $basePath) === 0) {
                $uri = substr($uri, strlen($basePath));
                break;
            }
        }

        return $uri ?: '/';
    }

    /**
     * Parse request body (JSON)
     */
    private function parseBody(): array
    {
        $rawBody = file_get_contents('php://input');

        if (empty($rawBody)) {
            return $_POST;
        }

        $decoded = json_decode($rawBody, true);

        return is_array($decoded) ? $decoded : [];
    }

    /**
     * Parse request headers
     */
    private function parseHeaders(): array
    {
        $headers = [];

        foreach ($_SERVER as $key => $value) {
            if (strpos($key, 'HTTP_') === 0) {
                $headerName = str_replace('_', '-', substr($key, 5));
                $headers[$headerName] = $value;
            }
        }

        // Add content type
        if (isset($_SERVER['CONTENT_TYPE'])) {
            $headers['CONTENT-TYPE'] = $_SERVER['CONTENT_TYPE'];
        }

        return $headers;
    }

    /**
     * Get request method
     */
    public function getMethod(): string
    {
        return $this->method;
    }

    /**
     * Get request URI
     */
    public function getUri(): string
    {
        return $this->uri;
    }

    /**
     * Get query parameter
     */
    public function query(string $key, $default = null)
    {
        return $this->query[$key] ?? $default;
    }

    /**
     * Get all query parameters
     */
    public function allQuery(): array
    {
        return $this->query;
    }

    /**
     * Get body parameter
     */
    public function input(string $key, $default = null)
    {
        return $this->body[$key] ?? $default;
    }

    /**
     * Get all body parameters
     */
    public function all(): array
    {
        return $this->body;
    }

    /**
     * Get only specified keys from body
     */
    public function only(array $keys): array
    {
        return array_intersect_key($this->body, array_flip($keys));
    }

    /**
     * Get header value
     */
    public function getHeader(string $name): ?string
    {
        $name = strtoupper(str_replace('-', '_', $name));
        return $this->headers[$name] ?? $this->headers[str_replace('_', '-', $name)] ?? null;
    }

    /**
     * Get Bearer token from Authorization header
     */
    public function getBearerToken(): ?string
    {
        $authHeader = null;

        // Method 1: Standard Authorization header (parsed headers)
        $authHeader = $this->getHeader('Authorization');

        // Method 2: Check $_SERVER directly for HTTP_AUTHORIZATION
        if (!$authHeader && isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        }

        // Method 3: Check for REDIRECT_HTTP_AUTHORIZATION (Apache with mod_rewrite)
        if (!$authHeader && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }

        // Method 4: Check Authorization directly
        if (!$authHeader && isset($_SERVER['Authorization'])) {
            $authHeader = $_SERVER['Authorization'];
        }

        if (!$authHeader) {
            return null;
        }

        if (preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Get client IP address - SECURED against IP spoofing
     * Only trusts REMOTE_ADDR for direct connections
     */
    public function getClientIp(): string
    {
        // In production, only trust REMOTE_ADDR
        // X-Forwarded-For can be easily spoofed
        $isProduction = ($_ENV['APP_ENV'] ?? 'production') === 'production';

        if ($isProduction) {
            return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        }

        // In development, allow proxy headers (e.g., when behind Vite proxy)
        $headers = [
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'REMOTE_ADDR'
        ];

        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ips = explode(',', $_SERVER[$header]);
                $ip = trim($ips[0]);
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }

        return '0.0.0.0';
    }

    /**
     * Get user agent
     */
    public function getUserAgent(): string
    {
        return $_SERVER['HTTP_USER_AGENT'] ?? '';
    }
}
