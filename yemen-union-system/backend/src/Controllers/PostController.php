<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Helpers\ResponseHelper;
use App\Helpers\NotificationHelper;

use PDO;

class PostController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = \App\Core\Database::getInstance()->getConnection();
    }

    /**
     * Get all posts with author data, stats and pagination
     */
    public function index(Request $request): array
    {
        try {
            $type = $request->input('type');
            $status = $request->input('status');
            $search = $request->input('search');
            $page = (int)($request->input('page') ?? 1);
            $perPage = (int)($request->input('per_page') ?? 20);

            if ($page < 1) $page = 1;
            if ($perPage < 1) $perPage = 20;
            $offset = ($page - 1) * $perPage;

            $whereParts = ["p.deleted_at IS NULL"];
            $params = [];

            if ($type && $type !== 'all') {
                $whereParts[] = "p.type = :type";
                $params[':type'] = $type;
            }

            if ($status && $status !== 'all') {
                $whereParts[] = "p.status = :status";
                $params[':status'] = $status;
            }

            if ($search) {
                $whereParts[] = "(p.title LIKE :search OR p.content LIKE :search)";
                $params[':search'] = "%$search%";
            }

            $whereSql = implode(" AND ", $whereParts);

            // Count total for pagination
            $countSql = "SELECT COUNT(*) as total FROM posts p WHERE $whereSql";
            $countStmt = $this->db->prepare($countSql);
            $countStmt->execute($params);
            $total = (int)$countStmt->fetch(PDO::FETCH_ASSOC)['total'];

            // Fetch data
            $fetchSql = "SELECT 
                            p.*, 
                            u.full_name as author_name
                         FROM posts p
                         LEFT JOIN users u ON p.author_id = u.id
                         WHERE $whereSql
                         ORDER BY p.created_at DESC
                         LIMIT :limit OFFSET :offset";

            $fetchStmt = $this->db->prepare($fetchSql);
            foreach ($params as $key => $val) {
                $fetchStmt->bindValue($key, $val);
            }
            $fetchStmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
            $fetchStmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $fetchStmt->execute();
            $posts = $fetchStmt->fetchAll(PDO::FETCH_ASSOC);

            // Fetch stats
            $statsSql = "SELECT
                            COUNT(*) as total,
                            COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
                            COUNT(CASE WHEN status = 'draft' THEN 1 END) as drafts,
                            COUNT(CASE WHEN type = 'announcement' THEN 1 END) as announcements,
                            COUNT(CASE WHEN type = 'news' THEN 1 END) as news,
                            COUNT(CASE WHEN type = 'event' THEN 1 END) as events,
                            COUNT(CASE WHEN type = 'financial' THEN 1 END) as financial
                        FROM posts WHERE deleted_at IS NULL";
            $statsStmt = $this->db->query($statsSql);
            $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);

            return ResponseHelper::success('تم استرجاع المنشورات', [
                'posts' => $posts,
                'pagination' => [
                    'total' => $total,
                    'page' => $page,
                    'per_page' => $perPage,
                    'total_pages' => ceil($total / $perPage)
                ],
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            error_log("Post index error: " . $e->getMessage());
            return ResponseHelper::error('خطأ في استرجاع المنشورات: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Store new post
     */
    public function store(Request $request): array
    {
        try {
            $title = $request->input('title');
            $content = $request->input('content');
            $type = $request->input('type') ?? 'announcement';
            $status = $request->input('status') ?? 'draft';
            $image = $request->input('image');
            $authorId = $request->user['id'] ?? $request->user['sub'] ?? null;

            if (!$title || !$content) {
                return ResponseHelper::error('العنوان والمحتوى مطلوبان', 400);
            }

            $publishedAt = ($status === 'published') ? date('Y-m-d H:i:s') : null;

            $sql = "INSERT INTO posts 
                    (title, content, type, status, author_id, image, published_at, created_at, updated_at) 
                    VALUES 
                    (:title, :content, :type, :status, :author_id, :image, :published_at, NOW(), NOW())";
            
            $stmt->execute([
                ':title' => $title,
                ':content' => $content,
                ':type' => $type,
                ':status' => $status,
                ':author_id' => $authorId,
                ':image' => $image,
                ':published_at' => $publishedAt
            ]);
            
            $newId = $this->db->lastInsertId();

            if ($status === 'published') {
                NotificationHelper::notifyAllActive($this->db, "📢 {$title}", mb_substr($content, 0, 100), 'post', "/posts/{$newId}");
            }

            return ResponseHelper::success('تم إنشاء المنشور بنجاح', ['id' => $newId]);
        } catch (\Exception $e) {
            error_log("Post store error: " . $e->getMessage());
            return ResponseHelper::error('خطأ في إنشاء المنشور: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Show single post
     */
    public function show(Request $request, array $params): array
    {
        try {
            $id = $params['id'] ?? null;
            if (!$id) {
                return ResponseHelper::error('معرف المنشور غير موجود', 400);
            }

            $sql = "SELECT p.*, u.full_name as author_name, u.profile_photo as author_photo
                    FROM posts p
                    LEFT JOIN users u ON p.author_id = u.id
                    WHERE p.id = :id AND p.deleted_at IS NULL";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);
            $post = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$post) {
                return ResponseHelper::error('المنشور غير موجود', 404);
            }

            return ResponseHelper::success('تم استرجاع تفاصيل المنشور', $post);
        } catch (\Exception $e) {
            error_log("Post show error: " . $e->getMessage());
            return ResponseHelper::error('خطأ في استرجاع المنشور: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update post
     */
    public function update(Request $request, array $params): array
    {
        try {
            $id = $params['id'] ?? null;
            if (!$id) {
                return ResponseHelper::error('معرف المنشور غير موجود', 400);
            }

            // Get existing post
            $checkStmt = $this->db->prepare("SELECT * FROM posts WHERE id = :id AND deleted_at IS NULL");
            $checkStmt->execute([':id' => $id]);
            $post = $checkStmt->fetch(PDO::FETCH_ASSOC);
            if (!$post) {
                return ResponseHelper::error('المنشور غير موجود', 404);
            }

            $updateFields = [];
            $queryParams = [':id' => $id];
            $fields = ['title', 'content', 'type', 'status', 'image'];

            foreach ($fields as $field) {
                $val = $request->input($field);
                if ($val !== null) {
                    $updateFields[] = "$field = :$field";
                    $queryParams[":$field"] = $val;
                    
                    // Specific logic for published_at
                    if ($field === 'status' && $val === 'published' && !$post['published_at']) {
                        $updateFields[] = "published_at = NOW()";
                    }
                }
            }

            if (empty($updateFields)) {
                return ResponseHelper::error('لا توجد بيانات للتعديل', 400);
            }

            $updateFields[] = "updated_at = NOW()";

            $sql = "UPDATE posts SET " . implode(", ", $updateFields) . " WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($queryParams);

            return ResponseHelper::success('تم تعديل المنشور بنجاح');
        } catch (\Exception $e) {
            error_log("Post update error: " . $e->getMessage());
            return ResponseHelper::error('خطأ في تعديل المنشور: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Soft delete post
     */
    public function destroy(Request $request, array $params): array
    {
        try {
            $id = $params['id'] ?? null;
            if (!$id) {
                return ResponseHelper::error('معرف المنشور غير موجود', 400);
            }

            $stmt = $this->db->prepare("UPDATE posts SET deleted_at = NOW() WHERE id = :id");
            $stmt->execute([':id' => $id]);

            if ($stmt->rowCount() === 0) {
                return ResponseHelper::error('المنشور غير موجود', 404);
            }

            return ResponseHelper::success('تم حذف المنشور بنجاح');
        } catch (\Exception $e) {
            error_log("Post destroy error: " . $e->getMessage());
            return ResponseHelper::error('خطأ في حذف المنشور: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Publish draft
     */
    public function publish(Request $request, array $params): array
    {
        try {
            $id = $params['id'] ?? null;
            $stmt = $this->db->prepare("UPDATE posts SET status = 'published', published_at = NOW(), updated_at = NOW() WHERE id = :id AND deleted_at IS NULL");
            $stmt->execute([':id' => $id]);

            if ($stmt->rowCount() === 0) {
                return ResponseHelper::error('المنشور غير موجود', 404);
            }

            return ResponseHelper::success('تم نشر المنشور بنجاح');
        } catch (\Exception $e) {
            return ResponseHelper::error('خطأ في النشر: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Return to draft
     */
    public function unpublish(Request $request, array $params): array
    {
        try {
            $id = $params['id'] ?? null;
            $stmt = $this->db->prepare("UPDATE posts SET status = 'draft', updated_at = NOW() WHERE id = :id AND deleted_at IS NULL");
            $stmt->execute([':id' => $id]);

            if ($stmt->rowCount() === 0) {
                return ResponseHelper::error('المنشور غير موجود', 404);
            }

            return ResponseHelper::success('تم إرجاع المنشور للمسودات بنجاح');
        } catch (\Exception $e) {
            return ResponseHelper::error('خطأ: ' . $e->getMessage(), 500);
        }
    }
}
