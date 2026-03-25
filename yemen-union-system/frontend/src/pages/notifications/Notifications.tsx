import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface Notification {
    id: number;
    type: 'payment' | 'activity' | 'subscription' | 'announcement' | 'system' | string;
    title: string;
    message: string;
    created_at: string;
    is_read: boolean;
    priority?: 'low' | 'medium' | 'high';
    action_url?: string;
    actionLabel?: string;
}

export function Notifications() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
    const [typeFilter, setTypeFilter] = useState<'all' | Notification['type']>('all');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications');
            if (response.data?.success) {
                setNotifications(response.data.data.notifications);
            } else {
                toast.error('لم يتم العثور على إشعارات');
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('حدث خطأ أثناء جلب الإشعارات');
        } finally {
            setLoading(false);
        }
    };

    const notificationTypes = [
        { value: 'all', label: 'الكل', icon: '📋', color: '#6B7280' },
        { value: 'payment', label: 'المدفوعات', icon: '💰', color: '#10B981' },
        { value: 'activity', label: 'الأنشطة', icon: '🎉', color: '#3B82F6' },
        { value: 'subscription', label: 'الاشتراك', icon: '🎫', color: '#F59E0B' },
        { value: 'announcement', label: 'إعلانات', icon: '📢', color: '#8B5CF6' },
        { value: 'system', label: 'النظام', icon: '⚙️', color: '#6B7280' },
        { value: 'membership', label: 'العضوية', icon: '👤', color: '#3B82F6' }
    ];

    const getFilteredNotifications = () => {
        let filtered = notifications;

        if (filter === 'unread') {
            filtered = filtered.filter(n => !n.is_read);
        } else if (filter === 'read') {
            filtered = filtered.filter(n => n.is_read);
        }

        if (typeFilter !== 'all') {
            filtered = filtered.filter(n => n.type === typeFilter);
        }

        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    };

    const markAsRead = async (id: number) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            toast.success('تم تعليم جميع الإشعارات كمقروءة');
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('حدث خطأ');
        }
    };

    const deleteNotification = async (id: number) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(notifications.filter(n => n.id !== id));
            toast.success('تم حذف الإشعار');
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('حدث خطأ');
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
        if (notification.action_url) {
            navigate(notification.action_url);
        }
    };

    const getTypeInfo = (type: Notification['type']) => {
        return notificationTypes.find(t => t.value === type) || notificationTypes[5]; // system fallback
    };

    const getPriorityColor = (priority: string = 'low') => {
        const colors: Record<string, string> = {
            low: '#6B7280',
            medium: '#F59E0B',
            high: '#EF4444',
        };
        return colors[priority] || colors.low;
    };

    const getTimeAgo = (date: string) => {
        if (!date) return 'مجهول';
        const now = new Date();
        const notifDate = new Date(date);
        const diffMs = now.getTime() - notifDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'الآن';
        if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
        if (diffHours < 24) return `منذ ${diffHours} ساعة`;
        if (diffDays < 7) return `منذ ${diffDays} يوم`;
        return notifDate.toLocaleDateString('ar-EG');
    };

    const handleBack = () => {
        navigate('/');
    };

    const filteredNotifications = getFilteredNotifications();
    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <>
            <div className="notifications-page">
                {/* Page Header */}
                <div className="page-header">
                    <div className="header-content">
                        <div>
                            <h1 className="page-title">
                                🔔 الإشعارات
                                {unreadCount > 0 && (
                                    <span className="unread-badge">{unreadCount}</span>
                                )}
                            </h1>
                            <p className="page-subtitle">جميع إشعاراتك في مكان واحد</p>
                        </div>
                        <div className="header-actions">
                            {unreadCount > 0 && (
                                <button className="mark-all-btn" onClick={markAllAsRead}>
                                    ✓ تعليم الكل كمقروء
                                </button>
                            )}
                            <button className="back-btn" onClick={handleBack}>
                                العودة
                            </button>
                        </div>
                    </div>
                </div>

                <div className="content-wrapper">
                    {/* Filter Tabs */}
                    <div className="filter-tabs">
                        <button
                            className={`filter-tab ${filter === 'all' ? 'filter-tab--active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            📋 الكل ({notifications.length})
                        </button>
                        <button
                            className={`filter-tab ${filter === 'unread' ? 'filter-tab--active' : ''}`}
                            onClick={() => setFilter('unread')}
                        >
                            🔴 غير مقروءة ({unreadCount})
                        </button>
                        <button
                            className={`filter-tab ${filter === 'read' ? 'filter-tab--active' : ''}`}
                            onClick={() => setFilter('read')}
                        >
                            ✓ مقروءة ({notifications.length - unreadCount})
                        </button>
                    </div>

                    {/* Type Filters */}
                    <div className="type-filters">
                        {notificationTypes.map((type) => (
                            <button
                                key={type.value}
                                className={`type-filter ${typeFilter === type.value ? 'type-filter--active' : ''}`}
                                onClick={() => setTypeFilter(type.value as any)}
                                style={{
                                    borderColor: typeFilter === type.value ? type.color : '#E0E0E0',
                                    color: typeFilter === type.value ? type.color : '#666',
                                }}
                            >
                                <span className="filter-icon">{type.icon}</span>
                                <span className="filter-label">{type.label}</span>
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="loading-state" style={{ textAlign: 'center', padding: '40px' }}>
                            جاري جلب الإشعارات...
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        <div className="notifications-list">
                            {filteredNotifications.map((notification) => {
                                const typeInfo = getTypeInfo(notification.type);
                                const priorityColor = getPriorityColor(notification.priority);

                                return (
                                    <div
                                        key={notification.id}
                                        className={`notification-card ${!notification.is_read ? 'notification-card--unread' : ''}`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="notification-indicator" style={{ backgroundColor: priorityColor }} />

                                        <div className="notification-icon" style={{ backgroundColor: typeInfo.color }}>
                                            {typeInfo.icon}
                                        </div>

                                        <div className="notification-content">
                                            <div className="notification-header">
                                                <h3 className="notification-title">{notification.title}</h3>
                                                <span className="notification-time">{getTimeAgo(notification.created_at)}</span>
                                            </div>

                                            <p className="notification-message">{notification.message}</p>

                                            {notification.action_url && (
                                                <div className="notification-actions">
                                                    <button className="action-link">
                                                        {notification.actionLabel || 'عرض التفاصيل'} →
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="notification-menu">
                                            <button
                                                className="delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(notification.id);
                                                }}
                                                title="حذف"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">🔕</div>
                            <h3>لا توجد إشعارات</h3>
                            <p>
                                {filter === 'unread' && 'جميع إشعاراتك مقروءة'}
                                {filter === 'read' && 'لا توجد إشعارات مقروءة'}
                                {filter === 'all' && 'لا توجد إشعارات حالياً'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .notifications-page {
                    min-height: 100vh;
                    padding: 24px;
                    background: linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%);
                }

                .page-header {
                    max-width: 1000px;
                    margin: 0 auto 32px;
                }

                .header-content {
                    background: white;
                    padding: 24px 32px;
                    border-radius: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }

                .page-title {
                    font-size: 28px;
                    font-weight: 800;
                    color: #000;
                    margin: 0 0 4px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .unread-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 28px;
                    height: 28px;
                    padding: 0 8px;
                    background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
                    color: white;
                    border-radius: 14px;
                    font-size: 14px;
                    font-weight: 700;
                }

                .page-subtitle {
                    font-size: 14px;
                    color: #666;
                    margin: 0;
                }

                .header-actions {
                    display: flex;
                    gap: 12px;
                }

                .mark-all-btn {
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                }

                .mark-all-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
                }

                .back-btn {
                    padding: 12px 24px;
                    background: white;
                    color: #333;
                    border: 2px solid #E0E0E0;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .back-btn:hover {
                    border-color: #D60000;
                    color: #D60000;
                }

                .content-wrapper {
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .filter-tabs {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 24px;
                }

                .filter-tab {
                    flex: 1;
                    padding: 16px;
                    background: white;
                    border: 2px solid #E0E0E0;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 15px;
                    color: #666;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .filter-tab:hover {
                    border-color: #D60000;
                    color: #D60000;
                }

                .filter-tab--active {
                    background: linear-gradient(135deg, #D60000 0%, #8A0000 100%);
                    color: white;
                    border-color: #D60000;
                }

                .type-filters {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                }

                .type-filter {
                    padding: 10px 20px;
                    background: white;
                    border: 2px solid #E0E0E0;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-weight: 600;
                    font-size: 14px;
                }

                .type-filter:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .type-filter--active {
                    border-width: 2px;
                    font-weight: 700;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .filter-icon {
                    font-size: 18px;
                }

                .notifications-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .notification-card {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                .notification-card:hover {
                    transform: translateX(-4px);
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
                }

                .notification-card--unread {
                    background: linear-gradient(135deg, #FEF2F2 0%, #FFFFFF 100%);
                    border: 2px solid #FEE2E2;
                }

                .notification-indicator {
                    position: absolute;
                    right: 0;
                    top: 0;
                    bottom: 0;
                    width: 4px;
                }

                .notification-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    flex-shrink: 0;
                    color: white;
                }

                .notification-content {
                    flex: 1;
                }

                .notification-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 12px;
                    margin-bottom: 8px;
                }

                .notification-title {
                    font-size: 16px;
                    font-weight: 800;
                    color: #000;
                    margin: 0;
                    flex: 1;
                }

                .notification-time {
                    font-size: 12px;
                    color: #999;
                    font-weight: 600;
                    white-space: nowrap;
                }

                .notification-message {
                    font-size: 14px;
                    color: #666;
                    line-height: 1.6;
                    margin: 0 0 12px;
                }

                .notification-actions {
                    margin-top: 12px;
                }

                .action-link {
                    padding: 8px 16px;
                    background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .action-link:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }

                .notification-menu {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .delete-btn {
                    width: 36px;
                    height: 36px;
                    background: #FEE2E2;
                    border: none;
                    border-radius: 8px;
                    font-size: 18px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .delete-btn:hover {
                    background: #EF4444;
                    transform: scale(1.1);
                }

                .empty-state {
                    text-align: center;
                    padding: 80px 20px;
                    background: white;
                    border-radius: 16px;
                }

                .empty-icon {
                    font-size: 80px;
                    margin-bottom: 20px;
                }

                .empty-state h3 {
                    font-size: 24px;
                    font-weight: 800;
                    color: #000;
                    margin: 0 0 12px;
                }

                .empty-state p {
                    font-size: 16px;
                    color: #666;
                    margin: 0;
                }

                @media (max-width: 768px) {
                    .notifications-page {
                        padding: 16px;
                    }

                    .header-content {
                        flex-direction: column;
                        gap: 16px;
                        padding: 20px;
                    }

                    .header-actions {
                        width: 100%;
                        flex-direction: column;
                    }

                    .mark-all-btn,
                    .back-btn {
                        width: 100%;
                    }

                    .filter-tabs {
                        flex-direction: column;
                    }

                    .type-filters {
                        justify-content: center;
                    }

                    .notification-card {
                        padding: 16px;
                    }

                    .notification-icon {
                        width: 40px;
                        height: 40px;
                        font-size: 20px;
                    }
                }
            `}</style>
        </>
    );
}
