import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const PERMISSION_LABELS: Record<string, { label: string; description: string }> = {
    'users.view_all': { label: 'عرض جميع الأعضاء', description: 'مشاهدة قائمة جميع الأعضاء وبياناتهم' },
    'users.view_own': { label: 'عرض بياناتي', description: 'مشاهدة بياناتي الشخصية فقط' },
    'users.create': { label: 'إضافة عضو', description: 'إنشاء حساب عضو جديد في النظام' },
    'users.update_all': { label: 'تعديل الأعضاء', description: 'تعديل بيانات أي عضو في النظام' },
    'users.update_own': { label: 'تعديل بياناتي', description: 'تعديل بياناتي الشخصية فقط' },
    'users.delete': { label: 'حذف عضو', description: 'حذف حساب عضو نهائياً' },
    'users.verify': { label: 'تفعيل عضو', description: 'الموافقة على حساب عضو جديد وتفعيله' },
    'users.ban': { label: 'حظر عضو', description: 'حظر حساب عضو ومنعه من الدخول' },
    'users.export': { label: 'تصدير الأعضاء', description: 'تصدير بيانات الأعضاء كملف Excel أو PDF' },
    'memberships.view_all': { label: 'عرض جميع الاشتراكات', description: 'مشاهدة كل الاشتراكات وحالتها' },
    'memberships.view_own': { label: 'عرض اشتراكي', description: 'مشاهدة حالة اشتراكي الشخصي' },
    'memberships.create': { label: 'إنشاء اشتراك', description: 'إنشاء اشتراك جديد لعضو' },
    'memberships.update': { label: 'تعديل اشتراك', description: 'تعديل بيانات أو حالة اشتراك' },
    'memberships.approve': { label: 'الموافقة على اشتراك', description: 'قبول أو رفض طلبات الاشتراك' },
    'memberships.renew': { label: 'تجديد اشتراك', description: 'تجديد الاشتراك الشخصي' },
    'activities.view': { label: 'عرض الأنشطة', description: 'مشاهدة الأنشطة والفعاليات المتاحة' },
    'activities.create': { label: 'إنشاء نشاط', description: 'إنشاء نشاط أو فعالية جديدة' },
    'activities.update': { label: 'تعديل نشاط', description: 'تعديل تفاصيل نشاط أو فعالية' },
    'activities.delete': { label: 'حذف نشاط', description: 'حذف نشاط أو فعالية' },
    'activities.publish': { label: 'نشر نشاط', description: 'نشر نشاط وإتاحته للأعضاء' },
    'activities.join': { label: 'الانضمام لنشاط', description: 'التسجيل والمشاركة في نشاط' },
    'activities.checkin': { label: 'تسجيل حضور', description: 'تسجيل حضور المشاركين في نشاط' },
    'activities.manage_participants': { label: 'إدارة المشاركين', description: 'إدارة قائمة المشاركين في نشاط' },
    'calendar.view': { label: 'عرض التقويم', description: 'مشاهدة تقويم الفعاليات والأحداث' },
    'calendar.manage': { label: 'إدارة التقويم', description: 'إضافة وتعديل وحذف أحداث التقويم' },
    'posts.view': { label: 'عرض المنشورات', description: 'مشاهدة المنشورات والإعلانات' },
    'posts.create': { label: 'إنشاء منشور', description: 'كتابة منشور أو إعلان جديد' },
    'posts.update': { label: 'تعديل منشور', description: 'تعديل محتوى منشور' },
    'posts.delete': { label: 'حذف منشور', description: 'حذف منشور أو إعلان' },
    'posts.publish': { label: 'نشر منشور', description: 'نشر منشور وإتاحته للأعضاء' },
    'sponsors.view': { label: 'عرض الجهات الداعمة', description: 'مشاهدة قائمة الجهات الداعمة' },
    'sponsors.create': { label: 'إضافة جهة داعمة', description: 'إضافة جهة داعمة جديدة للنظام' },
    'sponsors.update': { label: 'تعديل جهة داعمة', description: 'تعديل بيانات جهة داعمة' },
    'sponsors.delete': { label: 'حذف جهة داعمة', description: 'حذف جهة داعمة من النظام' },
    'sponsorships.view': { label: 'عرض الرعايات', description: 'مشاهدة قائمة الرعايات والتبرعات' },
    'sponsorships.create': { label: 'إنشاء رعاية', description: 'تسجيل رعاية أو تبرع جديد' },
    'finance.view': { label: 'عرض المالية', description: 'مشاهدة التقارير والمعاملات المالية' },
    'finance.create': { label: 'إنشاء معاملة', description: 'تسجيل معاملة مالية جديدة' },
    'finance.update': { label: 'تعديل معاملة', description: 'تعديل بيانات معاملة مالية' },
    'finance.approve': { label: 'اعتماد معاملة', description: 'الموافقة على معاملة مالية' },
    'finance.delete': { label: 'حذف معاملة', description: 'حذف معاملة مالية' },
    'finance.export': { label: 'تصدير المالية', description: 'تصدير التقارير المالية' },
    'reports.view': { label: 'عرض التقارير', description: 'مشاهدة التقارير والإحصائيات' },
    'reports.export': { label: 'تصدير التقارير', description: 'تصدير التقارير كملفات' },
    'settings.view': { label: 'عرض الإعدادات', description: 'مشاهدة إعدادات النظام' },
    'settings.update': { label: 'تعديل الإعدادات', description: 'تعديل إعدادات النظام العامة' },
    'settings.branding': { label: 'إدارة الهوية البصرية', description: 'تعديل الشعار والألوان والهوية' },
    'roles.view': { label: 'عرض الأدوار', description: 'مشاهدة الأدوار والصلاحيات' },
    'roles.manage': { label: 'إدارة الأدوار', description: 'إنشاء وتعديل وحذف الأدوار والصلاحيات' },
    'audit.view': { label: 'عرض سجل النشاطات', description: 'مشاهدة سجل العمليات والتغييرات' },
    'audit.manage': { label: 'إدارة السجل', description: 'حذف وإدارة السجلات القديمة' },
    'academic.view': { label: 'عرض المحتوى الأكاديمي', description: 'مشاهدة الموارد الأكاديمية' },
    'academic.create': { label: 'إضافة محتوى أكاديمي', description: 'رفع موارد أكاديمية جديدة' },
    'academic.update': { label: 'تعديل محتوى أكاديمي', description: 'تعديل الموارد الأكاديمية' },
    'academic.delete': { label: 'حذف محتوى أكاديمي', description: 'حذف الموارد الأكاديمية' },
    'academic.manage': { label: 'إدارة المحتوى الأكاديمي', description: 'إدارة كاملة للموارد الأكاديمية' },
};

