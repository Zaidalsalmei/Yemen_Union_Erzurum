<?php
/**
 * Global Exception Handler
 * Handles all uncaught exceptions and returns proper JSON responses
 */

declare(strict_types=1);

namespace App\Core;

use App\Exceptions\ValidationException;
use App\Exceptions\AuthenticationException;
use App\Exceptions\AuthorizationException;
use App\Exceptions\NotFoundException;
use App\Helpers\Logger;

class ExceptionHandler
{
    /**
     * Handle the exception and return response array
     */
    public function handle(\Throwable $e): array
    {
        // Log the error
        $this->log($e);
        
        // Handle specific exception types
        if ($e instanceof ValidationException) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
                'errors' => $e->getErrors(),
                'code' => 422
            ];
        }
        
        if ($e instanceof AuthenticationException) {
            return [
                'success' => false,
                'message' => $e->getMessage() ?: 'غير مصادق',
                'code' => 401
            ];
        }
        
        if ($e instanceof AuthorizationException) {
            return [
                'success' => false,
                'message' => $e->getMessage() ?: 'غير مصرح لك بهذا الإجراء',
                'code' => 403
            ];
        }
        
        if ($e instanceof NotFoundException) {
            return [
                'success' => false,
                'message' => $e->getMessage() ?: 'العنصر غير موجود',
                'code' => 404
            ];
        }
        
        // Generic server error
        $isDebug = ($_ENV['APP_DEBUG'] ?? false) === 'true';
        
        return [
            'success' => false,
            'message' => 'حدث خطأ في الخادم',
            'error' => $isDebug ? $e->getMessage() : null,
            'trace' => $isDebug ? $e->getTraceAsString() : null,
            'code' => 500
        ];
    }
    
    /**
     * Log the exception
     */
    private function log(\Throwable $e): void
    {
        $message = sprintf(
            "[%s] %s in %s:%d\nStack trace:\n%s\n",
            date('Y-m-d H:i:s'),
            $e->getMessage(),
            $e->getFile(),
            $e->getLine(),
            $e->getTraceAsString()
        );
        
        $logPath = __DIR__ . '/../../storage/logs/error.log';
        error_log($message, 3, $logPath);
    }
}
