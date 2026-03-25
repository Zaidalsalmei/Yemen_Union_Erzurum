<?php
/**
 * Academic Resources Controller
 * إدارة المحتوى الأكاديمي (ملاحظات، كتب، امتحانات...)
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Helpers\ResponseHelper;

class AcademicResourceController
{
    private ?\PDO $db = null;

    public function __construct()
    {
        try {
            $this->db = \App\Core\Database::getInstance()->getConnection();
        } catch (\Throwable $e) {}
    }

    // =====================================================
    // GET /api/academic-resources
    // قائمة المحتوى الأكاديمي مع فلترة وبحث
    // =====================================================
    public function index(Request $request): array
    {
        try {
            if (!$this->db) return ResponseHelper::error('خطأ في الاتصال', 500);

            $page       = max(1, (int) $request->query('page', 1));
            $perPage    = min((int) $request->query('per_page', 12), 50);
            $offset     = ($page - 1) * $perPage;

            $category   = $request->query('category', '');
            $university = $request->query('university', '');
            $faculty    = $request->query('faculty', '');
            $status     = $request->query('status', 'published');
            $search     = $request->query('search', '');

            $where = ['ar.deleted_at IS NULL'];
            $params = [];

            if ($category)   { $where[] = 'ar.category = ?';    $params[] = $category; }
            if ($university) { $where[] = 'ar.university LIKE ?'; $params[] = "%$university%"; }
            if ($faculty)    { $where[] = 'ar.faculty LIKE ?';  $params[] = "%$faculty%"; }
            if ($status)     { $where[] = 'ar.status = ?';      $params[] = $status; }
            if ($search)     { $where[] = '(ar.title LIKE ? OR ar.description LIKE ? OR ar.tags LIKE ?)';
                               $params[] = "%$search%"; $params[] = "%$search%"; $params[] = "%$search%"; }

            $whereSQL = implode(' AND ', $where);

            $orderMap = ['newest' => 'ar.created_at DESC', 'downloads' => 'ar.downloads_count DESC', 'views' => 'ar.views_count DESC'];
            $sort     = $orderMap[$request->query('sort', '')] ?? 'ar.created_at DESC';

            $stmt = $this->db->prepare("
                SELECT 
                    ar.id, ar.title, ar.description, ar.category,
                    ar.university, ar.faculty, ar.file_url, ar.file_type,
                    ar.file_size_kb, ar.thumbnail_url, ar.downloads_count,
                    ar.views_count, ar.status, ar.tags, ar.created_at,
                    COALESCE(u.full_name, 'غير معروف') as uploader_name,
                    u.profile_photo as uploader_photo
                FROM academic_resources ar
                LEFT JOIN users u ON ar.uploaded_by = u.id
                WHERE $whereSQL
                ORDER BY $sort
                LIMIT ? OFFSET ?
            ");
            $params[] = $perPage;
            $params[] = $offset;
            $stmt->execute($params);
            $resources = $stmt->fetchAll() ?: [];

            $countParams = array_slice($params, 0, -2);
            $countStmt = $this->db->prepare("SELECT COUNT(*) as total FROM academic_resources ar WHERE $whereSQL");
            $countStmt->execute($countParams);
            $total = (int) $countStmt->fetch()['total'];

            // الفئات المتاحة
            $catsStmt = $this->db->query("
                SELECT category, COUNT(*) as count 
                FROM academic_resources 
                WHERE deleted_at IS NULL AND status='published' AND category IS NOT NULL
                GROUP BY category ORDER BY count DESC
            ");
            $categories = $catsStmt ? $catsStmt->fetchAll() : [];

            return ResponseHelper::success('تم جلب المحتوى الأكاديمي', [
                'resources'  => $resources,
                'total'      => $total,
                'page'       => $page,
                'per_page'   => $perPage,
                'categories' => $categories,
            ]);
        } catch (\Throwable $e) {
            return ResponseHelper::error('فشل تحميل المحتوى: ' . $e->getMessage(), 500);
        }
    }

    // =====================================================
    // GET /api/academic-resources/{id}
    // عرض مورد أكاديمي واحد + زيادة عداد المشاهدات
    // =====================================================
    public function show(Request $request, int $id): array
    {
        try {
            if (!$this->db) return ResponseHelper::error('خطأ في الاتصال', 500);

            $stmt = $this->db->prepare("
                SELECT ar.*, COALESCE(u.full_name, 'غير معروف') as uploader_name
                FROM academic_resources ar
                LEFT JOIN users u ON ar.uploaded_by = u.id
                WHERE ar.id = ? AND ar.deleted_at IS NULL
            ");
            $stmt->execute([$id]);
            $resource = $stmt->fetch();

            if (!$resource) return ResponseHelper::error('المورد غير موجود', 404);

            // زيادة عداد المشاهدات
            $this->db->prepare("UPDATE academic_resources SET views_count = views_count + 1 WHERE id=?")->execute([$id]);

            return ResponseHelper::success('تم جلب المورد', $resource);
        } catch (\Throwable $e) {
            return ResponseHelper::error('فشل جلب المورد: ' . $e->getMessage(), 500);
        }
    }

    // =====================================================
    // POST /api/academic-resources
    // رفع مورد أكاديمي جديد
    // =====================================================
    public function store(Request $request): array
    {
        try {
            if (!$this->db) return ResponseHelper::error('خطأ في الاتصال', 500);

            $data = $request->body();
            if (empty($data['title'])) return ResponseHelper::error('عنوان المورد مطلوب', 422);
            if (empty($data['file_url']) && empty($data['description'])) {
                return ResponseHelper::error('رابط الملف أو الوصف مطلوب', 422);
            }

            $userId = $request->user['id'] ?? null;

            $stmt = $this->db->prepare("
                INSERT INTO academic_resources 
                    (title, description, category, university, faculty, file_url, 
                     file_type, file_size_kb, thumbnail_url, uploaded_by, status, tags)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?)
            ");
            $stmt->execute([
                $data['title'],
                $data['description']  ?? null,
                $data['category']     ?? null,
                $data['university']   ?? null,
                $data['faculty']      ?? null,
                $data['file_url']     ?? null,
                $data['file_type']    ?? null,
                $data['file_size_kb'] ?? null,
                $data['thumbnail_url'] ?? null,
                $userId,
                isset($data['tags']) ? json_encode($data['tags']) : null,
            ]);

            $id = (int) $this->db->lastInsertId();
            return ResponseHelper::success('تم رفع المورد بنجاح ويتطلب مراجعة', ['id' => $id], 201);
        } catch (\Throwable $e) {
            return ResponseHelper::error('فشل رفع المورد: ' . $e->getMessage(), 500);
        }
    }

    // =====================================================
    // PUT /api/academic-resources/{id}
    // تعديل مورد أكاديمي
    // =====================================================
    public function update(Request $request, int $id): array
    {
        try {
            if (!$this->db) return ResponseHelper::error('خطأ في الاتصال', 500);

            $data    = $request->body();
            $allowed = ['title','description','category','university','faculty',
                        'file_url','file_type','file_size_kb','thumbnail_url','status','tags'];

            $sets = []; $params = [];
            foreach ($allowed as $field) {
                if (array_key_exists($field, $data)) {
                    $sets[]  = "$field = ?";
                    $params[] = $field === 'tags' ? json_encode($data[$field]) : $data[$field];
                }
            }
            if (empty($sets)) return ResponseHelper::error('لا توجد بيانات للتحديث', 422);

            $params[] = $id;
            $this->db->prepare("UPDATE academic_resources SET " . implode(', ', $sets) . " WHERE id=? AND deleted_at IS NULL")->execute($params);

            return ResponseHelper::success('تم تحديث المورد بنجاح');
        } catch (\Throwable $e) {
            return ResponseHelper::error('فشل التحديث: ' . $e->getMessage(), 500);
        }
    }

    // =====================================================
    // POST /api/academic-resources/{id}/publish
    // نشر مورد أكاديمي
    // =====================================================
    public function publish(Request $request, int $id): array
    {
        try {
            if (!$this->db) return ResponseHelper::error('خطأ في الاتصال', 500);

            $stmt = $this->db->prepare("UPDATE academic_resources SET status='published' WHERE id=? AND deleted_at IS NULL");
            $stmt->execute([$id]);

            if ($stmt->rowCount() === 0) return ResponseHelper::error('المورد غير موجود', 404);

            return ResponseHelper::success('تم نشر المورد بنجاح');
        } catch (\Throwable $e) {
            return ResponseHelper::error('فشل النشر: ' . $e->getMessage(), 500);
        }
    }

    // =====================================================
    // POST /api/academic-resources/{id}/download
    // تسجيل تنزيل + إرجاع رابط الملف
    // =====================================================
    public function download(Request $request, int $id): array
    {
        try {
            if (!$this->db) return ResponseHelper::error('خطأ في الاتصال', 500);

            $stmt = $this->db->prepare("SELECT file_url FROM academic_resources WHERE id=? AND status='published' AND deleted_at IS NULL");
            $stmt->execute([$id]);
            $resource = $stmt->fetch();

            if (!$resource || empty($resource['file_url'])) return ResponseHelper::error('الملف غير متاح', 404);

            $this->db->prepare("UPDATE academic_resources SET downloads_count = downloads_count + 1 WHERE id=?")->execute([$id]);

            return ResponseHelper::success('رابط التنزيل', ['url' => $resource['file_url']]);
        } catch (\Throwable $e) {
            return ResponseHelper::error('فشل جلب رابط التنزيل: ' . $e->getMessage(), 500);
        }
    }

    // =====================================================
    // DELETE /api/academic-resources/{id}
    // حذف ناعم
    // =====================================================
    public function destroy(Request $request, int $id): array
    {
        try {
            if (!$this->db) return ResponseHelper::error('خطأ في الاتصال', 500);

            $stmt = $this->db->prepare("UPDATE academic_resources SET deleted_at=NOW() WHERE id=? AND deleted_at IS NULL");
            $stmt->execute([$id]);

            if ($stmt->rowCount() === 0) return ResponseHelper::error('المورد غير موجود', 404);

            return ResponseHelper::success('تم حذف المورد');
        } catch (\Throwable $e) {
            return ResponseHelper::error('فشل الحذف: ' . $e->getMessage(), 500);
        }
    }

    // =====================================================
    // GET /api/academic-resources/stats
    // إحصائيات المحتوى الأكاديمي
    // =====================================================
    public function stats(Request $request): array
    {
        try {
            if (!$this->db) return ResponseHelper::success('', ['total' => 0, 'by_category' => [], 'total_downloads' => 0]);

            $stmt = $this->db->query("
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status='published' THEN 1 ELSE 0 END) as published,
                    SUM(CASE WHEN status='draft' THEN 1 ELSE 0 END) as drafts,
                    COALESCE(SUM(downloads_count), 0) as total_downloads,
                    COALESCE(SUM(views_count), 0) as total_views
                FROM academic_resources WHERE deleted_at IS NULL
            ");
            $stats = $stmt ? $stmt->fetch() : [];

            $catStmt = $this->db->query("
                SELECT category, COUNT(*) as count, SUM(downloads_count) as downloads
                FROM academic_resources
                WHERE deleted_at IS NULL AND status='published' AND category IS NOT NULL
                GROUP BY category ORDER BY count DESC
            ");
            $byCategory = $catStmt ? $catStmt->fetchAll() : [];

            return ResponseHelper::success('تم جلب الإحصائيات', [
                'summary'     => $stats,
                'by_category' => $byCategory,
            ]);
        } catch (\Throwable $e) {
            return ResponseHelper::error('فشل جلب الإحصائيات: ' . $e->getMessage(), 500);
        }
    }
}
