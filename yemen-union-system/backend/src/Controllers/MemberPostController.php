<?php
/**
 * Member Post Controller
 * Handles post/announcement operations for members (read-only)
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Helpers\ResponseHelper;
use PDO;

class MemberPostController
{
    private PDO $db;
    
    public function __construct()
    {
        $this->db = \App\Core\Database::getInstance()->getConnection();
    }
    
    /**
     * GET /api/member/posts
     * Get published posts/announcements for members
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
            
            // Get category filter
            $category = $request->query('category', 'all');
            $whereClause = "p.status = 'published' AND p.deleted_at IS NULL";
            
            if ($category !== 'all') {
                $whereClause .= " AND p.category = :category";
            }
            
            // Get total count
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as total
                FROM posts p
                WHERE $whereClause
            ");
            
            if ($category !== 'all') {
                $stmt->execute(['category' => $category]);
            } else {
                $stmt->execute();
            }
            
            $total = (int) $stmt->fetch()['total'];
            
            // Get new posts count (not read by this user)
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as count
                FROM posts p
                WHERE p.status = 'published'
                    AND p.deleted_at IS NULL
                    AND NOT EXISTS (
                        SELECT 1 FROM post_reads pr
                        WHERE pr.post_id = p.id AND pr.user_id = :user_id
                    )
            ");
            $stmt->execute(['user_id' => $userId]);
            $newPostsCount = (int) $stmt->fetch()['count'];
            
            // Get posts
            $query = "
                SELECT 
                    p.id,
                    p.title,
                    p.excerpt,
                    p.category,
                    p.created_at,
                    u.full_name as author_name,
                    EXISTS(
                        SELECT 1 FROM post_reads pr 
                        WHERE pr.post_id = p.id AND pr.user_id = :user_id
                    ) as is_read
                FROM posts p
                LEFT JOIN users u ON p.author_id = u.id
                WHERE $whereClause
                ORDER BY p.created_at DESC
                LIMIT :limit OFFSET :offset
            ";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            
            if ($category !== 'all') {
                $stmt->bindValue(':category', $category, PDO::PARAM_STR);
            }
            
            $stmt->execute();
            $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Convert is_read to boolean
            foreach ($posts as &$post) {
                $post['is_read'] = (bool) $post['is_read'];
            }
            
            // Calculate pagination
            $totalPages = ceil($total / $limit);
            
            return ResponseHelper::success('تم جلب البيانات بنجاح', [
                'posts' => $posts,
                'new_posts_count' => $newPostsCount,
                'pagination' => [
                    'current_page' => $page,
                    'total_pages' => $totalPages,
                    'total_items' => $total,
                    'per_page' => $limit
                ]
            ]);
            
        } catch (\Exception $e) {
            error_log("Member Posts Error: " . $e->getMessage());
            return ResponseHelper::error('حدث خطأ في جلب البيانات', 500);
        }
    }
    
    /**
     * GET /api/member/posts/{id}
     * Get single post and mark as read
     */
    public function show(Request $request, array $params): array
    {
        $userId = $request->user['id'] ?? null;
        $postId = (int) $params['id'];
        
        if (!$userId) {
            return ResponseHelper::error('غير مصرح', 401);
        }
        
        try {
            // Get post
            $stmt = $this->db->prepare("
                SELECT 
                    p.id,
                    p.title,
                    p.content,
                    p.category,
                    p.created_at,
                    u.full_name as author_name
                FROM posts p
                LEFT JOIN users u ON p.author_id = u.id
                WHERE p.id = :id 
                    AND p.status = 'published'
                    AND p.deleted_at IS NULL
            ");
            $stmt->execute(['id' => $postId]);
            $post = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$post) {
                return ResponseHelper::error('المنشور غير موجود', 404);
            }
            
            // Mark as read (insert or ignore if already exists)
            $stmt = $this->db->prepare("
                INSERT INTO post_reads (post_id, user_id, read_at)
                VALUES (:post_id, :user_id, NOW())
                ON DUPLICATE KEY UPDATE read_at = NOW()
            ");
            $stmt->execute([
                'post_id' => $postId,
                'user_id' => $userId
            ]);
            
            return ResponseHelper::success('تم جلب البيانات بنجاح', $post);
            
        } catch (\Exception $e) {
            error_log("Member Post Show Error: " . $e->getMessage());
            return ResponseHelper::error('حدث خطأ في جلب البيانات', 500);
        }
    }
}
