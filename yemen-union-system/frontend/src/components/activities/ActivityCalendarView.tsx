import { useState, useMemo } from 'react';
import { formatArabicNumber } from '../../utils/formatters';
import type { Activity } from '../../types';

interface ActivityCalendarViewProps {
    activities: Activity[];
    onSelectActivity: (activity: Activity) => void;
}

const ARABIC_MONTHS = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const ARABIC_DAYS = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

export function ActivityCalendarView({ activities, onSelectActivity }: ActivityCalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get activities by date
    const activityMap = useMemo(() => {
        const map = new Map<string, Activity[]>();
        activities.forEach(activity => {
            const date = new Date(activity.activity_date).toDateString();
            if (!map.has(date)) {
                map.set(date, []);
            }
            map.get(date)!.push(activity);
        });
        return map;
    }, [activities]);

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startWeekDay = firstDay.getDay();

        const days: { date: Date; isCurrentMonth: boolean }[] = [];

        // Previous month days
        for (let i = startWeekDay - 1; i >= 0; i--) {
            const date = new Date(year, month, -i);
            days.push({ date, isCurrentMonth: false });
        }

        // Current month days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }

        // Next month days to complete the grid
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
        }

        return days;
    }, [year, month]);

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const today = new Date().toDateString();

    // Get activities for selected date
    const selectedActivities = selectedDate
        ? activityMap.get(selectedDate.toDateString()) || []
        : [];

    return (
        <div className="activity-calendar">
            {/* Header */}
            <div className="calendar-header">
                <div className="calendar-nav">
                    <button className="calendar-nav-btn" onClick={goToPreviousMonth}>
                        ‹
                    </button>
                    <h3 className="calendar-month">
                        {ARABIC_MONTHS[month]} {formatArabicNumber(year)}
                    </h3>
                    <button className="calendar-nav-btn" onClick={goToNextMonth}>
                        ›
                    </button>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={goToToday}>
                    اليوم
                </button>
            </div>

            {/* Day Headers */}
            <div className="calendar-grid">
                {ARABIC_DAYS.map(day => (
                    <div key={day} className="calendar-day-header">
                        {day}
                    </div>
                ))}

                {/* Calendar Days */}
                {calendarDays.map(({ date, isCurrentMonth }, idx) => {
                    const dateStr = date.toDateString();
                    const dayActivities = activityMap.get(dateStr) || [];
                    const isToday = dateStr === today;
                    const isSelected = selectedDate?.toDateString() === dateStr;

                    return (
                        <div
                            key={idx}
                            className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${dayActivities.length > 0 ? 'has-activity' : ''} ${isSelected ? 'selected' : ''}`}
                            onClick={() => setSelectedDate(date)}
                        >
                            <span className="calendar-day-number">
                                {formatArabicNumber(date.getDate())}
                            </span>
                            {dayActivities.length > 0 && (
                                <div className="calendar-day-dots">
                                    {dayActivities.slice(0, 3).map((_, i) => (
                                        <span key={i} className="calendar-dot" />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Selected Date Activities */}
            {selectedDate && selectedActivities.length > 0 && (
                <div className="calendar-activities animate-fadeIn">
                    <h4>
                        أنشطة يوم {formatArabicNumber(selectedDate.getDate())} {ARABIC_MONTHS[selectedDate.getMonth()]}
                    </h4>
                    <div className="calendar-activities-list">
                        {selectedActivities.map(activity => (
                            <div
                                key={activity.id}
                                className="calendar-activity-item"
                                onClick={() => onSelectActivity(activity)}
                            >
                                <div className="calendar-activity-time">
                                    {activity.start_time || '—'}
                                </div>
                                <div className="calendar-activity-info">
                                    <h5>{activity.title_ar}</h5>
                                    {activity.location_ar && (
                                        <p>📍 {activity.location_ar}</p>
                                    )}
                                </div>
                                <span className={`badge badge-${activity.status}`}>
                                    {activity.status === 'published' ? 'منشور' :
                                        activity.status === 'registration_open' ? 'مفتوح' :
                                            activity.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
