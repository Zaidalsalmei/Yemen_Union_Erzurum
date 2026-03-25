import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

// ============================================
// TYPES
// ============================================
interface PermissionsContextType {
    permissions: string[];
    hasPermission: (permission: string) => boolean;
    hasAnyPermission: (permissions: string[]) => boolean;
    hasAllPermissions: (permissions: string[]) => boolean;
    canAccessModule: (module: string) => boolean;
    isAdmin: boolean;
    isPresident: boolean;
    loading: boolean;
    refreshPermissions: () => Promise<void>;
}

// Module to permissions mapping
const MODULE_PERMISSIONS: Record<string, string[]> = {
    dashboard: ['dashboard.view'],
    users: ['users.view_all', 'users.create', 'users.update', 'users.delete'],
    members: ['users.view_all', 'memberships.view_all'],
    memberships: ['memberships.view_all', 'memberships.create'],
    activities: ['activities.view_all', 'activities.view_published', 'activities.create'],
    calendar: ['activities.view_published'],
    finance: ['memberships.view_all', 'expenses.view_all'],
    sponsors: ['sponsors.view', 'sponsors.create'],
    sponsorships: ['sponsorships.view', 'sponsorships.create'],
    relations: ['sponsors.view', 'sponsorships.view'],
    reports: ['reports.generate'],
    settings: ['settings.view', 'settings.update'],
    roles: ['roles.view', 'roles.manage'],
};

// ============================================
// CONTEXT
// ============================================
const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function usePermissions() {
    const context = useContext(PermissionsContext);
    if (!context) {
        throw new Error('usePermissions must be used within PermissionsProvider');
    }
    return context;
}

// ============================================
// PROVIDER
// ============================================
interface PermissionsProviderProps {
    children: ReactNode;
}

export function PermissionsProvider({ children }: PermissionsProviderProps) {
    const { user, isAuthenticated } = useAuth();
    const [permissions, setPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Get user role name
    const userRole = user?.roles?.[0]?.name || '';
    const isPresident = userRole === 'president';
    const isAdmin = userRole === 'admin' || isPresident;

    // Load permissions on mount or when user changes
    const loadPermissions = useCallback(async () => {
        if (!isAuthenticated || !user?.id) {
            setPermissions([]);
            setLoading(false);
            return;
        }

        // President has all permissions
        if (isPresident) {
            setPermissions(['*']); // Wildcard for all permissions
            setLoading(false);
            return;
        }

        try {
            // ✅ Use the current user's permissions endpoint (public for authenticated users)
            const response = await api.get('/me/permissions');
            if (response.data?.data?.permissions) {
                setPermissions(response.data.data.permissions);
            }
        } catch (error) {
            console.error('Failed to load permissions:', error);
            // Fallback to basic permissions
            setPermissions([]);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user?.id, isPresident]);

    useEffect(() => {
        loadPermissions();
    }, [loadPermissions]);

    // Check if user has specific permission
    const hasPermission = useCallback((permission: string): boolean => {
        // President has all permissions
        if (isPresident || permissions.includes('*')) {
            return true;
        }
        return permissions.includes(permission);
    }, [permissions, isPresident]);

    // Check if user has any of the given permissions
    const hasAnyPermission = useCallback((perms: string[]): boolean => {
        if (isPresident || permissions.includes('*')) {
            return true;
        }
        return perms.some(p => permissions.includes(p));
    }, [permissions, isPresident]);

    // Check if user has all of the given permissions
    const hasAllPermissions = useCallback((perms: string[]): boolean => {
        if (isPresident || permissions.includes('*')) {
            return true;
        }
        return perms.every(p => permissions.includes(p));
    }, [permissions, isPresident]);

    // Check if user can access a module
    const canAccessModule = useCallback((module: string): boolean => {
        if (isPresident || permissions.includes('*')) {
            return true;
        }

        const modulePerms = MODULE_PERMISSIONS[module];
        if (!modulePerms) {
            return false;
        }

        // User needs at least one permission for the module
        return modulePerms.some(p => permissions.includes(p));
    }, [permissions, isPresident]);

    // Refresh permissions from API
    const refreshPermissions = useCallback(async () => {
        setLoading(true);
        await loadPermissions();
    }, [loadPermissions]);

    return (
        <PermissionsContext.Provider value={{
            permissions,
            hasPermission,
            hasAnyPermission,
            hasAllPermissions,
            canAccessModule,
            isAdmin,
            isPresident,
            loading,
            refreshPermissions,
        }}>
            {children}
        </PermissionsContext.Provider>
    );
}

// ============================================
// HOOK FOR ROUTE PROTECTION
// ============================================
export function useRequirePermission(permission: string): { hasAccess: boolean; loading: boolean } {
    const { hasPermission, loading } = usePermissions();
    return {
        hasAccess: hasPermission(permission),
        loading,
    };
}

export function useRequireModule(module: string): { hasAccess: boolean; loading: boolean } {
    const { canAccessModule, loading } = usePermissions();
    return {
        hasAccess: canAccessModule(module),
        loading,
    };
}
