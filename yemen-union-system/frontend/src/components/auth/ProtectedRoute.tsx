import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    permission?: string | string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, permission }) => {
    const { isAuthenticated, isLoading, hasPermission, hasAnyPermission } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-10 h-10 border-4 border-t-[#DC2626] border-gray-200 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Permission check if route is restricted
    if (permission) {
        const allowed = Array.isArray(permission)
            ? hasAnyPermission(permission)
            : hasPermission(permission);

        if (!allowed) {
            return (
                <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-3xl m-4">
                    <span className="text-8xl mb-8 animate-bounce">🔒</span>
                    <h1 className="text-3xl font-black text-gray-800 mb-3 tracking-tighter">عذراً.. الوصول محظور!</h1>
                    <p className="text-gray-500 font-bold max-w-sm mb-10 leading-relaxed text-sm">لا تملك الصلاحية الكافية للدخول لهذه الصفحة. إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع المسؤول.</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-10 py-4 bg-[#DC2626] text-white rounded-3xl font-black shadow-2xl shadow-red-100 hover:scale-110 active:scale-95 transition-all text-sm"
                    >
                        🏠 العودة للرئيسية
                    </button>
                </div>
            );
        }
    }

    return <>{children}</>;
};
