<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Helpers\ResponseHelper;
use PDO;
use Exception;

class SettingsController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = \App\Core\Database::getInstance()->getConnection();
    }

    /**
     * Get all settings grouped by category
     */
    public function index(Request $request): array
    {
        try {
            $stmt = $this->db->query("SELECT * FROM settings ORDER BY category, setting_key");
            $settings = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $grouped = [];
            foreach ($settings as $setting) {
                $category = $setting['category'] ?? 'general';
                if (!isset($grouped[$category])) {
                    $grouped[$category] = [];
                }
                $grouped[$category][] = $setting;
            }

            return ResponseHelper::success('تم استرجاع الإعدادات بنجاح', $grouped);
        } catch (Exception $e) {
            return ResponseHelper::error('خطأ في استرجاع الإعدادات: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update multiple settings
     */
    public function update(Request $request): array
    {
        try {
            $data = $request->all();
            if (empty($data)) {
                return ResponseHelper::error('لا توجد بيانات لتحديثها');
            }

            $this->db->beginTransaction();

            $stmt = $this->db->prepare("UPDATE settings SET setting_value = :value, updated_at = NOW() WHERE setting_key = :key");

            foreach ($data as $key => $value) {
                if (is_array($value) || is_object($value)) {
                    $value = json_encode($value, JSON_UNESCAPED_UNICODE);
                }
                $stmt->execute(['value' => $value, 'key' => $key]);
            }

            $this->db->commit();
            return ResponseHelper::success('تم تحديث الإعدادات بنجاح');
        } catch (Exception $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            return ResponseHelper::error('خطأ في التحديث: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update branding settings Specifically
     */
    public function updateBranding(Request $request): array
    {
        return $this->update($request);
    }

    /**
     * Upload Logo
     */
    public function uploadLogo(Request $request): array
    {
        try {
            $file = $_FILES['logo'] ?? null;
            if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
                return ResponseHelper::error('يرجى اختيار صورة صحيحة');
            }

            // Validation
            $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            $fileType = mime_content_type($file['tmp_name']);
            if (!in_array($fileType, $allowedTypes)) {
                return ResponseHelper::error('نوع الملف غير مدعوم. المسموح: JPG, PNG, WEBP, GIF');
            }

            $maxSize = 2 * 1024 * 1024; // 2MB for logo
            if ($file['size'] > $maxSize) {
                return ResponseHelper::error('حجم الصورة كبير جداً. الحد الأقصى 2 ميجابايت');
            }

            // Create dir
            $uploadDir = __DIR__ . '/../../public/uploads/general';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = 'logo_' . time() . '.' . $extension;
            $targetPath = $uploadDir . '/' . $filename;

            if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                $logoUrl = '/uploads/general/' . $filename;
                
                // Update in DB
                $stmt = $this->db->prepare("UPDATE settings SET setting_value = :val, updated_at = NOW() WHERE setting_key = 'logo_path'");
                $stmt->execute(['val' => $logoUrl]);

                return ResponseHelper::success('تم رفع الشعار بنجاح', ['logo_path' => $logoUrl]);
            }

            return ResponseHelper::error('فشل في حفظ الصورة على السيرفر');
        } catch (Exception $e) {
            return ResponseHelper::error('حدث خطأ: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Remove Logo
     */
    public function removeLogo(): array
    {
        try {
            // Get current logo path
            $stmt = $this->db->prepare("SELECT setting_value FROM settings WHERE setting_key = 'logo_path'");
            $stmt->execute();
            $currentLogo = $stmt->fetchColumn();

            if ($currentLogo && strpos($currentLogo, '/uploads/') === 0) {
                $filePath = __DIR__ . '/../../public' . $currentLogo;
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
            }

            $stmt = $this->db->prepare("UPDATE settings SET setting_value = NULL, updated_at = NOW() WHERE setting_key = 'logo_path'");
            $stmt->execute();

            return ResponseHelper::success('تم إزالة الشعار بنجاح');
        } catch (Exception $e) {
            return ResponseHelper::error('حدث خطأ: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get branding settings specifically
     */
    public function getBranding(): array
    {
        return $this->getByCategory('branding');
    }

    /**
     * Get system settings specifically
     */
    public function getSystem(): array
    {
        return $this->getByCategory('system');
    }

    /**
     * Update system settings specifically
     */
    public function updateSystem(Request $request): array
    {
        return $this->update($request);
    }

    private function getByCategory(string $category): array
    {
        try {
            $stmt = $this->db->prepare("SELECT setting_key, setting_value FROM settings WHERE category = :cat");
            $stmt->execute(['cat' => $category]);
            $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
            return ResponseHelper::success("إعدادات $category", $settings);
        } catch (Exception $e) {
            return ResponseHelper::error('خطأ: ' . $e->getMessage());
        }
    }
}
