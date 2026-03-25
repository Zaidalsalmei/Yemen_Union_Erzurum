import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useBranding } from '../../contexts/BrandingContext';
import { RolesManager } from '../../components/settings/RolesManager';
import { getStorageUrl } from '../../utils/images';
import type { ApiResponse } from '../../types';

// ============================================
// TYPES
// ============================================
interface ProfileFormData {
    full_name: string;
    email: string;
    phone_number: string;
}

interface PasswordFormData {
    current_password: string;
    new_password: string;
    confirm_password: string;
}

interface SystemSettings {
    union_name_ar: string;
    union_name_en: string;
    default_currency: string;
    default_language: string;
    timezone: string;
    max_activities_per_day: number;
    auto_approve_activities: boolean;
    membership_duration_months: number;
}

type TabType = 'profile' | 'password' | 'roles' | 'branding' | 'system' | 'notifications';

const tabs: Array<{ id: TabType; label: string; icon: string; description: string; adminOnly?: boolean }> = [
    { id: 'profile', label: 'الملف الشخصي', icon: '👤', description: 'معلوماتك الشخصية' },
    { id: 'password', label: 'الأمان', icon: '🔐', description: 'كلمة المرور والحماية' },
    { id: 'roles', label: 'الأدوار والصلاحيات', icon: '🛡️', description: 'إدارة أدوار المستخدمين', adminOnly: true },
    { id: 'branding', label: 'العلامة التجارية', icon: '🎨', description: 'شعار وألوان النظام', adminOnly: true },
    { id: 'system', label: 'النظام', icon: '⚙️', description: 'إعدادات عامة', adminOnly: true },
    { id: 'notifications', label: 'الإشعارات', icon: '🔔', description: 'تفضيلات التنبيهات' },
];

