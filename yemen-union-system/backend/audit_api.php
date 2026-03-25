<?php
/**
 * API Endpoint Audit Script
 * Tests all critical API endpoints
 */

$baseUrl = 'http://localhost:8000';
$results = [];

function testEndpoint($method, $url, $data = null, $token = null) {
    $ch = curl_init();
    
    $headers = ['Content-Type: application/json'];
    if ($token) {
        $headers[] = "Authorization: Bearer $token";
    }
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'code' => $httpCode,
        'response' => json_decode($response, true),
        'raw' => $response
    ];
}

echo "=== API ENDPOINT AUDIT ===\n\n";

// Test public endpoints
echo "📡 PUBLIC ENDPOINTS:\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

$publicTests = [
    ['GET', '/api/health', null, 'Health Check'],
    ['GET', '/api/settings/branding', null, 'Branding Settings'],
    ['GET', '/api/settings/system', null, 'System Settings'],
];

foreach ($publicTests as [$method, $path, $data, $name]) {
    $result = testEndpoint($method, $baseUrl . $path, $data);
    $status = $result['code'] === 200 ? '✓' : '✗';
    echo "$status [$result[code]] $name ($path)\n";
    
    if ($result['code'] !== 200) {
        echo "   Error: " . ($result['response']['message'] ?? 'Unknown') . "\n";
    }
}

echo "\n";

// Test authentication
echo "🔐 AUTHENTICATION:\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

$loginResult = testEndpoint('POST', $baseUrl . '/api/auth/login', [
    'phone_number' => '05376439960',
    'password' => 'Admin@123456'
]);

if ($loginResult['code'] === 200 && isset($loginResult['response']['data']['token'])) {
    $token = $loginResult['response']['data']['token'];
    echo "✓ [200] Login Successful\n";
    echo "  Token: " . substr($token, 0, 20) . "...\n";
} else {
    echo "✗ [" . $loginResult['code'] . "] Login Failed\n";
    echo "  " . ($loginResult['response']['message'] ?? 'Unknown error') . "\n";
    $token = null;
}

echo "\n";

if ($token) {
    echo "🔒 PROTECTED ENDPOINTS:\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    
    $protectedTests = [
        ['GET', '/api/auth/me', null, 'Get Current User'],
        ['GET', '/api/dashboard', null, 'Admin Dashboard'],
        ['GET', '/api/users', null, 'List Users'],
        ['GET', '/api/activities', null, 'List Activities'],
        ['GET', '/api/memberships', null, 'List Memberships'],
        ['GET', '/api/settings', null, 'Get Settings'],
        ['GET', '/api/roles', null, 'List Roles'],
        ['GET', '/api/permissions', null, 'List Permissions'],
    ];
    
    foreach ($protectedTests as [$method, $path, $data, $name]) {
        $result = testEndpoint($method, $baseUrl . $path, $data, $token);
        $status = $result['code'] === 200 ? '✓' : '✗';
        echo "$status [$result[code]] $name ($path)\n";
        
        if ($result['code'] !== 200) {
            echo "   Error: " . ($result['response']['message'] ?? 'Unknown') . "\n";
        }
    }
}

echo "\n=== AUDIT COMPLETE ===\n";
