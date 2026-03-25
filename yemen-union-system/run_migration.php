<?php
/**
 * Migration Runner - Creates system_logs table
 * Run this file once to apply the migration
 */

error_reporting(E_ALL);
ini_set('display_errors', '1');

echo "=== System Logs Table Migration ===\n";

// Database configuration
$host = 'localhost';
$dbname = 'yemen_union_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
    
    echo "✓ Connected to database successfully\n";
    
    // Check if table already exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'system_logs'");
    if ($stmt->rowCount() > 0) {
        echo "⚠ Table 'system_logs' already exists\n";
    }
    
    // Create the table
    $sql = "
    CREATE TABLE IF NOT EXISTS system_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page_name VARCHAR(255) NOT NULL COMMENT 'The page or endpoint where the event occurred',
        action VARCHAR(100) NOT NULL COMMENT 'The action being performed',
        error_type ENUM('info', 'warning', 'error', 'critical') DEFAULT 'info' COMMENT 'Severity level',
        message TEXT NOT NULL COMMENT 'Detailed description of the event or error',
        user_id INT NULL COMMENT 'ID of the user who triggered the event',
        ip_address VARCHAR(45) NULL COMMENT 'IP address of the client',
        user_agent TEXT NULL COMMENT 'Browser/client information',
        request_data JSON NULL COMMENT 'Request payload if relevant',
        stack_trace TEXT NULL COMMENT 'Stack trace for errors',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_page (page_name),
        INDEX idx_action (action),
        INDEX idx_error_type (error_type),
        INDEX idx_user (user_id),
        INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='Centralized system logging table for auditing'
    ";
    
    $pdo->exec($sql);
    echo "✓ Table 'system_logs' created successfully\n";
    
    // Verify table structure
    $stmt = $pdo->query("DESCRIBE system_logs");
    $columns = $stmt->fetchAll();
    echo "\nTable Structure:\n";
    foreach ($columns as $col) {
        echo "  - {$col['Field']} ({$col['Type']})\n";
    }
    
    // Test insert
    $testSql = "INSERT INTO system_logs (page_name, action, message, error_type) 
                VALUES ('migration', 'table_creation', 'System logs table created successfully', 'info')";
    $pdo->exec($testSql);
    echo "\n✓ Test log entry created\n";
    
    echo "\n=== Migration Complete ===\n";
    
} catch (PDOException $e) {
    echo "✗ Database Error: " . $e->getMessage() . "\n";
    exit(1);
}
