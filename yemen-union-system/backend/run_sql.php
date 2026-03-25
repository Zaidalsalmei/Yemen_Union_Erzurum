<?php
try {
    $db = new PDO('mysql:host=localhost;dbname=yemen_union_db', 'root', '');
    $sql = file_get_contents('c:\wamp64\www\projects\yemen-union-system\backend\database\create_missing_tables.sql');
    $db->exec($sql);
    echo "Tables created successfully.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
