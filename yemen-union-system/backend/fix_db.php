<?php
require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();
$db = \App\Core\Database::getInstance()->getConnection();

try {
    $db->exec("ALTER TABLE verification_codes 
        CHANGE COLUMN code otp varchar(6) NOT NULL,
        MODIFY COLUMN phone_number varchar(255) NOT NULL,
        ADD COLUMN updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
    echo "SUCCESS: Table verification_codes updated.\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
