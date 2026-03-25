import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

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
    gallery: string[] | null;
    social_links: SocialLinks | null;
    max_participants: number | null;
    registered_count: number;
    registration_deadline: string | null;
    is_registered: boolean;
    is_registration_open: boolean;
    created_by: number;
    created_by_name: string;
    created_at: string;
    updated_at: string;
}

const SOCIAL_PLATFORMS: Record<string, any> = {
    instagram: {
        label: 'Instagram',
        labelAr: 'انستجرام',
        sublabel: 'مشاهدة المنشور',
        gradient: 'from-purple-600 via-pink-500 to-orange-400',
        hoverGradient: 'hover:from-purple-700 hover:via-pink-600 hover:to-orange-500',
        icon: '📸'
    },
    youtube: {
        label: 'YouTube',
        labelAr: 'يوتيوب',
        sublabel: 'مشاهدة الفيديو',
        gradient: 'from-red-600 to-red-700',
        hoverGradient: 'hover:from-red-700 hover:to-red-800',
        icon: '▶️'
    },
    tiktok: {
        label: 'TikTok',
        labelAr: 'تيك توك',
        sublabel: 'مشاهدة الفيديو',
        gradient: 'from-gray-900 to-black',
        hoverGradient: 'hover:from-black hover:to-gray-900',
        icon: '🎵'
    },
    twitter: {
        label: 'Twitter',
        labelAr: 'تويتر',
        sublabel: 'مشاهدة التغريدة',
        gradient: 'from-blue-400 to-blue-500',
        hoverGradient: 'hover:from-blue-500 hover:to-blue-600',
        icon: '🐦'
    },
    website: {
        label: 'Website',
        labelAr: 'الموقع',
        sublabel: 'زيارة الموقع',
        gradient: 'from-gray-600 to-gray-700',
        hoverGradient: 'hover:from-gray-700 hover:to-gray-800',
        icon: '🌐'
    },
    whatsapp_group: {
        label: 'WhatsApp',
        labelAr: 'واتساب',
        sublabel: 'انضم للمجموعة',
        gradient: 'from-green-500 to-green-600',
        hoverGradient: 'hover:from-green-600 hover:to-green-700',
        icon: '💬'
    }
};

