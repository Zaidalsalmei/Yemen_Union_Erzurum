import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoadingPage } from './common';

interface ProtectedRouteProps {
    permission: string | string[];
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ permission, children }) => {
    const { hasPermission, hasAnyPermission, loading, isAuthenticated } = useAuth();

    if (loading) return <LoadingPage />;

    if (!isAuthenticated) return null; // Logic in App.tsx will handle redirect

    const allowed = Array.isArray(permission)
        ? hasAnyPermission(permission)
        : hasPermission(permission);

    if (!allowed) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[60vh] text-center bg-white rounded-3xl shadow-sm border border-gray-100" dir="rtl">
                <span className="text-8xl mb-6 animate-bounce">🔒</span>
                <h2 className="text-2xl font-black text-gray-800 mb-2">عذراً، غير مصرح لك</h2>
                <p className="text-gray-500 mb-6 font-bold">ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة</p>
                <div className="bg-red-50 p-4 rounded-2xl mb-8 max-w-md">
                    <p className="text-sm text-red-600 font-bold">يرجى التواصل مع إدارة الاتحاد (رئيس الاتحاد) إذا كنت تعتقد أن هذا خطأ.</p>
                </div>
                <button
                    onClick={() => window.history.back()}
                    className="px-10 py-4 bg-[#DC2626] text-white rounded-2xl font-black shadow-lg hover:scale-105 transition-all flex items-center gap-3"
                >
                    🔙 العودة للخلف
                </button>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
