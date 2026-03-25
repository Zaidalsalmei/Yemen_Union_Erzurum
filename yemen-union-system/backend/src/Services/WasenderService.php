<?php

namespace App\Services;

use GuzzleHttp\Client;

class WasenderService
{
    protected Client $client;
    protected string $apiKey;
    protected string $baseUrl;

    public function __construct()
    {
        $this->client = new Client(['verify' => false]);
        $key = $_ENV['WASENDER_API_KEY'] ?? $_SERVER['WASENDER_API_KEY'] ?? getenv('WASENDER_API_KEY');
        $this->apiKey = $key ?: 'fdf0fdc134e2e551c63088c6a83287a5b79d6257ad9973a87aeb2a4d3ac767c9';
        $this->baseUrl = 'https://wasenderapi.com/api';
    }

    /**
     * Send a WhatsApp message via Wasender API
     *
     * @param string $phoneNumber
     * @param string $message
     * @return bool
     */
    public function sendMessage(string $phoneNumber, string $message): array
    {
        try {
            $formattedPhone = $this->formatPhoneNumber($phoneNumber);
            
            $response = $this->client->post("{$this->baseUrl}/send-message", [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Content-Type'  => 'application/json'
                ],
                'json' => [
                    'to' => $formattedPhone,
                    'text' => $message
                ]
            ]);

            $statusCode = $response->getStatusCode();
            $body = json_decode((string) $response->getBody(), true);

            if ($statusCode >= 200 && $statusCode < 300) {
                return ['success' => true];
            }

            return ['success' => false, 'message' => 'API Error: ' . ($body['message'] ?? 'Unknown error')];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Exception: ' . $e->getMessage()];
        }
    }

    private function formatPhoneNumber(string $phone): string
    {
        // Remove spaces and dashes
        $phone = preg_replace('/[^\d]/', '', $phone);
        
        // If starts with 05, replace 0 with 90 (Turkey)
        if (str_starts_with($phone, '05')) {
            return '9' . $phone;
        }
        
        // If starts with 5, assume Turkey and prepend 90
        if (str_starts_with($phone, '5') && strlen($phone) === 10) {
            return '90' . $phone;
        }

        return $phone;
    }
}
