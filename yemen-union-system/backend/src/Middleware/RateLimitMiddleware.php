<?php
/**
 * Rate Limit Middleware - Protects against brute force attacks
 * Uses file-based storage (no Redis needed)
 */
declare(strict_types=1);

namespace App\Middleware;

use App\Core\Request;
use App\Helpers\ResponseHelper;

class RateLimitMiddleware
{
    private string $storagePath;

    // Rate limits per endpoint type
    private array $limits = [
        'login'   => ['max' => 5,  'window' => 900],   // 5 attempts / 15 min
        'otp'     => ['max' => 3,  'window' => 600],   // 3 attempts / 10 min
        'api'     => ['max' => 60, 'window' => 60],    // 60 requests / 1 min
    ];

    // Endpoints that need strict rate limiting
    private array $strictEndpoints = [
        '/api/auth/login'          => 'login',
        '/api/auth/verify-otp'     => 'otp',
        '/api/auth/send-otp'       => 'otp',
        '/api/auth/forgot-password' => 'otp',
    ];

    public function __construct()
    {
        $this->storagePath = __DIR__ . '/../../storage/rate_limits/';

        if (!is_dir($this->storagePath)) {
            mkdir($this->storagePath, 0755, true);
        }

        // Load limits from env if available
        $this->limits['login']['max'] = (int)($_ENV['RATE_LIMIT_LOGIN'] ?? 5);
        $this->limits['otp']['max']   = (int)($_ENV['RATE_LIMIT_OTP'] ?? 3);
        $this->limits['api']['max']   = (int)($_ENV['RATE_LIMIT_API'] ?? 60);
    }

    public function handle(Request $request): ?array
    {
        $ip = $this->getClientIp();
        $uri = strtolower($_SERVER['REQUEST_URI'] ?? '');

        // Remove query string
        $uri = strtok($uri, '?');

        // Determine rate limit type
        $type = $this->strictEndpoints[$uri] ?? 'api';
        $limit = $this->limits[$type];

        // Generate unique key
        $key = md5($ip . ':' . $type . ':' . $uri);

        // Check rate limit
        if ($this->isRateLimited($key, $limit['max'], $limit['window'])) {
            $retryAfter = $this->getRetryAfter($key, $limit['window']);

            return [
                'success' => false,
                'message' => 'تم تجاوز الحد المسموح من الطلبات. حاول مرة أخرى بعد ' . ceil($retryAfter / 60) . ' دقيقة',
                'code' => 429,
                'retry_after' => $retryAfter
            ];
        }

        // Record this request
        $this->recordRequest($key);

        return null; // Continue
    }

    private function isRateLimited(string $key, int $max, int $window): bool
    {
        $file = $this->storagePath . $key . '.json';

        if (!file_exists($file)) {
            return false;
        }

        $data = json_decode(file_get_contents($file), true);

        if (!$data) {
            return false;
        }

        // Clean old entries
        $now = time();
        $data['requests'] = array_filter(
            $data['requests'] ?? [],
            fn($timestamp) => ($now - $timestamp) < $window
        );

        // Save cleaned data
        file_put_contents($file, json_encode($data), LOCK_EX);

        return count($data['requests']) >= $max;
    }

    private function recordRequest(string $key): void
    {
        $file = $this->storagePath . $key . '.json';
        $data = ['requests' => []];

        if (file_exists($file)) {
            $data = json_decode(file_get_contents($file), true) ?? ['requests' => []];
        }

        $data['requests'][] = time();

        file_put_contents($file, json_encode($data), LOCK_EX);
    }

    private function getRetryAfter(string $key, int $window): int
    {
        $file = $this->storagePath . $key . '.json';

        if (!file_exists($file)) {
            return 0;
        }

        $data = json_decode(file_get_contents($file), true);
        $oldest = min($data['requests'] ?? [time()]);

        return max(0, $window - (time() - $oldest));
    }

    private function getClientIp(): string
    {
        // Only trust X-Forwarded-For if behind a known proxy
        // For direct connections, use REMOTE_ADDR only
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }
}
