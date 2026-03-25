import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { formatArabicNumber, formatCurrency } from '../../utils/formatters';

// ============================================
// ANIMATED COUNTER FOR KPIs
// ============================================
interface CountUpProps {
    end: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    isCurrency?: boolean;
}

export function CountUp({
    end,
    duration = 2000,
    prefix = '',
    suffix = '',
    decimals = 0,
    isCurrency = false
}: CountUpProps) {
    const [count, setCount] = useState(0);
    const countRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentCount = Math.floor(easeOutQuart * end);

            setCount(currentCount);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);

    const displayValue = isCurrency
        ? formatCurrency(count)
        : formatArabicNumber(decimals > 0 ? count.toFixed(decimals) : count);

    return (
        <span ref={countRef} className="count-up">
            {prefix}{displayValue}{suffix}
        </span>
    );
}

// ============================================
// KPI CARD WITH ANIMATIONS
// ============================================
interface KPICardProps {
    title: string;
    value: number;
    previousValue?: number;
    icon: React.ReactNode;
    iconBg: string;
    link?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    trendLabel?: string;
    isCurrency?: boolean;
    suffix?: string;
    delay?: number;
}

export function KPICard({
    title,
    value,
    previousValue,
    icon,
    iconBg,
    link,
    trend,
    trendValue,
    trendLabel,
    isCurrency = false,
    suffix = '',
    delay = 0
}: KPICardProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    // Calculate trend if not provided
    const calculatedTrend = trend || (previousValue ? (value > previousValue ? 'up' : value < previousValue ? 'down' : 'neutral') : 'neutral');
    const calculatedTrendValue = trendValue || (previousValue ? `${Math.abs(Math.round(((value - previousValue) / previousValue) * 100))}%` : '');

    const content = (
        <div className={`kpi-card ${isVisible ? 'visible' : ''}`} style={{ animationDelay: `${delay}ms` }}>
            <div className="kpi-card-glow" />
            <div className="kpi-card-content">
                <div className={`kpi-icon ${iconBg}`}>
                    {icon}
                </div>
                <div className="kpi-info">
                    <div className="kpi-value">
                        <CountUp end={value} isCurrency={isCurrency} />
                        {suffix && <span className="kpi-suffix">{suffix}</span>}
                    </div>
                    <div className="kpi-title">{title}</div>
                    {calculatedTrendValue && (
                        <div className={`kpi-trend ${calculatedTrend}`}>
                            <span className="trend-arrow">
                                {calculatedTrend === 'up' ? '↑' : calculatedTrend === 'down' ? '↓' : '→'}
                            </span>
                            <span className="trend-value">{calculatedTrendValue}</span>
                            {trendLabel && <span className="trend-label">{trendLabel}</span>}
                        </div>
                    )}
                </div>
            </div>
            <div className="kpi-ripple" />
        </div>
    );

    if (link) {
        return <Link to={link} className="kpi-card-link">{content}</Link>;
    }

    return content;
}

// ============================================
// MINI CHART COMPONENT (Sparkline)
// ============================================
interface SparklineProps {
    data: number[];
    color?: string;
    height?: number;
    showArea?: boolean;
}

export function Sparkline({ data, color = '#D32F2F', height = 40, showArea = true }: SparklineProps) {
    if (!data || data.length === 0) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const width = 100;
    const points = data.map((value, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * (height - 4);
        return `${x},${y}`;
    }).join(' ');

    const areaPath = `M0,${height} L${points} L${width},${height} Z`;
    const linePath = `M${points}`;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="sparkline">
            {showArea && (
                <polygon
                    fill={`${color}20`}
                    points={`0,${height} ${points} ${width},${height}`}
                />
            )}
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
            {/* Last point indicator */}
            {data.length > 0 && (
                <circle
                    cx={width}
                    cy={height - ((data[data.length - 1] - min) / range) * (height - 4)}
                    r="3"
                    fill={color}
                    className="sparkline-dot"
                />
            )}
        </svg>
    );
}

// ============================================
// PROGRESS RING
// ============================================
interface ProgressRingProps {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    label?: string;
    showValue?: boolean;
}

export function ProgressRing({
    value,
    max = 100,
    size = 80,
    strokeWidth = 8,
    color = '#D32F2F',
    label,
    showValue = true
}: ProgressRingProps) {
    const percentage = Math.min((value / max) * 100, 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="progress-ring-container" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="progress-ring">
                <circle
                    className="progress-ring-bg"
                    stroke="#e5e7eb"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className="progress-ring-circle"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: offset,
                        transform: 'rotate(-90deg)',
                        transformOrigin: '50% 50%'
                    }}
                />
            </svg>
            {showValue && (
                <div className="progress-ring-value">
                    <span className="value">{formatArabicNumber(Math.round(percentage))}%</span>
                    {label && <span className="label">{label}</span>}
                </div>
            )}
        </div>
    );
}

// ============================================
// BAR CHART
// ============================================
interface BarChartProps {
    data: { label: string; value: number; color?: string }[];
    height?: number;
    showLabels?: boolean;
    showValues?: boolean;
    animate?: boolean;
}

