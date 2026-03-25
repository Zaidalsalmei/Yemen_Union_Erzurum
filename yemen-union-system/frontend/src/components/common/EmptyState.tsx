import { Button } from './Button';

interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
    return (
        <div className="empty-state animate-fadeIn">
            <span className="empty-state-icon">{icon}</span>
            <h3 className="empty-state-title">{title}</h3>
            {description && <p className="empty-state-description">{description}</p>}
            {action && (
                <Button onClick={action.onClick}>
                    {action.label}
                </Button>
            )}
        </div>
    );
}

// Error State component
interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
}

export function ErrorState({
    title = 'حدث خطأ',
    message = 'حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى.',
    onRetry
}: ErrorStateProps) {
    return (
        <div className="empty-state animate-fadeIn">
            <span className="empty-state-icon">⚠️</span>
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-description">{message}</p>
            {onRetry && (
                <Button onClick={onRetry} variant="secondary">
                    إعادة المحاولة
                </Button>
            )}
        </div>
    );
}
