import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { LoadingPage } from '../common';
import type { Role } from '../../types';
import { MODULES, PERMISSION_LEVELS, getPermissionString, DEFAULT_ROLES } from '../../utils/permissions';


interface RoleFormData {
    name: string;
    display_name_ar: string;
    description_ar: string;
    permissions: string[];
}

export function RolesManager() {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const queryClient = useQueryClient();

    // Fetch Roles
    const { data: roles, isLoading } = useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            // Mocking data if backend isn't ready, or use real endpoint
            try {
                const res = await api.get<any>('/roles');
                return res.data.data as Role[];
            } catch (e) {
                console.warn('Failed to fetch roles, using mocks for development');
                return DEFAULT_ROLES as unknown as Role[];
            }
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/roles/${id}`);
        },
        onSuccess: () => {
            toast.success('تم حذف الدور بنجاح');
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        },
        onError: () => toast.error('حدث خطأ أثناء الحذف')
    });

    const handleDelete = async (id: number) => {
        if (confirm('هل أنت متأكد من حذف هذا الدور؟')) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) return <LoadingPage />;

    return (
        <div className="roles-manager">
            {isEditing ? (
                <RoleEditor
                    role={selectedRole}
                    onCancel={() => { setIsEditing(false); setSelectedRole(null); }}
                    onSuccess={() => { setIsEditing(false); setSelectedRole(null); queryClient.invalidateQueries({ queryKey: ['roles'] }); }}
                />
            ) : (
                <div className="roles-list-view">
                    <div className="section-header">
                        <div>
                            <h2>الأدوار والصلاحيات</h2>
                            <p>إدارة أدوار المستخدمين وصلاحياتهم في النظام</p>
                        </div>
                        <button className="btn-primary" onClick={() => setIsEditing(true)}>
                            <span className="icon">➕</span>
                            إضافة دور جديد
                        </button>
                    </div>

                    <div className="roles-grid">
                        {roles?.map((role) => (
                            <div key={role.id} className="role-card">
                                <div className="role-header">
                                    <div className="role-icon">🛡️</div>
                                    <div className="role-info">
                                        <h3>{role.display_name_ar}</h3>
                                        <span className="role-name-en">{role.name}</span>
                                    </div>
                                    {role.is_system_role && <span className="badge-system">نظام</span>}
                                </div>
                                <p className="role-desc">{role.description_ar || 'لا يوجد وصف'}</p>
                                <div className="role-stats">
                                    <div className="stat">
                                        <span className="label">الصلاحيات</span>
                                        <span className="value">{role.permissions?.length || 0}</span>
                                    </div>
                                    {/* Placeholder for members count if available */}
                                </div>
                                <div className="role-actions">
                                    <button
                                        className="btn-ghost"
                                        onClick={() => { setSelectedRole(role); setIsEditing(true); }}
                                    >
                                        تعديل
                                    </button>
                                    {!role.is_system_role && (
                                        <button
                                            className="btn-ghost text-red"
                                            onClick={() => handleDelete(role.id)}
                                        >
                                            حذف
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <style>{`
                .roles-manager {
                    animation: fadeIn 0.3s ease;
                }
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }
                .section-header h2 { font-size: 20px; font-weight: 700; margin: 0 0 4px; }
                .section-header p { color: #6B7280; font-size: 14px; margin: 0; }
                
                .roles-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                }

                .role-card {
                    background: white;
                    border: 1px solid #E5E7EB;
                    border-radius: 16px;
                    padding: 20px;
                    transition: all 0.2s;
                }
                .role-card:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    border-color: #FECACA;
                }

                .role-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 12px;
                }
                .role-icon {
                    width: 40px;
                    height: 40px;
                    background: #FEE2E2;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                }
                .role-info h3 { margin: 0; font-size: 16px; font-weight: 700; }
                .role-name-en { font-size: 12px; color: #9CA3AF; font-family: monospace; }
                .badge-system {
                    margin-right: auto;
                    background: #F3F4F6;
                    color: #6B7280;
                    font-size: 10px;
                    padding: 2px 8px;
                    border-radius: 10px;
                }
                .role-desc {
                    color: #4B5563;
                    font-size: 14px;
                    line-height: 1.5;
                    margin-bottom: 16px;
                    min-height: 42px;
                }
                
                .role-stats {
                    border-top: 1px solid #F3F4F6;
                    padding: 12px 0;
                    margin-bottom: 12px;
                    display: flex;
                    gap: 16px;
                }
                .stat { display: flex; flex-direction: column; gap: 2px; }
                .stat .label { font-size: 10px; color: #9CA3AF; text-transform: uppercase; }
                .stat .value { font-weight: 700; color: #111827; }

                .role-actions {
                    display: flex;
                    gap: 8px;
                }
                .text-red { color: #DC2626; }
                .text-red:hover { background: #FEE2E2; }
            `}</style>
        </div>
    );
}

// Sub-component for editing/creating role
function RoleEditor({ role, onCancel, onSuccess }: { role: Role | null, onCancel: () => void, onSuccess: () => void }) {
    const { register, handleSubmit, formState: { errors } } = useForm<RoleFormData>({
        defaultValues: {
            name: role?.name || '',
            display_name_ar: role?.display_name_ar || '',
            description_ar: role?.description_ar || '',
            permissions: role?.permissions || [],
        }
    });

    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(role?.permissions || []);

    const togglePermission = (module: string, level: string) => {
        const permString = getPermissionString(module, level);
        setSelectedPermissions(prev => {
            if (prev.includes(permString)) {
                return prev.filter(p => p !== permString);
            } else {
                // Logic: If 'admin' is selected, maybe auto-select read/write? 
                // For now, simple toggle.
                return [...prev, permString];
            }
        });
    };

    const isPermissionChecked = (module: string, level: string) => {
        // If admin is checked for this module, read/write are implicitly true?
        // Let's keep it explicit for the UI to avoid confusion.
        return selectedPermissions.includes(getPermissionString(module, level));
    };

    const mutation = useMutation({
        mutationFn: async (data: RoleFormData) => {
            const payload = { ...data, permissions: selectedPermissions };
            if (role) {
                await api.put(`/roles/${role.id}`, payload);
            } else {
                await api.post('/roles', payload);
            }
        },
        onSuccess: () => {
            toast.success(role ? 'تم تحديث الدور' : 'تم إنشاء الدور');
            onSuccess();
        },
        onError: () => toast.error('حدث خطأ أثناء الحفظ')
    });

    return (
        <div className="role-editor">
            <div className="editor-header">
                <div>
                    <h3>{role ? 'تعديل الدور' : 'إنشاء دور جديد'}</h3>
                    <p>{role?.display_name_ar || 'قم بتحديد صلاحيات الدور الجديد بدقة'}</p>
                </div>
                <div className="editor-actions">
                    <button className="btn-ghost" onClick={onCancel}>إلغاء</button>
                    <button className="btn-primary" onClick={handleSubmit((d) => mutation.mutate(d))} disabled={mutation.isPending}>
                        {mutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </button>
                </div>
            </div>

            <div className="editor-content">
                <div className="form-section">
                    <h4>البيانات الأساسية</h4>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>اسم الدور (عربي)</label>
                            <input {...register('display_name_ar', { required: 'هذا الحقل مطلوب' })} placeholder="مثال: مشرف مالي" />
                            {errors.display_name_ar && <span className="error">{errors.display_name_ar.message}</span>}
                        </div>
                        <div className="form-group">
                            <label>الاسم البرمجي (إنجليزي)</label>
                            <input {...register('name', { required: 'هذا الحقل مطلوب' })} placeholder="admin_finance" disabled={!!role} />
                            {errors.name && <span className="error">{errors.name.message}</span>}
                        </div>
                        <div className="form-group full-width">
                            <label>الوصف</label>
                            <textarea {...register('description_ar')} rows={2} />
                        </div>
                    </div>
                </div>

                <div className="permissions-section">
                    <h4>جدول الصلاحيات</h4>
                    <div className="permissions-table-container">
                        <table className="permissions-table">
                            <thead>
                                <tr>
                                    <th>الوحدة / النظام</th>
                                    {PERMISSION_LEVELS.map(level => (
                                        <th key={level.id}>{level.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {MODULES.map(module => (
                                    <tr key={module.id}>
                                        <td className="module-cell">
                                            <div className="module-info">
                                                {/* We could add icons here if we map them */}
                                                <span>{module.label}</span>
                                            </div>
                                        </td>
                                        {PERMISSION_LEVELS.map(level => (
                                            <td key={level.id} className="checkbox-cell">
                                                <label className="checkbox-container">
                                                    <input
                                                        type="checkbox"
                                                        checked={isPermissionChecked(module.id, level.id)}
                                                        onChange={() => togglePermission(module.id, level.id)}
                                                    />
                                                    <span className="checkmark"></span>
                                                </label>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`
                .role-editor {
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                }
                .editor-header {
                    padding: 24px;
                    border-bottom: 1px solid #F3F4F6;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: linear-gradient(to right, #ffffff, #fafafa);
                }
                .editor-header h3 { margin: 0 0 4px; font-size: 18px; }
                .editor-header p { margin: 0; color: #6B7280; font-size: 14px; }
                .editor-actions { display: flex; gap: 12px; }

                .editor-content { padding: 24px; }
                .form-section { margin-bottom: 32px; }
                .form-section h4, .permissions-section h4 { 
                    font-size: 16px; 
                    margin-bottom: 16px; 
                    color: #111827; 
                    border-right: 4px solid #DC2626;
                    padding-right: 12px;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }
                .full-width { grid-column: 1 / -1; }
                .form-group label { display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px; }
                .form-group input, .form-group textarea {
                    width: 100%;
                    padding: 10px 14px;
                    border: 1px solid #E5E7EB;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: all 0.2s;
                }
                .form-group input:focus, .form-group textarea:focus {
                    outline: none;
                    border-color: #DC2626;
                    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
                }
                .error { color: #DC2626; font-size: 12px; margin-top: 4px; display: block; }

                .permissions-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    border: 1px solid #E5E7EB;
                    border-radius: 12px;
                    overflow: hidden;
                }
                .permissions-table th {
                    background: #F9FAFB;
                    padding: 12px 16px;
                    text-align: right;
                    font-weight: 600;
                    color: #374151;
                    font-size: 13px;
                    border-bottom: 1px solid #E5E7EB;
                }
                .permissions-table td {
                    padding: 12px 16px;
                    border-bottom: 1px solid #F3F4F6;
                }
                .permissions-table tr:last-child td { border-bottom: none; }
                
                .module-info { font-weight: 500; color: #111827; }
                .checkbox-cell { text-align: center; }
                .checkbox-container {
                    display: inline-flex;
                    cursor: pointer;
                    position: relative;
                }
                .checkbox-container input {
                    position: absolute;
                    opacity: 0;
                    cursor: pointer;
                }
                .checkmark {
                    height: 20px;
                    width: 20px;
                    background-color: #eee;
                    border-radius: 4px;
                    transition: all 0.2s;
                }
                .checkbox-container:hover input ~ .checkmark { background-color: #ccc; }
                .checkbox-container input:checked ~ .checkmark { background-color: #DC2626; }
                .checkmark:after {
                    content: "";
                    position: absolute;
                    display: none;
                }
                .checkbox-container input:checked ~ .checkmark:after {
                    display: block;
                }
                .checkbox-container .checkmark:after {
                    left: 7px;
                    top: 3px;
                    width: 6px;
                    height: 11px;
                    border: solid white;
                    border-width: 0 2px 2px 0;
                    transform: rotate(45deg);
                }
            `}</style>
        </div>
    );
}
