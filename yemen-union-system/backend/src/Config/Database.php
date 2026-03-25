<?php
/**
 * Database Configuration and Connection Manager
 */

declare(strict_types=1);

namespace App\Config;

use PDO;
use PDOException;

class Database
{
    private static ?PDO $instance = null;
    
    /**
     * Get database connection instance (Singleton)
     */
    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            try {
                $host = $_ENV['DB_HOST'] ?? 'localhost';
                $port = $_ENV['DB_PORT'] ?? '3306';
                $database = $_ENV['DB_DATABASE'] ?? 'yemen_union_db';
                $username = $_ENV['DB_USERNAME'] ?? 'root';
                $password = $_ENV['DB_PASSWORD'] ?? '';
                
                $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";
                
                self::$instance = new PDO($dsn, $username, $password, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
                ]);
                
            } catch (PDOException $e) {
                throw new \RuntimeException('خطأ في الاتصال بقاعدة البيانات: ' . $e->getMessage());
            }
        }
        
        return self::$instance;
    }
    
    /**
     * Begin a database transaction
     */
    public static function beginTransaction(): void
    {
        self::getInstance()->beginTransaction();
    }
    
    /**
     * Commit the current transaction
     */
    public static function commit(): void
    {
        self::getInstance()->commit();
    }
    
    /**
     * Rollback the current transaction
     */
    public static function rollback(): void
    {
        self::getInstance()->rollBack();
    }
    
    /**
     * Prevent cloning
     */
    private function __clone() {}
}
