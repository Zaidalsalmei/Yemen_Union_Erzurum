<?php
declare(strict_types=1);

namespace App\Services;

// Load PHPMailer files manually (fallback for missing vendor)
if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
    require_once __DIR__ . '/../Libs/PHPMailer/Exception.php';
    require_once __DIR__ . '/../Libs/PHPMailer/PHPMailer.php';
    require_once __DIR__ . '/../Libs/PHPMailer/SMTP.php';
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class MailerService
{
    private string $mailHost;
    private string $mailPort;
    private string $mailUser;
    private string $mailPass;
    private string $mailFrom;
    private string $mailFromName;

    public function __construct()
    {
        $this->mailHost = $_ENV['MAIL_HOST'] ?? 'smtp.gmail.com';
        $this->mailPort = $_ENV['MAIL_PORT'] ?? '587';
        $this->mailUser = $_ENV['MAIL_USERNAME'] ?? '';
        $this->mailPass = $_ENV['MAIL_PASSWORD'] ?? '';
        $this->mailFrom = $_ENV['MAIL_FROM_ADDRESS'] ?? $this->mailUser;
        $this->mailFromName = $_ENV['MAIL_FROM_NAME'] ?? 'اتحاد الطلبة اليمنيين';
    }

    /**
     * Send email with verification code.
     */
    public function sendEmail(string $to, string $subject, string $body, bool $isHtml = true): bool
    {
        // Check if PHPMailer is available
        if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
            // Fallback to native mail() function
            $headers = "MIME-Version: 1.0" . "\r\n";
            $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
            $headers .= "From: <{$this->mailFrom}>" . "\r\n";
            
            error_log("PHPMailer class NOT FOUND, trying mail()");
            return mail($to, $subject, $body, $headers);
        }

        $mail = new PHPMailer(true);

        try {
            // Server settings
            $mail->isSMTP();
            $mail->CharSet = 'UTF-8';
            $mail->Host       = $this->mailHost;
            $mail->SMTPAuth   = true;
            $mail->Username   = $this->mailUser;
            $mail->Password   = $this->mailPass;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = (int)$this->mailPort;

            // Recipients
            $mail->setFrom($this->mailFrom, $this->mailFromName);
            $mail->addAddress($to);

            // Content
            $mail->isHTML($isHtml);
            $mail->Subject = $subject;
            $mail->Body    = $body;

            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log("PHPMailer Error: " . $e->getMessage() . " (ErrorInfo: " . $mail->ErrorInfo . ")");
            
            // Final fallback to mail() if SMTP fails
            $headers = "MIME-Version: 1.0" . "\r\n";
            $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
            $headers .= "From: <{$this->mailFrom}>" . "\r\n";
            
            $mailResult = mail($to, $subject, $body, $headers);
            if (!$mailResult) {
                error_log("Native mail() also failed for $to");
            }
            return $mailResult;
        }
    }
}
