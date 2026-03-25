<?php
// Simple script to test IMAP connection
require_once __DIR__ . '/vendor/autoload.php';

// Load .env manually
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && substr($line, 0, 1) !== '#') {
            list($name, $value) = explode('=', $line, 2);
            $_ENV[$name] = trim($value);
        }
    }
}

$host = $_ENV['IMAP_HOST'] ?? '';
$user = $_ENV['IMAP_USERNAME'] ?? '';
$pass = $_ENV['IMAP_PASSWORD'] ?? '';

echo "Testing IMAP Connection...\n";
echo "Host: $host\n";
echo "User: $user\n";
echo "Pass: " . substr($pass, 0, 3) . "***\n\n";

if (!function_exists('imap_open')) {
    die("Error: PHP IMAP extension is NOT installed.\n");
}

$mbox = @imap_open("{" . $host . "}INBOX", $user, $pass);

if ($mbox) {
    echo "✅ Success! Connected to IMAP server.\n";
    $stm = imap_check($mbox);
    echo "Messages: " . $stm->Nmsgs . "\n";
    imap_close($mbox);
} else {
    echo "❌ Connection Failed.\n";
    echo "Error: " . imap_last_error() . "\n";
    echo "Common reasons:\n";
    echo "1. Email address matches the App Password account?\n";
    echo "2. 'Less secure apps' enabled (if not using App Passwords)?\n";
    echo "3. Firewall blocking port 993?\n";
}
