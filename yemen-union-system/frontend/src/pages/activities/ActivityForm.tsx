import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

/* =========================================================================
   Interfaces & Initial State
========================================================================= */

interface SocialLinks {
    instagram: string;
    youtube: string;
    tiktok: string;
    twitter: string;
    website: string;
    whatsapp_group: string;
}

const initialFormData = {
    title: '',
    summary: '',
    description: '',
    type: 'activity',
    status: 'draft',
    location: '',
    start_date: '',
    end_date: '',
    max_participants: '',
    registration_deadline: '',
    image: '',
    social_links: {
        instagram: '',
        youtube: '',
        tiktok: '',
        twitter: '',
        website: '',
        whatsapp_group: ''
    } as SocialLinks,
    gallery: [] as string[]
};

export default function ActivityForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState(initialFormData);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEdit) {
            loadActivity();
        }
    }, [id]);

    const loadActivity = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/activities/${id}`);
            const data = res.data?.data;

            if (data) {
                setFormData({
                    title: data.title || '',
                    summary: data.summary || '',
                    description: data.description || '',
                    type: data.type || 'activity',
                    status: data.status || 'draft',
                    location: data.location || '',
                    start_date: data.start_date ? new Date(data.start_date).toISOString().slice(0, 16) : '',
                    end_date: data.end_date ? new Date(data.end_date).toISOString().slice(0, 16) : '',
                    max_participants: data.max_participants ? String(data.max_participants) : '',
                    registration_deadline: data.registration_deadline ? new Date(data.registration_deadline).toISOString().slice(0, 16) : '',
                    image: data.image || '',
                    social_links: {
                        instagram: data.social_links?.instagram || '',
                        youtube: data.social_links?.youtube || '',
                        tiktok: data.social_links?.tiktok || '',
                        twitter: data.social_links?.twitter || '',
                        website: data.social_links?.website || '',
                        whatsapp_group: data.social_links?.whatsapp_group || ''
                    },
                    gallery: data.gallery || []
                });
            }
        } catch (err: any) {
            toast.error('حدث خطأ أثناء تحميل بيانات النشاط');
            navigate('/activities');
        } finally {
            setLoading(false);
        }
    };

    /* =========================================================================
       Handlers
    ========================================================================= */

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            social_links: {
                ...prev.social_links,
                [name]: value
            }
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Mocking Image upload by creating Object URL (Ideally you'd upload and get real URL)
            const objectUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, image: objectUrl }));
            toast.success('تم تعيين صورة الغلاف');
        }
    };

    const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
            setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), ...newImages] }));
            toast.success('تمت إضافة الصور لمعرض الصور');
        }
    };

    const removeGalleryImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            gallery: prev.gallery.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            toast.error('عنوان النشاط مطلوب');
            return;
        }
        if (!formData.start_date) {
            toast.error('تاريخ البداية مطلوب');
            return;
        }

        try {
            setSaving(true);

            // Clean social links
            const cleanSocialLinks: Record<string, string> = {};
            Object.entries(formData.social_links).forEach(([key, value]) => {
                if (value && value.trim()) {
                    cleanSocialLinks[key] = value.trim();
                }
            });

            // Prepare dates for backend format (YYYY-MM-DD HH:mm:ss)
            const formatForApi = (dateStr: string) => dateStr ? dateStr.replace('T', ' ') + ':00' : null;

            const payload = {
                ...formData,
                start_date: formatForApi(formData.start_date),
                end_date: formatForApi(formData.end_date),
                registration_deadline: formatForApi(formData.registration_deadline),
                social_links: Object.keys(cleanSocialLinks).length > 0 ? cleanSocialLinks : null,
                max_participants: formData.max_participants ? Number(formData.max_participants) : null
            };

            if (isEdit) {
                await api.put(`/activities/${id}`, payload);
                toast.success('تم تحديث النشاط بنجاح');
            } else {
                await api.post('/activities', payload);
                toast.success('تم إنشاء النشاط بنجاح');
            }

            navigate('/activities');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'حدث خطأ أثناء حفظ النشاط');
        } finally {
            setSaving(false);
        }
    };

    /* =========================================================================
       Render
    ========================================================================= */

    if (loading) {
        return (
            <div dir="rtl" className="flex-column gap-lg animate-pulse" style={{ width: '100%' }}>
                <div className="h-10 bg-gray-200 rounded-lg w-1/3 mb-8"></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="h-64 bg-gray-200 rounded-2xl w-full"></div>
                    <div className="h-48 bg-gray-200 rounded-2xl w-full"></div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} dir="rtl" className="flex-column gap-lg animate-fadeIn max-w-5xl mx-auto" style={{ width: '100%' }}>

            {/* Header / Breadcrumb */}
            <div className="flex-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <span>✨</span> {isEdit ? 'تعديل النشاط' : 'إنشاء نشاط جديد'}
                    </h1>
                    <p className="text-muted mt-1">أدخل تفاصيل النشاط أو الفعالية أدناه واضغط على حفظ.</p>
                </div>
                <button type="button" onClick={() => navigate('/activities')} className="btn btn-outline flex items-center gap-2">
                    <span>➡️</span> رجوع
                </button>
            </div>

            {/* 1. Basic Info Card */}
            <div className="card p-6 md:p-8 relative">
                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                    📋 المعلومات الأساسية
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group md:col-span-2">
                        <label className="form-label mb-2 font-bold text-sm text-gray-700">عنوان النشاط <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="مثال: رحلة إلى إسطنبول..."
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label mb-2 font-bold text-sm text-gray-700">نوع النشاط <span className="text-red-500">*</span></label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="form-control"
                        >
                            <option value="activity">نشاط</option>
                            <option value="event">فعالية</option>
                            <option value="workshop">ورشة عمل</option>
                            <option value="trip">رحلة</option>
                            <option value="meeting">اجتماع</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label mb-2 font-bold text-sm text-gray-700">الحالة</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="form-control"
                        >
                            <option value="draft">مسودة</option>
                            <option value="published">منشور</option>
                            <option value="completed">مكتمل</option>
                            <option value="cancelled">ملغي</option>
                        </select>
                    </div>

                    <div className="form-group md:col-span-2">
                        <label className="form-label mb-2 font-bold text-sm text-gray-700">نبذة مختصرة (تظهر في الكروت)</label>
                        <textarea
                            name="summary"
                            value={formData.summary}
                            onChange={handleChange}
                            rows={2}
                            placeholder="اكتب نبذة قصيرة ومميزة لعرضها في قائمة الأنشطة..."
                            className="form-control resize-none shadow-inner"
                        ></textarea>
                    </div>

                    <div className="form-group md:col-span-2">
                        <label className="form-label mb-2 font-bold text-sm text-gray-700">الوصف التفصيلي</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={6}
                            placeholder="اكتب الوصف الكلي للنشاط والبرنامج وأي تفاصيل أخرى..."
                            className="form-control resize-y shadow-inner"
                        ></textarea>
                    </div>
                </div>
            </div>

            {/* 2. Date & Location Card */}
            <div className="card p-6 md:p-8 relative">
                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                    📅 التاريخ والمكان
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                        <label className="form-label mb-2 font-bold text-sm text-gray-700">تاريخ البداية والوقت <span className="text-red-500">*</span></label>
                        <input
                            type="datetime-local"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label mb-2 font-bold text-sm text-gray-700">تاريخ النهاية والوقت</label>
                        <input
                            type="datetime-local"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label mb-2 font-bold text-sm text-gray-700">آخر موعد للتسجيل</label>
                        <input
                            type="datetime-local"
                            name="registration_deadline"
                            value={formData.registration_deadline}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label mb-2 font-bold text-sm text-gray-700">الحد الأقصى للمشاركين</label>
                        <input
                            type="number"
                            name="max_participants"
                            value={formData.max_participants}
                            onChange={handleChange}
                            placeholder="اتركه فارغاً إذا كان العدد مفتوحاً"
                            min="1"
                            className="form-control"
                        />
                    </div>

                    <div className="form-group md:col-span-2">
                        <label className="form-label mb-2 font-bold text-sm text-gray-700">المكان / العنوان</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="مثال: قاعة المؤتمرات، مبنى الجامعة..."
                            className="form-control"
                        />
                    </div>
                </div>
            </div>

            {/* 3. Cover Image Card */}
            <div className="card p-6 md:p-8 relative">
                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                    🖼️ صورة الغلاف
                </h2>

                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full min-h-[200px] border-2 border-dashed border-gray-300 hover:border-red-500 rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer bg-gray-50 hover:bg-red-50 transition-colors"
                >
                    {formData.image ? (
                        <div className="relative w-full text-center">
                            <img src={formData.image} alt="Cover Preview" className="max-h-[300px] rounded-xl mx-auto shadow-sm object-cover" />
                            <div className="mt-4 text-sm font-bold text-red-600">انقر لتغيير الصورة</div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500">
                            <span className="text-5xl block mb-3 opacity-60">📁</span>
                            <span className="block font-bold mb-1">اسحب الصورة هنا أو انقر للاختيار</span>
                            <span className="text-sm">يُفضل أن تكون بصيغة PNG أو JPG (حتى 5MB)</span>
                        </div>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                    />
                </div>
                {/* Fallback image text URL in case file logic is limited */}
                <div className="form-group mt-4">
                    <label className="form-label mb-2 font-bold text-xs text-gray-400">أو أدخل رابط الصورة مباشرة (URL):</label>
                    <input
                        type="text"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>
            </div>

            {/* 4. Social Links Card */}
            <div className="card p-6 md:p-8 relative">
                <div className="border-b border-gray-100 pb-4 mb-6">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        🔗 روابط التواصل الاجتماعي
                    </h2>
                    <p className="text-sm text-gray-500 font-medium mt-1">أضف روابط منصات التواصل لعرض النشاط كأزرار في صفحة التفاصيل (اترك الحقل فارغاً إذا لم ترغب بظهوره).</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {[
                        { id: 'instagram', label: 'Instagram', icon: '📸', placeholder: 'https://instagram.com/p/...' },
                        { id: 'youtube', label: 'YouTube', icon: '▶️', placeholder: 'https://youtube.com/watch?v=...' },
                        { id: 'tiktok', label: 'TikTok', icon: '🎵', placeholder: 'https://tiktok.com/@.../video/...' },
                        { id: 'twitter', label: 'Twitter / X', icon: '🐦', placeholder: 'https://twitter.com/...' },
                        { id: 'website', label: 'موقع خارجي', icon: '🌐', placeholder: 'https://...' },
                        { id: 'whatsapp_group', label: 'مجموعة WhatsApp', icon: '💬', placeholder: 'https://chat.whatsapp.com/...' },
                    ].map(platform => (
                        <div key={platform.id} className="form-group">
                            <label className="form-label mb-2 font-bold text-sm text-gray-700 flex items-center gap-1.5" dir="ltr">
                                {platform.label} {platform.icon}
                            </label>
                            <input
                                type="url"
                                name={platform.id}
                                value={formData.social_links[platform.id as keyof SocialLinks]}
                                onChange={handleSocialChange}
                                placeholder={platform.placeholder}
                                dir="ltr"
                                className="form-control text-left"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* 5. Gallery Card */}
            <div className="card p-6 md:p-8 relative">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        🖼️ معرض الصور (اختياري)
                    </h2>
                    <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                        + إضافة صور
                    </button>
                    <input
                        type="file"
                        ref={galleryInputRef}
                        onChange={handleGalleryChange}
                        accept="image/*"
                        multiple
                        className="hidden"
                    />
                </div>

                {formData.gallery && formData.gallery.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {formData.gallery.map((img, index) => (
                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
                                <img src={img} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeGalleryImage(index)}
                                    className="absolute top-2 right-2 bg-white/90 hover:bg-red-600 hover:text-white text-red-600 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium">لا توجد صور مضافة لمعرض الفعالية</p>
                    </div>
                )}
            </div>

            {/* Submit Actions */}
            <div className="card p-6 flex flex-wrap items-center justify-end gap-3 mt-4">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="btn btn-outline"
                >
                    إلغاء
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary px-8"
                >
                    {saving ? (
                        <>
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            جاري الحفظ...
                        </>
                    ) : (
                        <>💾 حفظ النشاط</>
                    )}
                </button>
            </div>

        </form>
    );
}
