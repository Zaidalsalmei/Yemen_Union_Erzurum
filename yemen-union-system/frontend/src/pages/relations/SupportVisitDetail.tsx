import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    StatusBadge,
    LoadingPage,
    ErrorState
} from '../../components/common';
import { formatArabicDate, formatCurrency, formatArabicNumber } from '../../utils/formatters';
import type { Sponsorship, ApiResponse } from '../../types';

export function SupportVisitDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: sponsorship, isLoading, error, refetch } = useQuery({
        queryKey: ['sponsorship', id],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Sponsorship>>(`/sponsorships/${id}`);
            return response.data.data!;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/sponsorships/${id}`);
        },
        onSuccess: () => {
            toast.success('تم حذف الرعاية بنجاح');
            queryClient.invalidateQueries({ queryKey: ['sponsorships'] });
            queryClient.invalidateQueries({ queryKey: ['sponsors-stats'] });
            navigate('/relations/sponsorships');
        },
        onError: () => {
            toast.error('فشل في حذف الرعاية');
        },
    });

    const handleDelete = () => {
        if (window.confirm('هل أنت متأكد من حذف هذه الرعاية؟ هذا الإجراء لا يمكن التراجع عنه.')) {
            deleteMutation.mutate();
        }
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, { label: string; icon: string; color: string }> = {
            general: { label: 'دعم عام', icon: '💰', color: 'bg-blue-100 text-blue-700' },
            activity: { label: 'دعم نشاط', icon: '🎯', color: 'bg-purple-100 text-purple-700' },
            project: { label: 'مشروع', icon: '📁', color: 'bg-amber-100 text-amber-700' },
            scholarship: { label: 'منحة', icon: '🎓', color: 'bg-green-100 text-green-700' },
            emergency: { label: 'طوارئ', icon: '🚨', color: 'bg-red-100 text-red-700' },
        };
        return labels[category] || { label: category, icon: '💰', color: 'bg-gray-100 text-gray-700' };
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, { label: string; icon: string; variant: string }> = {
            pending: { label: 'قيد الانتظار', icon: '⏳', variant: 'pending' },
            received: { label: 'تم الاستلام', icon: '✅', variant: 'active' },
            allocated: { label: 'تم التخصيص', icon: '📦', variant: 'verified' },
        };
        return labels[status] || { label: status, icon: '❓', variant: 'inactive' };
    };

    if (isLoading) {
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

    const categoryInfo = getCategoryLabel(sponsorship.category);
    const statusInfo = getStatusLabel(sponsorship.status);

    return (
        <div className="animate-fadeIn">
            {/* Page Header */}
            <header className="page-header">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/relations/sponsorships')}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="page-title flex items-center gap-3">
                                <span className="text-3xl">{categoryInfo.icon}</span>
                                تفاصيل الرعاية
                            </h1>
                            <p className="page-subtitle">
                                عرض ومراجعة بيانات الرعاية #{formatArabicNumber(sponsorship.id)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to={`/relations/sponsorships/${id}/edit`}>
                            <Button variant="secondary">
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                تعديل
                            </Button>
                        </Link>
                        <Button
                            variant="danger"
                            onClick={handleDelete}
                            loading={deleteMutation.isPending}
                        >
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            حذف
                        </Button>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Amount Card */}
                <Card className="lg:col-span-1">
                    <CardBody className="text-center">
                        {/* Amount Display */}
                        <div className="mb-6">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-5xl mx-auto shadow-xl text-white">
                                💰
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {formatCurrency(sponsorship.amount, sponsorship.currency)}
                        </h2>

                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${categoryInfo.color}`}>
                            <span>{categoryInfo.icon}</span>
                            {categoryInfo.label}
                        </span>

                        {/* Quick Info */}
                        <div className="space-y-3 text-right mt-6">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <span className="text-xl">📋</span>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">رقم الرعاية</p>
                                    <p className="font-medium text-gray-900">#{formatArabicNumber(sponsorship.id)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <span className="text-xl">{statusInfo.icon}</span>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">الحالة</p>
                                    <StatusBadge status={statusInfo.variant as any} />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <span className="text-xl">📅</span>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">تاريخ الاستلام</p>
                                    <p className="font-medium text-gray-900">{formatArabicDate(sponsorship.received_date)}</p>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Details Cards */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Sponsor Information */}
                    <Card>
                        <CardHeader title="الجهة الداعمة" />
                        <CardBody>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold text-2xl">
                                    {sponsorship.sponsor?.name?.charAt(0) || '?'}
                                </div>
                                <div className="flex-1">
                                    <Link
                                        to={`/relations/sponsors/${sponsorship.sponsor_id}`}
                                        className="text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors"
                                    >
                                        {sponsorship.sponsor?.name || 'جهة غير معروفة'}
                                    </Link>
                                    <p className="text-gray-600">{sponsorship.sponsor?.type || ''}</p>
                                    {sponsorship.sponsor?.contact_person && (
                                        <p className="text-sm text-gray-500">
                                            جهة الاتصال: {sponsorship.sponsor.contact_person}
                                        </p>
                                    )}
                                </div>
                                <Link to={`/relations/sponsors/${sponsorship.sponsor_id}`}>
                                    <Button variant="secondary" size="sm">عرض الجهة</Button>
                                </Link>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Sponsorship Details */}
                    <Card>
                        <CardHeader title="تفاصيل الرعاية" />
                        <CardBody>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoItem
                                    label="غرض الرعاية"
                                    value={sponsorship.purpose_ar}
                                    icon="🎯"
                                />
                                <InfoItem
                                    label="التصنيف"
                                    value={
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${categoryInfo.color}`}>
                                            {categoryInfo.icon} {categoryInfo.label}
                                        </span>
                                    }
                                    icon="📁"
                                />
                                <InfoItem
                                    label="المبلغ"
                                    value={formatCurrency(sponsorship.amount, sponsorship.currency)}
                                    icon="💰"
                                />
                                <InfoItem
                                    label="العملة"
                                    value={sponsorship.currency}
                                    icon="💱"
                                />
                                <InfoItem
                                    label="تاريخ الاستلام"
                                    value={formatArabicDate(sponsorship.received_date)}
                                    icon="📅"
                                />
                                {sponsorship.receipt_number && (
                                    <InfoItem
                                        label="رقم الإيصال"
                                        value={sponsorship.receipt_number}
                                        icon="🧾"
                                    />
                                )}
                            </div>
                        </CardBody>
                    </Card>

                    {/* Linked Activity (if any) */}
                    {sponsorship.activity && (
                        <Card>
                            <CardHeader title="النشاط المرتبط" />
                            <CardBody>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 text-xl">
                                        🎯
                                    </div>
                                    <div className="flex-1">
                                        <Link
                                            to={`/activities/${sponsorship.activity_id}`}
                                            className="font-bold text-gray-900 hover:text-primary-600 transition-colors"
                                        >
                                            {sponsorship.activity.title_ar}
                                        </Link>
                                        <p className="text-sm text-gray-500">
                                            {formatArabicDate(sponsorship.activity.start_date)}
                                        </p>
                                    </div>
                                    <Link to={`/activities/${sponsorship.activity_id}`}>
                                        <Button variant="secondary" size="sm">عرض النشاط</Button>
                                    </Link>
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    {/* Notes */}
                    {sponsorship.notes && (
                        <Card>
                            <CardHeader title="ملاحظات" />
                            <CardBody>
                                <p className="text-gray-700 whitespace-pre-wrap">{sponsorship.notes}</p>
                            </CardBody>
                        </Card>
                    )}

                    {/* Metadata */}
                    <Card>
                        <CardHeader title="معلومات النظام" />
                        <CardBody>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>تاريخ الإنشاء: {formatArabicDate(sponsorship.created_at)}</span>
                                </div>
                                {sponsorship.updated_at && sponsorship.updated_at !== sponsorship.created_at && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        <span>آخر تحديث: {formatArabicDate(sponsorship.updated_at)}</span>
                                    </div>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Helper Component
interface InfoItemProps {
    label: string;
    value: string | React.ReactNode;
    icon: string;
}

function InfoItem({ label, value, icon }: InfoItemProps) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{icon}</span>
                <p className="text-sm text-gray-500">{label}</p>
            </div>
            <div className="mr-6">
                {typeof value === 'string' ? (
                    <p className="font-medium text-gray-900">{value}</p>
                ) : (
                    value
                )}
            </div>
        </div>
    );
}
