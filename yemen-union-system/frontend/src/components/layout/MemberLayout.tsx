import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BackgroundWatermark } from './BackgroundWatermark';
import { useAuth } from '../../contexts/AuthContext';
import FloatingChat from '../Chat/FloatingChat';

export function MemberLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, membership } = useAuth();
    const location = useLocation();

    const getPageTitle = (pathname: string) => {
        if (pathname === '/member') return 'الرئيسية';
        if (pathname.includes('/member/activities')) return 'الأنشطة والفعاليات';
        if (pathname.includes('/membership/card')) return 'عضويتي';
        if (pathname.includes('/profile/edit')) return 'حسابي';
        if (pathname.includes('/support')) return 'الدعم الفني';
        return 'اتحاد الطلاب';
    };

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row" dir="rtl">
            <BackgroundWatermark />

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                {/* Member Header (Premium Design) */}
                <header className="header flex items-center justify-between px-6 pt-8 pb-4 bg-transparent h-fit">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 md:hidden animate-fadeIn"
                        >
                            <span className="text-gray-400 text-xl italic font-black">☰</span>
                        </button>
                        <div className="animate-slideUp">
                            <h1 className="header__title text-2xl font-black text-gray-800 tracking-tighter">{getPageTitle(location.pathname)}</h1>
                            <p className="header__subtitle text-[11px] text-[#DC2626] font-bold uppercase tracking-widest mt-1 italic">
                                مرحباً بك مرة أخرى، {user?.full_name?.split(' ')[0]} 👋
                            </p>
                        </div>
                    </div>

                    <div className="header__actions flex items-center gap-3">
                        {/* Member Identity Badge */}
                        <div className="flex items-center gap-3 p-2 pr-6 bg-white rounded-3xl border border-gray-100 shadow-sm animate-slideLeft">
                            <div className="text-left hidden sm:block">
                                <p className="text-[10px] font-black text-gray-800 line-clamp-1">{user?.full_name}</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                    📦 {membership?.package_name || 'بانتظار الاشتراك'}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center font-black shadow-inner border border-gray-100 text-sm">
                                {user?.full_name?.charAt(0) || '👤'}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="content-shell p-6 md:p-8 flex-1 overflow-y-auto animate-fadeInUp">
                    <Outlet />
                </div>
            </main>
            <FloatingChat />
        </div>
    );
}
