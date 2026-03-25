import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Card, CardBody, Button, Skeleton, ErrorState } from '../../components/common';
import { formatArabicNumber } from '../../utils/formatters';
import type { Activity, ApiResponse } from '../../types';

// ============================================
// CONSTANTS
// ============================================
const ARABIC_MONTHS = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const ARABIC_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const ARABIC_DAYS_SHORT = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

// ============================================
// CALENDAR DAY COMPONENT
// ============================================
interface CalendarDayProps {
    day: number;
    month: number;
    year: number;
    activities: Activity[];
    isToday: boolean;
    isSelected: boolean;
    onSelect: () => void;
}

function CalendarDay({ day, activities, isToday, isSelected, onSelect }: CalendarDayProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    const hasActivities = activities.length > 0;

    return (
        <button
            onClick={onSelect}
            onMouseEnter={() => hasActivities && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${hasActivities ? 'has-events' : ''}`}
        >
            <span className="day-number">{formatArabicNumber(day)}</span>

            {isToday && !isSelected && (
                <span className="today-label">اليوم</span>
            )}

            {hasActivities && (
                <div className="event-indicators">
                    {activities.slice(0, 3).map((_, idx) => (
                        <span key={idx} className={`event-dot color-${(idx % 4) + 1}`} />
                    ))}
                    {activities.length > 3 && (
                        <span className="more-events">+{formatArabicNumber(activities.length - 3)}</span>
                    )}
                </div>
            )}

            {/* Tooltip */}
            {showTooltip && hasActivities && (
                <div className="day-tooltip">
                    <div className="tooltip-header">
                        {formatArabicNumber(activities.length)} {activities.length === 1 ? 'نشاط' : 'أنشطة'}
                    </div>
                    {activities.slice(0, 3).map((activity, idx) => (
                        <div key={activity.id} className="tooltip-item">
                            <span className={`dot color-${(idx % 4) + 1}`} />
                            <span className="title">{activity.title_ar}</span>
                        </div>
                    ))}
                    {activities.length > 3 && (
                        <div className="tooltip-more">
                            و {formatArabicNumber(activities.length - 3)} أنشطة أخرى...
                        </div>
                    )}
                </div>
            )}
        </button>
    );
}

// ============================================
// UPCOMING ACTIVITY CARD
// ============================================
interface UpcomingActivityProps {
    activity: Activity;
    index: number;
}

function UpcomingActivityCard({ activity, index }: UpcomingActivityProps) {
    const [isVisible, setIsVisible] = useState(false);
    const activityDate = new Date(activity.activity_date);
    const daysUntil = Math.ceil((activityDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), index * 100);
        return () => clearTimeout(timer);
    }, [index]);

    const getStatusColor = () => {
        if (daysUntil <= 3) return 'urgent';
        if (daysUntil <= 7) return 'soon';
        return 'normal';
    };

    return (
        <Link
            to={`/activities/${activity.id}`}
            className={`upcoming-card ${getStatusColor()} ${isVisible ? 'visible' : ''}`}
        >
            <div className="date-badge">
                <span className="day">{formatArabicNumber(activityDate.getDate())}</span>
                <span className="month">{ARABIC_MONTHS[activityDate.getMonth()]}</span>
            </div>
            <div className="card-content">
                <h4>{activity.title_ar}</h4>
                {activity.location_ar && (
                    <p className="location">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {activity.location_ar}
                    </p>
                )}
                <span className="days-until">
                    {daysUntil === 0 ? 'اليوم' :
                        daysUntil === 1 ? 'غداً' :
                            `بعد ${formatArabicNumber(daysUntil)} يوم`}
                </span>
            </div>
        </Link>
    );
}

// ============================================
// SIDE PANEL
// ============================================
interface SidePanelProps {
    date: Date | null;
    activities: Activity[];
    onClose: () => void;
    isOpen: boolean;
}

function SidePanel({ date, activities, onClose, isOpen }: SidePanelProps) {
    if (!date) return null;

    return (
        <>
            <div className={`side-panel-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose} />
            <div className={`side-panel ${isOpen ? 'open' : ''}`}>
                <div className="panel-header">
                    <div className="date-info">
                        <span className="day-name">{ARABIC_DAYS[date.getDay()]}</span>
                        <span className="full-date">
                            {formatArabicNumber(date.getDate())} {ARABIC_MONTHS[date.getMonth()]} {date.getFullYear()}
                        </span>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="panel-content">
                    {activities.length === 0 ? (
                        <div className="empty-day">
                            <div className="empty-icon">📭</div>
                            <h4>لا توجد أنشطة</h4>
                            <p>لم يتم جدولة أي أنشطة لهذا اليوم</p>
                            <Link to="/activities/create">
                                <Button size="sm">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    إضافة نشاط
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="activities-list">
                            <div className="list-header">
                                {formatArabicNumber(activities.length)} {activities.length === 1 ? 'نشاط' : 'أنشطة'}
                            </div>
                            {activities.map((activity, idx) => (
                                <Link
                                    key={activity.id}
                                    to={`/activities/${activity.id}`}
                                    className="activity-item"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <div className={`activity-indicator color-${(idx % 4) + 1}`} />
                                    <div className="activity-info">
                                        <h5>{activity.title_ar}</h5>
                                        {activity.location_ar && (
                                            <p className="location">
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                                {activity.location_ar}
                                            </p>
                                        )}
                                        <span className={`status-badge ${activity.status}`}>
                                            {activity.status === 'published' ? 'منشور' :
                                                activity.status === 'draft' ? 'مسودة' :
                                                    activity.status === 'cancelled' ? 'ملغي' : activity.status}
                                        </span>
                                    </div>
                                    <div className="arrow">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================
export function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [animationDirection, setAnimationDirection] = useState<'next' | 'prev' | null>(null);

    const { data: activities, isLoading, error, refetch } = useQuery({
        queryKey: ['activities'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Activity[]>>('/activities');
            return response.data.data!;
        },
    });

    // Calendar calculations
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    // Get activities for a specific date
    const getActivitiesForDate = (date: Date) => {
        if (!activities) return [];
        return activities.filter(activity => {
            const activityDate = new Date(activity.activity_date);
            return (
                activityDate.getDate() === date.getDate() &&
                activityDate.getMonth() === date.getMonth() &&
                activityDate.getFullYear() === date.getFullYear()
            );
        });
    };

    // Check if date is today
    const isToday = (day: number) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        );
    };

    // Check if date is selected
    const isSelected = (day: number) => {
        if (!selectedDate) return false;
        return (
            day === selectedDate.getDate() &&
            month === selectedDate.getMonth() &&
            year === selectedDate.getFullYear()
        );
    };

    // Navigation
    const prevMonth = () => {
        setAnimationDirection('prev');
        setTimeout(() => {
            setCurrentDate(new Date(year, month - 1, 1));
            setAnimationDirection(null);
        }, 150);
    };

    const nextMonth = () => {
        setAnimationDirection('next');
        setTimeout(() => {
            setCurrentDate(new Date(year, month + 1, 1));
            setAnimationDirection(null);
        }, 150);
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
        setIsPanelOpen(true);
    };

    const handleDaySelect = (day: number) => {
        const date = new Date(year, month, day);
        setSelectedDate(date);
        setIsPanelOpen(true);
    };

    // Selected date activities
    const selectedDateActivities = selectedDate ? getActivitiesForDate(selectedDate) : [];

    // Upcoming activities
    const upcomingActivities = useMemo(() => {
        if (!activities) return [];
        const now = new Date();
        return activities
            .filter(a => new Date(a.activity_date) > now)
            .sort((a, b) => new Date(a.activity_date).getTime() - new Date(b.activity_date).getTime())
            .slice(0, 6);
    }, [activities]);

    // Stats
    const stats = useMemo(() => {
        if (!activities) return { total: 0, thisMonth: 0, upcoming: 0 };
        const now = new Date();
        const thisMonth = activities.filter(a => {
            const d = new Date(a.activity_date);
            return d.getMonth() === month && d.getFullYear() === year;
        }).length;
        const upcoming = activities.filter(a => new Date(a.activity_date) > now).length;
        return { total: activities.length, thisMonth, upcoming };
    }, [activities, month, year]);

    return (
        <div className="calendar-page animate-fadeIn">
            {/* Page Header */}
            <header className="calendar-header">
                <div className="header-content">
                    <div className="header-info">
                        <div className="breadcrumb">
                            <Link to="/">الرئيسية</Link>
                            <span>/</span>
                            <span>تقويم الفعاليات</span>
                        </div>
                        <h1>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            تقويم الفعاليات
                        </h1>
                        <p>عرض جميع الأنشطة والفعاليات في تقويم شهري</p>
                    </div>
                    <div className="header-actions">
                        <Button variant="secondary" onClick={goToToday}>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            اليوم
                        </Button>
                        <Link to="/activities/create">
                            <Button>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                إضافة نشاط
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Quick Stats */}
            <section className="calendar-stats">
                <div className="stat-item">
                    <span className="stat-value">{formatArabicNumber(stats.total)}</span>
                    <span className="stat-label">إجمالي الأنشطة</span>
                </div>
                <div className="stat-item accent">
                    <span className="stat-value">{formatArabicNumber(stats.thisMonth)}</span>
                    <span className="stat-label">هذا الشهر</span>
                </div>
                <div className="stat-item success">
                    <span className="stat-value">{formatArabicNumber(stats.upcoming)}</span>
                    <span className="stat-label">قادم</span>
                </div>
            </section>

            {/* Main Grid */}
            <div className="calendar-grid">
                {/* Calendar */}
                <Card className="calendar-card">
                    <CardBody>
                        {/* Month Navigation */}
                        <div className="month-nav">
                            <button onClick={nextMonth} className="nav-btn">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            <h2 className={`month-title ${animationDirection || ''}`}>
                                {ARABIC_MONTHS[month]} {year}
                            </h2>

                            <button onClick={prevMonth} className="nav-btn">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        </div>

                        {/* Day Headers */}
                        <div className="day-headers">
                            {ARABIC_DAYS_SHORT.map((day, idx) => (
                                <div key={day} className={`day-header ${idx === 5 || idx === 6 ? 'weekend' : ''}`}>
                                    <span className="full">{ARABIC_DAYS[idx]}</span>
                                    <span className="short">{day}</span>
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        {isLoading ? (
                            <div className="calendar-skeleton">
                                {Array(35).fill(0).map((_, i) => (
                                    <Skeleton key={i} className="day-skeleton" />
                                ))}
                            </div>
                        ) : error ? (
                            <ErrorState onRetry={() => refetch()} />
                        ) : (
                            <div className={`days-grid ${animationDirection || ''}`}>
                                {/* Empty cells */}
                                {Array(startingDay).fill(0).map((_, i) => (
                                    <div key={`empty-${i}`} className="empty-day" />
                                ))}

                                {/* Days */}
                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                                    <CalendarDay
                                        key={day}
                                        day={day}
                                        month={month}
                                        year={year}
                                        activities={getActivitiesForDate(new Date(year, month, day))}
                                        isToday={isToday(day)}
                                        isSelected={isSelected(day)}
                                        onSelect={() => handleDaySelect(day)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Legend */}
                        <div className="calendar-legend">
                            <div className="legend-item">
                                <span className="legend-dot today" />
                                <span>اليوم الحالي</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot selected" />
                                <span>اليوم المحدد</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot has-events" />
                                <span>يوم به نشاط</span>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Quick Day Preview (Desktop) */}
                <div className="quick-preview">
                    <Card>
                        <CardBody>
                            <h3 className="preview-title">
                                {selectedDate
                                    ? `${formatArabicNumber(selectedDate.getDate())} ${ARABIC_MONTHS[selectedDate.getMonth()]}`
                                    : 'اختر يوماً'}
                            </h3>
                            <p className="preview-subtitle">
                                {selectedDate
                                    ? ARABIC_DAYS[selectedDate.getDay()]
                                    : 'انقر على يوم لعرض الأنشطة'}
                            </p>

                            {!selectedDate ? (
                                <div className="preview-empty">
                                    <span className="icon">📅</span>
                                    <p>اختر يوماً من التقويم</p>
                                </div>
                            ) : selectedDateActivities.length === 0 ? (
                                <div className="preview-empty">
                                    <span className="icon">😴</span>
                                    <p>لا توجد أنشطة في هذا اليوم</p>
                                    <Link to="/activities/create">
                                        <Button size="sm">إضافة نشاط</Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="preview-activities">
                                    {selectedDateActivities.map((activity, idx) => (
                                        <Link
                                            key={activity.id}
                                            to={`/activities/${activity.id}`}
                                            className="preview-activity"
                                        >
                                            <div className={`indicator color-${(idx % 4) + 1}`} />
                                            <span className="title">{activity.title_ar}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* Upcoming Activities */}
            <section className="upcoming-section">
                <div className="section-header">
                    <h2>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        الأنشطة القادمة
                    </h2>
                    <Link to="/activities" className="view-all-link">
                        عرض الكل
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                </div>

                {isLoading ? (
                    <div className="upcoming-grid">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} className="upcoming-skeleton" />
                        ))}
                    </div>
                ) : upcomingActivities.length > 0 ? (
                    <div className="upcoming-grid">
                        {upcomingActivities.map((activity, idx) => (
                            <UpcomingActivityCard
                                key={activity.id}
                                activity={activity}
                                index={idx}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="upcoming-empty">
                        <span className="icon">📅</span>
                        <p>لا توجد أنشطة قادمة</p>
                        <Link to="/activities/create">
                            <Button>إضافة نشاط جديد</Button>
                        </Link>
                    </div>
                )}
            </section>

            {/* Side Panel (Mobile) */}
            <SidePanel
                date={selectedDate}
                activities={selectedDateActivities}
                onClose={() => setIsPanelOpen(false)}
                isOpen={isPanelOpen}
            />

            <style>{`
                /* ============================================
                   CALENDAR PAGE - PREMIUM STYLES
                   ============================================ */
                .calendar-page {
                    animation: fadeIn 0.4s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Header */
                .calendar-header {
                    margin-bottom: 24px;
                }

                .calendar-header .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 20px;
                    flex-wrap: wrap;
                }

                .calendar-header .breadcrumb {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    color: #6B7280;
                    margin-bottom: 8px;
                }

                .calendar-header .breadcrumb a {
                    color: #DC2626;
                    text-decoration: none;
                }

                .calendar-header h1 {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 28px;
                    font-weight: 800;
                    color: #111827;
                    margin: 0;
                }

                .calendar-header h1 svg {
                    width: 32px;
                    height: 32px;
                    color: #DC2626;
                }

                .calendar-header .header-info p {
                    color: #6B7280;
                    margin: 8px 0 0;
                }

                .calendar-header .header-actions {
                    display: flex;
                    gap: 12px;
                }

                /* Calendar Stats */
                .calendar-stats {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                }

                .calendar-stats .stat-item {
                    background: white;
                    padding: 16px 24px;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    text-align: center;
                    min-width: 120px;
                    transition: all 0.3s ease;
                }

                .calendar-stats .stat-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
                }

                .calendar-stats .stat-item.accent {
                    background: linear-gradient(135deg, #DC2626, #991B1B);
                    color: white;
                }

                .calendar-stats .stat-item.success {
                    background: linear-gradient(135deg, #059669, #047857);
                    color: white;
                }

                .calendar-stats .stat-value {
                    font-size: 28px;
                    font-weight: 800;
                    display: block;
                }

                .calendar-stats .stat-label {
                    font-size: 13px;
                    opacity: 0.8;
                    margin-top: 4px;
                }

                /* Calendar Grid */
                .calendar-grid {
                    display: grid;
                    grid-template-columns: 1fr 300px;
                    gap: 24px;
                }

                @media (max-width: 1024px) {
                    .calendar-grid {
                        grid-template-columns: 1fr;
                    }

                    .quick-preview {
                        display: none;
                    }
                }

                /* Calendar Card */
                .calendar-card {
                    min-height: 500px;
                }

                .month-nav {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }

                .month-title {
                    font-size: 24px;
                    font-weight: 700;
                    color: #111827;
                    margin: 0;
                    transition: all 0.15s ease;
                }

                .month-title.next {
                    animation: slideInRight 0.15s ease;
                }

                .month-title.prev {
                    animation: slideInLeft 0.15s ease;
                }

                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                .nav-btn {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    border: none;
                    background: #F3F4F6;
                    color: #374151;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .nav-btn:hover {
                    background: #E5E7EB;
                    color: #111827;
                }

                .nav-btn svg {
                    width: 24px;
                    height: 24px;
                }

                /* Day Headers */
                .day-headers {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 4px;
                    margin-bottom: 12px;
                }

                .day-header {
                    text-align: center;
                    padding: 12px 4px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #6B7280;
                }

                .day-header.weekend {
                    color: #DC2626;
                }

                .day-header .full {
                    display: none;
                }

                @media (min-width: 768px) {
                    .day-header .full {
                        display: inline;
                    }
                    .day-header .short {
                        display: none;
                    }
                }

                /* Days Grid */
                .days-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 4px;
                }

                .empty-day {
                    aspect-ratio: 1;
                }

                /* Calendar Day */
                .calendar-day {
                    aspect-ratio: 1;
                    border: none;
                    background: #F9FAFB;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                    padding: 8px;
                }

                .calendar-day:hover {
                    background: #E5E7EB;
                    transform: scale(1.05);
                }

                .calendar-day.today {
                    background: linear-gradient(135deg, #FEE2E2, #FECACA);
                    border: 2px solid #DC2626;
                }

                .calendar-day.selected {
                    background: linear-gradient(135deg, #DC2626, #991B1B);
                    color: white;
                    transform: scale(1.05);
                    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
                }

                .calendar-day.has-events {
                    background: linear-gradient(135deg, #ECFDF5, #D1FAE5);
                }

                .calendar-day.has-events.selected {
                    background: linear-gradient(135deg, #DC2626, #991B1B);
                }

                .day-number {
                    font-size: 16px;
                    font-weight: 600;
                }

                .today-label {
                    font-size: 10px;
                    margin-top: 2px;
                    color: #DC2626;
                }

                .calendar-day.selected .today-label {
                    color: white;
                }

                .event-indicators {
                    display: flex;
                    gap: 3px;
                    margin-top: 4px;
                }

                .event-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                }

                .event-dot.color-1 { background: #3B82F6; }
                .event-dot.color-2 { background: #10B981; }
                .event-dot.color-3 { background: #F59E0B; }
                .event-dot.color-4 { background: #EF4444; }

                .more-events {
                    font-size: 9px;
                    color: #6B7280;
                }

                /* Day Tooltip */
                .day-tooltip {
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #1F2937;
                    color: white;
                    padding: 12px;
                    border-radius: 10px;
                    min-width: 180px;
                    z-index: 100;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                    margin-bottom: 8px;
                }

                .day-tooltip::after {
                    content: '';
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    border: 8px solid transparent;
                    border-top-color: #1F2937;
                }

                .tooltip-header {
                    font-size: 12px;
                    font-weight: 600;
                    margin-bottom: 8px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid #374151;
                }

                .tooltip-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    margin-bottom: 6px;
                }

                .tooltip-item .dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .tooltip-more {
                    font-size: 11px;
                    color: #9CA3AF;
                    margin-top: 8px;
                }

                /* Calendar Legend */
                .calendar-legend {
                    display: flex;
                    gap: 20px;
                    justify-content: center;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #E5E7EB;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: #6B7280;
                }

                .legend-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 4px;
                }

                .legend-dot.today {
                    background: #FEE2E2;
                    border: 2px solid #DC2626;
                }

                .legend-dot.selected {
                    background: linear-gradient(135deg, #DC2626, #991B1B);
                }

                .legend-dot.has-events {
                    background: linear-gradient(135deg, #D1FAE5, #A7F3D0);
                }

                /* Quick Preview */
                .quick-preview .preview-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #111827;
                    margin: 0 0 4px;
                }

                .quick-preview .preview-subtitle {
                    font-size: 14px;
                    color: #6B7280;
                    margin: 0 0 16px;
                }

                .preview-empty {
                    text-align: center;
                    padding: 40px 20px;
                }

                .preview-empty .icon {
                    font-size: 40px;
                    display: block;
                    margin-bottom: 12px;
                }

                .preview-empty p {
                    color: #6B7280;
                    margin: 0 0 16px;
                }

                .preview-activities {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .preview-activity {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: #F9FAFB;
                    border-radius: 10px;
                    text-decoration: none;
                    transition: all 0.2s ease;
                }

                .preview-activity:hover {
                    background: #F3F4F6;
                }

                .preview-activity .indicator {
                    width: 4px;
                    height: 24px;
                    border-radius: 2px;
                }

                .preview-activity .title {
                    color: #374151;
                    font-weight: 500;
                }

                /* Upcoming Section */
                .upcoming-section {
                    margin-top: 32px;
                }

                .upcoming-section .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .upcoming-section h2 {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 20px;
                    font-weight: 700;
                    color: #111827;
                    margin: 0;
                }

                .upcoming-section h2 svg {
                    width: 24px;
                    height: 24px;
                    color: #DC2626;
                }

                .view-all-link {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: #DC2626;
                    font-weight: 600;
                    font-size: 14px;
                    text-decoration: none;
                }

                .view-all-link svg {
                    width: 16px;
                    height: 16px;
                }

                .upcoming-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 16px;
                }

                .upcoming-card {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: white;
                    border-radius: 14px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    text-decoration: none;
                    color: inherit;
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 0.3s ease;
                }

                .upcoming-card.visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                .upcoming-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
                }

                .upcoming-card.urgent {
                    border-right: 4px solid #DC2626;
                }

                .upcoming-card.soon {
                    border-right: 4px solid #F59E0B;
                }

                .upcoming-card.normal {
                    border-right: 4px solid #3B82F6;
                }

                .date-badge {
                    width: 56px;
                    height: 56px;
                    background: linear-gradient(135deg, #DC2626, #991B1B);
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;
                }

                .date-badge .day {
                    font-size: 20px;
                    font-weight: 800;
                    line-height: 1;
                }

                .date-badge .month {
                    font-size: 11px;
                    margin-top: 2px;
                }

                .upcoming-card .card-content {
                    flex: 1;
                    min-width: 0;
                }

                .upcoming-card .card-content h4 {
                    font-size: 15px;
                    font-weight: 600;
                    color: #111827;
                    margin: 0 0 6px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .upcoming-card .location {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 12px;
                    color: #6B7280;
                    margin: 0;
                }

                .upcoming-card .location svg {
                    width: 14px;
                    height: 14px;
                }

                .days-until {
                    font-size: 11px;
                    font-weight: 600;
                    color: #DC2626;
                    background: #FEE2E2;
                    padding: 2px 8px;
                    border-radius: 4px;
                    margin-top: 6px;
                    display: inline-block;
                }

                .upcoming-empty {
                    text-align: center;
                    padding: 60px 20px;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }

                .upcoming-empty .icon {
                    font-size: 48px;
                    display: block;
                    margin-bottom: 16px;
                }

                .upcoming-empty p {
                    color: #6B7280;
                    margin: 0 0 20px;
                }

                .upcoming-skeleton {
                    height: 90px;
                    border-radius: 14px;
                }

                /* Side Panel */
                .side-panel-overlay {
                    display: none;
                }

                .side-panel {
                    display: none;
                }

                @media (max-width: 1024px) {
                    .side-panel-overlay {
                        display: block;
                        position: fixed;
                        inset: 0;
                        background: rgba(0, 0, 0, 0.5);
                        opacity: 0;
                        visibility: hidden;
                        transition: all 0.3s ease;
                        z-index: 1000;
                    }

                    .side-panel-overlay.visible {
                        opacity: 1;
                        visibility: visible;
                    }

                    .side-panel {
                        display: block;
                        position: fixed;
                        left: 0;
                        top: 0;
                        bottom: 0;
                        width: 320px;
                        background: white;
                        transform: translateX(-100%);
                        transition: transform 0.3s ease;
                        z-index: 1001;
                        box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
                    }

                    .side-panel.open {
                        transform: translateX(0);
                    }

                    .panel-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 20px;
                        border-bottom: 1px solid #E5E7EB;
                    }

                    .date-info .day-name {
                        display: block;
                        font-size: 14px;
                        color: #6B7280;
                    }

                    .date-info .full-date {
                        display: block;
                        font-size: 18px;
                        font-weight: 700;
                        color: #111827;
                        margin-top: 4px;
                    }

                    .close-btn {
                        width: 40px;
                        height: 40px;
                        border-radius: 10px;
                        border: none;
                        background: #F3F4F6;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .close-btn svg {
                        width: 20px;
                        height: 20px;
                        color: #6B7280;
                    }

                    .panel-content {
                        padding: 20px;
                        max-height: calc(100vh - 100px);
                        overflow-y: auto;
                    }

                    .empty-day {
                        text-align: center;
                        padding: 40px 20px;
                    }

                    .empty-day .empty-icon {
                        font-size: 40px;
                        display: block;
                        margin-bottom: 12px;
                    }

                    .empty-day h4 {
                        font-size: 16px;
                        font-weight: 600;
                        color: #111827;
                        margin: 0 0 8px;
                    }

                    .empty-day p {
                        color: #6B7280;
                        margin: 0 0 16px;
                        font-size: 14px;
                    }

                    .activities-list .list-header {
                        font-size: 14px;
                        color: #6B7280;
                        margin-bottom: 12px;
                    }

                    .activity-item {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px;
                        background: #F9FAFB;
                        border-radius: 10px;
                        margin-bottom: 8px;
                        text-decoration: none;
                        animation: fadeIn 0.3s ease;
                    }

                    .activity-item:hover {
                        background: #F3F4F6;
                    }

                    .activity-indicator {
                        width: 4px;
                        height: 40px;
                        border-radius: 2px;
                        flex-shrink: 0;
                    }

                    .activity-indicator.color-1 { background: #3B82F6; }
                    .activity-indicator.color-2 { background: #10B981; }
                    .activity-indicator.color-3 { background: #F59E0B; }
                    .activity-indicator.color-4 { background: #EF4444; }

                    .activity-info {
                        flex: 1;
                    }

                    .activity-info h5 {
                        font-size: 14px;
                        font-weight: 600;
                        color: #111827;
                        margin: 0 0 4px;
                    }

                    .activity-info .location {
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        font-size: 12px;
                        color: #6B7280;
                    }

                    .activity-info .location svg {
                        width: 12px;
                        height: 12px;
                    }

                    .status-badge {
                        font-size: 10px;
                        padding: 2px 8px;
                        border-radius: 4px;
                        font-weight: 600;
                        margin-top: 4px;
                        display: inline-block;
                    }

                    .status-badge.published {
                        background: #D1FAE5;
                        color: #059669;
                    }

                    .status-badge.draft {
                        background: #FEF3C7;
                        color: #D97706;
                    }

                    .status-badge.cancelled {
                        background: #FEE2E2;
                        color: #DC2626;
                    }

                    .activity-item .arrow {
                        color: #D1D5DB;
                    }

                    .activity-item .arrow svg {
                        width: 16px;
                        height: 16px;
                    }
                }

                /* Skeleton */
                .calendar-skeleton {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 4px;
                }

                .day-skeleton {
                    aspect-ratio: 1;
                    border-radius: 12px;
                }
            `}</style>
        </div>
    );
}
