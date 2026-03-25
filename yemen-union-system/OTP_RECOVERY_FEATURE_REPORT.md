# تقرير تطبيق ميزة استعادة كلمة المرور والدخول بكود OTP
## Yemen Student Union System

**التاريخ:** 2025-12-09  
**الحالة:** ✅ Backend جاهز | 🔄 Frontend يحتاج تحديث

---

## 📋 نظرة عامة

تم تطبيق ميزة **استعادة كلمة المرور** و**تسجيل الدخول برمز التحقق (OTP)** كبديل عن قسم "بيانات تجري

بية" في صفحة Login.

### الميزة تعمل كالتالي:

1. **زر "نسيت كلمة المرور"** بدلاً من "بيانات تجريبية"
2. عند الضغط يفتح مودال لإدخال رقم الهاتف
3. يرسل كود تحقق OTP
4. بعد إدخال الكود، يظهر خياران:
   - **الدخول برمز التحقق** (تسجيل دخول مباشر)
   - **إعادة تعيين كلمة المرور** (تغيير كلمة المرور)

---

## ✅ ما تم إنجازه

### 1. Backend API (✅ مكتمل)

#### Routes الجديدة في `src/Routes/api.php`:
```php
// Password Recovery & OTP Login Routes
Router::post('/api/auth/send-recovery-otp', [AuthController::class, 'sendRecoveryOtp']);
Router::post('/api/auth/verify-recovery-otp', [AuthController::class, 'verifyRecoveryOtp']);
Router::post('/api/auth/login-with-otp', [AuthController::class, 'loginWithOtp']);
Router::post('/api/auth/reset-password-with-otp', [AuthController::class, 'resetPasswordWithOtp']);
```

#### Methods الجديدة في `AuthController.php`:
- `sendRecoveryOtp($request)` - إرسال رمز التحقق
- `verifyRecoveryOtp($request)` - التحقق من رمز OTP
- `loginWithOtp($request)` - تسجيل دخول مباشر بكود OTP
- `resetPasswordWithOtp($request)` - إعادة تعيين كلمة المرور بكود OTP

#### Methods الجديدة في `AuthService.php`:
- `sendRecoveryOtp($phoneNumber)` - منطق إرسال OTP
- `verifyRecoveryOtp($phoneNumber, $otp)` - منطق التحقق من OTP
- `loginWithOtp($phoneNumber, $otp, $ip, $userAgent)` - منطق تسجيل الدخول بOTP
- `resetPasswordWithOtp($phoneNumber, $otp, $newPassword)` - منطق إعادة تعيين كلمة المرور

### 2. Frontend Services (✅ مكتمل)

#### Methods الجديدة في `authService.ts`:
```typescript
sendRecoveryOtp(phoneNumber: string): Promise<any>
verifyRecoveryOtp(phoneNumber: string, otp: string): Promise<any>
loginWithOtp(phoneNumber: string, otp: string): Promise<AuthResponse>
resetPasswordWithOtp(phoneNumber, otp, newPassword, confirmPassword): Promise<void>
```

### 3. Frontend UI (🔄 يحتاج تحديث)

تم إنشاء ملف `Login_NEW.tsx` يحتوي على:
- ✅ إزالة قسم "بيانات تجريبية"
- ✅ إضافة زر "نسيت كلمة المرور"
- ✅ مودال استعادة كلمة المرور مع 3 خطوات:
  1. إدخال رقم الهاتف
  2. إدخال رمز OTP
  3. اختيار (دخول بOTP أو إعادة تعيين كلمة المرور)

---

## 🔧 خطوات ا لتطبيق النهائي

### الخطوة 1: استبدال Login.tsx

نظراً لكبر حجم الملف، الرجاء اتباع الخطوات التالية:

1. **افتح الملف:**  
   `frontend/src/pages/auth/Login.tsx`

2. **ابحث عن قسم "بيانات تجريبية"** (السطر 197-219 تقريباً):
```tsx
{/* Demo Credentials */}
<div className="demo-credentials">
    <div className="demo-icon">
        ...
    </div>
    <div className="demo-content">
        <h4>بيانات تجريبية</h4>
        <div className="demo-fields">
            <div className="demo-field">
                <span className="demo-label">الهاتف:</span>
                <code>05001234567</code>
            </div>
            <div className="demo-field">
                <span className="demo-label">كلمة المرور:</span>
                <code>Admin@123</code>
            </div>
        </div>
    </div>
</div>
```

3. **استبدله بـ:**
```tsx
{/* Forgot Password Button */}
<button
    onClick={() => setShowRecoveryModal(true)}
    className="forgot-password-button"
>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M12 8v4M12 16h.01" />
    </svg>
    نسيت كلمة المرور أو تريد الدخول برمز التحقق؟
</button>
```

4. **أضف States في بداية الـ component:**
```tsx
// Recovery Modal States
const [showRecoveryModal, setShowRecoveryModal] = useState(false);
const [recoveryStep, setRecoveryStep] = useState<'phone' | 'otp' | 'choice'>('phone');
const [recoveryPhone, setRecoveryPhone] = useState('');
const [recoveryOtp, setRecoveryOtp] = useState('');
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
```

5. **استورد authService في بداية الملف:**
```tsx
import { authService } from '../../services/authService';
```

---

## 📦 الملف الكامل الجاهز

