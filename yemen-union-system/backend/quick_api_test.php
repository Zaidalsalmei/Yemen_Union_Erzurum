<?php
/**
 * Quick API Testing Script
 */

$baseUrl = 'http://localhost:8000';
$results = [];

function quickTest($method, $endpoint, $description) {
    global $baseUrl, $results;
    
    $url = $baseUrl . $endpoint;
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    $status = '❌';
    if ($httpCode >= 200 && $httpCode < 500) {
        $status = '✅';
    }
    
    $results[] = [
        'status' => $status,
        'code' => $httpCode,
        'method' => $method,
        'endpoint' => $endpoint,
        'description' => $description,
        'error' => $error
    ];
    
    return $httpCode;
}

echo "\n";
echo "═══════════════════════════════════════════════════════════════\n";
echo "           🔍 Yemen Union System - Quick API Test             \n";
echo "═══════════════════════════════════════════════════════════════\n";
echo "\n";

// Test Public APIs
echo "📂 Testing Public APIs...\n\n";
quickTest('GET', '/api/health', 'Health Check');
quickTest('GET', '/api/settings/branding', 'Branding Settings');
quickTest('GET', '/api/settings/system', 'System Settings');

// Test Protected APIs (will return 401)
echo "\n🔐 Testing Protected APIs (401 expected)...\n\n";
quickTest('GET', '/api/dashboard', 'Admin Dashboard');
quickTest('GET', '/api/member/dashboard', 'Member Dashboard');
quickTest('GET', '/api/users', 'List Users');
quickTest('GET', '/api/memberships', 'List Memberships');
quickTest('GET', '/api/activities', 'List Activities');
quickTest('GET', '/api/finance/stats', 'Finance Stats');
quickTest('GET', '/api/reports/stats', 'Reports Stats');
quickTest('GET', '/api/sponsors', 'List Sponsors');
quickTest('GET', '/api/sponsorships', 'List Sponsorships');
quickTest('GET', '/api/settings', 'All Settings');
quickTest('GET', '/api/roles', 'List Roles');
quickTest('GET', '/api/support/tickets', 'Support Tickets');

// Print Results
echo "\n═══════════════════════════════════════════════════════════════\n";
echo "                        📊 RESULTS                             \n";
echo "═══════════════════════════════════════════════════════════════\n\n";

$total = count($results);
$passed = 0;
$failed = 0;

foreach ($results as $result) {
    if ($result['status'] === '✅') {
        $passed++;
    } else {
        $failed++;
    }
    
    printf("%s [%d] %s %s\n", 
        $result['status'], 
        $result['code'], 
        $result['method'], 
        $result['endpoint']
    );
    
    if ($result['description']) {
        printf("   → %s\n", $result['description']);
    }
    
    if ($result['error']) {
        printf("   ⚠ Error: %s\n", $result['error']);
    }
    
    echo "\n";
}

echo "═══════════════════════════════════════════════════════════════\n";
echo "Total: $total | Passed: $passed | Failed: $failed\n";
echo "Success Rate: " . round(($passed / $total) * 100, 2) . "%\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

// Save to file
$report = [
    'timestamp' => date('Y-m-d H:i:s'),
    'total' => $total,
    'passed' => $passed,
    'failed' => $failed,
    'results' => $results
];

file_put_contents('quick_test_report.json', json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo "📄 Report saved to: quick_test_report.json\n\n";
