import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useBranding } from '../../contexts/BrandingContext';
import { getLogoUrl } from '../../utils/images';
import type { LoginCredentials } from '../../types';

export function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { settings: brandingSettings } = useBranding();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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

    return (
        <div className="login__container">
            <div className="login__box">
                {/* Header */}
                <div className="login__header">
                    <div className="login__logo" style={{ background: 'transparent', boxShadow: 'none' }}>
                        <img src={getLogoUrl(brandingSettings.logoUrl)} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
                    </div>
                    <h1>{brandingSettings.unionName}</h1>
                    <p className="text-muted">أرضروم - تركيا</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex-column gap-md">
                    <div className="form-group">
                        <label className="fw-semibold mb-2">رقم الهاتف</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="tel"
                                placeholder="05XXXXXXXXX"
                                className="w-100 p-3 rounded-lg border border-gray-200 focus:border-red-500"
                                dir="ltr"
                                {...register('phone_number', {
                                    required: 'رقم الهاتف مطلوب',
                                    pattern: {
                                        value: /^05\d{9}$/,
                                        message: 'رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 11 رقم',
                                    },
                                })}
                            />
                        </div>
                        {errors.phone_number && (
                            <p className="text-red-500 text-sm mt-1">{errors.phone_number.message}</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="fw-semibold mb-2">كلمة المرور</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                className="w-100 p-3 rounded-lg border border-gray-200 focus:border-red-500"
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
                                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                            </button>
                        </div>
                        <div className="flex-between mt-2">
                            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                            <Link to="/forgot-password" style={{ fontSize: '12px', color: '#d21f3c', fontWeight: 'bold' }}>نسيت كلمة المرور؟</Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary w-100 py-3 mt-2"
                        style={{ justifyContent: 'center' }}
                    >
                        {isLoading ? 'جاري الدخول...' : 'تسجيل الدخول'}
                    </button>
                </form>

                {/* Footer */}
                <div className="text-center mt-6 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        ليس لديك حساب؟{' '}
                        <Link to="/register" className="text-primary fw-bold hover:underline">
                            إنشاء حساب جديد
                        </Link>
                    </p>
                </div>

                {/* Demo Credentials Removed */}
            </div>

            {/* Background Style Injection for Gradient */}
            <style>{`
                .login__container {
                    background: linear-gradient(135deg, #d21f3c 0%, #8a0e23 60%, #000000 100%);
                    position: relative;
                }
                .login__container::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
                    opacity: 0.4;
                }
            `}</style>
        </div>
    );
}
