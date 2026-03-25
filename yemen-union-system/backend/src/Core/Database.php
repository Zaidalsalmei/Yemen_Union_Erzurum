<?php

namespace App\Core;

use PDO;
use PDOException;

class Database
{
    private static ?Database $instance = null;
    private PDO $connection;

    private function __construct()
    {
        $host = $_ENV['DB_HOST'] ?? 'localhost';
        $port = $_ENV['DB_PORT'] ?? '3306';
        $db   = $_ENV['DB_DATABASE'] ?? 'yemen_union_db';
        $user = $_ENV['DB_USERNAME'] ?? 'root';
        $pass = $_ENV['DB_PASSWORD'] ?? '';
        $charset = 'utf8mb4';

        $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $this->connection = new PDO($dsn, $user, $pass, $options);
        } catch (PDOException $e) {
            // Log full error for admin
            error_log('Database Connection Error: ' . $e->getMessage());
            // Throw generic error for user
            throw new \RuntimeException('Database connection failed. Please check logs.');
        }
    }

    public static function getInstance(): Database
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function getConnection(): PDO
    {
        return $this->connection;
    }
    
    // Prevent cloning of the instance
    private function __clone() {}

    // Prevent unserializing of the instance
    public function __wakeup() {}
}
