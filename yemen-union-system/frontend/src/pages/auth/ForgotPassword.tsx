import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../services/api';

type Step = 'phone' | 'otp' | 'password' | 'success';

interface EmailFormData {
    email: string;
}

interface OtpFormData {
    otp: string;
}

interface PasswordFormData {
    new_password: string;
    confirm_password: string;
}

export function ForgotPassword() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<Step>('phone');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const emailForm = useForm<EmailFormData>();
    const otpForm = useForm<OtpFormData>();
    const passwordForm = useForm<PasswordFormData>();

    // Step 1: Send OTP to email
    const onSendOtp = async (data: EmailFormData) => {
        setIsLoading(true);
        try {
            await api.post('/auth/send-recovery-otp', {
                email: data.email,
            });
            setEmail(data.email);
            setCurrentStep('otp');
            toast.success('تم إرسال رمز التحقق إلى بريدك الإلكتروني');
        } catch (error: any) {
            const message = error.response?.data?.message || 'فشل إرسال رمز التحقق';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify OTP
    const onVerifyOtp = async (data: OtpFormData) => {
        setIsLoading(true);
        try {
            await api.post('/auth/verify-recovery-otp', {
                email: email,
                otp: data.otp,
            });
            setCurrentStep('password');
            toast.success('تم التحقق بنجاح');
        } catch (error: any) {
            const message = error.response?.data?.message || 'رمز التحقق غير صحيح';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Reset Password
    const onResetPassword = async (data: PasswordFormData) => {
        setIsLoading(true);
        try {
            await api.post('/auth/reset-password-with-otp', {
                email: email,
                otp: otpForm.getValues('otp'),
                new_password: data.new_password,
                confirm_password: data.confirm_password,
            });
            setCurrentStep('success');
            toast.success('تم إعادة تعيين كلمة المرور بنجاح');
        } catch (error: any) {
            const message = error.response?.data?.message || 'فشل إعادة تعيين كلمة المرور';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setIsLoading(true);
        try {
            await api.post('/auth/send-recovery-otp', {
                email: email,
            });
            toast.success('تم إعادة إرسال رمز التحقق');
        } catch (error: any) {
            const message = error.response?.data?.message || 'فشل إعادة إرسال رمز التحقق';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="forgot-password-page">
            {/* Left Side - Branding */}
            <div className="forgot-branding">
                <div className="branding-overlay"></div>
                <div className="branding-pattern"></div>
                <div className="branding-content">
                    <div className="logo-container">
                        <div className="logo-icon">🔐</div>
                        <h1 className="logo-title">استعادة كلمة المرور</h1>
                        <p className="logo-subtitle">نظام آمن ومحمي</p>
                    </div>
                    <div className="branding-features">
                        <div className="feature-item">
                            <span className="feature-icon">📱</span>
                            <span className="feature-text">التحقق عبر البريد الإلكتروني</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">🔒</span>
                            <span className="feature-text">حماية متقدمة</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">⚡</span>
                            <span className="feature-text">استعادة سريعة</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="forgot-form-container">
                <div className="forgot-form-wrapper">
                    {/* Mobile Logo */}
                    <div className="mobile-logo">
                        <div className="mobile-logo-icon">🔐</div>
                        <h1>استعادة كلمة المرور</h1>
                    </div>

                    {/* Progress Steps */}
                    <div className="progress-steps">
                        <div className={`step ${currentStep === 'phone' ? 'active' : ''} ${['otp', 'password', 'success'].includes(currentStep) ? 'completed' : ''}`}>
                            <div className="step-circle">1</div>
                            <div className="step-label">البريد الإلكتروني</div>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step ${currentStep === 'otp' ? 'active' : ''} ${['password', 'success'].includes(currentStep) ? 'completed' : ''}`}>
                            <div className="step-circle">2</div>
                            <div className="step-label">التحقق</div>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step ${currentStep === 'password' ? 'active' : ''} ${currentStep === 'success' ? 'completed' : ''}`}>
                            <div className="step-circle">3</div>
                            <div className="step-label">كلمة المرور</div>
                        </div>
                    </div>

                    {/* Step 1: Phone Number */}
                    {currentStep === 'phone' && (
                        <div className="step-content">
                            <div className="step-header">
                                <h2>أدخل بريدك الإلكتروني</h2>
                                <p>سنرسل لك رمز التحقق إلى بريدك الإلكتروني المسجل</p>
                            </div>
                            <form onSubmit={emailForm.handleSubmit(onSendOtp)} className="forgot-form">
                                <div className={`form-group ${emailForm.formState.errors.email ? 'has-error' : ''}`}>
                                    <label className="form-label">
                                        <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                        البريد الإلكتروني
                                    </label>
                                    <div className="input-wrapper">
                                        <input
                                            type="email"
                                            placeholder="example@email.com"
                                            className="form-input"
                                            dir="ltr"
                                            {...emailForm.register('email', {
                                                required: 'البريد الإلكتروني مطلوب',
                                                pattern: {
                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                    message: 'يرجى إدخال بريد إلكتروني صحيح',
                                                },
                                            })}
                                        />
                                    </div>
                                    {emailForm.formState.errors.email && (
                                        <p className="form-error">
                                            <svg viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {emailForm.formState.errors.email.message}
                                        </p>
                                    )}
                                </div>
                                <button type="submit" disabled={isLoading} className="submit-button">
                                    {isLoading ? (
                                        <span className="loading-state">
                                            <svg className="spinner" viewBox="0 0 24 24">
                                                <circle className="spinner-circle" cx="12" cy="12" r="10" fill="none" strokeWidth="3" />
                                            </svg>
                                            جاري الإرسال...
                                        </span>
                                    ) : (
                                        <span className="button-content">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M22 2L11 13" />
                                                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                                            </svg>
                                            إرسال رمز التحقق
                                        </span>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Step 2: OTP Verification */}
                    {currentStep === 'otp' && (
                        <div className="step-content">
                            <div className="step-header">
                                <h2>أدخل رمز التحقق</h2>
                                <p>تم إرسال رمز التحقق إلى بريدك الإلكتروني المسجل</p>
                            </div>
                            <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="forgot-form">
                                <div className={`form-group ${otpForm.formState.errors.otp ? 'has-error' : ''}`}>
                                    <label className="form-label">
                                        <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                        رمز التحقق
                                    </label>
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            placeholder="XXXXXX"
                                            className="form-input otp-input"
                                            dir="ltr"
                                            maxLength={6}
                                            {...otpForm.register('otp', {
                                                required: 'رمز التحقق مطلوب',
                                                pattern: {
                                                    value: /^\d{6}$/,
                                                    message: 'رمز التحقق يجب أن يتكون من 6 أرقام',
                                                },
                                            })}
                                        />
                                    </div>
                                    {otpForm.formState.errors.otp && (
                                        <p className="form-error">
                                            <svg viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {otpForm.formState.errors.otp.message}
                                        </p>
                                    )}
                                </div>
                                <button type="submit" disabled={isLoading} className="submit-button">
                                    {isLoading ? (
                                        <span className="loading-state">
                                            <svg className="spinner" viewBox="0 0 24 24">
                                                <circle className="spinner-circle" cx="12" cy="12" r="10" fill="none" strokeWidth="3" />
                                            </svg>
                                            جاري التحقق...
                                        </span>
                                    ) : (
                                        <span className="button-content">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            تحقق
                                        </span>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={isLoading}
                                    className="resend-button"
                                >
                                    إعادة إرسال الرمز
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Step 3: New Password */}
                    {currentStep === 'password' && (
                        <div className="step-content">
                            <div className="step-header">
                                <h2>أدخل كلمة المرور الجديدة</h2>
                                <p>اختر كلمة مرور قوية وآمنة</p>
                            </div>
                            <form onSubmit={passwordForm.handleSubmit(onResetPassword)} className="forgot-form">
                                <div className={`form-group ${passwordForm.formState.errors.new_password ? 'has-error' : ''}`}>
                                    <label className="form-label">
                                        <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                        كلمة المرور الجديدة
                                    </label>
                                    <div className="input-wrapper password-wrapper">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            className="form-input"
                                            {...passwordForm.register('new_password', {
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
                                    {passwordForm.formState.errors.new_password && (
                                        <p className="form-error">
                                            <svg viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {passwordForm.formState.errors.new_password.message}
                                        </p>
                                    )}
                                </div>

                                <div className={`form-group ${passwordForm.formState.errors.confirm_password ? 'has-error' : ''}`}>
                                    <label className="form-label">
                                        <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                        تأكيد كلمة المرور
                                    </label>
                                    <div className="input-wrapper password-wrapper">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            className="form-input"
                                            {...passwordForm.register('confirm_password', {
                                                required: 'تأكيد كلمة المرور مطلوب',
                                                validate: (value) =>
                                                    value === passwordForm.getValues('new_password') || 'كلمة المرور غير متطابقة',
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
                                    {passwordForm.formState.errors.confirm_password && (
                                        <p className="form-error">
                                            <svg viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {passwordForm.formState.errors.confirm_password.message}
                                        </p>
                                    )}
                                </div>

                                <button type="submit" disabled={isLoading} className="submit-button">
                                    {isLoading ? (
                                        <span className="loading-state">
                                            <svg className="spinner" viewBox="0 0 24 24">
                                                <circle className="spinner-circle" cx="12" cy="12" r="10" fill="none" strokeWidth="3" />
                                            </svg>
                                            جاري الحفظ...
                                        </span>
                                    ) : (
                                        <span className="button-content">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                                <polyline points="17 21 17 13 7 13 7 21" />
                                                <polyline points="7 3 7 8 15 8" />
                                            </svg>
                                            حفظ كلمة المرور
                                        </span>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Step 4: Success */}
                    {currentStep === 'success' && (
                        <div className="step-content success-content">
                            <div className="success-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                            <h2>تم بنجاح!</h2>
                            <p>تم إعادة تعيين كلمة المرور بنجاح</p>
                            <button
                                onClick={() => navigate('/login')}
                                className="submit-button"
                            >
                                <span className="button-content">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                        <polyline points="10 17 15 12 10 7" />
                                        <line x1="15" y1="12" x2="3" y2="12" />
                                    </svg>
                                    تسجيل الدخول
                                </span>
                            </button>
                        </div>
                    )}

                    {/* Back to Login Link */}
                    {currentStep !== 'success' && (
                        <div className="back-to-login">
                            <Link to="/login">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="19" y1="12" x2="5" y2="12" />
                                    <polyline points="12 19 5 12 12 5" />
                                </svg>
                                العودة إلى تسجيل الدخول
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                :root {
                    --color-primary: #DC2626;
                }

                .forgot-password-page {
                    display: flex;
                    min-height: 100vh;
                    background: #f8fafc;
                    direction: rtl;
                    font-family: 'Cairo', sans-serif;
                }

                /* Branding Side */
                .forgot-branding {
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

                .logo-container { animation: fadeInUp 0.8s ease-out; }
                .logo-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    filter: drop-shadow(0 4px 20px rgba(0,0,0,0.3));
                    animation: float 3s ease-in-out infinite;
                }
                .logo-title {
                    font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem;
                    text-shadow: 0 2px 10px rgba(0,0,0,0.2);
                }
                .logo-subtitle { font-size: 1.1rem; opacity: 0.9; font-weight: 300; }

                .branding-features {
                    margin-top: 3rem;
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
                .feature-item:hover { background: rgba(255,255,255,0.15); transform: translateX(5px); }
                .feature-icon { font-size: 1.25rem; }
                .feature-text { font-size: 0.95rem; font-weight: 500; }

                /* Form Side */
                .forgot-form-container {
                    flex: 1;
                    display: flex; align-items: center; justify-content: center;
                    padding: 2rem; background: white;
                }
                .forgot-form-wrapper {
                    width: 100%; max-width: 480px;
                    animation: fadeIn 0.6s ease-out;
                }

                .mobile-logo { display: none; text-align: center; margin-bottom: 2rem; }
                .mobile-logo-icon { font-size: 3rem; margin-bottom: 0.5rem; }
                .mobile-logo h1 { font-size: 1.25rem; font-weight: 700; color: var(--color-primary); }

                /* Progress Steps */
                .progress-steps {
                    display: flex; align-items: center; justify-content: center;
                    margin-bottom: 2.5rem; padding: 1.5rem 0;
                }
                .step { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
                .step-circle {
                    width: 40px; height: 40px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-weight: 700; font-size: 0.9rem;
                    background: #f1f5f9; color: #94a3b8; transition: all 0.3s;
                }
                .step.active .step-circle {
                    background: var(--color-primary); color: white;
                    box-shadow: 0 4px 10px rgba(220, 38, 38, 0.3);
                }
                .step.completed .step-circle { background: #10B981; color: white; }
                
                .step-label { font-size: 12px; color: #64748b; font-weight: 500; }
                .step.active .step-label { color: var(--color-primary); font-weight: 700; }
                .step.completed .step-label { color: #10B981; }
                
                .step-line {
                    width: 60px; height: 2px; background: #f1f5f9;
                    margin: 0 0.5rem; margin-bottom: 1.5rem;
                }

                /* Step Content */
                .step-content { animation: fadeInUp 0.5s ease-out; }
                .step-header { text-align: center; margin-bottom: 2rem; }
                .step-header h2 { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem; }
                .step-header p { color: #64748b; font-size: 14px; }

                /* Form Styles */
                .forgot-form { display: flex; flex-direction: column; gap: 1.5rem; }
                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                
                .form-label {
                    display: flex; align-items: center; gap: 0.5rem;
                    font-size: 14px; font-weight: 600; color: #334155;
                }
                .label-icon { width: 16px; height: 16px; color: #94a3b8; }
                .input-wrapper { position: relative; }

                .form-input {
                    width: 100%; height: 44px;
                    padding: 0 16px;
                    font-size: 14px;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    background: #fff;
                    transition: all 0.2s;
                    outline: none;
                }
                .form-input:focus {
                    border-color: var(--color-primary);
                    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
                }
                .form-input::placeholder { color: #94a3b8; }
                .form-group.has-error .form-input { border-color: #ef4444; background: #fef2f2; }

                .otp-input {
                    text-align: center; font-size: 1.5rem; letter-spacing: 0.5rem; font-weight: 700;
                }

                .password-toggle {
                    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
                    background: none; border: none; padding: 4px;
                    cursor: pointer; color: #94a3b8;
                }
                .password-toggle:hover { color: #64748b; }
                .password-toggle svg { width: 18px; height: 18px; }

                .form-error {
                    display: flex; align-items: center; gap: 0.375rem;
                    font-size: 12px; color: #ef4444;
                    animation: shake 0.4s ease-in-out;
                }
                .form-error svg { width: 16px; height: 16px; flex-shrink: 0; }

                /* Buttons */
                .submit-button {
                    width: 100%; height: 44px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 14px; font-weight: 700;
                    color: white;
                    background: var(--color-primary);
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .submit-button:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
                .submit-button:disabled { opacity: 0.7; cursor: not-allowed; }

                .button-content, .loading-state {
                    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
                }
                .button-content svg, .loading-state svg { width: 20px; height: 20px; }

                .resend-button {
                    width: 100%; padding: 12px;
                    font-size: 14px; font-weight: 600;
                    color: var(--color-primary); background: white;
                    border: 1px solid var(--color-primary);
                    border-radius: 10px;
                    cursor: pointer; transition: all 0.2s;
                }
                .resend-button:hover:not(:disabled) { background: #fef2f2; }
                .resend-button:disabled { opacity: 0.5; cursor: not-allowed; }

                /* Success */
                .success-content { text-align: center; padding: 2rem 0; }
                .success-icon {
                    width: 80px; height: 80px; margin: 0 auto 1.5rem;
                    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    color: white; animation: scaleIn 0.5s;
                }
                .success-icon svg { width: 40px; height: 40px; }
                .success-content h2 { font-size: 1.75rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem; }
                .success-content p { color: #64748b; font-size: 14px; margin-bottom: 2rem; }

                .back-to-login {
                    text-align: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0;
                }
                .back-to-login a {
                    display: inline-flex; align-items: center; gap: 0.5rem;
                    font-size: 14px; color: #64748b; text-decoration: none; font-weight: 600;
                }
                .back-to-login a:hover { color: var(--color-primary); }
                .back-to-login svg { width: 16px; height: 16px; }

                .spinner { animation: spin 1s linear infinite; }
                .spinner-circle { stroke: currentColor; stroke-linecap: round; stroke-dasharray: 60; stroke-dashoffset: 45; }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
                @keyframes scaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }

                /* Responsive */
                @media (max-width: 1024px) {
                    .forgot-branding { display: none; }
                    .forgot-form-container { background: #f8fafc; }
                    .mobile-logo { display: block; }
                }

                @media (max-width: 480px) {
                    .forgot-form-container { padding: 1.5rem; }
                    .step-header h2 { font-size: 1.25rem; }
                    .form-input { padding: 0.75rem; }
                    .step-line { width: 40px; }
                    .step-circle { width: 35px; height: 35px; font-size: 0.85rem; }
                }
            `}</style>
        </div>
    );
}
