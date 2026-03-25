import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

// Constants strictly matching requirements
const STATUS_MAP: Record<string, { label: string, color: string, icon: string }> = {
    active: { label: 'نشط', color: 'bg-green-100 text-green-700', icon: '✅' },
    pending: { label: 'معلق', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
    expired: { label: 'منتهي', color: 'bg-red-100 text-red-700', icon: '❌' },
    cancelled: { label: 'ملغي', color: 'bg-gray-100 text-gray-700', icon: '🚫' },
    rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-700', icon: '⛔' },
};

const PAYMENT_STATUS_MAP: Record<string, { label: string, color: string, icon: string }> = {
    paid: { label: 'مدفوع', color: 'bg-green-100 text-green-700', icon: '✅' },
    pending: { label: 'معلق', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
    cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-700', icon: '❌' },
};

const PAYMENT_METHOD_MAP: Record<string, { label: string, icon: string }> = {
    cash: { label: 'نقداً', icon: '💵' },
    bank_transfer: { label: 'تحويل', icon: '🏦' },
    online: { label: 'إلكتروني', icon: '💳' },
};

export function MembershipsList() {
    const [memberships, setMemberships] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const loadData = async () => {
        try {
            setLoading(true);
            const params: any = {
                page: currentPage,
                limit: 15,
                search: searchQuery || undefined,
                status: statusFilter === 'all' ? undefined : statusFilter
            };

            const res = await api.get('/memberships', { params });
            // API response structure check
            const data = res.data.data;
            const meta = res.data.meta;

            setMemberships(data || []);
            setPagination(meta || null);
        } catch (err: any) {
            toast.error('خطأ في تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [statusFilter, currentPage]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        loadData();
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen" dir="rtl text-right">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-800">💳 إدارة الاشتراكات</h1>
                    <p className="text-gray-500 mt-2">تتبع العضويات والمدفوعات المالية والتحقق من صلاحيتها</p>
                </div>
                <Link
                    to="/memberships/create"
                    className="bg-[#DC2626] hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:-translate-y-1"
                >
                    + إضافة اشتراك جديد
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-6 items-center">
                <form onSubmit={handleSearch} className="flex-1 min-w-[300px] relative">
                    <input
                        type="text"
                        placeholder="ابحث باسم العضو، رقم الهاتف، أو اسم الباقة..."
                        className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#DC2626] focus:bg-white outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="absolute right-4 top-3.5 text-xl">🔍</span>
                </form>

                <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-xl border border-gray-100">
                    {['all', 'pending', 'active', 'expired'].map((s) => (
                        <button
                            key={s}
                            onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${statusFilter === s
                                ? 'bg-white text-[#DC2626] shadow-md'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {s === 'all' ? 'الكل' : STATUS_MAP[s]?.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100 text-right">
                        <tr>
                            <th className="px-6 py-4 text-gray-600 font-bold">👤 العضو</th>
                            <th className="px-6 py-4 text-gray-600 font-bold">📦 الباقة</th>
                            <th className="px-6 py-4 text-gray-600 font-bold">💰 المبلغ</th>
                            <th className="px-6 py-4 text-gray-600 font-bold">📅 الفترة</th>
                            <th className="px-6 py-4 text-gray-600 font-bold">⭐ الحالة</th>
                            <th className="px-6 py-4 text-gray-600 font-bold">💳 الدفع</th>
                            <th className="px-6 py-4 text-gray-600 font-bold text-center">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-right">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                    <div className="animate-pulse text-3xl mb-2">⏳</div>
                                    جاري تحميل البيانات...
                                </td>
                            </tr>
                        ) : memberships.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-bold italic">
                                    🏜️ لا توجد نتائج مطابقة
                                </td>
                            </tr>
                        ) : (
                            memberships.map((m) => {
                                const status = STATUS_MAP[m.status] || { label: m.status, color: 'bg-gray-100 text-gray-600', icon: '❓' };
                                const payStatus = PAYMENT_STATUS_MAP[m.payment_status] || { label: m.payment_status, color: 'bg-gray-100 text-gray-600', icon: '❓' };
                                const method = PAYMENT_METHOD_MAP[m.payment_method] || { label: m.payment_method, icon: '💵' };

                                return (
                                    <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-gray-800">{m.user_name}</div>
                                            <div className="text-xs text-gray-400 font-mono mt-0.5" dir="ltr">{m.user_phone}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-sm font-bold text-gray-700">{m.package_name}</div>
                                            <div className="text-[10px] text-gray-400 uppercase tracking-widest">{m.package_type}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-lg font-black text-[#DC2626]">{m.amount} <span className="text-[10px] font-normal text-gray-400">{m.currency || 'TRY'}</span></div>
                                            <div className="text-[10px] text-gray-500 font-bold">{method.icon} {method.label}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-[10px] font-bold text-gray-500">من: {m.start_date}</div>
                                            <div className="text-[10px] font-bold text-red-500 mt-1">إلى: {m.end_date}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold leading-none ${status.color}`}>
                                                {status.icon} {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-black uppercase ${payStatus.color}`}>
                                                {payStatus.icon} {payStatus.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-center gap-3">
                                                <Link
                                                    to={`/memberships/${m.id}`}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-[#DC2626] hover:text-white transition-all shadow-sm group"
                                                >
                                                    <span className="text-lg group-hover:scale-110 transition-transform">👁️</span>
                                                </Link>
                                                <Link
                                                    to={`/memberships/${m.id}/edit`}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-yellow-500 hover:text-white transition-all shadow-sm group"
                                                >
                                                    <span className="text-lg group-hover:scale-110 transition-transform">✏️</span>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.last_page > 1 && (
                <div className="flex justify-center items-center gap-3 mt-10">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all font-bold text-xl"
                    >
                        ➡️
                    </button>
                    <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-100 font-bold text-gray-600">
                        صفحة <span className="text-[#DC2626]">{currentPage}</span> من {pagination.last_page}
                    </div>
                    <button
                        disabled={currentPage === pagination.last_page}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all font-bold text-xl"
                    >
                        ⬅️
                    </button>
                </div>
            )}
        </div>
    );
}
