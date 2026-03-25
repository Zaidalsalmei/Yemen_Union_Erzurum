
export const MODULES = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: 'home' },
    { id: 'users', label: 'الأعضاء', icon: 'users' },
    { id: 'memberships', label: 'الاشتراكات', icon: 'card' },
    { id: 'activities', label: 'الأنشطة والفعاليات', icon: 'activity' },
    { id: 'calendar', label: 'التقويم', icon: 'calendar' },
    { id: 'finance', label: 'المالية', icon: 'money' },
    { id: 'reports', label: 'التقارير', icon: 'chart' },
    { id: 'relations', label: 'العلاقات والرعايات', icon: 'heart' },
    { id: 'settings', label: 'الإعدادات', icon: 'settings' },
] as const;

export const PERMISSION_LEVELS = [
    { id: 'read', label: 'عرض', description: 'السماح برؤية المحتوى فقط' },
    { id: 'write', label: 'إضافة/تعديل', description: 'السماح بالإضافة والتعديل' },
    { id: 'delete', label: 'حذف', description: 'السماح بالحذف' },
    { id: 'admin', label: 'إدارة كاملة', description: 'كامل الصلاحيات مع الإعدادات' },
] as const;

export type ModuleId = typeof MODULES[number]['id'];
export type PermissionLevel = typeof PERMISSION_LEVELS[number]['id'];

export const DEFAULT_ROLES = [
    {
        id: 1,
        name: 'president',
        display_name_ar: 'رئيس الاتحاد',
        description_ar: 'كامل الصلاحيات على النظام',
        is_system_role: true,
        permissions: ['*'], // Logic needs to handle wildcard or map all
    },
    {
        id: 2,
        name: 'admin',
        display_name_ar: 'مدير النظام',
        description_ar: 'صلاحيات إدارية واسعة',
        is_system_role: true,
        permissions: ['dashboard.read', 'users.admin', 'memberships.admin', 'activities.admin', 'settings.read'],
    },
    {
        id: 3,
        name: 'media_manager',
        display_name_ar: 'المسؤول الإعلامي',
        description_ar: 'إدارة الأنشطة والمحتوى',
        is_system_role: false,
        permissions: ['dashboard.read', 'activities.admin', 'calendar.admin', 'reports.read'],
    },
    {
        id: 4,
        name: 'member',
        display_name_ar: 'عضو',
        description_ar: 'صلاحيات محدودة للعضو',
        is_system_role: true,
        permissions: ['activities.read', 'calendar.read'],
    },
];

/**
 * Generate full permission string (e.g. "users.read")
 */
export function getPermissionString(module: string, level: string): string {
    return `${module}.${level}`;
}

/**
 * Check if a permission string matches module and level
 */
export function hasPermissionInModule(permissions: string[], module: string, level: string): boolean {
    if (permissions.includes('*')) return true;
    if (permissions.includes(`${module}.admin`)) return true; // Admin implies all lower levels? Maybe not, strict RBAC usually requires explicit or hierarchy.
    // For this app, let's assume 'admin' includes everything for that module, but strict checking is better.
    // User requirement: "Modules support: read / write / admin"
    // Usually admin > write > read.

    if (level === 'read') {
        return permissions.some(p => p === `${module}.read` || p === `${module}.write` || p === `${module}.admin`);
    }
    if (level === 'write') {
        return permissions.some(p => p === `${module}.write` || p === `${module}.admin`);
    }
    if (level === 'delete') {
        return permissions.some(p => p === `${module}.delete` || p === `${module}.admin`);
    }

    return permissions.includes(`${module}.${level}`);
}

/**
 * Format permission string to readable Arabic (e.g. "users.read" -> "الأعضاء: عرض")
 */
export function formatPermission(permission: string): string {
    if (permission === '*') return 'كل الصلاحيات';

    const [moduleId, levelId] = permission.split('.');
    const module = MODULES.find(m => m.id === moduleId);
    const level = PERMISSION_LEVELS.find(l => l.id === levelId as PermissionLevel);

    if (module && level) {
        return `${module.label}: ${level.label}`;
    }
    return permission;
}
