import { useState } from 'react';
import type { MemberProfileUpdate } from '../../types';

interface FirstLoginModalProps {
    isOpen: boolean;
    onComplete: (data: MemberProfileUpdate) => void;
    initialData?: Partial<MemberProfileUpdate>;
}

export function FirstLoginModal({ isOpen, onComplete, initialData }: FirstLoginModalProps) {
    const [formData, setFormData] = useState<MemberProfileUpdate>({
        full_name: initialData?.full_name || '',
        city: initialData?.city || '',
        university: initialData?.university || '',
        faculty: initialData?.faculty || '',
        email: initialData?.email || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onComplete(formData);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="first-login-modal">
                <div className="first-login-modal__overlay" />
                <div className="first-login-modal__content">
                    <div className="first-login-modal__header">
                        <h2>👋 مرحباً بك!</h2>
                        <p>يرجى إكمال معلومات الملف الشخصي لمتابعة استخدام النظام</p>
                    </div>

                    <form onSubmit={handleSubmit} className="first-login-form">
                        <div className="form-group">
                            <label className="required">الاسم الكامل</label>
                            <input
                                type="text"
                                placeholder="أدخل اسمك الكامل"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="required">المدينة</label>
                            <input
                                type="text"
                                placeholder="أرضروم، تركيا"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>الجامعة</label>
                            <input
                                type="text"
                                placeholder="اسم الجامعة (إن وجد)"
                                value={formData.university}
                                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>الكلية / القسم</label>
                            <input
                                type="text"
                                placeholder="الكلية أو القسم (إن وجد)"
                                value={formData.faculty}
                                onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>البريد الإلكتروني</label>
                            <input
                                type="email"
                                placeholder="example@email.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <button type="submit" className="complete-profile-btn">
                            حفظ واستمرار
                        </button>
                    </form>
                </div>
            </div>

            <style>{`
                .first-login-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    animation: modalFadeIn 0.3s ease-out;
                }

                @keyframes modalFadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .first-login-modal__overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                }

                .first-login-modal__content {
                    position: relative;
                    background: white;
                    border-radius: 24px;
                    padding: 40px;
                    max-width: 500px;
                    width: 100%;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    animation: modalSlideUp 0.3s ease-out;
                }

                @keyframes modalSlideUp {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                .first-login-modal__header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .first-login-modal__header h2 {
                    font-size: 28px;
                    font-weight: 800;
                    color: #000;
                    margin: 0 0 12px;
                }

                .first-login-modal__header p {
                    font-size: 15px;
                    color: #666;
                    margin: 0;
                    line-height: 1.5;
                }

                .first-login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-group label {
                    font-weight: 700;
                    font-size: 14px;
                    color: #333;
                }

                .form-group label.required::after {
                    content: ' *';
                    color: #D60000;
                    font-weight: 700;
                }

                .form-group input {
                    padding: 14px 16px;
                    border: 2px solid #E0E0E0;
                    border-radius: 12px;
                    font-family: 'Cairo', sans-serif;
                    font-size: 15px;
                    transition: all 0.3s ease;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #D60000;
                    box-shadow: 0 0 0 4px rgba(214, 0, 0, 0.1);
                }

                .form-group input::placeholder {
                    color: #999;
                }

                .complete-profile-btn {
                    padding: 16px;
                    background: linear-gradient(135deg, #D60000 0%, #8A0000 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 800;
                    font-size: 16px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-top: 8px;
                    box-shadow: 0 6px 20px rgba(214, 0, 0, 0.3);
                }

                .complete-profile-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(214, 0, 0, 0.4);
                }

                .complete-profile-btn:active {
                    transform: translateY(0);
                }

                @media (max-width: 768px) {
                    .first-login-modal__content {
                        padding: 28px;
                    }

                    .first-login-modal__header h2 {
                        font-size: 24px;
                    }
                }
            `}</style>
        </>
    );
}
