<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Helpers\ResponseHelper;
use PDO;

class FinanceController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = \App\Core\Database::getInstance()->getConnection();
    }

    public function stats(Request $request): array
    {
        try {
            $sql = "SELECT 
                        COALESCE(SUM(CASE WHEN type='income' AND status='approved' THEN amount ELSE 0 END), 0) as total_income,
                        COALESCE(SUM(CASE WHEN type='expense' AND status='approved' THEN amount ELSE 0 END), 0) as total_expense,
                        COUNT(*) as total_transactions,
                        COUNT(CASE WHEN status='pending' THEN 1 END) as pending_transactions
                    FROM financial_transactions";
            $stmt = $this->db->query($sql);
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);

            // Calculate net
            $stats['net_balance'] = $stats['total_income'] - $stats['total_expense'];

            return ResponseHelper::success('تم استرجاع إحصائيات المالية', $stats);
        } catch (\Exception $e) {
            error_log("Finance stats error: " . $e->getMessage());
            return ResponseHelper::error('خطأ في استرجاع الإحصائيات: ' . $e->getMessage(), 500);
        }
    }

    public function overview(Request $request): array
    {
        try {
            // Stats
            $statsSql = "SELECT 
                        COALESCE(SUM(CASE WHEN type='income' AND status='approved' THEN amount ELSE 0 END), 0) as total_income,
                        COALESCE(SUM(CASE WHEN type='expense' AND status='approved' THEN amount ELSE 0 END), 0) as total_expense,
                        COUNT(*) as total_transactions,
                        COUNT(CASE WHEN status='pending' THEN 1 END) as pending_transactions
                    FROM financial_transactions";
            $stmt = $this->db->query($statsSql);
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);
            $stats['net_balance'] = $stats['total_income'] - $stats['total_expense'];

            // Last 10 transactions
            $latestSql = "SELECT ft.*, u.full_name as created_by_name 
                          FROM financial_transactions ft 
                          LEFT JOIN users u ON ft.created_by = u.id 
                          ORDER BY ft.created_at DESC LIMIT 10";
            $stmt = $this->db->query($latestSql);
            $latestTransactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Monthly chart data (last 6 months)
            $chartSql = "SELECT 
                            DATE_FORMAT(transaction_date, '%Y-%m') as month,
                            COALESCE(SUM(CASE WHEN type='income' AND status='approved' THEN amount ELSE 0 END), 0) as income,
                            COALESCE(SUM(CASE WHEN type='expense' AND status='approved' THEN amount ELSE 0 END), 0) as expense
                         FROM financial_transactions 
                         WHERE transaction_date >= DATE_SUB(LAST_DAY(NOW()), INTERVAL 6 MONTH)
                         GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
                         ORDER BY month ASC";
            $stmt = $this->db->query($chartSql);
            $chartData = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $data = [
                'stats' => $stats,
                'latest_transactions' => $latestTransactions,
                'chart_data' => $chartData
            ];

            return ResponseHelper::success('تم استرجاع الملخص المالي', $data);
        } catch (\Exception $e) {
            error_log("Finance overview error: " . $e->getMessage());
            return ResponseHelper::error('خطأ في استرجاع الملخص: ' . $e->getMessage(), 500);
        }
    }

    public function transactions(Request $request): array
    {
        try {
            $type = $request->input('type');
            $status = $request->input('status');
            $search = $request->input('search');
            $page = (int)($request->input('page') ?? 1);
            $perPage = (int)($request->input('per_page') ?? 20);
            
            // pagination prep
            if ($page < 1) $page = 1;
            if ($perPage < 1) $perPage = 20;
            $offset = ($page - 1) * $perPage;

            $whereParts = ["1=1"];
            $params = [];

            if ($type) {
                $whereParts[] = "ft.type = :type";
                $params[':type'] = $type;
            }

            if ($status) {
                $whereParts[] = "ft.status = :status";
                $params[':status'] = $status;
            }

            if ($search) {
                $whereParts[] = "(ft.description LIKE :search OR ft.notes LIKE :search OR u.full_name LIKE :search)";
                $params[':search'] = "%$search%";
            }

            $whereSql = implode(" AND ", $whereParts);

            // count total
            $countSql = "SELECT COUNT(*) as total FROM financial_transactions ft LEFT JOIN users u ON ft.created_by = u.id WHERE $whereSql";
            $countStmt = $this->db->prepare($countSql);
            $countStmt->execute($params);
            $totalRow = $countStmt->fetch(PDO::FETCH_ASSOC);
            $total = (int)($totalRow['total'] ?? 0);

            // fetch data
            $fetchSql = "SELECT ft.*, u.full_name as created_by_name 
                         FROM financial_transactions ft 
                         LEFT JOIN users u ON ft.created_by = u.id 
                         WHERE $whereSql 
                         ORDER BY ft.created_at DESC 
                         LIMIT :limit OFFSET :offset";
            
            $fetchStmt = $this->db->prepare($fetchSql);
            
            foreach ($params as $key => $val) {
                $fetchStmt->bindValue($key, $val);
            }
            $fetchStmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
            $fetchStmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            
            $fetchStmt->execute();
            $data = $fetchStmt->fetchAll(PDO::FETCH_ASSOC);

            // total pages
            $totalPages = ceil($total / $perPage);

            return ResponseHelper::success('تم استرجاع المعاملات', [
                'data' => $data,
                'pagination' => [
                    'total' => $total,
                    'page' => $page,
                    'per_page' => $perPage,
                    'total_pages' => $totalPages
                ]
            ]);
            
        } catch (\Exception $e) {
            error_log("Finance transactions error: " . $e->getMessage());
            return ResponseHelper::error('خطأ في استرجاع المعاملات: ' . $e->getMessage(), 500);
        }
    }
}
