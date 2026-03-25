import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { postsApi, mediaApi, socialApi, tagsApi } from '../../services/posts';
import { Button } from '../../components/common';
import type { PostFormData, MediaType } from '../../types/posts';
import { useAuth } from '../../contexts/AuthContext';

export function PostEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    // const { user } = useAuth(); // Removed - not used in this component

    const [thumbnail, setThumbnail] = useState<string>('');
    const [mediaUrl, setMediaUrl] = useState<string>('');
    const [mediaType, setMediaType] = useState<MediaType>('image');
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [showMediaLibrary, setShowMediaLibrary] = useState(false);
    const [uploadingMedia, setUploadingMedia] = useState(false);

    const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<PostFormData>();

    // Fetch post data
    const { data: post, isLoading: postLoading } = useQuery({
        queryKey: ['post', id],
        queryFn: async () => {
            const result = await postsApi.getPost(Number(id));
            return result.data;
        },
        enabled: !!id,
    });

    // Fetch tags
    const { data: tags } = useQuery({
        queryKey: ['post-tags'],
        queryFn: async () => await tagsApi.getTags(),
    });

    // Fetch media library
    const { data: mediaLibrary } = useQuery({
        queryKey: ['media-library'],
        queryFn: async () => await mediaApi.getMedia({ per_page: 50 }),
        enabled: showMediaLibrary,
    });

    // Load post data into form
    useEffect(() => {
        if (post) {
            reset({
                title: post.title,
                description: post.description || '',
                status: post.status,
                activity_id: post.activity_id,
                scheduled_at: post.scheduled_at,
            });
            setThumbnail(post.thumbnail || '');
            setMediaUrl(post.media_url || '');
            setMediaType(post.media_type);
            // Load tags if available
            if (post.tags) {
                setSelectedTags(post.tags.map(t => t.id));
            }
        }
    }, [post, reset]);

    // Update post mutation
    const updateMutation = useMutation({
        mutationFn: async (data: PostFormData) => {
            return await postsApi.updatePost(Number(id), {
                ...data,
                thumbnail,
                media_url: mediaUrl,
                media_type: mediaType,
                tags: selectedTags,
            });
        },
        onSuccess: () => {
            toast.success('تم تحديث المنشور بنجاح');
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['post', id] });
            navigate(`/posts/${id}`);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'حدث خطأ في تحديث المنشور');
        },
    });

    // Handle file upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            toast.error('حجم الملف يجب أن يكون أقل من 10 ميجابايت');
            return;
        }

        setUploadingMedia(true);
        try {
            const result = await mediaApi.uploadMedia(file);
            if (result.data) {
                setThumbnail(result.data.file_path);
                setMediaUrl(result.data.file_path);

                if (file.type.startsWith('image/')) setMediaType('image');
                else if (file.type.startsWith('video/')) setMediaType('video');
                else setMediaType('file');

                toast.success('تم رفع الملف بنجاح');
            }
        } catch (error) {
            toast.error('فشل رفع الملف');
        } finally {
            setUploadingMedia(false);
        }
    };

    // Import from YouTube
    const handleYouTubeImport = async () => {
        const url = prompt('أدخل رابط فيديو YouTube:');
        if (!url) return;

        try {
            const result = await socialApi.importFromYouTube(url);
            if (result.data) {
                setValue('title', result.data.title || '');
                setValue('description', result.data.description || '');
                setThumbnail(result.data.thumbnail || '');
                setMediaUrl(url);
                setMediaType('youtube');
                toast.success('تم استيراد الفيديو من YouTube');
            }
        } catch (error) {
            toast.error('فشل استيراد الفيديو من YouTube');
        }
    };

    // Import from Instagram
    const handleInstagramImport = async () => {
        toast('جاري الاتصال بـ Instagram...', { icon: 'ℹ️' });
        const mediaId = prompt('أدخل معرف المنشور من Instagram:');
        if (!mediaId) return;

        try {
            const result = await socialApi.importFromInstagram(mediaId);
            if (result.data) {
                setThumbnail(result.data.thumbnail || '');
                setMediaUrl(result.data.media_url || '');
                setMediaType('instagram');
                toast.success('تم استيراد المنشور من Instagram');
            }
        } catch (error) {
            toast.error('فشل استيراد المنشور من Instagram');
        }
    };

    // Open Canva
    const handleCanvaOpen = () => {
        window.open('https://www.canva.com/create', '_blank');
        toast('بعد الانتهاء من التصميم، احفظ الصورة وارفعها هنا', { icon: 'ℹ️' });
    };

    // Share to WhatsApp
    const handleWhatsAppShare = () => {
        const title = watch('title');
        const description = watch('description');
        const text = `${title}\n\n${description}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    // Select from media library
    const handleMediaSelect = (media: any) => {
        setThumbnail(media.file_path);
        setMediaUrl(media.file_path);
        setMediaType(media.file_type === 'video' ? 'video' : 'image');
        setShowMediaLibrary(false);
        toast.success('تم اختيار الملف من المكتبة');
    };

    const onSubmit = (data: PostFormData) => {
        if (!thumbnail && !mediaUrl) {
            toast.error('يرجى إضافة صورة أو وسائط للمنشور');
            return;
        }

        // Check if post is locked
        if (post?.is_locked) {
            toast.error('هذا المنشور مقفل ولا يمكن تعديله');
            return;
        }

        updateMutation.mutate(data);
    };

    if (postLoading) {
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

    if (post.is_locked) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h2 className="text-2xl font-bold mb-2">المنشور مقفل</h2>
                    <p className="text-muted mb-6">هذا المنشور مقفل من قبل المسؤول ولا يمكن تعديله</p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="secondary" onClick={() => navigate('/posts')}>العودة للقائمة</Button>
                        <Button onClick={() => navigate(`/posts/${id}`)}>عرض التفاصيل</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-column gap-lg animate-fadeIn max-w-4xl mx-auto">
            {/* Header */}
            <div className="card p-6 flex-between bg-gradient-to-l from-orange-50 to-white">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-orange-600 text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg">
                        ✏️
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">تعديل المنشور</h1>
                        <p className="text-muted">تحديث محتوى المنشور</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => navigate(`/posts/${id}`)} className="btn btn-outline">إلغاء</button>
                    <button onClick={() => navigate('/posts')} className="btn btn-secondary">العودة للقائمة</button>
                </div>
            </div>

            {/* Warning if published */}
            {post.status === 'published' && (
                <div className="card p-4 bg-amber-50 border-2 border-amber-300">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">⚠️</span>
                        <div>
                            <h3 className="font-bold text-amber-900">تنبيه: منشور منشور</h3>
                            <p className="text-sm text-amber-700">هذا المنشور منشور حالياً. سيتم حفظ نسخة من التعديلات في سجل الإصدارات.</p>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="card p-8 editor__form">
                {/* Title */}
                <div className="editor__field">
                    <label className="editor__label">عنوان المنشور *</label>
                    <input
                        type="text"
                        className="editor__input"
                        placeholder="اكتب عنواناً جذاباً..."
                        {...register('title', { required: 'العنوان مطلوب', minLength: { value: 3, message: 'العنوان قصير جداً' } })}
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                </div>

                {/* Description */}
                <div className="editor__field">
                    <label className="editor__label">الوصف</label>
                    <textarea
                        className="editor__textarea"
                        placeholder="اكتب وصفاً تفصيلياً للمنشور..."
                        rows={6}
                        {...register('description')}
                    />
                </div>

                {/* Social Import Buttons */}
                <div className="editor__social-buttons">
                    <button type="button" className="social-btn social-btn--canva" onClick={handleCanvaOpen}>
                        <span>🎨</span>
                        <span>Canva</span>
                    </button>
                    <button type="button" className="social-btn social-btn--youtube" onClick={handleYouTubeImport}>
                        <span>▶️</span>
                        <span>YouTube</span>
                    </button>
                    <button type="button" className="social-btn social-btn--instagram" onClick={handleInstagramImport}>
                        <span>📷</span>
                        <span>Instagram</span>
                    </button>
                    <button type="button" className="social-btn social-btn--whatsapp" onClick={handleWhatsAppShare}>
                        <span>💬</span>
                        <span>WhatsApp</span>
                    </button>
                </div>

                {/* Media Upload */}
                <div className="editor__field">
                    <label className="editor__label">الوسائط</label>

                    {!thumbnail ? (
                        <div className="upload-zone" onClick={() => document.getElementById('file-upload')?.click()}>
                            <div className="upload-zone__icon">📤</div>
                            <div className="upload-zone__text">اسحب الملف هنا أو انقر للرفع</div>
                            <div className="upload-zone__hint">PNG, JPG, GIF, MP4 (حتى 10MB)</div>
                            <input
                                id="file-upload"
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleFileUpload}
                                style={{ display: 'none' }}
                            />
                        </div>
                    ) : (
                        <div className="thumbnail-preview">
                            {mediaType === 'video' ? (
                                <video src={thumbnail} controls className="w-full h-full object-cover" />
                            ) : mediaType === 'youtube' ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${mediaUrl?.split('v=')[1]}`}
                                    className="w-full h-full"
                                    allowFullScreen
                                />
                            ) : (
                                <img src={thumbnail} alt="Preview" />
                            )}
                            <button
                                type="button"
                                className="thumbnail-preview__remove"
                                onClick={() => {
                                    setThumbnail('');
                                    setMediaUrl('');
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    <div className="flex gap-3 mt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowMediaLibrary(!showMediaLibrary)}
                        >
                            📁 اختر من المكتبة
                        </Button>
                        {uploadingMedia && <span className="text-sm text-muted">جاري الرفع...</span>}
                    </div>
                </div>

                {/* Media Library Modal */}
                {showMediaLibrary && (
                    <div className="card p-4 mt-4 bg-gray-50">
                        <div className="flex-between mb-4">
                            <h3 className="font-bold">مكتبة الوسائط</h3>
                            <button type="button" onClick={() => setShowMediaLibrary(false)} className="text-gray-500 hover:text-red-600">✕</button>
                        </div>
                        <div className="media-library__grid">
                            {mediaLibrary?.data?.map((media) => (
                                <div
                                    key={media.id}
                                    className="media-library__item"
                                    onClick={() => handleMediaSelect(media)}
                                >
                                    {media.file_type === 'video' ? (
                                        <video src={media.file_path} />
                                    ) : (
                                        <img src={media.file_path} alt={media.file_name} />
                                    )}
                                    <div className="media-library__item-overlay">
                                        <span className="media-library__item-name">{media.file_name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tags */}
                <div className="editor__field">
                    <label className="editor__label">الوسوم</label>
                    <div className="tags-input">
                        {tags?.data?.map((tag) => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => {
                                    if (selectedTags.includes(tag.id)) {
                                        setSelectedTags(selectedTags.filter(t => t !== tag.id));
                                    } else {
                                        setSelectedTags([...selectedTags, tag.id]);
                                    }
                                }}
                                className={selectedTags.includes(tag.id) ? 'tag-chip' : 'btn btn-outline btn-sm'}
                            >
                                {tag.name}
                                {selectedTags.includes(tag.id) && (
                                    <span className="tag-chip__remove">✕</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status */}
                <div className="editor__field">
                    <label className="editor__label">حالة المنشور</label>
                    <select className="form-select" {...register('status')}>
                        <option value="draft">📝 مسودة</option>
                        <option value="review">👁️ قيد المراجعة</option>
                        <option value="published">✅ منشور</option>
                    </select>
                </div>

                {/* Actions */}
                <div className="flex-between mt-8 pt-6 border-t">
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate(`/posts/${id}`)}
                        >
                            إلغاء
                        </Button>
                    </div>

                    <Button
                        type="submit"
                        disabled={updateMutation.isPending}
                    >
                        {updateMutation.isPending ? 'جاري الحفظ...' : '💾 حفظ التعديلات'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
