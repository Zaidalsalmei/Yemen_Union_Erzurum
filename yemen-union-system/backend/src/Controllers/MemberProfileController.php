<?php
/**
 * Member Profile Controller
 * Allows members to update their own profile
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Helpers\ResponseHelper;
use App\Helpers\ValidationHelper;
use PDO;

class MemberProfileController
{
    private PDO $db;
    private string $uploadDir = 'uploads/profiles/';
    
    public function __construct()
    {
        $this->db = \App\Core\Database::getInstance()->getConnection();
        
        // Ensure upload directory exists
        $fullPath = dirname(__DIR__, 3) . '/public/' . $this->uploadDir;
        if (!is_dir($fullPath)) {
            mkdir($fullPath, 0755, true);
        }
    }
    
    /**
     * PUT /api/member/profile
     * Update member's own profile
     */
    public function update(Request $request): array
    {
        // Get authenticated user ID
        $userId = $request->user['id'] ?? null;
        
        if (!$userId) {
            return ResponseHelper::error('غير مصرح', 401);
        }
        
        try {
            // Get current user data
            $stmt = $this->db->prepare("
                SELECT id, full_name, email, profile_photo 
                FROM users 
                WHERE id = :user_id AND deleted_at IS NULL
            ");
            $stmt->execute(['user_id' => $userId]);
            $currentUser = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$currentUser) {
                return ResponseHelper::error('المستخدم غير موجود', 404);
            }
            
            // Get request data
            $data = $request->all();
            
            // Validate input
            $validation = $this->validateProfileData($data, $userId, $currentUser['email']);
            if (!$validation['valid']) {
                return ResponseHelper::error($validation['message'], 400);
            }
            
            // Handle profile photo upload
            $profilePhotoUrl = $currentUser['profile_photo'];
            if ($request->hasFile('profile_photo')) {
                $uploadResult = $this->handlePhotoUpload($request->file('profile_photo'));
                if ($uploadResult['success']) {
                    // Delete old photo if exists
                    if ($profilePhotoUrl && file_exists(dirname(__DIR__, 3) . '/public' . $profilePhotoUrl)) {
                        unlink(dirname(__DIR__, 3) . '/public' . $profilePhotoUrl);
                    }
                    $profilePhotoUrl = $uploadResult['url'];
                } else {
                    return ResponseHelper::error($uploadResult['message'], 400);
                }
            }
            
            // Update user profile
            $stmt = $this->db->prepare("
                UPDATE users 
                SET 
                    full_name = :full_name,
                    email = :email,
                    city = :city,
                    university = :university,
                    faculty = :faculty,
                    profile_photo = :profile_photo,
                    updated_at = NOW()
                WHERE id = :user_id
            ");
            
            $stmt->execute([
                'full_name' => $data['full_name'] ?? $currentUser['full_name'],
                'email' => $data['email'] ?? $currentUser['email'],
                'city' => $data['city'] ?? null,
                'university' => $data['university'] ?? null,
                'faculty' => $data['faculty'] ?? null,
                'profile_photo' => $profilePhotoUrl,
                'user_id' => $userId
            ]);
            
            // Get updated user data
            $stmt = $this->db->prepare("
                SELECT id, full_name, email, city, university, faculty, profile_photo
                FROM users 
                WHERE id = :user_id
            ");
            $stmt->execute(['user_id' => $userId]);
            $updatedUser = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return ResponseHelper::success('تم تحديث البيانات بنجاح', [
                'user' => $updatedUser
            ]);
            
        } catch (\Exception $e) {
            error_log("Profile Update Error: " . $e->getMessage());
            return ResponseHelper::error('حدث خطأ في تحديث البيانات', 500);
        }
    }
    
    /**
     * Validate profile update data
     */
    private function validateProfileData(array $data, int $userId, ?string $currentEmail): array
    {
        // Validate full_name
        if (isset($data['full_name'])) {
            if (empty(trim($data['full_name']))) {
                return ['valid' => false, 'message' => 'الاسم الكامل مطلوب'];
            }
            if (mb_strlen($data['full_name']) > 255) {
                return ['valid' => false, 'message' => 'الاسم الكامل طويل جداً (الحد الأقصى 255 حرف)'];
            }
        }
        
        // Validate email
        if (isset($data['email']) && !empty($data['email'])) {
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                return ['valid' => false, 'message' => 'البريد الإلكتروني غير صحيح'];
            }
            
            // Check if email is already taken by another user
            if ($data['email'] !== $currentEmail) {
                $stmt = $this->db->prepare("
                    SELECT id FROM users 
                    WHERE email = :email AND id != :user_id AND deleted_at IS NULL
                ");
                $stmt->execute(['email' => $data['email'], 'user_id' => $userId]);
                if ($stmt->fetch()) {
                    return ['valid' => false, 'message' => 'البريد الإلكتروني مستخدم من قبل عضو آخر'];
                }
            }
        }
        
        // Validate city
        if (isset($data['city']) && !empty($data['city'])) {
            if (mb_strlen($data['city']) > 100) {
                return ['valid' => false, 'message' => 'اسم المدينة طويل جداً (الحد الأقصى 100 حرف)'];
            }
        }
        
        // Validate university
        if (isset($data['university']) && !empty($data['university'])) {
            if (mb_strlen($data['university']) > 255) {
                return ['valid' => false, 'message' => 'اسم الجامعة طويل جداً (الحد الأقصى 255 حرف)'];
            }
        }
        
        // Validate faculty
        if (isset($data['faculty']) && !empty($data['faculty'])) {
            if (mb_strlen($data['faculty']) > 255) {
                return ['valid' => false, 'message' => 'اسم الكلية طويل جداً (الحد الأقصى 255 حرف)'];
            }
        }
        
        return ['valid' => true];
    }
    
    /**
     * Handle profile photo upload
     */
    private function handlePhotoUpload(array $file): array
    {
        // Validate file
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'message' => 'حدث خطأ في رفع الملف'];
        }
        
        // Validate file size (max 2MB)
        $maxSize = 2 * 1024 * 1024; // 2MB
        if ($file['size'] > $maxSize) {
            return ['success' => false, 'message' => 'حجم الصورة كبير جداً (الحد الأقصى 2 ميجابايت)'];
        }
        
        // Validate file type
        $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!in_array($mimeType, $allowedTypes)) {
            return ['success' => false, 'message' => 'نوع الملف غير مدعوم (يُسمح بـ JPG, PNG, WEBP فقط)'];
        }
        
        // Get file extension
        $extension = '';
        switch ($mimeType) {
            case 'image/jpeg':
            case 'image/jpg':
                $extension = 'jpg';
                break;
            case 'image/png':
                $extension = 'png';
                break;
            case 'image/webp':
                $extension = 'webp';
                break;
        }
        
        // Generate unique filename
        $filename = uniqid('profile_', true) . '.' . $extension;
        $fullPath = dirname(__DIR__, 3) . '/public/' . $this->uploadDir . $filename;
        
        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $fullPath)) {
            return ['success' => false, 'message' => 'فشل حفظ الملف'];
        }
        
        // Return URL
        $url = '/' . $this->uploadDir . $filename;
        
        return ['success' => true, 'url' => $url];
    }
}
