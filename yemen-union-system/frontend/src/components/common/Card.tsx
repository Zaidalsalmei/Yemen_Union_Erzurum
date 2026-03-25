import type { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    glass?: boolean;
}

export function Card({ children, className = '', hover = true, glass = false }: CardProps) {
    const hoverClass = hover ? '' : 'hover:shadow-md';
    const glassClass = glass ? 'card-glass' : '';

    return (
        <div className={`card ${glassClass} ${hoverClass} ${className}`}>
            {children}
        </div>
    );
}

interface CardHeaderProps {
    children?: ReactNode;
    title?: string;
    subtitle?: string;
    action?: ReactNode;
    className?: string;
}

export function CardHeader({ children, title, subtitle, action, className = '' }: CardHeaderProps) {
    if (children) {
        return <div className={`card-header ${className}`}>{children}</div>;
    }

    return (
        <div className={`card-header ${className}`}>
            <div>
                {title && <h3 className="card-title">{title}</h3>}
                {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}

interface CardBodyProps {
    children: ReactNode;
    className?: string;
    noPadding?: boolean;
}

export function CardBody({ children, className = '', noPadding = false }: CardBodyProps) {
    return (
        <div className={`${noPadding ? '' : 'card-body'} ${className}`}>
            {children}
        </div>
    );
}

interface CardFooterProps {
    children: ReactNode;
    className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
    return (
        <div className={`card-footer ${className}`}>
            {children}
        </div>
    );
}
