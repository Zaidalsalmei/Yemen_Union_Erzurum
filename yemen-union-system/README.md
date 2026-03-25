# نظام إدارة اتحاد الطلاب اليمنيين - أرضروم
# Yemen Student Union Management System - Erzurum

نظام متكامل لإدارة شؤون اتحاد الطلاب اليمنيين في مدينة أرضروم التركية.

## 🚀 المميزات

### إدارة الأعضاء
- ✅ تسجيل الأعضاء الجدد
- ✅ إدارة بيانات الأعضاء
- ✅ توثيق وحظر الأعضاء
- ✅ البحث والفلترة

### إدارة الاشتراكات
- ✅ باقات اشتراك متعددة (3/6/12 شهر)
- ✅ تسجيل المدفوعات
- ✅ تتبع انتهاء الاشتراكات
- ✅ إشعارات التجديد

### إدارة الأنشطة
- ✅ إنشاء وإدارة الفعاليات
- ✅ تسجيل المشاركين
- ✅ تسجيل الحضور
- ✅ تقارير الأنشطة

### النظام المالي
- ✅ تتبع الإيرادات والمصروفات
- ✅ إدارة الرعايات
- ✅ التقارير المالية

### الأمان والصلاحيات
- ✅ نظام صلاحيات متقدم (RBAC)
- ✅ 7 أدوار مختلفة
- ✅ 56 صلاحية قابلة للتخصيص

---

## 📋 متطلبات التشغيل

### الخادم
- PHP 8.2+
- MySQL 5.7+ / MariaDB 10.3+
- Apache/Nginx (XAMPP recommended for development)
- Composer

### العميل
- Node.js 18+
- npm 9+

---

## 🛠️ التثبيت

### 1. استنساخ المشروع
```bash
cd c:\xampp\htdocs\projects
# المشروع موجود في yemen-union-system/
```

### 2. إعداد قاعدة البيانات

#### عبر phpMyAdmin:
1. افتح http://localhost/phpmyadmin
2. أنشئ قاعدة بيانات جديدة باسم `yemen_union_db`
3. اختر Collation: `utf8mb4_unicode_ci`
4. انتقل إلى تبويب SQL
5. الصق محتوى الملف:
   `backend/database/migrations/001_full_schema.sql`
6. اضغط Go لتنفيذ الاستعلامات

### 3. إعداد الباك إند (Backend)
```bash
cd yemen-union-system/backend

# تثبيت المكتبات
php composer.phar install

# تعديل إعدادات البيئة
# قم بتعديل ملف .env إذا لزم الأمر
```

### 4. إعداد الفرونت إند (Frontend)
```bash
cd yemen-union-system/frontend

# تثبيت المكتبات
npm install
```

---

## 🏃 تشغيل المشروع

### تشغيل الباك إند
الباك إند يعمل عبر Apache (XAMPP):
- تأكد من تشغيل Apache و MySQL في XAMPP
- الـ API متاح على: `http://localhost/yemen-union-system/backend/public/api/`

### تشغيل الفرونت إند
```bash
cd yemen-union-system/frontend
npm run dev
```
الفرونت إند يعمل على: `http://localhost:5173`

---

## 🔐 بيانات الدخول الافتراضية

| الحقل | القيمة |
|-------|--------|
| رقم الهاتف | `05001234567` |
| كلمة المرور | `Admin@123` |
| الدور | الرئيس (صلاحيات كاملة) |

---

## 📁 هيكل المشروع

