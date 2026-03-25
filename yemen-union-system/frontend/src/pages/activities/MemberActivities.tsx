import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Activity {
    id: number;
    title: string;
    description: string;
    type: 'educational' | 'social' | 'sports' | 'cultural' | 'volunteer' | 'trip';
    date: string;
    time: string;
    location: string;
    capacity: number;
    registered: number;
    registrationDeadline: string;
    fee: number;
    isRegistered: boolean;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    image?: string;
}

export function MemberActivities() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | Activity['type']>('all');
    const [view, setView] = useState<'upcoming' | 'registered' | 'past'>('upcoming');

    // Mock activities data - replace with API call
    const allActivities: Activity[] = [
        {
            id: 1,
            title: 'ورشة عمل: البرمجة بلغة Python',
            description: 'ورشة عمل تدريبية للمبتدئين في لغة البرمجة Python مع تطبيقات عملية',
            type: 'educational',
            date: '2025-12-20',
            time: '14:00',
            location: 'قاعة المؤتمرات - الطابق الثاني',
            capacity: 30,
            registered: 18,
            registrationDeadline: '2025-12-18',
            fee: 0,
            isRegistered: false,
            status: 'upcoming',
        },
        {
            id: 2,
            title: 'رحلة إلى بحيرة تورتوم',
            description: 'رحلة ترفيهية لأعضاء الاتحاد إلى بحيرة تورتوم الشهيرة',
            type: 'trip',
            date: '2025-12-22',
            time: '08:00',
            location: 'نقطة التجمع: مقر الاتحاد',
            capacity: 50,
            registered: 42,
            registrationDeadline: '2025-12-19',
            fee: 100,
            isRegistered: true,
            status: 'upcoming',
        },
        {
            id: 3,
            title: 'دوري كرة القدم الشتوي',
            description: 'بطولة كرة قدم بين أعضاء الاتحاد - التسجيل للفرق',
            type: 'sports',
            date: '2025-12-25',
            time: '16:00',
            location: 'ملعب الجامعة الرياضي',
            capacity: 80,
            registered: 56,
            registrationDeadline: '2025-12-23',
            fee: 50,
            isRegistered: false,
            status: 'upcoming',
        },
        {
            id: 4,
            title: 'أمسية ثقافية: الشعر اليمني',
            description: 'أمسية شعرية مع نخبة من الشعراء اليمنيين',
            type: 'cultural',
            date: '2025-12-28',
            time: '19:00',
            location: 'القاعة الكبرى',
            capacity: 100,
            registered: 67,
            registrationDeadline: '2025-12-26',
            fee: 0,
            isRegistered: true,
            status: 'upcoming',
        },
        {
            id: 5,
            title: 'حملة تطوعية: مساعدة العوائل المحتاجة',
            description: 'حملة خيرية لمساعدة العوائل اليمنية المحتاجة في أرضروم',
            type: 'volunteer',
            date: '2025-12-30',
            time: '10:00',
            location: 'مقر الاتحاد',
            capacity: 40,
            registered: 28,
            registrationDeadline: '2025-12-28',
            fee: 0,
            isRegistered: false,
            status: 'upcoming',
        },
        {
            id: 6,
            title: 'لقاء تعارف الأعضاء الجدد',
            description: 'لقاء اجتماعي للترحيب بالأعضاء الجدد',
            type: 'social',
            date: '2025-12-15',
            time: '18:00',
            location: 'مقهى الاتحاد',
            capacity: 60,
            registered: 60,
            registrationDeadline: '2025-12-14',
            fee: 0,
            isRegistered: true,
            status: 'completed',
        },
    ];

    const activityTypes = [
        { value: 'all', label: 'الكل', icon: '📋', color: '#6B7280' },
        { value: 'educational', label: 'تعليمي', icon: '📚', color: '#3B82F6' },
        { value: 'social', label: 'اجتماعي', icon: '🤝', color: '#10B981' },
        { value: 'sports', label: 'رياضي', icon: '⚽', color: '#F59E0B' },
        { value: 'cultural', label: 'ثقافي', icon: '🎭', color: '#8B5CF6' },
        { value: 'volunteer', label: 'تطوعي', icon: '❤️', color: '#EF4444' },
        { value: 'trip', label: 'رحلة', icon: '🚌', color: '#06B6D4' },
    ];

    const getFilteredActivities = () => {
        let filtered = allActivities;

        // Filter by type
        if (filter !== 'all') {
            filtered = filtered.filter(a => a.type === filter);
        }

        // Filter by view
        if (view === 'upcoming') {
            filtered = filtered.filter(a => a.status === 'upcoming');
        } else if (view === 'registered') {
            filtered = filtered.filter(a => a.isRegistered);
        } else if (view === 'past') {
            filtered = filtered.filter(a => a.status === 'completed');
        }

        return filtered;
    };

    const handleRegister = async (activityId: number) => {
        setLoading(true);
        try {
            // In real app, call API
            // await activitiesService.register(activityId);

            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('تم التسجيل في النشاط بنجاح!');

            // Update local state (in real app, refetch data)
        } catch (error) {
            console.error('Registration error:', error);
            toast.error('حدث خطأ في التسجيل. يرجى المحاولة مرة أخرى');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRegistration = async (activityId: number) => {
        setLoading(true);
        try {
            // In real app, call API
            // await activitiesService.cancelRegistration(activityId);

            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('تم إلغاء التسجيل بنجاح');

            // Update local state (in real app, refetch data)
        } catch (error) {
            console.error('Cancellation error:', error);
            toast.error('حدث خطأ في إلغاء التسجيل');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/');
    };

    const getTypeInfo = (type: Activity['type']) => {
        return activityTypes.find(t => t.value === type) || activityTypes[0];
    };

    const getCapacityPercentage = (registered: number, capacity: number) => {
        return (registered / capacity) * 100;
    };

    const isRegistrationOpen = (deadline: string) => {
        return new Date(deadline) > new Date();
    };

    const filteredActivities = getFilteredActivities();

    return (
        <>
            <div className="member-activities-page">
                {/* Page Header */}
                <div className="page-header">
                    <div className="header-content">
                        <div>
                            <h1 className="page-title">🎫 الأنشطة والفعاليات</h1>
                            <p className="page-subtitle">تصفح الأنشطة وسجل مشاركتك</p>
                        </div>
                        <button className="back-btn" onClick={handleBack}>
                            العودة للوحة التحكم
                        </button>
                    </div>
                </div>

                <div className="content-wrapper">
                    {/* View Tabs */}
                    <div className="view-tabs">
                        <button
                            className={`view-tab ${view === 'upcoming' ? 'view-tab--active' : ''}`}
                            onClick={() => setView('upcoming')}
                        >
                            📅 القادمة
                        </button>
                        <button
                            className={`view-tab ${view === 'registered' ? 'view-tab--active' : ''}`}
                            onClick={() => setView('registered')}
                        >
                            ✓ المسجل فيها
                        </button>
                        <button
                            className={`view-tab ${view === 'past' ? 'view-tab--active' : ''}`}
                            onClick={() => setView('past')}
                        >
                            📜 السابقة
                        </button>
                    </div>

                    {/* Type Filters */}
                    <div className="type-filters">
                        {activityTypes.map((type) => (
                            <button
                                key={type.value}
                                className={`type-filter ${filter === type.value ? 'type-filter--active' : ''}`}
                                onClick={() => setFilter(type.value as any)}
                                style={{
                                    borderColor: filter === type.value ? type.color : '#E0E0E0',
                                    color: filter === type.value ? type.color : '#666',
                                }}
                            >
                                <span className="filter-icon">{type.icon}</span>
                                <span className="filter-label">{type.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Activities Grid */}
                    {filteredActivities.length > 0 ? (
                        <div className="activities-grid">
                            {filteredActivities.map((activity) => {
                                const typeInfo = getTypeInfo(activity.type);
                                const capacityPercentage = getCapacityPercentage(activity.registered, activity.capacity);
                                const registrationOpen = isRegistrationOpen(activity.registrationDeadline);
                                const isFull = activity.registered >= activity.capacity;

                                return (
                                    <div key={activity.id} className="activity-card">
                                        {/* Card Header */}
                                        <div className="activity-card__header">
                                            <div
                                                className="activity-type-badge"
                                                style={{ backgroundColor: typeInfo.color }}
                                            >
                                                {typeInfo.icon} {typeInfo.label}
                                            </div>
                                            {activity.isRegistered && (
                                                <div className="registered-badge">
                                                    ✓ مسجل
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Body */}
                                        <div className="activity-card__body">
                                            <h3 className="activity-title">{activity.title}</h3>
                                            <p className="activity-description">{activity.description}</p>

                                            <div className="activity-details">
                                                <div className="detail-item">
                                                    <span className="detail-icon">📅</span>
                                                    <span className="detail-text">
                                                        {new Date(activity.date).toLocaleDateString('ar-EG', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-icon">⏰</span>
                                                    <span className="detail-text">{activity.time}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-icon">📍</span>
                                                    <span className="detail-text">{activity.location}</span>
                                                </div>
                                                {activity.fee > 0 && (
                                                    <div className="detail-item">
                                                        <span className="detail-icon">💰</span>
                                                        <span className="detail-text">{activity.fee} TRY</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Capacity Bar */}
                                            <div className="capacity-section">
                                                <div className="capacity-info">
                                                    <span>المسجلين: {activity.registered}/{activity.capacity}</span>
                                                    <span className={isFull ? 'capacity-full' : ''}>
                                                        {isFull ? 'مكتمل' : `${activity.capacity - activity.registered} مقعد متبقي`}
                                                    </span>
                                                </div>
                                                <div className="capacity-bar">
                                                    <div
                                                        className="capacity-fill"
                                                        style={{
                                                            width: `${capacityPercentage}%`,
                                                            backgroundColor: capacityPercentage >= 90 ? '#EF4444' : capacityPercentage >= 70 ? '#F59E0B' : '#10B981',
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Registration Deadline */}
                                            {!activity.isRegistered && registrationOpen && (
                                                <div className="deadline-notice">
                                                    ⏳ آخر موعد للتسجيل: {new Date(activity.registrationDeadline).toLocaleDateString('ar-EG')}
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Footer */}
                                        <div className="activity-card__footer">
                                            {activity.status === 'upcoming' && (
                                                <>
                                                    {activity.isRegistered ? (
                                                        <button
                                                            className="action-btn action-btn--cancel"
                                                            onClick={() => handleCancelRegistration(activity.id)}
                                                            disabled={loading}
                                                        >
                                                            إلغاء التسجيل
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="action-btn action-btn--register"
                                                            onClick={() => handleRegister(activity.id)}
                                                            disabled={loading || isFull || !registrationOpen}
                                                        >
                                                            {isFull ? 'مكتمل' : !registrationOpen ? 'انتهى التسجيل' : 'سجل الآن'}
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                            {activity.status === 'completed' && (
                                                <div className="completed-badge">
                                                    ✓ تم الانتهاء
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">📭</div>
                            <h3>لا توجد أنشطة</h3>
                            <p>
                                {view === 'upcoming' && 'لا توجد أنشطة قادمة في الوقت الحالي'}
                                {view === 'registered' && 'لم تسجل في أي نشاط بعد'}
                                {view === 'past' && 'لا توجد أنشطة سابقة'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .member-activities-page {
                    min-height: 100vh;
                    padding: 24px;
                    background: linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%);
                }

                .page-header {
                    max-width: 1400px;
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
                }

                .page-subtitle {
                    font-size: 14px;
                    color: #666;
                    margin: 0;
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
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .view-tabs {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 24px;
                }

                .view-tab {
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

                .view-tab:hover {
                    border-color: #D60000;
                    color: #D60000;
                }

                .view-tab--active {
                    background: linear-gradient(135deg, #D60000 0%, #8A0000 100%);
                    color: white;
                    border-color: #D60000;
                }

                .type-filters {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 32px;
                    flex-wrap: wrap;
                }

                .type-filter {
                    padding: 12px 20px;
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

                .filter-label {
                    font-size: 14px;
                }

                .activities-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 24px;
                }

                .activity-card {
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                }

                .activity-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
                }

                .activity-card__header {
                    padding: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 2px solid #F5F5F5;
                }

                .activity-type-badge {
                    padding: 6px 16px;
                    border-radius: 20px;
                    color: white;
                    font-size: 13px;
                    font-weight: 700;
                }

                .registered-badge {
                    padding: 6px 16px;
                    background: #DCFCE7;
                    color: #16A34A;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 700;
                }

                .activity-card__body {
                    padding: 20px;
                    flex: 1;
                }

                .activity-title {
                    font-size: 18px;
                    font-weight: 800;
                    color: #000;
                    margin: 0 0 12px;
                }

                .activity-description {
                    font-size: 14px;
                    color: #666;
                    line-height: 1.6;
                    margin: 0 0 20px;
                }

                .activity-details {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .detail-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 14px;
                    color: #333;
                }

                .detail-icon {
                    font-size: 18px;
                    flex-shrink: 0;
                }

                .detail-text {
                    flex: 1;
                }

                .capacity-section {
                    margin-bottom: 16px;
                }

                .capacity-info {
                    display: flex;
                    justify-content: space-between;
                    font-size: 13px;
                    color: #666;
                    margin-bottom: 8px;
                    font-weight: 600;
                }

                .capacity-full {
                    color: #EF4444;
                    font-weight: 700;
                }

                .capacity-bar {
                    height: 8px;
                    background: #E0E0E0;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .capacity-fill {
                    height: 100%;
                    transition: width 0.3s ease;
                    border-radius: 4px;
                }

                .deadline-notice {
                    padding: 12px;
                    background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
                    border-radius: 8px;
                    font-size: 13px;
                    color: #92400E;
                    font-weight: 600;
                    text-align: center;
                }

                .activity-card__footer {
                    padding: 16px;
                    border-top: 2px solid #F5F5F5;
                }

                .action-btn {
                    width: 100%;
                    padding: 14px;
                    border-radius: 10px;
                    font-weight: 800;
                    font-size: 15px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: none;
                }

                .action-btn--register {
                    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                    color: white;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                }

                .action-btn--register:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
                }

                .action-btn--register:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .action-btn--cancel {
                    background: white;
                    color: #EF4444;
                    border: 2px solid #EF4444;
                }

                .action-btn--cancel:hover:not(:disabled) {
                    background: #FEE2E2;
                }

                .completed-badge {
                    text-align: center;
                    padding: 12px;
                    background: #F3F4F6;
                    color: #6B7280;
                    border-radius: 8px;
                    font-weight: 700;
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
                    .member-activities-page {
                        padding: 16px;
                    }

                    .header-content {
                        flex-direction: column;
                        gap: 16px;
                        padding: 20px;
                    }

                    .back-btn {
                        width: 100%;
                    }

                    .view-tabs {
                        flex-direction: column;
                    }

                    .type-filters {
                        justify-content: center;
                    }

                    .activities-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </>
    );
}
