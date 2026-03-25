# 🧪 دليل اختبار Backend APIs
**التاريخ**: 2025-12-15  
**الإصدار**: 1.0  
**الحالة**: جاهز للاختبار

---

## 📋 المتطلبات الأساسية

### 1. تشغيل Backend Server
```bash
# التأكد من تشغيل XAMPP (Apache + MySQL)
# أو
cd backend
php -S localhost:8000 public/index.php
```

### 2. الحصول على JWT Token

#### الطريقة 1: تسجيل الدخول
```bash
POST http://localhost/yemen-union-system/backend/public/index.php/api/auth/login
Content-Type: application/json

{
  "phone_number": "05XXXXXXXXX",
  "password": "your_password"
}
```

**الرد المتوقع**:
```json
{
  "success": true,
  "message": "تم تسجيل الدخول بنجاح",
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
      "id": 1,
      "full_name": "عبدالله أحمد",
      ...
    }
  }
}
```

**⚠️ احفظ الـ Token - ستحتاجه في كل طلب!**

---

## 🔐 Headers المطلوبة لجميع الطلبات

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json
```

---

## 📝 اختبار الـ APIs (بالترتيب)

### 1️⃣ Member Dashboard API

**الطلب**:
```bash
GET http://localhost/yemen-union-system/backend/public/index.php/api/member/dashboard
Authorization: Bearer YOUR_TOKEN
```

**الرد المتوقع**:
```json
{
  "success": true,
  "message": "تم جلب البيانات بنجاح",
  "data": {
    "member": {
      "id": 1,
      "full_name": "عبدالله أحمد",
      "member_id": "MEM-2025-001",
      ...
    },
    "kpis": {
      "subscription_status": "paid",
      "days_remaining": 350,
      "upcoming_activities_count": 3,
      "unread_notifications_count": 5,
      "new_posts_count": 2,
      ...
    },
    "subscription": {...},
    "upcomingActivities": [...],
    "recentPosts": [...],
    "notifications": [...],
    "isFirstLogin": false
  }
}
```

**✅ اختبار ناجح إذا**:
- status code: 200
- `success: true`
- البيانات مطابقة للعضو المسجل

---

### 2️⃣ Member Profile Update API

**الطلب** (بدون صورة):
```bash
PUT http://localhost/yemen-union-system/backend/public/index.php/api/member/profile
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "full_name": "اسم محدث",
  "email": "new@example.com",
  "city": "إسطنبول",
  "university": "جامعة إسطنبول",
  "faculty": "كلية الهندسة"
}
```

**الطلب** (مع صورة - استخدم Postman):
```
PUT http://localhost/.../api/member/profile
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

Body (form-data):
- full_name: "اسم محدث"
- email: "new@example.com"
- profile_photo: [اختر ملف صورة]
```

**الرد المتوقع**:
```json
{
  "success": true,
  "message": "تم تحديث البيانات بنجاح",
  "data": {
    "user": {
      "id": 1,
      "full_name": "اسم محدث",
      "email": "new@example.com",
      "profile_photo": "/uploads/profiles/profile_xxx.jpg",
      ...
    }
  }
}
```

**✅ اختبار ناجح إذا**:
- البيانات تم تحديثها في Database
- الصورة موجودة في `public/uploads/profiles/`
- الرد يحتوي على البيانات المحدثة

---

### 3️⃣ Payment Proof Upload API

**الطلب** (Postman - form-data):
```
POST http://localhost/.../api/memberships/payment-proof
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

