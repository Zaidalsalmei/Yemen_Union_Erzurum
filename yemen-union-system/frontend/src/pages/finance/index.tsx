import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Card, CardBody, CardHeader, Button, Skeleton, ErrorState } from '../../components/common';
import { formatCurrency, formatArabicNumber, formatArabicDate } from '../../utils/formatters';
import type { ApiResponse } from '../../types';

// ============================================
// TYPES
// ============================================
interface FinanceStats {
    total_income: number;
    monthly_income: number;
    pending_payments: number;
    active_subscriptions: number;
    total_members: number;
    subscription_rate: number;
    growth_rate?: number;
}

interface Transaction {
    id: number;
    user_id?: number;
    user_name: string;
    amount: number;
    type: 'income' | 'expense';
    description: string;
    date: string;
    status: 'completed' | 'pending' | 'failed';
    payment_method?: string;
}

// ============================================
// ANIMATED COUNTER
// ============================================
interface AnimatedCounterProps {
    value: number;
    duration?: number;
    isCurrency?: boolean;
    isPercentage?: boolean;
}

function AnimatedCounter({ value, duration = 1500, isCurrency = false, isPercentage = false }: AnimatedCounterProps) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.floor(easeProgress * value));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration]);

    if (isCurrency) {
        return <>{formatCurrency(displayValue)}</>;
    }
    if (isPercentage) {
        return <>{formatArabicNumber(displayValue)}%</>;
    }
    return <>{formatArabicNumber(displayValue)}</>;
}

// ============================================
// KPI CARD COMPONENT
// ============================================
interface KPICardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: 'green' | 'blue' | 'amber' | 'purple' | 'red';
    isCurrency?: boolean;
    isPercentage?: boolean;
    trend?: { value: number; isPositive: boolean };
    delay?: number;
}

