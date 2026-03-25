<?php
declare(strict_types=1);
namespace App\Controllers;

use App\Core\Request;
use App\Helpers\ResponseHelper;
use PDO;

class ReportController
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = \App\Core\Database::getInstance()->getConnection();
    }

    /**
     * GET /api/reports/overview
     * تقرير شامل — كل الإحصائيات من قاعدة البيانات
     * يقبل: ?from=2026-01-01&to=2026-12-31
     */
    public function overview(Request $request): array
    {
        try {
            $from = $request->input('from') ?? date('Y-01-01');
            $to = $request->input('to') ?? date('Y-m-d');
            $toEnd = $to . ' 23:59:59';

            // ===== 1. إحصائيات الأعضاء =====

            // إجمالي + حسب الحالة
            $memberStats = "SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended,
                COUNT(CASE WHEN status = 'banned' THEN 1 END) as banned,
                COUNT(CASE WHEN created_at BETWEEN :from AND :toEnd THEN 1 END) as new_in_period,
                COUNT(CASE WHEN MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE()) THEN 1 END) as new_this_month,
                COUNT(CASE WHEN YEAR(created_at) = YEAR(CURDATE()) THEN 1 END) as new_this_year
            FROM users WHERE deleted_at IS NULL";

            // حسب الجامعة
            $byUniversity = "SELECT COALESCE(university, 'غير محدد') as name, COUNT(*) as count 
                FROM users WHERE deleted_at IS NULL 
                GROUP BY university ORDER BY count DESC LIMIT 10";

            // حسب الكلية
            $byFaculty = "SELECT COALESCE(faculty, 'غير محدد') as name, COUNT(*) as count 
                FROM users WHERE deleted_at IS NULL AND faculty IS NOT NULL
                GROUP BY faculty ORDER BY count DESC LIMIT 10";

            // حسب المستوى الدراسي
            $byLevel = "SELECT COALESCE(study_level, 'غير محدد') as level, COUNT(*) as count 
                FROM users WHERE deleted_at IS NULL 
                GROUP BY study_level";

            // حسب المدينة
            $byCity = "SELECT COALESCE(city, 'غير محدد') as name, COUNT(*) as count 
                FROM users WHERE deleted_at IS NULL AND city IS NOT NULL
                GROUP BY city ORDER BY count DESC LIMIT 10";

            // ===== 2. إحصائيات المالية =====

            $financeStats = "SELECT 
                COALESCE(SUM(CASE WHEN type = 'income' AND status = 'approved' THEN amount ELSE 0 END), 0) as total_income,
                COALESCE(SUM(CASE WHEN type = 'expense' AND status = 'approved' THEN amount ELSE 0 END), 0) as total_expense,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
                COUNT(*) as total_transactions
            FROM financial_transactions
            WHERE transaction_date BETWEEN :from AND :to";

            // حسب الفئة
            $byCategory = "SELECT category, type, 
                COUNT(*) as count, SUM(amount) as total 
                FROM financial_transactions 
                WHERE status = 'approved' AND transaction_date BETWEEN :from AND :to
                GROUP BY category, type ORDER BY total DESC";

            // حسب الشهر
            $financeByMonth = "SELECT 
                DATE_FORMAT(transaction_date, '%Y-%m') as month,
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
            FROM financial_transactions 
            WHERE status = 'approved' AND transaction_date BETWEEN :from AND :to
            GROUP BY DATE_FORMAT(transaction_date, '%Y-%m') ORDER BY month";

            // حسب طريقة الدفع
            $byPayment = "SELECT 
                COALESCE(payment_method, 'غير محدد') as method, 
                COUNT(*) as count, SUM(amount) as total
            FROM financial_transactions 
            WHERE status = 'approved' AND transaction_date BETWEEN :from AND :to
            GROUP BY payment_method";

            // ===== 3. إحصائيات الاشتراكات =====

            $membershipStats = "SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
                COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
                COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END), 0) as total_revenue,
                COUNT(CASE WHEN status = 'active' AND DATEDIFF(end_date, CURDATE()) BETWEEN 1 AND 30 THEN 1 END) as expiring_soon
            FROM memberships";

            // حسب الباقة
            $byPackage = "SELECT 
                COALESCE(package_name, 'غير محدد') as package, 
                COUNT(*) as count, 
                SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END) as revenue
            FROM memberships GROUP BY package_name";

            // ===== 4. إحصائيات الأنشطة =====

            $activityStats = "SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
                COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft,
                COUNT(CASE WHEN status IN ('published','ongoing') AND start_date > NOW() THEN 1 END) as upcoming
            FROM activities WHERE deleted_at IS NULL";

            // حسب النوع
            $actByType = "SELECT type, COUNT(*) as count 
                FROM activities WHERE deleted_at IS NULL 
                GROUP BY type ORDER BY count DESC";

            // حسب الشهر
            $actByMonth = "SELECT 
                DATE_FORMAT(start_date, '%Y-%m') as month, COUNT(*) as count
            FROM activities WHERE deleted_at IS NULL AND start_date BETWEEN :from AND :toEnd
            GROUP BY DATE_FORMAT(start_date, '%Y-%m') ORDER BY month";

            // ===== 5. إحصائيات المنشورات =====

            $postStats = "SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
                COUNT(CASE WHEN status = 'draft' THEN 1 END) as drafts
            FROM posts WHERE deleted_at IS NULL";

            // حسب النوع
            $postByType = "SELECT type, COUNT(*) as count 
                FROM posts WHERE deleted_at IS NULL 
                GROUP BY type";

            // ===== 6. إحصائيات الدعم الفني =====
            // (إذا الجدول غير موجود نرجع أصفار)

            // ===== التنفيذ =====

            // أعضاء
            $stmt = $this->db->prepare($memberStats);
            $stmt->execute([':from' => $from, ':toEnd' => $toEnd]);
            $members = $stmt->fetch(PDO::FETCH_ASSOC);

            $members['by_university'] = $this->db->query($byUniversity)->fetchAll(PDO::FETCH_ASSOC);
            $members['by_faculty'] = $this->db->query($byFaculty)->fetchAll(PDO::FETCH_ASSOC);
            $members['by_study_level'] = $this->db->query($byLevel)->fetchAll(PDO::FETCH_ASSOC);
            $members['by_city'] = $this->db->query($byCity)->fetchAll(PDO::FETCH_ASSOC);

            // مالية
            $stmt = $this->db->prepare($financeStats);
            $stmt->execute([':from' => $from, ':to' => $to]);
            $finance = $stmt->fetch(PDO::FETCH_ASSOC);
            $finance['net'] = (float)$finance['total_income'] - (float)$finance['total_expense'];
            $finance['currency'] = 'TRY';

            $stmt = $this->db->prepare($byCategory);
            $stmt->execute([':from' => $from, ':to' => $to]);
            $finance['by_category'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $stmt = $this->db->prepare($financeByMonth);
            $stmt->execute([':from' => $from, ':to' => $to]);
            $finance['by_month'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $stmt = $this->db->prepare($byPayment);
            $stmt->execute([':from' => $from, ':to' => $to]);
            $finance['by_payment_method'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // اشتراكات
            $memberships = $this->db->query($membershipStats)->fetch(PDO::FETCH_ASSOC);
            $memberships['by_package'] = $this->db->query($byPackage)->fetchAll(PDO::FETCH_ASSOC);

            // أنشطة
            $activities = $this->db->query($activityStats)->fetch(PDO::FETCH_ASSOC);
            $activities['by_type'] = $this->db->query($actByType)->fetchAll(PDO::FETCH_ASSOC);

            $stmt = $this->db->prepare($actByMonth);
            $stmt->execute([':from' => $from, ':toEnd' => $toEnd]);
            $activities['by_month'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // منشورات
            $posts = $this->db->query($postStats)->fetch(PDO::FETCH_ASSOC);
            $posts['by_type'] = $this->db->query($postByType)->fetchAll(PDO::FETCH_ASSOC);

            // دعم فني
            $support = ['total' => 0, 'open_tickets' => 0, 'resolved' => 0];
            try {
                $supportStats = "SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN status = 'open' THEN 1 END) as open_tickets,
                    COUNT(CASE WHEN status IN ('resolved','closed') THEN 1 END) as resolved
                FROM support_tickets";
                $support = $this->db->query($supportStats)->fetch(PDO::FETCH_ASSOC);
            } catch (\Exception $e) {
                // الجدول غير موجود — نرجع أصفار
            }

            return ResponseHelper::success('تقرير شامل', [
                'period' => ['from' => $from, 'to' => $to],
                'members' => $members,
                'finance' => $finance,
                'memberships' => $memberships,
                'activities' => $activities,
                'posts' => $posts,
                'support' => $support,
                'generated_at' => date('Y-m-d H:i:s')
            ]);

        } catch (\Exception $e) {
            error_log("ReportController::overview error: " . $e->getMessage());
            return ResponseHelper::error('خطأ في تحميل التقارير: ' . $e->getMessage(), 500);
        }
    }
}
