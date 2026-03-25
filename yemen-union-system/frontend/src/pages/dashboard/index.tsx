import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatArabicNumber } from '../../utils/formatters';
import type { DashboardData, ApiResponse } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

// Animated Counter Implementation
function AnimatedCounter({ value, duration = 1500 }: { value: number; duration?: number }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (value === 0) { setCount(0); return; }
        let startTime: number, animationFrame: number;
        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * value));
            if (progress < 1) animationFrame = requestAnimationFrame(animate);
        };
        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration]);

    return <span>{formatArabicNumber(count)}</span>;
}

// Scoped Stats Widget
function StatWidget({ label, value, icon, suffix }: any) {
    return (
        <div className="stat-card-std">
            <div className="icon-wrapper" style={{ background: '#f8fafc', color: '#64748b' }}>
                {icon}
            </div>
            <div className="info">
                <div className="value flex items-baseline gap-1">
                    <AnimatedCounter value={value} />
                    {suffix && <span style={{ fontSize: '14px', fontWeight: 400, color: '#94a3b8' }}>{suffix}</span>}
                </div>
                <div className="label">{label}</div>
            </div>
        </div>
    );
}

function QuickActionBtn({ title, icon, onClick }: any) {
    return (
        <button onClick={onClick} className="quick-action-btn">
            <div className="icon">{icon}</div>
            <span>{title}</span>
        </button>
    );
}

