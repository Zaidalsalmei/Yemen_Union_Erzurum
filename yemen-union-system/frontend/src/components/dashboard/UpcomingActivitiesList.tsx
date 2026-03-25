import { useNavigate } from 'react-router-dom';
import type { Activity } from '../../types';

interface UpcomingActivitiesListProps {
    activities: Activity[];
    onViewAll: () => void;
}

export function UpcomingActivitiesList({ activities, onViewAll }: UpcomingActivitiesListProps) {
    const navigate = useNavigate();

    const isToday = (dateString: string) => {
        const today = new Date().toDateString();
        const activityDate = new Date(dateString).toDateString();
        return today === activityDate;
    };

    const handleRegister = (activityId: number, isRegistered: boolean) => {
        // In a real app, this would call an API
        console.log(`${isRegistered ? 'Unregister from' : 'Register for'} activity ${activityId}`);
    };

    if (activities.length === 0) {
        return (
            <>
                <div className="activities-section">
                    <h2 className="activities-section__title">📅 الأنشطة القادمة</h2>
                    <div className="activities-empty">
                        <div className="activities-empty__icon">📭</div>
                        <div className="activities-empty__text">لا توجد أنشطة قادمة في الوقت الحالي</div>
                    </div>
                </div>
                {renderStyles()}
            </>
        );
    }

    return (
        <>
            <div className="activities-section">
                <h2 className="activities-section__title">📅 الأنشطة القادمة</h2>

                <div className="activities-list">
                    {activities.slice(0, 3).map((activity) => (
                        <div
                            key={activity.id}
                            className={`activity-item ${isToday(activity.activity_date) ? 'activity-item--today' : ''}`}
                        >
                            {isToday(activity.activity_date) && (
                                <div className="activity-item__today-badge">اليوم</div>
                            )}

                            <div className="activity-item__content">
                                <h3 className="activity-item__title">{activity.title_ar}</h3>

                                <div className="activity-item__meta">
                                    <span className="meta-item">
                                        📅 {new Date(activity.activity_date).toLocaleDateString('ar-EG')}
                                    </span>
                                    {activity.start_time && (
                                        <span className="meta-item">
                                            ⏰ {activity.start_time}
                                        </span>
                                    )}
                                    {activity.location_ar && (
                                        <span className="meta-item">
                                            📍 {activity.location_ar}
                                        </span>
                                    )}
                                </div>

                                {activity.description_ar && (
                                    <p className="activity-item__description">
                                        {activity.description_ar.substring(0, 100)}...
                                    </p>
                                )}

                                {activity.max_participants && (
                                    <div className="activity-item__capacity">
                                        <div className="capacity-bar">
                                            <div
                                                className="capacity-bar__fill"
                                                style={{
                                                    width: `${((activity.participant_count || 0) / activity.max_participants) * 100}%`
                                                }}
                                            />
                                        </div>
                                        <div className="capacity-text">
                                            {activity.participant_count || 0} / {activity.max_participants} مشارك
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="activity-item__actions">
                                <button
                                    className="activity-btn activity-btn--details"
                                    onClick={() => navigate(`/activities/${activity.id}`)}
                                >
                                    تفاصيل
                                </button>

                                {isToday(activity.activity_date) && (
                                    <button className="activity-btn activity-btn--checkin">
                                        سجّل حضورك
                                    </button>
                                )}

                                {activity.registration_required && (
                                    <button
                                        className={`activity-btn ${activity.is_registered ? 'activity-btn--unregister' : 'activity-btn--register'}`}
                                        onClick={() => handleRegister(activity.id, activity.is_registered || false)}
                                    >
                                        {activity.is_registered ? 'إلغاء التسجيل' : 'تسجيل'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <button className="activities-section__view-all" onClick={onViewAll}>
                    عرض كل الأنشطة →
                </button>
            </div>
            {renderStyles()}
        </>
    );
}

function renderStyles() {
    return (
        <style>{`
            .activities-section {
                background: white;
                border-radius: 20px;
                padding: 28px;
                margin-bottom: 32px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                border: 1px solid #E0E0E0;
            }

            .activities-section__title {
                font-size: 20px;
                font-weight: 700;
                color: #D60000;
                margin: 0 0 24px;
            }

            .activities-list {
                display: flex;
                flex-direction: column;
                gap: 20px;
                margin-bottom: 24px;
            }

            .activity-item {
                background: #F9FAFB;
                border: 1px solid #E5E7EB;
                border-radius: 16px;
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 20px;
                transition: all 0.3s ease;
                position: relative;
            }

            .activity-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
                border-color: #D60000;
            }

            .activity-item--today {
                background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
                border-color: #F59E0B;
                box-shadow: 0 0 20px rgba(245, 158, 11, 0.2);
            }

            .activity-item__today-badge {
                position: absolute;
                top: 12px;
                left: 12px;
                background: #F59E0B;
                color: white;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 700;
            }

            .activity-item__content {
                flex: 1;
                min-width: 0;
            }

            .activity-item__title {
                font-size: 18px;
                font-weight: 700;
                color: #000;
                margin: 0 0 12px;
            }

            .activity-item__meta {
                display: flex;
                flex-wrap: wrap;
                gap: 16px;
                margin-bottom: 12px;
            }

            .meta-item {
                font-size: 14px;
                color: #666;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .activity-item__description {
                font-size: 14px;
                color: #666;
                line-height: 1.6;
                margin: 0 0 12px;
            }

            .activity-item__capacity {
                margin-top: 12px;
            }

            .capacity-bar {
                height: 8px;
                background: #E5E7EB;
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 6px;
            }

            .capacity-bar__fill {
                height: 100%;
                background: linear-gradient(90deg, #16A34A 0%, #22C55E 100%);
                border-radius: 4px;
                transition: width 0.5s ease;
            }

            .capacity-text {
                font-size: 13px;
                color: #666;
            }

            .activity-item__actions {
                display: flex;
                flex-direction: column;
                gap: 8px;
                flex-shrink: 0;
            }

            .activity-btn {
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: 700;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.3s ease;
                border: none;
                white-space: nowrap;
            }

            .activity-btn--details {
                background: white;
                color: #333;
                border: 2px solid #E0E0E0;
            }

            .activity-btn--details:hover {
                border-color: #D60000;
                color: #D60000;
                transform: translateY(-1px);
            }

            .activity-btn--register {
                background: linear-gradient(135deg, #D60000 0%, #8A0000 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(214, 0, 0, 0.3);
            }

            .activity-btn--register:hover {
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(214, 0, 0, 0.4);
            }

            .activity-btn--unregister {
                background: #F3F4F6;
                color: #666;
                border: 2px solid #E5E7EB;
            }

            .activity-btn--unregister:hover {
                background: #FEE2E2;
                color: #DC2626;
                border-color: #DC2626;
            }

            .activity-btn--checkin {
                background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
                animation: checkin-pulse 2s infinite;
            }

            @keyframes checkin-pulse {
                0%, 100% {
                    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
                }
                50% {
                    box-shadow: 0 4px 16px rgba(245, 158, 11, 0.5);
                }
            }

            .activities-empty {
                text-align: center;
                padding: 60px 20px;
            }

            .activities-empty__icon {
                font-size: 64px;
                margin-bottom: 16px;
            }

            .activities-empty__text {
                font-size: 16px;
                color: #666;
            }

            .activities-section__view-all {
                width: 100%;
                padding: 14px;
                background: white;
                border: 2px solid #E0E0E0;
                border-radius: 12px;
                font-weight: 700;
                font-size: 15px;
                color: #D60000;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .activities-section__view-all:hover {
                background: #FEF2F2;
                border-color: #D60000;
                transform: translateY(-2px);
            }

            @media (max-width: 768px) {
                .activity-item {
                    flex-direction: column;
                }

                .activity-item__actions {
                    width: 100%;
                }

                .activity-btn {
                    width: 100%;
                }
            }
        `}</style>
    );
}