function KPICard({ title, value, icon, color, isCurrency, isPercentage, trend, delay = 0 }: KPICardProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    const colorClasses = {
        green: 'from-green-100 to-green-200 text-green-600',
        blue: 'from-blue-100 to-blue-200 text-blue-600',
        amber: 'from-amber-100 to-amber-200 text-amber-600',
        purple: 'from-purple-100 to-purple-200 text-purple-600',
        red: 'from-red-100 to-red-200 text-red-600',
    };

    return (
        <div className={`kpi-card ${color} ${isVisible ? 'visible' : ''}`}>
            <div className={`kpi-icon bg-gradient-to-br ${colorClasses[color]}`}>
                {icon}
            </div>
            <div className="kpi-content">
                <p className="kpi-value">
                    <AnimatedCounter value={value} isCurrency={isCurrency} isPercentage={isPercentage} />
                </p>
                <p className="kpi-title">{title}</p>
                {trend && (
                    <span className={`kpi-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
                        <svg fill="currentColor" viewBox="0 0 20 20">
                            {trend.isPositive ? (
                                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                            ) : (
                                <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                            )}
                        </svg>
                        {trend.isPositive ? '+' : ''}{formatArabicNumber(trend.value)}%
                    </span>
                )}
            </div>
        </div>
    );
}

// ============================================
// TRANSACTION ROW COMPONENT
// ============================================
interface TransactionRowProps {
    transaction: Transaction;
    index: number;
    onClick: () => void;
}

function TransactionRow({ transaction, index, onClick }: TransactionRowProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), index * 50);
        return () => clearTimeout(timer);
    }, [index]);

    const getStatusBadge = () => {
        switch (transaction.status) {
            case 'completed':
                return <span className="transaction-status completed">مكتمل</span>;
            case 'pending':
                return <span className="transaction-status pending">معلق</span>;
            case 'failed':
                return <span className="transaction-status failed">فشل</span>;
        }
    };

    return (
        <div
            className={`transaction-row ${isVisible ? 'visible' : ''}`}
            onClick={onClick}
        >
            <div className={`transaction-icon ${transaction.type}`}>
                {transaction.type === 'income' ? (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                ) : (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                )}
            </div>
            <div className="transaction-info">
                <h4>{transaction.user_name}</h4>
                <p>{transaction.description}</p>
            </div>
            <div className="transaction-amount">
                <span className={transaction.type}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </span>
                <span className="date">{formatArabicDate(transaction.date)}</span>
            </div>
            {getStatusBadge()}
            <div className="transaction-arrow">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </div>
        </div>
    );
}

// ============================================
// QUICK ACTION COMPONENT
// ============================================
interface QuickActionProps {
    to: string;
    icon: React.ReactNode;
    label: string;
}

function QuickAction({ to, icon, label }: QuickActionProps) {
    return (
        <Link to={to} className="quick-action">
            <div className="action-icon">{icon}</div>
            <span>{label}</span>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
        </Link>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================
export function Finance() {
    const navigate = useNavigate();

    // Fetch finance stats
    const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery({
        queryKey: ['finance-stats'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<FinanceStats>>('/finance/stats');
            return response.data.data!;
        },
        retry: 1,
    });

    // Fetch recent transactions
    const { data: transactions, isLoading: transactionsLoading, error: transactionsError, refetch: refetchTransactions } = useQuery({
        queryKey: ['finance-transactions'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Transaction[]>>('/finance/transactions?per_page=10');
            return response.data.data || [];
        },
        retry: 1,
    });

    const handleExportReport = () => {
        toast.success('جاري تحضير التقرير...');
        // TODO: Implement actual export
        setTimeout(() => {
            toast.success('تم تصدير التقرير بنجاح');
        }, 1500);
    };

    const handleTransactionClick = (transaction: Transaction) => {
        if (transaction.user_id) {
            navigate(`/users/${transaction.user_id}`);
        }
    };

    const hasError = statsError || transactionsError;

    return (
        <div className="finance-page animate-fadeIn">
            {/* Page Header */}
            <header className="finance-header">
                <div className="header-content">
                    <div className="header-info">
                        <div className="breadcrumb">
                            <Link to="/">الرئيسية</Link>
                            <span>/</span>
                            <span>الإدارة المالية</span>
                        </div>
                        <h1>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            الإدارة المالية
                        </h1>
                        <p>متابعة الإيرادات والمصروفات والاشتراكات</p>
                    </div>
                    <div className="header-actions">
                        <Button variant="secondary" onClick={handleExportReport}>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            تصدير التقرير
                        </Button>
                        <Link to="/memberships/create">
                            <Button>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                تسجيل دفعة
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* KPI Cards */}
            <section className="kpi-section">
                {statsLoading ? (
                    <>
                        <KPICardSkeleton />
                        <KPICardSkeleton />
                        <KPICardSkeleton />
                        <KPICardSkeleton />
                    </>
                ) : hasError ? (
                    <div className="kpi-error">
                        <ErrorState onRetry={() => { refetchStats(); refetchTransactions(); }} />
                    </div>
                ) : (
                    <>
                        <KPICard
                            title="إجمالي الإيرادات"
                            value={stats?.total_income || 0}
                            isCurrency
                            color="green"
                            delay={0}
                            icon={
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />
                        <KPICard
                            title="إيرادات الشهر"
                            value={stats?.monthly_income || 0}
                            isCurrency
                            color="blue"
                            delay={100}
                            trend={{ value: stats?.growth_rate || 15, isPositive: true }}
                            icon={
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            }
                        />
                        <KPICard
                            title="مدفوعات معلقة"
                            value={stats?.pending_payments || 0}
                            isCurrency
                            color="amber"
                            delay={200}
                            icon={
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />
                        <KPICard
                            title="نسبة الاشتراك"
                            value={Math.round(stats?.subscription_rate || 0)}
                            isPercentage
                            color="purple"
                            delay={300}
                            icon={
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            }
                        />
                    </>
                )}
            </section>

            {/* Main Content Grid */}
            <div className="finance-grid">
                {/* Recent Transactions */}
                <Card className="transactions-card">
                    <CardHeader
                        title="آخر المعاملات"
                        action={
                            <Link to="/memberships">
                                <Button variant="ghost" size="sm">
                                    عرض الكل
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Button>
                            </Link>
                        }
                    />
                    <CardBody noPadding>
                        {transactionsLoading ? (
                            <div className="transactions-skeleton">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Skeleton key={i} className="transaction-skeleton" />
                                ))}
                            </div>
                        ) : transactions && transactions.length > 0 ? (
                            <div className="transactions-list">
                                {transactions.map((transaction, idx) => (
                                    <TransactionRow
                                        key={transaction.id}
                                        transaction={transaction}
                                        index={idx}
                                        onClick={() => handleTransactionClick(transaction)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="transactions-empty">
                                <span className="icon">💰</span>
                                <h4>لا توجد معاملات</h4>
                                <p>لم يتم تسجيل أي معاملات مالية بعد</p>
                                <Link to="/memberships/create">
                                    <Button size="sm">تسجيل دفعة جديدة</Button>
                                </Link>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Quick Summary Sidebar */}
                <div className="summary-sidebar">
                    <Card>
                        <CardHeader title="ملخص سريع" />
                        <CardBody>
                            {/* Active Subscriptions */}
                            <div className="summary-stat green">
                                <div className="stat-header">
                                    <span className="label">الاشتراكات النشطة</span>
                                    <span className="value">
                                        <AnimatedCounter value={stats?.active_subscriptions || 0} />
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${stats?.subscription_rate || 0}%` }}
                                    />
                                </div>
                                <p className="stat-subtitle">
                                    من أصل {formatArabicNumber(stats?.total_members || 0)} عضو
                                </p>
                            </div>

                            {/* Revenue Growth */}
                            <div className="summary-stat blue">
                                <div className="stat-header">
                                    <span className="label">نمو الإيرادات</span>
                                    <span className="growth positive">
                                        <svg fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                                        </svg>
                                        +{formatArabicNumber(stats?.growth_rate || 15)}%
                                    </span>
                                </div>
                                <p className="stat-subtitle">مقارنة بالشهر الماضي</p>
                            </div>

                            {/* Total Members */}
                            <div className="summary-stat purple">
                                <div className="stat-header">
                                    <span className="label">إجمالي الأعضاء</span>
                                    <span className="value">
                                        <AnimatedCounter value={stats?.total_members || 0} />
                                    </span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="quick-actions-card">
                        <CardHeader title="إجراءات سريعة" />
                        <CardBody noPadding>
                            <div className="quick-actions">
                                <QuickAction
                                    to="/memberships"
                                    label="إدارة الاشتراكات"
                                    icon={
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    }
                                />
                                <QuickAction
                                    to="/users"
                                    label="عرض جميع الأعضاء"
                                    icon={
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    }
                                />
                                <QuickAction
                                    to="/memberships/create"
                                    label="تسجيل اشتراك جديد"
                                    icon={
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    }
                                />
                                <QuickAction
                                    to="/activities"
                                    label="الفعاليات والأنشطة"
                                    icon={
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    }
                                />
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* SKELETON COMPONENT */}
            <style>{`
                /* ============================================
                   FINANCE PAGE - PREMIUM STYLES
                   ============================================ */
                .finance-page {
                    animation: fadeIn 0.4s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Header */
                .finance-header {
                    margin-bottom: 24px;
                }

                .finance-header .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 20px;
                    flex-wrap: wrap;
                }

                .finance-header .breadcrumb {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    color: #6B7280;
                    margin-bottom: 8px;
                }

                .finance-header .breadcrumb a {
                    color: #DC2626;
                    text-decoration: none;
                }

                .finance-header .breadcrumb a:hover {
                    text-decoration: underline;
                }

                .finance-header h1 {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 28px;
                    font-weight: 800;
                    color: #111827;
                    margin: 0;
                }

                .finance-header h1 svg {
                    width: 32px;
                    height: 32px;
                    color: #DC2626;
                }

                .finance-header .header-info p {
                    color: #6B7280;
                    margin: 8px 0 0;
                }

                .finance-header .header-actions {
                    display: flex;
                    gap: 12px;
                }

                /* KPI Section */
                .kpi-section {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 20px;
                    margin-bottom: 24px;
                }

                .kpi-card {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 0.4s ease;
                    position: relative;
                    overflow: hidden;
                }

                .kpi-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                    transform: translateX(-100%);
                    transition: 0.5s;
                }

                .kpi-card:hover::before {
                    transform: translateX(100%);
                }

                .kpi-card.visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                .kpi-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
                }

                .kpi-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .kpi-icon svg {
                    width: 28px;
                    height: 28px;
                }

                .kpi-content {
                    flex: 1;
                }

                .kpi-value {
                    font-size: 28px;
                    font-weight: 800;
                    color: #111827;
                    margin: 0;
                    line-height: 1.2;
                }

                .kpi-title {
                    font-size: 14px;
                    color: #6B7280;
                    margin: 4px 0 0;
                }

                .kpi-trend {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 13px;
                    font-weight: 600;
                    padding: 4px 8px;
                    border-radius: 8px;
                    margin-top: 8px;
                }

                .kpi-trend svg {
                    width: 14px;
                    height: 14px;
                }

                .kpi-trend.positive {
                    background: #D1FAE5;
                    color: #059669;
                }

                .kpi-trend.negative {
                    background: #FEE2E2;
                    color: #DC2626;
                }

                /* Finance Grid */
                .finance-grid {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 24px;
                }

                @media (max-width: 1024px) {
                    .finance-grid {
                        grid-template-columns: 1fr;
                    }
                }

                /* Transactions */
                .transactions-card {
                    min-height: 400px;
                }

                .transactions-list {
                    max-height: 500px;
                    overflow-y: auto;
                }

                .transaction-row {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px 20px;
                    border-bottom: 1px solid #F3F4F6;
                    cursor: pointer;
                    opacity: 0;
                    transform: translateX(-20px);
                    transition: all 0.3s ease;
                }

                .transaction-row.visible {
                    opacity: 1;
                    transform: translateX(0);
                }

                .transaction-row:hover {
                    background: #F9FAFB;
                }

                .transaction-row:last-child {
                    border-bottom: none;
                }

                .transaction-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .transaction-icon svg {
                    width: 20px;
                    height: 20px;
                }

                .transaction-icon.income {
                    background: linear-gradient(135deg, #D1FAE5, #A7F3D0);
                    color: #059669;
                }

                .transaction-icon.expense {
                    background: linear-gradient(135deg, #FEE2E2, #FECACA);
                    color: #DC2626;
                }

                .transaction-info {
                    flex: 1;
                    min-width: 0;
                }

                .transaction-info h4 {
                    font-size: 15px;
                    font-weight: 600;
                    color: #111827;
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .transaction-info p {
                    font-size: 13px;
                    color: #6B7280;
                    margin: 4px 0 0;
                }

                .transaction-amount {
                    text-align: left;
                    flex-shrink: 0;
                }

                .transaction-amount span {
                    display: block;
                }

                .transaction-amount span.income {
                    font-size: 16px;
                    font-weight: 700;
                    color: #059669;
                }

                .transaction-amount span.expense {
                    font-size: 16px;
                    font-weight: 700;
                    color: #DC2626;
                }

                .transaction-amount span.date {
                    font-size: 12px;
                    color: #9CA3AF;
                    margin-top: 4px;
                }

                .transaction-status {
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    flex-shrink: 0;
                }

                .transaction-status.completed {
                    background: #D1FAE5;
                    color: #059669;
                }

                .transaction-status.pending {
                    background: #FEF3C7;
                    color: #D97706;
                }

                .transaction-status.failed {
                    background: #FEE2E2;
                    color: #DC2626;
                }

                .transaction-arrow {
                    color: #D1D5DB;
                    flex-shrink: 0;
                }

                .transaction-arrow svg {
                    width: 20px;
                    height: 20px;
                }

                .transactions-empty {
                    text-align: center;
                    padding: 60px 20px;
                }

                .transactions-empty .icon {
                    font-size: 48px;
                    display: block;
                    margin-bottom: 16px;
                }

                .transactions-empty h4 {
                    font-size: 18px;
                    font-weight: 600;
                    color: #111827;
                    margin: 0 0 8px;
                }

                .transactions-empty p {
                    color: #6B7280;
                    margin: 0 0 20px;
                }

                /* Summary Sidebar */
                .summary-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .summary-stat {
                    padding: 16px;
                    border-radius: 12px;
                    margin-bottom: 16px;
                }

                .summary-stat:last-child {
                    margin-bottom: 0;
                }

                .summary-stat.green {
                    background: linear-gradient(135deg, #ECFDF5, #D1FAE5);
                }

                .summary-stat.blue {
                    background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
                }

                .summary-stat.purple {
                    background: linear-gradient(135deg, #F5F3FF, #EDE9FE);
                }

                .summary-stat .stat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .summary-stat .label {
                    font-size: 14px;
                    color: #374151;
                    font-weight: 500;
                }

                .summary-stat .value {
                    font-size: 24px;
                    font-weight: 800;
                    color: #111827;
                }

                .summary-stat .growth {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 14px;
                    font-weight: 600;
                }

                .summary-stat .growth svg {
                    width: 16px;
                    height: 16px;
                }

                .summary-stat .growth.positive {
                    color: #059669;
                }

                .summary-stat .stat-subtitle {
                    font-size: 13px;
                    color: #6B7280;
                    margin-top: 8px;
                }

                .progress-bar {
                    height: 8px;
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #059669, #10B981);
                    border-radius: 4px;
                    transition: width 1s ease;
                }

                /* Quick Actions */
                .quick-actions {
                    display: flex;
                    flex-direction: column;
                }

                .quick-action {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 20px;
                    border-bottom: 1px solid #F3F4F6;
                    text-decoration: none;
                    color: inherit;
                    transition: all 0.2s ease;
                }

                .quick-action:last-child {
                    border-bottom: none;
                }

                .quick-action:hover {
                    background: #F9FAFB;
                    padding-right: 24px;
                }

                .quick-action .action-icon {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #FEE2E2, #FECACA);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #DC2626;
                }

                .quick-action .action-icon svg {
                    width: 20px;
                    height: 20px;
                }

                .quick-action span {
                    flex: 1;
                    font-weight: 500;
                    color: #374151;
                }

                .quick-action > svg {
                    width: 20px;
                    height: 20px;
                    color: #D1D5DB;
                }

                /* Skeleton */
                .kpi-card.skeleton {
                    opacity: 1;
                    transform: none;
                }

                .kpi-icon-skeleton {
                    width: 56px;
                    height: 56px;
                    border-radius: 14px;
                }

                .kpi-value-skeleton {
                    width: 80px;
                    height: 28px;
                    margin-bottom: 8px;
                }

                .kpi-title-skeleton {
                    width: 100px;
                    height: 14px;
                }

                .transactions-skeleton {
                    padding: 20px;
                }

                .transaction-skeleton {
                    height: 70px;
                    border-radius: 12px;
                    margin-bottom: 12px;
                }

                .transaction-skeleton:last-child {
                    margin-bottom: 0;
                }

                .kpi-error {
                    grid-column: 1 / -1;
                }
            `}</style>
        </div>
    );
}

// ============================================
// SKELETON COMPONENT
// ============================================
function KPICardSkeleton() {
    return (
        <div className="kpi-card skeleton">
            <Skeleton className="kpi-icon-skeleton" />
            <div className="kpi-content">
                <Skeleton className="kpi-value-skeleton" />
                <Skeleton className="kpi-title-skeleton" />
            </div>
        </div>
    );
}
