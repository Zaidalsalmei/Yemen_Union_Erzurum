import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    action_url: string;
    is_read: boolean;
    created_at: string;
}

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { unreadNotifications, refreshPermissions } = useAuth();
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications?per_page=10');
            if (response.data.success) {
                setNotifications(response.data.data.notifications);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: number) => {
        try {
            await api.put(`/notifications/${id}/read`);
            await refreshPermissions();
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error('Failed to mark read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            await refreshPermissions();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Failed to mark all read', error);
        }
    };

    const handleNotificationClick = async (n: Notification) => {
        if (!n.is_read) {
            await markAsRead(n.id);
        }
        setIsOpen(false);
        if (n.action_url) {
            navigate(n.action_url);
        }
    };

    const timeAgo = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ar });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2.5 rounded-xl transition-all duration-300 ${isOpen ? 'bg-[#DC2626] text-white shadow-lg shadow-red-100 rotate-12 scale-110' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
                <span className="text-xl">🔔</span>
                {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-white text-[#DC2626] text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border-2 border-[#DC2626] animate-pulse">
                        {unreadNotifications > 99 ? '99+' : unreadNotifications}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fadeIn rtl" dir="rtl">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-black text-sm text-gray-800 flex items-center gap-2">
                            <span>🔔</span> الإشعارات
                        </h3>
                        {unreadNotifications > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-[10px] font-black text-[#DC2626] hover:underline"
                            >
                                قراءة الكل
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto max-h-[350px]">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center">
                                <span className="text-4xl block mb-2 opacity-50">📭</span>
                                <p className="text-xs text-gray-400 font-bold">لا توجد إشعارات جديدة</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n)}
                                    className={`p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-gray-50 flex gap-3 ${!n.is_read ? 'bg-red-50/30' : ''}`}
                                >
                                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.is_read ? 'bg-[#DC2626]' : 'bg-gray-200'}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className={`text-xs font-black truncate text-gray-800 ${!n.is_read ? 'text-[#DC2626]' : ''}`}>{n.title}</p>
                                            <span className="text-[9px] text-gray-400 font-bold flex-shrink-0">{timeAgo(n.created_at)}</span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 font-bold leading-relaxed line-clamp-2">{n.message}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-3 border-t bg-gray-50/50 text-center">
                        <button
                            onClick={() => { setIsOpen(false); navigate('/notifications'); }}
                            className="text-[11px] font-black text-gray-600 hover:text-[#DC2626] transition-colors"
                        >
                            عرض كافة الإشعارات ←
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
