import type { MemberSubscription } from '../../types';

interface SubscriptionCardProps {
    subscription: MemberSubscription;
    onViewHistory: () => void;
    onUploadProof: () => void;
}

export function SubscriptionCard({ subscription, onViewHistory, onUploadProof }: SubscriptionCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return '#16A34A';
            case 'expired':
                return '#DC2626';
            case 'pending':
                return '#F59E0B';
            default:
                return '#6B7280';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active':
                return subscription.is_paid ? 'نشط ومدفوع' : 'نشط - بانتظار الدفع';
            case 'expired':
                return 'منتهي';
            case 'pending':
                return 'بانتظار التفعيل';
            default:
                return status;
        }
    };

    const getProofStatusBadge = () => {
        if (!subscription.payment_proof) return null;

        const proof = subscription.payment_proof;
        const statusMap = {
            pending: { label: 'قيد المراجعة', color: '#F59E0B', bg: '#FEF3C7' },
            approved: { label: 'مقبول', color: '#16A34A', bg: '#DCFCE7' },
            rejected: { label: 'مرفوض', color: '#DC2626', bg: '#FEE2E2' },
        };

        const statusStyle = statusMap[proof.status];

        return (
            <div
                className="proof-status-badge"
                style={{
                    backgroundColor: statusStyle?.bg,
                    color: statusStyle?.color
                }}
            >
                {statusStyle?.label}
            </div>
        );
    };

    const progressPercentage = subscription.days_until_expiry !== null && subscription.days_until_expiry >= 0
        ? Math.max(0, (subscription.days_until_expiry / 365) * 100)
        : 0;

    return (
        <>
            <div className="subscription-card">
                <h2 className="subscription-card__title">📊 حالة الاشتراك</h2>

                <div className="subscription-card__header">
                    <div>
                        <div className="subscription-card__package">{subscription.package_name}</div>
                        <div
                            className="subscription-card__status"
                            style={{ color: getStatusColor(subscription.status) }}
                        >
                            {getStatusLabel(subscription.status)}
                        </div>
                    </div>
                    <div className="subscription-card__amount">
                        <div className="subscription-card__amount-value">
                            {subscription.amount} {subscription.currency}
                        </div>
                        <div className="subscription-card__amount-label">قيمة الاشتراك</div>
                    </div>
                </div>

                {subscription.end_date && (
                    <div className="subscription-card__dates">
                        <div className="date-item">
                            <span className="date-item__label">تاريخ البداية</span>
                            <span className="date-item__value">
                                {new Date(subscription.start_date).toLocaleDateString('ar-EG')}
                            </span>
                        </div>
                        <div className="date-item">
                            <span className="date-item__label">تاريخ الانتهاء</span>
                            <span className="date-item__value">
                                {new Date(subscription.end_date).toLocaleDateString('ar-EG')}
                            </span>
                        </div>
                    </div>
                )}

                {subscription.days_until_expiry !== null && subscription.days_until_expiry >= 0 && (
                    <div className="subscription-card__progress">
                        <div className="progress-label">
                            ينتهي خلال {subscription.days_until_expiry} يوم
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-bar__fill"
                                style={{
                                    width: `${progressPercentage}%`,
                                    backgroundColor: subscription.days_until_expiry <= 7 ? '#DC2626' : '#16A34A'
                                }}
                            />
                        </div>
                    </div>
                )}

                {subscription.last_payment && (
                    <div className="subscription-card__last-payment">
                        <div className="last-payment__title">آخر دفعة</div>
                        <div className="last-payment__details">
                            <span>{subscription.last_payment.amount} {subscription.last_payment.currency}</span>
                            <span>•</span>
                            <span>{new Date(subscription.last_payment.payment_date).toLocaleDateString('ar-EG')}</span>
                            <span>•</span>
                            <span
                                className="last-payment__status"
                                style={{ color: getStatusColor(subscription.last_payment.status) }}
                            >
                                {subscription.last_payment.status === 'approved' ? 'مقبول' :
                                    subscription.last_payment.status === 'pending' ? 'بانتظار المراجعة' : 'مرفوض'}
                            </span>
                        </div>
                    </div>
                )}

                {subscription.payment_proof && (
                    <div className="subscription-card__proof">
                        <div className="proof-info">
                            <span>حالة إثبات الدفع:</span>
                            {getProofStatusBadge()}
                        </div>
                        {subscription.payment_proof.status === 'rejected' && subscription.payment_proof.rejection_reason && (
                            <div className="proof-rejection">
                                <strong>سبب الرفض:</strong> {subscription.payment_proof.rejection_reason}
                            </div>
                        )}
                    </div>
                )}

                {subscription.days_until_expiry !== null && subscription.days_until_expiry <= 7 && subscription.days_until_expiry >= 0 && (
                    <div className="subscription-card__reminder">
                        ⏰ تذكير: اشتراكك على وشك الانتهاء. جدّد الآن لتجنب توقف الخدمة.
                    </div>
                )}

                <div className="subscription-card__actions">
                    <button className="action-btn action-btn--primary" onClick={onUploadProof}>
                        {subscription.payment_proof?.status === 'rejected' ? 'إعادة رفع الإثبات' : 'رفع إثبات دفع'}
                    </button>
                    <button className="action-btn action-btn--secondary" onClick={onViewHistory}>
                        عرض سجل المدفوعات
                    </button>
                </div>
            </div>

            <style>{`
                .subscription-card {
                    background: white;
                    border-radius: 20px;
                    padding: 28px;
                    margin-bottom: 32px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    border: 1px solid #E0E0E0;
                }

                .subscription-card__title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #D60000;
                    margin: 0 0 24px;
                }

                .subscription-card__header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 24px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #F5F5F5;
                }

                .subscription-card__package {
                    font-size: 18px;
                    font-weight: 700;
                    color: #000000;
                    margin-bottom: 4px;
                }

                .subscription-card__status {
                    font-size: 14px;
                    font-weight: 600;
                }

                .subscription-card__amount {
                    text-align: left;
                }

                .subscription-card__amount-value {
                    font-size: 24px;
                    font-weight: 800;
                    color: #D60000;
                    line-height: 1.2;
                }

                .subscription-card__amount-label {
                    font-size: 13px;
                    color: #666;
                    margin-top: 4px;
                }

                .subscription-card__dates {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 24px;
                }

                .date-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .date-item__label {
                    font-size: 13px;
                    color: #666;
                }

                .date-item__value {
                    font-size: 15px;
                    font-weight: 600;
                    color: #000;
                }

                .subscription-card__progress {
                    margin-bottom: 24px;
                }

                .progress-label {
                    font-size: 14px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 8px;
                }

                .progress-bar {
                    height: 12px;
                    background: #F5F5F5;
                    border-radius: 8px;
                    overflow: hidden;
                }

                .progress-bar__fill {
                    height: 100%;
                    border-radius: 8px;
                    transition: width 0.5s ease;
                }

                .subscription-card__last-payment {
                    background: #F9FAFB;
                    padding: 16px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                }

                .last-payment__title {
                    font-size: 13px;
                    color: #666;
                    margin-bottom: 6px;
                }

                .last-payment__details {
                    font-size: 14px;
                    color: #333;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .last-payment__status {
                    font-weight: 600;
                }

                .subscription-card__proof {
                    background: #F0F9FF;
                    border: 1px solid #BFDBFE;
                    padding: 16px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                }

                .proof-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 14px;
                    color: #333;
                    margin-bottom: 8px;
                }

                .proof-status-badge {
                    padding: 4px 12px;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 13px;
                }

                .proof-rejection {
                    font-size: 13px;
                    color: #DC2626;
                    margin-top: 8px;
                    padding: 12px;
                    background: #FEE2E2;
                    border-radius: 8px;
                }

                .subscription-card__reminder {
                    background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
                    color: #78350F;
                    padding: 16px;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    margin-bottom: 20px;
                    border: 1px solid #FCD34D;
                }

                .subscription-card__actions {
                    display: flex;
                    gap: 12px;
                }

                .action-btn {
                    flex: 1;
                    padding: 12px 20px;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: none;
                }

                .action-btn--primary {
                    background: linear-gradient(135deg, #D60000 0%, #8A0000 100%);
                    color: white;
                    box-shadow: 0 4px 12px rgba(214, 0, 0, 0.3);
                }

                .action-btn--primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(214, 0, 0, 0.4);
                }

                .action-btn--secondary {
                    background: white;
                    color: #333;
                    border: 2px solid #E0E0E0;
                }

                .action-btn--secondary:hover {
                    border-color: #D60000;
                    color: #D60000;
                    transform: translateY(-2px);
                }

                @media (max-width: 768px) {
                    .subscription-card__header {
                        flex-direction: column-reverse;
                        gap: 16px;
                    }

                    .subscription-card__amount {
                        text-align: right;
                    }

                    .subscription-card__dates {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }

                    .subscription-card__actions {
                        flex-direction: column;
                    }
                }
            `}</style>
        </>
    );
}