export function BarChart({
    data,
    height = 200,
    showLabels = true,
    showValues = true,
    animate = true
}: BarChartProps) {
    const [visible, setVisible] = useState(!animate);
    const max = Math.max(...data.map(d => d.value));

    useEffect(() => {
        if (animate) {
            const timer = setTimeout(() => setVisible(true), 300);
            return () => clearTimeout(timer);
        }
    }, [animate]);

    return (
        <div className="bar-chart" style={{ height }}>
            <div className="bar-chart-bars">
                {data.map((item, i) => {
                    const barHeight = visible ? (item.value / max) * 100 : 0;
                    return (
                        <div key={i} className="bar-chart-item">
                            <div className="bar-wrapper">
                                {showValues && (
                                    <span className="bar-value">
                                        {formatArabicNumber(item.value)}
                                    </span>
                                )}
                                <div
                                    className="bar"
                                    style={{
                                        height: `${barHeight}%`,
                                        backgroundColor: item.color || 'var(--primary-500)',
                                        transitionDelay: `${i * 100}ms`
                                    }}
                                />
                            </div>
                            {showLabels && (
                                <span className="bar-label">{item.label}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================
// LINE CHART
// ============================================
interface LineChartProps {
    data: { label: string; value: number }[];
    height?: number;
    color?: string;
    showArea?: boolean;
    showDots?: boolean;
    showLabels?: boolean;
}

export function LineChart({
    data,
    height = 200,
    color = '#D32F2F',
    showArea = true,
    showDots = true,
    showLabels = true
}: LineChartProps) {
    const [visible, setVisible] = useState(false);
    const values = data.map(d => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;

    const padding = 20;
    const chartWidth = 100;
    const chartHeight = 100;

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 300);
        return () => clearTimeout(timer);
    }, []);

    const points = data.map((item, i) => {
        const x = padding + (i / (data.length - 1)) * (chartWidth - padding * 2);
        const y = chartHeight - padding - ((item.value - min) / range) * (chartHeight - padding * 2);
        return { x, y, ...item };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const areaPath = `M${padding},${chartHeight - padding} ${linePath} L${chartWidth - padding},${chartHeight - padding} Z`;

    return (
        <div className="line-chart" style={{ height }}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" className={visible ? 'visible' : ''}>
                {/* Grid lines */}
                {[0.25, 0.5, 0.75].map((ratio, i) => (
                    <line
                        key={i}
                        x1={padding}
                        y1={chartHeight - padding - ratio * (chartHeight - padding * 2)}
                        x2={chartWidth - padding}
                        y2={chartHeight - padding - ratio * (chartHeight - padding * 2)}
                        className="chart-grid-line"
                    />
                ))}

                {/* Area */}
                {showArea && (
                    <path d={areaPath} fill={`${color}15`} className="chart-area" />
                )}

                {/* Line */}
                <path
                    d={linePath}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="chart-line"
                />

                {/* Dots */}
                {showDots && points.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="3"
                        fill={color}
                        className="chart-dot"
                        style={{ animationDelay: `${i * 100}ms` }}
                    />
                ))}
            </svg>

            {/* Labels */}
            {showLabels && (
                <div className="chart-labels">
                    {data.map((item, i) => (
                        <span key={i}>{item.label}</span>
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================
// PIE/DONUT CHART
// ============================================
interface PieChartProps {
    data: { label: string; value: number; color: string }[];
    size?: number;
    donut?: boolean;
    showLegend?: boolean;
}

export function PieChart({ data, size = 160, donut = true, showLegend = true }: PieChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const radius = size / 2;
    const innerRadius = donut ? radius * 0.6 : 0;

    let currentAngle = -90;

    const segments = data.map(item => {
        const percentage = (item.value / total) * 100;
        const angle = (percentage / 100) * 360;
        const startAngle = currentAngle;
        currentAngle += angle;

        const start = {
            x: radius + Math.cos((startAngle * Math.PI) / 180) * radius,
            y: radius + Math.sin((startAngle * Math.PI) / 180) * radius
        };
        const end = {
            x: radius + Math.cos(((startAngle + angle) * Math.PI) / 180) * radius,
            y: radius + Math.sin(((startAngle + angle) * Math.PI) / 180) * radius
        };
        const innerStart = {
            x: radius + Math.cos((startAngle * Math.PI) / 180) * innerRadius,
            y: radius + Math.sin((startAngle * Math.PI) / 180) * innerRadius
        };
        const innerEnd = {
            x: radius + Math.cos(((startAngle + angle) * Math.PI) / 180) * innerRadius,
            y: radius + Math.sin(((startAngle + angle) * Math.PI) / 180) * innerRadius
        };

        const largeArc = angle > 180 ? 1 : 0;

        const pathData = donut
            ? `M${start.x},${start.y} A${radius},${radius} 0 ${largeArc},1 ${end.x},${end.y} L${innerEnd.x},${innerEnd.y} A${innerRadius},${innerRadius} 0 ${largeArc},0 ${innerStart.x},${innerStart.y} Z`
            : `M${radius},${radius} L${start.x},${start.y} A${radius},${radius} 0 ${largeArc},1 ${end.x},${end.y} Z`;

        return { ...item, percentage, pathData };
    });

    return (
        <div className="pie-chart-container">
            <svg width={size} height={size} className="pie-chart">
                {segments.map((seg, i) => (
                    <path
                        key={i}
                        d={seg.pathData}
                        fill={seg.color}
                        className="pie-segment"
                        style={{ animationDelay: `${i * 150}ms` }}
                    />
                ))}
                {donut && (
                    <text x={radius} y={radius} textAnchor="middle" dominantBaseline="middle" className="pie-center-text">
                        <tspan x={radius} dy="-0.2em" className="pie-total">{formatArabicNumber(total)}</tspan>
                        <tspan x={radius} dy="1.4em" className="pie-label">إجمالي</tspan>
                    </text>
                )}
            </svg>

            {showLegend && (
                <div className="pie-legend">
                    {segments.map((seg, i) => (
                        <div key={i} className="legend-item">
                            <span className="legend-dot" style={{ backgroundColor: seg.color }} />
                            <span className="legend-label">{seg.label}</span>
                            <span className="legend-value">{formatArabicNumber(seg.value)}</span>
                            <span className="legend-percent">{Math.round(seg.percentage)}%</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================
// EXPORT COMPONENTS
// ============================================
export { CountUp as AnimatedCounter };
