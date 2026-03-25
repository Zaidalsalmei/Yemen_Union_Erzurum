# تعليمات سريعة - تطبيق ميزة استعادة كلمة المرور

## ✅ تم إنجازه (Backend + Services)

1. ✅ Backend API Routes جاهزة
2. ✅ AuthController methods جاهزة  
3. ✅ AuthService methods جاهزة
4. ✅ Frontend authService methods جاهزة

## 🔄 المطلوب تطبيقه (Frontend UI فقط)

### الطريقة السريعة: استبدال ملف Login.tsx

راجع الملف التالي للحصول على الكود الكامل:
```
frontend/src/pages/auth/Login_NEW.tsx
```

**خيارات التطبيق:**

#### الخيار 1: النسخ المباشر (الأسهل)
```bash
# في مجلد المشروع
cp frontend/src/pages/auth/Login_NEW.tsx frontend/src/pages/auth/Login.tsx
```

#### الخيار 2: التعديل اليدوي

افتح `frontend/src/pages/auth/Login.tsx` وقم بما يلي:

**1. أضف imports في البداية:**
```typescript
import { authService } from '../../services/authService';
```

**2. أضف states بعد السطر 12:**
```typescript
// Recovery Modal States
const [showRecoveryModal, setShowRecoveryModal] = useState(false);
const [recoveryStep, setRecoveryStep] = useState<'phone' | 'otp' | 'choice'>('phone');
const [recoveryPhone, setRecoveryPhone] = useState('');
const [recoveryOtp, setRecoveryOtp] = useState('');
```

**3. احذف قسم "بيانات تجريبية"** (السطور 197-219)

**4. استبدله بزر:**
```tsx
<button
    onClick={() => setShowRecoveryModal(true)}
    className="forgot-password-button"
>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
    نسيت كلمة المرور أو تريد الدخول برمز التحقق؟
</button>
```

**5. أضف المودال قبل `</div>` النهائي** (قبل السطر 232):

```tsx
{/* Recovery Modal */}
{showRecoveryModal && (
    <div className="modal-overlay" onClick={() => setShowRecoveryModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* ... راجع Login_NEW.tsx للكود الكامل ... */}
        </div>
    </div>
)}
```

**6. أضف الـ CSS** في قسم `<style>`:
راجع `OTP_RECOVERY_FEATURE_REPORT.md` - قسم CSS

---

## 🏃‍♂️ الطريقة الأسرع

موجود في: `Login_NEW.tsx` - انسخه مباشرة!

الملف جاهز تماماً ومتكامل، فقط:
1. افتح `Login_NEW.tsx`
2. انسخ كل المحتوى (Ctrl+A, Ctrl+C)
3. افتح `Login.tsx`
4. الصق المحتوى (Ctrl+A, Ctrl+V)
5. احفظ (Ctrl+S)

✅ انتهى!

---

## 🧪 الاختبار

1. افتح `http://localhost:5176/login`
2. يجب أن ترى زر "نسيت كلمة المرور" بدلاً من "بيانات تجريبية"
3. اضغط عليه واتبع الخطوات

---

## 📞 الدعم

إذا واجهت مشكلة:
- راجع `OTP_RECOVERY_FEATURE_REPORT.md` للتفاصيل الكاملة
- تأكد من تشغيل Backend (`php -S localhost:8000`)
- تأكد من تشغيل Frontend (`npm run dev`)

**آخر تحديث:** 2025-12-09T21:20:00+03:00
