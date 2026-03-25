<?php
/**
 * Activity Repository - Data access layer for activities
 */

declare(strict_types=1);

namespace App\Repositories;

use PDO;

class ActivityRepository
{
    private PDO $db;
    
    public function __construct()
    {
        $this->db = \App\Core\Database::getInstance()->getConnection();
    }
    
    /**
     * Find activity by ID
     */
    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("
            SELECT a.*, a.title as title_ar, a.description as description_ar, a.start_date as activity_date, a.location as location_ar, u.full_name as creator_name,
                (SELECT COUNT(*) FROM activity_participants WHERE activity_id = a.id) as participant_count
            FROM activities a
            LEFT JOIN users u ON a.created_by = u.id
            WHERE a.id = :id AND a.deleted_at IS NULL
        ");
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch();
        
        return $result ?: null;
    }
    
    /**
     * Get all activities with pagination
     */
    public function getAll(array $filters = [], int $page = 1, int $perPage = 20): array
    {
        $offset = ($page - 1) * $perPage;
        $where = ['a.deleted_at IS NULL'];
        $params = [];
        
        if (!empty($filters['status'])) {
            $where[] = 'a.status = :status';
            $params['status'] = $filters['status'];
        }
        
        if (!empty($filters['visibility'])) {
            $where[] = 'a.visibility = :visibility';
            $params['visibility'] = $filters['visibility'];
        }
        
        if (!empty($filters['from_date'])) {
            $where[] = 'a.start_date >= :from_date';
            $params['from_date'] = $filters['from_date'];
        }
        
        if (!empty($filters['to_date'])) {
            $where[] = 'a.start_date <= :to_date';
            $params['to_date'] = $filters['to_date'];
        }
        
        $whereClause = implode(' AND ', $where);
        
        // Get total count
        $countStmt = $this->db->prepare("SELECT COUNT(*) as total FROM activities a WHERE {$whereClause}");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetch()['total'];
        
        // Get paginated results
        $stmt = $this->db->prepare("
            SELECT a.*, a.title as title_ar, a.description as description_ar, a.start_date as activity_date, a.location as location_ar, u.full_name as creator_name,
                (SELECT COUNT(*) FROM activity_participants WHERE activity_id = a.id) as participant_count
            FROM activities a
            LEFT JOIN users u ON a.created_by = u.id
            WHERE {$whereClause}
            ORDER BY a.start_date DESC
            LIMIT :limit OFFSET :offset
        ");
        
        $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue(":{$key}", $value);
        }
        
        $stmt->execute();
        $data = $stmt->fetchAll();
        
        return [
            'data' => $data,
            'total' => $total
        ];
    }
    
    /**
     * Create new activity
     */
    public function create(array $data): int
    {
        $stmt = $this->db->prepare("
            INSERT INTO activities (title, description, type, start_date, end_date,
                location, max_participants, registration_deadline,
                status, created_by, created_at)
            VALUES (:title, :description, :type, :start_date, :end_date,
                :location, :max_participants, :registration_deadline,
                :status, :created_by, NOW())
        ");
        
        $stmt->execute([
            'title' => $data['title_ar'],
            'description' => $data['description_ar'] ?? null,
            'type' => $data['type'] ?? 'other',
            'start_date' => $data['activity_date'],
            'end_date' => $data['end_date'] ?? null,
            'location' => $data['location_ar'] ?? null,
            'max_participants' => $data['max_participants'] ?? null,
            'registration_deadline' => $data['registration_deadline'] ?? null,
            'status' => $data['status'] ?? 'draft',
            'created_by' => $data['created_by']
        ]);
        
        return (int) $this->db->lastInsertId();
    }
    
    /**
     * Update activity
     */
    public function update(int $id, array $data): void
    {
        $dbData = [];
        if (isset($data['title_ar'])) $dbData['title'] = $data['title_ar'];
        if (isset($data['description_ar'])) $dbData['description'] = $data['description_ar'];
        if (isset($data['activity_date'])) $dbData['start_date'] = $data['activity_date'];
        if (isset($data['location_ar'])) $dbData['location'] = $data['location_ar'];
        if (array_key_exists('end_date', $data)) $dbData['end_date'] = $data['end_date'];
        if (array_key_exists('max_participants', $data)) $dbData['max_participants'] = $data['max_participants'];
        if (array_key_exists('registration_deadline', $data)) $dbData['registration_deadline'] = $data['registration_deadline'];
        if (isset($data['status'])) $dbData['status'] = $data['status'];
        if (isset($data['type'])) $dbData['type'] = $data['type'];
        
        if (empty($dbData)) return;

        $sets = [];
        $params = ['id' => $id];
        
        foreach ($dbData as $key => $value) {
            $sets[] = "{$key} = :{$key}";
            $params[$key] = $value;
        }
        
        $setClause = implode(', ', $sets);
        
        $stmt = $this->db->prepare("UPDATE activities SET {$setClause}, updated_at = NOW() WHERE id = :id");
        $stmt->execute($params);
    }
    
    /**
     * Delete activity (soft delete)
     */
    public function delete(int $id): void
    {
        $stmt = $this->db->prepare("UPDATE activities SET deleted_at = NOW() WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }
    
    /**
     * Get activity participants
     */
    public function getParticipants(int $activityId): array
    {
        $stmt = $this->db->prepare("
            SELECT ap.*, u.full_name, u.phone_number, u.email
            FROM activity_participants ap
            INNER JOIN users u ON ap.user_id = u.id
            WHERE ap.activity_id = :activity_id
            ORDER BY ap.registration_date ASC
        ");
        $stmt->execute(['activity_id' => $activityId]);
        
        return $stmt->fetchAll();
    }
    
    /**
     * Register participant for activity
     */
    public function registerParticipant(int $activityId, int $userId): int
    {
        $stmt = $this->db->prepare("
            INSERT INTO activity_participants (activity_id, user_id, registration_date, status)
            VALUES (:activity_id, :user_id, NOW(), 'registered')
        ");
        
        $stmt->execute([
            'activity_id' => $activityId,
            'user_id' => $userId
        ]);
        
        return (int) $this->db->lastInsertId();
    }
    
    /**
     * Check if user is registered for activity
     */
    public function isParticipant(int $activityId, int $userId): bool
    {
        $stmt = $this->db->prepare("
            SELECT id FROM activity_participants 
            WHERE activity_id = :activity_id AND user_id = :user_id
        ");
        $stmt->execute([
            'activity_id' => $activityId,
            'user_id' => $userId
        ]);
        
        return (bool) $stmt->fetch();
    }
    
    /**
     * Check in participant
     */
    public function checkIn(int $activityId, int $userId, int $checkedInBy): void
    {
        $stmt = $this->db->prepare("
            UPDATE activity_participants 
            SET status = 'attended', attended_at = NOW(), checked_in_by = :checked_in_by
            WHERE activity_id = :activity_id AND user_id = :user_id
        ");
        
        $stmt->execute([
            'activity_id' => $activityId,
            'user_id' => $userId,
            'checked_in_by' => $checkedInBy
        ]);
    }
}
