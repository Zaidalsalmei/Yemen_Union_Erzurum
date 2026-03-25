<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/auth/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'phone_number' => '05376439960',
    'password' => 'Admin@123456'
]));
$response = curl_exec($ch);
curl_close($ch);
$data = json_decode($response, true);
$token = $data['data']['token'];

echo "Testing endpoints:\n\n";

$tests = [
    '/api/settings/system',
    '/api/dashboard',
    '/api/users',
    '/api/roles',
    '/api/permissions'
];

foreach ($tests as $endpoint) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000' . $endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        "Authorization: Bearer $token"
    ]);
    $response = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $status = $code === 200 ? '✅' : '❌';
    echo "$status [$code] $endpoint\n";
}
