<?php
/**
 * Permission Middleware - Checks user permissions
 */

declare(strict_types=1);

namespace App\Middleware;

use App\Core\Request;
use App\Helpers\ResponseHelper;

class PermissionMiddleware
{
    private string $requiredPermission;
    
    public function __construct(string $permission)
    {
        $this->requiredPermission = $permission;
    }
    
    /**
     * Handle the permission check
     * Returns null if authorized, or error response if not
     */
    public function handle(Request $request): ?array
    {
        // User must be authenticated first
        if (!isset($request->user)) {
            return ResponseHelper::error('غير مصادق', 401);
        }
        
        // Check if user has the required permission
        if (!$this->hasPermission($request->user)) {
            return ResponseHelper::error('غير مصرح لك بهذا الإجراء', 403);
        }
        
        return null; // Success - continue to controller
    }
    
    /**
     * Check if user has the required permission
     */
    private function hasPermission(array $user): bool
    {
        $permissions = $user['permissions'] ?? [];
        
        // Check direct permission
        if (in_array($this->requiredPermission, $permissions)) {
            return true;
        }
        
        // President role has all permissions
        $roles = $user['roles'] ?? [];
        if (in_array('president', $roles)) {
            return true;
        }
        
        return false;
    }
}
