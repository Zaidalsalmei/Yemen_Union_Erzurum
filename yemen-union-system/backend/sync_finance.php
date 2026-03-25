<?php
require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use App\Core\Database;

$db = Database::getInstance()->getConnection();

try {
    // 1. Get all memberships that are not yet in financial_transactions
    $sql = "SELECT m.*, u.full_name as user_name 
            FROM memberships m 
            JOIN users u ON m.user_id = u.id 
            WHERE NOT EXISTS (
                SELECT 1 FROM financial_transactions ft 
                WHERE ft.reference_type = 'membership' AND ft.reference_id = m.id
            )";
    $stmt = $db->query($sql);
    $memberships = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Found " . count($memberships) . " memberships to sync.\n";

    $insertSql = "INSERT INTO financial_transactions 
                  (type, category, amount, currency, description, reference_type, reference_id, payment_method, status, transaction_date, created_by, approved_by, approved_at, created_at, updated_at) 
                  VALUES 
                  (:type, :category, :amount, :currency, :description, 'membership', :reference_id, :payment_method, :status, :transaction_date, :created_by, :approved_by, :approved_at, NOW(), NOW())";
    
    $insertStmt = $db->prepare($insertSql);

    foreach ($memberships as $m) {
        $status = $m['status'];
        if ($status === 'refunded' || $status === 'cancelled') continue;

        $insertStmt->execute([
            ':type' => 'income',
            ':category' => 'اشتراكات',
            ':amount' => $m['amount'],
            ':currency' => $m['currency'] ?? 'TRY',
            ':description' => "اشتراك عضو: " . $m['user_name'],
            ':reference_id' => $m['id'],
            ':payment_method' => $m['payment_method'],
            ':status' => $status === 'active' ? 'approved' : ($status === 'rejected' ? 'rejected' : 'pending'),
            ':transaction_date' => $m['payment_date'] ?? $m['start_date'],
            ':created_by' => $m['approved_by'] ?? 1, // Assume admin if unknown
            ':approved_by' => $status === 'active' ? ($m['approved_by'] ?? 1) : null,
            ':approved_at' => $status === 'active' ? ($m['approved_at'] ?? $m['created_at']) : null
        ]);
        echo "Synced membership ID: " . $m['id'] . "\n";
    }

    echo "Sync completed successfully.\n";

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
