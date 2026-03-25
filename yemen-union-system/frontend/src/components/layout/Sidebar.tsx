import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useBranding } from '../../contexts/BrandingContext';
import { getStorageUrl, getLogoUrl } from '../../utils/images';

interface MenuItem {
    icon: string;
    label: string;
    path: string;
    permission?: string | string[];
    show?: boolean;
}

// ===== تعريف عناصر Sidebar الرئيس (Admin) =====
const ADMIN_MENU: MenuItem[] = [
    { path: '/', label: 'لوحة التحكم', icon: '🏠', show: true },
    { path: '/users', label: 'الأعضاء', icon: '👥', permission: 'users.view_all' },
    { path: '/memberships', label: 'الاشتراكات', icon: '📋', permission: 'memberships.view_all' },
    { path: '/activities', label: 'الأنشطة والفعاليات', icon: '🎯', permission: 'activities.view' },
    { path: '/calendar', label: 'التقويم', icon: '📅', permission: 'calendar.view' },
    { path: '/posts', label: 'المنشورات والإعلانات', icon: '📢', permission: 'posts.view' },
    { path: '/finance', label: 'المالية', icon: '💰', permission: 'finance.view' },
    { path: '/support', label: 'الدعم الفني', icon: '🎧', permission: ['support.view_all', 'support.view_own'] },
    { path: '/relations/sponsors', label: 'الجهات الداعمة', icon: '🤝', permission: 'sponsors.view' },
    { path: '/relations/sponsorships', label: 'الرعايات', icon: '🎁', permission: 'sponsorships.view' },
    { path: '/reports', label: 'التقارير', icon: '📊', permission: ['reports.members', 'reports.finance', 'reports.activities'] },
    { path: '/settings', label: 'الإعدادات', icon: '⚙️', permission: 'settings.view' },
    { path: '/roles', label: 'الصلاحيات', icon: '🔐', permission: 'roles.view' },
];

// ===== تعريف عناصر Sidebar العضو (Member) =====
const MEMBER_MENU: MenuItem[] = [
    { path: '/', label: 'الرئيسية', icon: '🏠', show: true },
    { path: '/member/activities', label: 'الأنشطة والفعاليات', icon: '🎯', permission: 'activities.view' },
    { path: '/calendar', label: 'التقويم', icon: '📅', permission: 'calendar.view' },
    { path: '/posts', label: 'المنشورات', icon: '📢', permission: 'posts.view' },
    { path: '/membership/card', label: 'عضويتي', icon: '📋', permission: 'memberships.view_own' },
    { path: '/memberships/renew', label: 'طلب اشتراك', icon: '💳', show: true },
    { path: '/profile/edit', label: 'حسابي', icon: '👤', show: true },
    { path: '/support/tickets', label: 'الدعم الفني', icon: '🎧', permission: ['support.view_own', 'support.create'] },
    { path: '/notifications', label: 'الإشعارات', icon: '🔔', show: true },
];

export function Sidebar({ isOpen = false, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    const { user, logout, role, membership, hasPermission, hasAnyPermission, unreadNotifications } = useAuth();
    const { settings: brandingSettings } = useBranding();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const userInitial = user?.full_name?.charAt(0) || '👤';
    const isAdmin = role?.name === 'president' || role?.name === 'vice_president' || (role?.level ?? 0) >= 5;

    const getVisibleItems = (items: MenuItem[]) => {
        return items.filter(item => {
            if (item.show) return true;
            if (!item.permission) return false;
            if (Array.isArray(item.permission)) return hasAnyPermission(item.permission);
            return hasPermission(item.permission);
        });
    };

    const menuItems = isAdmin ? ADMIN_MENU : MEMBER_MENU;
    const visibleItems = getVisibleItems(menuItems);

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
            <aside className={`sidebar ${isOpen ? 'open' : ''}`} dir="rtl">
                <div className="sidebar__header p-6 pb-2">
                    <div className="flex items-center gap-3">
                        <img src={getLogoUrl(brandingSettings.logoUrl)} alt="Logo" className="w-10 h-10 rounded-xl" />
                        <div>
                            <h1 className="text-sm font-black text-gray-800 leading-tight">
                                {brandingSettings.unionName}
                            </h1>
                            <p className="text-[10px] text-gray-500 font-bold">أرضروم - تركيا</p>
                        </div>
                    </div>
                </div>

                <nav className="sidebar__nav flex-1 overflow-y-auto px-4 py-6 space-y-1">
                    {visibleItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-black text-sm group ${isActive
                                    ? 'bg-[#DC2626] text-white shadow-lg shadow-red-100'
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`
                            }
                            end={item.path === '/'}
                            onClick={onClose}
                        >
                            <span className="text-lg opacity-80 group-hover:scale-110 transition-transform">{item.icon}</span>
                            <span className="flex-1">{item.label}</span>
                            {item.path === '/notifications' && unreadNotifications > 0 && (
                                <span className="bg-red-600 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none shadow-sm mr-auto">
                                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* ===== عداد الاشتراك في أسفل الـ Sidebar ===== */}
                {membership && (
                    <div className={`p-3 mx-4 mb-4 rounded-2xl border transition-all duration-500 ${!membership || membership.days_remaining <= 0
                        ? 'bg-red-50 border-red-100'
                        : membership.days_remaining <= 30
                            ? 'bg-yellow-50 border-yellow-100'
                            : 'bg-green-50 border-green-100'
                        }`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-[10px] font-black ${membership.days_remaining <= 0 ? 'text-red-600' :
                                membership.days_remaining <= 30 ? 'text-yellow-700' : 'text-green-600'
                                }`}>
                                {membership.days_remaining <= 0
                                    ? '❌ منتهي'
                                    : `✅ ${membership.days_remaining} يوم متبقي`}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold">اشتراكك</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden" dir="ltr">
                            <div className={`h-full rounded-full transition-all duration-1000 ${membership.days_remaining <= 0 ? 'bg-red-500' :
                                membership.days_remaining <= 7 ? 'bg-red-500' :
                                    membership.days_remaining <= 30 ? 'bg-yellow-500' : 'bg-green-500'
                                }`} style={{ width: `${Math.max(0, Math.min(100, (membership as any).progress_percentage || 0))}%` }} />
                        </div>
                        <p className="text-[9px] text-gray-400 mt-2 text-center font-bold">ينتهي {membership.end_date}</p>
                    </div>
                )}

                <div className="p-4 border-t border-gray-100 mt-auto bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-2xl bg-[#DC2626] text-white flex items-center justify-center font-black shadow-lg shadow-red-100 overflow-hidden">
                            {user?.profile_photo ? (
                                <img src={getStorageUrl(user.profile_photo)} alt={user.full_name} className="w-full h-full object-cover" />
                            ) : (
                                <span>{userInitial}</span>
                            )}
                        </div>
                        <div className="overflow-hidden min-w-0">
                            <h4 className="text-sm font-black text-gray-800 truncate">{user?.full_name}</h4>
                            <p className="text-[10px] text-gray-400 font-bold truncate">{role?.display_name_ar || 'عضو'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full py-3 rounded-2xl bg-gray-50 text-gray-500 text-xs hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center gap-2 font-black border border-transparent hover:border-red-100 shadow-sm"
                    >
                        🚪 تسجيل الخروج
                    </button>
                </div>
            </aside>
        </>
    );
}
