import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { SponsorshipFormData, ApiResponse, Sponsorship } from '../../types';

interface SponsorDropdownItem {
    id: number;
    name: string;
    type: string;
}

interface ActivityDropdownItem {
    id: number;
    title_ar: string;
}

export function SupportVisitCreate() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const preSelectedSponsorId = searchParams.get('sponsor_id');

    const [formData, setFormData] = useState<SponsorshipFormData>({
        sponsor_id: preSelectedSponsorId ? parseInt(preSelectedSponsorId) : 0,
        amount: 0,
        currency: 'TRY',
        purpose_ar: '',
        category: 'general',
        activity_id: undefined,
        receipt_number: '',
        received_date: new Date().toISOString().split('T')[0],
        status: 'received',
        notes: '',
    });
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const { data: sponsorsData } = useQuery({
        queryKey: ['sponsors-dropdown'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<SponsorDropdownItem[]>>('/sponsors/dropdown');
            return response.data.data || [];
        },
    });

    const { data: activitiesData } = useQuery({
        queryKey: ['activities-dropdown'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<ActivityDropdownItem[]>>('/activities');
            return response.data.data || [];
        },
    });

    const sponsors = sponsorsData || [];
    const activities = activitiesData || [];

    const createMutation = useMutation({
        mutationFn: async (data: SponsorshipFormData) => {
            const response = await api.post<ApiResponse<Sponsorship>>('/sponsorships', data);
            return response.data;
        },
        onSuccess: () => {
            toast.success('تم تسجيل الرعاية بنجاح');
            queryClient.invalidateQueries({ queryKey: ['sponsorships'] });
            queryClient.invalidateQueries({ queryKey: ['sponsors-stats'] });
            queryClient.invalidateQueries({ queryKey: ['sponsors'] });
            navigate('/relations/sponsorships');
        },
        onError: (error: any) => {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                toast.error('فشل في تسجيل الرعاية');
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

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

        createMutation.mutate(formData);
    };

    const handleChange = (field: keyof SponsorshipFormData, value: string | number | undefined) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    return (
        <div className="animate-fadeIn">
            {/* Scoped Page Header */}
            <div className="page-header">
                <div>
                    <h1>تسجيل رعاية جديدة</h1>
                    <p>أدخل بيانات الرعاية المقدمة</p>
                </div>
                <button
                    className="btn"
                    style={{ background: 'white', border: '1px solid #e2e8f0', color: '#64748b' }}
                    onClick={() => navigate('/relations/sponsorships')}
                >
                    إلغاء
                </button>
            </div>

            {/* Form Container */}
            <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Sponsor Selection */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                            الجهة الداعمة <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <select
                            value={formData.sponsor_id || ''}
                            onChange={(e) => handleChange('sponsor_id', parseInt(e.target.value) || 0)}
                            required
                            style={{ borderColor: errors.sponsor_id ? '#ef4444' : '#e2e8f0' }}
                        >
                            <option value="">اختر الجهة الداعمة...</option>
                            {sponsors.map((sponsor) => (
                                <option key={sponsor.id} value={sponsor.id}>
                                    {sponsor.name}
                                </option>
                            ))}
                        </select>
                        {errors.sponsor_id && <p style={{ fontSize: '12px', color: '#ef4444' }}>{errors.sponsor_id[0]}</p>}
                    </div>

                    {/* Amount & Currency */}
                    <div className="dashboard-columns" style={{ margin: 0, gap: '24px', gridTemplateColumns: '1fr 1fr' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                                مبلغ الرعاية <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={formData.amount || ''}
                                onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                                min="0"
                                step="0.01"
                                required
                                style={{ borderColor: errors.amount ? '#ef4444' : '#e2e8f0' }}
                            />
                            {errors.amount && <p style={{ fontSize: '12px', color: '#ef4444' }}>{errors.amount[0]}</p>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>العملة</label>
                            <select
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                            غرض الرعاية <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="مثال: دعم أنشطة شهر رمضان"
                            value={formData.purpose_ar}
                            onChange={(e) => handleChange('purpose_ar', e.target.value)}
                            required
                            style={{ borderColor: errors.purpose_ar ? '#ef4444' : '#e2e8f0' }}
                        />
                        {errors.purpose_ar && <p style={{ fontSize: '12px', color: '#ef4444' }}>{errors.purpose_ar[0]}</p>}
                    </div>

                    {/* Category & Date */}
                    <div className="dashboard-columns" style={{ margin: 0, gap: '24px', gridTemplateColumns: '1fr 1fr' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>التصنيف</label>
                            <select
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                                تاريخ الاستلام <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.received_date}
                                onChange={(e) => handleChange('received_date', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Activity (if category is activity) */}
                    {formData.category === 'activity' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>النشاط المرتبط</label>
                            <select
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
                    <div className="dashboard-columns" style={{ margin: 0, gap: '24px', gridTemplateColumns: '1fr 1fr' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>رقم الإيصال (اختياري)</label>
                            <input
                                type="text"
                                placeholder="####"
                                value={formData.receipt_number || ''}
                                onChange={(e) => handleChange('receipt_number', e.target.value)}
                                dir="ltr"
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>الحالة</label>
                            <select
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>ملاحظات</label>
                        <textarea
                            rows={3}
                            placeholder="أي ملاحظات إضافية..."
                            value={formData.notes || ''}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                fontSize: '14px',
                                outline: 'none',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>

                    {/* Footer Actions */}
                    <div style={{ display: 'flex', gap: '12px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                        <button
                            type="button"
                            className="btn"
                            style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' }}
                            onClick={() => navigate('/relations/sponsorships')}
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            className="btn"
                            style={{ flex: 1, background: 'var(--color-primary)', color: 'white' }}
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? 'جاري الحفظ...' : 'حفظ الرعاية'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