const CATEGORY_LABELS: Record<string, { label: string; icon: string; color: string }> = {
    'users': { label: 'إدارة الأعضاء', icon: '👥', color: '#3B82F6' },
    'memberships': { label: 'الاشتراكات', icon: '📋', color: '#10B981' },
    'activities': { label: 'الأنشطة والفعاليات', icon: '🎯', color: '#F59E0B' },
    'calendar': { label: 'التقويم', icon: '📅', color: '#6366F1' },
    'posts': { label: 'المنشورات والإعلانات', icon: '📢', color: '#EC4899' },
    'sponsors': { label: 'الجهات الداعمة', icon: '🤝', color: '#14B8A6' },
    'sponsorships': { label: 'الرعايات', icon: '🎁', color: '#F97316' },
    'finance': { label: 'الإدارة المالية', icon: '💰', color: '#EF4444' },
    'reports': { label: 'التقارير', icon: '📊', color: '#8B5CF6' },
    'settings': { label: 'الإعدادات', icon: '⚙️', color: '#6B7280' },
    'roles': { label: 'الأدوار والصلاحيات', icon: '🔐', color: '#DC2626' },
    'audit': { label: 'سجل النشاطات', icon: '📝', color: '#0EA5E9' },
    'academic': { label: 'المحتوى الأكاديمي', icon: '📚', color: '#0891B2' },
};

const ROLE_INFO: Record<string, { label: string; color: string; bgLight: string; icon: string }> = {
    'president': { label: 'رئيس الاتحاد', color: '#DC2626', bgLight: '#FEF2F2', icon: '👑' },
    'admin': { label: 'مدير النظام', color: '#7C3AED', bgLight: '#F5F3FF', icon: '🛡️' },
    'vice_president': { label: 'نائب الرئيس', color: '#2563EB', bgLight: '#EFF6FF', icon: '⭐' },
    'secretary': { label: 'السكرتير', color: '#059669', bgLight: '#ECFDF5', icon: '📝' },
    'activities_coordinator': { label: 'منسق الأنشطة', color: '#D97706', bgLight: '#FFFBEB', icon: '🎯' },
    'finance_manager': { label: 'المدير المالي', color: '#DC2626', bgLight: '#FEF2F2', icon: '💰' },
    'media_manager': { label: 'مدير الإعلام', color: '#8B5CF6', bgLight: '#F5F3FF', icon: '📢' },
    'academic_coordinator': { label: 'المنسق الأكاديمي', color: '#0891B2', bgLight: '#ECFEFF', icon: '📚' },
    'relations_coordinator': { label: 'منسق العلاقات', color: '#BE185D', bgLight: '#FDF2F8', icon: '🤝' },
    'relations_manager': { label: 'مدير العلاقات', color: '#BE185D', bgLight: '#FDF2F8', icon: '🤝' },
    'member': { label: 'عضو', color: '#6B7280', bgLight: '#F9FAFB', icon: '👤' },
};

