import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    LoadingPage,
    ErrorState
} from '../../components/common';
import { formatCurrency } from '../../utils/formatters';
import type { Membership, MembershipPackage, ApiResponse } from '../../types';

// ============================================
// TYPES
// ============================================
interface MembershipEditFormData {
    package_id: number;
    amount: number;
    payment_method: 'cash' | 'bank_transfer' | 'credit_card' | 'other';
    reference_id?: string;
    start_date: string;
    end_date: string;
    status: string;
    notes?: string;
}

// ============================================
// MAIN COMPONENT
// ============================================
export function MembershipEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<MembershipEditFormData | null>(null);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [hasChanges, setHasChanges] = useState(false);

    // Fetch membership data
    const { data: membership, isLoading, error, refetch } = useQuery({
        queryKey: ['membership', id],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Membership>>(`/memberships/${id}`);
            return response.data.data!;
        },
    });

    // Fetch membership packages
    const { data: packages } = useQuery({
        queryKey: ['membership-packages'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<MembershipPackage[]>>('/memberships/packages');
            return response.data.data!;
        },
    });

    // Initialize form data when membership loads
    useEffect(() => {
        if (membership && !formData) {
            setFormData({
                package_id: membership.membership_type?.id || 0,
                amount: membership.amount,
                payment_method: membership.payment_method as any,
                reference_id: membership.reference_id || '',
                start_date: membership.start_date.split('T')[0],
                end_date: membership.end_date.split('T')[0],
                status: membership.status,
                notes: membership.notes || '',
            });
        }
    }, [membership, formData]);

    // Update membership mutation
    const updateMutation = useMutation({
        mutationFn: async (data: MembershipEditFormData) => {
            const response = await api.put<ApiResponse<Membership>>(`/memberships/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            toast.success('تم تحديث الاشتراك بنجاح');
            queryClient.invalidateQueries({ queryKey: ['membership', id] });
            queryClient.invalidateQueries({ queryKey: ['memberships'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            navigate(`/memberships/${id}`);
        },
        onError: (error: any) => {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                toast.error('فشل في تحديث الاشتراك');
            }
        },
    });

    const handleChange = (field: keyof MembershipEditFormData, value: string | number) => {
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
        if (!formData.amount || formData.amount <= 0) {
            newErrors.amount = ['يرجى إدخال مبلغ صحيح'];
        }
        if (!formData.start_date) {
            newErrors.start_date = ['تاريخ البداية مطلوب'];
        }
        if (!formData.end_date) {
            newErrors.end_date = ['تاريخ الانتهاء مطلوب'];
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        updateMutation.mutate(formData);
    };

    if (isLoading || !formData) {
        return <LoadingPage message="جاري تحميل بيانات الاشتراك..." />;
    }

    if (error || !membership) {
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
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(`/memberships/${id}`)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="page-title flex items-center gap-3">
                                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                تعديل الاشتراك
                            </h1>
                            <p className="page-subtitle">
                                تعديل بيانات اشتراك {membership.user?.full_name}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {hasChanges && (
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                                تغييرات غير محفوظة
                            </span>
                        )}
                    </div>
                </div>
            </header>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Member Info Card */}
                    <Card className="lg:col-span-1">
                        <CardHeader title="معلومات العضو" />
                        <CardBody>
                            <div className="text-center mb-4">
                                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold text-3xl mx-auto mb-3">
                                    {membership.user?.full_name?.charAt(0) || '?'}
                                </div>
                                <h3 className="font-bold text-lg text-gray-900">{membership.user?.full_name}</h3>
                                <p className="text-gray-600">{membership.user?.phone_number}</p>
                                {membership.user?.email && (
                                    <p className="text-sm text-gray-500">{membership.user.email}</p>
                                )}
                            </div>
                            <div className="pt-4 border-t">
                                <Link to={`/users/${membership.user_id}`}>
                                    <Button variant="secondary" fullWidth size="sm">
                                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        عرض ملف العضو
                                    </Button>
                                </Link>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Edit Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Subscription Details */}
                        <Card>
                            <CardHeader title="تفاصيل الاشتراك" />
                            <CardBody>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Package Selection */}
                                    <div className="form-group">
                                        <label className="form-label">نوع الاشتراك</label>
                                        <select
                                            className="form-input"
                                            value={formData.package_id}
                                            onChange={(e) => handleChange('package_id', parseInt(e.target.value))}
                                        >
                                            {packages?.map((pkg) => (
                                                <option key={pkg.id} value={pkg.id}>
                                                    {pkg.name_ar} ({pkg.duration_months} شهر - {formatCurrency(pkg.price)})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Status */}
                                    <div className="form-group">
                                        <label className="form-label">الحالة</label>
                                        <select
                                            className="form-input"
                                            value={formData.status}
                                            onChange={(e) => handleChange('status', e.target.value)}
                                        >
                                            <option value="active">✅ ساري</option>
                                            <option value="expired">⏰ منتهي</option>
                                            <option value="cancelled">❌ ملغي</option>
                                        </select>
                                    </div>

                                    {/* Amount */}
                                    <div className="form-group">
                                        <label className="form-label required">المبلغ</label>
                                        <input
                                            type="number"
                                            className={`form-input ${errors.amount ? 'border-red-500' : ''}`}
                                            value={formData.amount}
                                            onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                                            min="0"
                                            step="0.01"
                                        />
                                        {errors.amount && <p className="form-error">{errors.amount[0]}</p>}
                                    </div>

                                    {/* Payment Method */}
                                    <div className="form-group">
                                        <label className="form-label">طريقة الدفع</label>
                                        <select
                                            className="form-input"
                                            value={formData.payment_method}
                                            onChange={(e) => handleChange('payment_method', e.target.value)}
                                        >
                                            <option value="cash">💵 نقداً</option>
                                            <option value="bank_transfer">🏦 تحويل بنكي</option>
                                            <option value="credit_card">💳 بطاقة ائتمان</option>
                                            <option value="other">📝 أخرى</option>
                                        </select>
                                    </div>

                                    {/* Start Date */}
                                    <div className="form-group">
                                        <label className="form-label required">تاريخ البداية</label>
                                        <input
                                            type="date"
                                            className={`form-input ${errors.start_date ? 'border-red-500' : ''}`}
                                            value={formData.start_date}
                                            onChange={(e) => handleChange('start_date', e.target.value)}
                                        />
                                        {errors.start_date && <p className="form-error">{errors.start_date[0]}</p>}
                                    </div>

                                    {/* End Date */}
                                    <div className="form-group">
                                        <label className="form-label required">تاريخ الانتهاء</label>
                                        <input
                                            type="date"
                                            className={`form-input ${errors.end_date ? 'border-red-500' : ''}`}
                                            value={formData.end_date}
                                            onChange={(e) => handleChange('end_date', e.target.value)}
                                        />
                                        {errors.end_date && <p className="form-error">{errors.end_date[0]}</p>}
                                    </div>
                                </div>

                                {/* Reference ID */}
                                <div className="form-group mt-6">
                                    <label className="form-label">رقم المرجع / الفاتورة</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="اختياري"
                                        value={formData.reference_id}
                                        onChange={(e) => handleChange('reference_id', e.target.value)}
                                        dir="ltr"
                                    />
                                </div>

                                {/* Notes */}
                                <div className="form-group mt-6">
                                    <label className="form-label">ملاحظات</label>
                                    <textarea
                                        className="form-input"
                                        rows={3}
                                        placeholder="أي ملاحظات إضافية..."
                                        value={formData.notes}
                                        onChange={(e) => handleChange('notes', e.target.value)}
                                    />
                                </div>
                            </CardBody>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate(`/memberships/${id}`)}
                            >
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                إلغاء
                            </Button>
                            <Button
                                type="submit"
                                loading={updateMutation.isPending}
                                disabled={!hasChanges}
                            >
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                حفظ التغييرات
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
