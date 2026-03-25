import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Card, CardBody, CardHeader, Button, StatusBadge, LoadingPage, ErrorState } from '../../components/common';
import { formatArabicDate, formatPhoneNumber } from '../../utils/formatters';
import { getStorageUrl } from '../../utils/images';
import type { User, ApiResponse } from '../../types';

// ============================================
// CONSTANTS & HELPERS
// ============================================
const ROLE_ICONS: Record<string, string> = {
    president: '👑',
    vice_president: '⭐',
    secretary: '📝',
    activities_coordinator: '🎯',
    finance_manager: '💰',
    media_manager: '📢',
    academic_coordinator: '📚',
    relations_coordinator: '🤝',
    member: '👤',
};

const CATEGORY_LABELS: Record<string, { label: string, icon: string }> = {
    academic: { label: 'المحتوى الأكاديمي', icon: '📚' },
    activities: { label: 'الأنشطة والفعاليات', icon: '🎯' },
    calendar: { label: 'التقويم', icon: '📅' },
    card: { label: 'بطاقة العضوية', icon: '💳' },
    dashboard: { label: 'لوحة التحكم', icon: '📊' },
    finance: { label: 'الإدارة المالية', icon: '💰' },
    memberships: { label: 'الاشتراكات', icon: '📋' },
    notifications: { label: 'الإشعارات', icon: '🔔' },
    posts: { label: 'المنشورات', icon: '📢' },
    reports: { label: 'التقارير', icon: '📊' },
    roles: { label: 'الأدوار والصلاحيات', icon: '🔐' },
    permissions: { label: 'الأدوار والصلاحيات', icon: '🔐' },
    settings: { label: 'الإعدادات', icon: '⚙️' },
    sponsors: { label: 'الجهات الداعمة', icon: '🤝' },
    sponsorships: { label: 'الرعايات', icon: '🎁' },
    support: { label: 'الدعم الفني', icon: '🎧' },
    users: { label: 'إدارة الأعضاء', icon: '👥' },
};

function getStudyLevelLabel(level?: string): string {
    const labels: Record<string, string> = {
        bachelor: 'بكالوريوس',
        master: 'ماجستير',
        phd: 'دكتوراه',
        diploma: 'دبلوم',
    };
    return level ? labels[level] || level : '—';
}

