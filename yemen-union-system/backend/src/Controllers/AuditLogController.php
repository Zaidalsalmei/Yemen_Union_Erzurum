<?php
/**
 * Audit Log Controller
 * عرض سجل النشاطات للمسؤولين
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Helpers\ResponseHelper;

class AuditLogController
{
    private ?\PDO $db = null;

    public function __construct()
    {
        try {
            $this->db = \App\Core\Database::getInstance()->getConnection();
        } catch (\Throwable $e) {}
    }

    // =====================================================
    // GET /api/audit-logs
    // قائمة سجلات النشاطات مع فلترة
    // =====================================================
    public function index(Request $request): array
    {
        try {
            if (!$this->db) return ResponseHelper::error('خطأ في الاتصال', 500);

            $page    = max(1, (int) $request->query('page', 1));
            $perPage = min((int) $request->query('per_page', 20), 100);
            $offset  = ($page - 1) * $perPage;

            $userId    = $request->query('user_id', '');
            $action    = $request->query('action', '');
            $table     = $request->query('table_name', '');
            $dateFrom  = $request->query('date_from', '');
            $dateTo    = $request->query('date_to', '');
            $search    = $request->query('search', '');

            $where = ['1=1'];
            $params = [];

            if ($userId)   { $where[] = 'al.user_id = ?';      $params[] = $userId; }
            if ($action)   { $where[] = 'al.action = ?';       $params[] = $action; }
            if ($table)    { $where[] = 'al.table_name = ?';   $params[] = $table; }
            if ($dateFrom) { $where[] = 'al.created_at >= ?';  $params[] = $dateFrom . ' 00:00:00'; }
            if ($dateTo)   { $where[] = 'al.created_at <= ?';  $params[] = $dateTo . ' 23:59:59'; }
            if ($search)   { $where[] = '(u.full_name LIKE ? OR al.action LIKE ? OR al.table_name LIKE ?)';
                             $params[] = "%$search%"; $params[] = "%$search%"; $params[] = "%$search%"; }

            $whereSQL = implode(' AND ', $where);

            $stmt = $this->db->prepare("
                SELECT 
                    al.id,
                    al.user_id,
                    COALESCE(u.full_name, 'النظام') as user_name,
                    al.action,
                    al.table_name,
                    al.record_id,
                    al.old_data,
                    al.new_data,
                    al.ip_address,
                    al.created_at
                FROM audit_logs al
                LEFT JOIN users u ON al.user_id = u.id
                WHERE $whereSQL
                ORDER BY al.created_at DESC
                LIMIT ? OFFSET ?
            ");
            $params[] = $perPage;
            $params[] = $offset;
            $stmt->execute($params);
            $logs = $stmt->fetchAll() ?: [];

            $countParams = array_slice($params, 0, -2);
            $countStmt = $this->db->prepare("
                SELECT COUNT(*) as total FROM audit_logs al LEFT JOIN users u ON al.user_id=u.id WHERE $whereSQL
            ");
            $countStmt->execute($countParams);
            $total = (int) $countStmt->fetch()['total'];

            return ResponseHelper::paginated($logs, $total, $page, $perPage);
        } catch (\Throwable $e) {
            return ResponseHelper::error('فشل تحميل السجلات: ' . $e->getMessage(), 500);
        }
    }

    // =====================================================
    // GET /api/audit-logs/stats
    // إحصائيات السجلات لآخر 30 يوم
    // =====================================================
    public function stats(Request $request): array
    {
        try {
            if (!$this->db) return ResponseHelper::error('خطأ في الاتصال', 500);

            $stmt = $this->db->query("
                SELECT
                    COUNT(*) as total_actions,
                    SUM(CASE WHEN action='create' THEN 1 ELSE 0 END) as creates,
                    SUM(CASE WHEN action='update' THEN 1 ELSE 0 END) as updates,
                    SUM(CASE WHEN action='delete' THEN 1 ELSE 0 END) as deletes,
                    SUM(CASE WHEN action='login'  THEN 1 ELSE 0 END) as logins,
                    COUNT(DISTINCT user_id) as unique_users
                FROM audit_logs
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ");
            $stats = $stmt ? $stmt->fetch() : [];

            // أكثر المستخدمين نشاطاً
            $topStmt = $this->db->query("
                SELECT u.full_name, COUNT(*) as action_count
                FROM audit_logs al
                JOIN users u ON al.user_id = u.id
                WHERE al.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY al.user_id, u.full_name
                ORDER BY action_count DESC
                LIMIT 5
            ");
            $topUsers = $topStmt ? $topStmt->fetchAll() : [];

            // نشاطات اليوم
            $todayStmt = $this->db->query("
                SELECT action, COUNT(*) as count
                FROM audit_logs
                WHERE DATE(created_at) = CURRENT_DATE()
                GROUP BY action
                ORDER BY count DESC
            ");
            $todayActions = $todayStmt ? $todayStmt->fetchAll() : [];

            return ResponseHelper::success('تم جلب الإحصائيات', [
                'summary'       => $stats,
                'top_users'     => $topUsers,
                'today_actions' => $todayActions,
            ]);
        } catch (\Throwable $e) {
            return ResponseHelper::error('فشل جلب الإحصائيات: ' . $e->getMessage(), 500);
        }
    }

    // =====================================================
    // DELETE /api/audit-logs/old
    // حذف السجلات القديمة (أقدم من 90 يوم) - للصيانة
    // =====================================================
    public function clearOld(Request $request): array
    {
        try {
            if (!$this->db) return ResponseHelper::error('خطأ في الاتصال', 500);

            $days = max(30, (int) $request->query('days', 90));
            $stmt = $this->db->prepare("
                DELETE FROM audit_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
            ");
            $stmt->execute([$days]);
            $deleted = $stmt->rowCount();

            return ResponseHelper::success("تم حذف $deleted سجل قديم (أقدم من $days يوم)");
        } catch (\Throwable $e) {
            return ResponseHelper::error('فشل حذف السجلات: ' . $e->getMessage(), 500);
        }
    }
}
