<?php
require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../src/Core/Database.php';

$db = App\Core\Database::getInstance()->getConnection();
$stmt = $db->prepare("
    SELECT 
        id, 
        type, 
        name as name_ar, 
        description as description_ar, 
        price, 
        currency, 
        ROUND(duration_days / 30) as duration_months,
        duration_days,
        is_active, 
        created_at, 
        updated_at 
    FROM membership_packages 
    WHERE is_active = 1
");
$stmt->execute();
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