Body (form-data):
- membership_id: 1
- proof_image: [اختر ملف صورة أو PDF]
- notes: "دفعت عن طريق حوالة بنكية"
```

**الرد المتوقع**:
```json
{
  "success": true,
  "message": "تم رفع إثبات الدفع بنجاح. سيتم مراجعته قريباً",
  "data": {
    "payment_proof": {
      "id": 1,
      "proof_image_url": "/uploads/payment-proofs/proof_xxx.jpg",
      "status": "pending",
      "uploaded_at": "2025-12-15 01:20:00"
    }
  }
}
```

**✅ اختبار ناجح إذا**:
- الملف موجود في `public/uploads/payment-proofs/`
- السجل موجود في جدول `payment_proofs`
- الحالة = "pending"

---

### 4️⃣ Payment History API

**الطلب**:
```bash
GET http://localhost/.../api/member/payments/history?page=1&limit=10
Authorization: Bearer YOUR_TOKEN
```

**الرد المتوقع**:
```json
{
  "success": true,
  "message": "تم جلب البيانات بنجاح",
  "data": {
    "payments": [
      {
        "id": 1,
        "package_name": "سنوية",
        "amount": 500,
        "currency": "TRY",
        "payment_method": "bank_transfer",
        "status": "active",
        "payment_date": "2024-01-15",
        "payment_proof_status": "approved",
        ...
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 2,
      "total_items": 15,
      "per_page": 10
    }
  }
}
```

**✅ اختبار ناجح إذا**:
- يظهر فقط مدفوعات العضو المسجل
- Pagination يعمل بشكل صحيح

---

### 5️⃣ Activity Unregister API

**الطلب**:
```bash
POST http://localhost/.../api/activities/1/unregister
Authorization: Bearer YOUR_TOKEN
```

**الرد المتوقع** (نجاح):
```json
{
  "success": true,
  "message": "تم إلغاء التسجيل من النشاط بنجاح"
}
```

**الرد المتوقع** (فشل - بعد بدء النشاط):
```json
{
  "success": false,
  "message": "لا يمكن إلغاء التسجيل بعد بدء النشاط"
}
```

**✅ اختبار ناجح إذا**:
- السجل تم حذفه من `activity_participants`
- يُمنع الإلغاء بعد بدء النشاط

---

### 6️⃣ Activity Check-in API

**الطلب** (عضو يسجل حضوره):
```bash
POST http://localhost/.../api/activities/1/checkin
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{}
```

**الطلب** (إدارة تسجل حضور عضو):
```bash
POST http://localhost/.../api/activities/1/checkin
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "user_id": 5
}
```

**الرد المتوقع**:
```json
{
  "success": true,
  "message": "تم تسجيل الحضور بنجاح",
  "data": {
    "activity_id": 1,
    "user_id": 1,
    "checked_in_at": "2025-12-15 10:30:00",
    "attendance_status": "present"
  }
}
```

**الرد المتوقع** (فشل - ليس يوم النشاط):
```json
{
  "success": false,
  "message": "يمكن تسجيل الحضور فقط في يوم النشاط"
}
```

**✅ اختبار ناجح إذا**:
- `attendance_status` تم تحديثه في Database
- يُمنع التسجيل في غير يوم النشاط (للأعضاء)
- الإدارة تستطيع التسجيل في أي وقت

---

### 7️⃣ Logout All Devices API

**الطلب**:
```bash
POST http://localhost/.../api/auth/logout-all-devices
Authorization: Bearer YOUR_TOKEN
```

**الرد المتوقع**:
```json
{
  "success": true,
  "message": "تم تسجيل الخروج من جميع الأجهزة بنجاح",
  "data": {
    "revoked_sessions_count": 3
  }
}
```

**✅ اختبار ناجح إذا**:
- جميع sessions الأخرى أصبحت `is_active = 0`
- الجلسة الحالية لا تزال نشطة

---

### 8️⃣ Member Notifications API

**الطلب** (كل الإشعارات):
```bash
GET http://localhost/.../api/member/notifications?page=1&limit=20
Authorization: Bearer YOUR_TOKEN
```

**الطلب** (غير المقروءة فقط):
```bash
GET http://localhost/.../api/member/notifications?unread_only=true
Authorization: Bearer YOUR_TOKEN
```

**الرد المتوقع**:
```json
{
  "success": true,
  "message": "تم جلب البيانات بنجاح",
  "data": {
    "notifications": [
      {
        "id": 1,
        "type": "info",
        "title": "إشعار جديد",
        "message": "محتوى الإشعار",
        "action_url": "/activities/5",
        "is_read": false,
        "created_at": "2025-12-15 00:00:00"
      }
    ],
    "unread_count": 5,
    "pagination": {...}
  }
}
```

#### تحديد كـ "مقروء":
```bash
POST http://localhost/.../api/member/notifications/1/mark-read
Authorization: Bearer YOUR_TOKEN
```

**✅ اختبار ناجح إذا**:
- الإشعارات تظهر بشكل صحيح
- `unread_only` filter يعمل
- Mark as read يُحدث `is_read = 1`

---

### 9️⃣ Member Posts API

**الطلب** (كل المنشورات):
```bash
GET http://localhost/.../api/member/posts?page=1&limit=10
Authorization: Bearer YOUR_TOKEN
```

**الطلب** (فلتر حسب الفئة):
```bash
GET http://localhost/.../api/member/posts?category=announcement
Authorization: Bearer YOUR_TOKEN
```

**الفئات المتاحة**:
- `announcement` - إعلانات
- `event` - فعاليات
- `financial_alert` - تنبيهات مالية
- `general` - عام
- `all` - الكل

**الرد المتوقع**:
```json
{
  "success": true,
  "message": "تم جلب البيانات بنجاح",
  "data": {
    "posts": [
      {
        "id": 1,
        "title": "عنوان المنشور",
        "excerpt": "مقتطف من المحتوى...",
        "category": "announcement",
        "created_at": "2025-12-14",
        "author_name": "أحمد محمد",
        "is_read": false
      }
    ],
    "new_posts_count": 3,
    "pagination": {...}
  }
}
```

#### عرض منشور واحد (يُحدد تلقائياً كـ "مقروء"):
```bash
GET http://localhost/.../api/member/posts/1
Authorization: Bearer YOUR_TOKEN
```

**الرد المتوقع**:
```json
{
  "success": true,
  "message": "تم جلب البيانات بنجاح",
  "data": {
    "id": 1,
    "title": "عنوان المنشور",
    "content": "المحتوى الكامل للمنشور...",
    "category": "announcement",
    "created_at": "2025-12-14",
    "author_name": "أحمد محمد"
  }
}
```

**✅ اختبار ناجح إذا**:
- المنشورات المنشورة فقط تظهر
- `is_read` يتم تحديثه عند القراءة
- سجل يُضاف في `post_reads`

---

### 🔟 Support Tickets API

#### إنشاء تذكرة:

**الطلب** (بدون مرفق):
```bash
POST http://localhost/.../api/support/tickets
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "subject": "مشكلة في الاشتراك",
  "message": "لا أستطيع رؤية الاشتراك الخاص بي",
  "priority": "medium"
}
```

**الطلب** (مع مرفق - Postman):
```
POST http://localhost/.../api/support/tickets
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

