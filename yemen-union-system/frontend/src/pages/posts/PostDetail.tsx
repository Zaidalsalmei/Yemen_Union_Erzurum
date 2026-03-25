import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { postsApi } from '../../services/posts';
import { Button, StatusBadge } from '../../components/common';
import { formatArabicDate, formatArabicNumber } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';

export function PostDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const [showRevisions, setShowRevisions] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');

    // Fetch post
    const { data: post, isLoading } = useQuery({
        queryKey: ['post', id],
        queryFn: async () => {
            const result = await postsApi.getPost(Number(id));
            return result.data;
        },
        enabled: !!id,
    });

    // Fetch revisions
    const { data: revisions } = useQuery({
        queryKey: ['post-revisions', id],
        queryFn: async () => await postsApi.getRevisions(Number(id)),
        enabled: showRevisions && !!id,
    });

    // Fetch comments
    const { data: comments } = useQuery({
        queryKey: ['post-comments', id],
        queryFn: async () => await postsApi.getComments(Number(id)),
        enabled: showComments && !!id,
    });

    // Publish mutation
    const publishMutation = useMutation({
        mutationFn: async () => await postsApi.publishPost(Number(id)),
        onSuccess: () => {
            toast.success('تم نشر المنشور بنجاح');
            queryClient.invalidateQueries({ queryKey: ['post', id] });
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
        onError: () => toast.error('فشل نشر المنشور'),
    });

    // Pin mutation
    const pinMutation = useMutation({
        mutationFn: async () => await postsApi.togglePin(Number(id)),
        onSuccess: () => {
            toast.success(post?.is_pinned ? 'تم إلغاء التثبيت' : 'تم تثبيت المنشور');
            queryClient.invalidateQueries({ queryKey: ['post', id] });
        },
    });

    // Lock mutation
    const lockMutation = useMutation({
        mutationFn: async () => await postsApi.toggleLock(Number(id)),
        onSuccess: () => {
            toast.success(post?.is_locked ? 'تم فتح القفل' : 'تم قفل المنشور');
            queryClient.invalidateQueries({ queryKey: ['post', id] });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async () => await postsApi.deletePost(Number(id)),
        onSuccess: () => {
            toast.success('تم حذف المنشور');
            navigate('/posts');
        },
        onError: () => toast.error('فشل حذف المنشور'),
    });

    // Add comment mutation
    const addCommentMutation = useMutation({
        mutationFn: async (comment: string) => await postsApi.addComment(Number(id), comment),
        onSuccess: () => {
            toast.success('تم إضافة الملاحظة');
            setNewComment('');
            queryClient.invalidateQueries({ queryKey: ['post-comments', id] });
        },
    });

    // Restore revision
    const restoreRevisionMutation = useMutation({
        mutationFn: async (revisionId: number) => await postsApi.restoreRevision(Number(id), revisionId),
        onSuccess: () => {
            toast.success('تم استعادة النسخة');
            queryClient.invalidateQueries({ queryKey: ['post', id] });
            setShowRevisions(false);
        },
    });

    const handleDelete = () => {
        if (window.confirm('هل أنت متأكد من حذف هذا المنشور؟')) {
            deleteMutation.mutate();
        }
    };

    const getMediaIcon = (type: string) => {
        const icons: any = {
            image: '🖼️',
            video: '🎥',
            youtube: '▶️',
            instagram: '📷',
            canva: '🎨',
            file: '📄'
        };
        return icons[type] || '📄';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-6xl mb-4">⏳</div>
                    <p className="text-muted">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold mb-2">المنشور غير موجود</h2>
                    <Button onClick={() => navigate('/posts')}>العودة للقائمة</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-column gap-lg animate-fadeIn">
            {/* Header */}
            <div className="card p-6">
                <div className="flex-between mb-4">
                    <div className="flex items-center gap-3">
                        <Link to="/posts" className="text-gray-500 hover:text-red-600 text-2xl">←</Link>
                        <div>
                            <h1 className="text-2xl font-bold">{post.title}</h1>
                            <div className="flex items-center gap-3 mt-2">
                                <StatusBadge status={post.status} />
                                {post.is_pinned && <span className="badge badge-warning">📌 مثبت</span>}
                                {post.is_locked && <span className="badge badge-danger">🔒 مقفل</span>}
                                <span className="text-sm text-muted">
                                    {getMediaIcon(post.media_type)} {post.media_type}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {post.status !== 'published' && (
                            <Button onClick={() => publishMutation.mutate()} loading={publishMutation.isPending}>
                                ✅ نشر
                            </Button>
                        )}
                        {!post.is_locked && (
                            <Button variant="secondary" onClick={() => navigate(`/posts/${id}/edit`)}>
                                ✏️ تعديل
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => pinMutation.mutate()}>
                            {post.is_pinned ? '📌 إلغاء التثبيت' : '📌 تثبيت'}
                        </Button>
                        <Button variant="outline" onClick={() => lockMutation.mutate()}>
                            {post.is_locked ? '🔓 فتح' : '🔒 قفل'}
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            🗑️ حذف
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 flex-column gap-6">
                    {/* Media */}
                    {post.thumbnail && (
                        <div className="card p-0 overflow-hidden">
                            {post.media_type === 'video' ? (
                                <video src={post.thumbnail} controls className="w-full" style={{ maxHeight: '500px' }} />
                            ) : post.media_type === 'youtube' ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${post.media_url?.split('v=')[1]}`}
                                    className="w-full"
                                    style={{ height: '400px' }}
                                    allowFullScreen
                                />
                            ) : (
                                <img src={post.thumbnail} alt={post.title} className="w-full" />
                            )}
                        </div>
                    )}

                    {/* Description */}
                    {post.description && (
                        <div className="card p-6">
                            <h3 className="font-bold text-lg mb-4">الوصف</h3>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.description}</p>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="card p-6">
                        <h3 className="font-bold text-lg mb-4">الإحصائيات</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-3xl font-bold text-red-600">{formatArabicNumber(post.views_count || 0)}</div>
                                <div className="text-sm text-muted mt-1">مشاهدة</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-3xl font-bold text-blue-600">{formatArabicNumber(comments?.data?.length || 0)}</div>
                                <div className="text-sm text-muted mt-1">ملاحظة</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-3xl font-bold text-green-600">{formatArabicNumber(revisions?.data?.length || 0)}</div>
                                <div className="text-sm text-muted mt-1">نسخة</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="flex-column gap-6">
                    {/* Info */}
                    <div className="card p-6">
                        <h3 className="font-bold text-lg mb-4">معلومات المنشور</h3>
                        <div className="flex-column gap-3 text-sm">
                            <div className="flex-between">
                                <span className="text-muted">تاريخ الإنشاء:</span>
                                <span className="font-semibold">{formatArabicDate(post.created_at)}</span>
                            </div>
                            <div className="flex-between">
                                <span className="text-muted">آخر تحديث:</span>
                                <span className="font-semibold">{formatArabicDate(post.updated_at)}</span>
                            </div>
                            {post.published_at && (
                                <div className="flex-between">
                                    <span className="text-muted">تاريخ النشر:</span>
                                    <span className="font-semibold">{formatArabicDate(post.published_at)}</span>
                                </div>
                            )}
                            {post.scheduled_at && (
                                <div className="flex-between">
                                    <span className="text-muted">مجدول لـ:</span>
                                    <span className="font-semibold text-orange-600">{formatArabicDate(post.scheduled_at)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Revisions */}
                    <div className="card p-6">
                        <div className="flex-between mb-4">
                            <h3 className="font-bold text-lg">سجل التعديلات</h3>
                            <button onClick={() => setShowRevisions(!showRevisions)} className="text-red-600 text-sm font-semibold">
                                {showRevisions ? 'إخفاء' : 'عرض'}
                            </button>
                        </div>

                        {showRevisions && (
                            <div className="revision__list">
                                {revisions?.data?.map((revision: any) => (
                                    <div key={revision.id} className="revision__item">
                                        <div className="revision__item-header">
                                            <span className="revision__item-date">{formatArabicDate(revision.created_at)}</span>
                                            <span className="revision__item-author">{revision.editor?.full_name || 'مجهول'}</span>
                                        </div>
                                        <div className="revision__item-content">{revision.title}</div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="revision__restore-btn"
                                            onClick={() => restoreRevisionMutation.mutate(revision.id)}
                                        >
                                            استعادة
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Internal Comments */}
                    <div className="card p-6">
                        <div className="flex-between mb-4">
                            <h3 className="font-bold text-lg">ملاحظات داخلية</h3>
                            <button onClick={() => setShowComments(!showComments)} className="text-red-600 text-sm font-semibold">
                                {showComments ? 'إخفاء' : 'عرض'}
                            </button>
                        </div>

                        {showComments && (
                            <>
                                <div className="comments__list mb-4">
                                    {comments?.data?.map((comment: any) => (
                                        <div key={comment.id} className="comment__item">
                                            <div className="comment__header">
                                                <span className="comment__author">{comment.author?.full_name || 'مجهول'}</span>
                                                <span className="comment__date">{formatArabicDate(comment.created_at)}</span>
                                            </div>
                                            <div className="comment__text">{comment.comment}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="form-control flex-1"
                                        placeholder="أضف ملاحظة..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && newComment.trim()) {
                                                addCommentMutation.mutate(newComment);
                                            }
                                        }}
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() => newComment.trim() && addCommentMutation.mutate(newComment)}
                                        disabled={!newComment.trim()}
                                    >
                                        إضافة
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
