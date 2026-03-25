import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { getStorageUrl } from '../../utils/images';
import { usePermission } from '../../hooks/usePermission';
import { StatusBadge } from '../../components/common';
import { formatArabicDate, formatArabicNumber } from '../../utils/formatters';
import type { User, ApiResponse, EmailReply } from '../../types';

// Strict Stat Widget (Content Shell Version)
function StatsWidget({ label, value, icon, color }: { label: string, value: number, icon: string, color: string }) {
    const bgMap: any = { red: '#FEF2F2', green: '#ECFDF5', orange: '#FFF7ED', blue: '#EFF6FF' };
    const textMap: any = { red: '#DC2626', green: '#059669', orange: '#D97706', blue: '#2563EB' };

    return (
        <div className="stat-card-std">
            <div className="icon-wrapper" style={{ background: bgMap[color], color: textMap[color] }}>
                {icon}
            </div>
            <div className="info">
                <div className="value">{formatArabicNumber(value)}</div>
                <div className="label">{label}</div>
            </div>
        </div>
    );
}

function ReplyModal({ user, onClose }: { user: User, onClose: () => void }) {
    const { data: replies, isLoading } = useQuery({
        queryKey: ['replies', user.id],
        queryFn: async () => {
            const res = await api.get<{ data: EmailReply[] }>(`/users/${user.id}/replies`);
            return res.data;
        }
    });

    const list = Array.isArray(replies) ? replies : (replies as any)?.data || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col m-4 shadow-xl border border-gray-100" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="font-bold text-lg text-gray-800 m-0">ردود: {user.full_name}</h3>
                        <div className="text-xs text-muted">{user.email}</div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors text-2xl leading-none">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
                    {isLoading ? <div className="text-center py-8 text-gray-500">جاري التحميل...</div> : list.length ? (
                        <div className="flex flex-col gap-4">
                            {list.map((r: EmailReply) => (
                                <div key={r.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-2">
                                        <div className="font-bold text-gray-900">{r.subject || '(بدون عنوان)'}</div>
                                        <div className="text-xs text-gray-500 whitespace-nowrap" dir="ltr">{new Date(r.created_at).toLocaleString('ar-EG')}</div>
                                    </div>
                                    <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed font-mono bg-gray-50 p-3 rounded-md border border-gray-100">{r.message}</div>
                                </div>
                            ))}
                        </div>
                    ) : <div className="text-center py-12 text-muted">لا يوجد ردود مسجلة لهذا العضو</div>}
                </div>
            </div>
        </div>
    );
}

