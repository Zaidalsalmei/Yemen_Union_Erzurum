import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { memberDashboardService } from '../../services/memberDashboardService';
import {
    StatusBanner,
    KpiCard,
    QuickActions,
    SubscriptionCard,
    UpcomingActivitiesList,
    PostsList,
    NotificationsSupport,
    FirstLoginModal
} from '../../components/dashboard';
import {
    SkeletonLoader as Skeleton,
} from '../../components/common';
import type { MemberDashboardData, MemberProfileUpdate } from '../../types';

export function MemberDashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<MemberDashboardData | null>(null);
    const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);

    useEffect(() => {
        loadDashboardData(true);

        const interval = setInterval(() => {
            loadDashboardData(false);
        }, 60000); // Refresh every 60 seconds

        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            const data = await memberDashboardService.getDashboardData() as any;

            const mappedData: MemberDashboardData = {
                member: {
                    id: data.user.id,
                    full_name: data.user.full_name,
                    phone_number: data.user.phone_number,
                    email: data.user.email,
                    profile_photo: data.user.profile_photo,
                    member_id: data.membership?.id ? `MEM-${data.membership.id}` : '----',
                    branch: data.user.university || 'غير محدد',
                    join_date: data.user.created_at,
                    last_login_at: data.user.last_login_at || new Date().toISOString(),
                    account_status: data.user.status,
                    university: data.user.university,
                    faculty: data.user.faculty,
                },
                kpis: {
                    subscription_status: data.membership ? (data.membership.status === 'active' ? 'paid' : 'pending') : 'unpaid',
                    subscription_expiry: data.membership?.end_date || null,
                    days_remaining: data.membership?.days_remaining ?? null,
                    upcoming_activities_count: data.stats.upcoming_activities,
                    unread_notifications_count: data.stats.unread_notifications,
                    new_posts_count: data.stats.new_posts,
                    missing_documents_count: data.stats.missing_documents,
                },
                subscription: data.membership ? {
                    id: data.membership.id,
                    status: data.membership.status,
                    start_date: data.membership.start_date,
                    end_date: data.membership.end_date,
                    package_name: data.membership.package_name || 'باقة عضوية',
                    amount: data.membership.amount,
                    currency: data.membership.currency || 'TRY',
                    is_paid: data.membership.status === 'active',
                    days_until_expiry: data.membership.days_remaining,
                } : {
                    id: 0,
                    status: 'expired',
                    start_date: '',
                    end_date: '',
                    package_name: 'لا يوجد اشتراك',
                    amount: 0,
                    currency: 'TRY',
                    is_paid: false,
                    days_until_expiry: 0
                },
                upcomingActivities: data.upcoming_activities || [],
                recentPosts: data.recent_posts || [],
                notifications: data.recent_notifications || [],
                isFirstLogin: !data.user.university,
            };

            setDashboardData(mappedData);

            if (showLoading) {
                toast.success(`مرحبًا بعودتك، ${mappedData.member.full_name} 👋`, {
                    duration: 4000,
                    position: 'top-center',
                });

                if (mappedData.isFirstLogin) {
                    setShowFirstLoginModal(true);
                }
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            if (showLoading) toast.error('حدث خطأ في تحميل بيانات لوحة التحكم');
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const handleFirstLoginComplete = async (data: MemberProfileUpdate) => {
        try {
            await memberDashboardService.updateProfile(data);
            toast.success('تم تحديث معلوماتك بنجاح!');
            setShowFirstLoginModal(false);
            loadDashboardData(true);
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('حدث خطأ في تحديث المعلومات');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
        toast.success('تم تسجيل الخروج بنجاح');
    };

    const handleLogoutAllDevices = async () => {
        if (confirm('هل أنت متأكد من تسجيل الخروج من جميع الأجهزة؟')) {
            try {
                await memberDashboardService.logoutAllDevices();
                await logout();
                navigate('/login');
                toast.success('تم تسجيل الخروج من جميع الأجهزة');
            } catch (error) {
                console.error('Error logging out from all devices:', error);
                toast.error('حدث خطأ في تسجيل الخروج');
            }
        }
    };

    if (loading) {
        return (
            <div className="member-dashboard p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    <Skeleton height="200px" borderRadius="24px" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Skeleton height="120px" borderRadius="16px" />
                        <Skeleton height="120px" borderRadius="16px" />
                        <Skeleton height="120px" borderRadius="16px" />
                        <Skeleton height="120px" borderRadius="16px" />
                    </div>
                    <Skeleton height="300px" borderRadius="24px" />
                    <Skeleton height="300px" borderRadius="24px" />
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="text-4xl text-red-500">⚠️</div>
                <h2 className="text-xl font-black text-gray-800">خطأ في تحميل البيانات</h2>
                <button
                    onClick={() => loadDashboardData(true)}
                    className="px-6 py-2 bg-[#DC2626] text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    const { member, kpis, subscription, upcomingActivities, recentPosts, notifications } = dashboardData;

    return (
        <>
            <div className="member-dashboard pb-20">
                <div className="member-dashboard__container">
                    {/* Last Login Info */}
                    <div className="last-login-info">
                        آخر تسجيل دخول: {new Date(member.last_login_at || '').toLocaleString('ar-EG')}
                    </div>

                    {/* Status Banner */}
                    <StatusBanner
                        status={member.account_status as any}
                        suspensionReason={member.suspension_reason}
                        daysRemaining={kpis.days_remaining}
                    />

                    {/* Header Identity */}
                    <div className="member-identity-header">
                        <div className="member-identity__avatar">
                            {member.profile_photo ? (
                                <img src={member.profile_photo} alt={member.full_name} />
                            ) : (
                                <div className="member-identity__avatar-placeholder">
                                    {member.full_name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="member-identity__info">
                            <h1 className="member-identity__name">{member.full_name}</h1>
                            <div className="member-identity__meta">
                                <span>🆔 {member.member_id}</span>
                                <span>•</span>
                                <span>🏛️ {member.university || member.branch}</span>
                                <span>•</span>
                                <span>📅 انضم: {new Date(member.join_date || '').getFullYear()}</span>
                            </div>
                        </div>
                        <div className="member-identity__actions">
                            <button
                                className="identity-btn identity-btn--primary"
                                onClick={() => navigate('/membership/card')}
                            >
                                💳 بطاقة العضوية
                            </button>
                            <button
                                className="identity-btn identity-btn--secondary"
                                onClick={handleLogout}
                            >
                                🚪 خروج
                            </button>
                            <button
                                className="identity-btn identity-btn--ghost"
                                onClick={handleLogoutAllDevices}
                                title="تسجيل خروج من كل الأجهزة"
                            >
                                🔒
                            </button>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="kpi-grid">
                        <KpiCard
                            icon="💰"
                            label="حالة الاشتراك"
                            value={kpis.subscription_status === 'paid' ? 'مدفوع' : 'غير مدفوع'}
                            status={kpis.subscription_status === 'paid' ? 'success' : 'danger'}
                        />
                        <KpiCard
                            icon="📅"
                            label="انتهاء الاشتراك"
                            value={kpis.subscription_expiry ? new Date(kpis.subscription_expiry).toLocaleDateString('ar-EG') : 'غير محدد'}
                            subtitle={kpis.days_remaining !== null ? `${kpis.days_remaining} يوم متبقي` : undefined}
                            status={kpis.days_remaining !== null && kpis.days_remaining <= 30 ? 'warning' : 'default'}
                        />
                        <KpiCard
                            icon="🎫"
                            label="الأنشطة القادمة"
                            value={kpis.upcoming_activities_count}
                            onClick={() => navigate('/member/activities')}
                        />
                        <KpiCard
                            icon="🔔"
                            label="إشعارات جديدة"
                            value={kpis.unread_notifications_count}
                            status={kpis.unread_notifications_count > 0 ? 'warning' : 'default'}
                            onClick={() => navigate('/notifications')}
                        />
                        <KpiCard
                            icon="📰"
                            label="منشورات جديدة"
                            value={kpis.new_posts_count}
                            onClick={() => navigate('/posts')}
                        />
                        <KpiCard
                            icon="📄"
                            label="نواقص"
                            value={kpis.missing_documents_count}
                            status={kpis.missing_documents_count > 0 ? 'danger' : 'success'}
                        />
                    </div>

                    {/* Quick Actions */}
                    <QuickActions
                        isExpired={subscription.status === 'expired' || (subscription.status as string) === 'pending'}
                        pendingApproval={(member.account_status as string) === 'pending' || (member.account_status as string) === 'pending_approval'}
                        whatsappEnabled={true}
                        whatsappNumber="966563949102"
                    />

                    {/* Subscription Section */}
                    <SubscriptionCard
                        subscription={subscription}
                        onViewHistory={() => navigate('/payments/history')}
                        onUploadProof={() => navigate('/memberships/renew')}
                    />

                    {/* Activities Section */}
                    <UpcomingActivitiesList
                        activities={upcomingActivities}
                        onViewAll={() => navigate('/member/activities')}
                    />

                    {/* Posts Section */}
                    <PostsList
                        posts={recentPosts}
                        onViewAll={() => navigate('/posts')}
                    />

                    {/* Notifications + Support + FAQ */}
                    <NotificationsSupport
                        notifications={notifications}
                        faqs={[
                            { id: 1, question: 'كيف أجدد اشتراكي؟', answer: 'يمكنك تجديد اشتراكك من خلال الذهاب إلى قسم "تجديد الاشتراك" ورفع إثبات الدفع.', category: 'subscription' },
                            { id: 2, question: 'كيف أسجل في نشاط؟', answer: 'انتقل إلى قسم الأنشطة واختر النشاط المطلوب ثم اضغط على "تسجيل".', category: 'activities' },
                            { id: 3, question: 'كيف أحدّث بياناتي الشخصية؟', answer: 'يمكنك تحديث بياناتك من خلال الإعدادات > تحديث البيانات.', category: 'profile' },
                        ]}
                        onViewAllNotifications={() => navigate('/notifications')}
                    />

                    {/* Footer */}
                    <div className="member-dashboard__footer">
                        <p>اتحاد الطلاب اليمنيين - أرضروم، تركيا</p>
                        <p className="version">نسخة النظام: v2.0.0</p>
                    </div>
                </div>
            </div>

            {/* First Login Modal */}
            <FirstLoginModal
                isOpen={showFirstLoginModal}
                onComplete={handleFirstLoginComplete}
                initialData={{
                    full_name: member.full_name,
                    city: member.city,
                    university: member.university,
                    faculty: member.faculty,
                    email: member.email,
                }}
            />

            <style>{`
                .member-dashboard {
                    min-height: 100vh;
                    padding: 24px;
                }

                .member-dashboard__container {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .last-login-info {
                    text-align: center;
                    font-size: 11px;
                    color: #999;
                    margin-bottom: 20px;
                    font-weight: 800;
                }

                .member-identity-header {
                    background: linear-gradient(135deg, #DC2626 0%, #8A0000 100%);
                    color: white;
                    border-radius: 32px;
                    padding: 32px;
                    margin-bottom: 32px;
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    box-shadow: 0 20px 40px -10px rgba(220, 38, 38, 0.3);
                    position: relative;
                    overflow: hidden;
                }

                .member-identity-header::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 60%);
                    pointer-events: none;
                }

                .member-identity__avatar {
                    width: 90px;
                    height: 90px;
                    border-radius: 28px;
                    overflow: hidden;
                    flex-shrink: 0;
                    border: 4px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
                }

                .member-identity__avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .member-identity__avatar-placeholder {
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 255, 255, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px;
                    font-weight: 900;
                    color: white;
                }

                .member-identity__info {
                    flex: 1;
                    z-index: 1;
                }

                .member-identity__name {
                    font-size: 24px;
                    font-weight: 900;
                    margin: 0 0 6px;
                    letter-spacing: -0.5px;
                }

                .member-identity__meta {
                    font-size: 13px;
                    font-weight: 700;
                    opacity: 0.8;
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .member-identity__actions {
                    display: flex;
                    gap: 10px;
                    z-index: 1;
                }

                .identity-btn {
                    padding: 10px 18px;
                    border-radius: 16px;
                    font-weight: 800;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: none;
                }

                .identity-btn--primary {
                    background: white;
                    color: #DC2626;
                }

                .identity-btn--primary:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                }

                .identity-btn--secondary {
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(10px);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }

                .identity-btn--secondary:hover {
                    background: rgba(255, 255, 255, 0.25);
                }

                .identity-btn--ghost {
                    background: rgba(0, 0, 0, 0.2);
                    color: white;
                    width: 42px;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                }

                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 32px;
                }

                .member-dashboard__footer {
                    text-align: center;
                    padding: 40px 20px;
                    border-top: 2px solid #F3F4F6;
                    color: #999;
                    margin-top: 48px;
                }

                .member-dashboard__footer p {
                    margin: 4px 0;
                    font-size: 13px;
                    font-weight: 700;
                }

                @media (max-width: 768px) {
                    .member-dashboard {
                        padding: 16px;
                    }

                    .member-identity-header {
                        flex-direction: column;
                        text-align: center;
                        padding: 24px;
                        border-radius: 24px;
                    }

                    .member-identity__meta {
                        justify-content: center;
                    }

                    .member-identity__actions {
                        flex-direction: column;
                        width: 100%;
                    }

                    .identity-btn {
                        width: 100%;
                    }
                }
            `}</style>
        </>
    );
}
