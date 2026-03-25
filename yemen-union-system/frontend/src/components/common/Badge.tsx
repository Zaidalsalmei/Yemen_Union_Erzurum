import type { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'primary';

interface BadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
    icon?: ReactNode;
    className?: string;
}

export function Badge({ children, variant = 'gray', icon, className = '' }: BadgeProps) {
    return (
        <span className={`badge badge-${variant} ${className}`}>
            {icon && <span>{icon}</span>}
            {children}
        </span>
    );
}

// Status Badge with predefined mappings
interface StatusBadgeProps {
    status: string;
    className?: string;
}

const statusConfig: Record<string, { variant: BadgeVariant; label: string; icon: string }> = {
    pending: { variant: 'warning', label: 'قيد الانتظار', icon: '⏳' },
    active: { variant: 'success', label: 'نشط', icon: '✓' },
    suspended: { variant: 'warning', label: 'معلق', icon: '⏸' },
    banned: { variant: 'danger', label: 'محظور', icon: '✕' },
    expired: { variant: 'gray', label: 'منتهي', icon: '⌛' },
    cancelled: { variant: 'danger', label: 'ملغي', icon: '✕' },
    draft: { variant: 'gray', label: 'مسودة', icon: '📝' },
    published: { variant: 'success', label: 'منشور', icon: '✓' },
    ongoing: { variant: 'info', label: 'جاري', icon: '▶' },
    completed: { variant: 'success', label: 'مكتمل', icon: '✓' },
    approved: { variant: 'success', label: 'معتمد', icon: '✓' },
    rejected: { variant: 'danger', label: 'مرفوض', icon: '✕' },
    paid: { variant: 'success', label: 'مدفوع', icon: '💰' },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    const config = statusConfig[status] || { variant: 'gray' as BadgeVariant, label: status, icon: '•' };

    return (
        <Badge variant={config.variant} className={className}>
            <span className="text-xs ml-1">{config.icon}</span>
            {config.label}
        </Badge>
    );
}
