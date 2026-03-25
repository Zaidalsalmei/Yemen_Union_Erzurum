import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface SupportTicketFormData {
    subject: string;
    category: string;
    priority: string;
    description: string;
    attachments: File[];
}

export function SupportTicketCreate() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<SupportTicketFormData>({
        subject: '',
        category: 'general',
        priority: 'medium',
        description: '',
        attachments: [],
    });

    const categories = [
        { value: 'general', label: 'استفسار عام', icon: '💬' },
        { value: 'membership', label: 'العضوية والاشتراك', icon: '🎫' },
        { value: 'payment', label: 'الدفع والفواتير', icon: '💳' },
        { value: 'activities', label: 'الأنشطة والفعاليات', icon: '🎉' },
        { value: 'technical', label: 'مشكلة تقنية', icon: '🔧' },
        { value: 'complaint', label: 'شكوى', icon: '⚠️' },
        { value: 'suggestion', label: 'اقتراح', icon: '💡' },
    ];

    const priorities = [
        { value: 'low', label: 'منخفضة', color: '#10B981' },
        { value: 'medium', label: 'متوسطة', color: '#F59E0B' },
        { value: 'high', label: 'عالية', color: '#EF4444' },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        // Validate total files (max 3)
        if (formData.attachments.length + files.length > 3) {
            toast.error('يمكنك رفع 3 ملفات كحد أقصى');
            return;
        }

        // Validate each file
        const validFiles = files.filter(file => {
            // Check file size (max 5MB per file)
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`الملف ${file.name} كبير جداً (الحد الأقصى 5MB)`);
                return false;
            }
            return true;
        });

        setFormData({
            ...formData,
            attachments: [...formData.attachments, ...validFiles],
        });
    };

    const removeAttachment = (index: number) => {
        const newAttachments = formData.attachments.filter((_, i) => i !== index);
        setFormData({ ...formData, attachments: newAttachments });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.subject.trim()) {
            toast.error('يرجى إدخال موضوع التذكرة');
            return;
        }

        if (!formData.description.trim()) {
            toast.error('يرجى إدخال تفاصيل المشكلة');
            return;
        }

        setLoading(true);

        try {
            // In real app, this would call API
            // const ticketData = new FormData();
            // ticketData.append('subject', formData.subject);
            // ticketData.append('category', formData.category);
            // ticketData.append('priority', formData.priority);
            // ticketData.append('description', formData.description);
            // formData.attachments.forEach((file, index) => {
            //     ticketData.append(`attachments[${index}]`, file);
            // });
            // await memberDashboardService.createSupportTicket(ticketData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            toast.success('تم إرسال التذكرة بنجاح! سنرد عليك في أقرب وقت');

            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('حدث خطأ في إرسال التذكرة. يرجى المحاولة مرة أخرى');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/');
    };

    const selectedCategory = categories.find(c => c.value === formData.category);
    const selectedPriority = priorities.find(p => p.value === formData.priority);

    return (
        <>
            <div className="support-ticket-page">
                {/* Page Header */}
                <div className="page-header">
                    <div className="header-content">
                        <div>
                            <h1 className="page-title">💬 تذكرة دعم جديدة</h1>
                            <p className="page-subtitle">نحن هنا لمساعدتك! صف مشكلتك وسنرد عليك قريباً</p>
                        </div>
                        <button className="back-btn" onClick={handleBack}>
                            رجوع
                        </button>
                    </div>
                </div>

                <div className="content-wrapper">
                    {/* Quick Help Section */}
                    <div className="quick-help">
                        <h3>🚀 مساعدة سريعة</h3>
                        <div className="help-cards">
                            <a href="#faq" className="help-card">
                                <span className="help-icon">❓</span>
                                <div>
                                    <strong>الأسئلة الشائعة</strong>
                                    <p>ابحث عن إجابة سريعة</p>
                                </div>
                            </a>
                            <a href="https://wa.me/05XXXXXXXXX" target="_blank" rel="noopener noreferrer" className="help-card">
                                <span className="help-icon">📱</span>
                                <div>
                                    <strong>واتساب</strong>
                                    <p>تواصل مباشر مع الإدارة</p>
                                </div>
                            </a>
                            <div className="help-card">
                                <span className="help-icon">📧</span>
                                <div>
                                    <strong>البريد الإلكتروني</strong>
                                    <p>support@yemenstudents.org</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ticket Form */}
                    <form className="ticket-form" onSubmit={handleSubmit}>
                        <h3 className="form-title">📝 تفاصيل التذكرة</h3>

                        {/* Member Info */}
                        <div className="member-info">
                            <div className="info-item">
                                <span className="info-label">الاسم:</span>
                                <span className="info-value">{user?.full_name}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">رقم العضوية:</span>
                                <span className="info-value">MEM-2025-001</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">الهاتف:</span>
                                <span className="info-value">{user?.phone_number}</span>
                            </div>
                        </div>

                        {/* Category Selection */}
                        <div className="form-group">
                            <label className="required">نوع المشكلة</label>
                            <div className="category-grid">
                                {categories.map((category) => (
                                    <div
                                        key={category.value}
                                        className={`category-card ${formData.category === category.value ? 'category-card--selected' : ''}`}
                                        onClick={() => setFormData({ ...formData, category: category.value })}
                                    >
                                        <span className="category-icon">{category.icon}</span>
                                        <span className="category-label">{category.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Priority Selection */}
                        <div className="form-group">
                            <label className="required">الأولوية</label>
                            <div className="priority-options">
                                {priorities.map((priority) => (
                                    <label
                                        key={priority.value}
                                        className={`priority-option ${formData.priority === priority.value ? 'priority-option--selected' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="priority"
                                            value={priority.value}
                                            checked={formData.priority === priority.value}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                            hidden
                                        />
                                        <span className="priority-dot" style={{ backgroundColor: priority.color }}></span>
                                        <span className="priority-label">{priority.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="form-group">
                            <label className="required">موضوع التذكرة</label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="مثال: مشكلة في تجديد الاشتراك"
                                maxLength={100}
                                required
                            />
                            <div className="char-count">{formData.subject.length}/100</div>
                        </div>

                        {/* Description */}
                        <div className="form-group">
                            <label className="required">تفاصيل المشكلة</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="اشرح المشكلة بالتفصيل... كلما كانت التفاصيل أكثر، كلما كان الحل أسرع"
                                rows={6}
                                maxLength={1000}
                                required
                            />
                            <div className="char-count">{formData.description.length}/1000</div>
                        </div>

                        {/* Attachments */}
                        <div className="form-group">
                            <label>المرفقات (اختياري)</label>
                            <div className="attachments-area">
                                <input
                                    type="file"
                                    id="attachments"
                                    multiple
                                    accept="image/*,.pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                    hidden
                                />
                                <label htmlFor="attachments" className="upload-btn">
                                    📎 إرفاق ملفات (حتى 3 ملفات)
                                </label>

                                {formData.attachments.length > 0 && (
                                    <div className="attachments-list">
                                        {formData.attachments.map((file, index) => (
                                            <div key={index} className="attachment-item">
                                                <span className="file-icon">📄</span>
                                                <span className="file-name">{file.name}</span>
                                                <span className="file-size">({(file.size / 1024).toFixed(0)} KB)</span>
                                                <button
                                                    type="button"
                                                    className="remove-btn"
                                                    onClick={() => removeAttachment(index)}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="upload-hint">
                                يمكنك رفع صور أو ملفات PDF/Word (حتى 5MB لكل ملف)
                            </div>
                        </div>

                        {/* Expected Response Time */}
                        <div className="response-time-info">
                            <span className="info-icon">⏱️</span>
                            <div className="info-text">
                                <strong>وقت الاستجابة المتوقع:</strong>
                                <p>
                                    {formData.priority === 'high' && 'خلال 4 ساعات (أولوية عالية)'}
                                    {formData.priority === 'medium' && 'خلال 24 ساعة (أولوية متوسطة)'}
                                    {formData.priority === 'low' && 'خلال 48 ساعة (أولوية منخفضة)'}
                                </p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="form-actions">
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={loading}
                            >
                                {loading ? '⏳ جاري الإرسال...' : '✓ إرسال التذكرة'}
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

                    {/* Tips Section */}
                    <div className="tips-section">
                        <h4>💡 نصائح للحصول على رد أسرع</h4>
                        <ul>
                            <li>كن واضحاً ومحدداً في وصف المشكلة</li>
                            <li>أرفق لقطات شاشة إذا كانت المشكلة تقنية</li>
                            <li>اذكر الخطوات التي قمت بها قبل حدوث المشكلة</li>
                            <li>تحقق من الأسئلة الشائعة قبل إنشاء تذكرة</li>
                        </ul>
                    </div>
                </div>
            </div>

            <style>{`
                .support-ticket-page {
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

                .quick-help {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    margin-bottom: 24px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }

                .quick-help h3 {
                    font-size: 18px;
                    font-weight: 700;
                    color: #D60000;
                    margin: 0 0 16px;
                }

                .help-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 16px;
                }

                .help-card {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: #F9FAFB;
                    border: 2px solid #E0E0E0;
                    border-radius: 12px;
                    text-decoration: none;
                    color: inherit;
                    transition: all 0.3s ease;
                }

                .help-card:hover {
                    border-color: #D60000;
                    background: #FEF2F2;
                    transform: translateY(-2px);
                }

                .help-icon {
                    font-size: 32px;
                    flex-shrink: 0;
                }

                .help-card strong {
                    display: block;
                    font-size: 15px;
                    color: #000;
                    margin-bottom: 4px;
                }

                .help-card p {
                    font-size: 13px;
                    color: #666;
                    margin: 0;
                }

                .ticket-form {
                    background: white;
                    border-radius: 16px;
                    padding: 32px;
                    margin-bottom: 24px;
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

                .member-info {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    padding: 16px;
                    background: #F9FAFB;
                    border-radius: 12px;
                    margin-bottom: 24px;
                }

                .info-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .info-label {
                    font-size: 12px;
                    color: #666;
                    font-weight: 600;
                }

                .info-value {
                    font-size: 15px;
                    color: #000;
                    font-weight: 700;
                }

                .form-group {
                    margin-bottom: 24px;
                }

                .form-group label {
                    display: block;
                    font-weight: 700;
                    font-size: 14px;
                    color: #333;
                    margin-bottom: 12px;
                }

                .form-group label.required::after {
                    content: ' *';
                    color: #D60000;
                }

                .category-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 12px;
                }

                .category-card {
                    padding: 16px;
                    border: 2px solid #E0E0E0;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-align: center;
                }

                .category-card:hover {
                    border-color: #D60000;
                    background: #FEF2F2;
                }

                .category-card--selected {
                    border-color: #D60000;
                    background: linear-gradient(135deg, #FEF2F2 0%, #FFFFFF 100%);
                    box-shadow: 0 4px 12px rgba(214, 0, 0, 0.2);
                }

                .category-icon {
                    font-size: 32px;
                }

                .category-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #333;
                }

                .priority-options {
                    display: flex;
                    gap: 16px;
                }

                .priority-option {
                    flex: 1;
                    padding: 14px;
                    border: 2px solid #E0E0E0;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .priority-option:hover {
                    border-color: #999;
                }

                .priority-option--selected {
                    border-color: #D60000;
                    background: #FEF2F2;
                }

                .priority-dot {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .priority-label {
                    font-weight: 600;
                    font-size: 14px;
                }

                .form-group input,
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
                .form-group textarea:focus {
                    outline: none;
                    border-color: #D60000;
                    box-shadow: 0 0 0 4px rgba(214, 0, 0, 0.1);
                }

                .char-count {
                    text-align: left;
                    font-size: 12px;
                    color: #999;
                    margin-top: 4px;
                }

                .attachments-area {
                    margin-top: 8px;
                }

                .upload-btn {
                    display: inline-block;
                    padding: 12px 24px;
                    background: white;
                    border: 2px dashed #E0E0E0;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .upload-btn:hover {
                    border-color: #D60000;
                    background: #FEF2F2;
                }

                .attachments-list {
                    margin-top: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .attachment-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: #F9FAFB;
                    border-radius: 8px;
                }

                .file-icon {
                    font-size: 24px;
                }

                .file-name {
                    flex: 1;
                    font-size: 14px;
                    font-weight: 600;
                    color: #333;
                }

                .file-size {
                    font-size: 12px;
                    color: #666;
                }

                .remove-btn {
                    width: 28px;
                    height: 28px;
                    background: #FEE2E2;
                    color: #DC2626;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    font-weight: 700;
                    transition: all 0.3s ease;
                }

                .remove-btn:hover {
                    background: #DC2626;
                    color: white;
                }

                .upload-hint {
                    font-size: 12px;
                    color: #666;
                    margin-top: 8px;
                }

                .response-time-info {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
                    border-radius: 12px;
                    margin-bottom: 24px;
                }

                .info-icon {
                    font-size: 32px;
                    flex-shrink: 0;
                }

                .info-text strong {
                    display: block;
                    color: #92400E;
                    margin-bottom: 4px;
                }

                .info-text p {
                    font-size: 14px;
                    color: #78350F;
                    margin: 0;
                }

                .form-actions {
                    display: flex;
                    gap: 16px;
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
                    background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
                    color: white;
                    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
                }

                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
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

                .tips-section {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }

                .tips-section h4 {
                    font-size: 16px;
                    font-weight: 700;
                    color: #D60000;
                    margin: 0 0 16px;
                }

                .tips-section ul {
                    margin: 0;
                    padding: 0 0 0 24px;
                    list-style: disc;
                }

                .tips-section li {
                    font-size: 14px;
                    color: #666;
                    line-height: 1.8;
                    margin-bottom: 8px;
                }

                @media (max-width: 768px) {
                    .support-ticket-page {
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

                    .help-cards {
                        grid-template-columns: 1fr;
                    }

                    .category-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .priority-options {
                        flex-direction: column;
                    }

                    .form-actions {
                        flex-direction: column;
                    }
                }
            `}</style>
        </>
    );
}
