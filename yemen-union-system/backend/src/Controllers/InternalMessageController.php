<?php
/**
 * Internal Messages Controller
 * نظام الرسائل الداخلية بين الأعضاء والإدارة
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Helpers\ResponseHelper;

class InternalMessageController
{
    private ?\PDO $db = null;

    public function __construct()
    {
        try {
            $this->db = \App\Core\Database::getInstance()->getConnection();
        } catch (\Throwable $e) {}
    }

    // =====================================================
    // GET /api/messages/inbox
    // صندوق الوارد للمستخدم الحالي
    // =====================================================
    public function inbox(Request $request): array
    {
        try {
            if (!$this->db) return ResponseHelper::error('خطأ في الاتصال', 500);

            $userId  = (int) $request->user['id'];
            $page    = max(1, (int) $request->query('page', 1));
            $perPage = min((int) $request->query('per_page', 20), 50);
            $offset  = ($page - 1) * $perPage;

            $stmt = $this->db->prepare("
                SELECT 
                    m.id,
                    m.sender_id,
                    u.full_name as sender_name,
                    u.profile_photo as sender_photo,
                    m.subject,
                    LEFT(m.body, 100) as body_preview,
                    m.is_read,
                    m.read_at,
                    m.group_type,
                    m.created_at
                FROM internal_messages m
                JOIN users u ON m.sender_id = u.id
                WHERE (m.receiver_id = ? OR m.group_type = 'all')
                  AND m.deleted_by_receiver = FALSE
                ORDER BY m.created_at DESC
                LIMIT ? OFFSET ?
            ");
            $stmt->execute([$userId, $perPage, $offset]);
            $messages = $stmt->fetchAll() ?: [];

            $countStmt = $this->db->prepare("
                SELECT COUNT(*) as total
                FROM internal_messages
                WHERE (receiver_id = ? OR group_type = 'all') AND deleted_by_receiver = FALSE
            ");
            $countStmt->execute([$userId]);
            $total = (int) $countStmt->fetch()['total'];

            // عدد الرسائل غير المقروءة
            $unreadStmt = $this->db->prepare("
                SELECT COUNT(*) as count FROM internal_messages
                WHERE (receiver_id = ? OR group_type = 'all') AND is_read = FALSE AND deleted_by_receiver = FALSE
            ");
            $unreadStmt->execute([$userId]);
            $unread = (int) $unreadStmt->fetch()['count'];

            return ResponseHelper::success('تم جلب صندوق الوارد', [
                'messages' => $messages,
                'total'    => $total,
                'unread'   => $unread,
                'page'     => $page,
                'per_page' => $perPage,
            ]);
        } catch (\Throwable $e) {
            return ResponseHelper::error('فشل تحميل الرسائل: ' . $e->getMessage(), 500);
        }
    }

    // =====================================================
    // GET /api/messages/sent
    // الرسائل المُرسلة
    // =====================================================
    public function sent(Request $request): array
    {
        try {
            if (!$this->db) return ResponseHelper::error('خطأ في الاتصال', 500);

            $userId  = (int) $request->user['id'];
            $page    = max(1, (int) $request->query('page', 1));
            $perPage = min((int) $request->query('per_page', 20), 50);
            $offset  = ($page - 1) * $perPage;

            $stmt = $this->db->prepare("
                SELECT 
                    m.*,
                    COALESCE(u.full_name, 'الجميع') as receiver_name
                FROM internal_messages m
                LEFT JOIN users u ON m.receiver_id = u.id
                WHERE m.sender_id = ? AND m.deleted_by_sender = FALSE
                ORDER BY m.created_at DESC
                LIMIT ? OFFSET ?
            ");
            $stmt->execute([$userId, $perPage, $offset]);
            $messages = $stmt->fetchAll() ?: [];

            $countStmt = $this->db->prepare("SELECT COUNT(*) as total FROM internal_messages WHERE sender_id=? AND deleted_by_sender=FALSE");
            $countStmt->execute([$userId]);
            $total = (int) $countStmt->fetch()['total'];

            return ResponseHelper::paginated($messages, $total, $page, $perPage);
        } catch (\Throwable $e) {
            return ResponseHelper::error('فشل تحميل الرسائل: ' . $e->getMessage(), 500);
        }
    }

    // =====================================================
    // GET /api/messages/{id}
    // عرض رسالة واحدة وتعيينها كمقروءة
    // =====================================================
    public function show(Request $request, int $id): array
    {
        try {
            if (!$this->db) return ResponseHelper::error('خطأ في الاتصال', 500);

            $userId = (int) $request->user['id'];

            $stmt = $this->db->prepare("
                SELECT m.*,
                    u1.full_name as sender_name, u1.profile_photo as sender_photo,
                    COALESCE(u2.full_name, 'الجميع') as receiver_name
                FROM internal_messages m
                JOIN users u1 ON m.sender_id = u1.id
                LEFT JOIN users u2 ON m.receiver_id = u2.id
                WHERE m.id = ?
                  AND (m.sender_id = ? OR m.receiver_id = ? OR m.group_type = 'all')
            ");
            $stmt->execute([$id, $userId, $userId]);
            $msg = $stmt->fetch();

            if (!$msg) return ResponseHelper::error('الرسالة غير موجودة', 404);

            // تعيين كمقروءة إذا كان المستخدم هو المستقبل
            if (!$msg['is_read'] && ($msg['receiver_id'] == $userId || $msg['group_type'] === 'all')) {
                $this->db->prepare("UPDATE internal_messages SET is_read=TRUE, read_at=NOW() WHERE id=?")->execute([$id]);
            }

            return ResponseHelper::success('تم جلب الرسالة', $msg);
        } catch (\Throwable $e) {
            return ResponseHelper::error('فشل جلب الرسالة: ' . $e->getMessage(), 500);
        }
    }

    // =====================================================
    // POST /api/messages
    // إرسال رسالة جديدة
    // =====================================================
    public function store(Request $request): array
    {
        try {
            if (!$this->db) return ResponseHelper::error('خطأ في الاتصال', 500);

            $data = $request->body();
            if (empty($data['body'])) return ResponseHelper::error('محتوى الرسالة مطلوب', 422);

            $senderId   = (int) $request->user['id'];
            $groupType  = $data['group_type'] ?? 'individual';
            $receiverId = $data['receiver_id'] ?? null;

            // التحقق من الإرسال الفردي
            if ($groupType === 'individual' && empty($receiverId)) {
                return ResponseHelper::error('يجب تحديد المستقبل للرسائل الفردية', 422);
            }

            $stmt = $this->db->prepare("
                INSERT INTO internal_messages 
                    (sender_id, receiver_id, group_type, target_role, subject, body)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $senderId,
                $groupType === 'individual' ? (int) $receiverId : null,
                $groupType,
                $data['target_role'] ?? null,
                $data['subject'] ?? null,
                $data['body'],
            ]);

            $id = (int) $this->db->lastInsertId();
            return ResponseHelper::success('تم إرسال الرسالة بنجاح', ['id' => $id], 201);
        } catch (\Throwable $e) {
            return ResponseHelper::error('فشل إرسال الرسالة: ' . $e->getMessage(), 500);
        }
    }

    // =====================================================
    // DELETE /api/messages/{id}
    // حذف رسالة (ناعم حسب الطرف)
    // =====================================================
    public function destroy(Request $request, int $id): array
    {
        try {
            if (!$this->db) return ResponseHelper::error('خطأ في الاتصال', 500);

            $userId = (int) $request->user['id'];

            $stmt = $this->db->prepare("SELECT * FROM internal_messages WHERE id=?");
            $stmt->execute([$id]);
            $msg = $stmt->fetch();

            if (!$msg) return ResponseHelper::error('الرسالة غير موجودة', 404);

            if ($msg['sender_id'] == $userId) {
                $this->db->prepare("UPDATE internal_messages SET deleted_by_sender=TRUE WHERE id=?")->execute([$id]);
            } elseif ($msg['receiver_id'] == $userId) {
                $this->db->prepare("UPDATE internal_messages SET deleted_by_receiver=TRUE WHERE id=?")->execute([$id]);
            } else {
                return ResponseHelper::error('غير مصرح لك بحذف هذه الرسالة', 403);
            }

            return ResponseHelper::success('تم حذف الرسالة');
        } catch (\Throwable $e) {
            return ResponseHelper::error('فشل حذف الرسالة: ' . $e->getMessage(), 500);
        }
    }

    // =====================================================
    // GET /api/messages/unread-count
    // عدد الرسائل غير المقروءة (للـ badge)
    // =====================================================
    public function unreadCount(Request $request): array
    {
        try {
            if (!$this->db) return ResponseHelper::success('', ['count' => 0]);

            $userId = (int) $request->user['id'];
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as count FROM internal_messages
                WHERE (receiver_id=? OR group_type='all') AND is_read=FALSE AND deleted_by_receiver=FALSE
            ");
            $stmt->execute([$userId]);
            $count = (int) $stmt->fetch()['count'];

            return ResponseHelper::success('عدد الرسائل', ['count' => $count]);
        } catch (\Throwable $e) {
            return ResponseHelper::success('', ['count' => 0]);
        }
    }
}
