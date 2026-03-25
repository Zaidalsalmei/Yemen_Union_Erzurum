<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Helpers\ResponseHelper;
use PDO;

class SupportTicketController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = \App\Core\Database::getInstance()->getConnection();
    }

    private function isAdmin(?int $userId): bool
    {
        if (!$userId) return false;
        try {
            $stmt = $this->db->prepare("SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = ? AND ur.is_active = 1");
            $stmt->execute([$userId]);
            $roles = $stmt->fetchAll(PDO::FETCH_COLUMN);
            return in_array('president', $roles) || in_array('admin', $roles) || in_array('vice_president', $roles);
        } catch (\Exception $e) {
            return false;
        }
    }

    public function index(Request $request): array
    {
        try {
            $userId = $request->user['id'] ?? $request->user['sub'] ?? null;
            $isAdmin = $this->isAdmin((int)$userId);

            $status = $request->input('status');
            $priority = $request->input('priority');
            $search = $request->input('search');
            $page = (int)($request->input('page') ?? 1);
            $perPage = (int)($request->input('per_page') ?? 20);

            if ($page < 1) $page = 1;
            if ($perPage < 1) $perPage = 20;
            $offset = ($page - 1) * $perPage;

            $whereParts = ["1=1"];
            $params = [];

            if (!$isAdmin) {
                $whereParts[] = "t.user_id = :user_id";
                $params[':user_id'] = $userId;
            }

            if ($status) {
                $whereParts[] = "t.status = :status";
                $params[':status'] = $status;
            }

            if ($priority) {
                $whereParts[] = "t.priority = :priority";
                $params[':priority'] = $priority;
            }

            if ($search) {
                $whereParts[] = "(t.subject LIKE :search OR t.message LIKE :search OR u.full_name LIKE :search)";
                $params[':search'] = "%$search%";
            }

            $whereSql = implode(" AND ", $whereParts);

            // Count total
            $countSql = "SELECT COUNT(*) as total FROM support_tickets t LEFT JOIN users u ON t.user_id = u.id WHERE $whereSql";
            $countStmt = $this->db->prepare($countSql);
            $countStmt->execute($params);
            $total = (int)$countStmt->fetch(PDO::FETCH_ASSOC)['total'];

            // Fetch data
            $fetchSql = "SELECT 
                            t.*, 
                            u.full_name as user_name,
                            assigned.full_name as assigned_to_name
                         FROM support_tickets t
                         LEFT JOIN users u ON t.user_id = u.id
                         LEFT JOIN users assigned ON t.assigned_to = assigned.id
                         WHERE $whereSql
                         ORDER BY FIELD(t.priority, 'urgent', 'high', 'medium', 'low'), t.created_at DESC
                         LIMIT :limit OFFSET :offset";

            $fetchStmt = $this->db->prepare($fetchSql);
            foreach ($params as $key => $val) {
                $fetchStmt->bindValue($key, $val);
            }
            $fetchStmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
            $fetchStmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $fetchStmt->execute();

            $tickets = $fetchStmt->fetchAll(PDO::FETCH_ASSOC);

            return ResponseHelper::success('تم استرجاع التذاكر', [
                'data' => [
                    'tickets' => $tickets,
                    'pagination' => [
                        'total' => $total,
                        'page' => $page,
                        'per_page' => $perPage,
                        'total_pages' => ceil($total / $perPage)
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            error_log("SupportTicket index error: " . $e->getMessage());
            return ResponseHelper::error('خطأ في استرجاع التذاكر: ' . $e->getMessage(), 500);
        }
    }

    public function store(Request $request): array
    {
        try {
            $subject = $request->input('subject');
            $message = $request->input('message');
            $category = $request->input('category');
            $priority = $request->input('priority') ?? 'medium';
            
            if (!$subject || !$message) {
                return ResponseHelper::error('العنوان والرسالة مطلوبان', 400);
            }

            $userId = $request->user['id'] ?? $request->user['sub'] ?? null;

            $sql = "INSERT INTO support_tickets 
                    (user_id, subject, message, status, priority, category, created_at, updated_at) 
                    VALUES 
                    (:user_id, :subject, :message, 'open', :priority, :category, NOW(), NOW())";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':user_id' => $userId,
                ':subject' => $subject,
                ':message' => $message,
                ':priority' => $priority,
                ':category' => $category
            ]);

            return ResponseHelper::success('تم إنشاء التذكرة بنجاح', ['id' => $this->db->lastInsertId()]);
        } catch (\Exception $e) {
            error_log("SupportTicket store error: " . $e->getMessage());
            return ResponseHelper::error('خطأ في إنشاء التذكرة: ' . $e->getMessage(), 500);
        }
    }

    public function show(Request $request, array $params): array
    {
        try {
            $id = $params['id'] ?? null;
            if (!$id) {
                return ResponseHelper::error('معرف التذكرة غير موجود', 400);
            }

            $realUserId = $request->user['id'] ?? $request->user['sub'] ?? null;
            $isAdmin = $this->isAdmin((int)$realUserId);

            $sql = "SELECT t.*, u.full_name as user_name, assigned.full_name as assigned_to_name
                    FROM support_tickets t
                    LEFT JOIN users u ON t.user_id = u.id
                    LEFT JOIN users assigned ON t.assigned_to = assigned.id
                    WHERE t.id = :id";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);
            $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$ticket) {
                return ResponseHelper::error('التذكرة غير موجودة', 404);
            }

            if (!$isAdmin && $ticket['user_id'] != $realUserId) {
                return ResponseHelper::error('غير مصرح لك بعرض هذه التذكرة', 403);
            }

            // Get replies
            $repliesSql = "SELECT r.*, u.full_name as user_name
                           FROM support_replies r
                           LEFT JOIN users u ON r.user_id = u.id
                           WHERE r.ticket_id = :ticket_id
                           ORDER BY r.created_at ASC";
            $repliesStmt = $this->db->prepare($repliesSql);
            $repliesStmt->execute([':ticket_id' => $id]);
            $ticket['replies'] = $repliesStmt->fetchAll(PDO::FETCH_ASSOC);

            return ResponseHelper::success('تم استرجاع تفاصيل التذكرة', $ticket);
        } catch (\Exception $e) {
            error_log("SupportTicket show error: " . $e->getMessage());
            return ResponseHelper::error('خطأ في استرجاع التذكرة: ' . $e->getMessage(), 500);
        }
    }

    public function update(Request $request, array $params): array
    {
        try {
            $id = $params['id'] ?? null;
            if (!$id) {
                return ResponseHelper::error('معرف التذكرة غير موجود', 400);
            }

            $userId = $request->user['id'] ?? $request->user['sub'] ?? null;
            if (!$this->isAdmin((int)$userId)) {
                return ResponseHelper::error('غير مصرح لك بتعديل التذكرة', 403);
            }

            $checkStmt = $this->db->prepare("SELECT id FROM support_tickets WHERE id = :id");
            $checkStmt->execute([':id' => $id]);
            if (!$checkStmt->fetch()) {
                return ResponseHelper::error('التذكرة غير موجودة', 404);
            }

            $updateFields = [];
            $queryParams = [':id' => $id];

            $fields = ['status', 'priority', 'category', 'assigned_to'];

            foreach ($fields as $field) {
                $val = $request->input($field);
                if ($val !== null) {
                    $updateFields[] = "$field = :$field";
                    $queryParams[":$field"] = $val;
                }
            }

            if (empty($updateFields)) {
                return ResponseHelper::error('لا توجد بيانات للتعديل', 400);
            }

            $updateFields[] = "updated_at = NOW()";

            $sql = "UPDATE support_tickets SET " . implode(", ", $updateFields) . " WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($queryParams);

            return ResponseHelper::success('تم تعديل التذكرة بنجاح', null);
        } catch (\Exception $e) {
            error_log("SupportTicket update error: " . $e->getMessage());
            return ResponseHelper::error('خطأ في تعديل التذكرة: ' . $e->getMessage(), 500);
        }
    }

    public function reply(Request $request, array $params): array
    {
        try {
            $id = $params['id'] ?? null;
            $message = $request->input('message');

            if (!$id || !$message) {
                return ResponseHelper::error('معرف التذكرة والرسالة مطلوبان', 400);
            }

            $userId = $request->user['id'] ?? $request->user['sub'] ?? null;
            $isAdmin = $this->isAdmin((int)$userId);

            // Fetch ticket
            $tStmt = $this->db->prepare("SELECT user_id, status FROM support_tickets WHERE id = :id");
            $tStmt->execute([':id' => $id]);
            $ticket = $tStmt->fetch(PDO::FETCH_ASSOC);

            if (!$ticket) {
                return ResponseHelper::error('التذكرة غير موجودة', 404);
            }

            if (!$isAdmin && $ticket['user_id'] != $userId) {
                return ResponseHelper::error('غير مصرح لك بالرد على هذه التذكرة', 403);
            }

            $this->db->beginTransaction();

            $replySql = "INSERT INTO support_replies (ticket_id, user_id, message, is_admin, created_at) 
                         VALUES (:ticket_id, :user_id, :message, :is_admin, NOW())";
            $replyStmt = $this->db->prepare($replySql);
            $replyStmt->execute([
                ':ticket_id' => $id,
                ':user_id' => $userId,
                ':message' => $message,
                ':is_admin' => $isAdmin ? 1 : 0
            ]);

            // Update ticket status to in_progress if admin replied and it was open
            if ($isAdmin && $ticket['status'] === 'open') {
                $updateStatusStmt = $this->db->prepare("UPDATE support_tickets SET status = 'in_progress', updated_at = NOW() WHERE id = :id");
                $updateStatusStmt->execute([':id' => $id]);
            } else {
                $updateTimeStmt = $this->db->prepare("UPDATE support_tickets SET updated_at = NOW() WHERE id = :id");
                $updateTimeStmt->execute([':id' => $id]);
            }

            $this->db->commit();

            return ResponseHelper::success('تمت إضافة الرد بنجاح', ['id' => $this->db->lastInsertId()]);
        } catch (\Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log("SupportTicket reply error: " . $e->getMessage());
            return ResponseHelper::error('خطأ في إضافة الرد: ' . $e->getMessage(), 500);
        }
    }

    public function close(Request $request, array $params): array
    {
        try {
            $id = $params['id'] ?? null;
            if (!$id) {
                return ResponseHelper::error('معرف التذكرة غير موجود', 400);
            }

            $userId = $request->user['id'] ?? $request->user['sub'] ?? null;
            $isAdmin = $this->isAdmin((int)$userId);

            $tStmt = $this->db->prepare("SELECT user_id FROM support_tickets WHERE id = :id");
            $tStmt->execute([':id' => $id]);
            $ticket = $tStmt->fetch(PDO::FETCH_ASSOC);

            if (!$ticket) {
                return ResponseHelper::error('التذكرة غير موجودة', 404);
            }

            if (!$isAdmin && $ticket['user_id'] != $userId) {
                return ResponseHelper::error('غير مصرح لك بإغلاق هذه التذكرة', 403);
            }

            $stmt = $this->db->prepare("UPDATE support_tickets SET status = 'closed', updated_at = NOW() WHERE id = :id");
            $stmt->execute([':id' => $id]);

            return ResponseHelper::success('تم إغلاق التذكرة بنجاح', null);
        } catch (\Exception $e) {
            error_log("SupportTicket close error: " . $e->getMessage());
            return ResponseHelper::error('خطأ في إغلاق التذكرة: ' . $e->getMessage(), 500);
        }
    }

    public function stats(Request $request): array
    {
        try {
            $stats = [
                'by_status' => [],
                'by_priority' => [],
                'avg_response_time' => 0
            ];

            try {
                $stmt = $this->db->query("SELECT status, COUNT(*) as count FROM support_tickets GROUP BY status");
                $stats['by_status'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (\Exception $e) {}

            try {
                $stmt = $this->db->query("SELECT priority, COUNT(*) as count FROM support_tickets GROUP BY priority");
                $stats['by_priority'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (\Exception $e) {}

            return ResponseHelper::success('إحصائيات تذاكر الدعم الدعم', $stats);
        } catch (\Exception $e) {
            error_log("SupportTicket stats error: " . $e->getMessage());
            return ResponseHelper::error('خطأ في استرجاع الإحصائيات: ' . $e->getMessage(), 500);
        }
    }
}
