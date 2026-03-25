import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Payment {
    id: number;
    type: 'subscription' | 'activity' | 'donation' | 'other';
    description: string;
    amount: number;
    currency: string;
    date: string;
    status: 'approved' | 'pending' | 'rejected';
    paymentMethod: string;
    transactionId?: string;
    proofUrl?: string;
    notes?: string;
    approvedBy?: string;
    approvedDate?: string;
    rejectionReason?: string;
}

export function PaymentHistory() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState<'all' | Payment['status']>('all');
    const [typeFilter, setTypeFilter] = useState<'all' | Payment['type']>('all');

    // Mock payment history - replace with API call
    const allPayments: Payment[] = [
        {
            id: 1,
            type: 'subscription',
            description: 'اشتراك سنوي 2025',
            amount: 400,
            currency: 'TRY',
            date: '2025-01-15',
            status: 'approved',
            paymentMethod: 'تحويل بنكي',
            transactionId: 'TRX-2025-001',
            approvedBy: 'أحمد محمد',
            approvedDate: '2025-01-16',
        },
        {
            id: 2,
            type: 'activity',
            description: 'رحلة إلى بحيرة تورتوم',
            amount: 100,
            currency: 'TRY',
            date: '2025-12-10',
            status: 'approved',
            paymentMethod: 'نقداً',
            transactionId: 'TRX-2025-045',
            approvedBy: 'سارة علي',
            approvedDate: '2025-12-10',
        },
        {
            id: 3,
            type: 'subscription',
            description: 'تجديد اشتراك - ربع سنوي',
            amount: 130,
            currency: 'TRY',
            date: '2025-12-12',
            status: 'pending',
            paymentMethod: 'تحويل بنكي',
            transactionId: 'TRX-2025-052',
            notes: 'في انتظار المراجعة',
        },
        {
            id: 4,
            type: 'activity',
            description: 'دوري كرة القدم الشتوي',
            amount: 50,
            currency: 'TRY',
            date: '2025-11-20',
            status: 'rejected',
            paymentMethod: 'تحويل بنكي',
            transactionId: 'TRX-2025-038',
            rejectionReason: 'الإيصال غير واضح. يرجى رفع صورة أوضح',
        },
        {
            id: 5,
            type: 'donation',
            description: 'تبرع لحملة مساعدة العوائل',
            amount: 200,
            currency: 'TRY',
            date: '2025-10-05',
            status: 'approved',
            paymentMethod: 'محفظة إلكترونية',
            transactionId: 'TRX-2025-028',
            approvedBy: 'خالد يوسف',
            approvedDate: '2025-10-05',
        },
        {
            id: 6,
            type: 'subscription',
            description: 'اشتراك شهري - أكتوبر',
            amount: 50,
            currency: 'TRY',
            date: '2025-10-01',
            status: 'approved',
            paymentMethod: 'تحويل بنكي',
            transactionId: 'TRX-2025-025',
            approvedBy: 'أحمد محمد',
            approvedDate: '2025-10-02',
        },
    ];

    const paymentTypes = [
        { value: 'all', label: 'الكل', icon: '📋' },
        { value: 'subscription', label: 'اشتراكات', icon: '🎫' },
        { value: 'activity', label: 'أنشطة', icon: '🎉' },
        { value: 'donation', label: 'تبرعات', icon: '❤️' },
        { value: 'other', label: 'أخرى', icon: '📦' },
    ];

    const statusFilters = [
        { value: 'all', label: 'الكل', color: '#6B7280' },
        { value: 'approved', label: 'مقبولة', color: '#10B981' },
        { value: 'pending', label: 'قيد المراجعة', color: '#F59E0B' },
        { value: 'rejected', label: 'مرفوضة', color: '#EF4444' },
    ];

    const getFilteredPayments = () => {
        let filtered = allPayments;

        if (filter !== 'all') {
            filtered = filtered.filter(p => p.status === filter);
        }

        if (typeFilter !== 'all') {
            filtered = filtered.filter(p => p.type === typeFilter);
        }

        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    const getStatusBadge = (status: Payment['status']) => {
        const config = {
            approved: { label: 'مقبول', color: '#10B981', bg: '#DCFCE7', icon: '✓' },
            pending: { label: 'قيد المراجعة', color: '#F59E0B', bg: '#FEF3C7', icon: '⏳' },
            rejected: { label: 'مرفوض', color: '#EF4444', bg: '#FEE2E2', icon: '✕' },
        };
        return config[status];
    };

    const getTypeInfo = (type: Payment['type']) => {
        return paymentTypes.find(t => t.value === type) || paymentTypes[0];
    };

    const getTotalAmount = () => {
        const filtered = getFilteredPayments();
        return filtered.reduce((sum, p) => sum + p.amount, 0);
    };

    const getApprovedAmount = () => {
        const approved = allPayments.filter(p => p.status === 'approved');
        return approved.reduce((sum, p) => sum + p.amount, 0);
    };

    const getPendingAmount = () => {
        const pending = allPayments.filter(p => p.status === 'pending');
        return pending.reduce((sum, p) => sum + p.amount, 0);
    };

    const handleBack = () => {
        navigate('/');
    };

    const handleNewPayment = () => {
        navigate('/memberships/payment-proof');
    };

    const filteredPayments = getFilteredPayments();

    return (
        <>
            <div className="payment-history-page">
                {/* Page Header */}
                <div className="page-header">
                    <div className="header-content">
                        <div>
                            <h1 className="page-title">💰 سجل المدفوعات</h1>
                            <p className="page-subtitle">عرض جميع مدفوعاتك وحالتها</p>
                        </div>
                        <div className="header-actions">
                            <button className="new-payment-btn" onClick={handleNewPayment}>
                                + رفع إثبات دفع جديد
                            </button>
                            <button className="back-btn" onClick={handleBack}>
                                العودة
                            </button>
                        </div>
                    </div>
                </div>

                <div className="content-wrapper">
                    {/* Statistics Cards */}
                    <div className="stats-grid">
                        <div className="stat-card stat-card--total">
                            <div className="stat-icon">💵</div>
                            <div className="stat-content">
                                <div className="stat-label">إجمالي المدفوعات</div>
                                <div className="stat-value">{allPayments.length}</div>
                                <div className="stat-amount">{getTotalAmount()} TRY</div>
                            </div>
                        </div>

                        <div className="stat-card stat-card--approved">
                            <div className="stat-icon">✓</div>
                            <div className="stat-content">
                                <div className="stat-label">المقبولة</div>
                                <div className="stat-value">
                                    {allPayments.filter(p => p.status === 'approved').length}
                                </div>
                                <div className="stat-amount">{getApprovedAmount()} TRY</div>
                            </div>
                        </div>

                        <div className="stat-card stat-card--pending">
                            <div className="stat-icon">⏳</div>
                            <div className="stat-content">
                                <div className="stat-label">قيد المراجعة</div>
                                <div className="stat-value">
                                    {allPayments.filter(p => p.status === 'pending').length}
                                </div>
                                <div className="stat-amount">{getPendingAmount()} TRY</div>
                            </div>
                        </div>

                        <div className="stat-card stat-card--rejected">
                            <div className="stat-icon">✕</div>
                            <div className="stat-content">
                                <div className="stat-label">المرفوضة</div>
                                <div className="stat-value">
                                    {allPayments.filter(p => p.status === 'rejected').length}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="filters-section">
                        <div className="filter-group">
                            <label>الحالة:</label>
                            <div className="filter-buttons">
                                {statusFilters.map((s) => (
                                    <button
                                        key={s.value}
                                        className={`filter - btn ${filter === s.value ? 'filter-btn--active' : ''} `}
                                        onClick={() => setFilter(s.value as any)}
                                        style={{
                                            borderColor: filter === s.value ? s.color : '#E0E0E0',
                                            color: filter === s.value ? s.color : '#666',
                                        }}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="filter-group">
                            <label>النوع:</label>
                            <div className="filter-buttons">
                                {paymentTypes.map((t) => (
                                    <button
                                        key={t.value}
                                        className={`filter - btn ${typeFilter === t.value ? 'filter-btn--active' : ''} `}
                                        onClick={() => setTypeFilter(t.value as any)}
                                    >
                                        {t.icon} {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Payments List */}
                    {filteredPayments.length > 0 ? (
                        <div className="payments-list">
                            {filteredPayments.map((payment) => {
                                const statusBadge = getStatusBadge(payment.status);
                                const typeInfo = getTypeInfo(payment.type);

                                return (
                                    <div key={payment.id} className="payment-card">
                                        <div className="payment-card__header">
                                            <div className="payment-info">
                                                <div className="payment-type">
                                                    {typeInfo.icon} {typeInfo.label}
                                                </div>
                                                <h3 className="payment-title">{payment.description}</h3>
                                            </div>
                                            <div
                                                className="payment-status"
                                                style={{
                                                    backgroundColor: statusBadge.bg,
                                                    color: statusBadge.color,
                                                }}
                                            >
                                                {statusBadge.icon} {statusBadge.label}
                                            </div>
                                        </div>

                                        <div className="payment-card__body">
                                            <div className="payment-details-grid">
                                                <div className="detail-item">
                                                    <span className="detail-label">المبلغ:</span>
                                                    <span className="detail-value amount">
                                                        {payment.amount} {payment.currency}
                                                    </span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">التاريخ:</span>
                                                    <span className="detail-value">
                                                        {new Date(payment.date).toLocaleDateString('ar-EG', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">طريقة الدفع:</span>
                                                    <span className="detail-value">{payment.paymentMethod}</span>
                                                </div>
                                                {payment.transactionId && (
                                                    <div className="detail-item">
                                                        <span className="detail-label">رقم المعاملة:</span>
                                                        <span className="detail-value transaction-id">
                                                            {payment.transactionId}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Approval Info */}
                                            {payment.status === 'approved' && payment.approvedBy && (
                                                <div className="approval-info">
                                                    <span className="approval-icon">✓</span>
                                                    <span className="approval-text">
                                                        تمت الموافقة بواسطة {payment.approvedBy} في{' '}
                                                        {new Date(payment.approvedDate!).toLocaleDateString('ar-EG')}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Pending Info */}
                                            {payment.status === 'pending' && payment.notes && (
                                                <div className="pending-info">
                                                    <span className="pending-icon">⏳</span>
                                                    <span className="pending-text">{payment.notes}</span>
                                                </div>
                                            )}

                                            {/* Rejection Info */}
                                            {payment.status === 'rejected' && payment.rejectionReason && (
                                                <div className="rejection-info">
                                                    <span className="rejection-icon">⚠️</span>
                                                    <div className="rejection-content">
                                                        <strong>سبب الرفض:</strong>
                                                        <p>{payment.rejectionReason}</p>
                                                        <button
                                                            className="resubmit-btn"
                                                            onClick={handleNewPayment}
                                                        >
                                                            إعادة الرفع
                                                        </button>
                                                    </div>
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
                            <h3>لا توجد مدفوعات</h3>
                            <p>لم تقم بأي مدفوعات بعد</p>
                            <button className="empty-action-btn" onClick={handleNewPayment}>
                                رفع إثبات دفع جديد
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
    .payment - history - page {
    min - height: 100vh;
    padding: 24px;
    background: linear - gradient(135deg, #F5F5F5 0 %, #E0E0E0 100 %);
}

                .page - header {
    max - width: 1200px;
    margin: 0 auto 32px;
}

                .header - content {
    background: white;
    padding: 24px 32px;
    border - radius: 16px;
    display: flex;
    justify - content: space - between;
    align - items: center;
    box - shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

                .page - title {
    font - size: 28px;
    font - weight: 800;
    color: #000;
    margin: 0 0 4px;
}

                .page - subtitle {
    font - size: 14px;
    color: #666;
    margin: 0;
}

                .header - actions {
    display: flex;
    gap: 12px;
}

                .new- payment - btn {
    padding: 12px 24px;
    background: linear - gradient(135deg, #10B981 0 %, #059669 100 %);
    color: white;
    border: none;
    border - radius: 10px;
    font - weight: 700;
    font - size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    box - shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

                .new- payment - btn:hover {
    transform: translateY(-2px);
    box - shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

                .back - btn {
    padding: 12px 24px;
    background: white;
    color: #333;
    border: 2px solid #E0E0E0;
    border - radius: 10px;
    font - weight: 700;
    font - size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
}

                .back - btn:hover {
    border - color: #D60000;
    color: #D60000;
}

                .content - wrapper {
    max - width: 1200px;
    margin: 0 auto;
}

                .stats - grid {
    display: grid;
    grid - template - columns: repeat(auto - fit, minmax(250px, 1fr));
    gap: 20px;
    margin - bottom: 32px;
}

                .stat - card {
    background: white;
    border - radius: 16px;
    padding: 24px;
    display: flex;
    align - items: center;
    gap: 20px;
    box - shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

                .stat - card:hover {
    transform: translateY(-4px);
    box - shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

                .stat - icon {
    width: 60px;
    height: 60px;
    border - radius: 12px;
    display: flex;
    align - items: center;
    justify - content: center;
    font - size: 28px;
    flex - shrink: 0;
}

                .stat - card--total.stat - icon {
    background: linear - gradient(135deg, #3B82F6 0 %, #1E40AF 100 %);
}

                .stat - card--approved.stat - icon {
    background: linear - gradient(135deg, #10B981 0 %, #059669 100 %);
}

                .stat - card--pending.stat - icon {
    background: linear - gradient(135deg, #F59E0B 0 %, #D97706 100 %);
}

                .stat - card--rejected.stat - icon {
    background: linear - gradient(135deg, #EF4444 0 %, #DC2626 100 %);
}

                .stat - content {
    flex: 1;
}

                .stat - label {
    font - size: 13px;
    color: #666;
    margin - bottom: 4px;
    font - weight: 600;
}

                .stat - value {
    font - size: 32px;
    font - weight: 900;
    color: #000;
    line - height: 1;
    margin - bottom: 4px;
}

                .stat - amount {
    font - size: 14px;
    color: #10B981;
    font - weight: 700;
}

                .filters - section {
    background: white;
    border - radius: 16px;
    padding: 24px;
    margin - bottom: 24px;
    box - shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

                .filter - group {
    margin - bottom: 20px;
}

                .filter - group: last - child {
    margin - bottom: 0;
}

                .filter - group label {
    display: block;
    font - weight: 700;
    font - size: 14px;
    color: #333;
    margin - bottom: 12px;
}

                .filter - buttons {
    display: flex;
    gap: 12px;
    flex - wrap: wrap;
}

                .filter - btn {
    padding: 10px 20px;
    background: white;
    border: 2px solid #E0E0E0;
    border - radius: 10px;
    font - weight: 600;
    font - size: 14px;
    color: #666;
    cursor: pointer;
    transition: all 0.3s ease;
}

                .filter - btn:hover {
    transform: translateY(-2px);
    box - shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

                .filter - btn--active {
    border - width: 2px;
    font - weight: 700;
    box - shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

                .payments - list {
    display: flex;
    flex - direction: column;
    gap: 20px;
}

                .payment - card {
    background: white;
    border - radius: 16px;
    overflow: hidden;
    box - shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

                .payment - card:hover {
    transform: translateY(-2px);
    box - shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

                .payment - card__header {
    padding: 20px 24px;
    border - bottom: 2px solid #F5F5F5;
    display: flex;
    justify - content: space - between;
    align - items: center;
}

                .payment - info {
    flex: 1;
}

                .payment - type {
    font - size: 13px;
    color: #666;
    margin - bottom: 8px;
    font - weight: 600;
}

                .payment - title {
    font - size: 18px;
    font - weight: 800;
    color: #000;
    margin: 0;
}

                .payment - status {
    padding: 8px 20px;
    border - radius: 20px;
    font - size: 13px;
    font - weight: 700;
    white - space: nowrap;
}

                .payment - card__body {
    padding: 24px;
}

                .payment - details - grid {
    display: grid;
    grid - template - columns: repeat(auto - fit, minmax(200px, 1fr));
    gap: 16px;
    margin - bottom: 16px;
}

                .detail - item {
    display: flex;
    flex - direction: column;
    gap: 4px;
}

                .detail - label {
    font - size: 12px;
    color: #666;
    font - weight: 600;
}

                .detail - value {
    font - size: 15px;
    color: #000;
    font - weight: 700;
}

                .detail - value.amount {
    font - size: 20px;
    color: #10B981;
}

                .transaction - id {
    font - family: 'Courier New', monospace;
    background: #F3F4F6;
    padding: 4px 8px;
    border - radius: 4px;
    font - size: 13px;
}

                .approval - info,
                .pending - info {
    margin - top: 16px;
    padding: 16px;
    border - radius: 12px;
    display: flex;
    align - items: center;
    gap: 12px;
    font - size: 14px;
}

                .approval - info {
    background: linear - gradient(135deg, #DCFCE7 0 %, #BBF7D0 100 %);
    color: #15803D;
}

                .pending - info {
    background: linear - gradient(135deg, #FEF3C7 0 %, #FDE68A 100 %);
    color: #92400E;
}

                .approval - icon,
                .pending - icon,
                .rejection - icon {
    font - size: 20px;
    flex - shrink: 0;
}

                .rejection - info {
    margin - top: 16px;
    padding: 16px;
    background: linear - gradient(135deg, #FEE2E2 0 %, #FECACA 100 %);
    border - radius: 12px;
    display: flex;
    align - items: flex - start;
    gap: 12px;
}

                .rejection - content {
    flex: 1;
}

                .rejection - content strong {
    display: block;
    color: #991B1B;
    margin - bottom: 8px;
}

                .rejection - content p {
    color: #7F1D1D;
    margin: 0 0 12px;
    font - size: 14px;
}

                .resubmit - btn {
    padding: 8px 16px;
    background: white;
    color: #DC2626;
    border: 2px solid #DC2626;
    border - radius: 8px;
    font - weight: 700;
    font - size: 13px;
    cursor: pointer;
    transition: all 0.3s ease;
}

                .resubmit - btn:hover {
    background: #DC2626;
    color: white;
}

                .empty - state {
    text - align: center;
    padding: 80px 20px;
    background: white;
    border - radius: 16px;
}

                .empty - icon {
    font - size: 80px;
    margin - bottom: 20px;
}

                .empty - state h3 {
    font - size: 24px;
    font - weight: 800;
    color: #000;
    margin: 0 0 12px;
}

                .empty - state p {
    font - size: 16px;
    color: #666;
    margin: 0 0 24px;
}

                .empty - action - btn {
    padding: 14px 32px;
    background: linear - gradient(135deg, #10B981 0 %, #059669 100 %);
    color: white;
    border: none;
    border - radius: 10px;
    font - weight: 700;
    font - size: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    box - shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

                .empty - action - btn:hover {
    transform: translateY(-2px);
    box - shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

@media(max - width: 768px) {
                    .payment - history - page {
        padding: 16px;
    }

                    .header - content {
        flex - direction: column;
        gap: 16px;
        padding: 20px;
    }

                    .header - actions {
        width: 100 %;
        flex - direction: column;
    }

                    .new- payment - btn,
                    .back - btn {
        width: 100 %;
    }

                    .stats - grid {
        grid - template - columns: 1fr;
    }

                    .payment - card__header {
        flex - direction: column;
        align - items: flex - start;
        gap: 12px;
    }

                    .payment - details - grid {
        grid - template - columns: 1fr;
    }
}
`}</style>
        </>
    );
}
