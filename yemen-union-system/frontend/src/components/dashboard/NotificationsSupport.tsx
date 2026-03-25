import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Notification, FAQ } from '../../types';

interface NotificationsSupportProps {
    notifications: Notification[];
    faqs: FAQ[];
    onViewAllNotifications: () => void;
}

export function NotificationsSupport({ notifications, faqs, onViewAllNotifications }: NotificationsSupportProps) {
    const [showSupportForm, setShowSupportForm] = useState(false);
    const [supportSubject, setSupportSubject] = useState('');
    const [supportMessage, setSupportMessage] = useState('');
    const [supportFile, setSupportFile] = useState<File | null>(null);
    const navigate = useNavigate();

    const getNotificationIcon = (type: string) => {
        const icons: Record<string, string> = {
            info: 'ℹ️',
            warning: '⚠️',
            success: '✅',
            error: '❌',
        };
        return icons[type] || 'ℹ️';
    };

    const getNotificationColor = (type: string) => {
        const colors: Record<string, { bg: string; border: string; text: string }> = {
            info: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF' },
            warning: { bg: '#FEF3C7', border: '#FDE68A', text: '#92400E' },
            success: { bg: '#DCFCE7', border: '#BBF7D0', text: '#15803D' },
            error: { bg: '#FEE2E2', border: '#FECACA', text: '#991B1B' },
        };
        return colors[type] || colors.info;
    };

    const handleSupportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In real app, call API
        console.log({ supportSubject, supportMessage, supportFile });
        alert('تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.');
        setSupportSubject('');
        setSupportMessage('');
        setSupportFile(null);
        setShowSupportForm(false);
    };

    return (
        <>
            <div className="notifications-support">
                {/* Notifications Section */}
                <div className="notifications-card">
                    <h3 className="section-title">🔔 آخر الإشعارات</h3>

                    <div className="notifications-list">
                        {notifications.length === 0 ? (
                            <div className="notifications-empty">
                                <div className="notifications-empty__icon">📭</div>
                                <div className="notifications-empty__text">لا توجد إشعارات جديدة</div>
                            </div>
                        ) : (
                            notifications.slice(0, 3).map((notification) => {
                                const colors = getNotificationColor(notification.type);
                                return (
                                    <div
                                        key={notification.id}
                                        className="notification-item"
                                        style={{
                                            backgroundColor: colors.bg,
                                            borderColor: colors.border,
                                        }}
                                        onClick={() => notification.action_url && navigate(notification.action_url)}
                                    >
                                        <div className="notification-icon">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="notification-content">
                                            <h4 className="notification-title" style={{ color: colors.text }}>
                                                {notification.title}
                                            </h4>
                                            <p className="notification-message">{notification.message}</p>
                                            <span className="notification-date">
                                                {new Date(notification.created_at).toLocaleDateString('ar-EG')}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <button className="view-all-btn" onClick={onViewAllNotifications}>
                        عرض كل الإشعارات →
                    </button>
                </div>

                {/* Support Section */}
                <div className="support-card">
                    <h3 className="section-title">💬 الدعم والمساعدة</h3>

                    {!showSupportForm ? (
                        <button
                            className="open-support-btn"
                            onClick={() => setShowSupportForm(true)}
                        >
                            تواصل مع الإدارة
                        </button>
                    ) : (
                        <form className="support-form" onSubmit={handleSupportSubmit}>
                            <div className="form-group">
                                <label>الموضوع</label>
                                <input
                                    type="text"
                                    placeholder="اكتب عنوان الموضوع"
                                    value={supportSubject}
                                    onChange={(e) => setSupportSubject(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>الرسالة</label>
                                <textarea
                                    placeholder="اكتب رسالتك هنا..."
                                    rows={4}
                                    value={supportMessage}
                                    onChange={(e) => setSupportMessage(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>إرفاق ملف (اختياري)</label>
                                <input
                                    type="file"
                                    onChange={(e) => setSupportFile(e.target.files?.[0] || null)}
                                />
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="submit-btn">
                                    إرسال
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setShowSupportForm(false)}
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* FAQ Section */}
                {faqs.length > 0 && (
                    <div className="faq-card">
                        <h3 className="section-title">❓ أسئلة شائعة</h3>
                        <div className="faq-list">
                            {faqs.slice(0, 5).map((faq) => (
                                <details key={faq.id} className="faq-item">
                                    <summary className="faq-question">{faq.question}</summary>
                                    <p className="faq-answer">{faq.answer}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .notifications-support {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 24px;
                    margin-bottom: 32px;
                }

                .notifications-card,
                .support-card,
                .faq-card {
                    background: white;
                    border-radius: 20px;
                    padding: 28px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    border: 1px solid #E0E0E0;
                }

                .section-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #D60000;
                    margin: 0 0 20px;
                }

                .notifications-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .notification-item {
                    padding: 16px;
                    border-radius: 12px;
                    border: 1px solid;
                    display: flex;
                    gap: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .notification-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                }

                .notification-icon {
                    font-size: 24px;
                    flex-shrink: 0;
                }

                .notification-content {
                    flex: 1;
                    min-width: 0;
                }

                .notification-title {
                    font-size: 15px;
                    font-weight: 700;
                    margin: 0 0 4px;
                }

                .notification-message {
                    font-size: 14px;
                    color: #666;
                    margin: 0 0 6px;
                    line-height: 1.5;
                }

                .notification-date {
                    font-size: 12px;
                    color: #999;
                }

                .notifications-empty {
                    text-align: center;
                    padding: 40px 20px;
                }

                .notifications-empty__icon {
                    font-size: 48px;
                    margin-bottom: 12px;
                }

                .notifications-empty__text {
                    font-size: 14px;
                    color: #666;
                }

                .view-all-btn,
                .open-support-btn {
                    width: 100%;
                    padding: 12px;
                    background: white;
                    border: 2px solid #E0E0E0;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 14px;
                    color: #D60000;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .view-all-btn:hover,
                .open-support-btn:hover {
                    background: #FEF2F2;
                    border-color: #D60000;
                    transform: translateY(-2px);
                }

                .support-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-group label {
                    font-weight: 600;
                    font-size: 14px;
                    color: #333;
                }

                .form-group input,
                .form-group textarea {
                    padding: 12px;
                    border: 1px solid #E0E0E0;
                    border-radius: 10px;
                    font-family: 'Cairo', sans-serif;
                    font-size: 14px;
                    transition: border-color 0.3s ease;
                }

                .form-group input:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #D60000;
                }

                .form-actions {
                    display: flex;
                    gap: 12px;
                }

                .submit-btn {
                    flex: 1;
                    padding: 12px;
                    background: linear-gradient(135deg, #D60000 0%, #8A0000 100%);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .submit-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(214, 0, 0, 0.3);
                }

                .cancel-btn {
                    flex: 1;
                    padding: 12px;
                    background: white;
                    color: #666;
                    border: 2px solid #E0E0E0;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .cancel-btn:hover {
                    background: #F9FAFB;
                    border-color: #999;
                }

                .faq-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .faq-item {
                    border: 1px solid #E5E7EB;
                    border-radius: 12px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }

                .faq-item:hover {
                    border-color: #D60000;
                }

                .faq-question {
                    padding: 16px;
                    font-weight: 700;
                    font-size: 14px;
                    color: #333;
                    cursor: pointer;
                    list-style: none;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .faq-question::after {
                    content: '▼';
                    font-size: 12px;
                    transition: transform 0.3s ease;
                }

                .faq-item[open] .faq-question::after {
                    transform: rotate(180deg);
                }

                .faq-answer {
                    padding: 0 16px 16px;
                    font-size: 14px;
                    color: #666;
                    line-height: 1.6;
                    margin: 0;
                }

                @media (max-width: 768px) {
                    .notifications-support {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </>
    );
}
