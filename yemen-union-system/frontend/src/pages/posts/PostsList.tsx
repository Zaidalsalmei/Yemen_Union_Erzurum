import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Button, Card, LoadingPage, ErrorState } from '../../components/common';
import { formatArabicDate } from '../../utils/formatters';

interface Post {
    id: number;
    title: string;
    content: string;
    type: 'announcement' | 'news' | 'event' | 'financial';
    status: 'draft' | 'published';
    author_id: number;
    author_name: string;
    image: string | null;
    published_at: string | null;
    created_at: string;
}

interface Stats {
    total: number;
    published: number;
    drafts: number;
    announcements: number;
    news: number;
    events: number;
    financial: number;
}

const TYPE_MAP: Record<string, { label: string, icon: string, color: string }> = {
    announcement: { label: 'إعلان', icon: '📢', color: 'bg-blue-100 text-blue-700' },
    news: { label: 'خبر', icon: '📰', color: 'bg-purple-100 text-purple-700' },
    event: { label: 'فعالية', icon: '🎉', color: 'bg-green-100 text-green-700' },
    financial: { label: 'مالي', icon: '💰', color: 'bg-yellow-100 text-yellow-700' },
};

const STATUS_MAP: Record<string, { label: string, icon: string, color: string }> = {
    published: { label: 'منشور', icon: '✅', color: 'bg-green-100 text-green-700' },
    draft: { label: 'مسودة', icon: '📝', color: 'bg-gray-100 text-gray-600' },
};

