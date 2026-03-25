import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { NotificationBell } from '../NotificationBell';
import { BackgroundWatermark } from './BackgroundWatermark';
import { GlobalSearch } from '../common/GlobalSearch';
import { useAuth } from '../../contexts/AuthContext';

export function DashboardLayout() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user } = useAuth();
    const location = useLocation();

    // Map routes to Arabic Titles
    const getPageTitle = (pathname: string) => {
        if (pathname === '/') return 'لوحة التحكم';
        if (pathname.includes('/users')) return 'إدارة الأعضاء';
        if (pathname.includes('/activities')) return 'الأنشطة والفعاليات';
        if (pathname.includes('/finance')) return 'الشؤون المالية';
        if (pathname.includes('/settings')) return 'الإعدادات';
        return 'لوحة التحكم';
    };

    // Global keyboard shortcut for search (Ctrl+K)
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

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="min-h-screen">
            <BackgroundWatermark />
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="main-content">
                {/* Global Premium Header */}
                <header className="header">
                    <div className="header__content">
                        {/* Hamburger Menu Button (Mobile/Tablet only) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button
                                className="hamburger-btn"
                                onClick={() => setIsSidebarOpen(true)}
                                aria-label="فتح القائمة"
                            >
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="header__title">{getPageTitle(location.pathname)}</h1>
                                <p className="header__subtitle">اتحاد الطلاب اليمنيين - أرضروم</p>
                            </div>
                        </div>
                    </div>

                    <div className="header__actions">
                        {/* Notification Bell */}
                        <NotificationBell />

                        {/* Search Button */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="btn"
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span className="opacity-75">بحث... (Ctrl+K)</span>
                        </button>

                        {/* User Badge */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-sm font-semibold">{user?.full_name || 'مسؤول النظام'}</span>
                        </div>
                    </div>
                </header>

                <div className="content-shell">
                    <Outlet />
                </div>
            </main>

            <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </div>
    );
}
