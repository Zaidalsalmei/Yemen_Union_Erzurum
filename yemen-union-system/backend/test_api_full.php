<?php

// 1. Login to get token
$loginUrl = 'http://localhost:8000/api/auth/login';
$postData = json_encode(['email' => 'admin@yemen.org', 'password' => 'password']);

$ch = curl_init($loginUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$resp = curl_exec($ch);
curl_close($ch);

$data = json_decode($resp, true);
$token = $data['data']['token'] ?? '';

if (!$token) {
    echo "Login failed!\n";
    print_r($data);
    exit;
}

// 2. Call /users search
$searchUrl = 'http://localhost:8000/api/users?search=Ahmed&per_page=5';
$ch2 = curl_init($searchUrl);
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch2, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json'
]);
$resp2 = curl_exec($ch2);
echo "Response for Search:\n";
echo $resp2 . "\n";

