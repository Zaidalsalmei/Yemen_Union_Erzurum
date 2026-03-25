# 📧 دليل تفعيل ميزة ردود البريد الإلكتروني

## ✅ ما تم إنجازه:

تم تفعيل صفحة **Email Replies** بنجاح في النظام! الآن يمكنك:
- ✅ عرض قائمة الردود من قاعدة البيانات
- ✅ البحث في الردود
- ✅ الانتقال لملف العضو من الرد

---

## ⚠️ المشكلة الحالية:

عند الضغط على زر **"جلب الردود الجديدة"**، يظهر خطأ لأن **PHP IMAP Extension غير مفعلة**.

---

## 🔧 خطوات تفعيل PHP IMAP Extension:

### الخطوة 1: فتح ملف php.ini

1. افتح لوحة تحكم XAMPP
2. اضغط على زر **"Config"** بجانب Apache
3. اختر **"PHP (php.ini)"**

أو افتح الملف مباشرة من المسار:
```
C:\xampp\php\php.ini
```

### الخطوة 2: تفعيل IMAP Extension

1. ابحث عن السطر التالي في الملف (استخدم Ctrl+F للبحث):
```ini
;extension=imap
```

2. أزل الفاصلة المنقوطة (`;`) من بداية السطر ليصبح:
```ini
extension=imap
```

### الخطوة 3: حفظ الملف وإعادة تشغيل Apache

1. احفظ ملف `php.ini` (Ctrl+S)
2. افتح لوحة تحكم XAMPP
3. اضغط على **"Stop"** لإيقاف Apache
4. اضغط على **"Start"** لتشغيل Apache مرة أخرى

### الخطوة 4: التحقق من التفعيل

افتح الرابط التالي في المتصفح للتحقق من أن IMAP تم تفعيلها:
```
http://localhost:8000/check_imap.php
```

يجب أن ترى رسالة:
```
✅ PHP IMAP Extension is INSTALLED and ENABLED
```

---

## 📧 إعدادات البريد الإلكتروني المستخدمة:

تم تكوين النظام للاتصال بحساب Outlook التالي:

- **البريد الإلكتروني**: `yemen.union.erzurum@outlook.com`
- **IMAP Host**: `outlook.office365.com:993/imap/ssl`
- **SMTP Host**: `smtp-mail.outlook.com:587`

---

## 🔐 ملاحظات مهمة:

### 1. تفعيل IMAP في حساب Outlook:

تأكد من تفعيل IMAP في إعدادات حساب Outlook:
1. سجل دخول إلى [Outlook.com](https://outlook.com)
2. اذهب إلى **Settings** (الإعدادات) > **View all Outlook settings**
3. اختر **Mail** > **Sync email**
4. تأكد من تفعيل **"Let devices and apps use POP"** أو **"IMAP"**

### 2. كلمة مرور التطبيق (App Password):

إذا كان الحساب يستخدم المصادقة الثنائية (2FA)، ستحتاج إلى:
1. إنشاء **App Password** من إعدادات الأمان في حساب Microsoft
2. استخدام App Password بدلاً من كلمة المرور العادية في ملف `.env`

---

## 🧪 اختبار الميزة:

بعد تفعيل IMAP Extension:

1. افتح صفحة Email Replies:
```
http://localhost:5176/email-replies
```

2. اضغط على زر **"جلب الردود الجديدة"**

3. سيقوم النظام بـ:
   - الاتصال بحساب البريد الإلكتروني
   - جلب الرسائل غير المقروءة
   - مطابقة البريد الإلكتروني للمرسل مع قاعدة بيانات الأعضاء
   - حفظ الردود في قاعدة البيانات
   - عرض الردود في الصفحة

---

## 📊 كيفية عمل الميزة:

1. **الجلب اليدوي**: اضغط على "جلب الردود الجديدة" لجلب الرسائل
2. **المطابقة التلقائية**: يتم مطابقة البريد الإلكتروني للمرسل مع جدول `users`
3. **التخزين**: يتم حفظ الردود في جدول `email_replies`
4. **العرض**: يتم عرض الردود مع معلومات العضو

---

## 🐛 استكشاف الأخطاء:

### خطأ: "IMAP connection failed"
- تأكد من صحة البريد الإلكتروني وكلمة المرور في `.env`
- تأكد من تفعيل IMAP في حساب Outlook
- جرب استخدام App Password إذا كان الحساب يستخدم 2FA

### خطأ: "PHP IMAP extension missing"
- تأكد من إزالة `;` من `extension=imap` في `php.ini`
- تأكد من إعادة تشغيل Apache بعد التعديل
- تحقق من التفعيل عبر `http://localhost:8000/check_imap.php`

### لا توجد ردود بعد الجلب
- تأكد من وجود رسائل غير مقروءة في البريد الوارد
- تأكد من أن البريد الإلكتروني للمرسل موجود في جدول `users`

---

## 📝 ملفات التكوين:

### ملف `.env`:
```env
# SMTP (Sending Emails) - Outlook Configuration
MAIL_HOST=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_USERNAME=yemen.union.erzurum@outlook.com
MAIL_PASSWORD=nyyldgwooplpvmjp
MAIL_ENCRYPTION=tls

# IMAP (Fetching Replies) - Outlook Configuration
IMAP_HOST=outlook.office365.com:993/imap/ssl
IMAP_USERNAME=yemen.union.erzurum@outlook.com
IMAP_PASSWORD=nyyldgwooplpvmjp
```

### جدول قاعدة البيانات:
```sql
CREATE TABLE IF NOT EXISTS email_replies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  sender_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_sender_email (sender_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## ✨ الميزات المتاحة:

- ✅ جلب الردود من البريد الإلكتروني
- ✅ عرض قائمة الردود مع معلومات المرسل
- ✅ البحث في الردود (الموضوع، المحتوى، البريد الإلكتروني)
- ✅ الترقيم (Pagination)
- ✅ الانتقال لملف العضو
- ✅ عرض تاريخ ووقت الرد

---

**تم إعداد هذا الدليل في:** 2025-12-19  
**الحالة:** جاهز للاستخدام بعد تفعيل PHP IMAP Extension
