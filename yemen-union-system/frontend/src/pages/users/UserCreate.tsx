import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { ApiResponse } from '../../types';
import ImageUpload from '../../components/ImageUpload';

// Steps
const STEPS = [
    { num: 1, label: 'المعلومات الأساسية' },
    { num: 2, label: 'البيانات الشخصية' },
    { num: 3, label: 'المراجعة والحفظ' },
];

// الأدوار المتاحة
const ROLES = [
    { id: 1, name: 'President', label_ar: 'رئيس الاتحاد', icon: '👑', key: 'president' },
    { id: 2, name: 'Vice President', label_ar: 'نائب الرئيس', icon: '⭐', key: 'vice_president' },
    { id: 3, name: 'Secretary', label_ar: 'السكرتير', icon: '📝', key: 'secretary' },
    { id: 4, name: 'Activities Coordinator', label_ar: 'منسق الأنشطة', icon: '🎯', key: 'activities_coordinator' },
    { id: 5, name: 'Finance Manager', label_ar: 'مسؤول المالية', icon: '💰', key: 'finance_manager' },
    { id: 6, name: 'Media Manager', label_ar: 'مسؤول الإعلام', icon: '📢', key: 'media_manager' },
    { id: 7, name: 'Academic Coordinator', label_ar: 'منسق أكاديمي', icon: '📚', key: 'academic_coordinator' },
    { id: 8, name: 'Relations Coordinator', label_ar: 'منسق العلاقات', icon: '🤝', key: 'relations_coordinator' },
    { id: 9, name: 'Member', label_ar: 'عضو', icon: '👤', key: 'member' },
];

