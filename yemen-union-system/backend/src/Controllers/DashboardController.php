<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Helpers\ResponseHelper;
use PDO;
use Exception;

class DashboardController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = \App\Core\Database::getInstance()->getConnection();
    }

    public function index(Request $request): array
    {
        try {
            $userId = (int)($request->user['id'] ?? $request->user['sub'] ?? 0);
            $isAdmin = $this->isAdmin($userId);

            $data = [
                'stats' => [
                    // إجمالي الأعضاء
                    'total_members'          => $this->getCount("users", "deleted_at IS NULL AND status != 'inactive'"),
                    // الأعضاء النشطون
                    'active_members'         => $this->getCount("users", "status = 'active' AND deleted_at IS NULL"),
                    // أعضاء بانتظار الموافقة
                    'pending_members'        => $this->getCount("users", "status = 'pending' AND deleted_at IS NULL"),
                    // اشتراكات سارية
                    'active_subscriptions'   => $this->getCount("memberships", "status = 'active'"),
                    'members_with_membership'=> $this->getCount("memberships", "status = 'active'"),
                    // إيرادات الشهر
                    'monthly_revenue'        => $this->getMonthlyRevenue(),
                    'monthly_income'         => $this->getMonthlyRevenue(),
                    // أنشطة قادمة
                    'upcoming_activities_count' => $this->getCount("activities", "status = 'published' AND start_date > NOW() AND deleted_at IS NULL"),
                    // تذاكر مفتوحة
                    'open_tickets'           => $this->getCount("support_tickets", "status IN ('open', 'in_progress')"),
                    // ماليات
                    'total_income'           => $this->getFinancialTotal('income'),
                    'total_expenses'         => $this->getFinancialTotal('expense'),
                ],

                // الأنشطة القادمة
                'upcoming_activities'      => $this->getUpcomingActivities(),
                'upcoming_activities_list' => $this->getUpcomingActivities(),

                // طلبات العضوية المعلقة
                'membership_requests'      => $this->getMembershipRequests(),
                'pending_memberships'      => $this->getMembershipRequests(),

                // آخر الأعضاء
                'recent_members'           => $this->getRecentMembers(),

                // آخر الإشعارات
                'recent_notifications'     => $this->getRecentNotifications($userId, $isAdmin),

                // آخر تذاكر الدعم
                'recent_support_tickets'   => $this->getRecentSupportTickets($userId, $isAdmin),
            ];

            return ResponseHelper::success('تم جلب بيانات لوحة التحكم بنجاح', $data);
        } catch (Exception $e) {
            error_log("DashboardController::index error: " . $e->getMessage());
            return ResponseHelper::error('حدث خطأ أثناء جلب بيانات لوحة التحكم: ' . $e->getMessage());
        }
    }

    // ══════════════════════════════════════
    //  دوال مساعدة
    // ══════════════════════════════════════

    private function isAdmin(int $userId): bool
    {
        if ($userId === 0) return false;
        try {
            $stmt = $this->db->prepare("SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = ? AND ur.is_active = 1");
            $stmt->execute([$userId]);
            $roles = $stmt->fetchAll(PDO::FETCH_COLUMN);
            $adminRoles = ['president', 'admin', 'vice_president', 'finance_manager', 'general_secretary'];
            return !empty(array_intersect($adminRoles, $roles));
        } catch (Exception $e) {
            return false;
        }
    }

    private function getCount(string $table, string $where = "1=1"): int
    {
        return (int)$this->db->query("SELECT COUNT(*) FROM {$table} WHERE {$where}")->fetchColumn();
    }

    private function getFinancialTotal(string $type): float
    {
        $stmt = $this->db->prepare("
            SELECT COALESCE(SUM(amount), 0)
            FROM financial_transactions
            WHERE type = :type AND status = 'approved'
        ");
        $stmt->execute([':type' => $type]);
        return (float)$stmt->fetchColumn();
    }

    private function getMonthlyRevenue(): float
    {
        $stmt = $this->db->prepare("
            SELECT COALESCE(SUM(amount), 0)
            FROM financial_transactions
            WHERE type = 'income'
              AND status = 'approved'
              AND MONTH(transaction_date) = MONTH(CURRENT_DATE)
              AND YEAR(transaction_date)  = YEAR(CURRENT_DATE)
        ");
        $stmt->execute();
        return (float)$stmt->fetchColumn();
    }

    private function getUpcomingActivities(): array
    {
        $stmt = $this->db->prepare("
            SELECT
                a.id,
                a.title,
                a.title    AS title_ar,
                a.start_date,
                a.type,
                a.status,
                a.location,
                (SELECT COUNT(*) FROM activity_participants ap WHERE ap.activity_id = a.id) AS registered_count
            FROM activities a
            WHERE a.deleted_at IS NULL
              AND a.status NOT IN ('cancelled', 'draft')
              AND a.start_date > NOW()
            ORDER BY a.start_date ASC
            LIMIT 5
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getMembershipRequests(): array
    {
        $stmt = $this->db->prepare("
            SELECT
                m.id,
                m.status,
                m.created_at,
                m.amount,
                u.full_name,
                u.phone_number,
                u.profile_photo,
                m.package_name
            FROM memberships m
            JOIN users u ON u.id = m.user_id
            WHERE m.status = 'pending'
            ORDER BY m.created_at DESC
            LIMIT 5
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getRecentMembers(): array
    {
        $stmt = $this->db->prepare("
            SELECT
                id,
                full_name,
                phone_number,
                email,
                profile_photo,
                status,
                created_at
            FROM users
            WHERE deleted_at IS NULL
            ORDER BY created_at DESC
            LIMIT 5
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getRecentNotifications(int $userId, bool $isAdmin): array
    {
        // عرض الإشعارات الخاصة بالمستخدم + الإشعارات العامة (user_id IS NULL)
        // إذا كان مسؤولاً، يرى الإشعارات العامة أو إشعارات النظام أيضاً
        $query = "
            SELECT id, type, title, message, is_read, created_at, action_url
            FROM notifications
            WHERE (user_id = :userId OR user_id IS NULL OR user_id = 0)
        ";

        if ($isAdmin) {
            // المسؤول يرى كل شيء للأغراض الإشرافية (اختياري)
            $query = "SELECT id, type, title, message, is_read, created_at, action_url FROM notifications";
        }

        $query .= " ORDER BY created_at DESC LIMIT 5";
        
        $stmt = $this->db->prepare($query);
        if (!$isAdmin) {
            $stmt->execute([':userId' => $userId]);
        } else {
            $stmt->execute();
        }

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as &$row) {
            $row['is_read'] = (bool)$row['is_read'];
        }
        return $rows;
    }

    private function getRecentSupportTickets(int $userId, bool $isAdmin): array
    {
        // التحقق من وجود جدول support_tickets وجلب التذاكر الحديثة
        try {
            $where = $isAdmin ? "st.status IN ('open', 'in_progress')" : "st.status IN ('open', 'in_progress') AND st.user_id = :userId";
            
            $stmt = $this->db->prepare("
                SELECT
                    st.id,
                    st.subject,
                    st.status,
                    st.priority,
                    st.created_at,
                    u.full_name   AS user_name,
                    u.profile_photo AS user_photo
                FROM support_tickets st
                JOIN users u ON u.id = st.user_id
                WHERE $where
                ORDER BY st.created_at DESC
                LIMIT 5
            ");
            
            $params = $isAdmin ? [] : [':userId' => $userId];
            $stmt->execute($params);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            return [];
        }
    }
}
