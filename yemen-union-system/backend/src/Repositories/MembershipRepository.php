<?php
/**
 * Membership Repository - Data access layer for memberships
 */

declare(strict_types=1);

namespace App\Repositories;

use PDO;
use App\Core\Database;

class MembershipRepository
{
    private PDO $db;
    
    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }
    
    /**
     * Find membership by ID
     */
    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("
            SELECT m.*, u.full_name as user_name, u.phone_number as user_phone,
                   a.full_name as approved_by_name
            FROM memberships m
            LEFT JOIN users u ON m.user_id = u.id
            LEFT JOIN users a ON m.approved_by = a.id
            WHERE m.id = :id
        ");
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch();
        
        return $result ?: null;
    }
    
    /**
     * Find all memberships for a user
     */
    public function findByUser(int $userId): array
    {
        $stmt = $this->db->prepare("
            SELECT * FROM memberships 
            WHERE user_id = :user_id 
            ORDER BY created_at DESC
        ");
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchAll();
    }

    /**
     * Find active membership for user
     */
    public function findActiveByUser(int $userId): ?array
    {
        $stmt = $this->db->prepare("
            SELECT * FROM memberships 
            WHERE user_id = :user_id 
                AND status = 'active' 
                AND end_date >= CURDATE()
            ORDER BY end_date DESC
            LIMIT 1
        ");
        $stmt->execute(['user_id' => $userId]);
        $result = $stmt->fetch();
        
        return $result ?: null;
    }
    
    /**
     * Get all memberships with pagination and filters
     */
    public function getAll(array $filters = [], int $page = 1, int $perPage = 20): array
    {
        $offset = ($page - 1) * $perPage;
        $where = ['1=1'];
        $params = [];
        
        if (!empty($filters['status'])) {
            $where[] = 'm.status = :status';
            $params['status'] = $filters['status'];
        }
        
        if (!empty($filters['search'])) {
            $where[] = '(u.full_name LIKE :search OR u.phone_number LIKE :search)';
            $params['search'] = '%' . $filters['search'] . '%';
        }
        
        $whereClause = implode(' AND ', $where);
        
        // Get paginated results
        $query = "
            SELECT m.*, u.full_name as user_name, u.phone_number as user_phone
            FROM memberships m
            LEFT JOIN users u ON m.user_id = u.id
            WHERE {$whereClause}
            ORDER BY m.created_at DESC
            LIMIT :limit OFFSET :offset
        ";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue(":{$key}", $value);
        }
        
        $stmt->execute();
        $data = $stmt->fetchAll();
        
        // Get total count
        $countQuery = "
            SELECT COUNT(*) as total 
            FROM memberships m
            LEFT JOIN users u ON m.user_id = u.id
            WHERE {$whereClause}
        ";
        $countStmt = $this->db->prepare($countQuery);
        $countStmt->execute($params);
        $total = (int) $countStmt->fetch()['total'];
        
        return [
            'data' => $data,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => ceil($total / $perPage)
        ];
    }
    
    /**
     * Get Membership Statistics
     */
    public function getStats(): array
    {
        $stats = [
            'total' => 0,
            'active' => 0,
            'pending' => 0,
            'expired' => 0,
            'total_revenue' => 0
        ];
        
        // Counts by status
        $stmt = $this->db->prepare("SELECT status, COUNT(*) as count FROM memberships GROUP BY status");
        $stmt->execute();
        $statusCounts = $stmt->fetchAll();
        
        foreach ($statusCounts as $row) {
            $stats['total'] += $row['count'];
            if (isset($stats[$row['status']])) {
                $stats[$row['status']] = (int)$row['count'];
            }
        }
        
        // Total revenue from active/expired (already paid)
        $revenueStmt = $this->db->prepare("
            SELECT SUM(amount) as total_revenue 
            FROM memberships 
            WHERE status IN ('active', 'expired') AND currency = 'TRY'
        ");
        $revenueStmt->execute();
        $stats['total_revenue'] = (float)($revenueStmt->fetch()['total_revenue'] ?? 0);
        
        return $stats;
    }

    /**
     * Create new membership
     */
    public function create(array $data): int
    {
        $stmt = $this->db->prepare("
            INSERT INTO memberships (
                user_id, package_type, amount, currency, status, 
                payment_method, payment_proof, payment_date, 
                start_date, end_date, notes
            )
            VALUES (
                :user_id, :package_type, :amount, :currency, :status, 
                :payment_method, :payment_proof, :payment_date, 
                :start_date, :end_date, :notes
            )
        ");
        
        $stmt->execute([
            'user_id' => $data['user_id'],
            'package_type' => $data['package_type'] ?? 'annual',
            'amount' => $data['amount'] ?? 0,
            'currency' => $data['currency'] ?? 'TRY',
            'status' => $data['status'] ?? 'pending',
            'payment_method' => $data['payment_method'] ?? null,
            'payment_proof' => $data['payment_proof'] ?? null,
            'payment_date' => $data['payment_date'] ?? null,
            'start_date' => $data['start_date'] ?? null,
            'end_date' => $data['end_date'] ?? null,
            'notes' => $data['notes'] ?? null
        ]);
        
        return (int) $this->db->lastInsertId();
    }
    
    /**
     * Update membership
     */
    public function update(int $id, array $data): void
    {
        $sets = [];
        $params = ['id' => $id];
        
        foreach ($data as $key => $value) {
            $sets[] = "{$key} = :{$key}";
            $params[$key] = $value;
        }
        
        if (empty($sets)) return;
        
        $setClause = implode(', ', $sets);
        
        $stmt = $this->db->prepare("UPDATE memberships SET {$setClause} WHERE id = :id");
        $stmt->execute($params);
    }
    
    public function getPackages(bool $activeOnly = true): array
    {
        $where = $activeOnly ? 'WHERE is_active = 1' : '';
        
        $stmt = $this->db->prepare("
            SELECT 
                id, 
                type, 
                name as name_ar, 
                description as description_ar, 
                price, 
                currency, 
                ROUND(duration_days / 30) as duration_months,
                duration_days,
                is_active, 
                created_at, 
                updated_at 
            FROM membership_packages 
            {$where}
        ");
        $stmt->execute();
        
        return $stmt->fetchAll();
    }
    
    public function getPackageByType(string $type): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM membership_packages WHERE type = :type");
        $stmt->execute(['type' => $type]);
        $result = $stmt->fetch();
        
        return $result ?: null;
    }
    
}
