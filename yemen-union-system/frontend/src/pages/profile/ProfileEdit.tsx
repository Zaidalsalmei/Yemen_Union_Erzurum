import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import api from '../../services/api';
import ImageUpload from '../../components/ImageUpload';

interface ProfileFormData {
    full_name: string;
    email: string;
    city: string;
    university: string;
    faculty: string;
    profile_photo: File | null;
}

interface PasswordFormData {
    current_password: string;
    new_password: string;
    confirm_password: string;
}

export function ProfileEdit() {
    const { user, refreshPermissions } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
    const [loading, setLoading] = useState(false);

    const [profileData, setProfileData] = useState<ProfileFormData>({
        full_name: user?.full_name || '',
        email: user?.email || '',
        city: user?.city || '',
        university: user?.university || '',
        faculty: user?.faculty || '',
        profile_photo: null,
    });

    const [passwordData, setPasswordData] = useState<PasswordFormData>({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });


    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // In real app, this would call API
            // const formData = new FormData();
            // formData.append('full_name', profileData.full_name);
            // if (profileData.profile_photo) {
            //     formData.append('profile_photo', profileData.profile_photo);
            // }
            // await memberDashboardService.updateProfile(formData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            toast.success('تم تحديث البيانات بنجاح!');

            // Refresh user data
            await refreshPermissions();

            setTimeout(() => {
                navigate('/settings');
            }, 1000);
        } catch (error) {
            console.error('Update error:', error);
            toast.error('حدث خطأ في تحديث البيانات');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.new_password !== passwordData.confirm_password) {
            toast.error('كلمة المرور الجديدة غير متطابقة');
            return;
        }

        if (passwordData.new_password.length < 8) {
            toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            return;
        }

        setLoading(true);

        try {
            // In real app, this would call API
            // await authService.changePassword({
            //     current_password: passwordData.current_password,
            //     new_password: passwordData.new_password,
            // });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            toast.success('تم تغيير كلمة المرور بنجاح!');

            setPasswordData({
                current_password: '',
                new_password: '',
                confirm_password: '',
            });
        } catch (error) {
            console.error('Password change error:', error);
            toast.error('كلمة المرور الحالية غير صحيحة');
        } finally {
            setLoading(false);
        }
    };

    // Navigate back to settings page (Account section)
    const handleBack = () => {
        navigate('/settings');
    };

    return (
        <>
            <div className="profile-edit-page">
                {/* Page Header */}
                <div className="page-header">
                    <div className="header-content">
                        <div>
                            <h1 className="page-title">✏️ تحديث البيانات الشخصية</h1>
                            <p className="page-subtitle">قم بتحديث معلوماتك الشخصية أو تغيير كلمة المرور</p>
                        </div>
                        <button className="back-btn" onClick={handleBack}>
                            العودة لحسابي
                        </button>
                    </div>
                </div>

                <div className="content-wrapper">
                    {/* Member Info Card */}
                    <div className="member-info-card">
                        <div className="member-avatar">
                            {user?.profile_photo ? (
                                <img src={user.profile_photo} alt={user?.full_name} />
                            ) : (
                                <div className="avatar-placeholder">
                                    {user?.full_name?.charAt(0) || 'ع'}
                                </div>
                            )}
                        </div>
                        <div className="member-details">
                            <h3>{user?.full_name}</h3>
                            <p>رقم العضوية: MEM-2025-001</p>
                            <p>رقم الهاتف: {user?.phone_number}</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === 'profile' ? 'tab--active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            📝 المعلومات الشخصية
                        </button>
                        <button
                            className={`tab ${activeTab === 'password' ? 'tab--active' : ''}`}
                            onClick={() => setActiveTab('password')}
                        >
                            🔒 تغيير كلمة المرور
                        </button>
                    </div>

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <form className="edit-form" onSubmit={handleProfileSubmit}>
                            <h3 className="form-title">المعلومات الأساسية</h3>

                            <div className="form-group">
                                <label className="required">الاسم الكامل</label>
                                <input
                                    type="text"
                                    value={profileData.full_name}
                                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                    placeholder="أدخل اسمك الكامل"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>البريد الإلكتروني</label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    placeholder="example@email.com"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="required">المدينة</label>
                                    <input
                                        type="text"
                                        value={profileData.city}
                                        onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                                        placeholder="أرضروم، تركيا"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>الجامعة</label>
                                    <input
                                        type="text"
                                        value={profileData.university}
                                        onChange={(e) => setProfileData({ ...profileData, university: e.target.value })}
                                        placeholder="اسم الجامعة"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>الكلية / القسم</label>
                                <input
                                    type="text"
                                    value={profileData.faculty}
                                    onChange={(e) => setProfileData({ ...profileData, faculty: e.target.value })}
                                    placeholder="الكلية أو القسم"
                                />
                            </div>

                            <div className="form-group">
                                <label>الصورة الشخصية</label>
                                <div className="photo-upload">
                                    <ImageUpload
                                        currentImage={user?.profile_photo || null}
                                        onUpload={async (url: string) => {
                                            // تحديث الصورة في قاعدة البيانات فوراً عند الرفع الناجح
                                            try {
                                                const res = await api.put('/profile', { profile_photo: url });
                                                if (res.data.success) {
                                                    await refreshPermissions();
                                                    toast.success('تم تحديث صورة الملف الشخصي');
                                                }
                                            } catch (err) {
                                                toast.error('فشل تحديث الصورة في ملفك');
                                            }
                                        }}
                                        onRemove={async () => {
                                            try {
                                                await api.put('/profile', { profile_photo: null });
                                                await refreshPermissions();
                                                toast.success('تم إزالة الصورة');
                                            } catch (err) { }
                                        }}
                                        folder="profiles"
                                        size="xl"
                                        shape="circle"
                                        label="تغيير الصورة"
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={loading}
                                >
                                    {loading ? '⏳ جاري الحفظ...' : '✓ حفظ التغييرات'}
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={handleBack}
                                    disabled={loading}
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Password Tab */}
                    {activeTab === 'password' && (
                        <form className="edit-form" onSubmit={handlePasswordSubmit}>
                            <h3 className="form-title">تغيير كلمة المرور</h3>

                            <div className="security-note">
                                <span className="note-icon">🔐</span>
                                <div className="note-content">
                                    <strong>نصائح الأمان:</strong>
                                    <ul>
                                        <li>استخدم كلمة مرور قوية (8 أحرف على الأقل)</li>
                                        <li>اجمع بين الأحرف والأرقام والرموز</li>
                                        <li>لا تشارك كلمة المرور مع أحد</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="required">كلمة المرور الحالية</label>
                                <input
                                    type="password"
                                    value={passwordData.current_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                    placeholder="أدخل كلمة المرور الحالية"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="required">كلمة المرور الجديدة</label>
                                <input
                                    type="password"
                                    value={passwordData.new_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                    placeholder="أدخل كلمة المرور الجديدة"
                                    minLength={8}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="required">تأكيد كلمة المرور الجديدة</label>
                                <input
                                    type="password"
                                    value={passwordData.confirm_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                    placeholder="أعد إدخال كلمة المرور الجديدة"
                                    minLength={8}
                                    required
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={loading}
                                >
                                    {loading ? '⏳ جاري التغيير...' : '✓ تغيير كلمة المرور'}
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setPasswordData({
                                        current_password: '',
                                        new_password: '',
                                        confirm_password: '',
                                    })}
                                    disabled={loading}
                                >
                                    إعادة تعيين
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <style>{`
                .profile-edit-page {
                    min-height: 100vh;
                    padding: 24px;
                    background: linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%);
                }

                .page-header {
                    max-width: 900px;
                    margin: 0 auto 32px;
                }

                .header-content {
                    background: white;
                    padding: 24px 32px;
                    border-radius: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }

                .page-title {
                    font-size: 28px;
                    font-weight: 800;
                    color: #000;
                    margin: 0 0 4px;
                }

                .page-subtitle {
                    font-size: 14px;
                    color: #666;
                    margin: 0;
                }

                .back-btn {
                    padding: 12px 24px;
                    background: white;
                    color: #333;
                    border: 2px solid #E0E0E0;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .back-btn:hover {
                    border-color: #D60000;
                    color: #D60000;
                }

                .content-wrapper {
                    max-width: 900px;
                    margin: 0 auto;
                }

                .member-info-card {
                    background: linear-gradient(135deg, #D60000 0%, #8A0000 100%);
                    color: white;
                    border-radius: 16px;
                    padding: 32px;
                    margin-bottom: 24px;
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    box-shadow: 0 8px 24px rgba(214, 0, 0, 0.3);
                }

                .member-avatar {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 4px solid rgba(255, 255, 255, 0.3);
                    flex-shrink: 0;
                }

                .member-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .avatar-placeholder {
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 255, 255, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 40px;
                    font-weight: 800;
                }

                .member-details h3 {
                    font-size: 24px;
                    font-weight: 800;
                    margin: 0 0 8px;
                }

                .member-details p {
                    font-size: 14px;
                    margin: 4px 0;
                    opacity: 0.9;
                }

                .tabs {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 24px;
                }

                .tab {
                    flex: 1;
                    padding: 16px;
                    background: white;
                    border: 2px solid #E0E0E0;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 15px;
                    color: #666;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .tab:hover {
                    border-color: #D60000;
                    color: #D60000;
                }

                .tab--active {
                    background: linear-gradient(135deg, #D60000 0%, #8A0000 100%);
                    color: white;
                    border-color: #D60000;
                }

                .edit-form {
                    background: white;
                    border-radius: 16px;
                    padding: 32px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }

                .form-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #D60000;
                    margin: 0 0 24px;
                    padding-bottom: 16px;
                    border-bottom: 2px solid #E0E0E0;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    font-weight: 700;
                    font-size: 14px;
                    color: #333;
                    margin-bottom: 8px;
                }

                .form-group label.required::after {
                    content: ' *';
                    color: #D60000;
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    padding: 14px 16px;
                    border: 2px solid #E0E0E0;
                    border-radius: 10px;
                    font-family: 'Cairo', sans-serif;
                    font-size: 15px;
                    transition: all 0.3s ease;
                }

                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #D60000;
                    box-shadow: 0 0 0 4px rgba(214, 0, 0, 0.1);
                }

                .photo-upload {
                    margin-top: 8px;
                }

                .photo-upload-label {
                    display: block;
                    cursor: pointer;
                }

                .photo-preview {
                    position: relative;
                    width: 200px;
                    height: 200px;
                    border-radius: 12px;
                    overflow: hidden;
                    border: 3px solid #E0E0E0;
                }

                .photo-preview img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .photo-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    color: white;
                    font-weight: 700;
                }

                .photo-preview:hover .photo-overlay {
                    opacity: 1;
                }

                .photo-placeholder {
                    width: 200px;
                    height: 200px;
                    border: 3px dashed #E0E0E0;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                }

                .photo-placeholder:hover {
                    border-color: #D60000;
                    background: #FEF2F2;
                }

                .upload-icon {
                    font-size: 48px;
                }

                .upload-text {
                    font-size: 15px;
                    font-weight: 700;
                    color: #333;
                }

                .upload-hint {
                    font-size: 12px;
                    color: #666;
                }

                .security-note {
                    background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
                    border: 2px solid #3B82F6;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 24px;
                    display: flex;
                    gap: 16px;
                }

                .note-icon {
                    font-size: 32px;
                    flex-shrink: 0;
                }

                .note-content strong {
                    display: block;
                    color: #1E40AF;
                    margin-bottom: 8px;
                }

                .note-content ul {
                    margin: 0;
                    padding: 0 0 0 20px;
                    list-style: disc;
                }

                .note-content li {
                    font-size: 14px;
                    color: #1E3A8A;
                    line-height: 1.6;
                    margin-bottom: 4px;
                }

                .form-actions {
                    display: flex;
                    gap: 16px;
                    margin-top: 32px;
                    padding-top: 24px;
                    border-top: 2px solid #E0E0E0;
                }

                .submit-btn,
                .cancel-btn {
                    flex: 1;
                    padding: 16px;
                    border-radius: 12px;
                    font-weight: 800;
                    font-size: 16px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: none;
                }

                .submit-btn {
                    background: linear-gradient(135deg, #16A34A 0%, #15803D 100%);
                    color: white;
                    box-shadow: 0 6px 20px rgba(22, 163, 74, 0.3);
                }

                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(22, 163, 74, 0.4);
                }

                .submit-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .cancel-btn {
                    background: white;
                    color: #666;
                    border: 2px solid #E0E0E0;
                }

                .cancel-btn:hover:not(:disabled) {
                    background: #F9FAFB;
                    border-color: #999;
                }

                @media (max-width: 768px) {
                    .profile-edit-page {
                        padding: 16px;
                    }

                    .header-content {
                        flex-direction: column;
                        gap: 16px;
                        padding: 20px;
                    }

                    .back-btn {
                        width: 100%;
                    }

                    .member-info-card {
                        flex-direction: column;
                        text-align: center;
                    }

                    .tabs {
                        flex-direction: column;
                    }

                    .form-row {
                        grid-template-columns: 1fr;
                    }

                    .form-actions {
                        flex-direction: column;
                    }
                }
            `}</style>
        </>
    );
}