interface Permission {
    id: number;
    name: string;
    display_name: string;
    description: string;
    category: string;
}

interface Role {
    id: number;
    name: string;
    display_name: string;
    users_count: number;
    permissions_count: number;
}

export function RolesList() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
    const [originalPermissions, setOriginalPermissions] = useState<number[]>([]);
    const [saving, setSaving] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'enabled' | 'disabled'>('all');
    const [openCategories, setOpenCategories] = useState<string[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const hasChanges = useMemo(() => {
        if (selectedPermissions.length !== originalPermissions.length) return true;
        const sortedSelected = [...selectedPermissions].sort();
        const sortedOriginal = [...originalPermissions].sort();
        return sortedSelected.some((id, index) => id !== sortedOriginal[index]);
    }, [selectedPermissions, originalPermissions]);

    const changesCount = useMemo(() => {
        const added = selectedPermissions.filter(id => !originalPermissions.includes(id)).length;
        const removed = originalPermissions.filter(id => !selectedPermissions.includes(id)).length;
        return added + removed;
    }, [selectedPermissions, originalPermissions]);

    // Warn before unload if changes exist
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasChanges]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [rolesRes, permissionsRes] = await Promise.all([
                api.get('/roles'),
                api.get('/permissions')
            ]);

            const loadedRoles = rolesRes.data.data || [];
            const loadedPermissions = permissionsRes.data.data || [];

            setRoles(loadedRoles);
            setPermissions(loadedPermissions);

            // Open all categories by default to look nice
            const allCats = Array.from(new Set(loadedPermissions.map((p: Permission) => p.category || p.name.split('.')[0])));
            setOpenCategories(allCats as string[]);

            if (loadedRoles.length > 0 && !selectedRole) {
                handleSelectRole(loadedRoles[0]);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'حدث خطأ في تحميل البيانات');
            toast.error('حدث خطأ في تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRole = async (role: Role) => {
        if (hasChanges) {
            if (!window.confirm('لديك تغييرات غير محفوظة، هل أنت متأكد من تغيير الدور؟ سيتم فقدان التغييرات.')) {
                return;
            }
        }

        setSelectedRole(role);
        setSearchQuery('');
        setFilterStatus('all');

        try {
            const response = await api.get(`/roles/${role.id}`);
            const roleData = response.data.data;
            const rolePermIds = roleData.permissions?.map((p: any) => p.id) || [];

            setSelectedPermissions(rolePermIds);
            setOriginalPermissions(rolePermIds);
            setSelectedRole(prev => prev ? { ...prev, ...roleData } : roleData);
        } catch (err) {
            console.error(err);
            toast.error('فشل في تحميل تفاصيل الصلاحيات لهذا الدور');
        }
    };

    const handleCopyPermissions = async (fromRoleId: number) => {
        if (!selectedRole || fromRoleId === selectedRole.id) return;

        try {
            const toastId = toast.loading('جاري جلب الصلاحيات...');
            const response = await api.get(`/roles/${fromRoleId}`);
            const roleData = response.data.data;
            const rolePermIds = roleData.permissions?.map((p: any) => p.id) || [];

            setSelectedPermissions(rolePermIds);
            toast.success('تم نسخ الصلاحيات بنجاح، لا تنسى حفظ التغييرات', { id: toastId });
        } catch (err) {
            toast.error('فشل في نسخ الصلاحيات');
        }
    };

    const handleSavePermissions = async () => {
        if (!selectedRole) return;
        try {
            setSaving(true);
            const selectedPermissionNames = permissions
                .filter(p => selectedPermissions.includes(p.id))
                .map(p => p.name);

            await api.post(`/roles/${selectedRole.id}/permissions`, {
                permissions: selectedPermissionNames
            });

            // Update original to match selected
            setOriginalPermissions([...selectedPermissions]);
            toast.success('تم حفظ صلاحيات الدور بنجاح!', { icon: '✨' });

            // Refresh role permissions count silently
            api.get('/roles').then(res => setRoles(res.data.data || []));

        } catch (err: any) {
            toast.error(err.response?.data?.message || 'تعذر حفظ الصلاحيات');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setSelectedPermissions([...originalPermissions]);
        toast('تم إعادة الصلاحيات لحالتها الأصلية', { icon: '🔄' });
    };

    const togglePermission = (permissionId: number) => {
        setSelectedPermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const toggleAllInCategory = (e: React.MouseEvent, categoryPermissionIds: number[]) => {
        e.stopPropagation(); // prevent accordion toggle
        const canFilterBySearch = getFilteredCategoryPermissions(categoryPermissionIds);
        const allSelected = canFilterBySearch.every(p => selectedPermissions.includes(p.id));

        if (allSelected) {
            setSelectedPermissions(prev => prev.filter(id => !canFilterBySearch.map(p => p.id).includes(id)));
        } else {
            setSelectedPermissions(prev => [...new Set([...prev, ...canFilterBySearch.map(p => p.id)])]);
        }
    };

    const toggleCategory = (category: string) => {
        setOpenCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    // Derived states
    const permissionsByCategory = useMemo(() => {
        return permissions.reduce((acc, permission) => {
            let cat = permission.category || permission.name.split('.')[0];
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(permission);
            return acc;
        }, {} as Record<string, Permission[]>);
    }, [permissions]);

    const getFilteredCategoryPermissions = (permIds: number[]) => {
        let list = permissions.filter(p => permIds.includes(p.id));
        if (filterStatus === 'enabled') {
            list = list.filter(p => selectedPermissions.includes(p.id));
        } else if (filterStatus === 'disabled') {
            list = list.filter(p => !selectedPermissions.includes(p.id));
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            list = list.filter(p => {
                const info = PERMISSION_LABELS[p.name] || {};
                const searchString = `${p.name} ${p.display_name} ${info.label} ${info.description}`.toLowerCase();
                return searchString.includes(query);
            });
        }
        return list;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200 shadow-sm flex flex-col items-center">
                <svg className="w-12 h-12 mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-bold">{error}</p>
                <button onClick={loadData} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">إعادة المحاولة</button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24" dir="rtl">

            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                        <span className="text-3xl">🔐</span> الأدوار والصلاحيات
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm max-w-lg leading-relaxed">
                        إدارة صلاحيات المستخدمين بدقة لضمان أمان النظام. قم بإنشاء الأدوار وتخصيص صلاحية الوصول لكل دور بناءً على هيكل المؤسسة.
                    </p>
                </div>

                {/* Global Stats */}
                <div className="flex items-center gap-4 text-center">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl px-5 py-3">
                        <div className="text-xl font-bold text-gray-800">{permissions.length}</div>
                        <div className="text-xs text-gray-500 mt-1 font-medium">إجمالي الصلاحيات</div>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl px-5 py-3">
                        <div className="text-xl font-bold text-gray-800">{roles.length}</div>
                        <div className="text-xs text-gray-500 mt-1 font-medium">الأدوار المتاحة</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* 1/3 Right Column: Roles Sidebar */}
                <div className="lg:col-span-4 xl:col-span-3 space-y-4 lg:sticky lg:top-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-bold text-gray-800">قائمة الأدوار المتاحة</h2>
                        <button className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors" title="إضافة دور جديد" onClick={() => toast('سيتم إضافة هذه الميزة قريباً!', { icon: '⏳' })}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-3">
                        {roles.map((role) => {
                            const isSelected = selectedRole?.id === role.id;
                            const rInfo = ROLE_INFO[role.name] || {
                                label: role.display_name || role.name,
                                color: '#6B7280', bgLight: '#F3F4F6', icon: '🔹'
                            };

                            return (
                                <div
                                    key={role.id}
                                    onClick={() => handleSelectRole(role)}
                                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-4 flex flex-col gap-3 group
                                        ${isSelected
                                            ? 'bg-white shadow-md border-transparent ring-2 ring-red-500/20'
                                            : 'bg-white/60 shadow-sm border border-gray-100 hover:shadow hover:border-gray-300 hover:bg-white'
                                        }`}
                                    style={{
                                        borderRightWidth: '4px',
                                        borderRightColor: rInfo.color
                                    }}
                                >
                                    {isSelected && (
                                        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent opacity-50 rounded-l-2xl"></div>
                                    )}

                                    <div className="flex items-start gap-3 relative z-10">
                                        <div className="text-3xl filter drop-shadow-sm">{rInfo.icon}</div>
                                        <div className="flex-1">
                                            <h3 className={`font-bold text-lg ${isSelected ? 'text-gray-900' : 'text-gray-700'} group-hover:text-gray-900 transition-colors`}>
                                                {role.display_name || rInfo.label}
                                            </h3>
                                            <p className="text-xs text-gray-400 font-mono mt-0.5">{role.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-1 relative z-10">
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 text-gray-500 text-xs font-medium border border-gray-100">
                                            <span>👤</span>
                                            <span>{role.users_count || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 text-gray-500 text-xs font-medium border border-gray-100">
                                            <span>🔑</span>
                                            <span dir="ltr">{role.permissions_count || 0} / {permissions.length}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2/3 Left Column: Permissions Config */}
                <div className="lg:col-span-8 xl:col-span-9 bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden flex flex-col min-h-[600px]">
                    {selectedRole ? (
                        <>
                            {/* Toolbar */}
                            <div className="bg-white border-b border-gray-100 p-5 sticky top-0 z-20 space-y-4">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                                            style={{ backgroundColor: (ROLE_INFO[selectedRole.name]?.bgLight || '#F3F4F6') }}>
                                            {ROLE_INFO[selectedRole.name]?.icon || '🔹'}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">صلاحيات: {selectedRole.display_name}</h2>
                                            <p className="text-sm text-gray-500 font-medium">تخصيص الصلاحيات الممنوحة لهذا الدور</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        {/* Copy from another role */}
                                        <div className="relative">
                                            <select
                                                className="appearance-none border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none w-full md:w-auto transition-colors cursor-pointer"
                                                onChange={(e) => handleCopyPermissions(Number(e.target.value))}
                                                value=""
                                            >
                                                <option value="" disabled>نسخ من دور آخر...</option>
                                                {roles.filter(r => r.id !== selectedRole.id).map(r => (
                                                    <option key={r.id} value={r.id}>{r.display_name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Filters & Search Row */}
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-1">
                                    <div className="flex bg-gray-100 p-1.5 rounded-xl w-full md:w-auto">
                                        <button onClick={() => setFilterStatus('all')} className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filterStatus === 'all' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>الكل</button>
                                        <button onClick={() => setFilterStatus('enabled')} className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filterStatus === 'enabled' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>المفعّلة</button>
                                        <button onClick={() => setFilterStatus('disabled')} className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filterStatus === 'disabled' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>المعطّلة</button>
                                    </div>

                                    <div className="relative w-full md:w-80">
                                        <input
                                            type="text"
                                            placeholder="ابحث عن صلاحية..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-red-500 focus:border-red-500 block pl-10 pr-4 py-2.5 transition-colors placeholder-gray-400 outline-none"
                                        />
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Accordions */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50/50">
                                {Object.entries(permissionsByCategory).map(([category, categoryRawPerms]) => {

                                    const categoryPerms = getFilteredCategoryPermissions(categoryRawPerms.map(p => p.id));
                                    if (categoryPerms.length === 0) return null; // Hide if search filters everything out

                                    const catInfo = CATEGORY_LABELS[category] || { label: category, icon: '💡', color: '#6B7280' };
                                    const isOpen = openCategories.includes(category);

                                    const catPermIds = categoryPerms.map(p => p.id);
                                    const selectedCount = catPermIds.filter(id => selectedPermissions.includes(id)).length;
                                    const isAllSelected = selectedCount === catPermIds.length;
                                    const progressPercent = (selectedCount / catPermIds.length) * 100;

                                    return (
                                        <div key={category} className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ${isOpen ? 'border-gray-200 ring-4 ring-gray-50' : 'border-gray-100 hover:border-gray-300'}`}>
                                            {/* Header */}
                                            <div
                                                onClick={() => toggleCategory(category)}
                                                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors gap-4"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`transform transition-transform duration-300 text-gray-400 group-hover:text-gray-600 ${isOpen ? 'rotate-90' : 'rotate-180'}`}>
                                                        {/* rotate-180 for initial RTL pointing left -> now pointing to content. Wait. For RTL, normally ▶ points left, rotating down makes it ▼ */}
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl filter drop-shadow-sm">{catInfo.icon}</span>
                                                        <div>
                                                            <h3 className="font-bold text-gray-900 text-lg">{catInfo.label}</h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs font-bold text-gray-500 tracking-wider">
                                                                    <span dir="ltr">[{selectedCount} / {catPermIds.length}]</span>
                                                                </span>
                                                                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full rounded-full transition-all duration-500 ease-out"
                                                                        style={{
                                                                            width: `${progressPercent}%`,
                                                                            backgroundColor: catInfo.color
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={(e) => toggleAllInCategory(e, catPermIds)}
                                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border flex items-center justify-center gap-2
                                                        ${isAllSelected
                                                            ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300'
                                                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                                        }`}
                                                >
                                                    {isAllSelected ? (
                                                        <>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                            إلغاء الكل
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                            تحديد الكل
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            {/* Body (Accordion Content) */}
                                            <div
                                                className={`transition-all duration-500 ease-in-out border-t border-gray-100 bg-gray-50/50
                                                    ${isOpen ? 'max-h-[5000px] opacity-100 p-5' : 'max-h-0 opacity-0 p-0 border-t-0 overflow-hidden'}
                                                `}
                                            >
                                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                                                    {categoryPerms.map((permission) => {
                                                        const permInfo = PERMISSION_LABELS[permission.name] || {
                                                            label: permission.display_name || permission.name,
                                                            description: permission.description || 'لا يوجد وصف متاح'
                                                        };
                                                        const isChecked = selectedPermissions.includes(permission.id);

                                                        return (
                                                            <label
                                                                key={permission.id}
                                                                className={`group relative flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 
                                                                    ${isChecked
                                                                        ? 'border-green-500 bg-green-50/40 shadow-sm'
                                                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center h-6 mt-0.5">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isChecked}
                                                                        onChange={() => togglePermission(permission.id)}
                                                                        className="w-5 h-5 text-green-600 bg-white border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer transition-colors"
                                                                    />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className={`font-bold text-[15px] mb-1 transition-colors ${isChecked ? 'text-green-900' : 'text-gray-900 group-hover:text-black'}`}>
                                                                        {permInfo.label}
                                                                    </div>
                                                                    <div className={`text-xs leading-relaxed transition-colors ${isChecked ? 'text-green-700/80' : 'text-gray-500'}`}>
                                                                        {permInfo.description}
                                                                    </div>
                                                                    <div className="text-[10px] text-gray-400 font-mono mt-2.5 flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                                                        {permission.name}
                                                                    </div>
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {Object.values(permissionsByCategory).flat().filter(p => selectedPermissions.includes(p.id)).length === 0 && filterStatus === 'enabled' && (
                                    <div className="text-center py-10 text-gray-500">لا توجد صلاحيات مفعلة للعرض.</div>
                                )}
                                {Object.values(permissionsByCategory).flat().filter(p => !selectedPermissions.includes(p.id)).length === 0 && filterStatus === 'disabled' && (
                                    <div className="text-center py-10 text-gray-500">لا توجد صلاحيات معطلة للعرض.</div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-10 text-center">
                            <div className="w-32 h-32 mb-6">
                                <svg className="w-full h-full text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">قم باختيار دور</h3>
                            <p className="text-gray-500 max-w-sm">اختر دورًا من القائمة الجانبية لعرض وتعديل الصلاحيات الخاصة به.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky Bottom Save Bar */}
            <div className={`fixed bottom-0 left-0 right-0 md:bg-white/90 md:backdrop-blur-lg bg-white border-t border-gray-200 md:shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] p-4 sm:p-5 flex items-center justify-between z-50 transform transition-transform duration-500 ease-out ${hasChanges ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="max-w-[1920px] mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-8">
                    <div className="flex items-center gap-4 text-center sm:text-right w-full sm:w-auto">
                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center hidden sm:flex">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <div>
                            <h4 className="text-gray-900 font-bold text-lg">لديك تغييرات غير محفوظة!</h4>
                            <p className="text-gray-500 text-sm font-medium">تم رصد <span className="text-red-600 font-bold px-1">{changesCount}</span> تعديل(ات) على صلاحيات دور <strong>{selectedRole?.display_name}</strong>.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={handleReset}
                            disabled={saving}
                            className="flex-1 sm:flex-none btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                        >
                            تراجع
                        </button>
                        <button
                            onClick={handleSavePermissions}
                            disabled={saving}
                            className="flex-1 sm:flex-none btn bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    <span>جاري الحفظ...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    <span>حفظ التغييرات ({changesCount})</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
