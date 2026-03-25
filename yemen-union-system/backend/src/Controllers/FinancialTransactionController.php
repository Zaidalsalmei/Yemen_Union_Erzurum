<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Helpers\ResponseHelper;
use App\Helpers\NotificationHelper;

use PDO;
use Exception;

class FinancialTransactionController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = \App\Core\Database::getInstance()->getConnection();
    }

    /**
     * Get list of all transactions
     */
    public function index(Request $request): array
    {
        try {
            $type = $request->query('type');
            $status = $request->query('status');
            $category = $request->query('category');
            
            $where = ["1=1"];
            $params = [];

            if ($type) {
                $where[] = "type = :type";
                $params['type'] = $type;
            }

            if ($status) {
                $where[] = "status = :status";
                $params['status'] = $status;
            }

            if ($category) {
                $where[] = "category = :category";
                $params['category'] = $category;
            }

            $whereClause = implode(" AND ", $where);
            $stmt = $this->db->prepare("SELECT ft.*, u.full_name as creator_name 
                                         FROM financial_transactions ft
                                         LEFT JOIN users u ON ft.created_by = u.id
                                         WHERE $whereClause 
                                         ORDER BY ft.transaction_date DESC, ft.created_at DESC");
            $stmt->execute($params);
            $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Calculate totals
            $totals = [
                'income' => $this->calculateTotal('income'),
                'expense' => $this->calculateTotal('expense'),
                'balance' => $this->calculateTotal('income') - $this->calculateTotal('expense')
            ];

            return ResponseHelper::success('تم استرجاع المعاملات المالية', [
                'transactions' => $transactions,
                'stats' => $totals
            ]);
        } catch (Exception $e) {
            return ResponseHelper::error('خطأ: ' . $e->getMessage());
        }
    }

    /**
     * Store new transaction
     */
    public function store(Request $request): array
    {
        try {
            $data = $request->all();
            if (empty($data['amount']) || empty($data['type'])) return ResponseHelper::error('المبلغ والنوع مطلوبان');

            $stmt = $this->db->prepare("INSERT INTO financial_transactions (
                type, category, amount, currency, description, reference_type, reference_id,
                payment_method, receipt_photo, created_by, status, transaction_date, notes, created_at
            ) VALUES (
                :type, :category, :amount, :currency, :description, :ref_type, :ref_id,
                :method, :photo, :created_by, :status, :t_date, :notes, NOW()
            )");

            $stmt->execute([
                'type' => $data['type'],
                'category' => $data['category'] ?? 'other',
                'amount' => $data['amount'],
                'currency' => $data['currency'] ?? 'TRY',
                'description' => $data['description'] ?? null,
                'ref_type' => $data['reference_type'] ?? null,
                'ref_id' => $data['reference_id'] ?? null,
                'method' => $data['payment_method'] ?? 'cash',
                'photo' => $data['receipt_photo'] ?? null,
                'created_by' => $request->user['id'] ?? null,
                'status' => $data['status'] ?? 'pending',
                't_date' => $data['transaction_date'] ?? date('Y-m-d'),
                'notes' => $data['notes'] ?? null
            ]);

            $newId = $this->db->lastInsertId();

            // إرسال إشعار للرئيس
            $createdBy = (int)($request->user['id'] ?? $request->user['sub']);
            $userName = NotificationHelper::getUserName($this->db, $createdBy);
            $amount = $data['amount'];
            $currency = $data['currency'] ?? 'TRY';
            NotificationHelper::notifyRole($this->db, 'president', '💰 معاملة مالية جديدة', "معاملة بمبلغ {$amount} {$currency} بواسطة {$userName}", 'finance', "/finance");

            return ResponseHelper::success('تمت إضافة المعاملة بنجاح', ['id' => $newId]);
        } catch (Exception $e) {
            return ResponseHelper::error('خطأ في الإضافة: ' . $e->getMessage());
        }
    }

    /**
     * Update transaction status (Approve/Reject)
     */
    public function update(Request $request, array $params): array
    {
        try {
            $id = $params['id'];
            $data = $request->all();

            $updateFields = [];
            $queryParams = ['id' => $id];

            $allowed = ['status', 'notes', 'amount', 'category', 'payment_method', 'description'];
            foreach ($allowed as $field) {
                if (isset($data[$field])) {
                    $updateFields[] = "$field = :$field";
                    $queryParams[$field] = $data[$field];
                }
            }

            if (isset($data['status']) && $data['status'] === 'approved') {
                $updateFields[] = "approved_by = :approver";
                $updateFields[] = "approved_at = NOW()";
                $queryParams['approver'] = $request->user['id'] ?? null;
            }

            if (empty($updateFields)) return ResponseHelper::error('لا توجد بيانات للتحديث');

            $sql = "UPDATE financial_transactions SET " . implode(', ', $updateFields) . ", updated_at = NOW() WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($queryParams);

            return ResponseHelper::success('تم تحديث المعاملة بنجاح');
        } catch (Exception $e) {
            return ResponseHelper::error('خطأ في التحديث: ' . $e->getMessage());
        }
    }

    /**
     * Delete transaction
     */
    public function destroy(Request $request, array $params): array
    {
        try {
            $id = $params['id'];
            $stmt = $this->db->prepare("DELETE FROM financial_transactions WHERE id = :id");
            $stmt->execute(['id' => $id]);
            return ResponseHelper::success('تم حذف المعاملة بنجاح');
        } catch (Exception $e) {
            return ResponseHelper::error('خطأ في الحذف: ' . $e->getMessage());
        }
    }

    private function calculateTotal(string $type): float
    {
        $stmt = $this->db->prepare("SELECT SUM(amount) FROM financial_transactions WHERE type = :type AND status = 'approved'");
        $stmt->execute(['type' => $type]);
        return (float)$stmt->fetchColumn();
    }
}
