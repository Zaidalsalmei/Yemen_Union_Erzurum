import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { mediaApi } from '../../services/posts';
import { Button } from '../../components/common';
import { formatArabicDate, formatArabicNumber } from '../../utils/formatters';
import type { FileType } from '../../types/posts';

export function MediaLibrary() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<FileType | 'all'>('all');
    const [search, setSearch] = useState('');
    const [selectedMedia, setSelectedMedia] = useState<number[]>([]);
    const [uploading, setUploading] = useState(false);

    // Fetch media
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['media-library', filter, search],
        queryFn: async () => {
            const params: any = { per_page: 50 };
            if (filter !== 'all') params.file_type = filter;
            if (search) params.search = search;
            return await mediaApi.getMedia(params);
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => await mediaApi.deleteMedia(id),
        onSuccess: () => {
            toast.success('تم حذف الملف');
            queryClient.invalidateQueries({ queryKey: ['media-library'] });
            setSelectedMedia([]);
        },
        onError: () => toast.error('فشل حذف الملف'),
    });

    // Handle file upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploading(true);
        let successCount = 0;

        for (const file of files) {
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`${file.name}: حجم الملف يجب أن يكون أقل من 10 ميجابايت`);
                continue;
            }

            try {
                await mediaApi.uploadMedia(file);
                successCount++;
            } catch (error) {
                toast.error(`${file.name}: فشل الرفع`);
            }
        }

        setUploading(false);

        if (successCount > 0) {
            toast.success(`تم رفع ${successCount} ملف بنجاح`);
            queryClient.invalidateQueries({ queryKey: ['media-library'] });
        }
    };

    // Handle drag and drop
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);

        // Create a fake event to reuse upload logic
        const fakeEvent = {
            target: { files }
        } as any;

        handleFileUpload(fakeEvent);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDelete = () => {
        if (selectedMedia.length === 0) return;

        if (window.confirm(`هل أنت متأكد من حذف ${selectedMedia.length} ملف؟`)) {
            selectedMedia.forEach(id => deleteMutation.mutate(id));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedMedia.includes(id)) {
            setSelectedMedia(selectedMedia.filter(m => m !== id));
        } else {
            setSelectedMedia([...selectedMedia, id]);
        }
    };

    const selectAll = () => {
        if (selectedMedia.length === data?.data?.length) {
            setSelectedMedia([]);
        } else {
            setSelectedMedia(data?.data?.map(m => m.id) || []);
        }
    };

    const getFileIcon = (type: FileType) => {
        const icons = {
            image: '🖼️',
            video: '🎥',
            pdf: '📄',
            document: '📝'
        };
        return icons[type] || '📄';
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '—';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="flex-column gap-lg animate-fadeIn">
            {/* Header */}
            <div className="flex-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <span className="text-red-600">📁</span> مكتبة الوسائط
                    </h1>
                    <p className="text-muted mt-1">إدارة جميع ملفات الوسائط</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => refetch()}>
                        تحديث
                    </Button>
                    <Button onClick={() => document.getElementById('media-upload')?.click()}>
                        <span className="text-xl mr-2">+</span> رفع ملفات
                    </Button>
                    <input
                        id="media-upload"
                        type="file"
                        multiple
                        accept="image/*,video/*,.pdf"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl">📊</div>
                    <div>
                        <div className="text-2xl font-bold">{formatArabicNumber(data?.data?.length || 0)}</div>
                        <div className="text-sm text-muted">إجمالي الملفات</div>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-2xl">🖼️</div>
                    <div>
                        <div className="text-2xl font-bold">{formatArabicNumber(data?.data?.filter(m => m.file_type === 'image').length || 0)}</div>
                        <div className="text-sm text-muted">صور</div>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl">🎥</div>
                    <div>
                        <div className="text-2xl font-bold">{formatArabicNumber(data?.data?.filter(m => m.file_type === 'video').length || 0)}</div>
                        <div className="text-sm text-muted">فيديوهات</div>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl">📄</div>
                    <div>
                        <div className="text-2xl font-bold">{formatArabicNumber(data?.data?.filter(m => m.file_type === 'pdf' || m.file_type === 'document').length || 0)}</div>
                        <div className="text-sm text-muted">مستندات</div>
                    </div>
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="card p-4 flex flex-wrap gap-4 items-center">
                <div className="flex-1 relative min-w-[250px]">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="بحث في الملفات..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                </div>

                <div className="flex gap-2">
                    {(['all', 'image', 'video', 'pdf'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${filter === type
                                    ? 'bg-red-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {type === 'all' ? 'الكل' : type === 'image' ? 'صور' : type === 'video' ? 'فيديو' : 'PDF'}
                        </button>
                    ))}
                </div>

                {selectedMedia.length > 0 && (
                    <div className="flex gap-2 items-center">
                        <span className="text-sm font-semibold text-gray-600">
                            {formatArabicNumber(selectedMedia.length)} محدد
                        </span>
                        <Button size="sm" variant="danger" onClick={handleDelete}>
                            🗑️ حذف المحدد
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setSelectedMedia([])}>
                            إلغاء التحديد
                        </Button>
                    </div>
                )}

                <Button size="sm" variant="outline" onClick={selectAll}>
                    {selectedMedia.length === data?.data?.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                </Button>
            </div>

            {/* Upload Zone */}
            {data?.data?.length === 0 && !isLoading && (
                <div
                    className="upload-zone"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => document.getElementById('media-upload')?.click()}
                >
                    <div className="upload-zone__icon">📤</div>
                    <div className="upload-zone__text">اسحب الملفات هنا أو انقر للرفع</div>
                    <div className="upload-zone__hint">PNG, JPG, GIF, MP4, PDF (حتى 10MB لكل ملف)</div>
                </div>
            )}

            {/* Media Grid */}
            {isLoading ? (
                <div className="text-center p-12 text-muted">جاري التحميل...</div>
            ) : data?.data && data.data.length > 0 ? (
                <div className="media-library__grid">
                    {data.data.map((media) => (
                        <div
                            key={media.id}
                            className={`media-library__item ${selectedMedia.includes(media.id) ? 'selected' : ''}`}
                            onClick={() => toggleSelect(media.id)}
                        >
                            {media.file_type === 'video' ? (
                                <video src={media.file_path} />
                            ) : media.file_type === 'image' ? (
                                <img src={media.file_path} alt={media.file_name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-6xl">
                                    {getFileIcon(media.file_type)}
                                </div>
                            )}

                            <div className="media-library__item-overlay">
                                <div className="text-center w-full">
                                    <div className="media-library__item-name mb-2">{media.file_name}</div>
                                    <div className="text-xs text-white opacity-75">{formatFileSize(media.file_size)}</div>
                                    <div className="text-xs text-white opacity-75">{formatArabicDate(media.created_at)}</div>
                                </div>
                            </div>

                            {selectedMedia.includes(media.id) && (
                                <div className="absolute top-3 right-3 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                    ✓
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : null}

            {uploading && (
                <div className="card p-8 text-center">
                    <div className="text-4xl mb-4">⏳</div>
                    <p className="text-lg font-semibold">جاري رفع الملفات...</p>
                </div>
            )}
        </div>
    );
}
