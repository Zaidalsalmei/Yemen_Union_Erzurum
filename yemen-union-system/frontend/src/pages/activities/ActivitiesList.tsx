import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

/* =========================================================================
   Interfaces
========================================================================= */

interface SocialLinks {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    twitter?: string;
    website?: string;
    whatsapp_group?: string;
}

interface Activity {
    id: number;
    title: string;
    summary: string | null;
    description: string | null;
    type: 'activity' | 'event' | 'workshop' | 'trip' | 'meeting';
    status: 'draft' | 'published' | 'cancelled' | 'completed';
    location: string | null;
    start_date: string;
    end_date: string | null;
    image: string | null;
    social_links: SocialLinks | null;
    max_participants: number | null;
    registered_count: number;
    registration_deadline: string | null;
    created_at: string;
}

interface Pagination {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}

/* =========================================================================
   Constants & Helpers
========================================================================= */

const ACTIVITY_TYPES: Record<string, any> = {
    activity: { label: 'نشاط', icon: '🎯', badgeColor: 'bg-blue-100 text-blue-700', grad: 'from-blue-500 to-blue-600' },
    event: { label: 'فعالية', icon: '🎉', badgeColor: 'bg-purple-100 text-purple-700', grad: 'from-purple-500 to-purple-600' },
    workshop: { label: 'ورشة عمل', icon: '🛠️', badgeColor: 'bg-green-100 text-green-700', grad: 'from-green-500 to-green-600' },
    trip: { label: 'رحلة', icon: '✈️', badgeColor: 'bg-orange-100 text-orange-700', grad: 'from-orange-500 to-orange-600' },
    meeting: { label: 'اجتماع', icon: '🤝', badgeColor: 'bg-gray-100 text-gray-700', grad: 'from-gray-500 to-gray-600' },
};

const ACTIVITY_STATUS: Record<string, any> = {
    published: { label: 'منشور', badgeColor: 'bg-green-100 text-green-700' },
    draft: { label: 'مسودة', badgeColor: 'bg-gray-100 text-gray-700' },
    cancelled: { label: 'ملغي', badgeColor: 'bg-red-100 text-red-700' },
    completed: { label: 'مكتمل', badgeColor: 'bg-blue-100 text-blue-700' },
};

const formatDateAr = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        const date = new Date(dateStr);
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch {
        return dateStr;
    }
};

/* =========================================================================
   STATS WIDGET
========================================================================= */
function StatsWidget({ label, value, icon, color }: { label: string, value: string | number, icon: string, color: string }) {
    const bgMap: any = { red: '#FEF2F2', green: '#ECFDF5', orange: '#FFF7ED', blue: '#EFF6FF', gray: '#F3F4F6', purple: '#FAF5FF', yellow: '#FEFCE8' };
    const textMap: any = { red: '#DC2626', green: '#059669', orange: '#D97706', blue: '#2563EB', gray: '#374151', purple: '#9333EA', yellow: '#CA8A04' };

    return (
        <div className="card flex items-center p-4 gap-4" style={{ minWidth: '0' }}>
            <div className="rounded-xl flex items-center justify-center font-black" style={{ background: bgMap[color] || bgMap.gray, color: textMap[color] || textMap.gray, width: '56px', height: '56px', fontSize: '24px', flexShrink: 0 }}>
                {icon}
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }} className="truncate">{value}</div>
                <div className="text-muted text-sm font-bold truncate">{label}</div>
            </div>
        </div>
    );
}

/* =========================================================================
   Component
========================================================================= */

