import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatArabicDate, formatArabicNumber } from '../../utils/formatters';

// ============================================
// UPCOMING EVENTS WIDGET
// ============================================
interface UpcomingEvent {
    id: number;
    title_ar: string;
    activity_date: string;
    location_ar?: string;
    status: string;
    participant_count?: number;
    max_participants?: number;
}

interface UpcomingEventsWidgetProps {
    events: UpcomingEvent[];
    isLoading?: boolean;
    onViewAll?: () => void;
}

export function UpcomingEventsWidget({ events, isLoading, onViewAll }: UpcomingEventsWidgetProps) {
    const getDaysRemaining = (date: string) => {
        const eventDate = new Date(date);
        const today = new Date();
        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (isLoading) {
        return (
            <div className="widget widget-loading">
                <div className="widget-skeleton" />
                <div className="widget-skeleton" />
                <div className="widget-skeleton" />
            </div>
        );
    }

    return (
        <div className="widget upcoming-events-widget">
            <div className="widget-header">
                <h3>
                    <span className="widget-icon">📅</span>
                    الأحداث القادمة
                </h3>
                {onViewAll && (
                    <button className="widget-action" onClick={onViewAll}>
                        عرض الكل ←
                    </button>
                )}
            </div>
            <div className="widget-body">
                {events.length === 0 ? (
                    <div className="widget-empty">
                        <span className="empty-icon">🎉</span>
                        <p>لا توجد أحداث قادمة</p>
                        <Link to="/activities/create" className="btn btn-sm btn-primary">
                            إنشاء نشاط
                        </Link>
                    </div>
                ) : (
                    <div className="events-list">
                        {events.slice(0, 5).map((event, i) => {
                            const daysRemaining = getDaysRemaining(event.activity_date);
                            const isUrgent = daysRemaining <= 3;
                            const isToday = daysRemaining === 0;

                            return (
                                <Link
                                    key={event.id}
                                    to={`/activities/${event.id}`}
                                    className={`event-item ${isUrgent ? 'urgent' : ''}`}
                                    style={{ animationDelay: `${i * 100}ms` }}
                                >
                                    <div className="event-date-badge">
                                        <span className="day">{new Date(event.activity_date).getDate()}</span>
                                        <span className="month">
                                            {new Date(event.activity_date).toLocaleDateString('ar-EG', { month: 'short' })}
                                        </span>
                                    </div>
                                    <div className="event-info">
                                        <h4>{event.title_ar}</h4>
                                        {event.location_ar && (
                                            <p className="event-location">📍 {event.location_ar}</p>
                                        )}
                                        <div className="event-meta">
                                            <span className={`days-badge ${isToday ? 'today' : isUrgent ? 'urgent' : ''}`}>
                                                {isToday ? 'اليوم' : `بعد ${formatArabicNumber(daysRemaining)} يوم`}
                                            </span>
                                            {event.max_participants && (
                                                <span className="seats-badge">
                                                    👥 {formatArabicNumber(event.participant_count || 0)}/{formatArabicNumber(event.max_participants)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <svg className="event-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================
// PENDING APPROVALS WIDGET
// ============================================
interface PendingApproval {
    id: number;
    full_name: string;
    phone_number: string;
    created_at: string;
    type: 'user' | 'membership' | 'registration';
}

interface PendingApprovalsWidgetProps {
    count: number;
    items?: PendingApproval[];
    isLoading?: boolean;
    onViewAll?: () => void;
    onApprove?: (id: number, type: string) => void;
}

export function PendingApprovalsWidget({
    count,
    items = [],
    isLoading,
    onViewAll,
    onApprove
}: PendingApprovalsWidgetProps) {
    if (isLoading) {
        return <div className="widget widget-loading"><div className="widget-skeleton" /></div>;
    }

    return (
        <div className="widget pending-approvals-widget">
            <div className="widget-header">
                <h3>
                    <span className="widget-icon">⏳</span>
                    طلبات الانتظار
                    {count > 0 && <span className="count-badge">{formatArabicNumber(count)}</span>}
                </h3>
                {onViewAll && count > 0 && (
                    <button className="widget-action" onClick={onViewAll}>
                        عرض الكل ←
                    </button>
                )}
            </div>
            <div className="widget-body">
                {count === 0 ? (
                    <div className="widget-empty success">
                        <span className="empty-icon">✅</span>
                        <p>لا توجد طلبات معلقة</p>
                    </div>
                ) : (
                    <div className="approval-summary" onClick={onViewAll}>
                        <div className="approval-icon pulse">
                            <span>👤</span>
                        </div>
                        <div className="approval-info">
                            <span className="approval-count">{formatArabicNumber(count)}</span>
                            <span className="approval-label">عضو في انتظار الموافقة</span>
                        </div>
                        <svg className="approval-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================
// EXPIRING SUBSCRIPTIONS WIDGET
// ============================================
interface ExpiringMember {
    id: number;
    full_name: string;
    phone_number: string;
    days_remaining: number;
}

interface ExpiringSubscriptionsWidgetProps {
    members: ExpiringMember[];
    isLoading?: boolean;
    onViewAll?: () => void;
}

export function ExpiringSubscriptionsWidget({ members, isLoading, onViewAll }: ExpiringSubscriptionsWidgetProps) {
    if (isLoading) {
        return <div className="widget widget-loading"><div className="widget-skeleton" /></div>;
    }

    return (
        <div className="widget expiring-subs-widget">
            <div className="widget-header">
                <h3>
                    <span className="widget-icon">⚠️</span>
                    اشتراكات تنتهي قريباً
                    {members.length > 0 && <span className="count-badge warning">{formatArabicNumber(members.length)}</span>}
                </h3>
                {onViewAll && members.length > 0 && (
                    <button className="widget-action" onClick={onViewAll}>
                        عرض الكل ←
                    </button>
                )}
            </div>
            <div className="widget-body">
                {members.length === 0 ? (
                    <div className="widget-empty success">
                        <span className="empty-icon">💳</span>
                        <p>لا توجد اشتراكات تنتهي قريباً</p>
                    </div>
                ) : (
                    <div className="expiring-list">
                        {members.slice(0, 4).map((member, i) => (
                            <Link
                                key={member.id}
                                to={`/users/${member.id}`}
                                className={`expiring-item ${member.days_remaining <= 3 ? 'critical' : member.days_remaining <= 7 ? 'warning' : ''}`}
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className="member-avatar">
                                    {member.full_name.charAt(0)}
                                </div>
                                <div className="member-info">
                                    <h4>{member.full_name}</h4>
                                    <p>{member.phone_number}</p>
                                </div>
                                <span className="days-remaining">
                                    {member.days_remaining <= 0 ? 'انتهى!' : `${formatArabicNumber(member.days_remaining)} يوم`}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================
// RECENT ACTIONS LOG WIDGET
// ============================================
interface ActionLog {
    id: number;
    action: string;
    description: string;
    user_name?: string;
    timestamp: string;
    type: 'create' | 'update' | 'delete' | 'login' | 'register' | 'payment';
}

interface RecentActionsWidgetProps {
    actions: ActionLog[];
    isLoading?: boolean;
    onViewAll?: () => void;
}

export function RecentActionsWidget({ actions, isLoading, onViewAll }: RecentActionsWidgetProps) {
    const getActionIcon = (type: ActionLog['type']) => {
        switch (type) {
            case 'create': return '➕';
            case 'update': return '✏️';
            case 'delete': return '🗑️';
            case 'login': return '🔑';
            case 'register': return '📝';
            case 'payment': return '💰';
            default: return '📌';
        }
    };

    const getActionColor = (type: ActionLog['type']) => {
        switch (type) {
            case 'create': return 'success';
            case 'update': return 'info';
            case 'delete': return 'danger';
            case 'login': return 'neutral';
            case 'register': return 'primary';
            case 'payment': return 'warning';
            default: return 'neutral';
        }
    };

    if (isLoading) {
        return <div className="widget widget-loading"><div className="widget-skeleton" /></div>;
    }

    return (
        <div className="widget actions-log-widget">
            <div className="widget-header">
                <h3>
                    <span className="widget-icon">📋</span>
                    آخر الإجراءات
                </h3>
                {onViewAll && (
                    <button className="widget-action" onClick={onViewAll}>
                        عرض الكل ←
                    </button>
                )}
            </div>
            <div className="widget-body">
                {actions.length === 0 ? (
                    <div className="widget-empty">
                        <span className="empty-icon">📝</span>
                        <p>لا توجد إجراءات مسجلة</p>
                    </div>
                ) : (
                    <div className="actions-timeline">
                        {actions.slice(0, 5).map((action, i) => (
                            <div
                                key={action.id}
                                className={`action-item ${getActionColor(action.type)}`}
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className="action-icon">
                                    {getActionIcon(action.type)}
                                </div>
                                <div className="action-content">
                                    <p className="action-description">{action.description}</p>
                                    <div className="action-meta">
                                        {action.user_name && <span className="action-user">{action.user_name}</span>}
                                        <span className="action-time">{formatArabicDate(action.timestamp)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================
// AI INSIGHTS WIDGET
// ============================================
interface Insight {
    id: string;
    type: 'warning' | 'success' | 'info' | 'recommendation';
    title: string;
    description: string;
    action?: { label: string; link: string };
    metric?: { value: number; change: number };
}

interface AIInsightsWidgetProps {
    insights: Insight[];
    isLoading?: boolean;
}

export function AIInsightsWidget({ insights, isLoading }: AIInsightsWidgetProps) {
    const getInsightIcon = (type: Insight['type']) => {
        switch (type) {
            case 'warning': return '⚠️';
            case 'success': return '✅';
            case 'info': return '💡';
            case 'recommendation': return '🎯';
        }
    };

    if (isLoading) {
        return <div className="widget widget-loading"><div className="widget-skeleton" /></div>;
    }

    return (
        <div className="widget ai-insights-widget">
            <div className="widget-header">
                <h3>
                    <span className="widget-icon gradient">🤖</span>
                    رؤى وتوصيات ذكية
                </h3>
            </div>
            <div className="widget-body">
                {insights.length === 0 ? (
                    <div className="widget-empty success">
                        <span className="empty-icon">🎉</span>
                        <p>كل شيء يسير بشكل ممتاز!</p>
                    </div>
                ) : (
                    <div className="insights-list">
                        {insights.map((insight, i) => (
                            <div
                                key={insight.id}
                                className={`insight-item ${insight.type}`}
                                style={{ animationDelay: `${i * 150}ms` }}
                            >
                                <div className="insight-icon">
                                    {getInsightIcon(insight.type)}
                                </div>
                                <div className="insight-content">
                                    <h4>{insight.title}</h4>
                                    <p>{insight.description}</p>
                                    {insight.action && (
                                        <Link to={insight.action.link} className="insight-action">
                                            {insight.action.label} ←
                                        </Link>
                                    )}
                                </div>
                                {insight.metric && (
                                    <div className={`insight-metric ${insight.metric.change >= 0 ? 'positive' : 'negative'}`}>
                                        <span className="metric-value">{formatArabicNumber(insight.metric.value)}</span>
                                        <span className="metric-change">
                                            {insight.metric.change >= 0 ? '↑' : '↓'}
                                            {Math.abs(insight.metric.change)}%
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================
// MINI CALENDAR WIDGET
// ============================================
interface MiniCalendarWidgetProps {
    events: { date: string; count: number }[];
    onDateSelect?: (date: Date) => void;
}

export function MiniCalendarWidget({ events, onDateSelect }: MiniCalendarWidgetProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const eventMap = new Map(events.map(e => [new Date(e.date).toDateString(), e.count]));
    const today = new Date();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekDay = firstDay.getDay();

    const days: (number | null)[] = [];
    for (let i = 0; i < startWeekDay; i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(i);

    const arabicMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const arabicDays = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

    return (
        <div className="widget mini-calendar-widget">
            <div className="widget-header">
                <h3>
                    <span className="widget-icon">📆</span>
                    التقويم
                </h3>
                <div className="calendar-nav">
                    <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>‹</button>
                    <span>{arabicMonths[month]} {formatArabicNumber(year)}</span>
                    <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>›</button>
                </div>
            </div>
            <div className="widget-body">
                <div className="mini-calendar">
                    <div className="calendar-weekdays">
                        {arabicDays.map(day => (
                            <span key={day}>{day.charAt(0)}</span>
                        ))}
                    </div>
                    <div className="calendar-days">
                        {days.map((day, i) => {
                            if (day === null) return <span key={i} className="empty" />;

                            const date = new Date(year, month, day);
                            const isToday = date.toDateString() === today.toDateString();
                            const eventCount = eventMap.get(date.toDateString()) || 0;

                            return (
                                <button
                                    key={i}
                                    className={`day ${isToday ? 'today' : ''} ${eventCount > 0 ? 'has-event' : ''}`}
                                    onClick={() => onDateSelect?.(date)}
                                >
                                    {formatArabicNumber(day)}
                                    {eventCount > 0 && <span className="event-dot" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// QUICK DATE RANGE FILTER
// ============================================
interface DateRangeFilterProps {
    value: string;
    onChange: (value: string) => void;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
    const options = [
        { value: 'today', label: 'اليوم' },
        { value: 'week', label: 'هذا الأسبوع' },
        { value: 'month', label: 'هذا الشهر' },
        { value: 'year', label: 'هذا العام' },
    ];

    return (
        <div className="date-range-filter">
            {options.map(option => (
                <button
                    key={option.value}
                    className={`filter-btn ${value === option.value ? 'active' : ''}`}
                    onClick={() => onChange(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}

// ============================================
// EXPORT BUTTON
// ============================================
interface ExportButtonProps {
    onExport: (format: 'pdf' | 'excel') => void;
    isLoading?: boolean;
}

export function ExportButton({ onExport, isLoading }: ExportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="export-dropdown">
            <button
                className="export-btn"
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
            >
                {isLoading ? (
                    <span className="loading-spinner" />
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        تصدير
                    </>
                )}
            </button>
            {isOpen && (
                <div className="export-menu animate-fadeIn">
                    <button onClick={() => { onExport('pdf'); setIsOpen(false); }}>
                        📄 تصدير PDF
                    </button>
                    <button onClick={() => { onExport('excel'); setIsOpen(false); }}>
                        📊 تصدير Excel
                    </button>
                </div>
            )}
        </div>
    );
}
