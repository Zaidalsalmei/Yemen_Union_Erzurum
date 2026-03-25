import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { SponsorFormData, ApiResponse, Sponsor, SponsorType } from '../../types';

export function SupporterCreate() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<SponsorFormData>({
        name: '',
        type: 'individual',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        description_ar: '',
        is_active: true,
    });
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const createMutation = useMutation({
        mutationFn: async (data: SponsorFormData) => {
            const response = await api.post<ApiResponse<Sponsor>>('/sponsors', data);
            return response.data;
        },
        onSuccess: () => {
            toast.success('تم إضافة الجهة الداعمة بنجاح');
            queryClient.invalidateQueries({ queryKey: ['supporters'] });
            queryClient.invalidateQueries({ queryKey: ['supporters-stats'] });
            navigate('/relations/sponsors');
        },
        onError: (error: any) => {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                toast.error('فشل في إضافة الجهة الداعمة');
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        createMutation.mutate(formData);
    };

    const handleChange = (field: keyof SponsorFormData, value: string | boolean) => {
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
                    <h1>إضافة جهة داعمة جديدة</h1>
                    <p>أدخل بيانات الجهة أو الفرد الداعم</p>
                </div>
                <button
                    className="btn"
                    style={{ background: 'white', border: '1px solid #e2e8f0', color: '#64748b' }}
                    onClick={() => navigate('/relations/sponsors')}
                >
                    إلغاء
                </button>
            </div>

            {/* Form Container */}
            <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Name */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                            اسم الجهة الداعمة <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="مثال: جمعية الخير الإنسانية"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                            style={{ borderColor: errors.name ? '#ef4444' : '#e2e8f0' }}
                        />
                        {errors.name && <p style={{ fontSize: '12px', color: '#ef4444' }}>{errors.name[0]}</p>}
                    </div>

                    {/* Type & Contact */}
                    <div className="dashboard-columns" style={{ margin: 0, gap: '24px', gridTemplateColumns: '1fr 1fr' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>نوع الجهة</label>
                            <select
                                value={formData.type || 'individual'}
                                onChange={(e) => handleChange('type', e.target.value as SponsorType)}
                            >
                                <option value="individual">فرد</option>
                                <option value="company">شركة</option>
                                <option value="organization">منظمة</option>
                                <option value="government">جهة حكومية</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>اسم الممثل/المسؤول</label>
                            <input
                                type="text"
                                placeholder="الاسم الكامل"
                                value={formData.contact_person || ''}
                                onChange={(e) => handleChange('contact_person', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Phone & Email */}
                    <div className="dashboard-columns" style={{ margin: 0, gap: '24px', gridTemplateColumns: '1fr 1fr' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>رقم الهاتف</label>
                            <input
                                type="tel"
                                placeholder="+90 555 123 4567"
                                value={formData.phone || ''}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                dir="ltr"
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>البريد الإلكتروني</label>
                            <input
                                type="email"
                                placeholder="example@email.com"
                                value={formData.email || ''}
                                onChange={(e) => handleChange('email', e.target.value)}
                                dir="ltr"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>العنوان</label>
                        <input
                            type="text"
                            placeholder="العنوان الكامل"
                            value={formData.address || ''}
                            onChange={(e) => handleChange('address', e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>وصف/ملاحظات</label>
                        <textarea
                            rows={3}
                            placeholder="أي ملاحظات إضافية..."
                            value={formData.description_ar || ''}
                            onChange={(e) => handleChange('description_ar', e.target.value)}
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

                    {/* Active Status */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => handleChange('is_active', e.target.checked)}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <span style={{ fontSize: '14px', color: '#334155' }}>جهة داعمة نشطة</span>
                        </label>
                    </div>

                    {/* Footer Actions */}
                    <div style={{ display: 'flex', gap: '12px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                        <button
                            type="button"
                            className="btn"
                            style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' }}
                            onClick={() => navigate('/relations/sponsors')}
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            className="btn"
                            style={{ flex: 1, background: 'var(--color-primary)', color: 'white' }}
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? 'جاري الحفظ...' : 'حفظ البيانات'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
