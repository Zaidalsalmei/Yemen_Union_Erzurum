<?php
function loadEnv($path) {
    if (!file_exists($path)) return false;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
    return true;
}

loadEnv(__DIR__ . '/../../.env');

$host = $_ENV['DB_HOST'] ?? 'localhost';
$port = $_ENV['DB_PORT'] ?? '3306';
$dbname = $_ENV['DB_DATABASE'] ?? 'yemen_union_db';
$user = $_ENV['DB_USERNAME'] ?? 'root';
$pass = $_ENV['DB_PASSWORD'] ?? '';

try {
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
    $db = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // 1. deleted_at on users
    $stmt = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'deleted_at'");
    $stmt->execute([$dbname]);
    if ($stmt->fetchColumn() == 0) {
        $db->exec("ALTER TABLE `users` ADD COLUMN `deleted_at` TIMESTAMP NULL DEFAULT NULL AFTER `updated_at`");
        echo "Added deleted_at to users.\n";
    }

    $stmt = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND INDEX_NAME = 'idx_deleted_at'");
    $stmt->execute([$dbname]);
    if ($stmt->fetchColumn() == 0) {
        $db->exec("ALTER TABLE `users` ADD INDEX `idx_deleted_at` (`deleted_at`)");
        echo "Added idx_deleted_at to users.\n";
    }

    // 2. email_replies
    $db->exec("
        CREATE TABLE IF NOT EXISTS `email_replies` (
            `id` INT NOT NULL AUTO_INCREMENT,
            `user_id` INT NOT NULL,
            `subject` VARCHAR(500) NULL,
            `body` TEXT NULL,
            `from_email` VARCHAR(255) NULL,
            `message_id` VARCHAR(500) NULL,
            `received_at` TIMESTAMP NULL,
            `is_read` TINYINT(1) DEFAULT 0,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_er_user` (`user_id`),
            KEY `idx_er_read` (`is_read`),
            CONSTRAINT `fk_email_replies_user` FOREIGN KEY (`user_id`)
                REFERENCES `users`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "Created/verified email_replies table.\n";

    // 3. sessions / user_sessions fixes
    // Try to find which table is the right one, 'sessions' or 'user_sessions'
    $stmt = $db->query("SHOW TABLES LIKE 'sessions'");
    $hasSessions = $stmt->rowCount() > 0;
    
    $stmt = $db->query("SHOW TABLES LIKE 'user_sessions'");
    $hasUserSessions = $stmt->rowCount() > 0;

    $tablesToUpdate = [];
    if ($hasSessions) $tablesToUpdate[] = 'sessions';
    if ($hasUserSessions) $tablesToUpdate[] = 'user_sessions';

    if (empty($tablesToUpdate)) {
        echo "Neither sessions nor user_sessions table exists.\n";
    }

    foreach ($tablesToUpdate as $tableName) {
        $cols = [
            ['name' => 'is_revoked', 'def' => "TINYINT(1) DEFAULT 0"],
            ['name' => 'token_hash', 'def' => "VARCHAR(255) NULL"],
            ['name' => 'device_type', 'def' => "VARCHAR(50) NULL"],
            ['name' => 'last_activity_at', 'def' => "TIMESTAMP NULL"]
        ];

        foreach ($cols as $col) {
            $stmt = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?");
            $stmt->execute([$dbname, $tableName, $col['name']]);
            if ($stmt->fetchColumn() == 0) {
                $db->exec("ALTER TABLE `{$tableName}` ADD COLUMN `{$col['name']}` {$col['def']}");
                echo "Added {$col['name']} to {$tableName}.\n";
            }
        }

        echo "\n--- {$tableName} columns ---\n";
        $stmt = $db->query("SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '{$dbname}' AND TABLE_NAME = '{$tableName}' ORDER BY ORDINAL_POSITION");
        foreach($stmt->fetchAll() as $row) {
            echo "{$row['COLUMN_NAME']} ({$row['COLUMN_TYPE']})\n";
        }
    }

    echo "\n--- users columns ---\n";
    $stmt = $db->query("SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '{$dbname}' AND TABLE_NAME = 'users' ORDER BY ORDINAL_POSITION");
    foreach($stmt->fetchAll() as $row) {
        echo "{$row['COLUMN_NAME']} ({$row['COLUMN_TYPE']})\n";
    }

} catch (PDOException $e) {
    echo "Error updating database: " . $e->getMessage() . "\n";
}