export default function ActivitiesList() {
    const navigate = useNavigate();

    // Data states
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<Pagination | null>(null);

    // Filter & view states
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Derived Statistics
    const [stats, setStats] = useState({
        total: 0,
        published: 0,
        draft: 0,
        upcoming: 0,
        registered: 0
    });

    // Debounce Search Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch Data
    useEffect(() => {
        loadActivities();
    }, [statusFilter, typeFilter, debouncedSearch, currentPage]);

    const loadActivities = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (statusFilter !== '') params.append('status', statusFilter);
            if (typeFilter !== '') params.append('type', typeFilter);
            if (debouncedSearch) params.append('search', debouncedSearch);
            params.append('page', String(currentPage));
            params.append('per_page', '12');

            const res = await api.get(`/activities?${params.toString()}`);
            const responseData = res.data?.data;

            let fetchedActivities: Activity[] = [];

            // Deal with different response formats successfully
            if (Array.isArray(responseData)) {
                fetchedActivities = responseData;
                setActivities(responseData);
                setPagination(null);
            } else if (responseData) {
                fetchedActivities = responseData.activities || [];
                setActivities(fetchedActivities);
                setPagination(responseData.pagination || null);
            } else {
                setActivities([]);
            }

            // Update stats locally based on fetched list
            setStats({
                total: fetchedActivities.length,
                published: fetchedActivities.filter(a => a.status === 'published').length,
                draft: fetchedActivities.filter(a => a.status === 'draft').length,
                upcoming: fetchedActivities.filter(a => new Date(a.start_date) > new Date()).length,
                registered: fetchedActivities.reduce((sum, a) => sum + (a.registered_count || 0), 0)
            });

        } catch (err: any) {
            console.error('Load activities error:', err);
            toast.error('حدث خطأ أثناء تحميل الأنشطة');
            setActivities([]);
        } finally {
            setLoading(false);
        }
    };

    /* =========================================================================
       Render Helpers
    ========================================================================= */

    const renderSocialLinks = (links: SocialLinks | null) => {
        if (!links) return null;
        return (
            <div className="flex items-center gap-2 flex-wrap">
                {links.instagram && (
                    <a href={links.instagram} target="_blank" rel="noreferrer" title="Instagram"
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-tr from-purple-500 to-orange-400 text-white hover:scale-110 transition-transform shadow-sm">
                        📸
                    </a>
                )}
                {links.youtube && (
                    <a href={links.youtube} target="_blank" rel="noreferrer" title="YouTube"
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-[#FF0000] text-white hover:scale-110 transition-transform shadow-sm">
                        ▶️
                    </a>
                )}
                {links.tiktok && (
                    <a href={links.tiktok} target="_blank" rel="noreferrer" title="TikTok"
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-[#000000] text-white hover:scale-110 transition-transform shadow-sm">
                        🎵
                    </a>
                )}
                {links.twitter && (
                    <a href={links.twitter} target="_blank" rel="noreferrer" title="Twitter"
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1DA1F2] text-white hover:scale-110 transition-transform shadow-sm">
                        🐦
                    </a>
                )}
                {links.website && (
                    <a href={links.website} target="_blank" rel="noreferrer" title="Website"
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-600 text-white hover:scale-110 transition-transform shadow-sm">
                        🌐
                    </a>
                )}
            </div>
        );
    };

    /* =========================================================================
       Main View
    ========================================================================= */

    return (
        <div className="flex-column gap-lg animate-fadeIn max-w-7xl mx-auto" style={{ width: '100%' }}>

            {/* 1. Header Section */}
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <span>🎯</span> الأنشطة والفعاليات
                    </h1>
                    <p className="text-muted mt-1">إدارة وعرض جميع الأنشطة والفعاليات الخاصة بالاتحاد</p>
                </div>
                <button
                    onClick={() => navigate('/activities/create')}
                    className="btn btn-primary"
                >
                    <span>+</span> إضافة نشاط جديد
                </button>
            </div>

            {/* 2. Statistics Section (Horizontally aligned boxes from global CSS) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <StatsWidget label="إجمالي الأنشطة" value={stats.total} icon="📊" color="blue" />
                <StatsWidget label="منشورة" value={stats.published} icon="✅" color="green" />
                <StatsWidget label="مسودة" value={stats.draft} icon="📝" color="gray" />
                <StatsWidget label="قادمة قريباً" value={stats.upcoming} icon="🔜" color="purple" />
                <StatsWidget label="إجمالي المسجلين" value={stats.registered} icon="👥" color="orange" />
            </div>

            {/* 3. Filters Section */}
            <div className="card p-4 flex gap-4" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    <input
                        type="text"
                        placeholder="ابحث عن نشاط..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-control"
                        style={{ paddingRight: '36px' }}
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="form-control"
                    style={{ width: 'auto', minWidth: '150px' }}
                >
                    <option value="">كل الحالات</option>
                    <option value="published">منشورة</option>
                    <option value="draft">مسودة</option>
                    <option value="completed">مكتملة</option>
                    <option value="cancelled">ملغية</option>
                </select>

                <select
                    value={typeFilter}
                    onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                    className="form-control"
                    style={{ width: 'auto', minWidth: '150px' }}
                >
                    <option value="">كل الأنواع</option>
                    <option value="activity">نشاط</option>
                    <option value="event">فعالية</option>
                    <option value="workshop">ورشة عمل</option>
                    <option value="trip">رحلة</option>
                    <option value="meeting">اجتماع</option>
                </select>

                <div className="flex bg-gray-100 rounded-xl p-1" style={{ width: 'fit-content' }}>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        ☷ شبكة
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        ☰ قائمة
                    </button>
                </div>
            </div>

            {/* 4. Content Area */}
            {loading ? (
                // Loading Skeletons
                <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : '1fr' }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className={`card p-0 shadow-sm animate-pulse flex ${viewMode === 'list' ? 'flex-col sm:flex-row' : 'flex-col'}`}>
                            <div className={`bg-gray-200 ${viewMode === 'list' ? 'w-full sm:w-64 h-48 sm:h-auto' : 'w-full h-48'}`}></div>
                            <div className="p-5 flex-1 space-y-4">
                                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                <div className="h-20 bg-gray-100 rounded-xl w-full mt-4"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : activities.length > 0 ? (
                // Display Cards
                <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr' }}>
                    {activities.map(activity => {
                        const typeInfo = ACTIVITY_TYPES[activity.type] || ACTIVITY_TYPES['activity'];
                        const statusInfo = ACTIVITY_STATUS[activity.status] || ACTIVITY_STATUS['draft'];

                        const progress = activity.max_participants
                            ? Math.min((activity.registered_count / activity.max_participants) * 100, 100)
                            : 0;

                        return (
                            <div key={activity.id} className={`card p-0 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden flex ${viewMode === 'list' ? 'flex-col sm:flex-row' : 'flex-col'}`}>

                                {/* Image / Header */}
                                <div className={`relative shrink-0 ${viewMode === 'list' ? 'w-full sm:w-72 h-56 sm:h-auto' : 'w-full h-52'}`}>
                                    {activity.image ? (
                                        <img src={activity.image} alt={activity.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className={`w-full h-full bg-gradient-to-br ${typeInfo.grad} opacity-90 flex items-center justify-center`}>
                                            <span className="text-6xl text-white/30 drop-shadow-lg">{typeInfo.icon}</span>
                                        </div>
                                    )}

                                    {/* Badges */}
                                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${typeInfo.badgeColor} border border-white/50 backdrop-blur-md`}>
                                            {typeInfo.icon} {typeInfo.label}
                                        </span>
                                    </div>
                                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${statusInfo.badgeColor} border border-white/50 backdrop-blur-md`}>
                                            {statusInfo.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1 flex flex-col items-start w-full">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 w-full truncate" title={activity.title}>
                                        {activity.title}
                                    </h3>

                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-10 leading-relaxed w-full">
                                        {activity.summary || (activity.description ? activity.description.substring(0, 100) + '...' : 'لا يوجد نبذة مختصرة عن هذا النشاط.')}
                                    </p>

                                    <div className="space-y-3 mb-5 w-full bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <div className="flex items-center text-sm text-gray-700">
                                            <span className="w-6 text-xl text-center">📅</span>
                                            <span className="font-semibold">{formatDateAr(activity.start_date)}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-700">
                                            <span className="w-6 text-xl text-center">📍</span>
                                            <span className="truncate font-medium">{activity.location || 'غير محدد'}</span>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-gray-200">
                                            <div className="flex justify-between items-center text-xs font-bold text-gray-500 mb-2">
                                                <span>
                                                    👥 المشاركين ({activity.registered_count} {activity.max_participants ? `/ ${activity.max_participants}` : ''})
                                                </span>
                                                {activity.max_participants && (
                                                    <span className={progress >= 90 ? 'text-red-600' : 'text-green-600'} dir="ltr">
                                                        {Math.round(progress)}%
                                                    </span>
                                                )}
                                            </div>
                                            {activity.max_participants ? (
                                                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-700 ${progress >= 90 ? 'bg-red-500' : progress >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${progress}%` }}></div>
                                                </div>
                                            ) : (
                                                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden flex items-center justify-end px-1">
                                                    <div className="h-1.5 bg-green-500 rounded-full w-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-auto w-full flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                                        <div className="flex-1">
                                            {renderSocialLinks(activity.social_links)}
                                        </div>
                                        <button
                                            onClick={() => navigate(`/activities/${activity.id}`)}
                                            className="text-[#DC2626] font-bold text-sm bg-red-50 hover:bg-[#DC2626] hover:text-white px-5 py-2.5 rounded-xl transition-all border border-red-100 shrink-0 shadow-sm"
                                        >
                                            عرض التفاصيل &larr;
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                // Empty State
                <div className="card shadow-sm p-16 flex flex-col items-center justify-center text-center w-full">
                    <span className="text-7xl opacity-40 mb-6 grayscale filter">🏕️</span>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">لا توجد أنشطة לעرضها</h3>
                    <p className="text-muted max-w-sm mb-8">لم يتم العثور على أي بيانات تطابق بحثك الحالي، يمكنك إضافة نشاط جديد للبدء فوراً.</p>
                    <button
                        onClick={() => navigate('/activities/create')}
                        className="btn btn-primary px-8"
                    >
                        <span>+</span> إضافة نشاط جديد
                    </button>
                </div>
            )}

            {/* Pagination Box */}
            {!loading && pagination && pagination.total_pages > 1 && (
                <div className="card p-4 border-t flex items-center justify-between mt-4">
                    <button
                        disabled={pagination.page <= 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="btn" style={{ background: '#f3f4f6' }}
                    >
                        السابق
                    </button>

                    <div className="text-sm font-bold text-muted">صفحة {pagination.page} من {pagination.total_pages}</div>

                    <button
                        disabled={pagination.page >= pagination.total_pages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="btn" style={{ background: '#f3f4f6' }}
                    >
                        التالي
                    </button>
                </div>
            )}

        </div>
    );
}
