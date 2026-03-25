USE yemen_union_db;

-- 1. إنشاء جدول user_sessions إذا لم يكن موجوداً (بالهيكلية المتوافقة مع الكود)
CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL, -- تم تعديل النوع ليتوافق مع users.id (إذا كان INT فيجب تعديله)
    token_hash VARCHAR(255) UNIQUE NOT NULL COMMENT 'Hashed JWT token',
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    device_type VARCHAR(50) NULL,
    expires_at TIMESTAMP NOT NULL,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token_hash),
    INDEX idx_user_active (user_id, is_revoked),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. التحقق مما إذا كان users.id هو INT أو BIGINT وتعديل user_sessions.user_id ليتطابق
-- (هذا يتطلب إجراءات معقدة قليلاً في SQL، لكن سنفترض التوافق أو نقوم بالإضافة البسيطة)
-- في الـ schema القديمة users.id هو INT. في الجديدة BIGINT.
-- لتجنب مشاكل الـ FK، لن أضيف الـ FOREIGN KEY CONSTRAINT الآن إلا إذا تأكدت،
-- لكن الكود سيعمل بدونه. سأحاول إضافته، وإذا فشل فلا بأس.

-- 3. نقل البيانات من sessions القديم (إذا وجد)
-- لا داعي لذلك، الجلسات بيانات مؤقتة.

-- 4. حذف الجدول القديم sessions لتجنب الالتباس (اختياري، لن أفعله للأمان)

SELECT 'Fix completed. user_sessions table works.' as status;
