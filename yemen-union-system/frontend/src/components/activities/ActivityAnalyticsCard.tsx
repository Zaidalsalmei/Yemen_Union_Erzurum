import { formatArabicNumber } from '../../utils/formatters';

interface ActivityAnalyticsCardProps {
    title: string;
    icon: string;
    stats: {
        label: string;
        value: number | string;
        change?: number;
        color?: string;
    }[];
    chartData?: { label: string; value: number }[];
}

export function ActivityAnalyticsCard({ title, icon, stats, chartData }: ActivityAnalyticsCardProps) {
    const maxValue = chartData ? Math.max(...chartData.map(d => d.value)) : 0;

    return (
        <div className="analytics-card">
            <div className="analytics-card-header">
                <span className="analytics-icon">{icon}</span>
                <h3>{title}</h3>
            </div>

            <div className="analytics-stats">
                {stats.map((stat, idx) => (
                    <div key={idx} className="analytics-stat">
                        <span className="analytics-stat-value" style={stat.color ? { color: stat.color } : undefined}>
                            {typeof stat.value === 'number' ? formatArabicNumber(stat.value) : stat.value}
                        </span>
                        <span className="analytics-stat-label">{stat.label}</span>
                        {stat.change !== undefined && (
                            <span className={`analytics-stat-change ${stat.change >= 0 ? 'positive' : 'negative'}`}>
                                {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change)}%
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {chartData && chartData.length > 0 && (
                <div className="analytics-chart">
                    {chartData.map((item, idx) => (
                        <div key={idx} className="analytics-bar-container">
                            <div
                                className="analytics-bar"
                                style={{
                                    height: `${(item.value / maxValue) * 100}%`
                                }}
                            />
                            <span className="analytics-bar-label">{item.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Analytics Dashboard for Activities
interface ActivityAnalyticsDashboardProps {
    totalActivities: number;
    totalRegistrations: number;
    totalAttendance: number;
    averageRating: number;
    registrationTrend: { month: string; count: number }[];
    categoryBreakdown: { category: string; count: number }[];
    statusBreakdown: { status: string; count: number }[];
}

export function ActivityAnalyticsDashboard({
    totalActivities,
    totalRegistrations,
    totalAttendance,
    averageRating,
    registrationTrend,
    categoryBreakdown,
    statusBreakdown
}: ActivityAnalyticsDashboardProps) {
    const attendanceRate = totalRegistrations > 0
        ? Math.round((totalAttendance / totalRegistrations) * 100)
        : 0;

    return (
        <div className="analytics-dashboard">
            {/* Summary Cards */}
            <div className="analytics-summary-grid">
                <div className="analytics-summary-card">
                    <div className="summary-icon" style={{ background: 'var(--primary-100)', color: 'var(--primary-600)' }}>
                        📊
                    </div>
                    <div className="summary-content">
                        <span className="summary-value">{formatArabicNumber(totalActivities)}</span>
                        <span className="summary-label">إجمالي الأنشطة</span>
                    </div>
                </div>

                <div className="analytics-summary-card">
                    <div className="summary-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                        👥
                    </div>
                    <div className="summary-content">
                        <span className="summary-value">{formatArabicNumber(totalRegistrations)}</span>
                        <span className="summary-label">إجمالي التسجيلات</span>
                    </div>
                </div>

                <div className="analytics-summary-card">
                    <div className="summary-icon" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
                        ✅
                    </div>
                    <div className="summary-content">
                        <span className="summary-value">{attendanceRate}%</span>
                        <span className="summary-label">معدل الحضور</span>
                    </div>
                </div>

                <div className="analytics-summary-card">
                    <div className="summary-icon" style={{ background: 'var(--warning-light)', color: '#f59e0b' }}>
                        ⭐
                    </div>
                    <div className="summary-content">
                        <span className="summary-value">{averageRating.toFixed(1)}</span>
                        <span className="summary-label">متوسط التقييم</span>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="analytics-charts-row">
                {/* Registration Trend */}
                <div className="analytics-chart-card">
                    <h4>📈 اتجاه التسجيلات</h4>
                    <div className="line-chart">
                        {registrationTrend.length > 0 && (() => {
                            const max = Math.max(...registrationTrend.map(d => d.count));
                            return (
                                <svg viewBox={`0 0 ${registrationTrend.length * 50} 100`} className="trend-line">
                                    <polyline
                                        fill="none"
                                        stroke="var(--primary-500)"
                                        strokeWidth="2"
                                        points={registrationTrend.map((d, i) =>
                                            `${i * 50 + 25},${100 - (d.count / max) * 80}`
                                        ).join(' ')}
                                    />
                                    {registrationTrend.map((d, i) => (
                                        <circle
                                            key={i}
                                            cx={i * 50 + 25}
                                            cy={100 - (d.count / max) * 80}
                                            r="4"
                                            fill="var(--primary-500)"
                                        />
                                    ))}
                                </svg>
                            );
                        })()}
                        <div className="chart-labels">
                            {registrationTrend.map((d, i) => (
                                <span key={i}>{d.month}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="analytics-chart-card">
                    <h4>🏷️ توزيع التصنيفات</h4>
                    <div className="horizontal-bars">
                        {categoryBreakdown.slice(0, 5).map((item, i) => {
                            const max = Math.max(...categoryBreakdown.map(c => c.count));
                            const percentage = (item.count / max) * 100;
                            return (
                                <div key={i} className="h-bar-row">
                                    <span className="h-bar-label">{item.category}</span>
                                    <div className="h-bar-track">
                                        <div
                                            className="h-bar-fill"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="h-bar-value">{formatArabicNumber(item.count)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Status Breakdown (Pie-like) */}
                <div className="analytics-chart-card">
                    <h4>📊 توزيع الحالات</h4>
                    <div className="status-breakdown">
                        {statusBreakdown.map((item, i) => {
                            const total = statusBreakdown.reduce((sum, s) => sum + s.count, 0);
                            const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                            const colors = ['var(--success)', 'var(--primary-500)', 'var(--warning)', 'var(--info)', '#6b7280'];
                            return (
                                <div key={i} className="status-item">
                                    <div
                                        className="status-dot"
                                        style={{ background: colors[i % colors.length] }}
                                    />
                                    <span className="status-name">{item.status}</span>
                                    <span className="status-count">{formatArabicNumber(item.count)}</span>
                                    <span className="status-percent">{percentage}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