export function Settings() {
    const { user, refreshPermissions } = useAuth();
    const {
        settings: brandingSettings,
        updateLogo,
        toggleWatermark,
        setWatermarkOpacity,
        saveBranding,
        isSaving: isSavingBranding
    } = useBranding();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const queryClient = useQueryClient();

    const userRole = user?.roles?.[0]?.name;
    const isAdmin = userRole === 'president' || userRole === 'admin';

    const visibleTabs = tabs.filter(tab => !tab.adminOnly || isAdmin);

    // Forms
    const { register: registerProfile, handleSubmit: handleProfileSubmit } = useForm<ProfileFormData>({
        defaultValues: { full_name: user?.full_name || '', email: user?.email || '', phone_number: user?.phone_number || '' },
    });

    const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword } = useForm<PasswordFormData>();

    const { data: systemSettingsData } = useQuery({
        queryKey: ['system-settings'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<any>>('/settings/system');
            return response.data.data;
        },
        enabled: isAdmin,
    });

    const { register: registerSystem, handleSubmit: handleSystemSubmit, reset: resetSystemForm } = useForm<SystemSettings>();

    useEffect(() => {
        if (systemSettingsData) {
            resetSystemForm({
                union_name_ar: systemSettingsData.union_name_ar || 'اتحاد الطلاب اليمنيين',
                union_name_en: systemSettingsData.union_name_en || 'Yemeni Students Union',
                default_currency: systemSettingsData.default_currency || 'TRY',
                default_language: systemSettingsData.default_language || 'ar',
                timezone: systemSettingsData.timezone || 'Europe/Istanbul',
                max_activities_per_day: Number(systemSettingsData.max_activities_per_day) || 5,
                auto_approve_activities: systemSettingsData.auto_approve_activities || false,
                membership_duration_months: Number(systemSettingsData.membership_duration_months) || 12,
            });
        }
    }, [systemSettingsData, resetSystemForm]);

    // Mutations
    const updateProfileMutation = useMutation({
        mutationFn: async (data: ProfileFormData) => { await api.put<ApiResponse<any>>('/profile', data); },
        onSuccess: () => { toast.success('تم تحديث الملف الشخصي'); refreshPermissions(); },
        onError: () => toast.error('حدث خطأ في التحديث'),
    });

    const updatePasswordMutation = useMutation({
        mutationFn: async (data: PasswordFormData) => { await api.put<ApiResponse<any>>('/profile/password', data); },
        onSuccess: () => { toast.success('تم تغيير كلمة المرور'); resetPassword(); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'خطأ في التغيير'),
    });

    const updateSystemMutation = useMutation({
        mutationFn: async (data: SystemSettings) => { await api.put<ApiResponse<any>>('/settings/system', data); },
        onSuccess: () => { toast.success('تم حفظ إعدادات النظام'); queryClient.invalidateQueries({ queryKey: ['system-settings'] }); },
        onError: () => toast.error('خطأ في الحفظ'),
    });

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try { await updateLogo(file); toast.success('تم رفع الشعار'); } catch { toast.error('حدث خطأ'); }
    };

    return (
        <div className="animate-fadeIn">
            {/* Scoped Page Header */}
            <div className="page-header">
                <div>
                    <h1>الإعدادات</h1>
                    <p>إدارة ملفك الشخصي وإعدادات النظام</p>
                </div>
            </div>

            <div className="settings-layout">
                {/* Custom Sidebar */}
                <aside className="settings-sidebar">
                    <div className="profile-summary">
                        <div className="profile-avatar-large overflow-hidden">
                            {user?.profile_photo ? (
                                <img src={getStorageUrl(user.profile_photo)} alt={user.full_name} className="w-full h-full object-cover" />
                            ) : (
                                user?.full_name?.charAt(0) || '؟'
                            )}
                        </div>
                        <h3 style={{ fontWeight: 700, marginBottom: '4px' }}>{user?.full_name}</h3>
                        <span style={{ fontSize: '12px', color: '#64748b', background: '#f1f5f9', padding: '4px 8px', borderRadius: '12px' }}>
                            {user?.roles?.[0]?.display_name_ar || 'عضو'}
                        </span>
                    </div>

                    <div style={{ padding: '8px' }}>
                        {visibleTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`settings-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            >
                                <span style={{ fontSize: '18px' }}>{tab.icon}</span>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{tab.label}</div>
                                    <div style={{ fontSize: '11px', opacity: 0.7 }}>{tab.description}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Content Panel */}
                <main className="settings-content">
                    <div style={{ marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{tabs.find(t => t.id === activeTab)?.label}</h2>
                    </div>

                    {activeTab === 'profile' && (
                        <form onSubmit={handleProfileSubmit((data) => updateProfileMutation.mutate(data))} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
                            <div className="dashboard-columns" style={{ margin: 0, gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '14px', fontWeight: 600 }}>الاسم الكامل</label>
                                    <input type="text" {...registerProfile('full_name', { required: true })} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '14px', fontWeight: 600 }}>البريد الإلكتروني</label>
                                    <input type="email" {...registerProfile('email')} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '14px', fontWeight: 600 }}>رقم الهاتف</label>
                                <input type="text" disabled style={{ background: '#f8fafc' }} {...registerProfile('phone_number')} />
                            </div>
                            <div style={{ paddingTop: '12px' }}>
                                <button type="submit" className="btn" style={{ background: 'var(--color-primary)', color: 'white' }} disabled={updateProfileMutation.isPending}>
                                    {updateProfileMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'password' && (
                        <form onSubmit={handlePasswordSubmit((data) => updatePasswordMutation.mutate(data))} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '14px', fontWeight: 600 }}>كلمة المرور الحالية</label>
                                <input type="password" {...registerPassword('current_password', { required: true })} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '14px', fontWeight: 600 }}>كلمة المرور الجديدة</label>
                                <input type="password" {...registerPassword('new_password', { required: true })} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '14px', fontWeight: 600 }}>تأكيد كلمة المرور</label>
                                <input type="password" {...registerPassword('confirm_password', { required: true })} />
                            </div>
                            <div style={{ paddingTop: '12px' }}>
                                <button type="submit" className="btn" style={{ background: 'var(--color-primary)', color: 'white' }} disabled={updatePasswordMutation.isPending}>
                                    حفظ كلمة المرور
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'roles' && isAdmin && (
                        <div style={{ marginTop: '-24px', marginRight: '-24px', marginLeft: '-24px' }}>
                            {/* RolesManager has its own padding/layout, wrapping it might need adjustment but keeping it cleaner for now */}
                            <div style={{ padding: '24px' }}>
                                <RolesManager />
                            </div>
                        </div>
                    )}

                    {activeTab === 'branding' && isAdmin && (
                        <div className="flex flex-col gap-6">
                            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ fontWeight: 700, marginBottom: '16px' }}>شعار الاتحاد</h4>
                                <div className="flex items-center gap-4">
                                    {brandingSettings.logoUrl && (
                                        <div style={{ width: '80px', height: '80px', padding: '8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            <img src={getStorageUrl(brandingSettings.logoUrl)} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                        </div>
                                    )}
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} hidden />
                                    <button onClick={() => fileInputRef.current?.click()} className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                                        📤 تغيير الشعار
                                    </button>
                                </div>
                            </div>

                            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ fontWeight: 700, marginBottom: '16px' }}>خيارات العرض</h4>
                                <div className="flex items-center gap-6">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={brandingSettings.showWatermark} onChange={toggleWatermark} style={{ width: '18px', height: '18px' }} />
                                        <span>عرض العلامة المائية</span>
                                    </label>

                                    {brandingSettings.showWatermark && (
                                        <div className="flex items-center gap-2">
                                            <span style={{ fontSize: '14px' }}>الشفافية:</span>
                                            <input
                                                type="range"
                                                min="0.02"
                                                max="0.3"
                                                step="0.01"
                                                value={brandingSettings.watermarkOpacity}
                                                onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                                                style={{ width: '120px' }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div style={{ marginTop: '20px' }}>
                                    <button onClick={() => saveBranding()} disabled={isSavingBranding} className="btn" style={{ background: 'var(--color-primary)', color: 'white' }}>
                                        حفظ إعدادات العرض
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'system' && isAdmin && (
                        <form onSubmit={handleSystemSubmit((data) => updateSystemMutation.mutate(data))} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }}>
                            <div className="dashboard-columns" style={{ margin: 0, gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '14px', fontWeight: 600 }}>اسم الاتحاد (عربي)</label>
                                    <input type="text" {...registerSystem('union_name_ar')} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '14px', fontWeight: 600 }}>اسم الاتحاد (إنجليزي)</label>
                                    <input type="text" {...registerSystem('union_name_en')} />
                                </div>
                            </div>

                            <div className="dashboard-columns" style={{ margin: 0, gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '14px', fontWeight: 600 }}>العملة الافتراضية</label>
                                    <select {...registerSystem('default_currency')}>
                                        <option value="TRY">ليرة تركية (TRY)</option>
                                        <option value="USD">دولار أمريكي (USD)</option>
                                        <option value="YR">ريال يمني (YR)</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '14px', fontWeight: 600 }}>مدة العضوية (أشهر)</label>
                                    <input type="number" {...registerSystem('membership_duration_months')} />
                                </div>
                            </div>

                            <div style={{ paddingTop: '12px' }}>
                                <button type="submit" className="btn" style={{ background: 'var(--color-primary)', color: 'white' }}>
                                    حفظ إعدادات النظام
                                </button>
                            </div>
                        </form>
                    )}
                </main>
            </div>
        </div>
    );
}
