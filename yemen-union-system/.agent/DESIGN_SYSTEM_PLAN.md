# خطة تطبيق التصميم الموحد على جميع الصفحات

## ✅ الصفحات المكتملة:
1. **Users Module** (إدارة الأعضاء)
   - ✅ UserList.tsx - قائمة الأعضاء
   - ✅ UserCreate.tsx - إضافة عضو
   - ✅ UserEdit.tsx - تعديل عضو

2. **Memberships Module** (إدارة الاشتراكات)
   - ✅ MembershipList.tsx - قائمة الاشتراكات
   - ✅ MembershipCreate.tsx - إضافة اشتراك جديد

## 🔄 الصفحات المتبقية للتحديث:

### 1. Memberships Module (باقي الصفحات)
- [ ] MembershipDetail.tsx - تفاصيل الاشتراك
- [ ] MembershipEdit.tsx - تعديل الاشتراك

### 2. Activities Module (الأنشطة والفعاليات)
- [ ] ActivityList.tsx - قائمة الأنشطة (تحديث الأزرار والألوان)
- [ ] ActivityCreate.tsx - إنشاء نشاط جديد
- [ ] ActivityEdit.tsx - تعديل نشاط
- [ ] ActivityDetail.tsx - تفاصيل النشاط

### 3. Relations Module (العلاقات والداعمين)
- [ ] SupporterList.tsx - قائمة الداعمين
- [ ] SupporterCreate.tsx - إضافة داعم
- [ ] SupporterEdit.tsx - تعديل داعم
- [ ] SupporterDetail.tsx - تفاصيل الداعم
- [ ] SupportVisitList.tsx - قائمة الزيارات
- [ ] SupportVisitCreate.tsx - إضافة زيارة
- [ ] SupportVisitEdit.tsx - تعديل زيارة
- [ ] SupportVisitDetail.tsx - تفاصيل الزيارة

### 4. Calendar Module (التقويم)
- [ ] Calendar/index.tsx - صفحة التقويم الرئيسية

### 5. Finance Module (المالية)
- [ ] Finance/index.tsx - صفحة المالية

### 6. Reports Module (التقارير)
- [ ] Reports/index.tsx - صفحة التقارير

## 🎨 المعايير الموحدة للتطبيق:

### الألوان والتصميم:
- ✅ استخدام `--color-primary: #d21f3c` (الأحمر الرئيسي)
- ✅ استخدام `--color-primary-dark: #8a0e23` (الأحمر الداكن)
- ✅ استخدام `--color-black: #000000` (الأسود)
- ✅ خلفية الجداول: `#fdf2f4` (وردي فاتح)
- ✅ تأثيرات الـ Glow: `--glow-red`, `--glow-white`

### المكونات:
- ✅ استخدام `StatsWidget` الموحد للإحصائيات
- ✅ استخدام `.stepper` للخطوات المتعددة
- ✅ استخدام `.form-control`, `.form-select` للحقول
- ✅ استخدام `.btn` مع variants: `primary`, `secondary`, `outline`, `ghost`, `danger`, `success`
- ✅ استخدام `.card` للبطاقات
- ✅ استخدام `.table-container` و `table` للجداول
- ✅ استخدام `.pagination` للترقيم

### الأزرار:
- ✅ الأزرار الرئيسية: `btn-primary` (أحمر مع gradient)
- ✅ الأزرار الثانوية: `btn-secondary` (أبيض مع border)
- ✅ أزرار الإجراءات: `btn-ghost` (شفاف)
- ✅ أزرار الحذف: `btn-danger` (أحمر فاتح)
- ✅ أزرار النجاح: `btn-success` (أخضر فاتح)

### الأيقونات:
- ✅ استخدام Emoji أو SVG بحجم 20-24px
- ✅ تأثير hover مع `drop-shadow`
- ✅ ألوان موحدة (أحمر/رمادي/أبيض)

### التخطيط:
- ✅ Header موحد مع gradient أحمر-أسود
- ✅ Stats Cards مع أيقونات ملونة (أزرق، أخضر، برتقالي، أحمر)
- ✅ Filters في card منفصل
- ✅ Tables مع hover effects
- ✅ Pagination موحد

## 📋 خطوات التنفيذ:

1. **المرحلة الأولى** (أولوية عالية):
   - تحديث صفحات Activities (الأكثر استخداماً)
   - تحديث صفحات Relations (الداعمين والزيارات)

2. **المرحلة الثانية** (أولوية متوسطة):
   - تحديث صفحة Calendar
   - تحديث صفحة Finance
   - تحديث صفحة Reports

3. **المرحلة الثالثة** (التحسينات):
   - مراجعة جميع الصفحات للتأكد من التناسق
   - إضافة animations موحدة
   - تحسين الـ responsiveness

## 🔧 التحديثات المطلوبة لكل صفحة:

### لكل صفحة List:
1. تحديث Header بالتصميم الجديد
2. إضافة StatsWidget موحد
3. تحديث Filters إلى card منفصل
4. تحديث Table بالتصميم الجديد
5. تحديث Pagination
6. تحديث جميع الأزرار لاستخدام Button component

### لكل صفحة Create/Edit:
1. إضافة Header مع gradient
2. إضافة Stepper إذا كانت متعددة الخطوات
3. تحديث جميع الحقول لاستخدام `.form-control`
4. تحديث الأزرار (السابق، التالي، حفظ، إلغاء)
5. إضافة validation messages بالأحمر

### لكل صفحة Detail:
1. تحديث Header
2. تحديث Cards لعرض المعلومات
3. تحديث الأزرار (تعديل، حذف، رجوع)
4. إضافة sections منظمة

## 📝 ملاحظات:
- جميع التحديثات يجب أن تحافظ على الـ Logic الموجود
- عدم تغيير API calls أو data fetching
- الحفاظ على جميع الـ permissions والـ validations
- التأكد من RTL support
- استخدام formatArabicNumber و formatArabicDate

---
**آخر تحديث**: 2025-12-10
**الحالة**: قيد التنفيذ - المرحلة الأولى
