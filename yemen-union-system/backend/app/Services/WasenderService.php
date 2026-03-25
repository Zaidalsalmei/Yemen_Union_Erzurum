<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class WasenderService
{
    protected $client;
    protected $apiKey;
    protected $baseUrl;

    public function __construct()
    {
        $this->client = new Client();
        $this->apiKey = 'fdf0fdc134e2e551c63088c6a83287a5b79d6257ad9973a87aeb2a4d3ac767c9';
        $this->baseUrl = 'https://wasenderapi.com/api';
    }

    /**
     * Send a WhatsApp message via Wasender API
     *
     * @param string $phoneNumber
     * @param string $message
     * @return bool
     */
    public function sendMessage($phoneNumber, $message)
    {
        try {
            $response = $this->client->post("{$this->baseUrl}/send-message", [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Content-Type'  => 'application/json'
                ],
                'json' => [
                    'to' => $phoneNumber,
                    'text' => $message
                ]
            ]);

            $statusCode = $response->getStatusCode();
            $body = json_decode($response->getBody(), true);

            if ($statusCode >= 200 && $statusCode < 300) {
                return true;
            }

            Log::error('Wasender API Error: ' . json_encode($body));
            return false;
        } catch (\Exception $e) {
            Log::error('Wasender API Exception: ' . $e->getMessage());
            return false;
        }
    }
}
