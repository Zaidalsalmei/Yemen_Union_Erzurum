<?php
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..'); $dotenv->load();
$db = App\Core\Database::getInstance()->getConnection();
header('Content-Type: text/plain');
try {
    $check = $db->query("SELECT COUNT(*) FROM support_tickets")->fetchColumn();
    if ($check == 0) {
        $db->exec("INSERT INTO support_tickets (user_id, subject, message, status, priority, created_at, updated_at) 
                   VALUES (1, 'مشكلة في الدخول', 'لا أستطيع الدخول إلى حسابي', 'open', 'high', NOW(), NOW())");
        echo "Mock ticket created for user 1\n";
    } else {
        echo "Tickets already exist\n";
    }
    
    // Cleanup debug files
    $files = ['debug_notifs.php', 'debug_tickets.php', 'count_notifs.php', 'debug_user.php', 'find_sami.php', 'debug_sami_roles.php', 'list_tables_v2.php', 'dump_schema.php', 'check_pkgs.php', 'check_acts.php', 'check_fin.php', 'check_fin_cols.php', 'check_mem_cols.php', 'full_mem_cols.php', 'check_notifs.php', 'check_tickets.php', 'check_users.php', 'check_acts_loc.php'];
    foreach ($files as $f) { @unlink(__DIR__ . "/$f"); }
} catch (Exception $e) { echo $e->getMessage(); }
