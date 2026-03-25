import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { LoadingPage, ErrorState } from '../../components/common';
import ImageUpload from '../../components/ImageUpload';
import type { User, ApiResponse } from '../../types';

// Steps Configuration
const STEPS = [
    { num: 1, label: 'المعلومات الأساسية' },
    { num: 2, label: 'البيانات الشخصية' },
    { num: 3, label: 'المعلومات الدراسية' },
    { num: 4, label: 'المراجعة والحفظ' },
];

export function UserEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [step, setStep] = useState(1);

    const { data: user, isLoading, error } = useQuery({
        queryKey: ['user', id],
        queryFn: async () => {
            const response = await api.get<ApiResponse<User>>(`/users/${id}`);
            return response.data.data!;
        },
    });

    const { register, handleSubmit, formState: { errors }, reset, trigger, watch, setValue } = useForm<any>();
    const formData = watch();

    useEffect(() => {
        if (user) reset(user);
    }, [user, reset]);

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            await api.put(`/users/${id}`, data);
        },
        onSuccess: () => {
            toast.success('تم تحديث البيانات بنجاح');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            navigate('/users');
        },
        onError: () => toast.error('حدث خطأ أثناء التحديث'),
    });

    const nextStep = async () => {
        const fields = step === 1 ? ['full_name', 'phone_number'] : step === 2 ? ['nationality', 'city'] : [];
        if (await trigger(fields)) setStep(s => s + 1);
    };

    if (isLoading) return <LoadingPage />;
    if (error) return <ErrorState />;

    return (
        <div className="flex-column gap-lg animate-fadeIn max-w-4xl mx-auto">
            {/* Header */}
            <div className="card p-6 flex-between bg-gradient-to-l from-red-50 to-white">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center text-2xl font-bold border-4 border-white shadow-lg">
                        {user?.full_name?.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{user?.full_name}</h1>
                        <p className="text-muted">تعديل الملف الشخصي</p>
                    </div>
                </div>
                <button onClick={() => navigate('/users')} className="btn btn-outline">إلغاء</button>
            </div>

            {/* Stepper */}
            <div className="stepper">
                {STEPS.map((s) => (
                    <div key={s.num} className={`stepper-item ${step === s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`} onClick={() => setStep(s.num)}>
                        <div className="stepper-circle">{step > s.num ? '✓' : s.num}</div>
                        <div className="stepper-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="card p-8">
                {step === 1 && (
                    <div className="flex-column gap-lg animate-fadeIn">
                        <h3 className="font-bold text-lg mb-4">المعلومات الأساسية</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <label className="form-label">الاسم الكامل *</label>
                                <input className="form-control" {...register('full_name', { required: 'مطلوب' })} />
                                {errors.full_name && <p className="text-red-500 text-sm mt-1">{String(errors.full_name.message)}</p>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">رقم الهاتف *</label>
                                <input className="form-control" {...register('phone_number', { required: 'مطلوب' })} dir="ltr" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">البريد الإلكتروني</label>
                                <input className="form-control" {...register('email')} />
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="flex-column gap-lg animate-fadeIn">
                        <h3 className="font-bold text-lg mb-4">البيانات الشخصية</h3>

                        <div className="flex justify-center mb-6">
                            <ImageUpload
                                currentImage={watch('profile_photo')}
                                onUpload={(url) => setValue('profile_photo', url)}
                                onRemove={() => setValue('profile_photo', null)}
                                folder="profiles"
                                size="md"
                                shape="circle"
                                label="تعديل الصورة"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <label className="form-label">الجنسية</label>
                                <input className="form-control" {...register('nationality')} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">المدينة</label>
                                <input className="form-control" {...register('city')} />
                            </div>
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
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="flex-column gap-lg animate-fadeIn">
                        <h3 className="font-bold text-lg mb-4">المعلومات الدراسية</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <label className="form-label">الجامعة</label>
                                <input className="form-control" {...register('university')} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">الكلية</label>
                                <input className="form-control" {...register('faculty')} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">التخصص</label>
                                <input className="form-control" {...register('major')} />
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

                {step === 4 && (
                    <div className="flex-column gap-lg animate-fadeIn">
                        <h3 className="font-bold text-lg mb-4">مراجعة وتأكيد</h3>
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-muted">الاسم:</span> <span className="font-bold">{formData.full_name}</span></div>
                                <div><span className="text-muted">الهاتف:</span> <span className="font-bold">{formData.phone_number}</span></div>
                                <div><span className="text-muted">الجامعة:</span> <span className="font-bold">{formData.university}</span></div>
                                <div><span className="text-muted">التخصص:</span> <span className="font-bold">{formData.major}</span></div>
                            </div>
                        </div>

                        <div className="form-group mt-4">
                            <label className="form-label">حالة الحساب</label>
                            <select className="form-select w-full md:w-1/3 font-bold" {...register('status')}>
                                <option value="active">✅ نشط</option>
                                <option value="pending">⏳ قيد الانتظار</option>
                                <option value="suspended">⏸ معلق</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Footer Buttons */}
                <div className="flex-between mt-8 pt-6 border-t">
                    {step > 1 ? (
                        <button type="button" onClick={() => setStep(s => s - 1)} className="btn btn-secondary">السابق</button>
                    ) : <div></div>}

                    {step < 4 ? (
                        <button type="button" onClick={nextStep} className="btn btn-primary">التالي</button>
                    ) : (
                        <button type="submit" disabled={updateMutation.isPending} className="btn btn-primary">{updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}</button>
                    )}
                </div>
            </form>
        </div>
    );
}
