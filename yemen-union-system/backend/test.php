<?php
// Simple test script to debug API
error_reporting(E_ALL);
ini_set('display_errors', '1');

$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['REQUEST_URI'] = '/api/auth/login';
$_SERVER['HTTP_HOST'] = 'localhost:8080';
$_SERVER['CONTENT_TYPE'] = 'application/json';

// Simulate POST body
$loginData = json_encode([
    'phone_number' => '05001234567',
    'password' => 'Admin@123'
]);

// Create a temporary file to act as php://input
$inputStream = fopen('php://memory', 'r+');
fwrite($inputStream, $loginData);
rewind($inputStream);

// Store original php://input content
$GLOBALS['_PHP_INPUT_OVERRIDE'] = $loginData;

require 'public/index.php';
