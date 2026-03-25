import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

interface Role {
    id: number;
    name: string;
    display_name: string;
    display_name_ar: string;
    level: number;
}

interface UserRole {
    role_id: number;
    role_name: string;
    display_name: string;
    display_name_ar: string;
    assigned_by_name: string;
    granted_at: string;
}

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

export function UserRoleManager({ userId, userName }: { userId: string | number, userName: string }) {
    const [roles, setRoles] = useState<Role[]>([]);
    const [userRoles, setUserRoles] = useState<UserRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const [rolesRes, userRolesRes] = await Promise.all([
                api.get('/roles/list'),
                api.get(`/users/${userId}/roles`)
            ]);
            setRoles(rolesRes.data.data || []);
            const uRoles = userRolesRes.data.data || [];
            setUserRoles(uRoles);

            if (uRoles.length > 0) {
                setSelectedRoleId(uRoles[0].role_id);
            }
        } catch (err) {
            toast.error('خطأ في تحميل بيانات الأدوار');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [userId]);

    const handleAssignRole = async () => {
        if (!selectedRoleId) return;
        try {
            setSubmitting(true);
            const res = await api.post(`/users/${userId}/roles`, { role_id: selectedRoleId });
            if (res.data.success) {
                toast.success(res.data.message || 'تم تعيين الدور بنجاح');
                setShowModal(false);
                loadData();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'خطأ في تعيين الدور');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="animate-pulse h-24 bg-gray-50 rounded-xl" />;

    const currentRole = userRoles[0];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                    🔐 الدور والصلاحيات
                </h3>
                <button
                    onClick={() => setShowModal(true)}
                    className="text-sm font-bold text-[#DC2626] hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                    ✏️ تعديل
                </button>
            </div>

            <div className="p-6">
                {currentRole ? (
                    <div className="bg-red-50/30 border border-red-100 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-3xl">{ROLE_ICONS[currentRole.role_name] || '👤'}</span>
                            <div>
                                <div className="font-black text-gray-800 text-lg">
                                    {currentRole.display_name_ar}
                                    <span className="text-xs text-gray-400 font-normal mr-2">({currentRole.role_name})</span>
                                </div>
                                <div className="text-xs text-red-600 font-bold">الدور الحالي</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="text-gray-500">
                                <span className="block mb-1">تم التعيين بواسطة:</span>
                                <span className="font-bold text-gray-700">{currentRole.assigned_by_name || 'النظام'}</span>
                            </div>
                            <div className="text-gray-500">
                                <span className="block mb-1">تاريخ التعيين:</span>
                                <span className="font-bold text-gray-700">{new Date(currentRole.granted_at).toLocaleDateString('ar-YE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6 text-gray-400 italic">
                        لا يوجد دور محدد لهذا العضو
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-zoomIn">
                        <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-black text-gray-800">🔐 تغيير دور العضو</h3>
                            <button onClick={() => setShowModal(false)} className="text-2xl hover:rotate-90 transition-transform">✖️</button>
                        </div>

                        <div className="p-8">
                            <p className="mb-6 text-gray-600 font-bold">
                                اختر الدور الجديد لـ: <span className="text-[#DC2626]">{userName}</span>
                            </p>

                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {roles.map(role => {
                                    const isCurrent = currentRole?.role_id === role.id;
                                    return (
                                        <label
                                            key={role.id}
                                            className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedRoleId === role.id
                                                    ? 'border-[#DC2626] bg-red-50/50'
                                                    : 'border-transparent bg-gray-50 hover:bg-gray-100'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name="role"
                                                    className="hidden"
                                                    checked={selectedRoleId === role.id}
                                                    onChange={() => setSelectedRoleId(role.id)}
                                                />
                                                <span className="text-2xl">{ROLE_ICONS[role.name] || '👤'}</span>
                                                <div>
                                                    <div className="font-black text-gray-800">{role.display_name_ar}</div>
                                                    <div className="text-[10px] text-gray-400 uppercase tracking-tighter">{role.name}</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                {isCurrent && (
                                                    <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold mb-1">الحالي</span>
                                                )}
                                                <span className="text-xs text-gray-400 font-bold">← 65 صلاحية</span>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>

                            <div className="mt-8 p-4 bg-yellow-50 rounded-2xl border border-yellow-100 flex gap-3">
                                <span className="text-xl">⚠️</span>
                                <p className="text-xs text-yellow-800 leading-relaxed font-bold">
                                    تنبيه: تغيير دور العضو سيؤدي إلى استبدال كافة صلاحياته الحالية بالصلاحيات المرتبطة بالدور الجديد فوراً.
                                </p>
                            </div>

                            <div className="mt-8 flex gap-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 font-bold text-gray-400 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleAssignRole}
                                    disabled={submitting || selectedRoleId === currentRole?.role_id}
                                    className="flex-1 py-4 font-bold text-white bg-[#DC2626] rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                                >
                                    {submitting ? '⏳ جاري الحفظ...' : '✅ حفظ التغيير'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
