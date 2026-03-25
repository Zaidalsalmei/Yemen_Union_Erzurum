<?php
/**
 * Test Email Replies API Endpoint
 */

require_once __DIR__ . '/../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Set headers
header('Content-Type: text/plain; charset=utf-8');

try {
    // Test database connection
    $db = new PDO(
        'mysql:host=' . $_ENV['DB_HOST'] . ';dbname=' . $_ENV['DB_DATABASE'],
        $_ENV['DB_USERNAME'],
        $_ENV['DB_PASSWORD']
    );
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Database connected successfully\n\n";
    
    // Check if email_replies table exists
    $result = $db->query("SHOW TABLES LIKE 'email_replies'");
    if ($result->rowCount() > 0) {
        echo "✅ email_replies table exists\n\n";
        
        // Get table structure
        $structure = $db->query("DESCRIBE email_replies");
        echo "📋 Table structure:\n";
        foreach ($structure->fetchAll(PDO::FETCH_ASSOC) as $column) {
            echo "  - {$column['Field']} ({$column['Type']})\n";
        }
        echo "\n";
        
        // Count records
        $count = $db->query("SELECT COUNT(*) as total FROM email_replies")->fetch(PDO::FETCH_ASSOC);
        echo "📊 Total records: {$count['total']}\n\n";
        
        // Test the listReplies query
        echo "🧪 Testing listReplies query...\n";
        $stmt = $db->prepare("
            SELECT 
                er.*,
                u.id as uid,
                u.full_name,
                u.phone_number,
                u.email
            FROM email_replies er
            LEFT JOIN users u ON er.user_id = u.id
            ORDER BY er.created_at DESC
            LIMIT 10
        ");
        $stmt->execute();
        $replies = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "✅ Query executed successfully\n";
        echo "📦 Found " . count($replies) . " replies\n\n";
        
        if (count($replies) > 0) {
            echo "📧 Sample reply:\n";
            print_r($replies[0]);
        }
        
    } else {
        echo "❌ email_replies table does NOT exist\n";
        echo "📝 Creating table...\n\n";
        
        $createTable = "
        CREATE TABLE IF NOT EXISTS email_replies (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id BIGINT UNSIGNED NOT NULL,
          sender_email VARCHAR(255) NOT NULL,
          subject VARCHAR(255),
          message TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id),
          INDEX idx_sender_email (sender_email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
        
        $db->exec($createTable);
        echo "✅ Table created successfully!\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "📍 File: " . $e->getFile() . "\n";
    echo "📍 Line: " . $e->getLine() . "\n";
    echo "\n📚 Stack trace:\n" . $e->getTraceAsString();
}
