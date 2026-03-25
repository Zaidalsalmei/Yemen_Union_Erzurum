<?php
/**
 * Admin Password Reset Script
 * This script resets the admin user credentials for system access
 */

// Ensure we're running from command line
if (php_sapi_name() !== 'cli') {
    die("This script must be run from the command line.\n");
}

echo "\n";
echo "╔════════════════════════════════════════════════════════╗\n";
echo "║   Yemen Student Union System - Admin Password Reset   ║\n";
echo "╚════════════════════════════════════════════════════════╝\n";
echo "\n";

// Load Composer's autoloader
$autoloadPath = __DIR__ . '/backend/vendor/autoload.php';
if (!file_exists($autoloadPath)) {
    die("ERROR: Composer autoloader not found.\nPlease run 'composer install' in the backend directory.\n");
}
require_once $autoloadPath;

// Load environment variables
try {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/backend');
    $dotenv->load();
    echo "✓ Environment variables loaded\n";
} catch (Exception $e) {
    die("ERROR: Failed to load .env file: " . $e->getMessage() . "\n");
}

// Import Database class
use App\Config\Database;

try {
    echo "✓ Connecting to database...\n";
    $db = Database::getInstance();
    echo "✓ Database connection established\n\n";
    
    // Admin credentials
    $phone = '05001234567';
    $password = 'Admin@123';
    $fullName = 'مدير النظام';
    
    // Hash the password
    $hash = password_hash($password, PASSWORD_BCRYPT);
    
    // Check if user exists
    echo "→ Checking if admin user exists...\n";
    $stmt = $db->prepare("SELECT id, full_name FROM users WHERE phone_number = ?");
    $stmt->execute([$phone]);
    $user = $stmt->fetch();
    
    if ($user) {
        // Update existing user
        echo "→ Updating existing admin user (ID: {$user['id']})...\n";
        $sql = "UPDATE users SET 
                password = ?, 
                status = 'active', 
                phone_verified_at = NOW(),
                updated_at = NOW()
                WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute([$hash, $user['id']]);
        echo "✓ Admin user updated successfully\n";
        $userId = $user['id'];
    } else {
        // Create new user
        echo "→ Creating new admin user...\n";
        $sql = "INSERT INTO users (full_name, phone_number, password, status, phone_verified_at, created_at, updated_at) 
                VALUES (?, ?, ?, 'active', NOW(), NOW(), NOW())";
        $stmt = $db->prepare($sql);
        $stmt->execute([$fullName, $phone, $hash]);
        $userId = $db->lastInsertId();
        echo "✓ Admin user created successfully (ID: $userId)\n";
    }
    
    // Ensure role assignment (President)
    echo "→ Assigning president role...\n";
    $stmt = $db->query("SELECT id FROM roles WHERE name = 'president'");
    $roleId = $stmt->fetchColumn();
    
    if ($roleId) {
        // Check if role is already assigned
        $checkStmt = $db->prepare("SELECT COUNT(*) FROM user_roles WHERE user_id = ? AND role_id = ?");
        $checkStmt->execute([$userId, $roleId]);
        $exists = $checkStmt->fetchColumn();
        
        if (!$exists) {
            $sql = "INSERT INTO user_roles (user_id, role_id, granted_at) VALUES (?, ?, NOW())";
            $stmt = $db->prepare($sql);
            $stmt->execute([$userId, $roleId]);
            echo "✓ President role assigned (Role ID: $roleId)\n";
        } else {
            echo "✓ President role already assigned\n";
        }
    } else {
        echo "⚠ WARNING: 'president' role not found in roles table\n";
        echo "  Please ensure the roles table is properly seeded.\n";
    }
    
    // Display success message
    echo "\n";
    echo "╔════════════════════════════════════════════════════════╗\n";
    echo "║              PASSWORD RESET SUCCESSFUL!               ║\n";
    echo "╠════════════════════════════════════════════════════════╣\n";
    echo "║  Phone Number: $phone                       ║\n";
    echo "║  Password:     $password                          ║\n";
    echo "║  User ID:      " . str_pad($userId, 40) . "║\n";
    echo "╚════════════════════════════════════════════════════════╝\n";
    echo "\n";
    echo "You can now login to the system using these credentials.\n";
    echo "\n";

} catch (PDOException $e) {
    echo "\n✗ DATABASE ERROR: " . $e->getMessage() . "\n";
    echo "\nPlease verify:\n";
    echo "  1. MySQL/MariaDB is running\n";
    echo "  2. Database 'yemen_union_db' exists\n";
    echo "  3. Database credentials in .env are correct\n";
    echo "  4. Database tables are created (run migrations)\n\n";
    exit(1);
} catch (Exception $e) {
    echo "\n✗ ERROR: " . $e->getMessage() . "\n";
    echo "\nStack trace:\n" . $e->getTraceAsString() . "\n\n";
    exit(1);
}

