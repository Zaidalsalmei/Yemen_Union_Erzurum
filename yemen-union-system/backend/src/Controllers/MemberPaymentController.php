<?php
/**
 * Member Payment Controller
 * Handles payment-related operations for members
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Helpers\ResponseHelper;
use PDO;

class MemberPaymentController
{
    private PDO $db;
    
    public function __construct()
    {
        $this->db = \App\Core\Database::getInstance()->getConnection();
    }
    
    /**
     * GET /api/member/payments/history
     * Get payment history for the authenticated member
     */
    public function history(Request $request): array
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
            
            // Get total count
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as total
                FROM memberships 
                WHERE user_id = :user_id 
                    AND deleted_at IS NULL
            ");
            $stmt->execute(['user_id' => $userId]);
            $total = (int) $stmt->fetch()['total'];
            
            // Get payments
            $stmt = $this->db->prepare("
                SELECT 
                    m.id,
                    m.package_name,
                    m.amount,
                    m.currency,
                    m.payment_method,
                    m.is_paid,
                    m.start_date,
                    m.end_date,
                    m.created_at as payment_date,
                    m.notes,
                    pp.status as payment_proof_status,
                    pp.uploaded_at as payment_proof_date,
                    pp.reviewed_at as payment_proof_reviewed_at,
                    pp.rejection_reason as payment_proof_rejection_reason,
                    CASE 
                        WHEN m.end_date < CURDATE() THEN 'expired'
                        WHEN m.is_paid = 1 THEN 'active'
                        ELSE 'pending'
                    END as status
                FROM memberships m
                LEFT JOIN payment_proofs pp ON m.id = pp.membership_id 
                    AND pp.deleted_at IS NULL
                WHERE m.user_id = :user_id 
                    AND m.deleted_at IS NULL
                ORDER BY m.created_at DESC
                LIMIT :limit OFFSET :offset
            ");
            
            $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Format data
            foreach ($payments as &$payment) {
                $payment['is_paid'] = (bool) $payment['is_paid'];
            }
            
            // Calculate pagination
            $totalPages = ceil($total / $limit);
            
            return ResponseHelper::success('تم جلب البيانات بنجاح', [
                'payments' => $payments,
                'pagination' => [
                    'current_page' => $page,
                    'total_pages' => $totalPages,
                    'total_items' => $total,
                    'per_page' => $limit
                ]
            ]);
            
        } catch (\Exception $e) {
            error_log("Payment History Error: " . $e->getMessage());
            return ResponseHelper::error('حدث خطأ في جلب البيانات', 500);
        }
    }
}
