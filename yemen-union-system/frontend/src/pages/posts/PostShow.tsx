import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Button, Card, CardBody, LoadingPage, ErrorState } from '../../components/common';
import { formatArabicDate } from '../../utils/formatters';

interface Post {
    id: number;
    title: string;
    content: string;
    type: 'announcement' | 'news' | 'event' | 'financial';
    status: 'draft' | 'published';
    author_id: number;
    author_name: string;
    author_photo: string | null;
    image: string | null;
    published_at: string | null;
    created_at: string;
    updated_at: string;
}

const TYPE_MAP: Record<string, { label: string, icon: string, color: string }> = {
    announcement: { label: 'إعلان', icon: '📢', color: 'bg-blue-100 text-blue-700' },
    news: { label: 'خبر', icon: '📰', color: 'bg-purple-100 text-purple-700' },
    event: { label: 'إعلان فعالية', icon: '🎉', color: 'bg-green-100 text-green-700' },
    financial: { label: 'تقرير مالي', icon: '💰', color: 'bg-yellow-100 text-yellow-700' },
};

export function PostShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const loadPost = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/posts/${id}`);
            setPost(res.data.data);
            setError(false);
        } catch (err) {
            toast.error('لم يتم العثور على المنشور');
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPost();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المنشور؟')) return;
        try {
            await api.delete(`/posts/${id}`);
            toast.success('تم حذف المنشور');
            navigate('/posts');
        } catch (err) {
            toast.error('خطأ في الحذف');
        }
    };

    if (loading) return <LoadingPage message="جاري فتح الملفات..." />;
    if (error || !post) return <div className="p-8"><ErrorState onRetry={loadPost} /></div>;

    const type = TYPE_MAP[post.type] || TYPE_MAP.announcement;

    return (
        <div className="post-show-page p-4 md:p-8 max-w-4xl mx-auto animate-fadeIn" dir="rtl">
            <header className="mb-8 flex justify-between items-center">
                <Button
                    variant="secondary"
                    onClick={() => navigate('/posts')}
                    className="rounded-2xl font-black gap-2"
                >
                    ⬅️ رجوع للمنشورات
                </Button>
                <div className="flex gap-2">
                    <Link to={`/posts/${post.id}/edit`}>
                        <Button className="bg-gray-800 hover:bg-black rounded-2xl font-black text-white px-6">✏️ تعديل</Button>
                    </Link>
                    <Button variant="danger" onClick={handleDelete} className="rounded-2xl font-black">🗑️ حذف</Button>
                </div>
            </header>

            <Card className="rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white">
                {post.image && (
                    <div className="w-full aspect-video bg-gray-100 overflow-hidden">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover shadow-inner"
                        />
                    </div>
                )}

                <CardBody className="p-8 md:p-12">
                    <div className="flex justify-between items-center mb-8">
                        <span className={`px-5 py-2 rounded-full text-sm font-black flex items-center gap-2 ${type.color}`}>
                            {type.icon} {type.label}
                        </span>
                        {post.status === 'published' ? (
                            <span className="bg-green-100 text-green-700 px-5 py-2 rounded-full text-sm font-black">✅ منشور</span>
                        ) : (
                            <span className="bg-gray-100 text-gray-500 px-5 py-2 rounded-full text-sm font-black">📝 مسودة</span>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-8 leading-tight border-r-8 border-[#DC2626] pr-6">
                        {post.title}
                    </h1>

                    <div className="prose prose-red max-w-none mb-12">
                        <p className="text-gray-600 text-lg leading-loose whitespace-pre-wrap font-bold">
                            {post.content}
                        </p>
                    </div>

                    {/* Metadata Footer */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 border-t border-dashed border-gray-100">
                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl">
                            <div className="w-12 h-12 rounded-2xl bg-[#DC2626] flex items-center justify-center text-white text-xl font-black">
                                {post.author_photo ? (
                                    <img src={post.author_photo} className="w-full h-full object-cover rounded-2xl" alt="" />
                                ) : (
                                    <span>👤</span>
                                )}
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 font-black">بواسطة:</div>
                                <div className="font-black text-gray-700">{post.author_name}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-black">
                                📅
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 font-black">تاريخ النشر:</div>
                                <div className="font-black text-gray-700">{formatArabicDate(post.published_at || post.created_at)}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 border border-gray-100 p-4 rounded-3xl col-span-1 md:col-span-2">
                            <div className="text-xs text-gray-400 font-black ml-auto">آخر تعديل:</div>
                            <div className="font-bold text-gray-500 text-sm">{formatArabicDate(post.updated_at)}</div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
