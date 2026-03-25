import type { MemberAccountStatus } from '../../types';

interface StatusBannerProps {
    status: MemberAccountStatus;
    suspensionReason?: string;
    daysRemaining?: number | null;
}

export function StatusBanner({ status, suspensionReason, daysRemaining }: StatusBannerProps) {
    if (status === 'active' && (daysRemaining === null || daysRemaining > 7)) {
        return null; // Don't show anything for active accounts with plenty of time
    }

    const banners = {
        active: daysRemaining !== null && daysRemaining <= 7 ? (
            <div className="status-banner status-banner--warning">
                <div className="status-banner__icon">⚠️</div>
                <div className="status-banner__content">
                    <h4>تنبيه: عضويتك على وشك الانتهاء</h4>
                    <p>ينتهي اشتراكك خلال {daysRemaining} يوم. جدّد الآن لتجنب توقف الخدمة.</p>
                </div>
                <a href="/memberships/renew" className="status-banner__action">
                    تجديد الآن
                </a>
            </div>
        ) : null,
        pending_approval: (
            <div className="status-banner status-banner--info">
                <div className="status-banner__icon">⏳</div>
                <div className="status-banner__content">
                    <h4>حسابك بانتظار الاعتماد</h4>
                    <p>سيتم مراجعة حسابك من قبل الإدارة خلال 24-48 ساعة.</p>
                </div>
            </div>
        ),
        expired: (
            <div className="status-banner status-banner--danger">
                <div className="status-banner__icon">❌</div>
                <div className="status-banner__content">
                    <h4>عضويتك منتهية</h4>
                    <p>انتهت صلاحية عضويتك. جدّد الآن للاستمرار في الخدمات.</p>
                </div>
                <a href="/memberships/renew" className="status-banner__action status-banner__action--urgent">
                    تجديد الآن
                </a>
            </div>
        ),
        suspended: (
            <div className="status-banner status-banner--dark">
                <div className="status-banner__icon">🚫</div>
                <div className="status-banner__content">
                    <h4>تم إيقاف حسابك</h4>
                    <p>{suspensionReason || 'لمزيد من التفاصيل، يرجى التواصل مع الإدارة.'}</p>
                </div>
                <a href="/support" className="status-banner__action">
                    تواصل مع الإدارة
                </a>
            </div>
        ),
    };

    return (
        <>
            {banners[status]}
            <style>{`
                .status-banner {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 20px 24px;
                    border-radius: 16px;
                    margin-bottom: 24px;
                    animation: slideDown 0.3s ease-out;
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .status-banner__icon {
                    font-size: 32px;
                    flex-shrink: 0;
                }

                .status-banner__content {
                    flex: 1;
                }

                .status-banner__content h4 {
                    margin: 0 0 4px;
                    font-weight: 700;
                    font-size: 16px;
                }

                .status-banner__content p {
                    margin: 0;
                    font-size: 14px;
                    opacity: 0.9;
                }

                .status-banner__action {
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 14px;
                    text-decoration: none;
                    flex-shrink: 0;
                    transition: all 0.2s ease;
                }

                .status-banner--warning {
                    background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
                    color: #78350F;
                    border: 1px solid #FCD34D;
                }

                .status-banner--warning .status-banner__action {
                    background: #F59E0B;
                    color: white;
                }

                .status-banner--warning .status-banner__action:hover {
                    background: #D97706;
                    transform: translateY(-1px);
                }

                .status-banner--info {
                    background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%);
                    color: #1E40AF;
                    border: 1px solid #93C5FD;
                }

                .status-banner--danger {
                    background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
                    color: #991B1B;
                    border: 1px solid #FCA5A5;
                }

                .status-banner--danger .status-banner__action--urgent {
                    background: #DC2626;
                    color: white;
                    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0%, 100% {
                        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
                    }
                    50% {
                        box-shadow: 0 4px 16px rgba(220, 38, 38, 0.5);
                    }
                }

                .status-banner--danger .status-banner__action--urgent:hover {
                    background: #B91C1C;
                    transform: translateY(-1px);
                }

                .status-banner--dark {
                    background: linear-gradient(135deg, #374151 0%, #1F2937 100%);
                    color: white;
                    border: 1px solid #4B5563;
                }

                .status-banner--dark .status-banner__action {
                    background: white;
                    color: #1F2937;
                }

                .status-banner--dark .status-banner__action:hover {
                    background: #F3F4F6;
                    transform: translateY(-1px);
                }

                @media (max-width: 768px) {
                    .status-banner {
                        flex-direction: column;
                        text-align: center;
                    }
                    
                    .status-banner__action {
                        width: 100%;
                        text-align: center;
                    }
                }
            `}</style>
        </>
    );
}
