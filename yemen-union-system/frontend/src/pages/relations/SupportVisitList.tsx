import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { StatusBadge, Modal } from '../../components/common';
import { formatArabicDate, formatCurrency, formatArabicNumber } from '../../utils/formatters';
import type { Sponsorship, SupportersStats, ApiResponse } from '../../types';

// Scoped Stat Widget
function StatsWidget({ label, value, icon, color }: { label: string, value: number, icon: string, color: string }) {
    const bgMap: any = { red: '#FEF2F2', green: '#ECFDF5', orange: '#FFF7ED', blue: '#EFF6FF' };
    const textMap: any = { red: '#DC2626', green: '#059669', orange: '#D97706', blue: '#2563EB' };

    return (
        <div className="stat-card-std">
            <div className="icon-wrapper" style={{ background: bgMap[color], color: textMap[color] }}>
                {icon}
            </div>
            <div className="info">
                <div className="value">{typeof value === 'number' ? formatArabicNumber(value) : value}</div>
                <div className="label">{label}</div>
            </div>
        </div>
    );
}

export function SupportVisitList() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sponsorId = searchParams.get('sponsor_id');

    const [filter, setFilter] = useState<'all' | 'activity' | 'general'>('all');
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; sponsorship: Sponsorship | null }>({
        isOpen: false,
        sponsorship: null,
    });

    // Fetch sponsorships
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['sponsorships', sponsorId, filter],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (sponsorId) params.append('sponsor_id', sponsorId);
            if (filter !== 'all') params.append('category', filter);
            const response = await api.get<ApiResponse<Sponsorship[]>>(`/sponsorships?${params}`);
            return response.data;
        },
    });

    // Fetch stats
    const { data: statsData } = useQuery({
        queryKey: ['sponsors-stats'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<SupportersStats>>('/sponsors/stats');
            return response.data.data!;
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/sponsorships/${id}`);
        },
        onSuccess: () => {
            toast.success('تم حذف الرعاية بنجاح');
            queryClient.invalidateQueries({ queryKey: ['sponsorships'] });
            queryClient.invalidateQueries({ queryKey: ['sponsors-stats'] });
            setDeleteModal({ isOpen: false, sponsorship: null });
        },
        onError: () => {
            toast.error('فشل في حذف الرعاية');
        },
    });

    // Approve mutation
    const approveMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.post(`/sponsorships/${id}/approve`);
        },
        onSuccess: () => {
            toast.success('تم اعتماد الرعاية وتحديث المالية');
            queryClient.invalidateQueries({ queryKey: ['sponsorships'] });
            queryClient.invalidateQueries({ queryKey: ['sponsors-stats'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
        onError: () => toast.error('فشل في اعتماد الرعاية'),
    });

    // Reject mutation
    const rejectMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.post(`/sponsorships/${id}/reject`);
        },
        onSuccess: () => {
            toast.success('تم رفض الرعاية');
            queryClient.invalidateQueries({ queryKey: ['sponsorships'] });
        },
        onError: () => toast.error('فشل في رفض الرعاية'),
    });

    const sponsorships = data?.data || [];
    const stats = statsData || {
        total_sponsors: 0,
        active_sponsors: 0,
        total_sponsored: 0,
        total_sponsorships: 0,
        this_month_amount: 0,
        top_sponsors: [],
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            'general': '💰 دعم عام',
            'activity': '🎯 دعم نشاط',
            'project': '📁 مشروع',
            'scholarship': '🎓 منحة',
            'emergency': '🚨 طوارئ',
        };
        return labels[category] || category;
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, 'active' | 'pending' | 'cancelled'> = {
            'received': 'active',
            'pending': 'pending',
            'allocated': 'active',
            'refunded': 'cancelled',
        };
        return labels[status] || 'pending';
    };

    return (
        <div className="animate-fadeIn">
            {/* Scoped Page Header */}
            <div className="page-header">
                <div>
                    <h1>سجل الرعايات</h1>
                    <p>سجل جميع الرعايات والمساهمات المالية</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0', color: '#64748b' }} onClick={() => navigate('/relations/sponsors')}>
                        🏢 الجهات الداعمة
                    </button>
                    <button className="btn" style={{ background: 'var(--color-primary)', color: 'white' }} onClick={() => navigate('/relations/sponsorships/create')}>
                        <span>+</span> تسجيل رعاية
                    </button>
                </div>
            </div>

            {/* Scoped Stats Grid */}
            <div className="stats-grid">
                <StatsWidget label="إجمالي الرعايات" value={stats.total_sponsorships} icon="📊" color="blue" />
                <StatsWidget label="إجمالي الدعم" value={formatCurrency(stats.total_sponsored) as any} icon="💰" color="orange" />
                <StatsWidget label="دعم هذا الشهر" value={formatCurrency(stats.this_month_amount) as any} icon="📅" color="red" />
                <StatsWidget label="داعمين نشطين" value={stats.active_sponsors} icon="✅" color="green" />
            </div>

            {/* Scoped Filter Bar (Tabs) */}
            <div className="filter-bar">
                <button
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    📋 الكل
                </button>
                <button
                    className={`filter-tab ${filter === 'general' ? 'active' : ''}`}
                    onClick={() => setFilter('general')}
                >
                    💰 دعم عام
                </button>
                <button
                    className={`filter-tab ${filter === 'activity' ? 'active' : ''}`}
                    onClick={() => setFilter('activity')}
                >
                    🎯 دعم أنشطة
                </button>
            </div>

            {/* Scoped Table Container */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>الجهة الداعمة</th>
                            <th>مبلغ الرعاية</th>
                            <th>الغرض</th>
                            <th>التصنيف</th>
                            <th>التاريخ</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>جاري التحميل...</td></tr>
                        ) : error ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>حدث خطأ في تحميل البيانات</td></tr>
                        ) : !sponsorships?.length ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>لا توجد رعايات مسجلة</td></tr>
                        ) : (
                            sponsorships.map((sponsorship) => (
                                <tr key={sponsorship.id}>
                                    <td>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{sponsorship.sponsor_name}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>#{sponsorship.reference_id}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 700, color: '#16a34a' }}>
                                            {formatCurrency(sponsorship.amount)}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '13px' }}>{sponsorship.purpose_ar}</div>
                                        {sponsorship.activity_title && (
                                            <div style={{ fontSize: '11px', color: '#2563eb', marginTop: '4px' }}>🎯 {sponsorship.activity_title}</div>
                                        )}
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            background: sponsorship.category === 'activity' ? '#eff6ff' : '#dcfce7',
                                            color: sponsorship.category === 'activity' ? '#2563eb' : '#166534'
                                        }}>
                                            {getCategoryLabel(sponsorship.category)}
                                        </span>
                                    </td>
                                    <td>{formatArabicDate(sponsorship.received_date)}</td>
                                    <td>
                                        <StatusBadge status={getStatusLabel(sponsorship.status)} />
                                    </td>
                                    <td style={{ display: 'flex', gap: '8px' }}>
                                        {sponsorship.status === 'pending' && (
                                            <>
                                                <button
                                                    style={{ padding: '6px', borderRadius: '6px', color: '#059669', background: '#ecfdf5', border: 'none', cursor: 'pointer' }}
                                                    onClick={() => approveMutation.mutate(sponsorship.id)}
                                                    title="اعتماد"
                                                    disabled={approveMutation.isPending}
                                                >
                                                    ✅
                                                </button>
                                                <button
                                                    style={{ padding: '6px', borderRadius: '6px', color: '#dc2626', background: '#fef2f2', border: 'none', cursor: 'pointer' }}
                                                    onClick={() => rejectMutation.mutate(sponsorship.id)}
                                                    title="رفض"
                                                    disabled={rejectMutation.isPending}
                                                >
                                                    ❌
                                                </button>
                                            </>
                                        )}
                                        <button
                                            style={{ padding: '6px', borderRadius: '6px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                            onClick={() => setDeleteModal({ isOpen: true, sponsorship })}
                                            title="حذف"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, sponsorship: null })}
                title="تأكيد الحذف"
            >
                <div className="p-6">
                    <p className="text-gray-600 mb-6">
                        هل أنت متأكد من حذف الرعاية بقيمة {deleteModal.sponsorship && formatCurrency(deleteModal.sponsorship.amount)}؟
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            className="btn"
                            style={{ background: '#f1f5f9', color: '#64748b' }}
                            onClick={() => setDeleteModal({ isOpen: false, sponsorship: null })}
                        >
                            إلغاء
                        </button>
                        <button
                            className="btn"
                            style={{ background: '#ef4444', color: 'white' }}
                            onClick={() => deleteModal.sponsorship && deleteMutation.mutate(deleteModal.sponsorship.id)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? 'جاري الحذف...' : 'حذف'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
