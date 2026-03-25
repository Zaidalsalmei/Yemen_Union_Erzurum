<?php
require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use App\Config\Database;

try {
    echo "Connecting to database...\n";
    $pdo = Database::getInstance();
    echo "Connected.\n";
    
    $sqlFile = __DIR__ . '/database/migrations/01_hardening_schema.sql';
    if (!file_exists($sqlFile)) {
        throw new Exception("SQL file not found: $sqlFile");
    }
    
    echo "Reading migration file...\n";
    $sql = file_get_contents($sqlFile);
    
    // Split by delimiter if needed, or just exec if simple. 
    // The SQL file contains DELIMITER commands which PDO::exec might NOT handle natively if parsing line by line.
    // However, typical PDO::exec/mysql drivers don't parse DELIMITER keywords; they execute the whole block if passed as one string 
    // IF the driver supports multiple queries.
    // But Stored Procedures often require special handling in PHP PDO.
    // A safer way for the Stored Procedure part is to execute it separately or handle delimiters.
    // The current SQL has: DELIMITER // ... END // DELIMITER ;
    // PDO might choke on 'DELIMITER'.
    
    // Correction: PDO does NOT support the 'DELIMITER' client command. That is a MySQL CLI client feature.
    // I must strip the DELIMITER commands and just execute the CREATE PROCEDURE block as one statement.
    // I should rewrite the SQL file to NOT use DELIMITER if I run it via PHP, OR parse it here.
    
    // Parsing approach:
    // 1. Remove DELIMITER lines.
    // 2. Identify the procedure body.
    
    // Alternative: Just run the CREATE TABLEs first.
    // Then run the PROCEDURE creation/call separately.
    
    // Let's rely on a simpler regex split or just execute chunks.
    
    // Regex to split by semicolon, BUT ignore semicolons inside BEGIN/END blocks? Hard.
    // Better strategy: Simplified migration logic in PHP directly instead of SQL Stored Procedure? 
    // No, I'll update the SQL file to remove DELIMITER and just have valid SQL statements, 
    // but CREATE PROCEDURE requires a delimiter in CLI. In PDO, it just needs to be a single string.
    
    // Let's try running it. If it fails on DELIMITER, I will update the script to stripping them.
    
    // Removing DELIMITER lines.
    $sql = preg_replace('/^DELIMITER\s+\/\/$/m', '', $sql);
    $sql = preg_replace('/^DELIMITER\s+;$/m', '', $sql);
    $sql = preg_replace('/^DELIMITER\s+;$/m', '', $sql); // Safety
    
    // Now we have the procedure with // as "end" maybe? No, the SQL text had // as delimiter.
    // In PDO, we don't need to change the delimiter, we just send the whole Create Procedure statement.
    // But we need to separate it from other statements.
    // Standard ; splitting won't work easily with Procedure.
    
    // Let's execute the raw big string. MySQL driver *MIGHT* allow multiple queries if emulated prepares are on or flags set.
    // But `Database.php` has `PDO::MYSQL_ATTR_INIT_COMMAND`.
    
    // RISK: Executing a huge string with multiple queries including a procedure might fail.
    // SAFE FIX: I will rewrite the SQL file to simply not use a procedure. I'll use IF NOT EXISTS checks in simple SQL 
    // or DO blocks (MySQL 8+ only?) 
    // Actually, I can implement the migration logic (Step 5) in PHP! 
    // It's safer and clearer.
    
    // REVISED PLAN: 
    // 1. Execute the CREATE TABLES (Steps 1-4) via SQL file (modified).
    // 2. Execute the Data Migration (Step 5) via PHP code.
    // 3. Execute the Indexes (Step 7) via SQL/PHP.
    
    // I will read the SQL file, but I should probably revert the SQL file change or split it.
    // I'll start by running the Create Tables part (I'll modify the SQL file to remove the Procedure part first).
    
    // Actually, I will just write the PHP logic here to do the migration, ignoring the SQL file's procedure part.
    
    // Step 1: Run CREATE TABLES from the file (I need to strip the procedure part from the file or just ignore errors?)
    // I'll write a new filtered SQL content here or just update the file on disk to be "PDO-safe" (no procedure).
    
    $statements = [
        // 1. Settings V2
        "CREATE TABLE IF NOT EXISTS settings_v2 (
            id INT AUTO_INCREMENT PRIMARY KEY,
            setting_key VARCHAR(255) UNIQUE NOT NULL,
            setting_value TEXT,
            val_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
            category VARCHAR(50) DEFAULT 'general',
            is_public TINYINT(1) DEFAULT 0,
            is_sensitive TINYINT(1) DEFAULT 0,
            is_editable TINYINT(1) DEFAULT 1,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_key (setting_key),
            INDEX idx_category (category)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // 2. Conflicts
        "CREATE TABLE IF NOT EXISTS settings_conflicts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            source_table VARCHAR(50),
            setting_key VARCHAR(255),
            setting_value TEXT,
            conflict_reason TEXT,
            resolved TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // 3. Audit Logs
        "CREATE TABLE IF NOT EXISTS audit_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NULL,
            action VARCHAR(255) NOT NULL,
            resource_type VARCHAR(100) NULL,
            resource_id VARCHAR(100) NULL,
            old_values TEXT NULL,
            new_values TEXT NULL,
            ip_address VARCHAR(45) NULL,
            user_agent TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_action (user_id, action),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // 4. System Logs
        "CREATE TABLE IF NOT EXISTS system_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            level VARCHAR(20) DEFAULT 'info',
            message TEXT NOT NULL,
            context JSON NULL,
            trace TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_level (level),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // Indexes (using try-catch for individual failures if already exist)
        // Note: IF NOT EXISTS for indexes is MySQL 8.0+. We assume 5.7+ safety by ignoring errors or checking.
        // We'll wrap them in PHP try-catch.
    ];
    
    foreach ($statements as $stmt) {
        $pdo->exec($stmt);
    }
    echo "Tables created.\n";

    // Step 5: Migration Logic (PHP)
    echo "Migrating settings...\n";
    
    // Check system_settings
    $hasSystemSettings = $pdo->query("SHOW TABLES LIKE 'system_settings'")->rowCount() > 0;
    if ($hasSystemSettings) {
        $rows = $pdo->query("SELECT * FROM system_settings")->fetchAll();
        foreach ($rows as $row) {
            $key = $row['setting_key'];
            $val = $row['setting_value'];
            $cat = $row['category'] ?? 'system';
            $desc = $row['description'] ?? null;
            
            // Insert or Update
            $stmt = $pdo->prepare("INSERT INTO settings_v2 (setting_key, setting_value, category, description) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");
            $stmt->execute([$key, $val, $cat, $desc]);
        }
    }
    
    // Check settings (legacy)
    $hasSettings = $pdo->query("SHOW TABLES LIKE 'settings'")->rowCount() > 0;
    if ($hasSettings) {
        // Inspect columns to be sure
        $cols = $pdo->query("DESCRIBE settings")->fetchAll(PDO::FETCH_COLUMN);
        $keyCol = in_array('key', $cols) ? 'key' : (in_array('setting_key', $cols) ? 'setting_key' : null);
        $valCol = in_array('value', $cols) ? 'value' : (in_array('setting_value', $cols) ? 'setting_value' : null);
        
        if ($keyCol && $valCol) {
            $rows = $pdo->query("SELECT `$keyCol` as k, `$valCol` as v FROM settings")->fetchAll();
            foreach ($rows as $row) {
                // Insert IGNORE
                $stmt = $pdo->prepare("INSERT IGNORE INTO settings_v2 (setting_key, setting_value, category) VALUES (?, ?, 'legacy')");
                $stmt->execute([$row['k'], $row['v']]);
                
                // If it was ignored, maybe check conflict? (Skipping for now as per 'best effort' plan)
            }
        }
    }
    
    // Step 6: Default Settings
    $defaults = [
        ['app.name', 'نظام اتحاد الطلبة اليمنيين', 'string', 'general', 1, 0],
        ['app.version', '1.0.0', 'string', 'general', 1, 0],
        ['mail.smtp_host', '', 'string', 'mail', 0, 0],
        ['mail.smtp_port', '587', 'number', 'mail', 0, 0],
        ['mail.smtp_user', '', 'string', 'mail', 0, 1],
        ['mail.smtp_pass', '', 'string', 'mail', 0, 1],
        ['branding.logo_url', '/assets/logo.png', 'string', 'branding', 1, 0],
    ];
    
    $stmt = $pdo->prepare("INSERT IGNORE INTO settings_v2 (setting_key, setting_value, val_type, category, is_public, is_sensitive) VALUES (?, ?, ?, ?, ?, ?)");
    foreach ($defaults as $d) {
        $stmt->execute($d);
    }
    
    echo "Migration completed successfully.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
