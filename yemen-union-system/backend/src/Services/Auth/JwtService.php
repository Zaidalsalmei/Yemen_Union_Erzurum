<?php
declare(strict_types=1);

namespace App\Services\Auth;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtService
{
    private string $secret;
    private int $accessExpiry;
    private int $refreshExpiry;
    private string $algorithm = 'HS256';

    public function __construct()
    {
        $this->secret = $_ENV['JWT_SECRET'] ?? '';

        if (empty($this->secret) || strlen($this->secret) < 32) {
            throw new \RuntimeException('JWT_SECRET must be at least 32 characters long');
        }

        $this->accessExpiry = (int)($_ENV['JWT_EXPIRY'] ?? 900);
        $this->refreshExpiry = (int)($_ENV['JWT_REFRESH_EXPIRY'] ?? 604800);
    }

    public function generate(array $user, int $sessionId): string
    {
        return $this->generateAccessToken(
            (int) $user['id'],
            $user['full_name'] ?? '',
            $sessionId
        );
    }

    public function generateAccessToken(int $userId, string $userName, int $sessionId): string
    {
        $issuedAt = time();
        $payload = [
            'iss' => $_ENV['APP_URL'] ?? 'yemen-union',
            'iat' => $issuedAt,
            'exp' => $issuedAt + $this->accessExpiry,
            'sub' => $userId,
            'name' => $userName,
            'session_id' => $sessionId,
            'type' => 'access'
        ];

        return JWT::encode($payload, $this->secret, $this->algorithm);
    }

    public function generateRefreshToken(int $userId, int $sessionId): string
    {
        $issuedAt = time();
        $payload = [
            'iss' => $_ENV['APP_URL'] ?? 'yemen-union',
            'iat' => $issuedAt,
            'exp' => $issuedAt + $this->refreshExpiry,
            'sub' => $userId,
            'session_id' => $sessionId,
            'type' => 'refresh'
        ];

        return JWT::encode($payload, $this->secret, $this->algorithm);
    }

    public function verify(string $token): array
    {
        $decoded = JWT::decode($token, new Key($this->secret, $this->algorithm));
        return (array) $decoded;
    }

    public function verifyAccessToken(string $token): array
    {
        $payload = $this->verify($token);
        if (($payload['type'] ?? '') !== 'access') {
            throw new \Exception('Invalid token type: expected access token');
        }
        return $payload;
    }

    public function verifyRefreshToken(string $token): array
    {
        $payload = $this->verify($token);
        if (($payload['type'] ?? '') !== 'refresh') {
            throw new \Exception('Invalid token type: expected refresh token');
        }
        return $payload;
    }

    public function getExpiryTimestamp(): int
    {
        return time() + $this->accessExpiry;
    }

    public function getRefreshExpiryTimestamp(): int
    {
        return time() + $this->refreshExpiry;
    }

    public function getAccessExpiry(): int
    {
        return $this->accessExpiry;
    }

    public function getRefreshExpiry(): int
    {
        return $this->refreshExpiry;
    }
}