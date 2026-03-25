# 🎴 صفحة بطاقة العضوية - Membership Card Page

## 📋 نظرة عامة

صفحة **بطاقة العضوية** هي صفحة احترافية قابلة للطباعة تعرض بطاقة العضو الرسمية مع جميع معلوماته وإمكانية التحميل كـ PDF.

**المسار:** `/membership/card`

---

## ✨ الميزات الرئيسية

### 1. **عرض البطاقة الاحترافي** 🎨
- تصميم يشبه البطاقات الحقيقية
- شعار الاتحاد في الأعلى
- معلومات العضو كاملة
- صورة العضو أو placeholder
- رمز QR للتحقق
- Badge حالة العضوية

### 2. **معلومات البطاقة** 📝
- الاسم الكامل
- رقم العضوية (Member ID)
- رقم الهاتف
- البريد الإلكتروني
- الجامعة والكلية
- تاريخ الانضمام
- تاريخ انتهاء الصلاحية
- حالة العضوية (نشط/منتهي/معلق)

### 3. **التحميل والطباعة** 📄
- زر تحميل PDF (يستخدم Print to PDF)
- زر طباعة مباشرة
- تصميم محسّن للطباعة
- إخفاء العناصر غير الضرورية عند الطباعة

### 4. **رمز التحقق QR** 🔍
- QR Code يحتوي على رقم العضوية
- قابل للمسح للتحقق من البطاقة
- مفيد للدخول للفعاليات

---

## 🎨 التصميم