export function Dashboard() {
    const { hasPermission, isPresident } = useAuth();
    const navigate = useNavigate();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['dashboard'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<DashboardData>>('/dashboard');
            return response.data.data!;
        },
        refetchInterval: 60000,
    });

    const stats = data?.stats;

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setTimeout(() => setIsRefreshing(false), 500);
    };

    return (
        <div className="animate-fadeIn">
            {/* Scoped Page Header */}
            <div className="page-header">
                <div>
                    <h1>ملخص الأداء</h1>
                    <p>آخر تحديث: {new Date().toLocaleTimeString('ar-EG')}</p>
                </div>
                <button
                    className="btn"
                    style={{ background: 'white', border: '1px solid #e2e8f0', color: '#64748b' }}
                    onClick={handleRefresh}
                >
                    {isRefreshing ? 'جاري التحديث...' : 'تحديث البيانات'}
                </button>
            </div>

            {/* Error State */}
            {error && (
                <div style={{ padding: '16px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', color: '#b91c1c', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>⚠️</span>
                        <span>تعذر تحميل البيانات من الخادم</span>
                    </div>
                    <button onClick={() => refetch()} style={{ background: 'transparent', border: 'none', color: '#b91c1c', fontWeight: 600, cursor: 'pointer' }}>
                        إعادة المحاولة
                    </button>
                </div>
            )}

            {/* Scoped Stats Grid */}
            <div className="stats-grid">
                {(hasPermission('users.view_all') || isPresident) && (
                    <>
                        <StatWidget
                            label="إجمالي الأعضاء"
                            value={stats?.total_members || 0}
                            icon="👥"
                        />
                        <StatWidget
                            label="الأعضاء النشطين"
                            value={stats?.active_members || 0}
                            icon="⚡"
                        />
                    </>
                )}
                {(hasPermission('memberships.view_all') || isPresident) && (
                    <StatWidget
                        label="اشتراكات سارية"
                        value={stats?.members_with_membership || 0}
                        icon="⭐"
                    />
                )}
                {(hasPermission('finance.view') || isPresident) && (
                    <StatWidget
                        label="إيرادات الشهر"
                        value={stats?.monthly_income || 0}
                        icon="💰"
                        suffix="₺"
                    />
                )}
            </div>

            {/* Dashboard Columns (Activities & Requests) */}
            <div className="dashboard-columns">
                {/* Upcoming Activities */}
                {(hasPermission('activities.view') || isPresident) && (
                    <div className="data-card">
                        <div className="body" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div className="card-header">
                                <h3>📅 الأنشطة القادمة</h3>
                                <button onClick={() => navigate('/activities')} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '13px', cursor: 'pointer' }}>عرض الكل</button>
                            </div>

                            <div style={{ flex: 1 }}>
                                {isLoading ? <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>جاري التحميل...</p> : (
                                    data?.upcoming_activities?.length ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {data.upcoming_activities.slice(0, 3).map((act: any) => (
                                                <div key={act.id} onClick={() => navigate(`/activities/${act.id}`)} style={{ display: 'flex', gap: '16px', padding: '12px', border: '1px solid #f1f5f9', borderRadius: '12px', alignItems: 'center', cursor: 'pointer', transition: 'background 0.2s', background: '#f8fafc' }}>
                                                    <div style={{ width: '40px', height: '40px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                                                        <div style={{ fontWeight: 700, fontSize: '14px', lineHeight: 1 }}>{new Date(act.activity_date).getDate()}</div>
                                                        <div style={{ fontSize: '9px', textTransform: 'uppercase' }}>{new Date(act.activity_date).toLocaleDateString('ar-EG', { month: 'short' })}</div>
                                                    </div>
                                                    <div>
                                                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>{act.title_ar}</h4>
                                                        <div style={{ fontSize: '12px', color: '#64748b' }}>📍 {act.location || 'غير محدد'}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
                                            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📅</div>
                                            <span style={{ fontSize: '13px' }}>لا توجد أنشطة قادمة</span>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Membership Requests */}
                {(hasPermission('memberships.view_all') || hasPermission('users.view_all') || isPresident) && (
                    <div className="data-card">
                        <div className="body" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div className="card-header">
                                <h3>⏳ طلبات العضوية</h3>
                            </div>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {isLoading ? <p style={{ textAlign: 'center', color: '#94a3b8' }}>جاري التحميل...</p> : (
                                    stats?.pending_members ? (
                                        <div style={{ textAlign: 'center', padding: '16px' }}>
                                            <div style={{ position: 'relative', width: '64px', height: '64px', margin: '0 auto 16px', background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <span style={{ fontSize: '24px' }}>👤</span>
                                                <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#dc2626', color: 'white', fontSize: '12px', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                                                    {stats.pending_members}
                                                </span>
                                            </div>
                                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>{stats.pending_members} طلب معلق</h3>
                                            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>يوجد طلبات عضوية جديدة بانتظار الموافقة</p>
                                            <button className="btn" style={{ background: 'var(--color-primary)', color: 'white' }} onClick={() => navigate('/users?status=pending')}>
                                                مراجعة الطلبات
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '24px' }}>
                                            <div style={{ width: '64px', height: '64px', margin: '0 auto 16px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <span style={{ fontSize: '24px' }}>✅</span>
                                            </div>
                                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>لا توجد طلبات معلقة</h3>
                                            <p style={{ fontSize: '12px', color: '#64748b' }}>جميع طلبات العضوية تمت مراجعتها</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Recent Notifications Section */}
            <div className="data-card" style={{ marginTop: '24px' }}>
                <div className="body" style={{ padding: '24px' }}>
                    <div className="card-header" style={{ marginBottom: '20px' }}>
                        <h3>🔔 الإشعارات الأخيرة</h3>
                        <button
                            onClick={() => navigate('/notifications')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#64748b',
                                fontSize: '13px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            عرض الكل
                            {data?.recent_notifications?.filter((n: any) => !n.is_read).length ? (
                                <span style={{
                                    background: '#dc2626',
                                    color: 'white',
                                    fontSize: '10px',
                                    padding: '2px 6px',
                                    borderRadius: '10px',
                                    fontWeight: 700
                                }}>
                                    {data?.recent_notifications?.filter((n: any) => !n.is_read).length}
                                </span>
                            ) : null}
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {isLoading ? (
                            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>جاري التحميل...</p>
                        ) : data?.recent_notifications?.length ? (
                            data?.recent_notifications?.slice(0, 5).map((notif: any) => (
                                <div
                                    key={notif.id}
                                    onClick={() => {
                                        if (notif.action_url) {
                                            navigate(notif.action_url);
                                        }
                                    }}
                                    style={{
                                        display: 'flex',
                                        gap: '12px',
                                        padding: '16px',
                                        border: notif.is_read ? '1px solid #f1f5f9' : '2px solid #3b82f6',
                                        borderRadius: '12px',
                                        background: notif.is_read ? '#f8fafc' : '#eff6ff',
                                        cursor: notif.action_url ? 'pointer' : 'default',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (notif.action_url) {
                                            e.currentTarget.style.background = notif.is_read ? '#f1f5f9' : '#dbeafe';
                                            e.currentTarget.style.transform = 'translateX(-2px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = notif.is_read ? '#f8fafc' : '#eff6ff';
                                        e.currentTarget.style.transform = 'translateX(0)';
                                    }}
                                >
                                    {/* Notification Icon */}
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        background: notif.type === 'error' ? '#fef2f2' :
                                            notif.type === 'warning' ? '#fefce8' :
                                                notif.type === 'success' ? '#f0fdf4' : '#eff6ff',
                                        border: `1px solid ${notif.type === 'error' ? '#fee2e2' :
                                            notif.type === 'warning' ? '#fef08a' :
                                                notif.type === 'success' ? '#bbf7d0' : '#bfdbfe'
                                            }`,
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px',
                                        flexShrink: 0
                                    }}>
                                        {notif.type === 'error' ? '🔴' :
                                            notif.type === 'warning' ? '⚠️' :
                                                notif.type === 'success' ? '✅' : '🔔'}
                                    </div>

                                    {/* Notification Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'start',
                                            justifyContent: 'space-between',
                                            gap: '8px',
                                            marginBottom: '4px'
                                        }}>
                                            <h4 style={{
                                                fontSize: '14px',
                                                fontWeight: 700,
                                                color: '#1e293b',
                                                margin: 0
                                            }}>
                                                {notif.title}
                                            </h4>
                                            {!notif.is_read && (
                                                <span style={{
                                                    background: '#3b82f6',
                                                    color: 'white',
                                                    fontSize: '9px',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    fontWeight: 700,
                                                    flexShrink: 0
                                                }}>
                                                    جديد
                                                </span>
                                            )}
                                        </div>
                                        <p style={{
                                            fontSize: '13px',
                                            color: '#64748b',
                                            margin: '0 0 8px 0',
                                            whiteSpace: 'pre-line',
                                            lineHeight: 1.5
                                        }}>
                                            {notif.message}
                                        </p>
                                        <div style={{
                                            fontSize: '11px',
                                            color: '#94a3b8',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <span>🕐</span>
                                            <span>
                                                {new Date(notif.created_at).toLocaleDateString('ar-EG', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: '32px',
                                color: '#94a3b8',
                                background: '#f8fafc',
                                borderRadius: '12px',
                                border: '1px dashed #e2e8f0'
                            }}>
                                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔕</div>
                                <span style={{ fontSize: '14px', fontWeight: 500 }}>لا توجد إشعارات جديدة</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Support Tickets Section - New Dedicated Section */}
            {(hasPermission('support.view_all') || isPresident) && (
                <div className="data-card" style={{ marginTop: '24px', border: '2px solid #f59e0b' }}>
                    <div className="body" style={{ padding: '24px' }}>
                        <div className="card-header" style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3>📨 تذاكر الدعم من الأعضاء</h3>
                                {data?.recent_support_tickets?.length ? (
                                    <span style={{
                                        background: '#dc2626',
                                        color: 'white',
                                        fontSize: '11px',
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        fontWeight: 700
                                    }}>
                                        {data?.recent_support_tickets?.length} جديد
                                    </span>
                                ) : null}
                            </div>
                            <button
                                onClick={() => navigate('/support')}
                                style={{
                                    background: '#f59e0b',
                                    color: 'white',
                                    border: 'none',
                                    fontSize: '13px',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                عرض جميع التذاكر
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
                            {isLoading ? (
                                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>جاري التحميل...</p>
                            ) : data?.recent_support_tickets?.length ? (
                                data?.recent_support_tickets?.map((ticket: any) => (
                                    <div
                                        key={ticket.id}
                                        onClick={() => navigate(`/support/tickets/${ticket.ticket_number}`)}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                            padding: '20px',
                                            border: '2px solid',
                                            borderColor: ticket.priority === 'urgent' ? '#dc2626' :
                                                ticket.priority === 'high' ? '#f59e0b' :
                                                    '#3b82f6',
                                            borderRadius: '16px',
                                            background: ticket.priority === 'urgent' ? '#fef2f2' :
                                                ticket.priority === 'high' ? '#fffbeb' : '#eff6ff',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            position: 'relative'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        {/* Priority Badge */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '12px',
                                            left: '12px',
                                            background: ticket.priority === 'urgent' ? '#dc2626' :
                                                ticket.priority === 'high' ? '#f59e0b' : '#3b82f6',
                                            color: 'white',
                                            fontSize: '10px',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontWeight: 700
                                        }}>
                                            {ticket.priority === 'urgent' ? '🔴 عاجل' :
                                                ticket.priority === 'high' ? '⚠️ عالي' : '🔵 متوسط'}
                                        </div>

                                        {/* Content */}
                                        <div style={{ marginTop: '24px', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                                            {ticket.ticket_number}
                                        </div>
                                        <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                                            {ticket.subject}
                                        </h4>
                                        <p style={{ fontSize: '13px', color: '#64748b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                            {ticket.message}
                                        </p>

                                        {ticket.attachment_url && (
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#3b82f6', background: '#eff6ff', padding: '4px 8px', borderRadius: '6px', width: 'fit-content' }}>
                                                <span>📎</span><span>مرفق</span>
                                            </div>
                                        )}

                                        <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: 700 }}>
                                                    {ticket.member_name?.charAt(0) || '👤'}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{ticket.member_name}</div>
                                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{ticket.member_id || 'لا يوجد'}</div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'left', fontSize: '11px', color: '#94a3b8' }}>
                                                {new Date(ticket.created_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>لا توجد تذاكر مفتوحة</h3>
                                    <p style={{ fontSize: '14px', color: '#94a3b8' }}>جميع التذاكر تم حلها</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div>
                <h3 className="section-title">✨ وصول سريع</h3>
                <div className="stats-grid">
                    {(hasPermission('users.create') || isPresident) && (
                        <QuickActionBtn title="عضو جديد" icon="👤" onClick={() => navigate('/users/create')} />
                    )}
                    {(hasPermission('memberships.create') || isPresident) && (
                        <QuickActionBtn title="اشتراك جديد" icon="💳" onClick={() => navigate('/memberships/create')} />
                    )}
                    {(hasPermission('activities.create') || isPresident) && (
                        <QuickActionBtn title="نشاط جديد" icon="🎉" onClick={() => navigate('/activities/create')} />
                    )}
                    {(hasPermission('reports.view') || isPresident) && (
                        <QuickActionBtn title="التقارير" icon="📊" onClick={() => navigate('/reports')} />
                    )}
                </div>
            </div>
        </div >
    );
}
