import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface Role {
    id: number;
    name: string;
    display_name: string;
    display_name_ar: string;
    level: number;
}

interface Membership {
    status: string;
    days_remaining: number;
    end_date: string;
    progress_percentage: number;
    package_name: string;
}

interface AuthContextType {
    user: any;
    token: string | null;
    role: Role | null;
    permissions: string[];
    membership: Membership | null;
    unreadNotifications: number;
    isAdmin: boolean;        // role.name !== 'member' && role.level > 1
    isPresident: boolean;    // role.name === 'president'
    isLoading: boolean;
    isAuthenticated: boolean;
    hasPermission: (perm: string) => boolean;
    hasAnyPermission: (perms: string[]) => boolean;
    login: (credentials: any) => Promise<void>;
    logout: () => void;
    refreshPermissions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
    const [role, setRole] = useState<Role | null>(null);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [membership, setMembership] = useState<Membership | null>(null);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const refreshPermissions = useCallback(async () => {
        const currentToken = localStorage.getItem('access_token');
        if (!currentToken) {
            setIsLoading(false);
            return;
        }

        try {
            // ✅ Use api service to ensure correct headers/baseURL
            const response = await api.get('/me/permissions');

            if (response.data.success) {
                const { user, role, permissions, membership, unread_notifications } = response.data.data;
                setUser(user);
                setRole(role);
                setPermissions(permissions || []);
                setMembership(membership);
                setUnreadNotifications(unread_notifications || 0);
            }
        } catch (error: any) {
            console.error("[AuthContext] Error refreshing permissions:", error);
            if (error.response?.status === 401) {
                // Clear storage if token is invalid
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                setToken(null);
                setUser(null);
                setRole(null);
                setPermissions([]);
                setMembership(null);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshPermissions();
        const interval = setInterval(refreshPermissions, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [refreshPermissions]);

    const login = async (credentials: any) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', credentials);

            if (response.data.success) {
                const newToken = response.data.data.access_token;
                const newRefreshToken = response.data.data.refresh_token;

                // Save to localStorage with the correct key
                localStorage.setItem('access_token', newToken);
                if (newRefreshToken) {
                    localStorage.setItem('refresh_token', newRefreshToken);
                }

                setToken(newToken);
                await refreshPermissions();
            } else {
                throw new Error(response.data.message || 'فشل تسجيل الدخول');
            }
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setToken(null);
        setUser(null);
        setRole(null);
        setPermissions([]);
        setMembership(null);
        window.location.href = '/login';
    };

    const hasPermission = (perm: string): boolean => {
        // الرئيس لديه كامل الصلاحيات دائماً
        if (role?.name === 'president') return true;
        return permissions.includes(perm);
    };

    const hasAnyPermission = (perms: string[]): boolean => {
        if (role?.name === 'president') return true;
        return perms.some(p => permissions.includes(p));
    };

    // تعريف الرتب الإدارية (أي شيء غير عضو عادي ومستوى أعلى من 1)
    const isAdmin = !!(role && role.name !== 'member' && role.level > 1);
    const isPresident = role?.name === 'president';

    return (
        <AuthContext.Provider value={{
            user, token, role, permissions, membership, unreadNotifications,
            isAdmin, isPresident, isLoading, isAuthenticated: !!token,
            hasPermission, hasAnyPermission,
            login, logout, refreshPermissions
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