```
yemen-union-system/
├── backend/                    # PHP API
│   ├── public/                 # نقطة الدخول
│   │   └── index.php
│   ├── src/
│   │   ├── Config/             # إعدادات قاعدة البيانات
│   │   ├── Controllers/        # متحكمات API
│   │   ├── Core/               # الإطار الأساسي
│   │   ├── Exceptions/         # الاستثناءات
│   │   ├── Helpers/            # أدوات مساعدة
│   │   ├── Middleware/         # طبقات الوسيطة
│   │   ├── Repositories/       # طبقة البيانات
│   │   ├── Routes/             # تعريف المسارات
│   │   └── Services/           # منطق الأعمال
│   ├── database/
│   │   ├── migrations/         # ملفات قاعدة البيانات
│   │   └── seeds/              # بيانات أولية
│   ├── storage/
│   │   ├── logs/               # سجلات النظام
│   │   ├── uploads/            # الملفات المرفوعة
│   │   └── cache/              # ملفات التخزين المؤقت
│   ├── .env                    # متغيرات البيئة
│   └── composer.json
│
└── frontend/                   # React App
    ├── src/
    │   ├── components/         # مكونات واجهة المستخدم
    │   │   ├── common/         # مكونات عامة
    │   │   └── layout/         # تخطيط الصفحات
    │   ├── contexts/           # React Context
    │   ├── hooks/              # Custom Hooks
    │   ├── pages/              # صفحات التطبيق
    │   ├── services/           # خدمات API
    │   ├── types/              # TypeScript Types
    │   └── utils/              # أدوات مساعدة
    ├── index.html
    ├── tailwind.config.js
    └── package.json
```

---

## 🌐 نقاط API الرئيسية

### المصادقة
| Method | Endpoint | الوصف |
|--------|----------|-------|
| POST | `/api/auth/login` | تسجيل الدخول |
| POST | `/api/auth/logout` | تسجيل الخروج |
| GET | `/api/auth/me` | بيانات المستخدم الحالي |

### الأعضاء
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/users` | قائمة الأعضاء |
| POST | `/api/users` | إضافة عضو |
| GET | `/api/users/{id}` | عرض عضو |
| PUT | `/api/users/{id}` | تعديل عضو |
| DELETE | `/api/users/{id}` | حذف عضو |

### الاشتراكات
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/memberships` | قائمة الاشتراكات |
| POST | `/api/memberships` | تسجيل اشتراك |
| GET | `/api/memberships/packages` | باقات الاشتراك |

### الأنشطة
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/activities` | قائمة الأنشطة |
| POST | `/api/activities` | إنشاء نشاط |
| POST | `/api/activities/{id}/register` | التسجيل في نشاط |

---

## 👥 الأدوار والصلاحيات

| الدور | الوصف | المستوى |
|-------|-------|---------|
| الرئيس | صلاحيات كاملة | 0 |
| نائب الرئيس | صلاحيات إدارية واسعة | 1 |
| المسؤول المالي | إدارة الشؤون المالية | 2 |
| منسق الأنشطة | إدارة الفعاليات | 3 |
| السكرتير | التوثيق والإعلانات | 3 |
| مسؤول الإعلام | الإعلام والتواصل | 3 |
| عضو | صلاحيات محدودة | 4 |

---

## 🔧 التطوير

### إضافة Controller جديد
```php
// src/Controllers/NewController.php
namespace App\Controllers;

class NewController {
    public function index(Request $request): array {
        return ResponseHelper::success('message', $data);
    }
}
```

### إضافة Route جديد
```php
// src/Routes/api.php
Router::get('/api/new-route', [NewController::class, 'index'], ['permission:required.permission']);
```

### إضافة Component جديد
```tsx
// src/components/common/NewComponent.tsx
export function NewComponent({ prop }: Props) {
  return <div>{/* content */}</div>;
}
```

---

## 📝 ملاحظات مهمة

1. **اللغة**: جميع واجهات المستخدم باللغة العربية
2. **الاتجاه**: تصميم RTL (من اليمين لليسار)
3. **التوقيت**: Europe/Istanbul
4. **العملة**: الليرة التركية (TRY)

---

## 📄 الترخيص

هذا المشروع مخصص لاتحاد الطلاب اليمنيين في أرضروم.

---

## 📞 الدعم

للمساعدة أو الإبلاغ عن مشاكل، تواصل مع فريق التطوير.
