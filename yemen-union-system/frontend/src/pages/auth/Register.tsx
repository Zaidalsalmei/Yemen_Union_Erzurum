import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../services/api';


interface RegisterData {
    full_name: string;
    phone_number: string;
    email?: string;
    admin_otp: string;
    password: string;
    confirm_password: string;
}

export function Register() {
    const navigate = useNavigate();
    const [step, setStep] = useState<'data' | 'otp'>('data');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);



    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterData>({ mode: 'onChange' });

    const password = watch('password');

    const onInitiateRegistration = async (data: RegisterData) => {
        setIsLoading(true);
        try {
            await api.post('/auth/request-admin-otp', {
                full_name: data.full_name,
                phone_number: data.phone_number
            });
            setStep('otp');
            toast.success('تم إرسال طلب الكود للمسؤول عبر تلجرام');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'فشل إرسال طلب التحقق');
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data: RegisterData) => {
        setIsLoading(true);
        try {
            await api.post('/auth/register', data);
            toast.success('تم إنشاء الحساب بنجاح! سيتم توجيهك لصفحة الدخول...', { duration: 2000 });
            setTimeout(() => {
                navigate('/login', { replace: true });
            }, 1500);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'كود التحقق خاطئ أو منتهي الصلاحية');
        } finally {
            setIsLoading(false);
        }
    };





    return (
        <div className="login-page">
            {/* Left Side - Branding */}
            <div className="login-branding">
                <div className="branding-overlay"></div>
                <div className="branding-pattern"></div>
                <div className="branding-content">
                    <div className="logo-container">
                        <div className="logo-icon">🎓</div>
                        <h1 className="logo-title">اتحاد الطلبة اليمنيين</h1>
                        <p className="logo-subtitle">أرضروم - تركيا</p>
                    </div>
                    <div className="branding-decoration">
                        <div className="decoration-ring ring-1"></div>
                        <div className="decoration-ring ring-2"></div>
                        <div className="decoration-ring ring-3"></div>
                    </div>
                    <div className="branding-features">
                        <div className="feature-item">
                            <span className="feature-icon">✨</span>
                            <span className="feature-text">انضم إلينا الآن</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">🤝</span>
                            <span className="feature-text">كن جزءاً من المجتمع</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">🚀</span>
                            <span className="feature-text">شارك في الأنشطة</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="login-form-container">
                <div className="login-form-wrapper">
                    {/* Mobile Logo */}
                    <div className="mobile-logo">
                        <div className="mobile-logo-icon">🎓</div>
                        <h1>اتحاد الطلبة اليمنيين</h1>
                    </div>

                    {/* Registration Progress */}
                    <div className="registration-steps mb-8">
                        <div className={`step-item ${step === 'data' ? 'active' : 'completed'}`}>
                            <div className="step-num">1</div>
                            <span className="step-text">البيانات</span>
                        </div>
                        <div className="step-divider"></div>
                        <div className={`step-item ${step === 'otp' ? 'active' : ''}`}>
                            <div className="step-num">2</div>
                            <span className="step-text">التحقق</span>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="login-header">
                        <h2 className="login-title">
                            {step === 'data' ? 'إنشاء حساب جديد' : 'تأكيد الحساب'}
                        </h2>
                        <p className="login-subtitle">
                            {step === 'data' ? 'أدخل بياناتك للانضمام إلى الاتحاد' : 'أدخل الكود الذي أرسله لك المسؤول'}
                        </p>
                    </div>

                    {/* Register Form */}
                    <form onSubmit={step === 'data' ? handleSubmit(onInitiateRegistration) : handleSubmit(onSubmit)} className="login-form">
                        {step === 'data' ? (
                            <>
                                {/* Full Name */}
                                <div className={`form-group ${errors.full_name ? 'has-error' : ''}`}>
                                    <label className="form-label">
                                        <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        الاسم الكامل
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="الاسم رباعي"
                                        className="form-input"
                                        {...register('full_name', {
                                            required: 'الاسم الكامل مطلوب',
                                            minLength: {
                                                value: 3,
                                                message: 'الاسم يجب أن يكون 3 أحرف على الأقل',
                                            },
                                        })}
                                    />
                                    {errors.full_name && (
                                        <p className="form-error">{errors.full_name.message}</p>
                                    )}
                                </div>

                                {/* Phone Number */}
                                <div className={`form-group ${errors.phone_number ? 'has-error' : ''}`}>
                                    <label className="form-label">
                                        <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                        </svg>
                                        رقم الهاتف
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="05XXXXXXXXX"
                                        className="form-input"
                                        dir="ltr"
                                        {...register('phone_number', {
                                            required: 'رقم الهاتف مطلوب',
                                            pattern: {
                                                value: /^05\d{9}$/,
                                                message: 'رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 11 رقم',
                                            },
                                        })}
                                    />
                                    {errors.phone_number && (
                                        <p className="form-error">{errors.phone_number.message}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
                                    <label className="form-label">
                                        <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                        البريد الإلكتروني (اختياري)
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="example@email.com"
                                        className="form-input"
                                        dir="ltr"
                                        {...register('email', {
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'بريد إلكتروني غير صالح',
                                            },
                                        })}
                                    />
                                    {errors.email && (
                                        <p className="form-error">{errors.email.message}</p>
                                    )}
                                </div>

                                {/* Password */}
                                <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
                                    <label className="form-label">
                                        <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                        كلمة المرور
                                    </label>
                                    <div className="input-wrapper password-wrapper">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            className="form-input"
                                            {...register('password', {
                                                required: 'كلمة المرور مطلوبة',
                                                minLength: {
                                                    value: 6,
                                                    message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
                                                },
                                            })}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                    <line x1="1" y1="1" x2="23" y2="23" />
                                                </svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="form-error">{errors.password.message}</p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className={`form-group ${errors.confirm_password ? 'has-error' : ''}`}>
                                    <label className="form-label">
                                        <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                        </svg>
                                        تأكيد كلمة المرور
                                    </label>
                                    <div className="input-wrapper password-wrapper">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            className="form-input"
                                            {...register('confirm_password', {
                                                validate: (val) => val === password || 'كلمات المرور غير متطابقة',
                                            })}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                    <line x1="1" y1="1" x2="23" y2="23" />
                                                </svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.confirm_password && (
                                        <p className="form-error">{errors.confirm_password.message}</p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="admin-verification-section">
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg mb-6 text-center">
                                    <p className="text-sm text-blue-800 leading-relaxed font-bold mb-1">
                                        👋 تم إرسال طلبك للمسؤول
                                    </p>
                                    <p className="text-xs text-blue-600">
                                        يرجى إدخال الكود الذي سيصلك الآن لإتمام التسجيل.
                                    </p>
                                </div>

                                <div className={`form-group ${errors.admin_otp ? 'has-error' : ''}`}>
                                    <label className="form-label justify-center">كود التحقق الخاص بك</label>
                                    <input
                                        type="text"
                                        placeholder="AD-XXXX"
                                        className="form-input text-center text-xl font-black tracking-widest uppercase"
                                        dir="ltr"
                                        autoFocus
                                        {...register('admin_otp', {
                                            required: 'كود التحقق مطلوب لإتمام التسجيل'
                                        })}
                                    />
                                    {errors.admin_otp && (
                                        <p className="form-error text-center">{errors.admin_otp.message}</p>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setStep('data')}
                                    className="text-slate-400 text-xs mt-6 hover:text-red-500 transition-colors w-full"
                                >
                                    ← العودة لتعديل البيانات
                                </button>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`login-button ${step === 'otp' ? 'mt-6' : ''}`}
                        >
                            {isLoading ? (
                                <span className="loading-state">
                                    <svg className="spinner" viewBox="0 0 24 24">
                                        <circle className="spinner-circle" cx="12" cy="12" r="10" fill="none" strokeWidth="3" />
                                    </svg>
                                    {step === 'data' ? 'جاري إرسال الطلب...' : 'جاري التحقق...'}
                                </span>
                            ) : (
                                <span className="button-content">
                                    {step === 'data' ? (
                                        <>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                            إنشاء حساب وطلب الكود
                                        </>
                                    ) : (
                                        <>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 6L9 17l-5-5" />
                                            </svg>
                                            تأكيد وإنهاء التسجيل
                                        </>
                                    )}
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="login-footer">
                        <p>
                            لديك حساب بالفعل؟{' '}
                            <Link to="/login" className="text-red-600 hover:text-red-800 font-semibold transition-colors">
                                تسجيل الدخول
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                /* Standardized Auth Styles using Content Shell Tokens */
                :root {
                    /* Fallbacks if variables not available */
                    --color-primary: #DC2626;
                }

            .login-page {
                display: flex;
            min-height: 100vh;
            background: #f8fafc;
            direction: rtl;
            font-family: 'Cairo', sans-serif;
                }

            /* Branding Side */
            .login-branding {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                background: linear-gradient(135deg, #d21f3c 0%, #8a0e23 60%, #000000 100%);
                overflow: hidden;
                color: white;
            }

            .branding-overlay {
                position: absolute;
                inset: 0;
                background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
                opacity: 0.4;
            }

            .branding-pattern {
                position: absolute;
            inset: 0;
            background: radial-gradient(circle at 30% 70%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 30%, rgba(255,255,255,0.08) 0%, transparent 40%);
                }

            .branding-content {
                position: relative;
            z-index: 10;
            text-align: center;
            padding: 2rem;
                }

            .logo-container {animation: fadeInUp 0.8s ease-out; }
            .logo-icon {
                font - size: 4rem;
            margin-bottom: 1rem;
            filter: drop-shadow(0 4px 20px rgba(0,0,0,0.3));
            animation: float 3s ease-in-out infinite;
                }

            @keyframes float {
                0 %, 100 % { transform: translateY(0); }
                    50% {transform: translateY(-10px); }
                }

            .logo-title {
                font - size: 2rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
            text-shadow: 0 2px 10px rgba(0,0,0,0.2);
                }
            .logo-subtitle {font - size: 1.1rem; opacity: 0.9; font-weight: 300; }

            .branding-decoration {
                position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
                }
            .decoration-ring {
                position: absolute;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 50%;
            animation: pulse-ring 4s ease-in-out infinite;
                }
            .ring-1 {width: 200px; height: 200px; top: -100px; left: -100px; }
            .ring-2 {width: 300px; height: 300px; top: -150px; left: -150px; animation-delay: 0.5s; }
            .ring-3 {width: 400px; height: 400px; top: -200px; left: -200px; animation-delay: 1s; }

            @keyframes pulse-ring {
                0 %, 100 % { transform: scale(1); opacity: 0.5; }
                    50% {transform: scale(1.05); opacity: 0.3; }
                }

            .branding-features {
                margin - top: 3rem;
            display: flex; flex-direction: column; gap: 1rem;
            animation: fadeInUp 0.8s ease-out 0.3s both;
                }
            .feature-item {
                display: flex; align-items: center; justify-content: center;
            gap: 0.75rem; padding: 0.75rem 1.5rem;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 50px;
            border: 1px solid rgba(255,255,255,0.15);
            transition: all 0.3s ease;
                }
            .feature-item:hover {background: rgba(255,255,255,0.15); transform: translateX(5px); }

            /* Form Side */
            .login-form-container {
                flex: 1;
            display: flex; align-items: center; justify-content: center;
            padding: 2rem; background: white;
                }
            .login-form-wrapper {
                width: 100%; max-width: 480px;
            animation: fadeIn 0.6s ease-out;
            padding: 0 1rem;
                }

            .mobile-logo {display: none; text-align: center; margin-bottom: 2rem; }
            .mobile-logo-icon {font - size: 3rem; margin-bottom: 0.5rem; }
            .mobile-logo h1 {font - size: 1.25rem; font-weight: 700; color: var(--color-primary); }

            .login-header {text - align: center; margin-bottom: 2.5rem; }
            .login-title {font - size: 1.75rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem; }
            .login-subtitle {color: #64748b; font-size: 0.95rem; }

            /* Form Elements - Standardized */
            .login-form {display: flex; flex-direction: column; gap: 1.25rem; }
            .form-group {display: flex; flex-direction: column; gap: 0.5rem; }

            .form-label {
                display: flex; align-items: center; gap: 0.5rem;
            font-size: 14px; font-weight: 600; color: #334155;
                }
            .label-icon {width: 16px; height: 16px; color: #94a3b8; }

            .input-wrapper {position: relative; }

            .form-input {
                width: 100%;
            height: 44px; /* Standard Height */
            padding: 0 16px;
            font-size: 14px;
            border: 1px solid #e2e8f0;
            border-radius: 10px; /* Standardize on 10 or 12px? Using 10px matching content shell roughly */
            background: #fff;
            transition: all 0.2s;
            outline: none;
                }
            .form-input:focus { border-color: var(--color-primary); }

            /* New Step Styles */
            .registration-steps {
                display: flex; align-items: center; justify-content: center;
                gap: 1rem;
            }
            .step-item {
                display: flex; flex-direction: column; align-items: center;
                gap: 0.5rem; opacity: 0.5; transition: all 0.3s;
            }
            .step-item.active { opacity: 1; transform: scale(1.1); }
            .step-item.completed { opacity: 0.8; color: #10b981; }
            .step-num {
                width: 32px; height: 32px; border-radius: 50%;
                background: #e2e8f0; color: #475569;
                display: flex; align-items: center; justify-content: center;
                font-weight: 800; font-size: 14px;
                border: 2px solid transparent;
            }
            .step-item.active .step-num {
                background: var(--color-primary); color: white;
                box-shadow: 0 0 15px rgba(220, 38, 38, 0.3);
            }
            .step-item.completed .step-num {
                background: #10b981; color: white;
            }
            .step-text { font-size: 12px; font-weight: 700; }
            .step-divider {
                width: 40px; height: 2px; background: #e2e8f0;
                margin-top: -1.5rem;
            }
                border - color: var(--color-primary);
            box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1); 
                }
            .form-input::placeholder {color: #94a3b8; }
            .form-group.has-error .form-input {border - color: #ef4444; background: #fef2f2; }
            .form-error {font - size: 12px; color: #ef4444; margin-top: 4px; }

            .password-toggle {
                position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
            background: none; border: none; padding: 4px;
            cursor: pointer; color: #94a3b8;
                }
            .password-toggle:hover {color: #64748b; }
            .password-toggle svg {width: 18px; height: 18px; }

            /* Actions */
            .login-button {
                width: 100%;
            height: 44px; /* Standard Height */
            display: flex; align-items: center; justify-content: center;
            font-size: 14px; font-weight: 700;
            color: white;
            background: var(--color-primary);
            border: none;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
            .login-button:hover:not(:disabled) {filter: brightness(1.1); transform: translateY(-1px); }
            .login-button:disabled {opacity: 0.7; cursor: not-allowed; }

            .login-footer { margin-top: 2rem; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 1.5rem; }
            .login-footer p { font-size: 14px; color: #64748b; }

            /* Mobile */
            @media (max-width: 1024px) {
                .login-branding { display: none; }
                .login-form-container { background: #f8fafc; }
                .mobile-logo { display: block; }
            }

            /* Registration Steps UI */
            .registration-steps {
                display: flex; align-items: center; justify-content: center;
                gap: 1rem; margin-bottom: 2.5rem;
            }
            .step-item {
                display: flex; flex-direction: column; align-items: center;
                gap: 0.5rem; opacity: 0.5; transition: all 0.3s;
            }
            .step-item.active { opacity: 1; transform: scale(1.05); }
            .step-item.completed { opacity: 0.8; color: #10b981; }
            .step-num {
                width: 30px; height: 30px; border-radius: 50%;
                background: #f1f5f9; color: #64748b;
                display: flex; align-items: center; justify-content: center;
                font-weight: 800; font-size: 13px;
                border: 2px solid #e2e8f0;
            }
            .step-item.active .step-num {
                background: var(--color-primary); color: white;
                border-color: var(--color-primary);
                box-shadow: 0 0 15px rgba(220, 38, 38, 0.2);
            }
            .step-item.completed .step-num {
                background: #10b981; color: white; border-color: #10b981;
            }
            .step-text { font-size: 11px; font-weight: 700; }
            .step-divider {
                width: 40px; height: 1px; background: #e2e8f0;
                margin-top: -1.2rem;
            }

            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

            `}</style>
        </div >
    );
}