export function UserList() {
    const navigate = useNavigate();
    const canCreate = usePermission('users.write');
    const [searchParams, setSearchParams] = useSearchParams();

    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [status, setStatus] = useState(searchParams.get('status') || '');
    const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [selectedUserForReplies, setSelectedUserForReplies] = useState<User | null>(null);
    const [isFetchingReplies, setIsFetchingReplies] = useState(false);

    const handleFetchReplies = async () => {
        try {
            setIsFetchingReplies(true);
            const res = await api.get('/email-replies/fetch');
            if (res.data.success) {
                refetch();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsFetchingReplies(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (status) params.set('status', status);
        if (page > 1) params.set('page', String(page));
        setSearchParams(params, { replace: true });
    }, [debouncedSearch, status, page, setSearchParams]);

    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['users', { search: debouncedSearch, status, page }],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (debouncedSearch) params.append('search', debouncedSearch);
            if (status) params.append('status', status);
            params.append('page', String(page));
            params.append('per_page', '10');

            const response = await api.get<ApiResponse<User[]>>(`/users?${params}`);
            return {
                data: response.data.data!,
                meta: response.data.meta!
            };
        },
    });

    const stats = useMemo(() => {
        if (!data?.data) return { total: 0, active: 0, pending: 0, withSubscription: 0 };
        return {
            total: data.meta?.total || 0,
            active: data.data.filter(u => u.status === 'active').length,
            pending: data.data.filter(u => u.status === 'pending').length,
            withSubscription: data.data.filter(u => u.membership_expiry_date && new Date(u.membership_expiry_date) > new Date()).length,
        };
    }, [data]);

    const totalPages = data?.meta?.last_page || 1;

    return (
        <div className="animate-fadeIn">
            {/* Scoped Page Header */}
            <div className="page-header">
                <div>
                    <h1>إدارة الأعضاء</h1>
                    <p>عرض وإدارة {stats.total ? formatArabicNumber(stats.total) : 'جميع'} أعضاء الاتحاد</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0', color: '#64748b' }} onClick={handleFetchReplies}>
                        {isFetchingReplies ? 'جاري الجلب...' : '📩 جلب الردود'}
                    </button>
                    <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0', color: '#64748b' }} onClick={() => refetch()}>
                        {isFetching ? 'جاري التحديث...' : 'تحديث'}
                    </button>
                    {canCreate && (
                        <button className="btn" style={{ background: 'var(--color-primary)', color: 'white' }} onClick={() => navigate('/users/create')}>
                            <span>+</span> إضافة عضو
                        </button>
                    )}
                </div>
            </div>

            {/* Scoped Stats Grid */}
            <div className="stats-grid">
                <StatsWidget label="إجمالي الأعضاء" value={stats.total} icon="👥" color="blue" />
                <StatsWidget label="عضو نشط" value={stats.active} icon="⚡" color="green" />
                <StatsWidget label="قيد الانتظار" value={stats.pending} icon="⏳" color="orange" />
                <StatsWidget label="مع اشتراك" value={stats.withSubscription} icon="💳" color="red" />
            </div>

            {/* Scoped Filter Bar */}
            <div className="filter-bar">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="بحث بالاسم أو الهاتف..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%' }}
                    />
                </div>
                <select
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                    style={{ width: '200px' }}
                >
                    <option value="">كل الحالات</option>
                    <option value="active">نشط</option>
                    <option value="pending">قيد الانتظار</option>
                    <option value="suspended">معلق</option>
                </select>
            </div>

            {/* Scoped Table Container */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>العضو</th>
                            <th>معلومات الاتصال</th>
                            <th>الحالة</th>
                            <th>الاشتراك</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>جاري التحميل...</td></tr>
                        ) : data?.data.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>لا يوجد أعضاء مطابقين للبحث</td></tr>
                        ) : (
                            data?.data.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-avatar">
                                                {user.profile_photo ? <img src={getStorageUrl(user.profile_photo)} alt={user.full_name} /> : user.full_name.charAt(0)}
                                                <span className={`status-dot ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {user.full_name}
                                                    {(user.reply_count || 0) > 0 && (
                                                        <span
                                                            style={{ fontSize: '10px', background: '#fee2e2', color: '#dc2626', padding: '2px 6px', borderRadius: '10px', cursor: 'pointer' }}
                                                            onClick={(e) => { e.stopPropagation(); setSelectedUserForReplies(user); }}
                                                            title="اضغط لعرض الردود"
                                                        >
                                                            📩 {user.reply_count}
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{formatArabicDate(user.created_at)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div dir="ltr" style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '13px' }}>{user.phone_number}</div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>ID: {user.student_id || '-'}</div>
                                    </td>
                                    <td><StatusBadge status={user.status} /></td>
                                    <td>
                                        {user.membership_expiry_date ? (
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                background: new Date(user.membership_expiry_date) > new Date() ? '#dcfce7' : '#fee2e2',
                                                color: new Date(user.membership_expiry_date) > new Date() ? '#166534' : '#991b1b'
                                            }}>
                                                {new Date(user.membership_expiry_date) > new Date() ? 'ساري' : 'منتهي'}
                                            </span>
                                        ) : <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', background: '#f1f5f9', color: '#64748b' }}>لا يوجد</span>}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button
                                                className="btn"
                                                style={{ height: '32px', fontSize: '12px', padding: '0 12px', background: 'transparent', color: '#64748b' }}
                                                onClick={() => navigate(`/users/${user.id}`)}
                                            >
                                                تفاصيل
                                            </button>
                                            <button
                                                className="btn"
                                                style={{ height: '32px', fontSize: '12px', padding: '0 12px', background: '#f1f5f9', color: '#475569' }}
                                                onClick={() => navigate(`/users/${user.id}/edit`)}
                                            >
                                                تعديل
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Scoped */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>&lt;</button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            className={`page-btn ${page === i + 1 ? 'active' : ''}`}
                            onClick={() => setPage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>&gt;</button>
                </div>
            )}

            {selectedUserForReplies && (
                <ReplyModal
                    user={selectedUserForReplies}
                    onClose={() => setSelectedUserForReplies(null)}
                />
            )}
        </div>
    );
}
