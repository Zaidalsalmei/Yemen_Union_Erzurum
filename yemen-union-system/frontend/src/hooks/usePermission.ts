import { useAuth } from '../contexts/AuthContext';

/**
 * Check if current user has a specific permission
 */
// Helper to extract module from permission string (e.g. "users.read" -> "users")
function getModuleFromPermission(permission: string): string {
    return permission.split('.')[0];
}

export function usePermission(permission: string): boolean {
    const { user, permissions } = useAuth();

    if (!user) return false;

    // President has all permissions
    if (user.roles?.some((role: any) => (typeof role === 'string' ? role : role.name) === 'president')) {
        return true;
    }

    // Use permissions from context (which are fetched from /api/me/permissions)
    const allPermissions = new Set<string>(permissions || []);

    // Add permissions from user object just in case
    (user.permissions || []).forEach(p => allPermissions.add(p));
    user.roles?.forEach((role: any) => {
        if (typeof role !== 'string' && role.permissions) {
            role.permissions.forEach((p: string) => allPermissions.add(p));
        }
    });

    // Check for global wildcard
    if (allPermissions.has('*')) return true;

    // Check for exact match
    if (allPermissions.has(permission)) return true;

    // Check for module admin
    const module = getModuleFromPermission(permission);
    if (allPermissions.has(`${module}.admin`) || allPermissions.has(`${module}.manage`)) return true;

    // Check for write implying read
    if (permission.endsWith('.read') || permission.endsWith('.view')) {
        if (allPermissions.has(`${module}.write`) || allPermissions.has(`${module}.update`)) return true;
    }

    return false;
}

/**
 * Check if current user has any of the specified permissions
 */
export function useAnyPermission(permissions: string[]): boolean {
    // We can just reuse the single permission check logic
    return permissions.some(p => usePermission(p));
}

/**
 * Check if current user has a specific role
 */
export function useRole(roleName: string): boolean {
    const { user } = useAuth();
    if (!user) return false;
    return user.roles?.some(role => role.name === roleName) ?? false;
}
