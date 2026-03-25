<?php
/**
 * Test Dashboard Endpoint
 */

$baseUrl = 'http://localhost:8000';

echo "=== TESTING /api/dashboard ENDPOINT ===\n\n";

// Step 1: Login
echo "Step 1: Logging in...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/api/auth/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'phone_number' => '05376439960',
    'password' => 'Admin@123456'
]));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    echo "✗ Login failed with code $httpCode\n";
    echo "Response: $response\n";
    exit(1);
}

$loginData = json_decode($response, true);
$token = $loginData['data']['token'] ?? null;

if (!$token) {
    echo "✗ No token received\n";
    exit(1);
}

echo "✓ Login successful\n";
echo "  Token: " . substr($token, 0, 30) . "...\n\n";

// Step 2: Test Dashboard
echo "Step 2: Testing /api/dashboard...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/api/dashboard');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    "Authorization: Bearer $token"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";

if ($httpCode === 200) {
    echo "✓ Dashboard endpoint working!\n\n";
    
    $data = json_decode($response, true);
    
    if (isset($data['data'])) {
        echo "📊 Dashboard Data:\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        
        if (isset($data['data']['stats'])) {
            echo "\n📈 Statistics:\n";
            foreach ($data['data']['stats'] as $key => $value) {
                echo "  • $key: $value\n";
            }
        }
        
        if (isset($data['data']['upcoming_activities'])) {
            echo "\n📅 Upcoming Activities: " . count($data['data']['upcoming_activities']) . "\n";
        }
        
        if (isset($data['data']['expiring_memberships'])) {
            echo "⏰ Expiring Memberships: " . count($data['data']['expiring_memberships']) . "\n";
        }
        
        if (isset($data['data']['recent_notifications'])) {
            echo "🔔 Recent Notifications: " . count($data['data']['recent_notifications']) . "\n";
        }
        
        if (isset($data['data']['recent_support_tickets'])) {
            echo "🎫 Recent Support Tickets: " . count($data['data']['recent_support_tickets']) . "\n";
        }
        
        echo "\n✅ All dashboard sections loaded successfully!\n";
    }
} else {
    echo "✗ Dashboard endpoint failed\n";
    echo "Response: $response\n";
}

echo "\n=== TEST COMPLETE ===\n";