تم إنشاء الملف الكامل في:
```
frontend/src/pages/auth/Login_NEW.tsx
```

**يمكنك:**
1. نسخ محتوى `Login_NEW.tsx`
2. استبدال محتوى `Login.tsx` به
3. أو التعديل يدوياً كما هو موضح أعلاه

---

## 🎨 CSS الجديد

أضف هذا الـ CSS في قسم `<style>` في ملف Login:

```css
/* Forgot Password Button */
.forgot-password-button {
    width: 100%;
    padding: 0.875rem 1rem;
    margin-top: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: #DC2626;
    background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
    border: 1px solid #FCA5A5;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.forgot-password-button:hover {
    background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
}

.forgot-password-button svg {
    width: 20px;
    height: 20px;
}

/* Modal Overlay */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.3s ease;
}

/* Modal Content */
.modal-content {
    background: white;
    border-radius: 20px;
    width: 90%;
    max-width: 480px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid #E5E7EB;
}

.modal-header h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #111827;
}

.modal-close {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #F3F4F6;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
}

.modal-close:hover {
    background: #E5E7EB;
}

.modal-close svg {
    width: 18px;
    height: 18px;
    color: #6B7280;
}

.modal-body {
    padding: 2rem;
}

/* Recovery Step */
.recovery-step {
    text-align: center;
}

.step-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.recovery-step h4 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 0.5rem;
}

.recovery-step p {
    color: #6B7280;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
}

.recovery-input {
    width: 100%;
    padding: 0.875rem 1rem;
    font-size: 1rem;
    border: 2px solid #E5E7EB;
    border-radius: 12px;
    background: #F9FAFB;
    transition: all 0.3s ease;
    margin-bottom: 1rem;
}

.recovery-input:focus {
    outline: none;
    border-color: #DC2626;
    background: white;
    box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1);
}

.otp-input {
    text-align: center;
    font-size: 1.5rem;
    letter-spacing: 0.5rem;
    font-weight: 700;
}

.recovery-button {
    width: 100%;
    padding: 1rem;
    font-size: 1rem;
    font-weight: 700;
    color: white;
    background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
}

.recovery-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
}

.recovery-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.back-button {
    width: 100%;
    padding: 0.875rem 1rem;
    margin-top: 0.75rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: #6B7280;
    background: #F3F4F6;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.back-button:hover {
    background: #E5E7EB;
}

/* Choice Buttons */
.choice-buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1.5rem;
}

.choice-button {
    width: 100%;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 700;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.choice-button.primary {
    color: white;
    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.choice-button.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.choice-button.secondary {
    color: #DC2626;
    background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
    border: 1px solid #FCA5A5;
}

.choice-button.secondary:hover {
    background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
    transform: translateY(-2px);
}

.choice-button svg {
    width: 20px;
    height: 20px;
}

/* Animations */
@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Update existing demo-credentials CSS to be display: none */
.demo-credentials {
    display: none;
}
```

---

## 🧪 الاختبار

### 1. اختبار Backend
```bash
# استخدم Postman أو curl للاختبار

# 1. إرسال OTP
curl -X POST http://localhost:8000/api/auth/send-recovery-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "05001234567"}'

# 2. التحقق من OTP
curl -X POST http://localhost:8000/api/auth/verify-recovery-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "05001234567", "otp": "123456"}'

# 3. تسجيل دخول بOTP
curl -X POST http://localhost:8000/api/auth/login-with-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "05001234567", "otp": "123456"}'

# 4. إعادة تعيين كلمة المرور
curl -X POST http://localhost:8000/api/auth/reset-password-with-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "05001234567",
    "otp": "123456",
    "new_password": "NewPass@123",
    "confirm_password": "NewPass@123"
  }'
```

### 2. اختبار Frontend

1. افتح الصفحة: `http://localhost:5176/login`
2. اضغط على زر "نسيت كلمة المرور"
3. أدخل رقم هاتف مسجل (مثلاً: `05001234567`)
4. أدخل كود OTP الذي يأتيك
5. اختر أحد الخيارين:
   - الدخول برمز التحقق
   - إعادة تعيين كلمة المرور

---

## 📝 ملاحظات مهمة

1. **الـ OTP يستخدم خدمة Wasender** - تأكد من أن API key صالح في `.env`
2. **رقم الهاتف يجب أن يكون مسجل في النظام** - لا يمكن استعادة حساب غير موجود
3. **الـ OTP صالح لمدة محددة** - تحقق من `OtpService.php` للتفاصيل
4. **بعد تغيير كلمة المرور** - سيتم إلغاء جميع الجلسات الحالية للأمان

---

## ✅ الحالة النهائية

- ✅ **Backend API:** جاهز ومكتمل
- ✅ **Frontend Services:** جاهز ومكتمل
- 🔄 **Frontend UI:** يحتاج استبدال Login.tsx
- 🔄 **CSS:** يحتاج إضافة

---

## 🚀 الخطوة التالية

1. استبدل `Login.tsx` بالمحتوى الجديد من `Login_NEW.tsx`
2. أو قم بالتعديل اليدوي كما هو موضح أعلاه
3. اختبر الميزة على المتصفح

---

**تم إنشاء التقرير في:** 2025-12-09T21:15:00+03:00  
**الحالة:** 🟡 قيد الانتظار لتطبيق Frontend
