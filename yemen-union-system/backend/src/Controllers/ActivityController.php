<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Helpers\ResponseHelper;
use App\Helpers\NotificationHelper;

use PDO;
use Exception;

class ActivityController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = \App\Core\Database::getInstance()->getConnection();
    }

    /**
     * Get all activities with filtering
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
                $where[] = "(title LIKE :search OR location LIKE :search)";
                $params['search'] = "%$search%";
            }

            $whereClause = implode(" AND ", $where);
            $stmt = $this->db->prepare("SELECT * FROM activities WHERE $whereClause ORDER BY start_date DESC");
            $stmt->execute($params);
            $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Fetch registration counts
            foreach ($activities as &$activity) {
                $activity['social_links'] = $activity['social_links'] ? json_decode($activity['social_links'], true) : new \stdClass();
                $activity['gallery'] = $activity['gallery'] ? json_decode($activity['gallery'], true) : [];
                $activity['registered_count'] = $this->getRegisteredCount($activity['id']);
            }

            return ResponseHelper::success('تم جلب الأنشطة بنجاح', $activities);
        } catch (Exception $e) {
            return ResponseHelper::error('خطأ: ' . $e->getMessage());
        }
    }

    /**
     * Store new activity
     */
    public function store(Request $request): array
    {
        try {
            $data = $request->all();
            if (empty($data['title'])) return ResponseHelper::error('عنوان النشاط مطلوب');

            $stmt = $this->db->prepare("INSERT INTO activities (
                title, description, summary, type, location, image, 
                start_date, end_date, max_participants, registration_deadline,
                status, created_by, created_at, social_links, gallery
            ) VALUES (
                :title, :description, :summary, :type, :location, :image,
                :start_date, :end_date, :max_participants, :registration_deadline,
                :status, :created_by, NOW(), :social, :gallery
            )");

            $stmt->execute([
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'summary' => $data['summary'] ?? null,
                'type' => $data['type'] ?? 'social',
                'location' => $data['location'] ?? null,
                'image' => $data['image'] ?? null,
                'start_date' => $data['start_date'] ?? date('Y-m-d H:i:s'),
                'end_date' => $data['end_date'] ?? null,
                'max_participants' => $data['max_participants'] ?? null,
                'registration_deadline' => $data['registration_deadline'] ?? null,
                'status' => $data['status'] ?? 'draft',
                'created_by' => $request->user['id'] ?? null,
                'social' => json_encode($data['social_links'] ?? new \stdClass(), JSON_UNESCAPED_UNICODE),
                'gallery' => json_encode($data['gallery'] ?? [], JSON_UNESCAPED_UNICODE)
            ]);

            $newId = $this->db->lastInsertId();
            
            // إرسال إشعار للرئيس
            $createdBy = (int)($request->user['id'] ?? $request->user['sub']);
            $userName = NotificationHelper::getUserName($this->db, $createdBy);
            NotificationHelper::notifyRole($this->db, 'president', '🎯 نشاط جديد', "تم إنشاء نشاط: {$data['title']} بواسطة {$userName}", 'activity', "/activities/{$newId}");

            return ResponseHelper::success('تمت إضافة النشاط بنجاح', ['id' => $newId]);
        } catch (Exception $e) {
            return ResponseHelper::error('خطأ في الإضافة: ' . $e->getMessage());
        }
    }

    /**
     * Update an activity
     */
    public function update(Request $request, array $params): array
    {
        try {
            $id = $params['id'];
            $data = $request->all();

            $updateFields = [];
            $queryParams = ['id' => $id];

            $allowed = ['title', 'description', 'summary', 'type', 'location', 'image', 'start_date', 'end_date', 'max_participants', 'registration_deadline', 'status'];
            foreach ($allowed as $field) {
                if (isset($data[$field])) {
                    $updateFields[] = "$field = :$field";
                    $queryParams[$field] = $data[$field];
                }
            }

            if (isset($data['social_links'])) {
                $updateFields[] = "social_links = :social";
                $queryParams['social'] = json_encode($data['social_links'], JSON_UNESCAPED_UNICODE);
            }
            if (isset($data['gallery'])) {
                $updateFields[] = "gallery = :gallery";
                $queryParams['gallery'] = json_encode($data['gallery'], JSON_UNESCAPED_UNICODE);
            }

            if (empty($updateFields)) return ResponseHelper::error('لا توجد بيانات للتحديث');

            $sql = "UPDATE activities SET " . implode(', ', $updateFields) . ", updated_at = NOW() WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($queryParams);

            return ResponseHelper::success('تم تحديث النشاط بنجاح');
        } catch (Exception $e) {
            return ResponseHelper::error('خطأ في التحديث: ' . $e->getMessage());
        }
    }

    /**
     * Soft Delete
     */
    public function destroy(Request $request, array $params): array
    {
        try {
            $id = $params['id'];
            $stmt = $this->db->prepare("UPDATE activities SET deleted_at = NOW() WHERE id = :id");
            $stmt->execute(['id' => $id]);
            return ResponseHelper::success('تم حذف النشاط بنجاح');
        } catch (Exception $e) {
            return ResponseHelper::error('Error: ' . $e->getMessage());
        }
    }

    /**
     * Get participants (Correct Table: activity_participants)
     */
    public function participants(Request $request, array $params): array
    {
        try {
            $id = $params['id'];
            $stmt = $this->db->prepare("
                SELECT ap.*, u.full_name, u.phone_number
                FROM activity_participants ap
                JOIN users u ON ap.user_id = u.id
                WHERE ap.activity_id = :id
                ORDER BY ap.registration_date DESC
            ");
            $stmt->execute(['id' => $id]);
            $participants = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return ResponseHelper::success('تم جلب المشاركين', $participants);
        } catch (Exception $e) {
            return ResponseHelper::error('Error: ' . $e->getMessage());
        }
    }

    /**
     * Register to activity
     */
    public function register(Request $request, array $params): array
    {
        try {
            $id = $params['id'];
            $userId = $request->user['id'];

            // Check if already registered
            $check = $this->db->prepare("SELECT id FROM activity_participants WHERE activity_id = :aid AND user_id = :uid");
            $check->execute(['aid' => $id, 'uid' => $userId]);
            if ($check->fetch()) return ResponseHelper::error('لقد قمت بالتسجيل مسبقاً في هذا النشاط');

            $stmt = $this->db->prepare("INSERT INTO activity_participants (activity_id, user_id, registration_date, attendance_status) VALUES (:aid, :uid, NOW(), 'registered')");
            $stmt->execute(['aid' => $id, 'uid' => $userId]);

            return ResponseHelper::success('تم تسجيلك في النشاط بنجاح');
        } catch (Exception $e) {
            return ResponseHelper::error('Error: ' . $e->getMessage());
        }
    }

    /**
     * Show activity
     */
    public function show(Request $request, array $params): array
    {
        try {
            $id = $params['id'];
            $stmt = $this->db->prepare("SELECT * FROM activities WHERE id = :id AND deleted_at IS NULL");
            $stmt->execute(['id' => $id]);
            $activity = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$activity) return ResponseHelper::error('النشاط غير موجود', 404);

            $activity['social_links'] = $activity['social_links'] ? json_decode($activity['social_links'], true) : new \stdClass();
            $activity['gallery'] = $activity['gallery'] ? json_decode($activity['gallery'], true) : [];
            $activity['registered_count'] = $this->getRegisteredCount($id);

            return ResponseHelper::success('تم جلب تفاصيل النشاط', $activity);
        } catch (Exception $e) {
            return ResponseHelper::error('Error: ' . $e->getMessage());
        }
    }

    private function getRegisteredCount($activityId)
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM activity_participants WHERE activity_id = :id AND attendance_status != 'cancelled'");
        $stmt->execute(['id' => $activityId]);
        return (int)$stmt->fetchColumn();
    }
}
