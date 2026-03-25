import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useBranding } from '../../contexts/BrandingContext';
import { getLogoUrl } from '../../utils/images';

// الترجمات
const ACTIVITY_TYPES: Record<string, string> = {
    educational: '📚 تعليمي', social: '🎉 اجتماعي',
    cultural: '🎭 ثقافي', sports: '⚽ رياضي',
    volunteer: '🤝 تطوعي', other: '📋 أخرى'
};

const POST_TYPES: Record<string, string> = {
    announcement: '📢 إعلان', news: '📰 خبر',
    event: '🎉 فعالية', financial: '💰 مالي'
};

const PAYMENT_METHODS: Record<string, string> = {
    cash: '💵 نقداً', bank_transfer: '🏦 تحويل بنكي', online: '💳 أونلاين'
};

const STUDY_LEVELS: Record<string, string> = {
    bachelor: '🎓 بكالوريوس', master: '📖 ماجستير', phd: '🎯 دكتوراه'
};

const PACKAGES: Record<string, string> = {
    annual: '📅 سنوي', semester: '📆 فصلي', monthly: '🗓️ شهري'
};

const TAB_LABELS: Record<string, string> = {
    overview: '📊 نظرة عامة',
    members: '👥 الأعضاء',
    finance: '💰 المالية',
    memberships: '📋 الاشتراكات',
    activities: '🎯 الأنشطة',
    posts: '📢 المنشورات'
};

// بطاقة إحصائية
const StatCard = ({ icon, label, value, sub, color = 'blue' }: { icon: string, label: string, value: string | number, sub?: string, color?: string }) => {
    const colorClasses: Record<string, string> = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        yellow: 'text-yellow-600',
        red: 'text-red-600',
        purple: 'text-purple-600',
        orange: 'text-orange-600',
        teal: 'text-teal-600',
        emerald: 'text-emerald-600'
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition print:shadow-none print:border">
            <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{icon}</span>
                <span className={`text-2xl font-black ${colorClasses[color] || 'text-blue-600'}`}>{value}</span>
            </div>
            <p className="text-sm font-bold text-gray-700">{label}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    );
};

