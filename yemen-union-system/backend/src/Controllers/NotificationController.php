<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Helpers\ResponseHelper;
use PDO;

class NotificationController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = \App\Core\Database::getInstance()->getConnection();
    }

    /**
     * GET /api/notifications
     */
    public function index(Request $request): array
    {
        try {
            $userId  = (int)($request->user['id'] ?? ($request->user['sub'] ?? 0));
            error_log("===== NOTIFICATION DEBUG =====");
            error_log("Request User Data: " . print_r($request->user, true));
            error_log("Resolved UserId: " . $userId);

            $page    = max(1, (int)($request->query('page') ?? 1));
            $perPage = 20;
            $offset  = ($page - 1) * $perPage;

            // فلترة is_read اختيارية
            $readFilter  = '';
            $extraParams = [];
            $isReadParam = $request->query('is_read');
            if ($isReadParam !== null && in_array($isReadParam, ['0', '1'])) {
                $readFilter              = 'AND is_read = :isRead';
                $extraParams[':isRead']  = (int)$isReadParam;
            }

            // العدد الكلي
            $countStmt = $this->db->prepare(
                "SELECT COUNT(*) FROM notifications WHERE 1=1 $readFilter"
            );
            $countStmt->execute($extraParams);
            $total = (int)$countStmt->fetchColumn();

            // البيانات
            $stmt = $this->db->prepare(
                "SELECT id, type, title, message, action_url, is_read, read_at, created_at
                 FROM notifications
                 WHERE 1=1 $readFilter
                 ORDER BY created_at DESC
                 LIMIT :limit OFFSET :offset"
            );
            $stmt->bindValue(':limit',  $perPage,  PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset,   PDO::PARAM_INT);
            if (!empty($extraParams)) {
                $stmt->bindValue(':isRead', $extraParams[':isRead'], PDO::PARAM_INT);
            }
            $stmt->execute();
            $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($notifications as &$n) {
                $n['is_read'] = (bool)$n['is_read'];
            }

            // عدد غير المقروءة
            $unreadStmt = $this->db->prepare(
                "SELECT COUNT(*) FROM notifications WHERE user_id = :userId AND is_read = 0"
            );
            $unreadStmt->execute([':userId' => $userId]);
            $unreadCount = (int)$unreadStmt->fetchColumn();

            return ResponseHelper::success('تم استرجاع الإشعارات بنجاح', [
                'notifications' => $notifications,
                'unread_count'  => $unreadCount,
                'resolved_user_id' => $userId, // Debugging
                'pagination'    => [
                    'total'       => $total,
                    'page'        => $page,
                    'per_page'    => $perPage,
                    'total_pages' => (int)ceil($total / $perPage),
                ],
            ]);
        } catch (\Exception $e) {
            error_log("NotificationController::index error: " . $e->getMessage());
            return ResponseHelper::error('خطأ في جلب الإشعارات', 500);
        }
    }

    /**
     * GET /api/notifications/unread-count
     */
    public function unreadCount(Request $request): array
    {
        try {
            $userId = (int)($request->user['id'] ?? $request->user['sub']);
            $stmt   = $this->db->prepare(
                "SELECT COUNT(*) FROM notifications WHERE user_id = :userId AND is_read = 0"
            );
            $stmt->execute([':userId' => $userId]);

            return ResponseHelper::success('عدد غير المقروءة', [
                'count' => (int)$stmt->fetchColumn(),
            ]);
        } catch (\Exception $e) {
            return ResponseHelper::error('خطأ: ' . $e->getMessage(), 500);
        }
    }

    /**
     * PUT /api/notifications/read-all
     * ⚠️ يجب أن يكون قبل /{id}/read في الـ Routes
     */
    public function markAllRead(Request $request): array
    {
        try {
            $userId = (int)($request->user['id'] ?? $request->user['sub']);
            $stmt   = $this->db->prepare(
                "UPDATE notifications SET is_read = 1, read_at = NOW()
                 WHERE user_id = :userId AND is_read = 0"
            );
            $stmt->execute([':userId' => $userId]);

            return ResponseHelper::success('تم تحديد كافة الإشعارات كمقروءة', [
                'updated'      => $stmt->rowCount(),
                'unread_count' => 0,
            ]);
        } catch (\Exception $e) {
            return ResponseHelper::error('خطأ: ' . $e->getMessage(), 500);
        }
    }

    /**
     * PUT /api/notifications/{id}/read
     */
    public function markRead(Request $request, array $params): array
    {
        try {
            $id     = (int)($params['id'] ?? 0);
            $userId = (int)($request->user['id'] ?? $request->user['sub']);

            $stmt = $this->db->prepare(
                "UPDATE notifications SET is_read = 1, read_at = NOW()
                 WHERE id = :id AND user_id = :userId"
            );
            $stmt->execute([':id' => $id, ':userId' => $userId]);

            if ($stmt->rowCount() === 0) {
                return ResponseHelper::error('الإشعار غير موجود', 404);
            }

            $unreadStmt = $this->db->prepare(
                "SELECT COUNT(*) FROM notifications WHERE user_id = :userId AND is_read = 0"
            );
            $unreadStmt->execute([':userId' => $userId]);

            return ResponseHelper::success('تم وضع الإشعار كمقروء', [
                'unread_count' => (int)$unreadStmt->fetchColumn(),
            ]);
        } catch (\Exception $e) {
            return ResponseHelper::error('خطأ: ' . $e->getMessage(), 500);
        }
    }

    /**
     * DELETE /api/notifications/clear-read
     * ⚠️ يجب أن يكون قبل /{id} في الـ Routes
     */
    public function clearRead(Request $request): array
    {
        try {
            $userId = (int)($request->user['id'] ?? $request->user['sub']);
            $stmt   = $this->db->prepare(
                "DELETE FROM notifications WHERE user_id = :userId AND is_read = 1"
            );
            $stmt->execute([':userId' => $userId]);

            return ResponseHelper::success('تم حذف الإشعارات المقروءة', [
                'deleted' => $stmt->rowCount(),
            ]);
        } catch (\Exception $e) {
            return ResponseHelper::error('خطأ: ' . $e->getMessage(), 500);
        }
    }

    /**
     * DELETE /api/notifications/{id}
     */
    public function destroy(Request $request, array $params): array
    {
        try {
            $id     = (int)($params['id'] ?? 0);
            $userId = (int)($request->user['id'] ?? $request->user['sub']);

            $stmt = $this->db->prepare(
                "DELETE FROM notifications WHERE id = :id AND user_id = :userId"
            );
            $stmt->execute([':id' => $id, ':userId' => $userId]);

            if ($stmt->rowCount() === 0) {
                return ResponseHelper::error('الإشعار غير موجود', 404);
            }

            $unreadStmt = $this->db->prepare(
                "SELECT COUNT(*) FROM notifications WHERE user_id = :userId AND is_read = 0"
            );
            $unreadStmt->execute([':userId' => $userId]);

            return ResponseHelper::success('تم حذف الإشعار', [
                'unread_count' => (int)$unreadStmt->fetchColumn(),
            ]);
        } catch (\Exception $e) {
            return ResponseHelper::error('خطأ: ' . $e->getMessage(), 500);
        }
    }
}
