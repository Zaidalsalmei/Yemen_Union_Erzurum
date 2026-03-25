import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { getStorageUrl } from '../utils/images';

interface ImageUploadProps {
    currentImage: string | null;       // الصورة الحالية (رابط نسبي)
    onUpload: (url: string) => void;   // عند نجاح الرفع
    onRemove?: () => void;             // عند حذف الصورة
    folder?: string;                   // profiles | posts | activities | receipts
    size?: 'sm' | 'md' | 'lg' | 'xl';  // حجم المعاينة
    shape?: 'circle' | 'square';       // شكل المعاينة
    label?: string;                    // نص الزر
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    currentImage, onUpload, onRemove,
    folder = 'profiles', size = 'md', shape = 'circle',
    label = 'اختر صورة'
}) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // تحديث المعاينة عند تغيير الصورة الحالية
    useEffect(() => {
        if (currentImage) {
            // إضافة التوقيت لمنع الكاش عند التغيير
            const url = getStorageUrl(currentImage);
            setPreview(url.startsWith('data:') ? url : `${url}?t=${new Date().getTime()}`);
        } else {
            setPreview(null);
        }
    }, [currentImage]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // تحقق من النوع
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
            toast.error('نوع الملف غير مدعوم. المسموح: JPG, PNG, WebP');
            return;
        }

        // تحقق من الحجم (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('حجم الملف أكبر من 5 ميجابايت');
            return;
        }

        // معاينة فورية محلية
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);

        // رفع الملف إلى السيرفر
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('image', file);
            formData.append('folder', folder);

            const res = await api.post('/upload/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                const imageUrl = res.data.data.url;
                onUpload(imageUrl);
                toast.success('تم رفع الصورة بنجاح');
            } else {
                toast.error(res.data.message || 'خطأ في رفع الصورة');
                setPreview(currentImage); // العودة للصورة السابقة عند الفشل
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'فشل الاتصال بالسيرفر لرفع الصورة';
            toast.error(errorMsg);
            setPreview(currentImage);
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = ''; // تمكين إعادة اختيار نفس الملف
        }
    };

    const handleRemove = async () => {
        if (preview && onRemove) {
            try {
                // محاولة حذف الملف من السيرفر (اختياري، قد تفضل الاحتفاظ به للأرشفة)
                if (currentImage && !currentImage.startsWith('data:')) {
                    await api.delete('/upload/image', { data: { url: currentImage } });
                }
            } catch (err) {
                console.warn('Could not delete image from server:', err);
            }
            setPreview(null);
            onRemove();
        }
    };

    // أحجام المعاينة
    const sizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-32 h-32',
        xl: 'w-48 h-48'
    };

    return (
        <div className="flex flex-col items-center gap-3 animate-fadeIn">
            {/* منطقة المعاينة */}
            <div
                className={`
                    ${sizeClasses[size]} 
                    ${shape === 'circle' ? 'rounded-full' : 'rounded-2xl'}
                    bg-gray-50 border-2 border-dashed border-gray-300 
                    flex items-center justify-center overflow-hidden
                    relative cursor-pointer hover:border-red-400 group transition-all duration-300 shadow-inner
                `}
                onClick={() => !uploading && inputRef.current?.click()}
            >
                {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] font-bold text-red-500">جاري الرفع...</span>
                    </div>
                ) : preview ? (
                    <>
                        <img
                            src={preview}
                            alt="الصورة"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error';
                            }}
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-sm font-bold">تغيير الصورة</span>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center text-gray-400 group-hover:text-red-400 transition-colors">
                        <span className="text-3xl">📷</span>
                        <span className="text-[10px] mt-1 font-bold">رفع صورة</span>
                    </div>
                )}
            </div>

            {/* أزرار التحكم */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-1 px-4 py-2 text-xs font-bold bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                    {uploading ? '⏳ انتظر...' : `📷 ${label}`}
                </button>
                {preview && onRemove && !uploading && (
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="flex items-center gap-1 px-4 py-2 text-xs font-bold bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 hover:text-red-600 transition-all active:scale-95"
                    >
                        🗑️ حذف
                    </button>
                )}
            </div>

            {/* Input مخفي للرفع */}
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    );
};

export default ImageUpload;
