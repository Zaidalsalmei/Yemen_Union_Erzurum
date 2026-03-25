<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Helpers\ResponseHelper;
use PDO;

class ConversationController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = \App\Core\Database::getInstance()->getConnection();
    }

    // ══════════════════════════════════════════════════
    //  GET /api/conversations
    // ══════════════════════════════════════════════════
    public function index(Request $request): array
    {
        try {
            $userId = (int)($request->user['id'] ?? $request->user['sub'] ?? 0);

            // Cache لقائمة المحادثات في الـ Session لمدة 10 ثوانٍ
            if (session_status() === PHP_SESSION_NONE) session_start();
            $cacheKey = "conversations_{$userId}";
            if (isset($_SESSION[$cacheKey]) && (time() - $_SESSION[$cacheKey]['time'] < 10)) {
                return ResponseHelper::success('المحادثات (من الكاش)', $_SESSION[$cacheKey]['data']);
            }

            $stmt = $this->db->prepare("
                SELECT
                    c.id, c.type, c.title, c.created_by, c.updated_at,
                    m.body       AS last_message,
                    m.type       AS last_message_type,
                    m.sender_id  AS last_sender_id,
                    m.created_at AS last_message_at,
                    su.full_name AS last_sender_name,
                    (
                        SELECT COUNT(*) FROM messages mm
                        WHERE mm.conversation_id = c.id
                          AND mm.deleted_at IS NULL
                          AND mm.sender_id != :uid2
                          AND mm.created_at > COALESCE(
                              (SELECT last_read_at FROM conversation_participants
                               WHERE conversation_id = c.id AND user_id = :uid3),
                              '2000-01-01'
                          )
                    ) AS unread_count
                FROM conversations c
                JOIN conversation_participants cp
                    ON cp.conversation_id = c.id AND cp.user_id = :uid
                LEFT JOIN messages m ON m.id = (
                    SELECT id FROM messages
                    WHERE conversation_id = c.id AND deleted_at IS NULL
                    ORDER BY created_at DESC LIMIT 1
                )
                LEFT JOIN users su ON su.id = m.sender_id
                ORDER BY c.updated_at DESC
            ");
            $stmt->execute([':uid' => $userId, ':uid2' => $userId, ':uid3' => $userId]);
            $conversations = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($conversations as &$conv) {
                $conv['unread_count'] = (int)$conv['unread_count'];
                if ($conv['type'] === 'direct') {
                    $conv['other_user'] = $this->getOtherUser((int)$conv['id'], $userId);
                }
                $conv['participants_count'] = $this->getParticipantsCount((int)$conv['id']);
            }

            $data = ['conversations' => $conversations];
            $_SESSION[$cacheKey] = ['time' => time(), 'data' => $data];

            return ResponseHelper::success('المحادثات', $data);
        } catch (\Exception $e) {
            error_log("ConversationController::index: " . $e->getMessage());
            return ResponseHelper::error('خطأ في جلب المحادثات', 500);
        }
    }

    // ══════════════════════════════════════════════════
    //  POST /api/conversations
    // ══════════════════════════════════════════════════
    public function store(Request $request): array
    {
        try {
            $userId = (int)($request->user['id'] ?? $request->user['sub'] ?? 0);
            $body   = $request->all(); // Changed from $request->body() since Request.php has all()
            $type   = $body['type'] ?? 'direct';
            $title  = trim($body['title'] ?? '');
            $ids    = array_map('intval', $body['participant_ids'] ?? []);

            if ($type !== 'broadcast' && empty($ids)) {
                return ResponseHelper::error('يجب تحديد مشارك واحد على الأقل', 422);
            }

            if ($type === 'direct') {
                $existing = $this->findDirectConversation($userId, $ids[0]);
                if ($existing) {
                    $conv = $this->getConversationById($existing, $userId);
                    return ResponseHelper::success('المحادثة موجودة', ['conversation' => $conv]);
                }
            }

            $this->db->beginTransaction();

            $stmt = $this->db->prepare("
                INSERT INTO conversations (type, title, created_by, created_at, updated_at)
                VALUES (:type, :title, :createdBy, NOW(), NOW())
            ");
            $stmt->execute([
                ':type'      => $type,
                ':title'     => $title ?: null,
                ':createdBy' => $userId,
            ]);
            $convId = (int)$this->db->lastInsertId();

            $participants = array_unique(array_merge([$userId], $ids));

            if ($type === 'broadcast') {
                $allStmt  = $this->db->query("SELECT id FROM users WHERE deleted_at IS NULL AND status = 'active'");
                $all      = $allStmt->fetchAll(PDO::FETCH_COLUMN);
                $participants = array_unique(array_merge([$userId], array_map('intval', $all)));
            }

            $insStmt = $this->db->prepare("
                INSERT IGNORE INTO conversation_participants (conversation_id, user_id, joined_at)
                VALUES (:convId, :userId, NOW())
            ");
            foreach ($participants as $pid) {
                $insStmt->execute([':convId' => $convId, ':userId' => $pid]);
            }

            $this->db->commit();

            $conv = $this->getConversationById($convId, $userId);
            return ResponseHelper::success('تم إنشاء المحادثة', ['conversation' => $conv], 201);

        } catch (\Exception $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            error_log("ConversationController::store: " . $e->getMessage());
            return ResponseHelper::error('خطأ في إنشاء المحادثة', 500);
        }
    }

    // ══════════════════════════════════════════════════
    //  GET /api/conversations/unread-count
    // ══════════════════════════════════════════════════
    public function unreadCount(Request $request): array
    {
        try {
            $userId = (int)($request->user['id'] ?? $request->user['sub'] ?? 0);
            $stmt   = $this->db->prepare("
                SELECT COUNT(*) FROM messages m
                JOIN conversation_participants cp
                    ON cp.conversation_id = m.conversation_id AND cp.user_id = :uid
                WHERE m.sender_id != :uid2
                  AND m.deleted_at IS NULL
                  AND m.created_at > COALESCE(cp.last_read_at, '2000-01-01')
            ");
            $stmt->execute([':uid' => $userId, ':uid2' => $userId]);
            return ResponseHelper::success('ok', ['count' => (int)$stmt->fetchColumn()]);
        } catch (\Exception $e) {
            return ResponseHelper::error('خطأ', 500);
        }
    }

    // ══════════════════════════════════════════════════
    //  GET /api/conversations/{id}/messages
    // ══════════════════════════════════════════════════
    public function messages(Request $request, array $params): array
    {
        try {
            $userId = (int)($request->user['id'] ?? $request->user['sub'] ?? 0);
            $convId = (int)($params['id'] ?? 0);

            if (!$this->isParticipant($convId, $userId)) {
                return ResponseHelper::error('غير مصرح', 403);
            }

            $before = $request->query('before');
            $limit  = 30;

            $sql = "
                SELECT m.id, m.body, m.type, m.file_url, m.file_name,
                       m.sender_id, m.created_at,
                       u.full_name     AS sender_name,
                       u.profile_photo AS sender_photo
                FROM messages m
                JOIN users u ON u.id = m.sender_id
                WHERE m.conversation_id = :convId AND m.deleted_at IS NULL
            ";
            if ($before) $sql .= " AND m.id < :before ";
            $sql .= " ORDER BY m.created_at DESC LIMIT :limit";

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':convId', $convId, PDO::PARAM_INT);
            $stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
            if ($before) $stmt->bindValue(':before', (int)$before, PDO::PARAM_INT);
            $stmt->execute();
            $messages = array_reverse($stmt->fetchAll(PDO::FETCH_ASSOC));

            $this->db->prepare("
                UPDATE conversation_participants SET last_read_at = NOW()
                WHERE conversation_id = :convId AND user_id = :userId
            ")->execute([':convId' => $convId, ':userId' => $userId]);

            return ResponseHelper::success('الرسائل', [
                'messages'        => $messages,
                'has_more'        => count($messages) === $limit,
                'conversation_id' => $convId,
            ]);
        } catch (\Exception $e) {
            error_log("ConversationController::messages: " . $e->getMessage());
            return ResponseHelper::error('خطأ في جلب الرسائل', 500);
        }
    }

    // ══════════════════════════════════════════════════
    //  POST /api/conversations/{id}/messages
    // ══════════════════════════════════════════════════
    public function sendMessage(Request $request, array $params): array
    {
        try {
            $userId = (int)($request->user['id'] ?? $request->user['sub'] ?? 0);
            $convId = (int)($params['id'] ?? 0);

            if (!$this->isParticipant($convId, $userId)) {
                return ResponseHelper::error('غير مصرح', 403);
            }

            $body     = $request->all();
            $text     = trim($body['body'] ?? '');
            $type     = $body['type'] ?? 'text';
            $fileUrl  = $body['file_url']  ?? null;
            $fileName = $body['file_name'] ?? null;

            if ($text === '' && !$fileUrl) {
                return ResponseHelper::error('الرسالة فارغة', 422);
            }

            $stmt = $this->db->prepare("
                INSERT INTO messages (conversation_id, sender_id, body, type, file_url, file_name, created_at)
                VALUES (:convId, :senderId, :body, :type, :fileUrl, :fileName, NOW())
            ");
            $stmt->execute([
                ':convId'   => $convId,
                ':senderId' => $userId,
                ':body'     => $text ?: null,
                ':type'     => $type,
                ':fileUrl'  => $fileUrl,
                ':fileName' => $fileName,
            ]);
            $msgId = (int)$this->db->lastInsertId();

            $this->db->prepare("UPDATE conversations SET updated_at = NOW() WHERE id = :id")
                     ->execute([':id' => $convId]);

            $this->db->prepare("
                UPDATE conversation_participants SET last_read_at = NOW()
                WHERE conversation_id = :convId AND user_id = :userId
            ")->execute([':convId' => $convId, ':userId' => $userId]);

            $msgStmt = $this->db->prepare("
                SELECT m.*, u.full_name AS sender_name, u.profile_photo AS sender_photo
                FROM messages m JOIN users u ON u.id = m.sender_id WHERE m.id = :id
            ");
            $msgStmt->execute([':id' => $msgId]);
            $message = $msgStmt->fetch(PDO::FETCH_ASSOC);

            return ResponseHelper::success('تم إرسال الرسالة', ['message' => $message], 201);
        } catch (\Exception $e) {
            error_log("ConversationController::sendMessage: " . $e->getMessage());
            return ResponseHelper::error('خطأ في إرسال الرسالة', 500);
        }
    }

    // ══════════════════════════════════════════════════
    //  GET /api/conversations/{id}/poll?after=ID
    // ══════════════════════════════════════════════════
    public function poll(Request $request, array $params): array
    {
        try {
            $userId  = (int)($request->user['id'] ?? $request->user['sub'] ?? 0);
            $convId  = (int)($params['id'] ?? 0);
            $afterId = (int)($request->query('after') ?? 0);

            if (!$this->isParticipant($convId, $userId)) {
                return ResponseHelper::error('غير مصرح', 403);
            }

            $stmt = $this->db->prepare("
                SELECT m.*, u.full_name AS sender_name, u.profile_photo AS sender_photo
                FROM messages m JOIN users u ON u.id = m.sender_id
                WHERE m.conversation_id = :convId AND m.deleted_at IS NULL AND m.id > :afterId
                ORDER BY m.created_at ASC
            ");
            $stmt->execute([':convId' => $convId, ':afterId' => $afterId]);
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (!empty($messages)) {
                $this->db->prepare("
                    UPDATE conversation_participants SET last_read_at = NOW()
                    WHERE conversation_id = :convId AND user_id = :userId
                ")->execute([':convId' => $convId, ':userId' => $userId]);
            }

            // من يكتب الآن (آخر 5 ثوانٍ)
            $typingStmt = $this->db->prepare("
                SELECT u.full_name FROM conversation_participants cp
                JOIN users u ON u.id = cp.user_id
                WHERE cp.conversation_id = :convId
                  AND cp.user_id != :userId
                  AND cp.typing_at > DATE_SUB(NOW(), INTERVAL 5 SECOND)
            ");
            $typingStmt->execute([':convId' => $convId, ':userId' => $userId]);
            $typingUsers = $typingStmt->fetchAll(PDO::FETCH_COLUMN);

            return ResponseHelper::success('ok', [
                'messages'     => $messages,
                'typing_users' => $typingUsers,
            ]);
        } catch (\Exception $e) {
            return ResponseHelper::error('خطأ', 500);
        }
    }

    // ══════════════════════════════════════════════════
    //  DELETE /api/conversations/{id}/messages/{msgId}
    // ══════════════════════════════════════════════════
    public function deleteMessage(Request $request, array $params): array
    {
        try {
            $userId = (int)($request->user['id'] ?? $request->user['sub'] ?? 0);
            $msgId  = (int)($params['msgId'] ?? 0);

            $stmt = $this->db->prepare("
                UPDATE messages SET deleted_at = NOW() WHERE id = :id AND sender_id = :userId
            ");
            $stmt->execute([':id' => $msgId, ':userId' => $userId]);

            if ($stmt->rowCount() === 0) {
                return ResponseHelper::error('لا يمكن حذف هذه الرسالة', 403);
            }

            return ResponseHelper::success('تم حذف الرسالة');
        } catch (\Exception $e) {
            return ResponseHelper::error('خطأ', 500);
        }
    }

    // POST /api/conversations/{id}/typing
    public function typing(Request $request, array $params): array
    {
        try {
            $userId = (int)($request->user['id'] ?? $request->user['sub'] ?? 0);
            $convId = (int)($params['id'] ?? 0);

            $this->db->prepare("
                UPDATE conversation_participants 
                SET typing_at = NOW()
                WHERE conversation_id = :convId AND user_id = :userId
            ")->execute([':convId' => $convId, ':userId' => $userId]);

            return ResponseHelper::success('ok');
        } catch (\Exception $e) {
            return ResponseHelper::error('خطأ', 500);
        }
    }

    // ══════════════════════════════════════════════════
    //  دوال مساعدة
    // ══════════════════════════════════════════════════
    private function isParticipant(int $convId, int $userId): bool
    {
        $stmt = $this->db->prepare("
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = :convId AND user_id = :userId
        ");
        $stmt->execute([':convId' => $convId, ':userId' => $userId]);
        return (bool)$stmt->fetchColumn();
    }

    private function findDirectConversation(int $userId, int $otherId): ?int
    {
        $stmt = $this->db->prepare("
            SELECT c.id FROM conversations c
            JOIN conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = :userId
            JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id = :otherId
            WHERE c.type = 'direct' LIMIT 1
        ");
        $stmt->execute([':userId' => $userId, ':otherId' => $otherId]);
        $r = $stmt->fetchColumn();
        return $r ? (int)$r : null;
    }

    private function getOtherUser(int $convId, int $myId): ?array
    {
        $stmt = $this->db->prepare("
            SELECT u.id, u.full_name, u.profile_photo, u.status
            FROM conversation_participants cp
            JOIN users u ON u.id = cp.user_id
            WHERE cp.conversation_id = :convId AND cp.user_id != :myId LIMIT 1
        ");
        $stmt->execute([':convId' => $convId, ':myId' => $myId]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    private function getParticipantsCount(int $convId): int
    {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) FROM conversation_participants WHERE conversation_id = :convId
        ");
        $stmt->execute([':convId' => $convId]);
        return (int)$stmt->fetchColumn();
    }

    private function getConversationById(int $id, int $userId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM conversations WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $conv = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($conv['type'] === 'direct') {
            $conv['other_user'] = $this->getOtherUser($id, $userId);
        }
        $conv['participants_count'] = $this->getParticipantsCount($id);
        return $conv;
    }
}
