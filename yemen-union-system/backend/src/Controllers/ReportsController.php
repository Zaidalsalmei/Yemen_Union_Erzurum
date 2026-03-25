<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Helpers\ResponseHelper;
use PDO;

class ReportsController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = \App\Core\Database::getInstance()->getConnection();
    }

    public function stats(Request $request): array
    {
        $stats = [
            'total_members' => 0,
            'active_members' => 0,
            'pending_members' => 0,
            
            'total_memberships' => 0,
            'active_memberships' => 0,
            'pending_memberships' => 0,

            'total_activities' => 0,
            'published_activities' => 0,
            'completed_activities' => 0,

            'total_income' => 0,
            'total_expense' => 0,
            'net_balance' => 0,

            'total_sponsors' => 0,
            'active_sponsors' => 0,

            'total_tickets' => 0,
            'open_tickets' => 0,
        ];

        // Users stats
        try {
            $stmt = $this->db->query("SELECT 
                COUNT(*) as total, 
                COUNT(CASE WHEN status='active' THEN 1 END) as active,
                COUNT(CASE WHEN status='pending' THEN 1 END) as pending
                FROM users WHERE deleted_at IS NULL");
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $stats['total_members'] = (int)$row['total'];
                $stats['active_members'] = (int)$row['active'];
                $stats['pending_members'] = (int)$row['pending'];
            }
        } catch (\Exception $e) {}

        // Memberships stats
        try {
            $stmt = $this->db->query("SELECT 
                COUNT(*) as total, 
                COUNT(CASE WHEN status='active' THEN 1 END) as active,
                COUNT(CASE WHEN status='pending' THEN 1 END) as pending
                FROM memberships");
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $stats['total_memberships'] = (int)$row['total'];
                $stats['active_memberships'] = (int)$row['active'];
                $stats['pending_memberships'] = (int)$row['pending'];
            }
        } catch (\Exception $e) {}

        // Activities stats
        try {
            $stmt = $this->db->query("SELECT 
                COUNT(*) as total, 
                COUNT(CASE WHEN status='published' THEN 1 END) as published,
                COUNT(CASE WHEN status='completed' THEN 1 END) as completed
                FROM activities");
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $stats['total_activities'] = (int)$row['total'];
                $stats['published_activities'] = (int)$row['published'];
                $stats['completed_activities'] = (int)$row['completed'];
            }
        } catch (\Exception $e) {}

        // Finance stats
        try {
            $stmt = $this->db->query("SELECT 
                COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END), 0) as income,
                COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) as expense
                FROM financial_transactions WHERE status='approved'");
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $stats['total_income'] = (float)$row['income'];
                $stats['total_expense'] = (float)$row['expense'];
                $stats['net_balance'] = $stats['total_income'] - $stats['total_expense'];
            }
        } catch (\Exception $e) {}

        // Sponsors stats
        try {
            $stmt = $this->db->query("SELECT 
                COUNT(*) as total, 
                COUNT(CASE WHEN status='active' THEN 1 END) as active
                FROM sponsors");
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $stats['total_sponsors'] = (int)$row['total'];
                $stats['active_sponsors'] = (int)$row['active'];
            }
        } catch (\Exception $e) {}

        // Support tickets stats
        try {
            $stmt = $this->db->query("SELECT 
                COUNT(*) as total, 
                COUNT(CASE WHEN status='open' THEN 1 END) as open_tickets
                FROM support_tickets");
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $stats['total_tickets'] = (int)$row['total'];
                $stats['open_tickets'] = (int)$row['open_tickets'];
            }
        } catch (\Exception $e) {}

        return ResponseHelper::success('تم استرجاع الإحصائيات الشاملة', $stats);
    }

    public function overview(Request $request): array
    {
        try {
            $statsResponse = $this->stats($request);
            $stats = $statsResponse['data'] ?? [];

            // Fetch other overview data
            $overview = [
                'stats' => $stats,
                'recent_members' => [],
                'recent_transactions' => [],
            ];

            try {
                $stmt = $this->db->query("SELECT id, full_name, created_at FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 5");
                $overview['recent_members'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (\Exception $e) {}

            try {
                $stmt = $this->db->query("SELECT id, type, amount, description, transaction_date FROM financial_transactions ORDER BY transaction_date DESC LIMIT 5");
                $overview['recent_transactions'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (\Exception $e) {}

            return ResponseHelper::success('تم استرجاع الملخص العام', $overview);
        } catch (\Exception $e) {
            error_log("Reports overview error: " . $e->getMessage());
            return ResponseHelper::error('خطأ في استرجاع الملخص: ' . $e->getMessage(), 500);
        }
    }

    public function members(Request $request): array
    {
        try {
            $data = [
                'by_status' => [],
                'by_university' => [],
                'by_city' => [],
                'by_nationality' => [],
                'new_members_chart' => []
            ];

            try {
                $stmt = $this->db->query("SELECT status, COUNT(*) as count FROM users WHERE deleted_at IS NULL GROUP BY status");
                $data['by_status'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (\Exception $e) {}

            try {
                $stmt = $this->db->query("SELECT university, COUNT(*) as count FROM users WHERE deleted_at IS NULL AND university IS NOT NULL GROUP BY university");
                $data['by_university'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (\Exception $e) {}

            try {
                $stmt = $this->db->query("SELECT city, COUNT(*) as count FROM users WHERE deleted_at IS NULL AND city IS NOT NULL GROUP BY city");
                $data['by_city'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (\Exception $e) {}

            try {
                $stmt = $this->db->query("SELECT nationality, COUNT(*) as count FROM users WHERE deleted_at IS NULL AND nationality IS NOT NULL GROUP BY nationality");
                $data['by_nationality'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (\Exception $e) {}

            try {
                $stmt = $this->db->query("SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count 
                                          FROM users 
                                          WHERE deleted_at IS NULL AND created_at >= DATE_SUB(LAST_DAY(NOW()), INTERVAL 6 MONTH) 
                                          GROUP BY DATE_FORMAT(created_at, '%Y-%m') 
                                          ORDER BY month ASC");
                $data['new_members_chart'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (\Exception $e) {}

            return ResponseHelper::success('تقرير الأعضاء', $data);
        } catch (\Exception $e) {
            error_log("Reports members error: " . $e->getMessage());
            return ResponseHelper::error('خطأ في استرجاع تقرير الأعضاء: ' . $e->getMessage(), 500);
        }
    }

    public function subscriptions(Request $request): array
    {
        try {
            $data = [
                'by_status' => [],
                'by_package_type' => [],
                'income_by_month' => [],
                'expiring_soon' => []
            ];

            try {
                $stmt = $this->db->query("SELECT status, COUNT(*) as count FROM memberships GROUP BY status");
                $data['by_status'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (\Exception $e) {}

            try {
                $stmt = $this->db->query("SELECT package_type, COUNT(*) as count FROM memberships GROUP BY package_type");
                $data['by_package_type'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (\Exception $e) {}

            try {
                $stmt = $this->db->query("SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(amount) as income 
                                          FROM memberships 
                                          WHERE status = 'active'
                                          GROUP BY DATE_FORMAT(created_at, '%Y-%m') 
                                          ORDER BY month ASC");
                $data['income_by_month'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (\Exception $e) {}

            try {
                $stmt = $this->db->query("SELECT m.*, u.full_name as user_name 
                                          FROM memberships m 
                                          LEFT JOIN users u ON m.user_id = u.id 
                                          WHERE m.status = 'active' AND m.end_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
                                          ORDER BY m.end_date ASC");
                $data['expiring_soon'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (\Exception $e) {}

            return ResponseHelper::success('تقرير الاشتراكات', $data);
        } catch (\Exception $e) {
            error_log("Reports subscriptions error: " . $e->getMessage());
            return ResponseHelper::error('خطأ في استرجاع تقرير الاشتراكات: ' . $e->getMessage(), 500);
        }
    }

    public function activities(Request $request): array
    {
        try {
            $data = [
                'by_type' => [],
                'by_status' => [],
                'total_participants' => 0,
                'activities_by_month' => []
            ];

            try {
                $stmt = $this->db->query("SELECT type, COUNT(*) as count FROM activities GROUP BY type");
                $data['by_type'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (\Exception $e) {}

            try {
                $stmt = $this->db->query("SELECT status, COUNT(*) as count FROM activities GROUP BY status");
                $data['by_status'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (\Exception $e) {}

            try {
                $stmt = $this->db->query("SELECT COUNT(*) as total FROM activity_registrations WHERE status = 'attended'");
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                $data['total_participants'] = (int)($row['total'] ?? 0);
            } catch (\Exception $e) {}

            try {
                $stmt = $this->db->query("SELECT DATE_FORMAT(start_date, '%Y-%m') as month, COUNT(*) as count 
                                          FROM activities 
                                          GROUP BY DATE_FORMAT(start_date, '%Y-%m') 
                                          ORDER BY month ASC");
                $data['activities_by_month'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (\Exception $e) {}

            return ResponseHelper::success('تقرير الأنشطة', $data);
        } catch (\Exception $e) {
            error_log("Reports activities error: " . $e->getMessage());
            return ResponseHelper::error('خطأ في استرجاع تقرير الأنشطة: ' . $e->getMessage(), 500);
        }
    }

    public function finance(Request $request): array
    {
        try {
            $data = [
                'income_vs_expense' => [],
                'by_category' => [],
                'by_month' => []
            ];

            try {
                $stmt = $this->db->query("SELECT type, SUM(amount) as total FROM financial_transactions WHERE status = 'approved' GROUP BY type");
                $data['income_vs_expense'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (\Exception $e) {}

            try {
                $stmt = $this->db->query("SELECT category, SUM(amount) as total FROM financial_transactions WHERE status = 'approved' GROUP BY category");
                $data['by_category'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (\Exception $e) {}

            try {
                $stmt = $this->db->query("SELECT DATE_FORMAT(transaction_date, '%Y-%m') as month, 
                                          SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
                                          SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
                                          FROM financial_transactions 
                                          WHERE status = 'approved'
                                          GROUP BY DATE_FORMAT(transaction_date, '%Y-%m') 
                                          ORDER BY month ASC");
                $data['by_month'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (\Exception $e) {}

            return ResponseHelper::success('التقرير المالي', $data);
        } catch (\Exception $e) {
            error_log("Reports finance error: " . $e->getMessage());
            return ResponseHelper::error('خطأ في استرجاع التقرير المالي: ' . $e->getMessage(), 500);
        }
    }
}
