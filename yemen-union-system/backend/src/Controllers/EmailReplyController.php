<?php

namespace App\Controllers;

use App\Config\Database;
use App\Helpers\ResponseHelper;
use App\Services\SystemLogger;
use PDO;

class EmailReplyController {

    /**
     * Fetch email replies from Outlook via IMAP
     * Endpoint: /api/email-replies/fetch
     */
    public function fetchReplies() {
        $imapHost = $_ENV['IMAP_HOST'] ?? 'outlook.office365.com:993/imap/ssl';
        $imapUser = $_ENV['IMAP_USERNAME'] ?? $_ENV['MAIL_USERNAME'] ?? '';
        $imapPass = $_ENV['IMAP_PASSWORD'] ?? $_ENV['MAIL_PASSWORD'] ?? '';

        if (empty($imapUser) || empty($imapPass)) {
            SystemLogger::getInstance()->error('email_fetch', 'config_missing', 'IMAP credentials missing');
            return ResponseHelper::jsonResponse(['success' => false, 'message' => 'IMAP credentials not configured'], 500);
        }

        if (!function_exists('imap_open')) {
            SystemLogger::getInstance()->critical('email_fetch', 'extension_missing', 'PHP IMAP extension not installed');
            return ResponseHelper::jsonResponse(['success' => false, 'message' => 'PHP IMAP extension missing'], 500);
        }

        $mbox = @imap_open("{" . $imapHost . "}INBOX", $imapUser, $imapPass);

        if (!$mbox) {
            $error = imap_last_error();
            SystemLogger::getInstance()->error('email_fetch', 'connection_failed', 'IMAP connection failed: ' . $error);
            return ResponseHelper::jsonResponse(['success' => false, 'message' => 'IMAP connection failed'], 500);
        }

        // Search unread emails
        $emails = imap_search($mbox, 'UNSEEN');

        if (!$emails) {
            imap_close($mbox);
            return ResponseHelper::jsonResponse(['success' => true, 'message' => 'No new replies', 'count' => 0]);
        }

        $db = Database::getInstance();
        $count = 0;

        foreach ($emails as $emailId) {
            try {
                $overview = imap_fetch_overview($mbox, $emailId, 0);
                $structure = imap_fetchstructure($mbox, $emailId);
                
                if (!isset($overview[0])) continue;
                
                $header = $overview[0];
                $subject = $header->subject ?? '(No Subject)';
                $from = $header->from;
                $date = date('Y-m-d H:i:s', strtotime($header->date));
                
                // Extract email address
                preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $from, $matches);
                $senderEmail = $matches[0] ?? '';

                if (!$senderEmail) continue;

                // Get Body
                $message = $this->getEmailBody($mbox, $emailId, $structure);
                $cleanMessage = $this->cleanReplyBody($message);

                // Find User
                $stmt = $db->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
                $stmt->execute([$senderEmail]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($user) {
                    // Store in DB
                    $insert = $db->prepare("INSERT INTO email_replies (user_id, sender_email, subject, message, created_at) VALUES (?, ?, ?, ?, ?)");
                    $insert->execute([$user['id'], $senderEmail, $subject, $cleanMessage, $date]);
                    
                    $count++;
                    
                    // imap_setflag_full($mbox, $emailId, "\\Seen");
                } else {
                    SystemLogger::getInstance()->info('email_fetch', 'unknown_sender', "Reply from unknown email: $senderEmail");
                }
            } catch (\Throwable $e) {
                SystemLogger::getInstance()->error('email_fetch', 'processing_error', "Error processing email $emailId: " . $e->getMessage());
                continue;
            }
        }

        imap_close($mbox);

        return ResponseHelper::jsonResponse([
            'success' => true, 
            'message' => "Processed $count replies",
            'count' => $count
        ]);
    }

