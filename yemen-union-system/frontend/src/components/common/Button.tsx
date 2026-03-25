import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: ReactNode;
    fullWidth?: boolean;
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    fullWidth = false,
    disabled,
    className = '',
    ...props
}: ButtonProps) {
    const baseClass = 'btn';
    const variantClass = `btn-${variant}`;
    const sizeClass = size !== 'md' ? `btn-${size}` : '';
    const loadingClass = loading ? 'btn-loading' : '';
    const widthClass = fullWidth ? 'w-full' : '';

    return (
        <button
            className={`${baseClass} ${variantClass} ${sizeClass} ${loadingClass} ${widthClass} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {icon && !loading && <span className="btn-icon-left">{icon}</span>}
            <span className="btn-text">{children}</span>
        </button>
    );
}

// Icon Button variant
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    label: string;
}

export function IconButton({
    icon,
    variant = 'ghost',
    size = 'md',
    label,
    className = '',
    ...props
}: IconButtonProps) {
    return (
        <button
            className={`btn btn-${variant} btn-icon ${className}`}
            aria-label={label}
            title={label}
            {...props}
        >
            {icon}
        </button>
    );
}
