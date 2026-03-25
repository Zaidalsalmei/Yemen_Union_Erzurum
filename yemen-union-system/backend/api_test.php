<?php
/**
 * API Testing Script
 * Tests all API endpoints and generates a comprehensive report
 */

declare(strict_types=1);

// Configuration
$baseUrl = 'http://localhost:8000';
$testResults = [];
$totalTests = 0;
$passedTests = 0;
$failedTests = 0;

// Color output for terminal
function colorOutput($text, $color = 'white') {
    $colors = [
        'green' => "\033[0;32m",
        'red' => "\033[0;31m",
        'yellow' => "\033[1;33m",
        'blue' => "\033[0;34m",
        'white' => "\033[0;37m",
        'reset' => "\033[0m"
    ];
    return $colors[$color] . $text . $colors['reset'];
}

// Test API endpoint
function testEndpoint($method, $endpoint, $data = null, $token = null, $description = '') {
    global $baseUrl, $testResults, $totalTests, $passedTests, $failedTests;
    
    $totalTests++;
    $url = $baseUrl . $endpoint;
    
    $ch = curl_init();
    
    $headers = [
        'Content-Type: application/json',
        'Accept: application/json'
    ];
    
    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    } elseif ($method === 'PUT') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    } elseif ($method === 'DELETE') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    $result = [
        'method' => $method,
        'endpoint' => $endpoint,
        'description' => $description,
        'http_code' => $httpCode,
        'success' => false,
        'error' => null,
        'response' => null
    ];
    
    if ($error) {
        $result['error'] = $error;
        $failedTests++;
    } else {
        $responseData = json_decode($response, true);
        $result['response'] = $responseData;
        
        // Consider 200, 201, 400, 401, 403, 404 as "working" (not broken)
        // 500 errors indicate broken endpoints
        if ($httpCode >= 200 && $httpCode < 500) {
            $result['success'] = true;
            $passedTests++;
        } else {
            $result['error'] = 'Server Error (500)';
            $failedTests++;
        }
    }
    
    $testResults[] = $result;
    return $result;
}

// Print header
echo "\n";
echo colorOutput("═══════════════════════════════════════════════════════════════", 'blue') . "\n";
echo colorOutput("           🔍 Yemen Union System - API Testing Report          ", 'blue') . "\n";
echo colorOutput("═══════════════════════════════════════════════════════════════", 'blue') . "\n";
echo "\n";
echo colorOutput("📍 Base URL: ", 'white') . colorOutput($baseUrl, 'yellow') . "\n";
echo colorOutput("⏰ Test Time: ", 'white') . colorOutput(date('Y-m-d H:i:s'), 'yellow') . "\n";
echo "\n";

// ============================================
// PUBLIC ENDPOINTS (No Authentication)
// ============================================