### **الألوان**
- **الإطار:** أحمر (#D60000)
- **الخلفية:** أبيض مع تدرج خفيف
- **النصوص:** أسود (#000000)
- **الحالة النشطة:** أخضر (#16A34A)
- **المعلومات الثانوية:** رمادي (#666)

### **التخطيط**
```
┌──────────────────────────────────────────────────────┐
│ ████████████████ (شريط أحمر/أسود)                   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  [Logo]  اتحاد الطلاب اليمنيين                      │
│          فرع أرضروم – تركيا                         │
│          بطاقة عضوية رسمية                          │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  [Photo]     الاسم: عبدالله أحمد محمد      [QR]     │
│  [نشط]      رقم العضوية: MEM-2025-001      Code    │
│              الهاتف: 05XXXXXXXXX                    │
│              البريد: member@example.com             │
│              الجامعة: جامعة أتاتورك                │
│              الكلية: كلية الهندسة                   │
│              تاريخ الانضمام: 15/01/2024             │
│              صالحة حتى: 31/12/2025                  │
│                                                      │
├──────────────────────────────────────────────────────┤
│  هذه البطاقة ملك اتحاد الطلاب اليمنيين             │
│  📞 05XXXXXXXXX | 🌐 www.yemenstudents.org          │
└──────────────────────────────────────────────────────┘
```

---

## 🔧 الاستخدام

### **إضافة Route**

في `App.tsx`:

```tsx
import { MembershipCard } from './pages/membership/MembershipCard';
import { MemberRoute } from './components/MemberRoute';

<Route 
  path="/membership/card" 
  element={
    <MemberRoute>
      <MembershipCard />
    </MemberRoute>
  } 
/>
```

### **الوصول للصفحة**

من Member Dashboard:
```tsx
<button onClick={() => navigate('/membership/card')}>
  عرض بطاقة العضوية
</button>
```

---

## 📱 الاستجابة (Responsive)

### **Desktop (>768px)**
- عرض البطاقة بالكامل
- 3 أعمدة (صورة - معلومات - QR)
- جميع الأزرار في صف واحد

### **Mobile (≤768px)**
- عمود واحد
- الصورة في الأعلى
- المعلومات تحتها
- QR Code في الأسفل
- الأزرار بعرض الشاشة

---

## 🖨️ وظيفة الطباعة/التحميل

### **التحميل كـ PDF**

```tsx
const handleDownloadPDF = () => {
    window.print(); // يفتح نافذة الطباعة
    toast.success('استخدم "حفظ كـ PDF" من خيارات الطباعة');
};
```

**خطوات التحميل للمستخدم:**
1. اضغط على "تحميل PDF"
2. تفتح نافذة الطباعة
3. اختر "حفظ كـ PDF" كطابعة
4. اضغط "حفظ"

### **ميزات الطباعة**

```css
@media print {
    /* إخفاء العناصر غير المطلوبة */
    .no-print {
        display: none !important;
    }
    
    /* تحسين البطاقة للطباعة */
    .membership-card {
        box-shadow: none;
        border: 2px solid #000;
    }
}
```

---

## 🔐 الأمان

### **Route Protection**
- محمية بـ `MemberRoute`
- متاحة للأعضاء فقط
- الأدمن يُعاد توجيهه للوحته

### **البيانات**
- تُعرض بيانات المستخدم المسجل فقط
- QR Code فريد لكل عضو
- لا يمكن عرض بطاقات الآخرين

---

## 🎯 حالات المختلفة

### **1. عضو نشط**
```tsx
status: 'active'
// Badge أخضر "نشط"
// تاريخ الصلاحية بالأخضر
```

### **2. عضوية منتهية**
```tsx
status: 'expired'
// Badge أحمر "منتهي"
// رسالة تنبيه
```

### **3. بانتظار التفعيل**
```tsx
status: 'pending'
// Badge أصفر "بانتظار التفعيل"
```

---

## 🔄 التكامل مع Backend

### **API المطلوب**

```typescript
// GET /api/member/card
interface MemberCardData {
    full_name: string;
    member_id: string;
    phone_number: string;
    email: string;
    university?: string;
    faculty?: string;
    profile_photo?: string;
    branch: string;
    join_date: string;
    expiry_date: string;
    status: 'active' | 'expired' | 'pending';
    qr_code_url: string;
}
```

### **استدعاء البيانات**

```tsx
import { memberDashboardService } from '../../services/memberDashboardService';

useEffect(() => {
    const loadCardData = async () => {
        try {
            const data = await memberDashboardService.getMemberCard();
            setMemberData(data);
        } catch (error) {
            toast.error('فشل تحميل بيانات البطاقة');
        }
    };
    loadCardData();
}, []);
```

---

## 🎨 التخصيص

### **تعديل الألوان**

```css
/* لون الإطار */
border: 3px solid #D60000; /* غيّر اللون */

/* لون الشريط العلوي */
background: linear-gradient(90deg, #D60000 0%, #000000 100%);

/* لون رقم العضوية */
.member-id {
    color: #D60000; /* غيّر اللون */
}
```

### **تعديل التخطيط**

```css
/* تغيير عدد الأعمدة */
.card-body {
    grid-template-columns: 150px 1fr 150px; /* عدّل الأعمدة */
}
```

### **إضافة شعار مخصص**

```tsx
<div className="card-logo">
    <img src="/your-logo.png" alt="Logo" />
</div>
```

---

## 📊 رمز QR

### **توليد QR Code**

حالياً يستخدم API مجاني:
```tsx
qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=YUS-${member_id}`
```

### **في الإنتاج:**

يُفضل توليد QR من Backend:
```tsx
// Backend يولد QR ويعيد الصورة
qr_code: '/uploads/qr_codes/MEM-2025-001.png'
```

---

## ✅ Checklist للتطبيق

- [x] تصميم البطاقة الاحترافي
- [x] عرض جميع معلومات العضو
- [x] صورة العضو أو placeholder
- [x] رمز QR للتحقق
- [x] Badge حالة العضوية
- [x] زر تحميل PDF
- [x] زر طباعة مباشرة
- [x] تصميم محسّن للطباعة
- [x] دعم RTL العربي
- [x] Responsive للموبايل
- [x] Route protection
- [x] توثيق كامل

---

## 🐛 Troubleshooting

### **المشكلة: البطاقة لا تظهر**
**الحل:** تأكد من تسجيل الدخول كعضو وليس أدمن

### **المشكلة: الصورة لا تظهر**
**الحل:** تحقق من مسار الصورة أو سيظهر placeholder

### **المشكلة: QR Code لا يعمل**
**الحل:** تأكد من الاتصال بالإنترنت أو استخدم QR محلي

### **المشكلة: الطباعة غير منسقة**
**الحل:** تأكد من الطباعة بحجم A4 واختيار "حفظ كـ PDF"

---

## 📱 أمثلة الاستخدام

### **1. من Dashboard**
```tsx
<button onClick={() => navigate('/membership/card')}>
    عرض بطاقة العضوية
</button>
```

### **2. تحميل مباشر**
```tsx
<Link to="/membership/card?download=true">
    تحميل البطاقة
</Link>
```

### **3. طباعة تلقائية**
```tsx
useEffect(() => {
    if (params.get('print') === 'true') {
        window.print();
    }
}, []);
```

---

## 🚀 الخطوات التالية

### **Phase 1: Complete ✅**
- [x] تصميم البطاقة
- [x] عرض المعلومات
- [x] وظيفة الطباعة

### **Phase 2: Pending**
- [ ] توليد QR Code من Backend
- [ ] إضافة شعار الجامعة
- [ ] باركود إضافي
- [ ] توقيع رقمي

### **Phase 3: Future**
- [ ] بطاقة رقمية للموبايل (Digital Wallet)
- [ ] NFC Support
- [ ] Blockchain verification

---

## 📞 الدعم

**للأسئلة:**
- راجع هذا التوثيق أولاً
- تحقق من كود المكون
- اختبر بمختلف المتصفحات

**للمشاكل:**
- تحقق من Console للأخطاء
- تأكد من صلاحيات المستخدم
- اختبر الطباعة على متصفحات مختلفة

---

## ✨ الملخص

صفحة بطاقة العضوية:
- ✅ احترافية وجميلة
- ✅ قابلة للطباعة والتحميل
- ✅ تحتوي على جميع المعلومات
- ✅ آمنة ومحمية
- ✅ Responsive
- ✅ RTL Arabic
- ✅ Production-ready

**جاهزة للاستخدام فوراً!** 🚀