// ============================================
// MAIN COMPONENT
// ============================================
export function UserDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Modals visibility
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);

    // Roles & Permissions state
    const [roles, setRoles] = useState<any[]>([]);
    const [userRoles, setUserRoles] = useState<any[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const [currentRoleId, setCurrentRoleId] = useState<number | null>(null);
    const [permissions, setPermissions] = useState<any[]>([]);
    const [enabledPermissions, setEnabledPermissions] = useState<number[]>([]);

    const [savingRole, setSavingRole] = useState(false);
    const [savingPermissions, setSavingPermissions] = useState(false);

    // Fetch user data
    const { data: user, isLoading, error, refetch } = useQuery({
        queryKey: ['user', id],
        queryFn: async () => {
            const response = await api.get<ApiResponse<User>>(`/users/${id}`);
            return response.data.data!;
        },
    });

    // Load roles when needed
    const openRoleModal = async () => {
        try {
            const [rolesRes, userRolesRes] = await Promise.all([
                api.get('/roles/list'),
                api.get(`/users/${id}/roles`)
            ]);
            setRoles(rolesRes.data.data || []);
            const uRoles = userRolesRes.data.data || [];
            setUserRoles(uRoles);
            if (uRoles.length > 0) {
                setCurrentRoleId(uRoles[0].role_id);
                setSelectedRoleId(uRoles[0].role_id);
            }
            setShowRoleModal(true);
        } catch (err) {
            toast.error('خطأ في تحميل الأدوار');
        }
    };

    // Step 1: Save Role
    const handleSaveRole = async () => {
        if (!selectedRoleId) { toast.error('يرجى اختيار دور'); return; }
        try {
            setSavingRole(true);
            await api.post(`/users/${id}/roles`, { role_id: selectedRoleId });
            toast.success('تم تعيين الدور بنجاح');
            setCurrentRoleId(selectedRoleId);

            // Step 2: Load and show permissions for this role
            const permRes = await api.get(`/roles/${selectedRoleId}/permissions`);
            const data = permRes.data.data;
            const allPerms = data?.permissions || [];
            setPermissions(allPerms);
            setEnabledPermissions(allPerms.filter((p: any) => p.enabled).map((p: any) => p.id));

            setShowRoleModal(false);
            setShowPermissionsModal(true);
            refetch(); // Update main UI
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'خطأ في تعيين الدور');
        } finally {
            setSavingRole(false);
        }
    };

    // Step 2: Save Permissions
    const handleSavePermissions = async () => {
        if (!currentRoleId) return;
        try {
            setSavingPermissions(true);
            await api.put(`/roles/${currentRoleId}/permissions`, { permissions: enabledPermissions });
            toast.success('تم حفظ الصلاحيات بنجاح');
            setShowPermissionsModal(false);
            refetch();
        } catch (err) {
            toast.error('خطأ في حفظ الصلاحيات');
        } finally {
            setSavingPermissions(false);
        }
    };

    const togglePermission = (permId: number) => {
        setEnabledPermissions(prev =>
            prev.includes(permId) ? prev.filter(pid => pid !== permId) : [...prev, permId]
        );
    };

    // Group permissions by category
    const groupedPermissions = permissions.reduce((acc: any, perm: any) => {
        const cat = perm.category || 'other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(perm);
        return acc;
    }, {});

    // Action mutations
    const deleteUserMutation = useMutation({
        mutationFn: async () => { await api.delete(`/users/${id}`); },
        onSuccess: () => {
            toast.success('تم حذف العضو بنجاح');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            navigate('/users');
        },
        onError: () => toast.error('حدث خطأ في حذف العضو'),
    });

    const approveUserMutation = useMutation({
        mutationFn: async () => { const response = await api.post(`/users/${id}/verify`); return response.data; },
        onSuccess: () => {
            toast.success('تمت الموافقة على العضوية بنجاح');
            queryClient.invalidateQueries({ queryKey: ['user', id] });
            refetch();
            setShowApproveModal(false);
        },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'خطأ في الموافقة'),
    });

    if (isLoading) return <LoadingPage message="جاري تحميل بيانات العضو..." />;
    if (error || !user) return <div className="p-8"><Card><ErrorState onRetry={() => refetch()} /></Card></div>;

    const isActive = user.status === 'active';
    const isPending = user.status === 'pending';
    const hasMembership = user.membership_expiry_date && new Date(user.membership_expiry_date) > new Date();

    return (
        <div className="member-detail-page animate-fadeIn p-4 md:p-8 max-w-7xl mx-auto space-y-8" dir="rtl">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <Link to="/" className="hover:text-[#DC2626]">الرئيسية</Link>
                        <span>/</span>
                        <Link to="/users" className="hover:text-[#DC2626]">إدارة الأعضاء</Link>
                        <span>/</span>
                        <span className="text-gray-600 font-bold">{user.full_name}</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                        تفاصيل العضوية 👤
                    </h1>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link to="/users">
                        <Button variant="secondary" className="gap-2">⬅️ العودة للقائمة</Button>
                    </Link>
                    <Link to={`/users/${id}/edit`}>
                        <Button className="gap-2 bg-gray-800 hover:bg-black">✏️ تعديل المعلومات</Button>
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar */}
                <aside className="lg:col-span-4 space-y-6">
                    <Card className="overflow-hidden border-none shadow-xl shadow-red-50/50">
                        <div className="h-24 bg-gradient-to-l from-[#DC2626] to-red-400" />
                        <CardBody className="-mt-12 text-center flex flex-col items-center">
                            <div className="w-24 h-24 rounded-3xl border-4 border-white shadow-lg overflow-hidden bg-gray-100 mb-4 bg-cover bg-center" style={{ backgroundImage: user.profile_photo ? `url(${getStorageUrl(user.profile_photo)})` : 'none' }}>
                                {!user.profile_photo && <span className="flex items-center justify-center h-full text-4xl text-gray-300 font-black">{user.full_name.charAt(0)}</span>}
                            </div>
                            <h2 className="text-xl font-black text-gray-800 mb-1">{user.full_name}</h2>
                            <div className="flex flex-wrap justify-center gap-2 mb-6">
                                <StatusBadge status={user.status} />
                                {hasMembership && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">✅ مشترك ساري</span>}
                            </div>

                            <div className="w-full space-y-1 text-right">
                                <div className="p-3 hover:bg-gray-50 rounded-2xl transition-all flex items-center justify-between group">
                                    <span className="text-gray-400 text-sm">📱 الهاتف</span>
                                    <span className="font-bold text-gray-700 group-hover:text-[#DC2626] transition-colors" dir="ltr">{formatPhoneNumber(user.phone_number)}</span>
                                </div>
                                <div className="p-3 hover:bg-gray-50 rounded-2xl transition-all flex items-center justify-between group">
                                    <span className="text-gray-400 text-sm">📧 البريد</span>
                                    <span className="font-bold text-gray-700 break-all text-xs lg:text-sm">{user.email || '—'}</span>
                                </div>
                                <div className="p-3 hover:bg-gray-50 rounded-2xl transition-all flex items-center justify-between group">
                                    <span className="text-gray-400 text-sm">📅 انضم في</span>
                                    <span className="font-bold text-gray-700 text-sm">{formatArabicDate(user.created_at)}</span>
                                </div>
                            </div>
                        </CardBody>
                        <div className="p-6 bg-gray-50 space-y-3">
                            {isPending && (
                                <Button variant="success" fullWidth className="gap-2" onClick={() => setShowApproveModal(true)}>✅ الموافقة على القبول</Button>
                            )}
                            {!hasMembership && isActive && (
                                <Link to={`/memberships/create?user_id=${id}`}>
                                    <Button variant="primary" fullWidth className="gap-2">💳 إضافة اشتراك جديد</Button>
                                </Link>
                            )}
                            <Button variant="danger" fullWidth className="gap-2 opacity-50 hover:opacity-100" onClick={() => setShowDeleteModal(true)}>🗑️ حذف سجل العضو</Button>
                        </div>
                    </Card>

                    {/* Roles Manager Card */}
                    <Card className="border-none shadow-lg">
                        <CardHeader className="flex justify-between items-center px-6 py-4">
                            <h3 className="font-black flex items-center gap-2">🔐 الدور الوظيفي</h3>
                            <button onClick={openRoleModal} className="text-[#DC2626] text-xs font-bold hover:underline">✏️ تعديل</button>
                        </CardHeader>
                        <CardBody className="px-6 py-4">
                            {user.roles && user.roles.length > 0 ? (
                                <div className="flex items-center gap-4 bg-red-50 p-4 rounded-2xl border border-red-100">
                                    <span className="text-4xl">{ROLE_ICONS[user.roles[0].name] || '👤'}</span>
                                    <div>
                                        <div className="font-black text-gray-800 text-lg">{user.roles[0].display_name_ar}</div>
                                        <div className="text-xs text-red-600 font-bold uppercase tracking-tighter">({user.roles[0].name})</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-400 italic text-sm">لا يوجد دور محدد حالياً</div>
                            )}
                        </CardBody>
                    </Card>
                </aside>

                {/* Main Content */}
                <main className="lg:col-span-8 space-y-8">
                    {/* Personal Info */}
                    <Card className="border-none shadow-sm h-full">
                        <CardHeader title="المعلومات الشخصية 📝" className="text-lg font-black" />
                        <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                            {[
                                { label: 'الاسم الكامل', value: user.full_name, icon: '👤' },
                                { label: 'تاريخ الميلاد', value: user.date_of_birth ? formatArabicDate(user.date_of_birth) : '—', icon: '📅' },
                                { label: 'الجنس', value: user.gender === 'male' ? 'ذكر' : 'أنثى', icon: '🚻' },
                                { label: 'الجنسية', value: user.nationality || 'يمني', icon: '🌍' },
                                { label: 'المدينة', value: user.city || '—', icon: '📍' },
                                { label: 'العنوان', value: user.address || '—', icon: '🏠' },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 items-center p-3 bg-gray-50 rounded-2xl">
                                    <span className="text-2xl">{item.icon}</span>
                                    <div>
                                        <div className="text-xs text-gray-400 font-bold mb-0.5">{item.label}</div>
                                        <div className="font-black text-gray-700">{item.value}</div>
                                    </div>
                                </div>
                            ))}
                        </CardBody>
                    </Card>

                    {/* Login Info */}
                    <Card className="border-none shadow-sm">
                        <CardHeader title="بيانات الدخول 🔐" className="text-lg font-black" />
                        <CardBody className="p-6">
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl">📱</span>
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold mb-0.5">رقم الهاتف (اسم المستخدم)</div>
                                            <div className="font-black text-gray-700" dir="ltr">{user.phone_number}</div>
                                        </div>
                                    </div>
                                    <Button variant="secondary" onClick={() => {
                                        navigator.clipboard.writeText(user.phone_number);
                                        toast.success('تم نسخ رقم الهاتف');
                                    }}>📋 نسخ</Button>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-red-50/30 rounded-2xl border border-red-50">
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl">🔑</span>
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold mb-0.5">كلمة المرور</div>
                                            <div className="font-black text-gray-700">********</div>
                                            <div className="text-[10px] text-red-500 mt-1 font-bold">كلمات المرور مشفرة بالنظام ولا يمكن عرضها لأسباب أمنية</div>
                                        </div>
                                    </div>
                                    <Button variant="danger" onClick={() => {
                                        const newPass = prompt('أدخل كلمة المرور الجديدة لهذا العضو:');
                                        if (newPass) {
                                            if (newPass.length < 6) {
                                                toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
                                                return;
                                            }
                                            api.put(`/users/${user.id}`, { password: newPass }).then(() => {
                                                toast.success('تم تغيير كلمة المرور بنجاح');
                                            }).catch(() => {
                                                toast.error('حدث خطأ أثناء تغيير كلمة المرور');
                                            });
                                        }
                                    }}>🔄 إعادة تعيين</Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Academic Info */}
                    <Card className="border-none shadow-sm">
                        <CardHeader title="المسار الأكاديمي 🎓" className="text-lg font-black" />
                        <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                            {[
                                { label: 'الجامعة', value: user.university || '—', icon: '🏛️' },
                                { label: 'الكلية', value: user.faculty || '—', icon: '🏢' },
                                { label: 'المستوى', value: getStudyLevelLabel(user.study_level), icon: '📊' },
                                { label: 'التخصص', value: user.major || '—', icon: '💡' },
                                { label: 'العام الدراسي', value: user.academic_year || '—', icon: '🗓️' },
                                { label: 'الرقم الجامعي', value: user.student_id || '—', icon: '🆔' },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 items-center p-3 bg-red-50/30 rounded-2xl border border-red-50">
                                    <span className="text-2xl">{item.icon}</span>
                                    <div>
                                        <div className="text-xs text-red-300 font-bold mb-0.5">{item.label}</div>
                                        <div className="font-black text-gray-700">{item.value}</div>
                                    </div>
                                </div>
                            ))}
                        </CardBody>
                    </Card>
                </main>
            </div>

            {/* Step 1: Role Modal */}
            {showRoleModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" dir="rtl">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-zoomIn">
                        <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-black text-gray-800">🔐 تغيير دور العضو</h3>
                            <button onClick={() => setShowRoleModal(false)} className="text-2xl hover:rotate-90 transition-transform">✖️</button>
                        </div>
                        <div className="p-8">
                            <p className="mb-6 text-gray-600 font-bold">اختر الدور الجديد لـ: <span className="text-[#DC2626]">{user.full_name}</span></p>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {roles.map(role => {
                                    const isCurrent = currentRoleId === role.id;
                                    return (
                                        <label key={role.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedRoleId === role.id ? 'border-[#DC2626] bg-red-50/50' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}>
                                            <div className="flex items-center gap-3">
                                                <input type="radio" className="hidden" checked={selectedRoleId === role.id} onChange={() => setSelectedRoleId(role.id)} />
                                                <span className="text-2xl">{ROLE_ICONS[role.name] || '👤'}</span>
                                                <div>
                                                    <div className="font-black text-gray-800">{role.display_name_ar}</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                {isCurrent && <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold mb-1">الحالي ✅</span>}
                                                <span className="text-xs text-gray-400 font-bold">({role.permissions_count || 0} صلاحية)</span>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                            <div className="mt-8 p-4 bg-yellow-50 rounded-2xl border border-yellow-100 flex gap-3">
                                <span className="text-xl">⚠️</span>
                                <p className="text-xs text-yellow-800 leading-relaxed font-bold">تحذير: تغيير الدور سيؤدي إلى استبدال كافة صلاحياته الحالية فوراً.</p>
                            </div>
                            <div className="mt-8 flex gap-4">
                                <button onClick={() => setShowRoleModal(false)} className="flex-1 py-4 font-bold text-gray-400 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors">إلغاء</button>
                                <button onClick={handleSaveRole} disabled={savingRole} className="flex-1 py-4 font-bold text-white bg-[#DC2626] rounded-2xl shadow-lg hover:bg-red-700 disabled:opacity-50 transition-all">
                                    {savingRole ? '⏳ جاري الحفظ...' : '✅ حفظ وعرض الصلاحيات'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Permissions Modal */}
            {showPermissionsModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" dir="rtl">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-zoomIn flex flex-col max-h-[90vh]">
                        <div className="px-8 py-6 bg-[#DC2626] text-white flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-xl font-black">🔐 تخصيص صلاحيات العضو</h3>
                                <p className="text-xs opacity-80 mt-1">العضو: {user.full_name} | الدور: {roles.find(r => r.id === currentRoleId)?.display_name_ar}</p>
                            </div>
                            <button onClick={() => setShowPermissionsModal(false)} className="text-2xl">✖️</button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar flex-grow space-y-8">
                            {Object.keys(groupedPermissions).map(cat => (
                                <div key={cat} className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-lg font-black text-gray-800 border-r-4 border-[#DC2626] pr-3">
                                        <span className="text-2xl">{CATEGORY_LABELS[cat]?.icon || '🛡️'}</span>
                                        {CATEGORY_LABELS[cat]?.label || cat}
                                        <span className="text-xs font-normal text-gray-400 mr-auto">
                                            [{groupedPermissions[cat].filter((p: any) => enabledPermissions.includes(p.id)).length}/{groupedPermissions[cat].length}]
                                        </span>
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {groupedPermissions[cat].map((perm: any) => (
                                            <div
                                                key={perm.id}
                                                onClick={() => togglePermission(perm.id)}
                                                className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${enabledPermissions.includes(perm.id)
                                                    ? 'border-red-200 bg-red-50/50'
                                                    : 'border-gray-50 bg-gray-50/30 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${enabledPermissions.includes(perm.id) ? 'bg-[#DC2626] border-[#DC2626]' : 'border-gray-200 bg-white'
                                                    }`}>
                                                    {enabledPermissions.includes(perm.id) && <span className="text-[10px] text-white font-black">✓</span>}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-700">{perm.display_name || perm.name}</div>
                                                    <div className="text-[10px] text-gray-300 font-mono tracking-tighter">{perm.name}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4 shrink-0">
                            <button onClick={() => setShowPermissionsModal(false)} className="flex-1 py-4 font-bold text-gray-400 bg-white border border-gray-200 rounded-2xl hover:bg-gray-100 transition-colors">إلغاء</button>
                            <button onClick={handleSavePermissions} disabled={savingPermissions} className="flex-1 py-4 font-bold text-white bg-[#DC2626] rounded-2xl shadow-lg hover:bg-red-700 disabled:opacity-50 transition-all">
                                {savingPermissions ? '⏳ جاري الحفظ...' : '💾 حفظ الصلاحيات المخصصة'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Standard Confirm Modals (Previous turn) */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <Card className="max-w-md w-full animate-zoomIn">
                        <CardHeader title="⚠️ تأكيد حذف العضو" />
                        <CardBody className="p-6">
                            <p className="text-gray-600 font-bold mb-6">هل أنت متأكد من حذف العضو "{user.full_name}"؟ هذا الإجراء لا يمكن التراجع عنه.</p>
                            <div className="flex gap-4">
                                <Button variant="secondary" className="flex-1" onClick={() => setShowDeleteModal(false)}>إلغاء</Button>
                                <Button variant="danger" className="flex-1" onClick={() => deleteUserMutation.mutate()}>حذف الآن</Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            )}

            {showApproveModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <Card className="max-w-md w-full animate-zoomIn">
                        <CardHeader title="✅ تأكيد قبول العضوية" />
                        <CardBody className="p-6">
                            <p className="text-gray-600 font-bold mb-6">هل تريد الموافقة على طلب انضمام العضو "{user.full_name}"؟</p>
                            <div className="flex gap-4">
                                <Button variant="secondary" className="flex-1" onClick={() => setShowApproveModal(false)}>إلغاء</Button>
                                <Button variant="success" className="flex-1" onClick={() => approveUserMutation.mutate()}>موافقة وقبول</Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            )}
        </div>
    );
}
