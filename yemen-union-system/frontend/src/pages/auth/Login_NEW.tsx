import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import type { LoginCredentials } from '../../types';

export function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Recovery Modal States
    const [showRecoveryModal, setShowRecoveryModal] = useState(false);
    const [recoveryStep, setRecoveryStep] = useState<'phone' | 'otp' | 'choice'>('phone');
    const [recoveryPhone, setRecoveryPhone] = useState('');
    const [recoveryOtp, setRecoveryOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginCredentials>();

    const onSubmit = async (data: LoginCredentials) => {
        setIsLoading(true);
        try {
            await login(data);
            toast.success('مرحباً بك! تم تسجيل الدخول بنجاح');
            navigate('/');
        } catch (error: any) {
            const message = error.response?.data?.message || 'خطأ في تسجيل الدخول. تحقق من البيانات';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    // Recovery Functions
    const handleSendRecoveryOtp = async () => {
        if (!recoveryPhone || !/^05\d{9}$/.test(recoveryPhone)) {
            toast.error('رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 11 رقم');
            return;
        }

        setIsLoading(true);
        try {
            await authService.sendRecoveryOtp(recoveryPhone);
            toast.success('تم إرسال رمز التحقق إلى هاتفك');
            setRecoveryStep('otp');
        } catch (error: any) {
            const message = error.response?.data?.message || 'فشل إرسال رمز التحقق';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!recoveryOtp || recoveryOtp.length !== 6) {
            toast.error('رمز التحقق يجب أن يتكون من 6 أرقام');
            return;
        }

        setIsLoading(true);
        try {
            await authService.verifyRecoveryOtp(recoveryPhone, recoveryOtp);
            toast.success('تم التحقق بنجاح!');
            setRecoveryStep('choice');
        } catch (error: any) {
            const message = error.response?.data?.message || 'رمز التحقق غير صحيح';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginWithOtp = async () => {
        setIsLoading(true);
        try {
            const response = await authService.loginWithOtp(recoveryPhone, recoveryOtp);
            localStorage.setItem('token', response.token);
            toast.success('مرحباً بك! تم تسجيل الدخول بنجاح');
            navigate('/');
            window.location.reload(); // Reload to update auth context
        } catch (error: any) {
            const message = error.response?.data?.message || 'فشل تسجيل الدخول';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('كلمة المرور غير متطابقة');
            return;
        }

        setIsLoading(true);
        try {
            await authService.resetPasswordWithOtp(recoveryPhone, recoveryOtp, newPassword, confirmPassword);
            toast.success('تم إعادة تعيين كلمة المرور بنجاح! يمكنك تسجيل الدخول الآن');
            setShowRecoveryModal(false);
            setRecoveryStep('phone');
            setRecoveryPhone('');
            setRecoveryOtp('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            const message = error.response?.data?.message || 'فشل إعادة تعيين كلمة المرور';
            toast.error(message);
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
                            <span className="feature-icon">👥</span>
                            <span className="feature-text">إدارة الأعضاء</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">📊</span>
                            <span className="feature-text">متابعة الأنشطة</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">💳</span>
                            <span className="feature-text">إدارة الاشتراكات</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="login-form-container">
                <div className="login-form-wrapper">
                    {/* Mobile Logo */}
                    <div className="mobile-logo">
                        <div className="mobile-logo-icon">🎓</div>
                        <h1>اتحاد الطلبة اليمنيين</h1>
                    </div>

                    {/* Welcome Header */}
                    <div className="login-header">
                        <h2 className="login-title">مرحباً بعودتك</h2>
                        <p className="login-subtitle">سجّل دخولك للوصول إلى لوحة التحكم</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="login-form">
                        {/* Phone Number Field */}
                        <div className={`form-group ${errors.phone_number ? 'has-error' : ''}`}>
                            <label className="form-label">
                                <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                                رقم الهاتف
                            </label>
                            <div className="input-wrapper">
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
                                <div className="input-focus-ring"></div>
                            </div>
                            {errors.phone_number && (
                                <p className="form-error">
                                    <svg viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.phone_number.message}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
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
                                <div className="input-focus-ring"></div>
                            </div>
                            {errors.password && (
                                <p className="form-error">
                                    <svg viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="login-button"
                        >
                            {isLoading ? (
                                <span className="loading-state">
                                    <svg className="spinner" viewBox="0 0 24 24">
                                        <circle className="spinner-circle" cx="12" cy="12" r="10" fill="none" strokeWidth="3" />
                                    </svg>
                                    جاري تسجيل الدخول...
                                </span>
                            ) : (
                                <span className="button-content">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                        <polyline points="10 17 15 12 10 7" />
                                        <line x1="15" y1="12" x2="3" y2="12" />
                                    </svg>
                                    تسجيل الدخول
                                </span>
                            )}
                        </button>
                    </form>

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

                    {/* Footer */}
                    <div className="login-footer">
                        <p>© 2025 اتحاد الطلبة اليمنيين في تركيا</p>
                        <p className="mt-2 text-sm">
                            ليس لديك حساب؟{' '}
                            <Link to="/register" className="text-red-600 hover:text-red-800 font-semibold transition-colors">
                                إنشاء حساب جديد
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Recovery Modal */}
            {showRecoveryModal && (
                <div className="modal-overlay" onClick={() => setShowRecoveryModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>استعادة الدخول</h3>
                            <button className="modal-close" onClick={() => setShowRecoveryModal(false)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="modal-body">
                            {recoveryStep === 'phone' && (
                                <div className="recovery-step">
                                    <div className="step-icon">📱</div>
                                    <h4>أدخل رقم هاتفك</h4>
                                    <p>سنرسل لك رمز تحقق لاستعادة الوصول إلى حسابك</p>
                                    <input
                                        type="tel"
                                        placeholder="05XXXXXXXXX"
                                        value={recoveryPhone}
                                        onChange={(e) => setRecoveryPhone(e.target.value)}
                                        className="recovery-input"
                                        dir="ltr"
                                    />
                                    <button
                                        onClick={handleSendRecoveryOtp}
                                        disabled={isLoading}
                                        className="recovery-button"
                                    >
                                        {isLoading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
                                    </button>
                                </div>
                            )}

                            {recoveryStep === 'otp' && (
                                <div className="recovery-step">
                                    <div className="step-icon">🔢</div>
                                    <h4>أدخل رمز التحقق</h4>
                                    <p>تم إرسال رمز التحقق إلى {recoveryPhone}</p>
                                    <input
                                        type="text"
                                        placeholder="000000"
                                        value={recoveryOtp}
                                        onChange={(e) => setRecoveryOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="recovery-input otp-input"
                                        dir="ltr"
                                        maxLength={6}
                                    />
                                    <button
                                        onClick={handleVerifyOtp}
                                        disabled={isLoading}
                                        className="recovery-button"
                                    >
                                        {isLoading ? 'جاري التحقق...' : 'تحقق من الرمز'}
                                    </button>
                                    <button
                                        onClick={() => setRecoveryStep('phone')}
                                        className="back-button"
                                    >
                                        العودة
                                    </button>
                                </div>
                            )}

                            {recoveryStep === 'choice' && (
                                <div className="recovery-step">
                                    <div className="step-icon">✅</div>
                                    <h4>تم التحقق بنجاح!</h4>
                                    <p>اختر ما تريد فعله:</p>

                                    <div className="choice-buttons">
                                        <button
                                            onClick={handleLoginWithOtp}
                                            disabled={isLoading}
                                            className="choice-button primary"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                                <polyline points="10 17 15 12 10 7" />
                                                <line x1="15" y1="12" x2="3" y2="12" />
                                            </svg>
                                            الدخول برمز التحقق
                                        </button>

                                        <button
                                            onClick={() => {
                                                // Show password reset form
                                                const modal = document.querySelector('.recovery-step');
                                                if (modal) {
                                                    modal.innerHTML = `
                                                        <div class="recovery-step">
                                                            <div class="step-icon">🔑</div>
                                                            <h4>إعادة تعيين كلمة المرور</h4>
                                                            <p>أدخل كلمة المرور الجديدة</p>
                                                        </div>
                                                    `;
                                                }
                                                setRecoveryStep('phone'); // Will be handled in the next render
                                            }}
                                            className="choice-button secondary"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                            </svg>
                                            إعادة تعيين كلمة المرور
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                // ... [CSS محذوف مؤقتاً للطول - سأتابع في رسالة منفصلة]
            `}</style>
        </div>
    );
}
