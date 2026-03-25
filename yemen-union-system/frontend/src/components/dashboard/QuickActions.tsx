import { useNavigate } from 'react-router-dom';

interface QuickAction {
    id: string;
    icon: string;
    label: string;
    link: string;
    highlight?: boolean;
    disabled?: boolean;
    external?: boolean;
}

interface QuickActionsProps {
    isExpired: boolean;
    pendingApproval: boolean;
    whatsappEnabled?: boolean;
    whatsappNumber?: string;
}

export function QuickActions({ isExpired, pendingApproval, whatsappEnabled, whatsappNumber }: QuickActionsProps) {
    const navigate = useNavigate();

    const actions: QuickAction[] = [
        {
            id: 'renew',
            icon: '💳',
            label: 'تجديد الاشتراك',
            link: '/memberships/renew',
            highlight: isExpired || pendingApproval,
        },
        {
            id: 'upload-proof',
            icon: '📄',
            label: 'رفع إثبات دفع',
            link: '/memberships/payment-proof',
        },
        {
            id: 'update-profile',
            icon: '✏️',
            label: 'تحديث بياناتي',
            link: '/profile/edit',
        },
        {
            id: 'activities',
            icon: '🎫',
            label: 'الأنشطة والفعاليات',
            link: '/member/activities',
        },
        {
            id: 'calendar',
            icon: '📅',
            label: 'التقويم',
            link: '/calendar',
        },
        {
            id: 'support',
            icon: '💬',
            label: 'الدعم / تذكرة جديدة',
            link: '/support/new',
        },
        {
            id: 'card',
            icon: '🎴',
            label: 'تحميل بطاقة العضو PDF',
            link: '/membership/card',
        },
    ];

    if (whatsappEnabled && whatsappNumber) {
        actions.push({
            id: 'whatsapp',
            icon: '📱',
            label: 'تواصل واتساب مع الإدارة',
            link: `https://wa.me/${whatsappNumber}`,
            external: true,
        });
    }

    const handleActionClick = (action: QuickAction) => {
        if (action.disabled) return;

        if (action.external) {
            window.open(action.link, '_blank');
        } else {
            navigate(action.link);
        }
    };

    return (
        <>
            <div className="quick-actions">
                <h2 className="quick-actions__title">🚀 إجراءات سريعة</h2>
                <div className="quick-actions__grid">
                    {actions.map((action) => (
                        <button
                            key={action.id}
                            className={`
                                quick-action-btn
                                ${action.highlight ? 'quick-action-btn--highlight' : ''}
                                ${action.disabled ? 'quick-action-btn--disabled' : ''}
                            `}
                            onClick={() => handleActionClick(action)}
                            disabled={action.disabled}
                        >
                            <span className="quick-action-btn__icon">{action.icon}</span>
                            <span className="quick-action-btn__label">{action.label}</span>
                            {action.external && (
                                <span className="quick-action-btn__external">↗</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <style>{`
                .quick-actions {
                    background: white;
                    border-radius: 20px;
                    padding: 28px;
                    margin-bottom: 32px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    border: 1px solid #E0E0E0;
                }

                .quick-actions__title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #D60000;
                    margin: 0 0 24px;
                }

                .quick-actions__grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 16px;
                }

                .quick-action-btn {
                    background: white;
                    border: 2px solid #E0E0E0;
                    border-radius: 12px;
                    padding: 20px 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-align: center;
                    position: relative;
                }

                .quick-action-btn:hover:not(.quick-action-btn--disabled) {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
                    border-color: #D60000;
                }

                .quick-action-btn:active:not(.quick-action-btn--disabled) {
                    transform: translateY(-2px);
                }

                .quick-action-btn--highlight {
                    background: linear-gradient(135deg, #FEE2E2 0%, #FEF2F2 100%);
                    border-color: #D60000;
                    border-width: 2px;
                    box-shadow: 0 0 20px rgba(214, 0, 0, 0.15);
                    animation: highlight-pulse 2s infinite;
                }

                @keyframes highlight-pulse {
                    0%, 100% {
                        box-shadow: 0 0 15px rgba(214, 0, 0, 0.15);
                    }
                    50% {
                        box-shadow: 0 0 25px rgba(214, 0, 0, 0.25);
                    }
                }

                .quick-action-btn--highlight .quick-action-btn__icon {
                    font-size: 36px;
                    animation: bounce 1s infinite;
                }

                @keyframes bounce {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-4px);
                    }
                }

                .quick-action-btn--highlight .quick-action-btn__label {
                    color: #D60000;
                    font-weight: 700;
                }

                .quick-action-btn--disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .quick-action-btn__icon {
                    font-size: 32px;
                    transition: transform 0.3s ease;
                }

                .quick-action-btn:hover:not(.quick-action-btn--disabled) .quick-action-btn__icon {
                    transform: scale(1.15);
                }

                .quick-action-btn__label {
                    font-size: 14px;
                    font-weight: 600;
                    color: #333333;
                    line-height: 1.4;
                }

                .quick-action-btn__external {
                    position: absolute;
                    top: 8px;
                    left: 8px;
                    font-size: 16px;
                    color: #666;
                }

                @media (max-width: 768px) {
                    .quick-actions__grid {
                        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                        gap: 12px;
                    }

                    .quick-action-btn {
                        padding: 16px 12px;
                    }

                    .quick-action-btn__icon {
                        font-size: 28px;
                    }

                    .quick-action-btn__label {
                        font-size: 13px;
                    }
                }
            `}</style>
        </>
    );
}
