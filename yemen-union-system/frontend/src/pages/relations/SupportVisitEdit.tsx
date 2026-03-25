import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Button, Card, CardBody, CardHeader, LoadingPage, ErrorState } from '../../components/common';
import type { Sponsorship, SponsorshipFormData, ApiResponse } from '../../types';

interface SponsorDropdownItem {
    id: number;
    name: string;
    type: string;
}

interface ActivityDropdownItem {
    id: number;
    title_ar: string;
}

export function SupportVisitEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<SponsorshipFormData | null>(null);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [hasChanges, setHasChanges] = useState(false);

    // Fetch sponsorship data
    const { data: sponsorship, isLoading, error, refetch } = useQuery({
        queryKey: ['sponsorship', id],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Sponsorship>>(`/sponsorships/${id}`);
            return response.data.data!;
        },
    });

    // Fetch sponsors dropdown
    const { data: sponsorsData } = useQuery({
        queryKey: ['sponsors-dropdown'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<SponsorDropdownItem[]>>('/sponsors/dropdown');
            return response.data.data || [];
        },
    });

    // Fetch activities dropdown
    const { data: activitiesData } = useQuery({
        queryKey: ['activities-dropdown'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<ActivityDropdownItem[]>>('/activities');
            return response.data.data || [];
        },
    });

    const sponsors = sponsorsData || [];
    const activities = activitiesData || [];

    // Initialize form data when sponsorship loads
    useEffect(() => {
        if (sponsorship && !formData) {
            setFormData({
                sponsor_id: sponsorship.sponsor_id,
                amount: sponsorship.amount,
                currency: sponsorship.currency,
                purpose_ar: sponsorship.purpose_ar,
                category: sponsorship.category,
                activity_id: sponsorship.activity_id || undefined,
                receipt_number: sponsorship.receipt_number || '',
                received_date: sponsorship.received_date.split('T')[0],
                status: sponsorship.status,
                notes: sponsorship.notes || '',
            });
        }
    }, [sponsorship, formData]);

    const updateMutation = useMutation({
        mutationFn: async (data: SponsorshipFormData) => {
            const response = await api.put<ApiResponse<Sponsorship>>(`/sponsorships/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            toast.success('تم تحديث الرعاية بنجاح');
            queryClient.invalidateQueries({ queryKey: ['sponsorship', id] });
            queryClient.invalidateQueries({ queryKey: ['sponsorships'] });
            queryClient.invalidateQueries({ queryKey: ['sponsors-stats'] });
            navigate(`/relations/sponsorships/${id}`);
        },
        onError: (error: any) => {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                toast.error('فشل في تحديث الرعاية');
            }
        },
    });

    const handleChange = (field: keyof SponsorshipFormData, value: string | number | undefined) => {
        setFormData((prev) => {
            if (!prev) return prev;
            return { ...prev, [field]: value };
        });
        setHasChanges(true);
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        setErrors({});

        // Validate
        const newErrors: Record<string, string[]> = {};
        if (!formData.sponsor_id) {
            newErrors.sponsor_id = ['يرجى اختيار الجهة الداعمة'];
        }
        if (!formData.amount || formData.amount <= 0) {
            newErrors.amount = ['يرجى إدخال مبلغ صحيح'];
        }
        if (!formData.purpose_ar) {
            newErrors.purpose_ar = ['يرجى إدخال غرض الرعاية'];
        }
        if (!formData.received_date) {
            newErrors.received_date = ['يرجى تحديد التاريخ'];
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        updateMutation.mutate(formData);
    };

    if (isLoading || !formData) {
        return <LoadingPage message="جاري تحميل بيانات الرعاية..." />;
    }

    if (error || !sponsorship) {
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
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/relations/sponsorships/${id}`)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex-1">
                        <h1 className="page-title flex items-center gap-3">
                            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            تعديل الرعاية
                        </h1>
                        <p className="page-subtitle">تعديل بيانات رعاية من {sponsorship.sponsor?.name}</p>
                    </div>
                    {hasChanges && (
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                            تغييرات غير محفوظة
                        </span>
                    )}
                </div>
            </header>

            {/* Form */}
            <Card className="max-w-3xl mx-auto">
                <CardHeader title="بيانات الرعاية" />
                <CardBody>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Sponsor Selection */}
                        <div className="form-group">
                            <label className="form-label required">الجهة الداعمة</label>
                            <select
                                className={`form-input ${errors.sponsor_id ? 'border-red-500' : ''}`}
                                value={formData.sponsor_id || ''}
                                onChange={(e) => handleChange('sponsor_id', parseInt(e.target.value) || 0)}
                                required
                            >
                                <option value="">اختر الجهة الداعمة...</option>
                                {sponsors.map((sponsor) => (
                                    <option key={sponsor.id} value={sponsor.id}>
                                        {sponsor.name}
                                    </option>
                                ))}
                            </select>
                            {errors.sponsor_id && <p className="form-error">{errors.sponsor_id[0]}</p>}
                        </div>

                        {/* Amount & Currency */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <label className="form-label required">مبلغ الرعاية</label>
                                <input
                                    type="number"
                                    className={`form-input ${errors.amount ? 'border-red-500' : ''}`}
                                    placeholder="0.00"
                                    value={formData.amount || ''}
                                    onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                                {errors.amount && <p className="form-error">{errors.amount[0]}</p>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">العملة</label>
                                <select
                                    className="form-input"
                                    value={formData.currency || 'TRY'}
                                    onChange={(e) => handleChange('currency', e.target.value)}
                                >
                                    <option value="TRY">ليرة تركية (TRY)</option>
                                    <option value="USD">دولار أمريكي (USD)</option>
                                    <option value="EUR">يورو (EUR)</option>
                                    <option value="SAR">ريال سعودي (SAR)</option>
                                </select>
                            </div>
                        </div>

                        {/* Purpose */}
                        <div className="form-group">
                            <label className="form-label required">غرض الرعاية</label>
                            <input
                                type="text"
                                className={`form-input ${errors.purpose_ar ? 'border-red-500' : ''}`}
                                placeholder="مثال: دعم أنشطة شهر رمضان"
                                value={formData.purpose_ar}
                                onChange={(e) => handleChange('purpose_ar', e.target.value)}
                                required
                            />
                            {errors.purpose_ar && <p className="form-error">{errors.purpose_ar[0]}</p>}
                        </div>

                        {/* Category & Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <label className="form-label">التصنيف</label>
                                <select
                                    className="form-input"
                                    value={formData.category || 'general'}
                                    onChange={(e) => handleChange('category', e.target.value)}
                                >
                                    <option value="general">💰 دعم عام</option>
                                    <option value="activity">🎯 دعم نشاط</option>
                                    <option value="project">📁 مشروع</option>
                                    <option value="scholarship">🎓 منحة</option>
                                    <option value="emergency">🚨 طوارئ</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label required">تاريخ الاستلام</label>
                                <input
                                    type="date"
                                    className={`form-input ${errors.received_date ? 'border-red-500' : ''}`}
                                    value={formData.received_date}
                                    onChange={(e) => handleChange('received_date', e.target.value)}
                                    required
                                />
                                {errors.received_date && <p className="form-error">{errors.received_date[0]}</p>}
                            </div>
                        </div>

                        {/* Activity (if category is activity) */}
                        {formData.category === 'activity' && (
                            <div className="form-group">
                                <label className="form-label">النشاط المرتبط</label>
                                <select
                                    className="form-input"
                                    value={formData.activity_id || ''}
                                    onChange={(e) => handleChange('activity_id', parseInt(e.target.value) || undefined)}
                                >
                                    <option value="">اختر النشاط...</option>
                                    {activities.map((activity) => (
                                        <option key={activity.id} value={activity.id}>
                                            {activity.title_ar}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Receipt & Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <label className="form-label">رقم الإيصال</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="اختياري"
                                    value={formData.receipt_number || ''}
                                    onChange={(e) => handleChange('receipt_number', e.target.value)}
                                    dir="ltr"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">الحالة</label>
                                <select
                                    className="form-input"
                                    value={formData.status || 'received'}
                                    onChange={(e) => handleChange('status', e.target.value)}
                                >
                                    <option value="pending">⏳ قيد الانتظار</option>
                                    <option value="received">✅ تم الاستلام</option>
                                    <option value="allocated">📦 تم التخصيص</option>
                                </select>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="form-group">
                            <label className="form-label">ملاحظات</label>
                            <textarea
                                className="form-input"
                                rows={3}
                                placeholder="أي ملاحظات إضافية..."
                                value={formData.notes || ''}
                                onChange={(e) => handleChange('notes', e.target.value)}
                            />
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-4 border-t">
                            <Button
                                type="button"
                                variant="secondary"
                                fullWidth
                                onClick={() => navigate(`/relations/sponsorships/${id}`)}
                            >
                                إلغاء
                            </Button>
                            <Button
                                type="submit"
                                fullWidth
                                disabled={updateMutation.isPending || !hasChanges}
                            >
                                {updateMutation.isPending ? (
                                    <>
                                        <svg className="animate-spin w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        حفظ التغييرات
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}
