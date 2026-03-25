<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Helpers\ResponseHelper;
use PDO;

class MemberDashboardController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = \App\Core\Database::getInstance()->getConnection();
    }

    public function index(Request $request): array
    {
        try {
            $userId = (int)($request->user['id'] ?? $request->user['sub']);

            // 1. User Data
            $userStmt = $this->db->prepare("SELECT id, full_name, phone_number, email, university, profile_photo, status, last_login_at FROM users WHERE id = :id AND deleted_at IS NULL");
            $userStmt->execute([':id' => $userId]);
            $userData = $userStmt->fetch(PDO::FETCH_ASSOC);

            if (!$userData) {
                return ResponseHelper::error('المستخدم غير موجود', 404);
            }

            // 2. Active Membership
            $membershipStmt = $this->db->prepare("
                SELECT *,
                    DATEDIFF(end_date, CURDATE()) as days_remaining,
                    DATEDIFF(end_date, start_date) as total_days,
                    ROUND((GREATEST(0, DATEDIFF(end_date, CURDATE())) / GREATEST(1, DATEDIFF(end_date, start_date))) * 100, 1) as progress_percentage,
                    CASE WHEN DATEDIFF(end_date, CURDATE()) <= 7 THEN 1 ELSE 0 END as is_expiring_soon
                FROM memberships
                WHERE user_id = :userId AND status = 'active'
                ORDER BY created_at DESC LIMIT 1
            ");
            $membershipStmt->execute([':userId' => $userId]);
            $membershipData = $membershipStmt->fetch(PDO::FETCH_ASSOC);

            // 3. Upcoming Activities
            $activitiesStmt = $this->db->prepare("
                SELECT a.*,
                    (SELECT COUNT(*) FROM activity_participants ap WHERE ap.activity_id = a.id) as current_participants,
                    (SELECT COUNT(*) FROM activity_participants ap WHERE ap.activity_id = a.id AND ap.user_id = :userId) as is_registered
                FROM activities a
                WHERE a.status = 'published' AND a.start_date > NOW() AND a.deleted_at IS NULL
                ORDER BY a.start_date ASC LIMIT 5
            ");
            $activitiesStmt->execute([':userId' => $userId]);
            $activitiesData = $activitiesStmt->fetchAll(PDO::FETCH_ASSOC);

            // 4. Recent Posts
            $postsStmt = $this->db->prepare("
                SELECT p.*, u.full_name as author_name,
                    LEFT(p.content, 150) as content_preview
                FROM posts p
                LEFT JOIN users u ON p.author_id = u.id
                WHERE p.status = 'published' AND p.deleted_at IS NULL
                ORDER BY p.published_at DESC LIMIT 5
            ");
            $postsStmt->execute();
            $postsData = $postsStmt->fetchAll(PDO::FETCH_ASSOC);

            // 5. Recent Notifications
            $notifStmt = $this->db->prepare("
                SELECT * FROM notifications
                WHERE user_id = :userId
                ORDER BY created_at DESC LIMIT 10
            ");
            $notifStmt->execute([':userId' => $userId]);
            $notificationsData = $notifStmt->fetchAll(PDO::FETCH_ASSOC);

            // 6. Stats
            $stats = [
                'upcoming_activities' => count($activitiesData),
                'unread_notifications' => 0,
                'new_posts' => 0,
                'missing_documents' => 0
            ];

            // Count unread notifications
            $unreadStmt = $this->db->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = :userId AND is_read = 0");
            $unreadStmt->execute([':userId' => $userId]);
            $stats['unread_notifications'] = (int)$unreadStmt->fetchColumn();

            // Count new posts in last 7 days
            $newPostsStmt = $this->db->query("SELECT COUNT(*) FROM posts WHERE status = 'published' AND published_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND deleted_at IS NULL");
            $stats['new_posts'] = (int)$newPostsStmt->fetchColumn();

            return ResponseHelper::success('بيانات لوحة التحكم', [
                'user' => $userData,
                'membership' => $membershipData ?: null,
                'stats' => $stats,
                'upcoming_activities' => $activitiesData,
                'recent_posts' => $postsData,
                'recent_notifications' => $notificationsData
            ]);

        } catch (\Exception $e) {
            error_log("MemberDashboardController Error: " . $e->getMessage());
            return ResponseHelper::error('خطأ في استرجاع بيانات لوحة التحكم: ' . $e->getMessage(), 500);
        }
    }
}
