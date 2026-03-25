<?php
/**
 * Logger Helper - Structured logging utility
 */

declare(strict_types=1);

namespace App\Helpers;

class Logger
{
    private const LOG_PATH = __DIR__ . '/../../storage/logs/';
    
    /**
     * Log info message
     */
    public static function info(string $message, array $context = []): void
    {
        self::log('INFO', $message, $context, 'app.log');
    }
    
    /**
     * Log warning message
     */
    public static function warning(string $message, array $context = []): void
    {
        self::log('WARNING', $message, $context, 'app.log');
    }
    
    /**
     * Log error message
     */
    public static function error(string $message, array $context = []): void
    {
        self::log('ERROR', $message, $context, 'error.log');
    }
    
    /**
     * Log audit action
     */
    public static function audit(string $action, array $context = []): void
    {
        self::log('AUDIT', $action, $context, 'audit.log');
    }
    
    /**
     * Write log entry
     */
    private static function log(string $level, string $message, array $context, string $file): void
    {
        $entry = sprintf(
            "[%s] [%s] %s %s\n",
            date('Y-m-d H:i:s'),
            $level,
            $message,
            !empty($context) ? json_encode($context, JSON_UNESCAPED_UNICODE) : ''
        );
        
        $logFile = self::LOG_PATH . $file;
        
        // Create directory if not exists
        $dir = dirname($logFile);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        
        file_put_contents($logFile, $entry, FILE_APPEND | LOCK_EX);
    }
}
