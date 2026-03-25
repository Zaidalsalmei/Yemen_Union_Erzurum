<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Helpers\ResponseHelper;
use App\Helpers\NumberHelper;
use PDO;
use Exception;

class SponsorshipController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = \App\Core\Database::getInstance()->getConnection();
    }

    /**
     * Get all sponsorships with join to sponsor and activity
     */
    public function index(Request $request): array
    {
        try {
            $sponsor_id = $request->query('sponsor_id');
            $activity_id = $request->query('activity_id');
            $category = $request->query('category') ?? $request->query('type');
            
            $where = ["sps.deleted_at IS NULL"];
            $params = [];
 
            if ($sponsor_id) {
                $where[] = "sps.sponsor_id = :sponsor_id";
                $params['sponsor_id'] = $sponsor_id;
            }
 
            if ($activity_id) {
                $where[] = "sps.activity_id = :activity_id";
                $params['activity_id'] = $activity_id;
            }
 
            if ($category) {
                $where[] = "sps.type = :type";
                $params['type'] = $category;
            }
 
            $whereClause = implode(" AND ", $where);
 
            $query = "SELECT sps.*, sps.visit_date as received_date, sps.type as category, 
                             spr.name as sponsor_name, act.title as activity_title
                      FROM sponsorships sps
                      JOIN sponsors spr ON sps.sponsor_id = spr.id
                      LEFT JOIN activities act ON sps.activity_id = act.id
                      WHERE $whereClause
                      ORDER BY sps.created_at DESC";
 
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
 
            return ResponseHelper::success('تم جلب الرعايات بنجاح', $results);
        } catch (Exception $e) {
            return ResponseHelper::error('خطأ: ' . $e->getMessage());
        }
    }

    /**
     * Store a new sponsorship
     */
    public function store(Request $request): array
    {
        try {
            $data = $request->all();
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("INSERT INTO sponsorships (
                sponsor_id, activity_id, type, amount, description, visit_date, notes, created_at
            ) VALUES (
                :sponsor, :activity, :type, :amount, :description, :visit_date, :notes, NOW()
            )");
 
        $stmt->execute([
            'sponsor' => $data['sponsor_id'],
            'activity' => $data['activity_id'],
            'type' => $data['category'] ?? ($data['type'] ?? 'financial'),
            'amount' => NumberHelper::parseFloat($data['amount'] ?? 0),
            'description' => $data['description'] ?? null,
            'visit_date' => $data['received_date'] ?? ($data['visit_date'] ?? date('Y-m-d')),
            'notes' => $data['notes'] ?? null
        ]);

        $sponsorshipId = (int)$this->db->lastInsertId();

        // تزامن مع الإدارة المالية إذا كان هناك مبلغ
        $amountValue = NumberHelper::parseFloat($data['amount'] ?? 0);
        if ($amountValue > 0) {
            $this->recordFinancialTransaction($sponsorshipId, $data, $amountValue);
        }

            $this->db->commit();

            return ResponseHelper::success('تمت إضافة الرعاية بنجاح', ['id' => $sponsorshipId]);
        } catch (Exception $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            return ResponseHelper::error('خطأ في الإضافة: ' . $e->getMessage());
        }
    }

    /**
     * تسجيل العملية في الإدارة المالية
     */
    private function recordFinancialTransaction(int $sponsorshipId, array $data, float $amountValue)
    {
        $stmt = $this->db->prepare("INSERT INTO financial_transactions (
            type, category, amount, currency, description, 
            reference_type, reference_id, payment_method, 
            transaction_date, status, created_at
        ) VALUES (
            'income', 'sponsorship', :amount, :currency, :desc,
            'sponsorship', :ref_id, 'cash',
            :t_date, 'pending', NOW()
        )");

        $stmt->execute([
            'amount' => $amountValue,
            'currency' => $data['currency'] ?? 'TRY',
            'desc' => "دعم من جهة راعية - " . ($data['notes'] ?? 'رعاية عامة'),
            'ref_id' => $sponsorshipId,
            't_date' => $data['received_date'] ?? date('Y-m-d')
        ]);
    }

    /**
     * اعتماد الرعاية وتفعيلها مالياً
     */
    public function approve(Request $request, array $params): array
    {
        try {
            $id = $params['id'];
            $this->db->beginTransaction();

            // 1. تحديث حالة الرعاية
            $stmt = $this->db->prepare("UPDATE sponsorships SET status = 'received', updated_at = NOW() WHERE id = :id");
            $stmt->execute(['id' => $id]);

            // 2. تحديث المعاملة المالية المرتبطة
            $stmtFin = $this->db->prepare("UPDATE financial_transactions SET status = 'approved', updated_at = NOW() WHERE reference_type = 'sponsorship' AND reference_id = :id");
            $stmtFin->execute(['id' => $id]);

            $this->db->commit();
            return ResponseHelper::success('تم اعتماد الرعاية وإضافتها للمالية بنجاح');
        } catch (Exception $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            return ResponseHelper::error('خطأ في الاعتماد: ' . $e->getMessage());
        }
    }

    /**
     * رفض الرعاية
     */
    public function reject(Request $request, array $params): array
    {
        try {
            $id = $params['id'];
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("UPDATE sponsorships SET status = 'refunded', updated_at = NOW() WHERE id = :id");
            $stmt->execute(['id' => $id]);

            $stmtFin = $this->db->prepare("UPDATE financial_transactions SET status = 'rejected', updated_at = NOW() WHERE reference_type = 'sponsorship' AND reference_id = :id");
            $stmtFin->execute(['id' => $id]);

            $this->db->commit();
            return ResponseHelper::success('تم رفض الرعاية بنجاح');
        } catch (Exception $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            return ResponseHelper::error('خطأ في الرفض: ' . $e->getMessage());
        }
    }

    /**
     * Update sponsorship
     */
    public function update(Request $request, array $params): array
    {
        try {
            $id = $params['id'];
            $data = $request->all();

            $updateFields = [];
            $queryParams = ['id' => $id];

            $allowed = ['sponsor_id', 'activity_id', 'type', 'amount', 'description', 'visit_date', 'notes'];
            foreach ($allowed as $field) {
                if (isset($data[$field])) {
                    $updateFields[] = "$field = :$field";
                    $queryParams[$field] = $data[$field];
                }
            }

            if (empty($updateFields)) return ResponseHelper::error('لا توجد بيانات للتحديث');

            $sql = "UPDATE sponsorships SET " . implode(', ', $updateFields) . ", updated_at = NOW() WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($queryParams);

            return ResponseHelper::success('تم تحديث بيانات الرعاية بنجاح');
        } catch (Exception $e) {
            return ResponseHelper::error('خطأ في التحديث: ' . $e->getMessage());
        }
    }

    /**
     * Show sponsorship details
     */
    public function show(Request $request, array $params): array
    {
        try {
            $id = $params['id'];
            $query = "SELECT sps.*, spr.name as sponsor_name, act.title as activity_title
                      FROM sponsorships sps
                      JOIN sponsors spr ON sps.sponsor_id = spr.id
                      JOIN activities act ON sps.activity_id = act.id
                      WHERE sps.id = :id AND sps.deleted_at IS NULL";
            $stmt = $this->db->prepare($query);
            $stmt->execute(['id' => $id]);
            $res = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$res) return ResponseHelper::error('الرعاية غير موجودة', 404);

            return ResponseHelper::success('تفاصيل الرعاية', $res);
        } catch (Exception $e) {
            return ResponseHelper::error('Error: ' . $e->getMessage());
        }
    }

    /**
     * Soft delete
     */
    public function destroy(Request $request, array $params): array
    {
        try {
            $id = $params['id'];
            $stmt = $this->db->prepare("UPDATE sponsorships SET deleted_at = NOW() WHERE id = :id");
            $stmt->execute(['id' => $id]);
            return ResponseHelper::success('تم حذف الرعاية بنجاح');
        } catch (Exception $e) {
            return ResponseHelper::error('خطأ في الحذف: ' . $e->getMessage());
        }
    }

    /**
     * Get sponsorship statistics
     */
    public function stats(Request $request): array
    {
        try {
            $stats = [
                'total' => (int)$this->db->query("SELECT COUNT(*) FROM sponsorships WHERE deleted_at IS NULL")->fetchColumn(),
                'total_amount' => (float)$this->db->query("SELECT SUM(amount) FROM sponsorships WHERE deleted_at IS NULL")->fetchColumn(),
                'financial_count' => (int)$this->db->query("SELECT COUNT(*) FROM sponsorships WHERE type = 'financial' AND deleted_at IS NULL")->fetchColumn(),
                'in_kind_count' => (int)$this->db->query("SELECT COUNT(*) FROM sponsorships WHERE type = 'in_kind' AND deleted_at IS NULL")->fetchColumn()
            ];

            return ResponseHelper::success('إحصائيات الرعايات', $stats);
        } catch (Exception $e) {
            return ResponseHelper::error('خطأ في جلب الإحصائيات: ' . $e->getMessage());
        }
    }
}
