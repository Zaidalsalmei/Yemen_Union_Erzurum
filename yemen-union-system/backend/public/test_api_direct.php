<?php
/**
 * Direct Test for Email Replies List API
 */

require_once __DIR__ . '/../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Set headers
header('Content-Type: application/json; charset=utf-8');

try {
    // Initialize database
    $db = App\Config\Database::getInstance();
    
    echo json_encode([
        'success' => true,
        'message' => 'Database connected',
        'test' => 'Starting test...'
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
    echo "\n\n";
    
    // Test the query directly
    $page = 1;
    $perPage = 20;
    $offset = ($page - 1) * $perPage;
    $search = '';
    
    $whereClause = '';
    $params = [];
    
    if (!empty($search)) {
        $whereClause = "WHERE (er.subject LIKE ? OR er.message LIKE ? OR er.sender_email LIKE ? OR u.full_name LIKE ?)";
        $searchParam = "%{$search}%";
        $params = [$searchParam, $searchParam, $searchParam, $searchParam];
    }
    
    // Get total count
    $countStmt = $db->prepare("
        SELECT COUNT(*) as total 
        FROM email_replies er
        LEFT JOIN users u ON er.user_id = u.id
        {$whereClause}
    ");
    $countStmt->execute($params);
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    echo json_encode([
        'total_count' => $total
    ], JSON_PRETTY_PRINT);
    
    echo "\n\n";
    
    // Get replies with user info
    $stmt = $db->prepare("
        SELECT 
            er.id,
            er.user_id,
            er.sender_email,
            er.subject,
            er.message,
            er.created_at,
            u.full_name,
            u.phone_number,
            u.email as user_email
        FROM email_replies er
        LEFT JOIN users u ON er.user_id = u.id
        {$whereClause}
        ORDER BY er.created_at DESC
        LIMIT ? OFFSET ?
    ");
    
    $params[] = $perPage;
    $params[] = $offset;
    $stmt->execute($params);
    $replies = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $replies,
        'count' => count($replies)
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