    /**
     * Get all email replies with user info
     * Endpoint: /api/email-replies/list
     */
    public function listReplies() {
        $db = Database::getInstance();
        
        // Get query parameters
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $perPage = 20;
        $offset = ($page - 1) * $perPage;
        $search = $_GET['search'] ?? '';
        
        // Build query
        $whereClause = '';
        $params = [];
        
        if (!empty($search)) {
            $whereClause = "WHERE (er.subject LIKE ? OR er.message LIKE ? OR er.sender_email LIKE ? OR u.full_name LIKE ?)";
            $searchParam = "%{$search}%";
            $params = [$searchParam, $searchParam, $searchParam, $searchParam];
        }
        
        // Get total count
        $countStmt = $db->prepare("
            SELECT COUNT(*) as total 
            FROM email_replies er
            LEFT JOIN users u ON er.user_id = u.id
            {$whereClause}
        ");
        $countStmt->execute($params);
        $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        
        // Get replies with user info
        $stmt = $db->prepare("
            SELECT 
                er.id,
                er.user_id,
                er.sender_email,
                er.subject,
                er.message,
                er.created_at,
                u.full_name,
                u.phone_number,
                u.email as user_email
            FROM email_replies er
            LEFT JOIN users u ON er.user_id = u.id
            {$whereClause}
            ORDER BY er.created_at DESC
            LIMIT ? OFFSET ?
        ");
        
        $params[] = $perPage;
        $params[] = $offset;
        $stmt->execute($params);
        $replies = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format replies
        $formattedReplies = array_map(function($reply) {
            return [
                'id' => (int)$reply['id'],
                'user_id' => (int)$reply['user_id'],
                'sender_email' => $reply['sender_email'],
                'subject' => $reply['subject'],
                'message' => $reply['message'],
                'created_at' => $reply['created_at'],
                'user' => $reply['full_name'] ? [
                    'id' => (int)$reply['user_id'],
                    'full_name' => $reply['full_name'],
                    'phone_number' => $reply['phone_number'],
                    'email' => $reply['user_email']
                ] : null
            ];
        }, $replies);
        
        return ResponseHelper::jsonResponse([
            'success' => true,
            'data' => $formattedReplies,
            'pagination' => [
                'total' => (int)$total,
                'page' => $page,
                'per_page' => $perPage,
                'total_pages' => ceil($total / $perPage)
            ]
        ]);
    }

    /**
     * Get replies for a specific user
     * Endpoint: /api/users/{id}/replies
     */
    public function getRepliesByUser($userId) {
        $db = Database::getInstance();
        
        $stmt = $db->prepare("
            SELECT * FROM email_replies 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        ");
        $stmt->execute([$userId]);
        $replies = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return ResponseHelper::jsonResponse(['data' => $replies]);
    }

    // Helper to get email body
    private function getEmailBody($mbox, $emailId, $structure) {
        $body = '';
        
        // Simple structure check - try to get text/plain
        if (isset($structure->parts) && count($structure->parts)) {
            for ($i = 0; $i < count($structure->parts); $i++) {
                $part = $structure->parts[$i];
                if ($part->subtype == 'PLAIN') {
                    $body = imap_fetchbody($mbox, $emailId, $i + 1);
                    break;
                }
            }
            // Fallback for no PLAIN part (HTML only)
            if (empty($body)) {
                $body = imap_fetchbody($mbox, $emailId, 1);
                $body = strip_tags($body);
            }
        } else {
            $body = imap_body($mbox, $emailId);
        }

        // Decode
        if ($structure->encoding == 3) {
            $body = base64_decode($body);
        } elseif ($structure->encoding == 4) {
            $body = quoted_printable_decode($body);
        }

        return $body;
    }

    // Helper to clean reply quotes
    private function cleanReplyBody($text) {
        // Remove Outlook/Gmail quote headers like "On ... wrote:" or "-----Original Message-----"
        
        $lines = explode("\n", $text);
        $cleanLines = [];
        
        foreach ($lines as $line) {
            $trimLine = trim($line);
            
            // Stop at common quote indicators
            if (preg_match('/^On\s.*wrote:$/i', $trimLine) || 
                preg_match('/^From:\s/i', $trimLine) || 
                strpos($trimLine, '-----Original Message-----') !== false ||
                strpos($trimLine, '> ') === 0) { // Standard quote char
                break;
            }
            
            $cleanLines[] = $line;
        }
        
        return trim(implode("\n", $cleanLines));
    }
}
