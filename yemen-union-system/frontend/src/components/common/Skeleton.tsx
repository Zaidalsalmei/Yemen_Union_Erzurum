

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    className?: string;
}

export function Skeleton({ width = '100%', height = '20px', borderRadius = '8px', className = '' }: SkeletonProps) {
    return (
        <div
            className={`skeleton ${className}`}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
                borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
            }}
        />
    );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
    return (
        <div className={`skeleton-text ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    height="14px"
                    width={i === lines - 1 ? '60%' : '100%'}
                    className="skeleton-line"
                />
            ))}
        </div>
    );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
    return (
        <div className={`skeleton-card ${className}`}>
            <Skeleton height="140px" borderRadius="12px 12px 0 0" />
            <div className="skeleton-card-content">
                <Skeleton height="20px" width="70%" />
                <SkeletonText lines={2} />
                <div className="skeleton-card-footer">
                    <Skeleton height="32px" width="80px" borderRadius="6px" />
                    <Skeleton height="32px" width="32px" borderRadius="50%" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }: { rows?: number; cols?: number; className?: string }) {
    return (
        <div className={`skeleton-table ${className}`}>
            {/* Header */}
            <div className="skeleton-table-header">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} height="16px" width={`${60 + Math.random() * 40}%`} />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="skeleton-table-row">
                    {Array.from({ length: cols }).map((_, colIndex) => (
                        <Skeleton
                            key={colIndex}
                            height="14px"
                            width={colIndex === 0 ? '80%' : `${50 + Math.random() * 50}%`}
                        />
                    ))}
                </div>
            ))}

            <style>{`
                .skeleton {
                    background: linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 50%, #E5E7EB 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                }

                .skeleton-text {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .skeleton-card {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .skeleton-card-content {
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .skeleton-card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 8px;
                }

                .skeleton-table {
                    display: flex;
                    flex-direction: column;
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .skeleton-table-header {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                    gap: 16px;
                    padding: 16px 20px;
                    background: #F9FAFB;
                    border-bottom: 1px solid #E5E7EB;
                }

                .skeleton-table-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                    gap: 16px;
                    padding: 16px 20px;
                    border-bottom: 1px solid #F3F4F6;
                }

                .skeleton-table-row:last-child {
                    border-bottom: none;
                }

                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
}

export function SkeletonDashboard() {
    return (
        <div className="skeleton-dashboard">
            {/* Stats Row */}
            <div className="skeleton-stats-row">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton-stat-card">
                        <div className="skeleton-stat-icon">
                            <Skeleton width={48} height={48} borderRadius="12px" />
                        </div>
                        <div className="skeleton-stat-content">
                            <Skeleton width="60%" height="14px" />
                            <Skeleton width="40%" height="28px" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="skeleton-charts-row">
                <div className="skeleton-chart-card">
                    <Skeleton width="40%" height="20px" />
                    <Skeleton height="200px" borderRadius="8px" />
                </div>
                <div className="skeleton-chart-card">
                    <Skeleton width="40%" height="20px" />
                    <Skeleton height="200px" borderRadius="8px" />
                </div>
            </div>

            {/* Table */}
            <SkeletonTable rows={5} cols={5} />

            <style>{`
                .skeleton-dashboard {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .skeleton-stats-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 20px;
                }

                .skeleton-stat-card {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 20px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .skeleton-stat-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .skeleton-charts-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 20px;
                }

                .skeleton-chart-card {
                    padding: 20px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
            `}</style>
        </div>
    );
}

export function SkeletonList({ items = 5 }: { items?: number }) {
    return (
        <div className="skeleton-list">
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="skeleton-list-item">
                    <Skeleton width={48} height={48} borderRadius="50%" />
                    <div className="skeleton-list-content">
                        <Skeleton width="60%" height="16px" />
                        <Skeleton width="40%" height="12px" />
                    </div>
                    <Skeleton width={80} height={32} borderRadius="6px" />
                </div>
            ))}

            <style>{`
                .skeleton-list {
                    display: flex;
                    flex-direction: column;
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .skeleton-list-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px 20px;
                    border-bottom: 1px solid #F3F4F6;
                }

                .skeleton-list-item:last-child {
                    border-bottom: none;
                }

                .skeleton-list-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
            `}</style>
        </div>
    );
}
