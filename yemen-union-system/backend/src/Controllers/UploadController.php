<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Helpers\ResponseHelper;

class UploadController
{
    // مجلد الرفع الأساسي
    private string $uploadDir;
    
    public function __construct()
    {
        // المسار المطلق لمجلد uploads
        // الهيكل: backend/src/Controllers/UploadController.php -> backend/public/uploads
        $this->uploadDir = dirname(__DIR__, 2) . '/public/uploads';
    }

    /**
     * POST /api/upload/image
     * رفع صورة واحدة (للبروفايل، المنشورات، الأنشطة، الإيصالات)
     */
    public function uploadImage(Request $request): array
    {
        try {
            // تحقق من وجود ملف
            if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
                $errorMessages = [
                    UPLOAD_ERR_INI_SIZE => 'حجم الملف أكبر من الحد المسموح',
                    UPLOAD_ERR_FORM_SIZE => 'حجم الملف أكبر من الحد المسموح',
                    UPLOAD_ERR_PARTIAL => 'لم يتم رفع الملف بالكامل',
                    UPLOAD_ERR_NO_FILE => 'لم يتم اختيار ملف',
                    UPLOAD_ERR_NO_TMP_DIR => 'مجلد مؤقت غير موجود',
                    UPLOAD_ERR_CANT_WRITE => 'فشل في كتابة الملف',
                ];
                $errorCode = $_FILES['image']['error'] ?? UPLOAD_ERR_NO_FILE;
                $msg = $errorMessages[$errorCode] ?? 'خطأ في رفع الملف';
                return ResponseHelper::error($msg, 400);
            }

            $file = $_FILES['image'];
            
            // تحقق من نوع الملف
            $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            if (!$finfo) {
                return ResponseHelper::error('فشل في التعرف على نوع الملف', 500);
            }
            $mimeType = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);

            if (!in_array($mimeType, $allowedTypes)) {
                return ResponseHelper::error('نوع الملف غير مدعوم. المسموح: JPG, PNG, WebP, GIF', 400);
            }

            // تحقق من الحجم (5MB كحد أقصى)
            $maxSize = 5 * 1024 * 1024; // 5MB
            if ($file['size'] > $maxSize) {
                return ResponseHelper::error('حجم الملف أكبر من 5 ميجابايت', 400);
            }

            // تحديد المجلد الفرعي حسب النوع
            $folder = $request->input('folder') ?? 'profiles';
            // المجلدات المسموحة
            $allowedFolders = ['profiles', 'posts', 'activities', 'receipts', 'general'];
            if (!in_array($folder, $allowedFolders)) {
                $folder = 'general';
            }

            $targetDir = $this->uploadDir . '/' . $folder;

            // إنشاء المجلد إذا غير موجود
            if (!is_dir($targetDir)) {
                mkdir($targetDir, 0755, true);
            }

            // توليد اسم فريد
            $extension = match ($mimeType) {
                'image/jpeg' => 'jpg',
                'image/png' => 'png',
                'image/webp' => 'webp',
                'image/gif' => 'gif',
                default => 'jpg'
            };
            $fileName = $folder . '_' . time() . '_' . bin2hex(random_bytes(8)) . '.' . $extension;
            $filePath = $targetDir . '/' . $fileName;

            // نقل الملف
            // ضغط الصورة قبل الحفظ إن كانت JPEG
            if ($mimeType === 'image/jpeg' && function_exists('imagecreatefromjpeg')) {
                $image = imagecreatefromjpeg($file['tmp_name']);
                if ($image) {
                    imagejpeg($image, $filePath, 80);
                    imagedestroy($image);
                } else {
                    move_uploaded_file($file['tmp_name'], $filePath);
                }
            } else {
                move_uploaded_file($file['tmp_name'], $filePath);
            }

            // الرابط النسبي (للحفظ في قاعدة البيانات)
            $relativePath = '/uploads/' . $folder . '/' . $fileName;

            return ResponseHelper::success('تم رفع الصورة بنجاح', [
                'url' => $relativePath,
                'full_url' => $relativePath,
                'file_name' => $fileName,
                'size' => $file['size'],
                'mime_type' => $mimeType
            ]);

        } catch (\Exception $e) {
            error_log("UploadController::uploadImage error: " . $e->getMessage());
            return ResponseHelper::error('خطأ في رفع الصورة: ' . $e->getMessage(), 500);
        }
    }

    /**
     * DELETE /api/upload/image
     * حذف صورة
     */
    public function deleteImage(Request $request): array
    {
        try {
            $url = $request->input('url');
            if (!$url) {
                return ResponseHelper::error('رابط الصورة مطلوب', 400);
            }

            // تحقق أمان: يجب أن يبدأ بـ /uploads/
            if (strpos($url, '/uploads/') !== 0) {
                return ResponseHelper::error('رابط غير صالح أو غير مسموح بحذفه', 400);
            }

            // المسار المطلق
            $fullPath = dirname(__DIR__, 2) . '/public' . $url;

            // التأكد من عدم المحاولة لحذف ملف خارج مجلد المرفوعات
            $realPath = realpath($fullPath);
            $uploadsRoot = realpath($this->uploadDir);
            
            if ($realPath && strpos($realPath, $uploadsRoot) === 0 && file_exists($realPath)) {
                if (is_file($realPath)) {
                    unlink($realPath);
                }
            }

            return ResponseHelper::success('تم حذف الصورة من السيرفر بنجاح', null);
        } catch (\Exception $e) {
            error_log("UploadController::deleteImage error: " . $e->getMessage());
            return ResponseHelper::error('خطأ في حذف الصورة', 500);
        }
    }
}
