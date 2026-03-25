import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    icon?: ReactNode;
    iconPosition?: 'start' | 'end';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, icon, iconPosition = 'start', className = '', ...props }, ref) => {
        return (
            <div className="form-group">
                {label && (
                    <label className="form-label">
                        {label}
                        {props.required && <span className="required">*</span>}
                    </label>
                )}
                <div className="relative">
                    {icon && iconPosition === 'start' && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            {icon}
                        </span>
                    )}
                    <input
                        ref={ref}
                        className={`form-input ${error ? 'error' : ''} ${icon && iconPosition === 'start' ? 'pr-12' : ''} ${icon && iconPosition === 'end' ? 'pl-12' : ''} ${className}`}
                        {...props}
                    />
                    {icon && iconPosition === 'end' && (
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            {icon}
                        </span>
                    )}
                </div>
                {error && (
                    <p className="form-error">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p className="form-helper">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

// Textarea component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="form-group">
                {label && (
                    <label className="form-label">
                        {label}
                        {props.required && <span className="required">*</span>}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={`form-input min-h-[120px] resize-y ${error ? 'error' : ''} ${className}`}
                    {...props}
                />
                {error && <p className="form-error">{error}</p>}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

// Select component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
    placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, placeholder, className = '', ...props }, ref) => {
        return (
            <div className="form-group">
                {label && (
                    <label className="form-label">
                        {label}
                        {props.required && <span className="required">*</span>}
                    </label>
                )}
                <select
                    ref={ref}
                    className={`form-input ${error ? 'error' : ''} ${className}`}
                    {...props}
                >
                    {placeholder && <option value="">{placeholder}</option>}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && <p className="form-error">{error}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';
