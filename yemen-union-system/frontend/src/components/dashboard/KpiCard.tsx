import { ReactNode } from 'react';

interface KpiCardProps {
    icon: string;
    label: string;
    value: string | number;
    status?: 'success' | 'warning' | 'danger' | 'default';
    onClick?: () => void;
    subtitle?: string;
}

export function KpiCard({ icon, label, value, status = 'default', onClick, subtitle }: KpiCardProps) {
    const statusColors = {
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
        default: '#D60000',
    };

    const statusBackgrounds = {
        success: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
        warning: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
        danger: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
        default: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)',
    };

    return (
        <>
            <div
                className={`kpi-card ${onClick ? 'kpi-card--clickable' : ''}`}
                onClick={onClick}
                role={onClick ? 'button' : undefined}
                tabIndex={onClick ? 0 : undefined}
            >
                <div className="kpi-card__icon" style={{ color: statusColors[status] }}>
                    {icon}
                </div>
                <div className="kpi-card__content">
                    <div className="kpi-card__value" style={{ color: statusColors[status] }}>
                        {value}
                    </div>
                    <div className="kpi-card__label">{label}</div>
                    {subtitle && <div className="kpi-card__subtitle">{subtitle}</div>}
                </div>
            </div>

            <style>{`
                .kpi-card {
                    background: ${statusBackgrounds[status]};
                    border: 1px solid rgba(0, 0, 0, 0.08);
                    border-radius: 16px;
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .kpi-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 4px;
                    height: 100%;
                    background: ${statusColors[status]};
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .kpi-card:hover::before {
                    opacity: 1;
                }

                .kpi-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
                    border-color: ${statusColors[status]};
                }

                .kpi-card--clickable {
                    cursor: pointer;
                }

                .kpi-card--clickable:active {
                    transform: translateY(-2px);
                }

                .kpi-card__icon {
                    font-size: 32px;
                    flex-shrink: 0;
                    transition: transform 0.3s ease;
                }

                .kpi-card:hover .kpi-card__icon {
                    transform: scale(1.1);
                }

                .kpi-card__content {
                    flex: 1;
                    min-width: 0;
                }

                .kpi-card__value {
                    font-size: 26px;
                    font-weight: 800;
                    line-height: 1.2;
                    margin-bottom: 4px;
                }

                .kpi-card__label {
                    font-size: 14px;
                    color: #333333;
                    font-weight: 600;
                }

                .kpi-card__subtitle {
                    font-size: 12px;
                    color: #666666;
                    margin-top: 4px;
                }

                @media (max-width: 768px) {
                    .kpi-card {
                        padding: 16px;
                    }

                    .kpi-card__icon {
                        font-size: 28px;
                    }

                    .kpi-card__value {
                        font-size: 22px;
                    }

                    .kpi-card__label {
                        font-size: 13px;
                    }
                }
            `}</style>
        </>
    );
}