echo colorOutput("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";
echo colorOutput("📂 PUBLIC ENDPOINTS", 'blue') . "\n";
echo colorOutput("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";

// Health Check
testEndpoint('GET', '/api/health', null, null, 'Health Check');

// Branding & System Settings
testEndpoint('GET', '/api/settings/branding', null, null, 'Get Branding Settings');
testEndpoint('GET', '/api/settings/system', null, null, 'Get System Settings');

// ============================================
// PROTECTED ENDPOINTS (Require Authentication)
// ============================================

echo colorOutput("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";
echo colorOutput("🔐 AUTHENTICATION ENDPOINTS", 'blue') . "\n";
echo colorOutput("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";

// Auth - Login (should fail with invalid credentials)
testEndpoint('POST', '/api/auth/login', [
    'phone_number' => '1234567890',
    'password' => 'wrongpassword'
], null, 'Login (Invalid Credentials)');

// Auth - Send OTP
testEndpoint('POST', '/api/auth/send-otp', [
    'phone_number' => '1234567890'
], null, 'Send OTP');

// Auth - Send Recovery OTP
testEndpoint('POST', '/api/auth/send-recovery-otp', [
    'phone_number' => '1234567890'
], null, 'Send Recovery OTP');

// ============================================
// DASHBOARD ENDPOINTS (Require Auth)
// ============================================

echo colorOutput("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";
echo colorOutput("📊 DASHBOARD ENDPOINTS (Require Auth)", 'blue') . "\n";
echo colorOutput("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";

testEndpoint('GET', '/api/dashboard', null, null, 'Admin Dashboard (No Auth)');
testEndpoint('GET', '/api/member/dashboard', null, null, 'Member Dashboard (No Auth)');

// ============================================
// USER ENDPOINTS (Require Auth)
// ============================================

echo colorOutput("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";
echo colorOutput("👥 USER ENDPOINTS (Require Auth)", 'blue') . "\n";
echo colorOutput("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";

testEndpoint('GET', '/api/users', null, null, 'List Users (No Auth)');
testEndpoint('GET', '/api/users/1', null, null, 'Get User by ID (No Auth)');

// ============================================
// MEMBERSHIP ENDPOINTS
// ============================================

echo colorOutput("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";
echo colorOutput("💳 MEMBERSHIP ENDPOINTS (Require Auth)", 'blue') . "\n";
echo colorOutput("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";

testEndpoint('GET', '/api/memberships/packages', null, null, 'Get Membership Packages (No Auth)');
testEndpoint('GET', '/api/memberships', null, null, 'List Memberships (No Auth)');
testEndpoint('GET', '/api/memberships/my', null, null, 'Get My Membership (No Auth)');

// ============================================
// ACTIVITY ENDPOINTS
// ============================================

echo colorOutput("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";
echo colorOutput("🎯 ACTIVITY ENDPOINTS (Require Auth)", 'blue') . "\n";
echo colorOutput("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";

testEndpoint('GET', '/api/activities', null, null, 'List Activities (No Auth)');
testEndpoint('GET', '/api/activities/1', null, null, 'Get Activity by ID (No Auth)');

// ============================================
// FINANCE ENDPOINTS
// ============================================

echo colorOutput("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";
echo colorOutput("💰 FINANCE ENDPOINTS (Require Auth)", 'blue') . "\n";
echo colorOutput("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";

testEndpoint('GET', '/api/finance/stats', null, null, 'Finance Stats (No Auth)');
testEndpoint('GET', '/api/finance/overview', null, null, 'Finance Overview (No Auth)');
testEndpoint('GET', '/api/finance/transactions', null, null, 'Finance Transactions (No Auth)');

// ============================================
// REPORTS ENDPOINTS
// ============================================

echo colorOutput("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";
echo colorOutput("📈 REPORTS ENDPOINTS (Require Auth)", 'blue') . "\n";
echo colorOutput("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";

testEndpoint('GET', '/api/reports/stats', null, null, 'Reports Stats (No Auth)');
testEndpoint('GET', '/api/reports/overview', null, null, 'Reports Overview (No Auth)');
testEndpoint('GET', '/api/reports/members', null, null, 'Members Report (No Auth)');
testEndpoint('GET', '/api/reports/subscriptions', null, null, 'Subscriptions Report (No Auth)');
testEndpoint('GET', '/api/reports/activities', null, null, 'Activities Report (No Auth)');
testEndpoint('GET', '/api/reports/finance', null, null, 'Finance Report (No Auth)');

// ============================================
// SPONSOR ENDPOINTS
// ============================================

echo colorOutput("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";
echo colorOutput("🤝 SPONSOR ENDPOINTS (Require Auth)", 'blue') . "\n";
echo colorOutput("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";

testEndpoint('GET', '/api/sponsors/stats', null, null, 'Sponsor Stats (No Auth)');
testEndpoint('GET', '/api/sponsors/dropdown', null, null, 'Sponsor Dropdown (No Auth)');
testEndpoint('GET', '/api/sponsors', null, null, 'List Sponsors (No Auth)');

// ============================================
// SPONSORSHIP ENDPOINTS
// ============================================

echo colorOutput("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";
echo colorOutput("💝 SPONSORSHIP ENDPOINTS (Require Auth)", 'blue') . "\n";
echo colorOutput("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";

testEndpoint('GET', '/api/sponsorships/stats', null, null, 'Sponsorship Stats (No Auth)');
testEndpoint('GET', '/api/sponsorships/recent', null, null, 'Recent Sponsorships (No Auth)');
testEndpoint('GET', '/api/sponsorships/calendar', null, null, 'Sponsorship Calendar (No Auth)');
testEndpoint('GET', '/api/sponsorships', null, null, 'List Sponsorships (No Auth)');

// ============================================
// SETTINGS ENDPOINTS
// ============================================

echo colorOutput("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";
echo colorOutput("⚙️  SETTINGS ENDPOINTS (Require Auth)", 'blue') . "\n";
echo colorOutput("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";

testEndpoint('GET', '/api/settings', null, null, 'Get All Settings (No Auth)');
testEndpoint('GET', '/api/settings/notifications', null, null, 'Get Notification Settings (No Auth)');

// ============================================
// ROLES & PERMISSIONS ENDPOINTS
// ============================================

echo colorOutput("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";
echo colorOutput("🔑 ROLES & PERMISSIONS ENDPOINTS (Require Auth)", 'blue') . "\n";
echo colorOutput("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";

testEndpoint('GET', '/api/roles', null, null, 'List Roles (No Auth)');
testEndpoint('GET', '/api/permissions', null, null, 'List Permissions (No Auth)');
testEndpoint('GET', '/api/users-with-roles', null, null, 'Users with Roles (No Auth)');

// ============================================
// SUPPORT TICKET ENDPOINTS
// ============================================

echo colorOutput("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";
echo colorOutput("🎫 SUPPORT TICKET ENDPOINTS (Require Auth)", 'blue') . "\n";
echo colorOutput("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";

testEndpoint('GET', '/api/support/tickets', null, null, 'List Support Tickets (No Auth)');

// ============================================
// MEMBER ENDPOINTS
// ============================================

echo colorOutput("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";
echo colorOutput("👤 MEMBER ENDPOINTS (Require Auth)", 'blue') . "\n";
echo colorOutput("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'blue') . "\n";

testEndpoint('GET', '/api/member/payments/history', null, null, 'Payment History (No Auth)');
testEndpoint('GET', '/api/member/notifications', null, null, 'Member Notifications (No Auth)');
testEndpoint('GET', '/api/member/posts', null, null, 'Member Posts (No Auth)');

// ============================================
// PRINT SUMMARY
// ============================================

echo "\n\n";
echo colorOutput("═══════════════════════════════════════════════════════════════", 'blue') . "\n";
echo colorOutput("                        📊 TEST SUMMARY                        ", 'blue') . "\n";
echo colorOutput("═══════════════════════════════════════════════════════════════", 'blue') . "\n";
echo "\n";

echo colorOutput("Total Tests: ", 'white') . colorOutput((string)$totalTests, 'yellow') . "\n";
echo colorOutput("Passed: ", 'white') . colorOutput((string)$passedTests, 'green') . "\n";
echo colorOutput("Failed: ", 'white') . colorOutput((string)$failedTests, 'red') . "\n";
echo colorOutput("Success Rate: ", 'white') . colorOutput(round(($passedTests / $totalTests) * 100, 2) . '%', 'yellow') . "\n";

// ============================================
// DETAILED RESULTS
// ============================================

echo "\n";
echo colorOutput("═══════════════════════════════════════════════════════════════", 'blue') . "\n";
echo colorOutput("                     📋 DETAILED RESULTS                       ", 'blue') . "\n";
echo colorOutput("═══════════════════════════════════════════════════════════════", 'blue') . "\n";
echo "\n";

foreach ($testResults as $result) {
    $status = $result['success'] ? colorOutput('✓ PASS', 'green') : colorOutput('✗ FAIL', 'red');
    $httpCode = $result['http_code'];
    
    // Color code based on HTTP status
    $codeColor = 'white';
    if ($httpCode >= 200 && $httpCode < 300) {
        $codeColor = 'green';
    } elseif ($httpCode >= 400 && $httpCode < 500) {
        $codeColor = 'yellow';
    } elseif ($httpCode >= 500) {
        $codeColor = 'red';
    }
    
    echo $status . " ";
    echo colorOutput("[" . $httpCode . "]", $codeColor) . " ";
    echo colorOutput($result['method'], 'blue') . " ";
    echo colorOutput($result['endpoint'], 'white') . "\n";
    
    if ($result['description']) {
        echo "   " . colorOutput("→ " . $result['description'], 'white') . "\n";
    }
    
    if ($result['error']) {
        echo "   " . colorOutput("⚠ Error: " . $result['error'], 'red') . "\n";
    }
    
    // Show response message if available
    if (isset($result['response']['message'])) {
        echo "   " . colorOutput("💬 " . $result['response']['message'], 'yellow') . "\n";
    }
    
    echo "\n";
}

// ============================================
// BROKEN ENDPOINTS (500 Errors)
// ============================================

$brokenEndpoints = array_filter($testResults, function($result) {
    return $result['http_code'] >= 500;
});

if (count($brokenEndpoints) > 0) {
    echo "\n";
    echo colorOutput("═══════════════════════════════════════════════════════════════", 'red') . "\n";
    echo colorOutput("                  ⚠️  BROKEN ENDPOINTS (500)                   ", 'red') . "\n";
    echo colorOutput("═══════════════════════════════════════════════════════════════", 'red') . "\n";
    echo "\n";
    
    foreach ($brokenEndpoints as $result) {
        echo colorOutput("✗ ", 'red');
        echo colorOutput($result['method'], 'blue') . " ";
        echo colorOutput($result['endpoint'], 'white') . "\n";
        
        if ($result['description']) {
            echo "  " . colorOutput("→ " . $result['description'], 'white') . "\n";
        }
        
        if (isset($result['response']['message'])) {
            echo "  " . colorOutput("💬 " . $result['response']['message'], 'yellow') . "\n";
        }
        
        echo "\n";
    }
}

// ============================================
// MISSING ENDPOINTS
// ============================================

echo "\n";
echo colorOutput("═══════════════════════════════════════════════════════════════", 'blue') . "\n";
echo colorOutput("                    ℹ️  RECOMMENDATIONS                         ", 'blue') . "\n";
echo colorOutput("═══════════════════════════════════════════════════════════════", 'blue') . "\n";
echo "\n";

echo colorOutput("1. ", 'yellow') . "Most endpoints require authentication (401 Unauthorized is expected)\n";
echo colorOutput("2. ", 'yellow') . "To test authenticated endpoints, you need to:\n";
echo "   - Login with valid credentials\n";
echo "   - Get the JWT token\n";
echo "   - Pass the token in Authorization header\n";
echo colorOutput("3. ", 'yellow') . "500 errors indicate broken/missing implementations\n";
echo colorOutput("4. ", 'yellow') . "400 errors indicate validation issues (expected behavior)\n";
echo colorOutput("5. ", 'yellow') . "404 errors indicate missing resources (expected for invalid IDs)\n";

echo "\n";
echo colorOutput("═══════════════════════════════════════════════════════════════", 'blue') . "\n";
echo colorOutput("                      ✅ TEST COMPLETE                         ", 'blue') . "\n";
echo colorOutput("═══════════════════════════════════════════════════════════════", 'blue') . "\n";
echo "\n";

// Save report to file
$reportFile = __DIR__ . '/api_test_report_' . date('Y-m-d_H-i-s') . '.json';
file_put_contents($reportFile, json_encode([
    'timestamp' => date('Y-m-d H:i:s'),
    'base_url' => $baseUrl,
    'summary' => [
        'total' => $totalTests,
        'passed' => $passedTests,
        'failed' => $failedTests,
        'success_rate' => round(($passedTests / $totalTests) * 100, 2)
    ],
    'results' => $testResults,
    'broken_endpoints' => array_values($brokenEndpoints)
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo colorOutput("📄 Report saved to: ", 'white') . colorOutput($reportFile, 'yellow') . "\n\n";