Body (form-data):
- subject: "مشكلة في الاشتراك"
- message: "..."
- priority: "high"
- attachment: [اختر ملف]
```

**الأولويات المتاحة**:
- `low` - منخفضة
- `medium` - متوسطة
- `high` - عالية
- `urgent` - عاجلة

**الرد المتوقع**:
```json
{
  "success": true,
  "message": "تم إنشاء التذكرة بنجاح. سنتواصل معك قريباً",
  "data": {
    "ticket": {
      "id": 1,
      "ticket_number": "TKT-2025-0001",
      "subject": "مشكلة في الاشتراك",
      "message": "...",
      "priority": "medium",
      "status": "open",
      "attachment_url": "/uploads/support-tickets/ticket_xxx.pdf",
      "created_at": "2025-12-15 01:30:00"
    }
  }
}
```

#### عرض قائمة التذاكر:
```bash
GET http://localhost/.../api/support/tickets?page=1&limit=10
Authorization: Bearer YOUR_TOKEN
```

**الرد المتوقع**:
```json
{
  "success": true,
  "message": "تم جلب البيانات بنجاح",
  "data": {
    "tickets": [
      {
        "id": 1,
        "ticket_number": "TKT-2025-0001",
        "subject": "مشكلة في الاشتراك",
        "priority": "medium",
        "status": "open",
        "created_at": "2025-12-15",
        "replies_count": 2
      }
    ],
    "pagination": {...}
  }
}
```

**✅ اختبار ناجح إذا**:
- `ticket_number` فريد
- المرفق موجود في المجلد
- العضو يرى تذاكره فقط

---

## 🧪 سيناريوهات الاختبار الشاملة

### السيناريو 1: رحلة العضو الكاملة
1. ✅ تسجيل الدخول
2. ✅ عرض Dashboard
3. ✅ تحديث الملف الشخصي
4. ✅ رفع إثبات دفع
5. ✅ التسجيل في نشاط
6. ✅ إلغاء التسجيل
7. ✅ قراءة منشور
8. ✅ إنشاء تذكرة دعم
9. ✅ تسجيل الخروج من كل الأجهزة

### السيناريو 2: اختبار الأمان
1. ✅ محاولة الوصول بدون Token → 401
2. ✅ محاولة الوصول بـ Token منتهي → 401
3. ✅ محاولة تعديل بيانات عضو آخر → 403
4. ✅ محاولة رفع ملف كبير جداً → 400
5. ✅ محاولة رفع ملف غير مدعوم → 400

### السيناريو 3: اختبار Validation
1. ✅ إرسال بيانات ناقصة → 400 + رسالة خطأ واضحة
2. ✅ إرسال email مكرر → 400
3. ✅ إرسال تاريخ غير صحيح → 400

---

## 📦 مجموعة Postman جاهزة

### استيراد المجموعة:

```json
{
  "info": {
    "name": "Yemen Union - Member APIs",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Login",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"phone_number\": \"05XXXXXXXXX\",\n  \"password\": \"password\"\n}",
          "options": { "raw": { "language": "json" } }
        },
        "url": {
          "raw": "{{base_url}}/api/auth/login",
          "host": ["{{base_url}}"],
          "path": ["api", "auth", "login"]
        }
      }
    },
    {
      "name": "2. Member Dashboard",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}",
            "type": "text"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/member/dashboard",
          "host": ["{{base_url}}"],
          "path": ["api", "member", "dashboard"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost/yemen-union-system/backend/public/index.php"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

**حفظ في ملف**: `yemen-union-member-apis.postman_collection.json`

---

## 🐛 استكشاف الأخطاء

### خطأ 404 - Route not found
```
الحل: تأكد من URL صحيح:
http://localhost/yemen-union-system/backend/public/index.php/api/...
```

### خطأ 401 - Unauthorized
```
الحل: 
1. تأكد من وجود Token في Header
2. تأكد من صحة Token (غير منتهي)
3. Header: Authorization: Bearer YOUR_TOKEN
```

### خطأ 500 - Internal Server Error
```
الحل:
1. تحقق من error_log في XAMPP
2. تأكد من Database connection
3. تأكد من جميع الجداول موجودة
```

### رفع الملفات لا يعمل
```
الحل:
1. استخدم Content-Type: multipart/form-data
2. في Postman: Body → form-data
3. تأكد من وجود مجلد uploads
4. تأكد من صلاحيات الكتابة
```

---

## ✅ Checklist الاختبار النهائي

- [ ] جميع الـ 10 APIs تعمل
- [ ] رفع الملفات يعمل (3 أنواع)
- [ ] Pagination يعمل
- [ ] Filters تعمل
- [ ] الأمان يعمل (401, 403)
- [ ] Validation يعمل
- [ ] الملفات تُحفظ بشكل صحيح
- [ ] Database يتم تحديثه
- [ ] Auto-features تعمل (mark as read, etc)

---

**تاريخ آخر تحديث**: 2025-12-15 01:17  
**الحالة**: ✅ جاهز للاختبار
