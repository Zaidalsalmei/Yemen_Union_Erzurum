<?php

namespace App\Controllers;

use App\Core\Database;
use App\Core\Request;
use App\Helpers\ResponseHelper;
use App\Helpers\NotificationHelper;
use App\Helpers\NumberHelper;
use PDO;
use Exception;

class MembershipController
{
    private $db;

    public function __construct()
    {
        $this->db = \App\Core\Database::getInstance()->getConnection();
    }

    /**
     * Get all memberships with filtering and stats
     */
    public function index(Request $request)
    {
        try {
            $page = (int)$request->query('page', 1);
            $limit = (int)$request->query('limit', 10);
            $status = $request->query('status');
            $search = $request->query('search');
            $offset = ($page - 1) * $limit;

            $where = ["1=1"];
            $params = [];

            if ($status) {
                $where[] = "m.status = :status";
                $params['status'] = $status;
            }

            if ($search) {
                $where[] = "(u.full_name LIKE :search OR u.phone_number LIKE :search OR m.package_name LIKE :search)";
                $params['search'] = "%$search%";
            }

            $whereClause = implode(" AND ", $where);

            // Fetch memberships
            $query = "SELECT m.*, u.full_name as user_name, u.phone_number as user_phone, 
                      app.full_name as approver_name
                      FROM memberships m
                      JOIN users u ON m.user_id = u.id
                      LEFT JOIN users app ON m.approved_by = app.id
                      WHERE $whereClause
                      ORDER BY m.created_at DESC
                      LIMIT :limit OFFSET :offset";

            $stmt = $this->db->prepare($query);
            foreach ($params as $key => $val) {
                $stmt->bindValue($key, $val);
            }
            $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue('offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $memberships = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Total count
            $countQuery = "SELECT COUNT(*) FROM memberships m JOIN users u ON m.user_id = u.id WHERE $whereClause";
            $countStmt = $this->db->prepare($countQuery);
            foreach ($params as $key => $val) {
                $countStmt->bindValue($key, $val);
            }
            $countStmt->execute();
            $total = $countStmt->fetchColumn();

            // Stats
            $stats = [
                'total' => $this->db->query("SELECT COUNT(*) FROM memberships")->fetchColumn(),
                'active' => $this->db->query("SELECT COUNT(*) FROM memberships WHERE status = 'active'")->fetchColumn(),
                'pending' => $this->db->query("SELECT COUNT(*) FROM memberships WHERE status = 'pending'")->fetchColumn(),
                'total_revenue' => $this->db->query("SELECT SUM(amount) FROM memberships WHERE payment_status = 'paid'")->fetchColumn() ?: 0
            ];

            return ResponseHelper::paginated($memberships, (int)$total, $page, $limit, 'تم جلب الاشتراكات بنجاح');
        } catch (Exception $e) {
            return ResponseHelper::error('حدث خطأ أثناء جلب البيانات: ' . $e->getMessage());
        }
    }

    /**
     * Store a new membership
     */
    public function store(Request $request)
    {
        try {
            $data = $request->all();
            
            // Validate required fields
            $required = ['user_id', 'package_name', 'amount', 'start_date', 'payment_method'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    return ResponseHelper::error("الحقل $field مطلوب");
                }
            }

            $this->db->beginTransaction();

            $query = "INSERT INTO memberships (
                        user_id, package_name, package_type, amount, currency,
                        start_date, end_date, payment_method, payment_date, 
                        payment_status, status, notes, created_at
                      ) VALUES (
                        :user_id, :package_name, :package_type, :amount, :currency,
                        :start_date, :end_date, :payment_method, :payment_date,
                        :payment_status, :status, :notes, NOW()
                      )";

            $stmt = $this->db->prepare($query);
            $stmt->execute([
                'user_id' => $data['user_id'],
                'package_name' => $data['package_name'],
                'package_type' => $data['package_type'] ?? 'annual',
                'amount' => $data['amount'],
                'currency' => $data['currency'] ?? 'TRY',
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'] ?? null,
                'payment_method' => $data['payment_method'],
                'payment_date' => $data['payment_date'] ?? date('Y-m-d'),
                'payment_status' => $data['payment_status'] ?? 'pending',
                'status' => $data['status'] ?? 'pending',
                'notes' => $data['notes'] ?? null
            ]);

            $membershipId = $this->db->lastInsertId();

            // Create financial transaction
            $this->recordFinancialTransaction($membershipId, $data);

            $this->db->commit();

            // Send Notifications
            $userName = NotificationHelper::getUserName($this->db, (int)$data['user_id']);
            NotificationHelper::notifyRole($this->db, 'president', '📋 طلب اشتراك جديد', "العضو {$userName} قدّم طلب اشتراك", 'membership', "/memberships/{$membershipId}");
            NotificationHelper::notifyRole($this->db, 'finance_manager', '📋 طلب اشتراك جديد', "العضو {$userName} قدّم طلب اشتراك", 'membership', "/memberships/{$membershipId}");
            NotificationHelper::create($this->db, (int)$data['user_id'], '💳 تم استلام طلب الاشتراك', "تم استلام طلب اشتراكك في ({$data['package_name']}) بنجاح. سيتم مراجعة الطلب وتفعيله قريباً.", 'info', "/member/membership");

            return ResponseHelper::success('تم إنشاء الاشتراك بنجاح', ['id' => $membershipId]);
        } catch (Exception $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            return ResponseHelper::error('فشل إنشاء الاشتراك: ' . $e->getMessage());
        }
    }

    /**
     * Send notification for membership request
     */
    private function notifyMembershipRequest($userId, $packageName)
    {
        // Notify member
        NotificationHelper::create(
            $userId,
            '💳 تم استلام طلب الاشتراك',
            "تم استلام طلب اشتراكك في ($packageName) بنجاح. سيتم مراجعة الطلب وتفعيله قريباً.",
            'membership_request'
        );

        // Notify admins (President, Finance)
        NotificationHelper::createByRole(
            'finance_manager',
            '💰 طلب اشتراك جديد',
            "يوجد طلب اشتراك جديد بحاجة للمراجعة من قبل العضو المختار.",
            'admin_membership_alert'
        );
    }

    /**
     * Show membership details
     */
    public function show(Request $request, $params)
    {
        try {
            $id = $params['id'];
            $query = "SELECT m.*, u.full_name as user_name, u.phone_number as user_phone, 
                      app.full_name as approver_name
                      FROM memberships m
                      JOIN users u ON m.user_id = u.id
                      LEFT JOIN users app ON m.approved_by = app.id
                      WHERE m.id = :id";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute(['id' => $id]);
            $membership = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$membership) {
                return ResponseHelper::error('الاشتراك غير موجود', 404);
            }

            // Get financial transaction
            $ftStmt = $this->db->prepare("SELECT * FROM financial_transactions 
                                         WHERE reference_type = 'membership' AND reference_id = :id");
            $ftStmt->execute(['id' => $id]);
            $membership['transaction'] = $ftStmt->fetch(PDO::FETCH_ASSOC);

            return ResponseHelper::success('تم جلب تفاصيل الاشتراك', $membership);
        } catch (Exception $e) {
            return ResponseHelper::error('حدث خطأ: ' . $e->getMessage());
        }
    }

    /**
     * Update membership status/details
     */
    public function update(Request $request, $params)
    {
        try {
            $id = $params['id'];
            $data = $request->all();

            $this->db->beginTransaction();

            // Get current membership
            $stmt = $this->db->prepare("SELECT * FROM memberships WHERE id = :id");
            $stmt->execute(['id' => $id]);
            $current = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$current) {
                return ResponseHelper::error('الاشتراك غير موجود', 404);
            }

            $updateFields = [];
            $queryParams = ['id' => $id];

            $allowed = ['status', 'payment_status', 'notes', 'rejection_reason', 'end_date', 'payment_method'];
            foreach ($allowed as $field) {
                if (isset($data[$field])) {
                    $updateFields[] = "$field = :$field";
                    $queryParams[$field] = $data[$field];
                }
            }

            // Handle approval
            if (isset($data['status']) && $data['status'] === 'active' && $current['status'] !== 'active') {
                $updateFields[] = "approved_by = :approved_by";
                $updateFields[] = "approved_at = NOW()";
                $queryParams['approved_by'] = $request->user['id'] ?? null;
                
                // Set payment_status to paid if approved
                $updateFields[] = "payment_status = 'paid'";
                
                // Update expiry date on user table
                if (!empty($current['end_date'])) {
                    $userStmt = $this->db->prepare("UPDATE users SET membership_expiry_date = :expiry WHERE id = :user_id");
                    $userStmt->execute(['expiry' => $current['end_date'], 'user_id' => $current['user_id']]);
                }
            }

            if (!empty($updateFields)) {
                $sql = "UPDATE memberships SET " . implode(', ', $updateFields) . ", updated_at = NOW() WHERE id = :id";
                $stmt = $this->db->prepare($sql);
                $stmt->execute($queryParams);
            }

            // Sync with financial transaction
            $this->syncFinancialTransaction($id);

            // Notify user of status change
            if (isset($data['status'])) {
                if ($data['status'] === 'active') {
                    NotificationHelper::create($this->db, (int)$current['user_id'], '✅ تم الموافقة على اشتراكك', 'تمت الموافقة على طلب اشتراكك بنجاح', 'success', "/member/membership");
                } elseif ($data['status'] === 'rejected') {
                    $rejectionReason = $data['rejection_reason'] ?? 'تم الرفض لعدم اكتمال البيانات أو صحة مستند الدفع';
                    NotificationHelper::create($this->db, (int)$current['user_id'], '❌ تم رفض طلب اشتراكك', $rejectionReason, 'error', "/member/membership");
                }
            }

            $this->db->commit();
            return ResponseHelper::success('تم تحديث الاشتراك بنجاح');
        } catch (Exception $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            return ResponseHelper::error('فشل التحديث: ' . $e->getMessage());
        }
    }

    /**
     * Get current user's membership
     */
    public function myMembership(Request $request)
    {
        try {
            $userId = $request->user['id'];
            $stmt = $this->db->prepare("SELECT * FROM memberships WHERE user_id = :uid ORDER BY created_at DESC LIMIT 1");
            $stmt->execute(['uid' => $userId]);
            $membership = $stmt->fetch(PDO::FETCH_ASSOC);

            return ResponseHelper::success('تم جلب بيانات الاشتراك', $membership);
        } catch (Exception $e) {
            return ResponseHelper::error('Error: ' . $e->getMessage());
        }
    }

    /**
     * Get membership card data
     */
    public function card(Request $request)
    {
        try {
            $userId = $request->user['id'];

            // User details
            $userStmt = $this->db->prepare("SELECT id, full_name, phone_number, email, university, faculty, 
                                                   profile_photo, status, created_at
                                            FROM users WHERE id = :id AND deleted_at IS NULL");
            $userStmt->execute(['id' => $userId]);
            $user = $userStmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                return ResponseHelper::error('المستخدم غير موجود', 404);
            }

            // Membership details
            $memStmt = $this->db->prepare("SELECT m.*,
                DATEDIFF(m.end_date, CURDATE()) as days_remaining,
                DATEDIFF(m.end_date, m.start_date) as total_days
            FROM memberships m
            WHERE m.user_id = :userId AND m.status = 'active'
            ORDER BY m.created_at DESC LIMIT 1");
            $memStmt->execute(['userId' => $userId]);
            $membership = $memStmt->fetch(PDO::FETCH_ASSOC);

            // Membership number formatting
            $year = date('Y', strtotime($user['created_at']));
            $membershipNumber = 'MEM-' . $year . '-' . str_pad($user['id'], 3, '0', STR_PAD_LEFT);

            $data = [
                'user' => $user,
                'membership' => $membership,
                'membership_number' => $membershipNumber,
                'branch' => 'فرع أرضروم — تركيا',
                'union_name' => 'اتحاد الطلاب اليمنيين',
                'verification_url' => "https://yemenstudents.org/verify/{$user['id']}/$membershipNumber",
                'is_active' => ($membership && $membership['status'] === 'active' && $membership['days_remaining'] > 0)
            ];

            return ResponseHelper::success('تم جلب بيانات البطاقة بنجاح', $data);
        } catch (Exception $e) {
            return ResponseHelper::error('حدث خطأ: ' . $e->getMessage());
        }
    }

    /**
     * Get available membership packages
     */
    public function packages()
    {
        try {
            $stmt = $this->db->query("SELECT * FROM membership_packages WHERE is_active = 1");
            $packages = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Add hardcoded features for each package type
            foreach ($packages as &$pkg) {
                $pkg['features'] = [
                    'دخول الفعاليات',
                    'بطاقة العضوية الذكية',
                    'خصومات الشركاء',
                    'دعم أكاديمي'
                ];
                if (strpos(strtolower($pkg['name']), 'gold') !== false || strpos(strtolower($pkg['name']), 'ذهبي') !== false) {
                    $pkg['features'][] = 'إقامة مجانية في المخيمات';
                    $pkg['features'][] = 'أولوية التسجيل';
                }
            }

            return ResponseHelper::success('تم جلب الباقات', $packages);
        } catch (Exception $e) {
            return ResponseHelper::error('Error: ' . $e->getMessage());
        }
    }

    /**
     * Renew membership
     */
    public function renew(Request $request)
    {
        // For simplicity, renewal creates a new membership record or updates current
        return $this->store($request);
    }

    /**
     * Helper to record financial transaction
     */
    private function recordFinancialTransaction($membershipId, $data)
    {
        $stmt = $this->db->prepare("INSERT INTO financial_transactions (
            type, category, amount, currency, description, 
            reference_type, reference_id, payment_method, 
            transaction_date, created_by, status, created_at
        ) VALUES (
            'income', 'membership', :amount, :currency, :desc,
            'membership', :ref_id, :method,
            :t_date, :created_by, :status, NOW()
        )");

        $status = (isset($data['payment_status']) && $data['payment_status'] === 'paid') ? 'approved' : 'pending';

        $stmt->execute([
            'amount' => $data['amount'],
            'currency' => $data['currency'] ?? 'TRY',
            'desc' => "اشتراك عضوية - " . ($data['package_name'] ?? 'باقة'),
            'ref_id' => $membershipId,
            'method' => $data['payment_method'] ?? 'cash',
            't_date' => $data['payment_date'] ?? date('Y-m-d'),
            'created_by' => $data['created_by'] ?? null,
            'status' => $status
        ]);
    }

    /**
     * Helper to sync financial transaction on update
     */
    private function syncFinancialTransaction($membershipId)
    {
        // Get membership details
        $mStmt = $this->db->prepare("SELECT * FROM memberships WHERE id = :id");
        $mStmt->execute(['id' => $membershipId]);
        $membership = $mStmt->fetch(PDO::FETCH_ASSOC);

        if (!$membership) return;

        // Check if transaction exists
        $ftStmt = $this->db->prepare("SELECT id FROM financial_transactions 
                                     WHERE reference_type = 'membership' AND reference_id = :id");
        $ftStmt->execute(['id' => $membershipId]);
        $ftId = $ftStmt->fetchColumn();

        if ($ftId) {
            // Update
            $status = ($membership['payment_status'] === 'paid') ? 'approved' : 'pending';
            $updateStmt = $this->db->prepare("UPDATE financial_transactions SET 
                status = :status, 
                amount = :amount,
                payment_method = :method,
                updated_at = NOW() 
                WHERE id = :id");
            $updateStmt->execute([
                'status' => $status,
                'amount' => $membership['amount'],
                'method' => $membership['payment_method'],
                'id' => $ftId
            ]);
        } else {
            // Create if missing
            $this->recordFinancialTransaction($membershipId, $membership);
        }
    }
}
