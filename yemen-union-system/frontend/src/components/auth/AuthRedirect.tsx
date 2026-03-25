import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const AuthRedirect: React.FC = () => {
    const { isAuthenticated, isAdmin, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                navigate('/login');
            } else if (isAdmin) {
                navigate('/dashboard');
            } else {
                navigate('/member', { replace: true });
            }
        }
    }, [isAuthenticated, isAdmin, isLoading, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-[#DC2626]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-t-transparent border-[#DC2626] rounded-full animate-spin"></div>
                <p className="font-bold text-lg animate-pulse tracking-tighter">جاري توجيهك للمكان الصحيح... 🚀</p>
            </div>
        </div>
    );
};
