interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
    const sizeClasses = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-[3px]',
        lg: 'w-12 h-12 border-4',
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div
                className={`${sizeClasses[size]} rounded-full border-primary-200 border-t-primary-600 animate-spin`}
                role="status"
                aria-label="جاري التحميل"
            />
        </div>
    );
}

interface LoadingPageProps {
    message?: string;
}

export function LoadingPage({ message = 'جاري التحميل...' }: LoadingPageProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center animate-fadeIn">
                <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto shadow-lg">
                        <span className="text-3xl">🎓</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent-400 rounded-lg animate-pulse" />
                </div>
                <Spinner size="md" className="mb-4" />
                <p className="text-gray-600 font-medium">{message}</p>
            </div>
        </div>
    );
}

// Skeleton loading components
interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return <div className={`skeleton ${className}`} />;
}

export function SkeletonCard() {
    return (
        <div className="card p-6">
            <div className="flex items-center gap-4 mb-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            <Skeleton className="h-20 w-full" />
        </div>
    );
}

export function SkeletonTable() {
    return (
        <div className="card">
            <div className="p-4 border-b border-gray-100">
                <Skeleton className="h-4 w-1/4" />
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 border-b border-gray-50 flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                        <Skeleton className="h-4 w-1/3 mb-2" />
                        <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
            ))}
        </div>
    );
}