export default function ActivityDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [activity, setActivity] = useState<Activity | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);

    // Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const canEdit = user?.roles?.some((r: any) =>
        ['admin', 'president'].includes(typeof r === 'string' ? r : r.name)
    ) || user?.permissions?.includes('activities.update');

    useEffect(() => {
        loadActivity();
    }, [id]);

    const loadActivity = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/activities/${id}`);
            if (res.data?.success) {
                setActivity(res.data.data);
            } else {
                toast.error('لم يتم العثور على النشاط');
                navigate('/activities');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'خطأ في التحميل');
            navigate('/activities');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterToggle = async () => {
        if (!user) {
            toast.error('يجب تسجيل الدخول أولاً');
            return;
        }

        try {
            setIsRegistering(true);
            const res = await api.post(`/activities/${id}/register`);
            if (res.data?.success) {
                toast.success(res.data.message || 'تمت العملية بنجاح');
                loadActivity(); // Reload to update state and counts
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'حدث خطأ أثناء التسجيل');
        } finally {
            setIsRegistering(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('هل أنت متأكد من حذف هذا النشاط؟ لا يمكن التراجع عن هذا الإجراء.')) return;

        try {
            const res = await api.delete(`/activities/${id}`);
            if (res.data?.success) {
                toast.success('تم حذف النشاط بنجاح');
                navigate('/activities');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'حدث خطأ أثناء الحذف');
        }
    };

    const handlePublish = async () => {
        if (!window.confirm('هل أنت متأكد من نشر هذا النشاط وإتاحته للجميع؟')) return;

        try {
            const res = await api.post(`/activities/${id}/publish`);
            if (res.data?.success) {
                toast.success('تم نشر النشاط بنجاح');
                loadActivity();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'حدث خطأ أثناء النشر');
        }
    };

    // Helper functions
    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'activity': return '🎯 نشاط';
            case 'event': return '🎉 فعالية';
            case 'workshop': return '🛠 ورشة عمل';
            case 'trip': return '✈️ رحلة';
            case 'meeting': return '🤝 اجتماع';
            default: return 'نشاط';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'published': return '✅ منشور';
            case 'draft': return '📝 مسودة';
            case 'cancelled': return '❌ ملغي';
            case 'completed': return '🏁 مكتمل';
            default: return status;
        }
    };

    const getPlaceholderGradient = (type: string) => {
        switch (type) {
            case 'activity': return 'from-blue-600 to-blue-800';
            case 'event': return 'from-purple-600 to-purple-800';
            case 'workshop': return 'from-green-600 to-green-800';
            case 'trip': return 'from-orange-500 to-orange-700';
            case 'meeting': return 'from-gray-600 to-gray-800';
            default: return 'from-gray-600 to-gray-800';
        }
    };

    const formatDateRange = (start: string, end: string | null) => {
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        const startDate = new Date(start);
        const startStr = startDate.toLocaleDateString('ar-EG', options);

        if (!end) return startStr;

        const endDate = new Date(end);

        // If same day
        if (startDate.toDateString() === endDate.toDateString()) {
            return startStr;
        }

        // If same month and year
        if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
            return `${startDate.getDate()} - ${endDate.getDate()} ${startDate.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}`;
        }

        return `${startStr} - ${endDate.toLocaleDateString('ar-EG', options)}`;
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    };

    // Lightbox Controls
    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        document.body.style.overflow = 'auto';
    };

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (activity?.gallery) {
            setLightboxIndex((prev) => (prev + 1) % activity.gallery!.length);
        }
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (activity?.gallery) {
            setLightboxIndex((prev) => (prev - 1 + activity.gallery!.length) % activity.gallery!.length);
        }
    };

    if (loading) {
        return (
            <div dir="rtl" className="animate-pulse flex flex-col gap-6 max-w-6xl mx-auto pb-10">
                <div className="h-10 w-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="w-full h-[300px] bg-gray-200 rounded-2xl"></div>
                <div className="flex flex-col lg:flex-row gap-6 mt-6">
                    <div className="lg:w-2/3 space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                    <div className="lg:w-1/3">
                        <div className="h-64 bg-gray-200 rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!activity) return null;

    const percentage = activity.max_participants
        ? Math.min((activity.registered_count / activity.max_participants) * 100, 100)
        : 0;

    let progressColor = 'bg-green-500';
    if (percentage >= 90) progressColor = 'bg-red-500';
    else if (percentage >= 70) progressColor = 'bg-yellow-500';

    const hasSocialLinks = activity.social_links && Object.values(activity.social_links).some(link => link && link.trim() !== '');
    const hasGallery = activity.gallery && activity.gallery.length > 0;

    return (
        <div dir="rtl" className="flex flex-col gap-6 max-w-6xl mx-auto pb-10">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                <button onClick={() => navigate(-1)} className="hover:text-red-600 transition-colors flex items-center gap-1">
                    <span>➡️</span> رجوع
                </button>
                <span>/</span>
                <button onClick={() => navigate('/activities')} className="hover:text-red-600 transition-colors">
                    الأنشطة
                </button>
                <span>/</span>
                <span className="text-gray-900 truncate max-wxs">{activity.title}</span>
            </div>

            {/* Section 1: Hero Banner */}
            <div className="relative w-full h-[300px] md:h-[400px] rounded-3xl overflow-hidden shadow-lg group">
                {activity.image ? (
                    <img src={activity.image} alt={activity.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${getPlaceholderGradient(activity.type)} flex items-center justify-center`}>
                        <span className="text-9xl opacity-20 drop-shadow-lg">{getTypeLabel(activity.type).split(' ')[0]}</span>
                    </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                {/* Hero Content */}
                <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end text-white">
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-sm font-bold border border-white/30 truncate">
                            {getTypeLabel(activity.type)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold border backdrop-blur-md
                            ${activity.status === 'published' ? 'bg-green-500/80 border-green-400' :
                                activity.status === 'draft' ? 'bg-gray-500/80 border-gray-400' :
                                    activity.status === 'cancelled' ? 'bg-red-500/80 border-red-400' :
                                        'bg-blue-500/80 border-blue-400'}`}
                        >
                            {getStatusLabel(activity.status)}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold mb-3 leading-tight drop-shadow-md">
                        {activity.title}
                    </h1>

                    {activity.summary && (
                        <p className="text-lg md:text-xl font-medium text-gray-200 mb-6 max-w-3xl drop-shadow line-clamp-2">
                            {activity.summary}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-6 text-sm md:text-base font-medium text-gray-300">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">📅</span>
                            <span>{formatDateRange(activity.start_date, activity.end_date)}</span>
                        </div>
                        {activity.location && (
                            <div className="flex items-center gap-2">
                                <span className="text-xl">📍</span>
                                <span>{activity.location}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <span className="text-xl">👤</span>
                            <span>{activity.created_by_name}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Controls */}
            {canEdit && (
                <div className="bg-gray-800 text-white rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm border border-gray-700">
                    <div className="flex items-center gap-2 font-bold">
                        <span className="text-xl">⚙️</span> إدارة النشاط
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <button onClick={() => navigate(`/activities/${id}/edit`)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors">
                            ✏️ تعديل
                        </button>
                        {activity.status === 'draft' && (
                            <button onClick={handlePublish} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors">
                                📢 نشر
                            </button>
                        )}
                        <button onClick={() => navigate(`/activities/${id}/participants`)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
                            👥 المشاركين ({activity.registered_count})
                        </button>
                        <button onClick={handleDelete} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-colors">
                            🗑️ حذف
                        </button>
                    </div>
                </div>
            )}

            {/* Section 2: Main Content & Sidebar */}
            <div className="flex flex-col lg:flex-row gap-8">

                {/* Main Column (Description & Socials & Gallery) */}
                <div className="lg:w-2/3 space-y-8 shadow-sm">
                    {/* Description */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-4">
                            📝 <span className="text-transparent bg-clip-text bg-gradient-to-l from-red-600 to-red-800">تفاصيل النشاط</span>
                        </h2>

                        {activity.description ? (
                            <div className="prose prose-red max-w-none text-gray-700 leading-relaxed font-medium"
                                dangerouslySetInnerHTML={{ __html: activity.description.replace(/\n/g, '<br/>') }}
                            />
                        ) : (
                            <div className="text-center py-10 opacity-50">
                                <span className="text-4xl block mb-3">📄</span>
                                <p>لا يوجد وصف تفصيلي لهذا النشاط.</p>
                            </div>
                        )}
                    </div>

                    {/* Section 3: Social Links */}
                    {hasSocialLinks && (
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">
                                🔗 تابعنا وتواصل معنا عبر
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.entries(activity.social_links as SocialLinks).map(([key, url]) => {
                                    if (!url || url.trim() === '') return null;
                                    const platform = SOCIAL_PLATFORMS[key];
                                    if (!platform) return null;

                                    return (
                                        <a key={key} href={url} target="_blank" rel="noopener noreferrer"
                                            className={`flex items-center gap-3 p-3 rounded-xl text-white bg-gradient-to-r ${platform.gradient} ${platform.hoverGradient} transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-md group`}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl shadow-inner group-hover:rotate-12 transition-transform">
                                                {platform.icon}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm">{platform.labelAr}</div>
                                                <div className="text-[10px] opacity-90">{platform.sublabel}</div>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Section 4: Gallery */}
                    {hasGallery && (
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4 flex items-center gap-2">
                                🖼️ معرض الصور
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {activity.gallery!.map((img, index) => (
                                    <div key={index}
                                        onClick={() => openLightbox(index)}
                                        className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group shadow-sm border border-gray-100"
                                    >
                                        <img src={img} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                            <span className="bg-white/90 text-gray-800 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform scale-50 group-hover:scale-100 shadow-lg text-xl">
                                                🔍
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar (Info & Registration) */}
                <div className="lg:w-1/3">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-6">

                        <div className="bg-[#DC2626] text-white p-4 font-bold text-lg flex justify-center items-center gap-2">
                            📋 معلومات النشاط
                        </div>

                        <div className="p-6 space-y-6 divide-y divide-gray-100">

                            {/* Date */}
                            <div className="flex items-start gap-4 pt-2">
                                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-2xl shrink-0">
                                    📅
                                </div>
                                <div>
                                    <h4 className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-wider">التاريخ والوقت</h4>
                                    <p className="font-bold text-gray-800">{formatDateRange(activity.start_date, null)}</p>
                                    <p className="text-sm text-gray-600 mt-0.5">
                                        {formatTime(activity.start_date)}
                                        {activity.end_date && ` - ${formatTime(activity.end_date)}`}
                                    </p>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="flex items-start gap-4 pt-6">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl shrink-0">
                                    📍
                                </div>
                                <div>
                                    <h4 className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-wider">المكان</h4>
                                    <p className="font-bold text-gray-800 leading-snug">{activity.location || 'غير محدد'}</p>
                                </div>
                            </div>

                            {/* Participants */}
                            <div className="flex items-start gap-4 pt-6">
                                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-2xl shrink-0">
                                    👥
                                </div>
                                <div className="w-full">
                                    <h4 className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-wider">المشاركين</h4>

                                    {activity.max_participants ? (
                                        <>
                                            <div className="flex justify-between font-bold text-gray-800 mb-2">
                                                <span>{activity.registered_count} <span className="text-gray-400 font-normal">/ {activity.max_participants}</span></span>
                                                <span dir="ltr" className={percentage >= 90 ? 'text-red-600' : 'text-green-600'}>
                                                    {Math.round(percentage)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                <div className={`h-full rounded-full ${progressColor} transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="font-bold text-gray-800">{activity.registered_count} <span className="text-sm font-normal text-gray-500">مسجل (لا يوجد حد أقصى)</span></p>
                                    )}
                                </div>
                            </div>

                            {/* Deadline */}
                            {activity.registration_deadline && (
                                <div className="flex items-start gap-4 pt-6">
                                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-2xl shrink-0">
                                        ⏰
                                    </div>
                                    <div>
                                        <h4 className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-wider">آخر موعد للتسجيل</h4>
                                        <p className="font-bold text-gray-800">
                                            {formatDateRange(activity.registration_deadline, null)}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-0.5" dir="ltr">
                                            {formatTime(activity.registration_deadline)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Actions / Registration Button */}
                            <div className="pt-6">
                                {activity.status !== 'published' ? (
                                    <div className="bg-gray-100 text-gray-500 text-center py-4 rounded-xl font-bold border border-gray-200 border-dashed">
                                        التسجيل غير متاح حالياً
                                    </div>
                                ) : activity.is_registered ? (
                                    <div className="flex flex-col gap-3">
                                        <div className="bg-green-50 text-green-700 text-center py-4 rounded-xl font-bold border border-green-200 flex flex-col items-center gap-1 shadow-sm">
                                            <span className="text-2xl">✅</span>
                                            أنت مسجل في هذا النشاط
                                        </div>
                                        <button
                                            onClick={handleRegisterToggle}
                                            disabled={isRegistering}
                                            className="w-full py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                                        >
                                            {isRegistering ? 'جاري الإلغاء...' : '❌ إلغاء التسجيل'}
                                        </button>
                                    </div>
                                ) : activity.is_registration_open ? (
                                    <button
                                        onClick={handleRegisterToggle}
                                        disabled={isRegistering}
                                        className="w-full py-4 bg-[#DC2626] hover:bg-red-700 text-white rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none"
                                    >
                                        {isRegistering ? 'جاري التسجيل...' : '📝 سجل الآن'}
                                    </button>
                                ) : (
                                    <div className="bg-red-50 text-red-600 text-center py-4 rounded-xl font-bold border border-red-100 shadow-inner flex flex-col items-center justify-center gap-2">
                                        <span className="text-2xl opacity-80">🔒</span>
                                        التسجيل مغلق
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            {lightboxOpen && hasGallery && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
                    onClick={closeLightbox}
                >
                    <button
                        className="absolute top-4 right-4 md:top-8 md:right-8 text-white/70 hover:text-white bg-black/50 hover:bg-red-600 rounded-full w-12 h-12 flex items-center justify-center text-2xl transition-all"
                        onClick={closeLightbox}
                    >
                        ✕
                    </button>

                    <button
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/50 hover:bg-gray-800 rounded-full w-14 h-14 flex items-center justify-center text-3xl transition-all"
                        onClick={prevImage}
                    >
                        ❮
                    </button>

                    <img
                        src={activity.gallery![lightboxIndex]}
                        alt="Gallery preview"
                        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl animate-scaleIn"
                        onClick={(e) => e.stopPropagation()}
                    />

                    <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/50 hover:bg-gray-800 rounded-full w-14 h-14 flex items-center justify-center text-3xl transition-all"
                        onClick={nextImage}
                    >
                        ❯
                    </button>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 bg-black/50 px-4 py-1.5 rounded-full font-medium tracking-widest text-sm">
                        {lightboxIndex + 1} / {activity.gallery!.length}
                    </div>
                </div>
            )}
        </div>
    );
}
