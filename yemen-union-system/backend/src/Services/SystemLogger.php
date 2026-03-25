<?php
/**
 * System Logger Service
 * Centralized logging for error tracking and auditing
 * 
 * @package Yemen Student Union System
 */

declare(strict_types=1);

namespace App\Services;

use App\Core\Database;
use PDO;

class SystemLogger
{
    private static ?SystemLogger $instance = null;
    private ?PDO $db = null;
    
    /**
     * Log levels
     */
    public const INFO = 'info';
    public const WARNING = 'warning';
    public const ERROR = 'error';
    public const CRITICAL = 'critical';
    
    private function __construct()
    {
        try {
            $this->db = Database::getInstance()->getConnection();
        } catch (\Exception $e) {
            // If database connection fails, we can't log to DB
            error_log('SystemLogger: Database connection failed - ' . $e->getMessage());
        }
    }
    
    /**
     * Get singleton instance
     */
    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Log an event or error
     * 
     * @param string $pageName The page or endpoint
     * @param string $action The action being performed
     * @param string $message Description of the event
     * @param string $errorType Severity level (info, warning, error, critical)
     * @param int|null $userId User ID if available
     * @param array|null $requestData Optional request data (will be sanitized)
     * @param string|null $stackTrace Optional stack trace for errors
     */
    public function log(
        string $pageName,
        string $action,
        string $message,
        string $errorType = self::INFO,
        ?int $userId = null,
        ?array $requestData = null,
        ?string $stackTrace = null
    ): bool {
        // Always log to PHP error log as fallback
        $logLine = sprintf(
            "[%s] %s - %s: %s (User: %s)",
            strtoupper($errorType),
            $pageName,
            $action,
            $message,
            $userId ?? 'anonymous'
        );
        error_log($logLine);
        
        // If no DB connection, return
        if (!$this->db) {
            return false;
        }
        
        try {
            // Sanitize request data - remove sensitive fields
            $sanitizedData = null;
            if ($requestData) {
                $sensitiveFields = ['password', 'token', 'secret', 'api_key', 'otp', 'code'];
                $sanitizedData = $this->sanitizeData($requestData, $sensitiveFields);
            }
            
            $sql = "INSERT INTO system_logs 
                    (page_name, action, error_type, message, user_id, ip_address, user_agent, request_data, stack_trace)
                    VALUES 
                    (:page_name, :action, :error_type, :message, :user_id, :ip_address, :user_agent, :request_data, :stack_trace)";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                'page_name' => $pageName,
                'action' => $action,
                'error_type' => $errorType,
                'message' => $message,
                'user_id' => $userId,
                'ip_address' => $this->getClientIp(),
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
                'request_data' => $sanitizedData ? json_encode($sanitizedData) : null,
                'stack_trace' => $stackTrace
            ]);
            
            return true;
        } catch (\Exception $e) {
            error_log('SystemLogger: Failed to write to database - ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Log info level message
     */
    public function info(string $pageName, string $action, string $message, ?int $userId = null, ?array $requestData = null): bool
    {
        return $this->log($pageName, $action, $message, self::INFO, $userId, $requestData);
    }
    
    /**
     * Log warning level message
     */
    public function warning(string $pageName, string $action, string $message, ?int $userId = null, ?array $requestData = null): bool
    {
        return $this->log($pageName, $action, $message, self::WARNING, $userId, $requestData);
    }
    
    /**
     * Log error level message
     */
    public function error(string $pageName, string $action, string $message, ?int $userId = null, ?array $requestData = null, ?string $stackTrace = null): bool
    {
        return $this->log($pageName, $action, $message, self::ERROR, $userId, $requestData, $stackTrace);
    }
    
    /**
     * Log critical level message
     */
    public function critical(string $pageName, string $action, string $message, ?int $userId = null, ?array $requestData = null, ?string $stackTrace = null): bool
    {
        return $this->log($pageName, $action, $message, self::CRITICAL, $userId, $requestData, $stackTrace);
    }
    
    /**
     * Log an exception
     */
    public function logException(string $pageName, string $action, \Throwable $exception, ?int $userId = null, ?array $requestData = null): bool
    {
        return $this->log(
            $pageName,
            $action,
            $exception->getMessage(),
            self::ERROR,
            $userId,
            $requestData,
            $exception->getTraceAsString()
        );
    }
    
    /**
     * Get client IP address
     */
    private function getClientIp(): string
    {
        $headers = [
            'HTTP_CLIENT_IP',
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_FORWARDED',
            'HTTP_X_CLUSTER_CLIENT_IP',
            'HTTP_FORWARDED_FOR',
            'HTTP_FORWARDED',
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
     * Sanitize sensitive data from arrays
     */
    private function sanitizeData(array $data, array $sensitiveFields): array
    {
        $sanitized = [];
        foreach ($data as $key => $value) {
            $keyLower = strtolower($key);
            $isSensitive = false;
            
            foreach ($sensitiveFields as $field) {
                if (str_contains($keyLower, strtolower($field))) {
                    $isSensitive = true;
                    break;
                }
            }
            
            if ($isSensitive) {
                $sanitized[$key] = '[REDACTED]';
            } elseif (is_array($value)) {
                $sanitized[$key] = $this->sanitizeData($value, $sensitiveFields);
            } else {
                $sanitized[$key] = $value;
            }
        }
        
        return $sanitized;
    }
    
    /**
     * Get recent logs (for admin viewing)
     */
    public function getRecentLogs(int $limit = 100, ?string $errorType = null, ?int $userId = null): array
    {
        if (!$this->db) {
            return [];
        }
        
        try {
            $sql = "SELECT sl.*, u.full_name as user_name 
                    FROM system_logs sl 
                    LEFT JOIN users u ON sl.user_id = u.id 
                    WHERE 1=1";
            $params = [];
            
            if ($errorType) {
                $sql .= " AND sl.error_type = :error_type";
                $params['error_type'] = $errorType;
            }
            
            if ($userId) {
                $sql .= " AND sl.user_id = :user_id";
                $params['user_id'] = $userId;
            }
            
            $sql .= " ORDER BY sl.created_at DESC LIMIT :limit";
            
            $stmt = $this->db->prepare($sql);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            error_log('SystemLogger: Failed to retrieve logs - ' . $e->getMessage());
            return [];
        }
    }
}
