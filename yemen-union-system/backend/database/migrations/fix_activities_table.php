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

    // Add image column if missing
    $stmt = $db->query("SHOW COLUMNS FROM activities LIKE 'image'");
    if (!$stmt->fetch()) {
        $db->exec("ALTER TABLE activities ADD COLUMN image VARCHAR(255) DEFAULT NULL AFTER location");
        echo " image added.\n";
    }

    // Add summary column
    $stmt = $db->query("SHOW COLUMNS FROM activities LIKE 'summary'");
    if (!$stmt->fetch()) {
        $db->exec("ALTER TABLE activities ADD COLUMN summary TEXT DEFAULT NULL AFTER description");
        echo " summary added.\n";
    }

    // Add social_links column
    $stmt = $db->query("SHOW COLUMNS FROM activities LIKE 'social_links'");
    if (!$stmt->fetch()) {
        $db->exec("ALTER TABLE activities ADD COLUMN social_links JSON DEFAULT NULL");
        echo " social_links added.\n";
    }

    // Add gallery column
    $stmt = $db->query("SHOW COLUMNS FROM activities LIKE 'gallery'");
    if (!$stmt->fetch()) {
        $db->exec("ALTER TABLE activities ADD COLUMN gallery JSON DEFAULT NULL");
        echo " gallery added.\n";
    }
    
    // Add type column if missing
    $stmt = $db->query("SHOW COLUMNS FROM activities LIKE 'type'");
    if (!$stmt->fetch()) {
        $db->exec("ALTER TABLE activities ADD COLUMN type ENUM('activity','event','workshop','trip','meeting') DEFAULT 'activity'");
        echo " type added.\n";
    }

    echo "تم التحديث بنجاح\n";

} catch (Exception $e) {
    echo "حدث خطأ: " . $e->getMessage() . "\n";
}