export function PostsList() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Filters
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (typeFilter !== 'all') params.append('type', typeFilter);
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (searchQuery) params.append('search', searchQuery);
            params.append('page', String(currentPage));

            const res = await api.get(`/posts?${params.toString()}`);
            const data = res.data.data;

            setPosts(data.posts || []);
            setStats(data.stats || null);
            setPagination(data.pagination || null);
            setError(false);
        } catch (err) {
            console.error('Load posts error:', err);
            toast.error('خطأ في تحميل المنشورات');
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, [typeFilter, statusFilter, currentPage]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        loadPosts();
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المنشور؟')) return;
        try {
            await api.delete(`/posts/${id}`);
            toast.success('تم حذف المنشور بنجاح');
            loadPosts();
        } catch (err) {
            toast.error('خطأ في حذف المنشور');
        }
    };

    const handlePublish = async (id: number) => {
        try {
            await api.post(`/posts/${id}/publish`);
            toast.success('تم نشر المنشور للملايين! 📢');
            loadPosts();
        } catch (err) {
            toast.error('فشل النشر');
        }
    };

    const handleUnpublish = async (id: number) => {
        try {
            await api.post(`/posts/${id}/unpublish`);
            toast.success('تم إرجاع المنشور للمسودات 📝');
            loadPosts();
        } catch (err) {
            toast.error('فشل العملية');
        }
    };

    if (loading && posts.length === 0) return <LoadingPage message="جاري استدعاء الأخبار..." />;

    return (
        <div className="posts-page p-4 md:p-8 space-y-8 animate-fadeIn" dir="rtl">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                        📢 إدارة المنشورات والإعلانات
                    </h1>
                    <p className="text-gray-500 font-bold mt-1">إنشاء ونشر الأخبار والإعلانات لأعضاء الاتحاد</p>
                </div>
                <Link to="/posts/create">
                    <Button className="bg-[#DC2626] hover:bg-red-700 shadow-lg shadow-red-100 px-6 py-3 rounded-2xl gap-2 text-lg font-black">
                        ➕ منشور جديد
                    </Button>
                </Link>
            </header>

            {/* Stats Overview */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'الكل', value: stats.total, icon: '📄', color: 'bg-white' },
                        { label: 'منشور', value: stats.published, icon: '✅', color: 'bg-green-50' },
                        { label: 'مسودة', value: stats.drafts, icon: '📝', color: 'bg-gray-50' },
                        { label: 'إعلان', value: stats.announcements, icon: '📢', color: 'bg-blue-50' },
                    ].map((s, i) => (
                        <div key={i} className={`${s.color} p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between`}>
                            <div>
                                <div className="text-gray-400 text-sm font-bold">{s.label}</div>
                                <div className="text-2xl font-black text-gray-800">{s.value}</div>
                            </div>
                            <span className="text-3xl opacity-50">{s.icon}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Filters & Search */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full md:w-48 p-3 rounded-2xl bg-gray-50 border-transparent focus:border-[#DC2626] focus:ring-0 font-bold text-gray-600 outline-none"
                >
                    <option value="all">كل الأنواع ▾</option>
                    <option value="announcement">📢 إعلانات</option>
                    <option value="news">📰 أخبار</option>
                    <option value="event">🎉 فعاليات</option>
                    <option value="financial">💰 تقارير مالية</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full md:w-48 p-3 rounded-2xl bg-gray-50 border-transparent focus:border-[#DC2626] focus:ring-0 font-bold text-gray-600 outline-none"
                >
                    <option value="all">كل الحالات ▾</option>
                    <option value="published">✅ المنشورة</option>
                    <option value="draft">📝 المسودات</option>
                </select>

                <form onSubmit={handleSearch} className="flex-1 w-full relative">
                    <input
                        type="text"
                        placeholder="🔍 بحث بالعنوان..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-3 pr-12 rounded-2xl bg-gray-50 border-transparent focus:border-[#DC2626] focus:ring-0 font-bold text-gray-600 outline-none"
                    />
                </form>
            </div>

            {/* Posts Grid */}
            {error ? (
                <ErrorState onRetry={loadPosts} />
            ) : posts.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-xl font-black text-gray-800">لا توجد منشورات</h3>
                    <p className="text-gray-400">ابدأ بإنشاء أول منشور للاتحاد الآن!</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {posts.map(post => {
                        const type = TYPE_MAP[post.type] || TYPE_MAP.announcement;
                        const status = STATUS_MAP[post.status] || STATUS_MAP.draft;
                        return (
                            <div key={post.id} className={`group bg-white rounded-[2.5rem] p-1 border-2 transition-all hover:shadow-xl hover:-translate-y-1 ${post.status === 'draft' ? 'border-gray-100' : 'border-transparent shadow-md'}`}>
                                <div className={`p-6 bg-white rounded-[2.2rem] h-full flex flex-col ${post.status === 'draft' ? 'opacity-80' : ''}`}>
                                    {/* Card Header */}
                                    <div className="flex justify-between items-start mb-6">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1 ${type.color}`}>
                                            {type.icon} {type.label}
                                        </span>
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1 ${status.color}`}>
                                            {status.icon} {status.label}
                                        </span>
                                    </div>

                                    {/* Image (if exists) */}
                                    {post.image && (
                                        <div className="mb-4 rounded-3xl overflow-hidden aspect-video bg-gray-100">
                                            <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    )}

                                    {/* Title & Body */}
                                    <h3 className="text-xl font-black text-gray-800 mb-3 line-clamp-2 leading-tight">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                                        {post.content.substring(0, 150)}{post.content.length > 150 ? '...' : ''}
                                    </p>

                                    {/* Card Footer */}
                                    <div className="mt-auto pt-6 border-t border-dashed border-gray-100 flex items-center justify-between text-xs font-bold text-gray-400">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1">👤 {post.author_name}</span>
                                            <span className="flex items-center gap-1">📅 {formatArabicDate(post.created_at)}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-6">
                                        <Link to={`/posts/${post.id}`} className="flex-1">
                                            <Button variant="secondary" fullWidth className="p-2.5 rounded-xl font-black text-sm">👁️ عرض</Button>
                                        </Link>
                                        <Link to={`/posts/${post.id}/edit`} className="flex-1">
                                            <Button className="bg-gray-800 hover:bg-black p-2.5 rounded-xl font-black text-sm text-white w-full">✏️ تعديل</Button>
                                        </Link>
                                        {post.status === 'draft' ? (
                                            <Button
                                                onClick={() => handlePublish(post.id)}
                                                className="bg-green-600 hover:bg-green-700 p-2.5 rounded-xl font-black text-sm text-white flex-1"
                                            >
                                                📢 نشر
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => handleUnpublish(post.id)}
                                                variant="secondary"
                                                className="p-2.5 rounded-xl font-black text-sm flex-1 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                                            >
                                                📝 مسودة
                                            </Button>
                                        )}
                                        <Button
                                            variant="danger"
                                            onClick={() => handleDelete(post.id)}
                                            className="p-2.5 rounded-xl font-black text-sm"
                                        >
                                            🗑️
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination placeholder */}
            {pagination && pagination.total_pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-xl font-black transition-all ${currentPage === page ? 'bg-[#DC2626] text-white' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'}`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
