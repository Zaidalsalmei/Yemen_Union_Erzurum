<?php
require_once __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

try {
    $db = new PDO(
        'mysql:host=localhost;dbname=' . $_ENV['DB_DATABASE'], 
        $_ENV['DB_USERNAME'], 
        $_ENV['DB_PASSWORD']
    );
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Add status column
    $stmt = $db->query("SHOW COLUMNS FROM memberships LIKE 'status'");
    if (!$stmt->fetch()) {
        $db->exec("ALTER TABLE memberships ADD COLUMN status ENUM('pending','active','expired','cancelled','rejected') DEFAULT 'pending'");
        echo " status added.\n";
    }
    
    // Add currency column
    $stmt = $db->query("SHOW COLUMNS FROM memberships LIKE 'currency'");
    if (!$stmt->fetch()) {
        $db->exec("ALTER TABLE memberships ADD COLUMN currency VARCHAR(10) DEFAULT 'TRY'");
        echo " currency added.\n";
    }

    // Add package_type column
    $stmt = $db->query("SHOW COLUMNS FROM memberships LIKE 'package_type'");
    if (!$stmt->fetch()) {
        $db->exec("ALTER TABLE memberships ADD COLUMN package_type VARCHAR(50) DEFAULT 'annual'");
        echo " package_type added.\n";
    }

    echo "تم الإصلاح بنجاح\n";

} catch (Exception $e) {
    echo "حدث خطأ: " . $e->getMessage() . "\n";
}
