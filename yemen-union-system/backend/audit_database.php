<?php
require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$db = \App\Core\Database::getInstance()->getConnection();

echo "=== FULL DATABASE AUDIT ===\n\n";

// Get all tables
$tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);

echo "📊 Total Tables: " . count($tables) . "\n\n";

foreach ($tables as $table) {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "TABLE: $table\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    
    // Get column info
    $columns = $db->query("DESCRIBE $table")->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $col) {
        $key = $col['Key'] ? " [{$col['Key']}]" : "";
        $null = $col['Null'] === 'YES' ? 'NULL' : 'NOT NULL';
        echo "  • {$col['Field']}: {$col['Type']} $null$key\n";
    }
    
    // Get row count
    $count = $db->query("SELECT COUNT(*) FROM $table")->fetchColumn();
    echo "  📈 Rows: $count\n";
    
    // Check for foreign keys
    $fks = $db->query("
        SELECT 
            COLUMN_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = 'yemen_union_db'
        AND TABLE_NAME = '$table'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    ")->fetchAll(PDO::FETCH_ASSOC);
    
    if ($fks) {
        echo "  🔗 Foreign Keys:\n";
        foreach ($fks as $fk) {
            echo "    - {$fk['COLUMN_NAME']} → {$fk['REFERENCED_TABLE_NAME']}.{$fk['REFERENCED_COLUMN_NAME']}\n";
        }
    }
    
    echo "\n";
}

echo "=== RELATIONSHIP CHECK ===\n\n";

// Check critical relationships
$relationships = [
    'user_roles' => ['user_id' => 'users', 'role_id' => 'roles'],
    'role_permissions' => ['role_id' => 'roles', 'permission_id' => 'permissions'],
    'memberships' => ['user_id' => 'users'],
    'activity_participants' => ['activity_id' => 'activities', 'user_id' => 'users'],
    'support_tickets' => ['user_id' => 'users'],
    'sponsorships' => ['sponsor_id' => 'sponsors'],
];

foreach ($relationships as $table => $refs) {
    echo "Checking $table:\n";
    foreach ($refs as $col => $refTable) {
        $orphans = $db->query("
            SELECT COUNT(*) 
            FROM $table t 
            LEFT JOIN $refTable r ON t.$col = r.id 
            WHERE r.id IS NULL AND t.$col IS NOT NULL
        ")->fetchColumn();
        
        if ($orphans > 0) {
            echo "  ⚠️  $orphans orphaned records in $col\n";
        } else {
            echo "  ✓ $col → $refTable: OK\n";
        }
    }
    echo "\n";
}

echo "=== AUDIT COMPLETE ===\n";
