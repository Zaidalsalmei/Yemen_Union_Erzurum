import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';
import api from '../../services/api';
import { useBranding } from '../../contexts/BrandingContext';
import { getLogoUrl, getStorageUrl } from '../../utils/images';

export function MembershipCard() {
    const navigate = useNavigate();
    const cardRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [cardData, setCardData] = useState<any>(null);
    const [qrDataUrl, setQrDataUrl] = useState<string>('');
    const { settings } = useBranding();

    useEffect(() => {
        fetchCardData();
    }, []);

    useEffect(() => {
        if (cardData) {
            generateQrCode();
        }
    }, [cardData]);

    const fetchCardData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/membership/card');
            if (response.data.success) {
                setCardData(response.data.data);
            } else {
                toast.error('فشل في تحميل بيانات البطاقة');
            }
        } catch (error) {
            console.error('Error fetching card data:', error);
            toast.error('حدث خطأ أثناء الاتصال بالسيرفر');
        } finally {
            setLoading(false);
        }
    };

    const generateQrCode = async () => {
        if (!cardData) return;

        const { user, membership, membership_number, verification_url } = cardData;
        const isInactive = !membership || membership.status !== 'active' || membership.days_remaining <= 0;
        const qrColor = isInactive ? '#dc2626' : '#16a34a';

        const verificationData = JSON.stringify({
            id: user.id,
            name: user.full_name,
            membership_id: membership_number,
            status: membership?.status || 'inactive',
            valid_until: membership?.end_date || 'N/A'
        });

        try {
            const dataUrl = await QRCode.toDataURL(verification_url || verificationData, {
                width: 300,
                margin: 2,
                color: {
                    dark: qrColor,
                    light: '#ffffff'
                },
                errorCorrectionLevel: 'H'
            });
            setQrDataUrl(dataUrl);
        } catch (err) {
            console.error('QR Generation Error:', err);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;

            const cardElement = document.getElementById('membership-card');
            if (!cardElement) return;

            // Wait a tiny bit for any remaining renders
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(cardElement, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                onclone: (clonedDoc) => {
                    // Ensure the card is visible in the clone
                    const clonedCard = clonedDoc.getElementById('membership-card');
                    if (clonedCard) clonedCard.style.display = 'block';
                }
            });

            const imgData = canvas.toDataURL('image/png');
            // Standard ID-1 card size: 85.6mm x 53.98mm
            const pdf = new jsPDF('landscape', 'mm', [85.6, 54]);
            pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 54);
            pdf.save(`membership-card-${cardData?.membership_number || 'user'}.pdf`);

            toast.success('✅ تم تحميل البطاقة بنجاح');
        } catch (err) {
            console.error('PDF Error:', err);
            toast.error('❌ خطأ في تحميل البطاقة كـ PDF');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleBack = () => {
        navigate('/member/dashboard');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center p-8 bg-white rounded-3xl shadow-xl">
                    <div className="w-16 h-16 border-4 border-[#DC2626] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <h2 className="text-xl font-black text-gray-800 mb-2">جاري تجهيز بطاقتك الرقمية...</h2>
                    <p className="text-gray-500 font-bold">لحظات ونكون جاهزين ✨</p>
                </div>
            </div>
        );
    }

    if (!cardData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-gray-50 p-6">
                <div className="text-8xl animate-bounce">⚠️</div>
                <div className="text-center">
                    <h2 className="text-2xl font-black text-gray-900 mb-2">عذراً، لم نتمكن من العثور على بيانات اشتراكك</h2>
                    <p className="text-gray-500 font-bold">يرجى التأكد من حالة اشتراكك من لوحة التحكم</p>
                </div>
                <button
                    onClick={handleBack}
                    className="px-8 py-3 bg-[#DC2626] text-white rounded-2xl font-black shadow-lg hover:scale-105 transition-all"
                >
                    العودة للرئيسية
                </button>
            </div>
        );
    }

    const { user, membership, membership_number, branch, union_name } = cardData;

    // Logic for Status and Colors
    const isInactive = !membership || membership.status !== 'active' || membership.days_remaining <= 0;
    const isWarning = membership && membership.days_remaining <= 30 && membership.days_remaining > 0;

    const borderColor = isInactive ? 'border-red-500' : (isWarning ? 'border-yellow-500' : 'border-green-500');
    const headerColor = isInactive ? 'bg-red-500' : (isWarning ? 'bg-yellow-500' : 'bg-green-500');

    const statusLabel = isInactive ? '❌ عضوية منتهية' : (isWarning ? `⚠️ تنتهي خلال ${membership.days_remaining} يوم` : '✅ عضوية فعّالة');
    const statusBadgeClass = isInactive ? 'bg-red-100 text-red-700' : (isWarning ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700');

    return (
        <>
            <div className="membership-card-page rtl" dir="rtl">
                {/* Page Header - Hidden on print */}
                <div className="page-header no-print">
                    <div className="header-content shadow-lg border-2 border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#DC2626] rounded-2xl flex items-center justify-center text-white text-2xl shadow-md">🎴</div>
                            <div>
                                <h1 className="page-title text-black">بطاقة العضوية الذكية</h1>
                                <p className="page-subtitle">استخدم هذه البطاقة الرسمية لإثبات هويتك</p>
                            </div>
                        </div>
                        <div className="header-actions">
                            <button className="action-btn action-btn--secondary" onClick={handleBack}>
                                🏠 الرئيسية
                            </button>
                            <button className="action-btn action-btn--ghost" onClick={handlePrint}>
                                🖨️ طباعة
                            </button>
                            <button className="action-btn action-btn--primary" onClick={handleDownloadPDF}>
                                📄 تحميل PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* Membership Card Container */}
                <div className="card-container" ref={cardRef}>
                    <div className="membership-card-wrapper">
                        {/* THE CARD */}
                        <div id="membership-card" className={`membership-card relative border-4 ${borderColor} rounded-2xl overflow-hidden shadow-2xl bg-white max-w-2xl mx-auto transition-colors duration-500`}>
                            {/* Status Top Bar */}
                            <div className={`h-2 ${headerColor} w-full`} />

                            {/* Card Header */}
                            <div className="p-6 pb-2 border-b-2 border-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full border-2 border-[#DC2626] overflow-hidden bg-white shadow-sm flex-shrink-0">
                                            <img src={getLogoUrl(settings.logoUrl)} alt="Logo" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-gray-900 leading-none">{settings.unionName}</h2>
                                            <p className="text-sm font-bold text-[#DC2626] mt-1">{branch}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Republic of Yemen Union Of Students</p>
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <span className="text-[9px] font-black text-gray-400 block tracking-tighter">CARD TYPE</span>
                                        <span className="text-xs font-black text-gray-800 bg-gray-100 px-2 py-1 rounded-md">OFFICIAL MEMBER</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-6 grid grid-cols-12 gap-6 relative z-10">
                                {/* Photo & Badge Column */}
                                <div className="col-span-12 md:col-span-4 flex flex-col items-center gap-4">
                                    <div className="relative group">
                                        <div className={`w-36 h-44 rounded-2xl border-4 ${isInactive ? 'border-red-100' : 'border-gray-50'} overflow-hidden shadow-md bg-gray-50 bg-gradient-to-br from-white to-gray-100`}>
                                            {user.profile_photo ? (
                                                <img src={getStorageUrl(user.profile_photo)} alt={user.full_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-6xl font-black text-gray-200">
                                                    {user.full_name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        {/* Corner Decoration */}
                                        <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-white border-2 border-gray-100 rounded-xl flex items-center justify-center text-xl shadow-lg">🇾🇪</div>
                                    </div>

                                    <span className={`px-5 py-2 rounded-xl text-xs font-black shadow-sm ${statusBadgeClass}`}>
                                        {statusLabel}
                                    </span>
                                </div>

                                {/* Info Column */}
                                <div className="col-span-12 md:col-span-5 space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-gray-400 font-black block uppercase tracking-wider">الاسم الكامل / Full Name</label>
                                        <div className="text-xl font-black text-gray-900 leading-tight">{user.full_name}</div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] text-gray-400 font-black block uppercase tracking-wider">رقم العضوية / Member ID</label>
                                        <div className="text-2xl font-black text-[#DC2626] font-mono tracking-tighter">{membership_number}</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-400 font-black block tracking-wider">الهاتف / Phone</label>
                                            <div className="text-xs font-black text-gray-700">{user.phone_number}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-400 font-black block tracking-wider">الجامعة / University</label>
                                            <div className="text-xs font-black text-gray-700 truncate">{user.university}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 shadow-inner">
                                            <label className="text-[9px] text-gray-400 font-black block mb-0.5">انضم في</label>
                                            <div className="text-[11px] font-black text-gray-800">{new Date(user.created_at).toLocaleDateString('ar-EG')}</div>
                                        </div>
                                        <div className={`p-2.5 rounded-xl border-2 ${isInactive ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'} shadow-inner`}>
                                            <label className="text-[9px] text-gray-400 font-black block mb-0.5">صالحة حتى</label>
                                            <div className={`text-[11px] font-black ${isInactive ? 'text-red-700' : 'text-green-700'}`}>
                                                {membership?.end_date ? new Date(membership.end_date).toLocaleDateString('ar-EG') : '----/--/--'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* QR Column */}
                                <div className="col-span-12 md:col-span-3 flex flex-col items-center justify-center border-r-2 border-gray-50 pr-0 md:pr-4">
                                    <div className={`p-2.5 rounded-2xl border-2 ${isInactive ? 'border-red-100 bg-red-50' : 'border-green-100 bg-green-50'} shadow-md bg-white`}>
                                        {qrDataUrl ? (
                                            <img src={qrDataUrl} alt="Verification QR" className="w-[110px] h-[110px] block" />
                                        ) : (
                                            <div className="w-[110px] h-[110px] bg-gray-100 animate-pulse rounded-lg" />
                                        )}
                                    </div>
                                    <div className="text-center mt-3">
                                        <p className="text-[10px] font-black text-gray-900">رمز التحقق الذكي</p>
                                        <p className="text-[9px] text-gray-400 font-bold leading-tight mt-0.5">امسح للتحقق الفوري<br />من صحة العضوية</p>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="bg-gray-900 p-4 flex items-center justify-between text-white overflow-hidden relative">
                                <div className="flex items-center gap-6 text-[11px] font-black z-10">
                                    <span className="flex items-center gap-2">🌐 yemenstudents.org</span>
                                    <span className="opacity-20">|</span>
                                    <span className="flex items-center gap-2">📞 {user.phone_number}</span>
                                </div>
                                <div className="text-[10px] font-bold opacity-60 z-10 italic">YUS Erzurum Branch Official ID</div>

                                {/* Background Accent Gradient */}
                                <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-[#DC2626] to-transparent opacity-40 skew-x-[-20deg] translate-x-10"></div>
                            </div>

                            {/* Watermark Logo Large */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-[-35deg] pointer-events-none select-none">
                                <img src={getLogoUrl(settings.logoUrl)} alt="Watermark" className="w-[500px]" />
                            </div>
                        </div>

                        {/* Renewal Button if Expired */}
                        {isInactive && (
                            <div className="mt-10 text-center no-print animate-fadeIn">
                                <button
                                    onClick={() => navigate('/memberships/renew')}
                                    className="group relative px-12 py-5 bg-[#DC2626] text-white rounded-2xl font-black text-xl shadow-2xl hover:bg-black transition-all duration-300"
                                >
                                    <span className="relative z-10 flex items-center gap-3">
                                        <span>🔄 تجديد الاشتراك الآن</span>
                                    </span>
                                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl"></div>
                                </button>
                                <p className="mt-4 text-gray-500 font-black text-lg">عضويتك منتهية، نرجو التجديد للاستمرار في خدماتنا 🟥</p>
                            </div>
                        )}
                    </div>

                    {/* Instructions - Redesigned */}
                    <div className="card-instructions no-print mt-12 bg-white border-2 border-gray-100 p-8 rounded-3xl shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl">📝</div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 mb-1">تعليمات ودليل الاستخدام</h3>
                                <p className="text-sm text-gray-400 font-bold">كل ما تحتاج معرفته عن بطاقتك الرقمية الرسمية</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 bg-red-50 text-[#DC2626] rounded-xl flex items-center justify-center font-black flex-shrink-0">1</div>
                                    <p className="text-sm text-gray-600 leading-relaxed font-bold">البطاقة وثيقة رسمية معتمدة لدى كافة شركاء الاتحاد والجهات الحكومية والخاصة المتعاونة.</p>
                                </div>
                                <div className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 bg-red-50 text-[#DC2626] rounded-xl flex items-center justify-center font-black flex-shrink-0">2</div>
                                    <p className="text-sm text-gray-600 leading-relaxed font-bold">يمكن استخدام رمز الـ QR للتحقق السريع من بياناتك دون الحاجة للاتصال المباشر بالإدارة.</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 bg-red-50 text-[#DC2626] rounded-xl flex items-center justify-center font-black flex-shrink-0">3</div>
                                    <p className="text-sm text-gray-600 leading-relaxed font-bold">عند الضغط على "تحميل PDF" يتم إصدار نسخة مطابقة للمعايير العالمية لطباعة الكروت البلاستيكية (ID-1).</p>
                                </div>
                                <div className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 bg-red-50 text-[#DC2626] rounded-xl flex items-center justify-center font-black flex-shrink-0">4</div>
                                    <p className="text-sm text-gray-600 leading-relaxed font-bold">يرجى تحديث الصورة الشخصية من ملفك الشخصي لتنعكس التغييرات فوراً على البطاقة.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; padding: 0 !important; margin: 0 !important; overflow: visible !important; }
                    .membership-card-page { padding: 0 !important; background: white !important; min-height: auto !important; }
                    .card-container { max-width: none !important; margin: 0 !important; width: 100% !important; }
                    .membership-card { 
                        box-shadow: none !important; 
                        margin: 40px auto !important;
                        border-width: 2px !important;
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                        transform: scale(1) !important;
                    }
                }

                .membership-card-page {
                    min-height: 100vh;
                    padding: 40px 20px;
                    background: #fdfdfd;
                }

                .page-header {
                    max-width: 42rem;
                    margin: 0 auto 3rem;
                }

                .header-content {
                    background: white;
                    padding: 1.5rem 2rem;
                    border-radius: 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .page-title {
                    font-size: 1.5rem;
                    font-weight: 900;
                    margin-bottom: 0.2rem;
                }

                .page-subtitle {
                    font-size: 0.85rem;
                    color: #94a3b8;
                    font-weight: 700;
                }

                .header-actions {
                    display: flex;
                    gap: 0.75rem;
                }

                .action-btn {
                    padding: 0.75rem 1.5rem;
                    border-radius: 1rem;
                    font-weight: 800;
                    font-size: 0.875rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    border: none;
                    cursor: pointer;
                }

                .action-btn--primary {
                    background: #DC2626;
                    color: white;
                    box-shadow: 0 10px 15px -3px rgba(220, 38, 38, 0.3);
                }

                .action-btn--primary:hover {
                    background: #000;
                    transform: translateY(-3px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
                }

                .action-btn--secondary {
                    background: #f8fafc;
                    color: #1e293b;
                    border: 2px solid #e2e8f0;
                }

                .action-btn--secondary:hover {
                    background: #fff;
                    border-color: #DC2626;
                    color: #DC2626;
                }

                .action-btn--ghost {
                    background: #f1f5f9;
                    color: #64748b;
                }

                .action-btn--ghost:hover {
                    background: #e2e8f0;
                    color: #000;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.6s ease-out forwards;
                }
            `}</style>
        </>
    );
}
