import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { NotificationBell } from '../NotificationBell';
import { BackgroundWatermark } from './BackgroundWatermark';
import { GlobalSearch } from '../common/GlobalSearch';
import { useAuth } from '../../contexts/AuthContext';
import FloatingChat from '../Chat/FloatingChat';

export function AdminLayout() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, role } = useAuth();
    const location = useLocation();

    const getPageTitle = (pathname: string) => {
        if (pathname === '/dashboard') return 'لوحة التحكم';
        if (pathname.includes('/users')) return 'إدارة الأعضاء';
        if (pathname.includes('/activities')) return 'الأنشطة والفعاليات';
        if (pathname.includes('/finance')) return 'الشؤون المالية';
        if (pathname.includes('/settings')) return 'الإعدادات';
        if (pathname.includes('/memberships')) return 'إدارة الاشتراكات';
        if (pathname.includes('/posts')) return 'المنشورات والإعلانات';
        if (pathname.includes('/roles')) return 'إدارة الصلاحيات';
        return 'لوحة التحكم الإدارية';
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <BackgroundWatermark />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="main-content flex-1 flex flex-col min-w-0">
                <header className="header flex items-center justify-between px-8 bg-white border-b border-gray-100 h-20 sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="hamburger-btn focus:outline-none md:hidden">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="header__title text-lg font-black text-gray-800">{getPageTitle(location.pathname)}</h1>
                            <p className="header__subtitle text-[10px] text-gray-400 font-bold uppercase tracking-widest">اتحاد الطلاب اليمنيين - أرضروم</p>
                        </div>
                    </div>

                    <div className="header__actions flex items-center gap-6">
                        <NotificationBell />

                        <button onClick={() => setIsSearchOpen(true)} className="hidden md:flex items-center gap-3 px-6 py-2.5 bg-gray-100 rounded-2xl border border-gray-200 text-gray-400 text-xs font-bold transition-all hover:bg-gray-200">
                            🔍 <span className="opacity-75">بحث... (Ctrl+K)</span>
                        </button>

                        <div className="flex items-center gap-4 border-r border-gray-100 pr-6">
                            <div className="text-left hidden sm:block">
                                <p className="text-xs font-black text-gray-800 text-left">{user?.full_name}</p>
                                <p className="text-[10px] text-[#DC2626] font-bold text-left">{role?.display_name_ar || 'مسؤول'}</p>
                            </div>
                            <div className="w-11 h-11 rounded-2xl bg-[#DC2626] text-white flex items-center justify-center font-black shadow-lg shadow-red-100 text-lg">
                                {user?.full_name?.charAt(0) || '👤'}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="content-shell p-8 flex-1">
                    <Outlet />
                </div>
            </main>

            <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
            <FloatingChat />
        </div>
    );
}