export function UserCreate() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        trigger,
        setValue,
    } = useForm<any>({
        defaultValues: {
            nationality: 'اليمن',
            city: 'أرضروم',
            status: 'active',
            role_id: 9, // القيمة الافتراضية: عضو
        },
    });

    const selectedRoleId = watch('role_id');

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            // التأكد من إرسال البيانات بشكل صحيح
            const response = await api.post<ApiResponse<any>>('/users', data);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.success) {
                toast.success('تم إضافة العضو بنجاح');
                navigate('/users');
            } else {
                toast.error(data.message || 'فشل في حفظ البيانات');
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'حدث خطأ في إضافة العضو. يرجى التأكد من أن البريد ورقم الهاتف غير مستخدمين مسبقاً.';
            toast.error(message);
        },
    });

    const nextStep = async () => {
        const fields = step === 1
            ? ['full_name', 'phone_number', 'email', 'password', 'password_confirmation']
            : ['date_of_birth', 'gender', 'nationality', 'university', 'faculty', 'study_level', 'city'];

        const isValid = await trigger(fields as any);
        if (isValid) setStep(s => s + 1);
    };

    return (
        <div className="flex-column gap-lg animate-fadeIn max-w-4xl mx-auto pb-10">
            {/* Header */}
            <div className="card p-6 flex-between bg-gradient-to-l from-red-50 to-white shadow-sm border-b-2 border-red-100">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg">
                        👤
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">إضافة عضو جديد</h1>
                        <p className="text-gray-500">تسجيل بيانات عضو جديد وتحديد رتبته في النظام</p>
                    </div>
                </div>
                <button onClick={() => navigate('/users')} className="btn btn-outline border-gray-300">إلغاء</button>
            </div>

            {/* Stepper */}
            <div className="stepper my-4">
                {STEPS.map((s) => (
                    <div key={s.num} className={`stepper-item ${step === s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`} onClick={async () => {
                        if (s.num < step) setStep(s.num);
                        else if (s.num === step + 1) await nextStep();
                    }}>
                        <div className="stepper-circle transition-all duration-300">{step > s.num ? '✓' : s.num}</div>
                        <div className="stepper-label font-bold text-sm">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit((data) => {
                // فلترة البيانات قبل الإرسال
                const { password_confirmation, ...payload } = data;
                createMutation.mutate(payload);
            }, (errors) => {
                console.error('Validation errors:', errors);
                toast.error('يرجى ملء جميع الحقول المطلوبة بشكل صحيح');
            })} className="card p-8 shadow-md">

                {step === 1 && (
                    <div className="flex-column gap-lg animate-fadeIn">
                        <div className="flex items-center gap-2 mb-4 border-b pb-2">
                            <span className="text-xl">📋</span>
                            <h3 className="font-bold text-lg">المعلومات الأساسية للمساب الحساب</h3>
                        </div>

                        <div className="form-group">
                            <label className="form-label font-bold text-gray-700">الاسم الكامل *</label>
                            <input className="form-control focus:ring-2 focus:ring-red-200" {...register('full_name', {
                                required: 'الاسم الكامل مطلوب',
                                minLength: { value: 3, message: 'يجب أن يكون الاسم 3 أحرف على الأقل' }
                            })} placeholder="الاسم الرباعي كما في جواز السفر" />
                            {errors.full_name && <p className="text-red-500 text-sm mt-1">{String(errors.full_name.message)}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <label className="form-label font-bold text-gray-700">رقم الهاتف *</label>
                                <input className="form-control" type="tel" {...register('phone_number', {
                                    required: 'رقم الهاتف مطلوب',
                                    pattern: { value: /^05\d{9}$/, message: 'يجب أن يبدأ بـ 05 ويتكون من 11 رقم' }
                                })} placeholder="05XXXXXXXXX" dir="ltr" />
                                {errors.phone_number && <p className="text-red-500 text-sm mt-1">{String(errors.phone_number.message)}</p>}
                            </div>
                            <div className="form-group">
                                <label className="form-label font-bold text-gray-700">البريد الإلكتروني *</label>
                                <input className="form-control" type="email" {...register('email', {
                                    required: 'البريد الإلكتروني مطلوب للمراسلات والحساب',
                                    pattern: { value: /^\S+@\S+$/i, message: 'بريد إلكتروني غير صالح' }
                                })} placeholder="example@email.com" dir="ltr" />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{String(errors.email.message)}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <label className="form-label font-bold text-gray-700">كلمة المرور *</label>
                                <input className="form-control" type="password" {...register('password', {
                                    required: 'كلمة المرور مطلوبة',
                                    minLength: { value: 8, message: '8 أحرف على الأقل' }
                                })} placeholder="••••••••" />
                                {errors.password && <p className="text-red-500 text-sm mt-1">{String(errors.password.message)}</p>}
                            </div>
                            <div className="form-group">
                                <label className="form-label font-bold text-gray-700">تأكيد كلمة المرور *</label>
                                <input className="form-control" type="password" {...register('password_confirmation', {
                                    required: 'تأكيد كلمة المرور مطلوب',
                                    validate: (val) => val === watch('password') || 'كلمتا المرور غير متطابقتين'
                                })} placeholder="••••••••" />
                                {errors.password_confirmation && <p className="text-red-500 text-sm mt-1">{String(errors.password_confirmation.message)}</p>}
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="flex-column gap-lg animate-fadeIn">
                        <div className="flex items-center gap-2 mb-4 border-b pb-2">
                            <span className="text-xl">🎓</span>
                            <h3 className="font-bold text-lg">البيانات الشخصية والدراسية</h3>
                        </div>

                        {/* رفع الصورة الشخصية */}
                        <div className="flex justify-center mb-6">
                            <div className="flex flex-col items-center gap-2">
                                <label className="text-sm font-bold text-gray-500 mb-2">الصورة الشخصية (اختياري)</label>
                                <ImageUpload
                                    currentImage={watch('profile_photo')}
                                    onUpload={(url) => setValue('profile_photo', url)}
                                    onRemove={() => setValue('profile_photo', null)}
                                    folder="profiles"
                                    size="lg"
                                    shape="circle"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <label className="form-label">تاريخ الميلاد</label>
                                <input type="date" className="form-control" {...register('date_of_birth')} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">الجنس</label>
                                <select className="form-select" {...register('gender')}>
                                    <option value="male">ذكر</option>
                                    <option value="female">أنثى</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">الجنسية</label>
                                <input className="form-control" {...register('nationality')} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">المدينة الحالية</label>
                                <input className="form-control" {...register('city')} />
                            </div>
                        </div>

                        <hr className="border-gray-100 my-2" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <label className="form-label">الجامعة</label>
                                <input className="form-control" {...register('university')} placeholder="اسم الجامعة في تركيا" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">الكلية / التخصص</label>
                                <input className="form-control" {...register('faculty')} placeholder="مثال: هندسة الحاسوب" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">المستوى الدراسي</label>
                                <select className="form-select" {...register('study_level')}>
                                    <option value="bachelor">بكالوريوس</option>
                                    <option value="master">ماجستير</option>
                                    <option value="phd">دكتوراه</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="flex-column gap-lg animate-fadeIn">
                        <div className="flex items-center gap-2 mb-4 border-b pb-2">
                            <span className="text-xl">⭐</span>
                            <h3 className="font-bold text-lg">تحديد الرتبة والمراجعة النهائية</h3>
                        </div>

                        {/* اختيار الرتبة (الدور) */}
                        <div className="form-group">
                            <label className="form-label font-bold text-red-600 border-r-4 border-red-600 pr-3 mb-4">اختر رتبة العضو في النظام:</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {ROLES.map((role) => (
                                    <div
                                        key={role.id}
                                        onClick={() => setValue('role_id', role.id)}
                                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${selectedRoleId === role.id
                                            ? 'border-red-600 bg-red-50 shadow-md ring-2 ring-red-100'
                                            : 'border-gray-100 hover:border-red-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-2xl">{role.icon}</span>
                                        <div className="flex flex-col">
                                            <span className={`font-bold text-sm ${selectedRoleId === role.id ? 'text-red-700' : 'text-gray-700'}`}>
                                                {role.label_ar}
                                            </span>
                                            <span className="text-xs text-gray-400 capitalize">{role.key.replace('_', ' ')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-4 shadow-inner">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <ReviewItem label="الاسم" value={watch('full_name')} />
                                <ReviewItem label="الهاتف" value={watch('phone_number')} />
                                <ReviewItem label="البريد" value={watch('email')} />
                                <ReviewItem label="الرتبة" value={ROLES.find(r => r.id === selectedRoleId)?.label_ar} />
                            </div>
                        </div>

                        <div className="form-group mt-4">
                            <label className="form-label font-bold">حالة الحساب عند الحفظ:</label>
                            <div className="flex gap-4">
                                <label className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${watch('status') === 'active' ? 'border-green-500 bg-green-50' : 'border-gray-100'}`}>
                                    <input type="radio" value="active" {...register('status')} className="hidden" />
                                    <span>✅ نشط فوراً</span>
                                </label>
                                <label className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${watch('status') === 'pending' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-100'}`}>
                                    <input type="radio" value="pending" {...register('status')} className="hidden" />
                                    <span>⏳ قيد الانتظار</span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex-between mt-10 pt-6 border-t border-gray-100">
                    {step > 1 ? (
                        <button type="button" onClick={() => setStep(s => s - 1)} className="btn btn-secondary px-8">السابق</button>
                    ) : <div></div>}

                    {step < 3 ? (
                        <button type="button" onClick={nextStep} className="btn btn-primary px-10 shadow-lg shadow-red-100">التالي</button>
                    ) : (
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="btn btn-primary px-12 py-3 text-lg font-bold shadow-xl shadow-red-200 transition-all active:scale-95"
                        >
                            {createMutation.isPending ? '⏳ جاري الحفظ...' : '💾 مراجعة وحفظ العضو'}
                        </button>
                    )}
                </div>
            </form>

            <style>{`
                .form-control:focus {
                    outline: none;
                    border-color: #DC2626;
                }
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(220, 38, 38, 0.2);
                }
            `}</style>
        </div>
    );
}

function ReviewItem({ label, value }: { label: string, value: string | undefined }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-gray-400 text-xs font-semibold uppercase">{label}</span>
            <span className="font-bold text-gray-800 truncate">{value || '-'}</span>
        </div>
    );
}
