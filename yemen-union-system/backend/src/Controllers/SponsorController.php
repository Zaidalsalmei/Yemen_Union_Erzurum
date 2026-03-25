<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Helpers\ResponseHelper;
use PDO;
use Exception;

class SponsorController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = \App\Core\Database::getInstance()->getConnection();
    }

    /**
     * Get all sponsors
     */
    public function index(Request $request): array
    {
        try {
            $status = $request->query('status');
            $type = $request->query('type');
            $search = $request->query('search');

            $where = ["deleted_at IS NULL"];
            $params = [];

            if ($status) {
                $where[] = "status = :status";
                $params['status'] = $status;
            }

            if ($type) {
                $where[] = "type = :type";
                $params['type'] = $type;
            }

            if ($search) {
                $where[] = "(name LIKE :search OR contact_person LIKE :search OR phone_number LIKE :search)";
                $params['search'] = "%$search%";
            }

            $whereClause = implode(" AND ", $where);
            $stmt = $this->db->prepare("SELECT * FROM sponsors WHERE $whereClause ORDER BY created_at DESC");
            $stmt->execute($params);
            $sponsors = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return ResponseHelper::success('تم جلب قائمة الرعاة بنجاح', $sponsors);
        } catch (Exception $e) {
            return ResponseHelper::error('خطأ: ' . $e->getMessage());
        }
    }

    /**
     * Store new sponsor
     */
    public function store(Request $request): array
    {
        try {
            $data = $request->all();
            if (empty($data['name'])) return ResponseHelper::error('اسم الراعي مطلوب');

            $stmt = $this->db->prepare("INSERT INTO sponsors (
                name, type, contact_person, phone_number, email, address, notes, status, created_at
            ) VALUES (
                :name, :type, :contact_person, :phone_number, :email, :address, :notes, :status, NOW()
            )");

            $stmt->execute([
                'name' => $data['name'],
                'type' => $data['type'] ?? 'individual',
                'contact_person' => $data['contact_person'] ?? null,
                'phone_number' => $data['phone_number'] ?? null,
                'email' => $data['email'] ?? null,
                'address' => $data['address'] ?? null,
                'notes' => $data['notes'] ?? null,
                'status' => $data['status'] ?? 'active'
            ]);

            return ResponseHelper::success('تمت إضافة الراعي بنجاح', ['id' => $this->db->lastInsertId()]);
        } catch (Exception $e) {
            return ResponseHelper::error('خطأ في الإضافة: ' . $e->getMessage());
        }
    }

    /**
     * Update sponsor
     */
    public function update(Request $request, array $params): array
    {
        try {
            $id = $params['id'];
            $data = $request->all();

            $updateFields = [];
            $queryParams = ['id' => $id];

            $allowed = ['name', 'type', 'contact_person', 'phone_number', 'email', 'address', 'notes', 'status'];
            foreach ($allowed as $field) {
                if (isset($data[$field])) {
                    $updateFields[] = "$field = :$field";
                    $queryParams[$field] = $data[$field];
                }
            }

            if (empty($updateFields)) return ResponseHelper::error('لا توجد بيانات للتحديث');

            $sql = "UPDATE sponsors SET " . implode(', ', $updateFields) . ", updated_at = NOW() WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($queryParams);

            return ResponseHelper::success('تم تحديث بيانات الراعي بنجاح');
        } catch (Exception $e) {
            return ResponseHelper::error('خطأ في التحديث: ' . $e->getMessage());
        }
    }

    /**
     * Hard or soft delete? User mentioned deleted_at support.
     */
    public function destroy(Request $request, array $params): array
    {
        try {
            $id = $params['id'];
            $stmt = $this->db->prepare("UPDATE sponsors SET deleted_at = NOW(), status = 'inactive' WHERE id = :id");
            $stmt->execute(['id' => $id]);
            return ResponseHelper::success('تم حذف الراعي بنجاح');
        } catch (Exception $e) {
            return ResponseHelper::error('خطأ في الحذف: ' . $e->getMessage());
        }
    }

    /**
     * Show sponsor details
     */
    public function show(Request $request, array $params): array
    {
        try {
            $id = $params['id'];
            $stmt = $this->db->prepare("SELECT * FROM sponsors WHERE id = :id AND deleted_at IS NULL");
            $stmt->execute(['id' => $id]);
            $sponsor = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$sponsor) return ResponseHelper::error('الراعي غير موجود', 404);

            return ResponseHelper::success('تفاصيل الراعي', $sponsor);
        } catch (Exception $e) {
            return ResponseHelper::error('Error: ' . $e->getMessage());
        }
    }

    /**
     * Get sponsor statistics
     */
    public function stats(Request $request): array
    {
        try {
            $total_sponsored = (float)$this->db->query("
                SELECT SUM(amount) FROM financial_transactions 
                WHERE reference_type = 'sponsorship' AND status = 'approved'
            ")->fetchColumn();

            $this_month_amount = (float)$this->db->query("
                SELECT SUM(amount) FROM financial_transactions 
                WHERE reference_type = 'sponsorship' AND status = 'approved' 
                AND MONTH(transaction_date) = MONTH(CURRENT_DATE())
                AND YEAR(transaction_date) = YEAR(CURRENT_DATE())
            ")->fetchColumn();

            $stats = [
                'total_sponsors' => (int)$this->db->query("SELECT COUNT(*) FROM sponsors WHERE deleted_at IS NULL")->fetchColumn(),
                'active_sponsors' => (int)$this->db->query("SELECT COUNT(*) FROM sponsors WHERE status = 'active' AND deleted_at IS NULL")->fetchColumn(),
                'total_sponsored' => $total_sponsored,
                'total_sponsorships' => (int)$this->db->query("SELECT COUNT(*) FROM sponsorships WHERE deleted_at IS NULL")->fetchColumn(),
                'this_month_amount' => $this_month_amount,
                'top_sponsors' => $this->getTopSponsors()
            ];

            return ResponseHelper::success('إحصائيات الرعاة', $stats);
        } catch (Exception $e) {
            return ResponseHelper::error('خطأ في جلب الإحصائيات: ' . $e->getMessage());
        }
    }

    private function getTopSponsors(): array
    {
        $sql = "SELECT spr.name, SUM(sps.amount) as total_amount
                FROM sponsorships sps
                JOIN sponsors spr ON sps.sponsor_id = spr.id
                WHERE sps.deleted_at IS NULL AND sps.status = 'received'
                GROUP BY sps.sponsor_id
                ORDER BY total_amount DESC
                LIMIT 5";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }
}
