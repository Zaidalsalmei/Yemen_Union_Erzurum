# تعليمات استكشاف المشكلة - تذاكر الدعم

## المشكلة:
التذاكر المُرسلة من العضو لا تظهر في Dashboard المدير

## خطوات الفحص:

### 1. التحقق من إنشاء التذكرة:

```sql
-- في phpMyAdmin أو MySQL Workbench:
USE yemen_union_db;

-- تحقق من وجود الجدول
SHOW TABLES LIKE 'support_tickets';

-- عرض جميع التذاكر
SELECT * FROM support_tickets ORDER BY created_at DESC;
```

### 2. التحقق من الإشعارات:

```sql
-- عرض الإشعارات المُنشأة
SELECT * FROM notifications 
WHERE title LIKE '%تذكرة%'
ORDER BY created_at DESC;
```

### 3. إنشاء الجداول إذا لم تكن موجودة:

```bash
# في phpMyAdmin أو MySQL:
# شغّل الملف: backend/database/migrations/004_check_support_tickets.sql
```

### 4. اختبار API مباشرة:

#### A. إنشاء تذكرة:
```bash
POST http://localhost/yemen-union-system/backend/public/index.php/api/support/tickets
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "subject": "اختبار",
  "message": "هذه رسالة اختبار",
  "priority": "high"
}
```

#### B. جلب Dashboard:
```bash
GET http://localhost/yemen-union-system/backend/public/index.php/api/dashboard
Authorization: Bearer ADMIN_TOKEN
```

### 5. فحص error_log:

```bash
# افتح:
C:\xampp\apache\logs\error.log

# ابحث عن:
- "Support Ticket Create Error"
- "getRecentSupportTickets Error"
- "Dashboard Error"
```

### 6. إعادة تحميل Frontend:

```bash
# في المتصفح:
1. اضغط Ctrl+Shift+R (تحديث كامل)
2. افتح Console (F12)
3. تحقق من أي أخطاء
```

## الإصلاح السريع:

### إذا كان الجدول غير موجود:

```sql
USE yemen_union_db;

CREATE TABLE IF NOT EXISTS support_tickets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('open', 'pending', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    attachment_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS support_ticket_replies (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    message TEXT NOT NULL,
    is_admin_reply BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_ticket_id (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### ثم جرب إرسال تذكرة جديدة!

## التحقق من النجاح:

1. ✅ التذكرة تظهر في جدول `support_tickets`
2. ✅ الإشعار يظهر في جدول `notifications`
3. ✅ التذكرة تظهر في Dashboard المدير
4. ✅ الإشعار يظهر في قسم الإشعارات

---

**إذا استمرت المشكلة، شارك:**
1. Screenshot من error_log
2. نتيجة `SELECT * FROM support_tickets;`
3. رسالة الخطأ في Console (إن وجدت)
