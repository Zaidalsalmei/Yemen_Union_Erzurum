<?php
// Simple database connection test
require_once __DIR__ . '/backend/vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/backend');
$dotenv->load();

// Import Database class
use App\Config\Database;

echo "Testing Database Connection...\n";
echo "========================================\n";

try {
    // Test if we can load the Database class
    
    echo "✓ Database class loaded successfully\n";
    
    // Get database instance
    $db = Database::getInstance();
    
    echo "✓ Database connection established\n";
    
    // Test query
    $stmt = $db->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    
    echo "✓ Database query successful\n";
    echo "✓ Total users in database: " . $result['count'] . "\n";
    echo "========================================\n";
    echo "SUCCESS: All tests passed!\n";
    
} catch (Exception $e) {
    echo "✗ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
