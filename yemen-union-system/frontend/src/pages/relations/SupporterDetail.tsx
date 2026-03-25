import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Button, StatusBadge, Spinner, ErrorState, Modal } from '../../components/common';
import { formatArabicDate, formatCurrency } from '../../utils/formatters';
import type { Sponsor, Sponsorship, ApiResponse } from '../../types';

export function SupporterDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [deleteModal, setDeleteModal] = useState(false);

    // Fetch sponsor details
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['sponsor', id],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Sponsor>>(`/sponsors/${id}`);
            return response.data.data!;
        },
        enabled: !!id,
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/sponsors/${id}`);
        },
        onSuccess: () => {
            toast.success('تم حذف الجهة الداعمة بنجاح');
            queryClient.invalidateQueries({ queryKey: ['sponsors'] });
            navigate('/relations/sponsors');
        },
        onError: () => {
            toast.error('فشل في حذف الجهة الداعمة');
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="card">
                <ErrorState onRetry={() => refetch()} />
            </div>
        );
    }

    const sponsor = data;
    const typeLabels: Record<string, string> = {
        'individual': 'فرد',
        'company': 'شركة',
        'organization': 'منظمة',
        'government': 'جهة حكومية',
    };

    return (
        <div className="animate-fadeIn">
            {/* Page Header */}
            <header className="page-header">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/relations/sponsors')}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="page-title flex items-center gap-3">
                                <span className="text-3xl">🏢</span>
                                {sponsor.name}
                            </h1>
                            <p className="page-subtitle">تفاصيل الجهة الداعمة</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to={`/relations/sponsorships/create?sponsor_id=${sponsor.id}`}>
                            <Button variant="secondary">
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                تسجيل رعاية
                            </Button>
                        </Link>
                        <Link to={`/relations/sponsors/${id}/edit`}>
                            <Button variant="secondary">
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                تعديل
                            </Button>
                        </Link>
                        <Button variant="danger" onClick={() => setDeleteModal(true)}>
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            حذف
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sponsor Info */}
                <div className="lg:col-span-1">
                    <div className="card">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-3xl font-bold">
                                {sponsor.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{sponsor.name}</h2>
                                <StatusBadge status={sponsor.is_active ? 'active' : 'suspended'} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <InfoRow icon="🏷️" label="النوع" value={typeLabels[sponsor.type] || sponsor.type} />
                            {sponsor.contact_person && (
                                <InfoRow icon="�" label="الممثل" value={sponsor.contact_person} />
                            )}
                            {sponsor.phone && (
                                <InfoRow icon="�" label="الهاتف" value={sponsor.phone} />
                            )}
                            {sponsor.email && (
                                <InfoRow icon="✉️" label="البريد" value={sponsor.email} />
                            )}
                            {sponsor.address && (
                                <InfoRow icon="🏠" label="العنوان" value={sponsor.address} />
                            )}
                            {sponsor.website && (
                                <InfoRow icon="�" label="الموقع" value={sponsor.website} />
                            )}
                            <InfoRow icon="📅" label="تاريخ الإضافة" value={formatArabicDate(sponsor.created_at)} />
                        </div>

                        {sponsor.description_ar && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                                <h4 className="font-medium text-gray-700 mb-2">الوصف</h4>
                                <p className="text-gray-600 text-sm">{sponsor.description_ar}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Statistics & Sponsorships */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                            <div className="text-center">
                                <p className="text-4xl font-bold mb-2">
                                    {formatCurrency(sponsor.total_sponsored || 0)}
                                </p>
                                <p className="text-primary-100">إجمالي مبلغ الرعايات</p>
                            </div>
                        </div>
                        <div className="card bg-gradient-to-br from-gray-700 to-gray-900 text-white">
                            <div className="text-center">
                                <p className="text-4xl font-bold mb-2">
                                    {typeLabels[sponsor.type] || sponsor.type}
                                </p>
                                <p className="text-gray-300">نوع الجهة</p>
                            </div>
                        </div>
                    </div>

                    {/* Visits & Sponsorships History */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <span>📋</span>
                                سجل الرعايات والزيارات
                            </h3>
                            <Link to={`/relations/sponsorships?sponsor_id=${sponsor.id}`}>
                                <Button variant="secondary" size="sm">
                                    عرض السجل الكامل
                                </Button>
                            </Link>
                        </div>

                        {sponsor.recent_sponsorships && sponsor.recent_sponsorships.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-right bg-white rounded-lg overflow-hidden">
                                    <thead className="bg-gray-50 text-gray-900 border-b border-gray-100">
                                        <tr>
                                            <th className="py-3 px-4 font-semibold text-sm">التاريخ</th>
                                            <th className="py-3 px-4 font-semibold text-sm">القائم بالزيارة / المسؤول</th>
                                            <th className="py-3 px-4 font-semibold text-sm">المبلغ</th>
                                            <th className="py-3 px-4 font-semibold text-sm">النشاط المدعوم</th>
                                            <th className="py-3 px-4 font-semibold text-sm">التفاصيل</th>
                                            <th className="py-3 px-4 font-semibold text-sm">الحالة</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {sponsor.recent_sponsorships.map((sponsorship) => {
                                            // Extract Visitor from notes if available
                                            const visitorMatch = sponsorship.notes?.match(/\[القائم بالزيارة: (.*?)\]/);
                                            const visitorName = visitorMatch ? visitorMatch[1] : '-';

                                            // Extract description without the visitor tag
                                            const description = sponsorship.notes?.replace(/\[القائم بالزيارة: .*?\] - /, '') || sponsorship.purpose_ar;

                                            return (
                                                <tr key={sponsorship.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-3 px-4 text-sm text-gray-700">
                                                        {formatArabicDate(sponsorship.received_date)}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-700">
                                                        {visitorName}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm font-bold text-primary-600 cursor-default">
                                                        {formatCurrency(sponsorship.amount)}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-700">
                                                        {sponsorship.activity_title ? (
                                                            <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs w-fit">
                                                                🎯 {sponsorship.activity_title}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-600 max-w-[200px] truncate" title={description}>
                                                        {description}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <StatusBadge status={sponsorship.status === 'received' ? 'active' : 'pending'} />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <span className="text-4xl block mb-2 opacity-50">📭</span>
                                <p>لا توجد زيارات أو رعايات مسجلة حتى الآن</p>
                                <Link to={`/relations/sponsorships/create?sponsor_id=${sponsor.id}`} className="inline-block mt-4">
                                    <Button size="sm" variant="secondary">تسجيل زيارة جديدة</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            <Modal
                isOpen={deleteModal}
                onClose={() => setDeleteModal(false)}
                title="تأكيد الحذف"
            >
                <div className="p-6">
                    <p className="text-gray-600 mb-6">
                        هل أنت متأكد من حذف الجهة الداعمة "{sponsor.name}"؟
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button variant="secondary" onClick={() => setDeleteModal(false)}>
                            إلغاء
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => deleteMutation.mutate()}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? 'جاري الحذف...' : 'حذف'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

// Info Row Component
function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-lg">{icon}</span>
            <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="font-medium text-gray-900">{value}</p>
            </div>
        </div>
    );
}


