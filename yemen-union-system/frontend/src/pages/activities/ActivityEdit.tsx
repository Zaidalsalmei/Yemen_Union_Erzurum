import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Input,
    Select,
    Textarea,
    LoadingPage,
    ErrorState
} from '../../components/common';
import type { Activity, ApiResponse } from '../../types';

interface ActivityFormData {
    title_ar: string;
    description_ar?: string;
    activity_date: string;
    end_date?: string;
    location_ar?: string;
    max_participants?: number;
    registration_required: boolean;
    visibility: 'public' | 'members_only' | 'invited_only';
    has_fee: boolean;
    fee_amount?: number;
    status: string;
}

export function ActivityEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [step, setStep] = useState(1);

    const { data: activity, isLoading, error, refetch } = useQuery({
        queryKey: ['activity', id],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Activity>>(`/activities/${id}`);
            return response.data.data!;
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        watch,
        trigger,
        reset,
    } = useForm<ActivityFormData>();

    const hasFee = watch('has_fee');

    // Populate form when data loads
    useEffect(() => {
        if (activity) {
            reset({
                title_ar: activity.title_ar,
                description_ar: activity.description_ar || '',
                activity_date: activity.activity_date ? new Date(activity.activity_date).toISOString().slice(0, 16) : '',
                end_date: activity.end_date ? new Date(activity.end_date).toISOString().slice(0, 16) : '',
                location_ar: activity.location_ar || '',
                max_participants: activity.max_participants || undefined,
                registration_required: activity.registration_required || false,
                visibility: activity.visibility || 'public',
                has_fee: activity.has_fee || false,
                fee_amount: activity.fee_amount || undefined,
                status: activity.status || 'upcoming',
            });
        }
    }, [activity, reset]);

    const updateActivityMutation = useMutation({
        mutationFn: async (data: ActivityFormData) => {
            const response = await api.put<ApiResponse<Activity>>(`/activities/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            toast.success('تم تحديث النشاط بنجاح');
            queryClient.invalidateQueries({ queryKey: ['activity', id] });
            queryClient.invalidateQueries({ queryKey: ['activities'] });
            navigate(`/activities/${id}`);
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'حدث خطأ في تحديث النشاط';
            toast.error(message);
        },
    });

    const deleteActivityMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/activities/${id}`);
        },
        onSuccess: () => {
            toast.success('تم حذف النشاط بنجاح');
            queryClient.invalidateQueries({ queryKey: ['activities'] });
            navigate('/activities');
        },
        onError: () => {
            toast.error('حدث خطأ في حذف النشاط');
        },
    });

    const onSubmit = (data: ActivityFormData) => {
        updateActivityMutation.mutate(data);
    };

    const handleDelete = () => {
        if (window.confirm('هل أنت متأكد من حذف هذا النشاط؟ هذا الإجراء لا يمكن التراجع عنه.')) {
            deleteActivityMutation.mutate();
        }
    };

    const nextStep = async () => {
        const fieldsToValidate = step === 1
            ? ['title_ar', 'activity_date']
            : step === 2
                ? ['visibility']
                : [];

        const isValid = await trigger(fieldsToValidate as any);
        if (isValid) setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    if (isLoading) {
        return <LoadingPage message="جاري تحميل بيانات النشاط..." />;
    }

    if (error || !activity) {
        return (
            <div className="animate-fadeIn">
                <Card>
                    <ErrorState onRetry={() => refetch()} />
                </Card>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            {/* Page Header */}
            <header className="page-header">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="page-title">تعديل النشاط</h1>
                        <p className="page-subtitle">تعديل بيانات: {activity.title_ar}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="danger" onClick={handleDelete} loading={deleteActivityMutation.isPending}>
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            حذف
                        </Button>
                        <Button variant="secondary" onClick={() => navigate(`/activities/${id}`)}>
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            إلغاء
                        </Button>
                    </div>
                </div>
            </header>

            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-center gap-4">
                    {[
                        { num: 1, label: 'المعلومات الأساسية' },
                        { num: 2, label: 'الإعدادات' },
                        { num: 3, label: 'المراجعة' },
                    ].map((s, idx) => (
                        <div key={s.num} className="flex items-center">
                            <div className={`flex items-center gap-3 ${step >= s.num ? 'opacity-100' : 'opacity-40'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s.num
                                        ? 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg'
                                        : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {step > s.num ? '✓' : s.num}
                                </div>
                                <span className={`font-medium hidden md:block ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {s.label}
                                </span>
                            </div>
                            {idx < 2 && (
                                <div className={`w-16 h-1 mx-4 rounded-full transition-all ${step > s.num ? 'bg-red-500' : 'bg-gray-200'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="max-w-3xl mx-auto">
                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <Card className="animate-fadeIn">
                            <CardHeader title="المعلومات الأساسية" subtitle="تعديل عنوان ووصف النشاط" />
                            <CardBody>
                                <div className="space-y-6">
                                    <Input
                                        label="عنوان النشاط"
                                        placeholder="عنوان النشاط"
                                        error={errors.title_ar?.message}
                                        {...register('title_ar', {
                                            required: 'عنوان النشاط مطلوب',
                                            minLength: { value: 5, message: 'العنوان يجب أن يكون 5 أحرف على الأقل' },
                                        })}
                                    />

                                    <Textarea
                                        label="وصف النشاط (اختياري)"
                                        placeholder="وصف تفصيلي للنشاط..."
                                        rows={4}
                                        error={errors.description_ar?.message}
                                        {...register('description_ar')}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="تاريخ البداية"
                                            type="datetime-local"
                                            error={errors.activity_date?.message}
                                            {...register('activity_date', {
                                                required: 'تاريخ النشاط مطلوب',
                                            })}
                                        />

                                        <Input
                                            label="تاريخ الانتهاء (اختياري)"
                                            type="datetime-local"
                                            error={errors.end_date?.message}
                                            {...register('end_date')}
                                        />
                                    </div>

                                    <Input
                                        label="موقع النشاط (اختياري)"
                                        placeholder="موقع النشاط"
                                        error={errors.location_ar?.message}
                                        {...register('location_ar')}
                                    />

                                    <Select
                                        label="حالة النشاط"
                                        error={errors.status?.message}
                                        options={[
                                            { value: 'upcoming', label: '📅 قادم' },
                                            { value: 'ongoing', label: '🔄 جاري' },
                                            { value: 'completed', label: '✅ مكتمل' },
                                            { value: 'cancelled', label: '❌ ملغي' },
                                        ]}
                                        {...register('status')}
                                    />
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    {/* Step 2: Settings */}
                    {step === 2 && (
                        <Card className="animate-fadeIn">
                            <CardHeader title="إعدادات النشاط" subtitle="تعديل خيارات التسجيل والرؤية" />
                            <CardBody>
                                <div className="space-y-6">
                                    <Select
                                        label="مستوى الرؤية"
                                        error={errors.visibility?.message}
                                        options={[
                                            { value: 'public', label: '🌍 عام للجميع' },
                                            { value: 'members_only', label: '👥 للأعضاء فقط' },
                                            { value: 'invited_only', label: '✉️ بدعوة فقط' },
                                        ]}
                                        {...register('visibility', {
                                            required: 'مستوى الرؤية مطلوب',
                                        })}
                                    />

                                    <Input
                                        label="الحد الأقصى للمشاركين (اختياري)"
                                        type="number"
                                        placeholder="اتركه فارغاً لعدم وجود حد"
                                        error={errors.max_participants?.message}
                                        {...register('max_participants', {
                                            min: { value: 1, message: 'يجب أن يكون 1 على الأقل' },
                                        })}
                                    />

                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                        <input
                                            type="checkbox"
                                            id="registration_required"
                                            className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
                                            {...register('registration_required')}
                                        />
                                        <label htmlFor="registration_required" className="flex-1">
                                            <span className="font-semibold text-gray-900">يتطلب تسجيل مسبق</span>
                                            <p className="text-sm text-gray-500">يجب على المشاركين التسجيل قبل الحضور</p>
                                        </label>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                        <input
                                            type="checkbox"
                                            id="has_fee"
                                            className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
                                            {...register('has_fee')}
                                        />
                                        <label htmlFor="has_fee" className="flex-1">
                                            <span className="font-semibold text-gray-900">يتطلب رسوم مشاركة</span>
                                            <p className="text-sm text-gray-500">هل هناك رسوم للمشاركة في النشاط؟</p>
                                        </label>
                                    </div>

                                    {hasFee && (
                                        <Input
                                            label="مبلغ الرسوم"
                                            type="number"
                                            step="0.01"
                                            placeholder="أدخل المبلغ"
                                            error={errors.fee_amount?.message}
                                            {...register('fee_amount', {
                                                required: hasFee ? 'مبلغ الرسوم مطلوب' : false,
                                                min: { value: 0, message: 'المبلغ يجب أن يكون موجباً' },
                                            })}
                                        />
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <Card className="animate-fadeIn">
                            <CardHeader title="مراجعة التعديلات" subtitle="تأكد من صحة البيانات قبل الحفظ" />
                            <CardBody>
                                <div className="space-y-6">
                                    {/* Change indicator */}
                                    {isDirty && (
                                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <span className="text-amber-800 font-medium">هناك تغييرات لم يتم حفظها بعد</span>
                                        </div>
                                    )}

                                    {/* Activity Info */}
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            معلومات النشاط
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">عنوان النشاط</p>
                                                <p className="font-medium text-gray-900">{watch('title_ar')}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">تاريخ البداية</p>
                                                <p className="font-medium text-gray-900">
                                                    {watch('activity_date') ? new Date(watch('activity_date')).toLocaleString('ar-SA') : '—'}
                                                </p>
                                            </div>
                                            {watch('location_ar') && (
                                                <div>
                                                    <p className="text-sm text-gray-600">الموقع</p>
                                                    <p className="font-medium text-gray-900">{watch('location_ar')}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm text-gray-600">الحالة</p>
                                                <p className="font-medium text-gray-900">
                                                    {watch('status') === 'upcoming' && '📅 قادم'}
                                                    {watch('status') === 'ongoing' && '🔄 جاري'}
                                                    {watch('status') === 'completed' && '✅ مكتمل'}
                                                    {watch('status') === 'cancelled' && '❌ ملغي'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Settings */}
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            الإعدادات
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">مستوى الرؤية</p>
                                                <p className="font-medium text-gray-900">
                                                    {watch('visibility') === 'public' && '🌍 عام للجميع'}
                                                    {watch('visibility') === 'members_only' && '👥 للأعضاء فقط'}
                                                    {watch('visibility') === 'invited_only' && '✉️ بدعوة فقط'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">التسجيل المسبق</p>
                                                <p className="font-medium text-gray-900">
                                                    {watch('registration_required') ? '✅ مطلوب' : '❌ غير مطلوب'}
                                                </p>
                                            </div>
                                            {watch('max_participants') && (
                                                <div>
                                                    <p className="text-sm text-gray-600">الحد الأقصى</p>
                                                    <p className="font-medium text-gray-900">{watch('max_participants')} مشارك</p>
                                                </div>
                                            )}
                                            {watch('has_fee') && (
                                                <div>
                                                    <p className="text-sm text-gray-600">رسوم المشاركة</p>
                                                    <p className="font-bold text-lg text-red-600">{watch('fee_amount')} ₺</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-8">
                        <div>
                            {step > 1 && (
                                <Button type="button" variant="secondary" onClick={prevStep}>
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    السابق
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <Button type="button" variant="secondary" onClick={() => navigate(`/activities/${id}`)}>
                                إلغاء
                            </Button>

                            {step < 3 ? (
                                <Button type="button" onClick={nextStep}>
                                    التالي
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    loading={updateActivityMutation.isPending}
                                >
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    حفظ التغييرات
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
