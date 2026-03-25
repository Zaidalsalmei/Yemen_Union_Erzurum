import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Button, Spinner, ErrorState } from '../../components/common';
import type { SponsorFormData, ApiResponse, Sponsor, SponsorType } from '../../types';

export function SupporterEdit() {
    const { id } = useParams<{ id: string }>();
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

    // Fetch sponsor data
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['sponsor', id],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Sponsor>>(`/sponsors/${id}`);
            return response.data.data!;
        },
        enabled: !!id,
    });

    // Populate form when data loads
    useEffect(() => {
        if (data) {
            setFormData({
                name: data.name,
                type: data.type || 'individual',
                contact_person: data.contact_person || '',
                phone: data.phone || '',
                email: data.email || '',
                address: data.address || '',
                description_ar: data.description_ar || '',
                website: data.website || '',
                is_active: data.is_active,
            });
        }
    }, [data]);

    const updateMutation = useMutation({
        mutationFn: async (formData: SponsorFormData) => {
            const response = await api.put<ApiResponse<Sponsor>>(`/sponsors/${id}`, formData);
            return response.data;
        },
        onSuccess: () => {
            toast.success('تم تحديث الجهة الداعمة بنجاح');
            queryClient.invalidateQueries({ queryKey: ['sponsors'] });
            queryClient.invalidateQueries({ queryKey: ['sponsor', id] });
            navigate(`/relations/sponsors/${id}`);
        },
        onError: (error: any) => {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                toast.error('فشل في تحديث الجهة الداعمة');
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        updateMutation.mutate(formData);
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="card">
                <ErrorState onRetry={() => refetch()} />
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            {/* Page Header */}
            <header className="page-header">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/relations/sponsors/${id}`)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="page-title flex items-center gap-3">
                            <span className="text-3xl">✏️</span>
                            تعديل الجهة الداعمة
                        </h1>
                        <p className="page-subtitle">{data?.name}</p>
                    </div>
                </div>
            </header>

            {/* Form */}
            <div className="card max-w-3xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div className="form-group">
                        <label className="form-label required">اسم الجهة الداعمة</label>
                        <input
                            type="text"
                            className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                            placeholder="مثال: جمعية الخير الإنسانية"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                        />
                        {errors.name && <p className="form-error">{errors.name[0]}</p>}
                    </div>

                    {/* Type & Contact Person */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                            <label className="form-label">نوع الجهة</label>
                            <select
                                className="form-input"
                                value={formData.type || 'individual'}
                                onChange={(e) => handleChange('type', e.target.value as SponsorType)}
                            >
                                <option value="individual">فرد</option>
                                <option value="company">شركة</option>
                                <option value="organization">منظمة</option>
                                <option value="government">جهة حكومية</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">اسم الممثل/المسؤول</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="الاسم الكامل"
                                value={formData.contact_person || ''}
                                onChange={(e) => handleChange('contact_person', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Phone & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                            <label className="form-label">رقم الهاتف</label>
                            <input
                                type="tel"
                                className="form-input"
                                placeholder="+90 555 123 4567"
                                value={formData.phone || ''}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                dir="ltr"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">البريد الإلكتروني</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="example@email.com"
                                value={formData.email || ''}
                                onChange={(e) => handleChange('email', e.target.value)}
                                dir="ltr"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="form-group">
                        <label className="form-label">العنوان</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="العنوان الكامل"
                            value={formData.address || ''}
                            onChange={(e) => handleChange('address', e.target.value)}
                        />
                    </div>

                    {/* Website */}
                    <div className="form-group">
                        <label className="form-label">الموقع الإلكتروني</label>
                        <input
                            type="url"
                            className="form-input"
                            placeholder="https://example.com"
                            value={formData.website || ''}
                            onChange={(e) => handleChange('website', e.target.value)}
                            dir="ltr"
                        />
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">وصف/ملاحظات</label>
                        <textarea
                            className="form-input"
                            rows={3}
                            placeholder="أي ملاحظات إضافية..."
                            value={formData.description_ar || ''}
                            onChange={(e) => handleChange('description_ar', e.target.value)}
                        />
                    </div>

                    {/* Active Status */}
                    <div className="form-group">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="form-checkbox"
                                checked={formData.is_active}
                                onChange={(e) => handleChange('is_active', e.target.checked)}
                            />
                            <span className="text-gray-700">جهة داعمة نشطة</span>
                        </label>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-4 border-t">
                        <Button
                            type="button"
                            variant="secondary"
                            fullWidth
                            onClick={() => navigate(`/relations/sponsors/${id}`)}
                        >
                            إلغاء
                        </Button>
                        <Button
                            type="submit"
                            fullWidth
                            disabled={updateMutation.isPending}
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
            </div>
        </div>
    );
}