// جدول بيانات
const Table = ({ title, data, columns, headers }: { title: string, data: any[], columns: string[], headers: string[] }) => (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden print:shadow-none print:break-inside-avoid my-4">
        <div className="p-3 bg-gray-50 border-b">
            <h3 className="font-bold text-sm">{title}</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50">
                        {headers.map((h, i) => <th key={i} className="p-3 text-right font-bold text-gray-600">{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {data && data.length > 0 ? data.map((row, i) => (
                        <tr key={i} className="border-t hover:bg-gray-50">
                            {columns.map((col, j) => <td key={j} className="p-3">{row[col] ?? '-'}</td>)}
                        </tr>
                    )) : (
                        <tr><td colSpan={headers.length} className="p-6 text-center text-gray-400">لا توجد بيانات</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

export function Reports() {
    const { settings: branding } = useBranding();
    const [dateFrom, setDateFrom] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
    const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<any>(null);

    const setDatePreset = (preset: 'week' | 'month' | 'year' | 'all') => {
        const today = new Date();
        let from = dateFrom;
        const to = today.toISOString().split('T')[0];

        if (preset === 'week') {
            const first = today.getDate() - today.getDay();
            from = new Date(new Date().setDate(first)).toISOString().split('T')[0];
        } else if (preset === 'month') {
            from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        } else if (preset === 'year') {
            from = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        } else if (preset === 'all') {
            from = '2020-01-01';
        }

        setDateFrom(from);
        setDateTo(to);
    };

    const loadReport = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/reports/overview?from=${dateFrom}&to=${dateTo}`);
            if (response.data.success) {
                setReport(response.data.data);
            } else {
                toast.error(response.data.message || 'فشل تحميل البيانات');
            }
        } catch (error) {
            console.error('Error loading report:', error);
            toast.error('خطأ في الاتصال بالسيرفر');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReport();
    }, []);

    if (!report && loading) {
        return (
            <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 animate-pulse" dir="rtl">
                <div className="h-20 bg-gray-200 rounded-xl w-full border"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded-xl shadow-sm border"></div>)}
                </div>
                <div className="h-64 bg-gray-200 rounded-xl w-full border"></div>
                <div className="h-64 bg-gray-200 rounded-xl w-full border"></div>
            </div>
        );
    }

    if (!report) return null;

    const isPrinting = false; // logic handled by CSS @media print

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 relative" dir="rtl">

            {/* الشعار المائي الشفاف - يظهر فقط في الطباعة */}
            <div className="hidden print:flex fixed inset-0 z-[-1] justify-center items-center opacity-[0.05] pointer-events-none">
                <img src={getLogoUrl(branding.logoUrl)} alt="Watermark" className="w-[800px] grayscale" />
            </div>

            {/* ===== ترويسة الطباعة (مخفية في العرض العادي) ===== */}
            <div className="hidden print:block mb-8">
                <div className="flex justify-between items-center border-b-4 border-red-600 pb-4">
                    <div className="text-right">
                        <h1 className="text-2xl font-black text-red-600">اتحاد الطلاب اليمنيين</h1>
                        <p className="text-sm text-gray-500">فرع أرضروم — تركيا</p>
                        <p className="text-sm text-gray-500">تقرير شامل: {dateFrom} إلى {dateTo}</p>
                        <p className="text-xs text-gray-400">تاريخ الطباعة: {new Date().toLocaleDateString('ar-SA')}</p>
                    </div>
                    {/* ⛔ الشعار - جاري استخدامه من الإعدادات أو الافتراضي */}
                    <img src={getLogoUrl(branding.logoUrl)} alt="الشعار" className="h-16" />
                </div>
            </div>

            {/* ===== شريط الأدوات (يختفي عند الطباعة) ===== */}
            <div className="flex flex-col gap-4 bg-white p-5 rounded-xl shadow-sm print:hidden border">
                <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-xs font-bold text-gray-500 py-2">فترات سريعة:</span>
                    <button onClick={() => setDatePreset('week')} className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 transition">هذا الأسبوع</button>
                    <button onClick={() => setDatePreset('month')} className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 transition">هذا الشهر</button>
                    <button onClick={() => setDatePreset('year')} className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 transition">هذا العام</button>
                    <button onClick={() => setDatePreset('all')} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition">كل الوقت</button>
                </div>
                <div className="flex flex-wrap gap-4 items-center justify-between border-t pt-4">
                    <div className="flex flex-wrap gap-3 items-end">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">من</label>
                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-600 outline-none" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">إلى</label>
                            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-600 outline-none" />
                        </div>
                        <button
                            onClick={loadReport}
                            disabled={loading}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition flex items-center gap-2"
                        >
                            {loading ? '...' : '🔍 تطبيق وتحديث'}
                        </button>
                    </div>
                    <button onClick={() => window.print()} className="px-5 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-bold hover:bg-black transition flex items-center gap-2 shadow-sm">
                        🖨️ طباعة التقرير
                    </button>
                </div>
            </div>

            {/* ===== التبويبات (تختفي عند الطباعة) ===== */}
            <div className="flex gap-2 overflow-x-auto pb-2 print:hidden scrollbar-thin scrollbar-thumb-gray-200">
                {['overview', 'members', 'finance', 'memberships', 'activities', 'posts'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${activeTab === tab ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border'
                            }`}>
                        {TAB_LABELS[tab]}
                    </button>
                ))}
            </div>

            {/* ===== المحتوى ===== */}

            {/* --- نظرة عامة --- */}
            {(activeTab === 'overview' || isPrinting) && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard icon="👥" label="إجمالي الأعضاء" value={report.members.total} sub={`${report.members.active} نشط`} color="blue" />
                        <StatCard icon="💰" label="صافي الإيرادات" value={`${report.finance.net} TRY`} sub={`دخل: ${report.finance.total_income}`} color="green" />
                        <StatCard icon="📋" label="الاشتراكات النشطة" value={report.memberships.active} sub={`${report.memberships.expiring_soon} تنتهي قريباً`} color="yellow" />
                        <StatCard icon="🎯" label="الأنشطة" value={report.activities.total} sub={`${report.activities.upcoming} قادمة`} color="red" />
                        <StatCard icon="📢" label="المنشورات" value={report.posts.published} sub={`${report.posts.drafts} مسودة`} color="purple" />
                        <StatCard icon="🎧" label="تذاكر الدعم" value={report.support.total} sub={`${report.support.open_tickets} مفتوحة`} color="orange" />
                        <StatCard icon="📅" label="أعضاء جدد (هذا الشهر)" value={report.members.new_this_month} color="teal" />
                        <StatCard icon="💵" label="إيرادات الاشتراكات" value={`${report.memberships.total_revenue} TRY`} color="emerald" />
                    </div>
                </div>
            )}

            {/* --- تقرير الأعضاء --- */}
            {(activeTab === 'members' || isPrinting) && (
                <div className="space-y-6">
                    <h2 className="text-xl font-black print:text-lg border-r-4 border-red-600 pr-3">👥 تقرير الأعضاء</h2>
                    <Table title="حسب الجامعة" data={report.members.by_university} columns={['name', 'count']} headers={['الجامعة', 'العدد']} />
                    <Table title="حسب الكلية" data={report.members.by_faculty} columns={['name', 'count']} headers={['الكلية', 'العدد']} />
                    <Table title="حسب المستوى الدراسي" data={report.members.by_study_level.map((s: any) => ({ ...s, level: STUDY_LEVELS[s.level] || s.level }))} columns={['level', 'count']} headers={['المستوى', 'العدد']} />
                    <Table title="حسب المدينة" data={report.members.by_city} columns={['name', 'count']} headers={['المدينة', 'العدد']} />
                </div>
            )}

            {/* --- تقرير المالية --- */}
            {(activeTab === 'finance' || isPrinting) && (
                <div className="space-y-6">
                    <h2 className="text-xl font-black border-r-4 border-red-600 pr-3">💰 التقرير المالي</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 p-6 rounded-xl text-center border border-green-100">
                            <p className="text-2xl font-black text-green-600">{report.finance.total_income} TRY</p>
                            <p className="text-sm font-bold text-gray-500">إجمالي الدخل</p>
                        </div>
                        <div className="bg-red-50 p-6 rounded-xl text-center border border-red-100">
                            <p className="text-2xl font-black text-red-600">{report.finance.total_expense} TRY</p>
                            <p className="text-sm font-bold text-gray-500">إجمالي المصروفات</p>
                        </div>
                        <div className={`p-6 rounded-xl text-center border ${report.finance.net >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
                            <p className={`text-2xl font-black ${report.finance.net >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>{report.finance.net} TRY</p>
                            <p className="text-sm font-bold text-gray-500">الصافي</p>
                        </div>
                    </div>
                    <Table title="حسب الفئة" data={report.finance.by_category} columns={['category', 'type', 'count', 'total']} headers={['الفئة', 'النوع', 'العدد', 'المبلغ']} />
                    <Table title="حسب طريقة الدفع" data={report.finance.by_payment_method.map((p: any) => ({ ...p, method: PAYMENT_METHODS[p.method] || p.method }))} columns={['method', 'count', 'total']} headers={['الطريقة', 'العدد', 'المبلغ']} />
                </div>
            )}

            {/* --- تقرير الاشتراكات --- */}
            {(activeTab === 'memberships' || isPrinting) && (
                <div className="space-y-6">
                    <h2 className="text-xl font-black border-r-4 border-red-600 pr-3">📋 تقرير الاشتراكات</h2>
                    <Table title="حسب الباقة" data={report.memberships.by_package.map((p: any) => ({ ...p, package: PACKAGES[p.package] || p.package }))} columns={['package', 'count', 'revenue']} headers={['الباقة', 'العدد', 'الإيرادات']} />
                </div>
            )}

            {/* --- تقرير الأنشطة --- */}
            {(activeTab === 'activities' || isPrinting) && (
                <div className="space-y-6">
                    <h2 className="text-xl font-black border-r-4 border-red-600 pr-3">🎯 تقرير الأنشطة</h2>
                    <Table title="حسب النوع" data={report.activities.by_type.map((a: any) => ({ ...a, type: ACTIVITY_TYPES[a.type] || a.type }))} columns={['type', 'count']} headers={['النوع', 'العدد']} />
                </div>
            )}

            {/* --- تقرير المنشورات --- */}
            {(activeTab === 'posts' || isPrinting) && (
                <div className="space-y-6">
                    <h2 className="text-xl font-black border-r-4 border-red-600 pr-3">📢 تقرير المنشورات</h2>
                    <Table title="حسب النوع" data={report.posts.by_type.map((p: any) => ({ ...p, type: POST_TYPES[p.type] || p.type }))} columns={['type', 'count']} headers={['النوع', 'العدد']} />
                </div>
            )}

            {/* ===== تذييل الطباعة ===== */}
            <div className="hidden print:block mt-24">
                <div className="flex justify-between items-center text-center mb-12 px-12">
                    <div className="w-48">
                        <p className="font-bold text-gray-800 text-lg mb-8">المسؤول المالي</p>
                        <div className="border-b-2 border-gray-400 w-full mb-2"></div>
                        <p className="text-gray-400 text-sm">التوقيع / الختم</p>
                    </div>
                    <div className="w-48">
                        <p className="font-bold text-gray-800 text-lg mb-8">رئيس الاتحاد</p>
                        <div className="border-b-2 border-gray-400 w-full mb-2"></div>
                        <p className="text-gray-400 text-sm">التوقيع / الختم</p>
                    </div>
                </div>
                <div className="pt-4 border-t-2 border-gray-200 text-center text-xs text-gray-400">
                    <p>اتحاد الطلاب اليمنيين — فرع أرضروم، تركيا</p>
                    <p>هذا التقرير سري وللاستخدام الداخلي فقط — تم إنشاؤه بتاريخ {new Date().toLocaleDateString('ar-SA')} - yemenstudents.org</p>
                </div>
            </div>
        </div>
    );
}

export default Reports;
