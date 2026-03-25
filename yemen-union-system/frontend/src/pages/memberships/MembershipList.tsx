import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/common';
import { formatArabicNumber, formatArabicDate, formatCurrency } from '../../utils/formatters';
import type { ApiResponse } from '../../types';

// ============================================
// STATS WIDGET
// ============================================
function StatsWidget({ label, value, icon, color }: { label: string, value: string | number, icon: string, color: string }) {
    const bgMap: any = { red: '#FEF2F2', green: '#ECFDF5', orange: '#FFF7ED', blue: '#EFF6FF', gray: '#F3F4F6' };
    const textMap: any = { red: '#DC2626', green: '#059669', orange: '#D97706', blue: '#2563EB', gray: '#374151' };

    return (
        <div className="card flex items-center p-4 gap-4" style={{ minWidth: '0' }}>
            <div className="rounded-xl flex items-center justify-center font-black" style={{ background: bgMap[color], color: textMap[color], width: '56px', height: '56px', fontSize: '24px', flexShrink: 0 }}>
                {icon}
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }} className="truncate">{value}</div>
                <div className="text-muted text-sm font-bold truncate">{label}</div>
            </div>
        </div>
    );
}

export function MembershipList() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [status, setStatus] = useState(searchParams.get('status') || '');
    const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Update URL
    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (status) params.set('status', status);
        if (page > 1) params.set('page', String(page));
        setSearchParams(params, { replace: true });
    }, [debouncedSearch, status, page, setSearchParams]);

    const { data: responseData, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['memberships', { search: debouncedSearch, status, page }],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (debouncedSearch) params.append('search', debouncedSearch);
            if (status) params.append('status', status);
            params.append('page', String(page));
            params.append('per_page', '10');

            const response = await api.get<ApiResponse<any>>(`/memberships?${params}`);
            return response.data.data;
        },
    });

    const memberships = responseData?.memberships || [];
    const stats = responseData?.stats || { total: 0, active: 0, pending: 0, expired: 0, total_revenue: 0 };
    const pagination = responseData?.pagination || { total: 0, page: 1, total_pages: 1 };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'active': return { label: 'ساري', badge: 'success' };
            case 'pending': return { label: 'قيد المراجعة', badge: 'warning' };
            case 'expired': return { label: 'منتهي', badge: 'danger' };
            case 'cancelled': return { label: 'ملغى', badge: 'secondary' };
            case 'rejected': return { label: 'مرفوض', badge: 'danger' };
            default: return { label: status, badge: 'secondary' };
        }
    };

    const getPackageInfo = (type: string) => {
        switch (type) {
            case 'annual': return 'اشتراك سنوي';
            case 'semester': return 'اشتراك فصلي';
            case 'monthly': return 'اشتراك شهري';
            default: return type;
        }
    };

    return (
        <div className="flex-column gap-lg animate-fadeIn">
            {/* Header */}
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 className="text-2xl font-bold flex gap-2 items-center">
                        💳 إدارة الاشتراكات
                    </h1>
                    <p className="text-muted mt-1">عرض ومتابعة مدفوعات واشتراكات الأعضاء والموافقة على الطلبات.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => refetch()} loading={isFetching}>
                        تحديث
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <StatsWidget label="إجمالي الطلبات" value={formatArabicNumber(stats.total)} icon="📂" color="blue" />
                <StatsWidget label="اشتراكات سارية" value={formatArabicNumber(stats.active)} icon="✅" color="green" />
                <StatsWidget label="طلبات معلقة" value={formatArabicNumber(stats.pending)} icon="⏳" color="orange" />
                <StatsWidget label="إيرادات مدفوعة" value={`${formatCurrency(stats.total_revenue)} ₺`} icon="💰" color="red" />
            </div>

            {/* Filters */}
            <div className="card p-4 flex gap-4" style={{ flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '250px' }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="ابحث باسم المشترك..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="form-control"
                    style={{ width: '200px' }}
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                >
                    <option value="">كل الحالات</option>
                    <option value="pending">طلبات معلقة</option>
                    <option value="active">ساري المفعول</option>
                    <option value="expired">منتهي</option>
                    <option value="rejected">مرفوض</option>
                </select>
            </div>

            {/* Table */}
            <div className="card p-0">
                <div className="table-responsive">
                    <table className="table" style={{ width: '100%', minWidth: '800px' }}>
                        <thead>
                            <tr>
                                <th>صاحب الطلب</th>
                                <th>نوع الباقة</th>
                                <th>المبلغ (₺)</th>
                                <th>تاريخ الطلب</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="text-center p-4">جاري التحميل...</td>
                                </tr>
                            ) : memberships.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center p-8 text-muted">لا توجد اشتراكات مطابقة</td>
                                </tr>
                            ) : (
                                memberships.map((item: any) => {
                                    const sInfo = getStatusInfo(item.status);
                                    return (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="font-bold">{item.user_name || 'غير معروف'}</div>
                                                <div className="text-xs text-muted" dir="ltr">{item.user_phone || '-'}</div>
                                            </td>
                                            <td className="font-bold" style={{ color: '#4B5563' }}>
                                                {getPackageInfo(item.package_type)}
                                            </td>
                                            <td className="font-bold text-primary">
                                                {item.amount}
                                            </td>
                                            <td>
                                                <div className="text-sm font-bold">{formatArabicDate(item.created_at)}</div>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${sInfo.badge}`}>
                                                    {sInfo.label}
                                                </span>
                                            </td>
                                            <td>
                                                <Link to={`/memberships/${item.id}`}>
                                                    <Button variant="secondary" size="sm">التفاصيل / إدارة</Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.total_pages > 1 && (
                    <div className="pagination p-4 border-t flex items-center justify-between" style={{ display: 'flex' }}>
                        <button className="page-btn" disabled={pagination.page === 1} onClick={() => setPage(p => p - 1)}>&lt;</button>
                        <div className="px-4 text-sm font-bold text-muted">صفحة {pagination.page} من {pagination.total_pages}</div>
                        <button className="page-btn" disabled={pagination.page === pagination.total_pages} onClick={() => setPage(p => p + 1)}>&gt;</button>
                    </div>
                )}
            </div>
        </div>
    );
}
