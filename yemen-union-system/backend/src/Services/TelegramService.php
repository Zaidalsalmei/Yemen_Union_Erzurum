<?php
declare(strict_types=1);

namespace App\Services;

use Exception;

class TelegramService
{
    private string $botToken;
    private string $chatId;

    public function __construct()
    {
        $this->botToken = $_ENV['TELEGRAM_BOT_TOKEN'] ?? '';
        $this->chatId = $_ENV['TELEGRAM_CHAT_ID'] ?? '';
    }

    /**
     * Send a notification message to the administrator.
     */
    public function sendAdminNotification(string $message): array
    {
        if (empty($this->botToken) || empty($this->chatId)) {
            return ['success' => false, 'message' => 'Telegram configuration (Token/ChatID) missing in .env'];
        }

        $url = "https://api.telegram.org/bot{$this->botToken}/sendMessage";
        
        $data = [
            'chat_id' => $this->chatId,
            'text' => $message,
            'parse_mode' => 'HTML',
            'disable_web_page_preview' => true,
        ];

        try {
            $options = [
                'http' => [
                    'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
                    'method'  => 'POST',
                    'content' => http_build_query($data),
                    'timeout' => 10,
                ],
            ];

            $context = stream_context_create($options);
            $result = @file_get_contents($url, false, $context);

            if ($result === false) {
                // If standard method fails, try a quick error log
                error_log("Telegram API Error: Failed to connect to Telegram.");
                return ['success' => false, 'message' => 'Failed to reach Telegram API.'];
            }

            return ['success' => true, 'data' => json_decode($result, true)];
        } catch (Exception $e) {
            error_log("Telegram API Error exception: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}
