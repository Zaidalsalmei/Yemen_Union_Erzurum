<?php
/**
 * Member Notification Controller
 * Handles notification operations for members
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Helpers\ResponseHelper;
use PDO;

class MemberNotificationController
{
    private PDO $db;
    
    public function __construct()
    {
        $this->db = \App\Core\Database::getInstance()->getConnection();
    }
    
    /**
     * GET /api/member/notifications
     * Get notifications for the authenticated member
     */
    public function index(Request $request): array
    {
        // Get authenticated user ID
        $userId = $request->user['id'] ?? null;
        
        if (!$userId) {
            return ResponseHelper::error('غير مصرح', 401);
        }
        
        try {
            // Get pagination parameters
            $page = max(1, (int) $request->query('page', 1));
            $limit = min(100, max(1, (int) $request->query('limit', 20)));
            $offset = ($page - 1) * $limit;
            
            // Get unread_only filter
            $unreadOnly = filter_var($request->query('unread_only', false), FILTER_VALIDATE_BOOLEAN);
            
            // Build query
            $whereClause = "(user_id = :user_id OR user_id IS NULL)";
            if ($unreadOnly) {
                $whereClause .= " AND is_read = 0";
            }
            
            // Get total count
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as total
                FROM notifications 
                WHERE $whereClause
            ");
            $stmt->execute(['user_id' => $userId]);
            $total = (int) $stmt->fetch()['total'];
            
            // Get unread count
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as count
                FROM notifications 
                WHERE (user_id = :user_id OR user_id IS NULL)
                    AND is_read = 0
            ");
            $stmt->execute(['user_id' => $userId]);
            $unreadCount = (int) $stmt->fetch()['count'];
            
            // Get notifications
            $stmt = $this->db->prepare("
                SELECT 
                    id,
                    type,
                    title,
                    message,
                    action_url,
                    is_read,
                    created_at
                FROM notifications 
                WHERE $whereClause
                ORDER BY is_read ASC, created_at DESC
                LIMIT :limit OFFSET :offset
            ");
            
            $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Convert is_read to boolean
            foreach ($notifications as &$notification) {
                $notification['is_read'] = (bool) $notification['is_read'];
            }
            
            // Calculate pagination
            $totalPages = ceil($total / $limit);
            
            return ResponseHelper::success('تم جلب البيانات بنجاح', [
                'notifications' => $notifications,
                'unread_count' => $unreadCount,
                'pagination' => [
                    'current_page' => $page,
                    'total_pages' => $totalPages,
                    'total_items' => $total,
                    'per_page' => $limit
                ]
            ]);
            
        } catch (\Exception $e) {
            error_log("Member Notifications Error: " . $e->getMessage());
            return ResponseHelper::error('حدث خطأ في جلب البيانات', 500);
        }
    }
    
    /**
     * POST /api/member/notifications/{id}/mark-read
     * Mark a notification as read
     */
    public function markAsRead(Request $request, array $params): array
    {
        $userId = $request->user['id'] ?? null;
        $notificationId = (int) $params['id'];
        
        if (!$userId) {
            return ResponseHelper::error('غير مصرح', 401);
        }
        
        try {
            // Mark as read (only if it belongs to the user)
            $stmt = $this->db->prepare("
                UPDATE notifications 
                SET is_read = 1
                WHERE id = :id 
                    AND (user_id = :user_id OR user_id IS NULL)
            ");
            $stmt->execute([
                'id' => $notificationId,
                'user_id' => $userId
            ]);
            
            return ResponseHelper::success('تم تحديث الإشعار بنجاح');
            
        } catch (\Exception $e) {
            error_log("Mark Notification Read Error: " . $e->getMessage());
            return ResponseHelper::error('حدث خطأ في التحديث', 500);
        }
    }
    
    /**
     * POST /api/member/notifications/mark-all-read
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request): array
    {
        $userId = $request->user['id'] ?? null;
        
        if (!$userId) {
            return ResponseHelper::error('غير مصرح', 401);
        }
        
        try {
            $stmt = $this->db->prepare("
                UPDATE notifications 
                SET is_read = 1
                WHERE (user_id = :user_id OR user_id IS NULL) AND is_read = 0
            ");
            $stmt->execute(['user_id' => $userId]);
            
            return ResponseHelper::success('تم تحديث جميع الإشعارات بنجاح');
            
        } catch (\Exception $e) {
            error_log("Mark All Notifications Read Error: " . $e->getMessage());
            return ResponseHelper::error('حدث خطأ في التحديث', 500);
        }
    }

    /**
     * DELETE /api/member/notifications/{id}
     * Delete a notification
     */
    public function destroy(Request $request, array $params): array
    {
        $userId = $request->user['id'] ?? null;
        $notificationId = (int) $params['id'];
        
        if (!$userId) {
            return ResponseHelper::error('غير مصرح', 401);
        }
        
        try {
            $stmt = $this->db->prepare("
                DELETE FROM notifications 
                WHERE id = :id 
                    AND (user_id = :user_id OR user_id IS NULL)
            ");
            $stmt->execute([
                'id' => $notificationId,
                'user_id' => $userId
            ]);
            
            return ResponseHelper::success('تم حذف الإشعار بنجاح');
            
        } catch (\Exception $e) {
            error_log("Delete Notification Error: " . $e->getMessage());
            return ResponseHelper::error('حدث خطأ في الحذف', 500);
        }
    }
}
