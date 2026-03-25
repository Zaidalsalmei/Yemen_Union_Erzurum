<?php
require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$mailer = new \App\Services\MailerService();
$email = 'ixruz79@gmail.com'; // Try sending to self first
$subject = "TEST EMAIL - Yemen Union System";
$body = "<h2>Test successful!</h2><p>This is a test email to verify SMTP configuration.</p>";

$success = $mailer->sendEmail($email, $subject, $body, true);
if ($success) {
    echo "SUCCESS: Email sent to $email\n";
} else {
    echo "FAILURE: Could not send email. Check logs.\n";
}
