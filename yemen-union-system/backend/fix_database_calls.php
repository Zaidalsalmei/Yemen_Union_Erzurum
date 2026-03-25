<?php
/**
 * Fix all Database::getInstance() calls
 */

$files = [
    'src/Services/OtpService.php',
    'src/Repositories/MembershipRepository.php',
    'src/Repositories/ActivityRepository.php',
    'src/Controllers/SupportTicketController.php',
    'src/Controllers/SponsorshipController.php',
    'src/Controllers/SponsorController.php',
    'src/Controllers/ReportsController.php',
    'src/Controllers/MemberProfileController.php',
    'src/Controllers/MemberPostController.php',
    'src/Controllers/MemberPaymentController.php',
    'src/Controllers/MemberNotificationController.php',
    'src/Controllers/MemberDashboardController.php',
    'src/Controllers/FinanceController.php',
];

echo "=== FIXING DATABASE INITIALIZATION ===\n\n";

foreach ($files as $file) {
    $fullPath = __DIR__ . '/' . $file;
    
    if (!file_exists($fullPath)) {
        echo "⚠️  Skipped: $file (not found)\n";
        continue;
    }
    
    $content = file_get_contents($fullPath);
    $originalContent = $content;
    
    // Fix 1: Remove incorrect use statement
    $content = preg_replace('/use App\\\\Config\\\\Database;\s*\n/', '', $content);
    
    // Fix 2: Fix getInstance() calls
    $content = str_replace(
        '$this->db = Database::getInstance();',
        '$this->db = \App\Core\Database::getInstance()->getConnection();',
        $content
    );
    
    $content = str_replace(
        '$db = Database::getInstance();',
        '$db = \App\Core\Database::getInstance()->getConnection();',
        $content
    );
    
    if ($content !== $originalContent) {
        file_put_contents($fullPath, $content);
        echo "✅ Fixed: $file\n";
    } else {
        echo "⏭️  Skipped: $file (no changes needed)\n";
    }
}

echo "\n=== FIX COMPLETE ===\n";
