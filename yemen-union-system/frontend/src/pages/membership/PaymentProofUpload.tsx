import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface PaymentProofFormData {
    amount: string;
    paymentDate: string;
    paymentMethod: string;
    transactionId: string;
    notes: string;
    proofFile: File | null;
}

export function PaymentProofUpload() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const packageInfo = location.state?.package;

    const [formData, setFormData] = useState<PaymentProofFormData>({
        amount: packageInfo?.price?.toString() || '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'bank_transfer',
        transactionId: '',
        notes: '',
        proofFile: null,
    });

    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const paymentMethods = [
        { value: 'bank_transfer', label: 'تحويل بنكي' },
        { value: 'mobile_money', label: 'محفظة إلكترونية' },
        { value: 'cash', label: 'نقداً' },
        { value: 'other', label: 'أخرى' },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            toast.error('نوع الملف غير مدعوم. يرجى رفع صورة أو PDF');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت');
            return;
        }

        setFormData({ ...formData, proofFile: file });

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.proofFile) {
            toast.error('يرجى رفع إثبات الدفع');
            return;
        }

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            toast.error('يرجى إدخال المبلغ المدفوع');
            return;
        }

        setUploading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('payment_proof', formData.proofFile);
            formDataToSend.append('amount', formData.amount);
            formDataToSend.append('payment_date', formData.paymentDate);
            formDataToSend.append('payment_method', formData.paymentMethod);
            if (formData.transactionId) formDataToSend.append('reference_id', formData.transactionId);
            if (formData.notes) formDataToSend.append('notes', formData.notes);
            if (packageInfo) {
                formDataToSend.append('package_type', packageInfo.id);
                formDataToSend.append('duration_months', packageInfo.duration.toString());
            } else {
                formDataToSend.append('package_type', 'annual');
            }

            await api.post('/memberships/renew', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('تم رفع إثبات الدفع بنجاح! سيتم مراجعته خلال 24 ساعة');

            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('حدث خطأ في رفع الملف. يرجى المحاولة مرة أخرى');
        } finally {
            setUploading(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <>
            <div className="payment-proof-page">
                {/* Page Header */}
                <div className="page-header">
                    <div className="header-content">
                        <div>
                            <h1 className="page-title">📄 رفع إثبات الدفع</h1>
                            <p className="page-subtitle">قم برفع صورة أو ملف إيصال الدفع</p>
                        </div>
                        <button className="back-btn" onClick={handleBack}>
                            رجوع
                        </button>
                    </div>
                </div>

                <div className="content-wrapper">
                    {/* Package Info (if coming from renewal) */}
                    {packageInfo && (
                        <div className="package-info">
                            <h3>📦 الباقة المختارة</h3>
                            <div className="package-details">
                                <span><strong>الاسم:</strong> {packageInfo.name}</span>
                                <span><strong>المدة:</strong> {packageInfo.duration} شهر</span>
                                <span><strong>السعر:</strong> {packageInfo.price} {packageInfo.currency}</span>
                            </div>
                        </div>
                    )}

                    {/* Bank Account Info */}
                    <div className="bank-info">
                        <h3>🏦 معلومات الحساب البنكي</h3>
                        <div className="bank-details">
                            <div className="bank-item">
                                <span className="bank-label">اسم البنك:</span>
                                <span className="bank-value">Ziraat Bankası</span>
                            </div>
                            <div className="bank-item">
                                <span className="bank-label">اسم الحساب:</span>
                                <span className="bank-value">Yemen Students Union - Erzurum</span>
                            </div>
                            <div className="bank-item">
                                <span className="bank-label">رقم الحساب (IBAN):</span>
                                <span className="bank-value copy-value">TR00 0000 0000 0000 0000 0000 00</span>
                            </div>
                            <div className="bank-item">
                                <span className="bank-label">رقم الحساب المحلي:</span>
                                <span className="bank-value copy-value">1234567890</span>
                            </div>
                        </div>
                        <div className="bank-note">
                            💡 يرجى التأكد من إدخال رقم العضوية في خانة "الوصف" عند التحويل
                        </div>
                    </div>

                    {/* Upload Form */}
                    <form className="upload-form" onSubmit={handleSubmit}>
                        <h3 className="form-title">📝 تفاصيل الدفع</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="required">المبلغ المدفوع</label>
                                <div className="input-with-unit">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="0.00"
                                        required
                                    />
                                    <span className="input-unit">TRY</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="required">تاريخ الدفع</label>
                                <input
                                    type="date"
                                    value={formData.paymentDate}
                                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                                    max={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="required">طريقة الدفع</label>
                                <select
                                    value={formData.paymentMethod}
                                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                    required
                                >
                                    {paymentMethods.map(method => (
                                        <option key={method.value} value={method.value}>
                                            {method.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>رقم المعاملة (اختياري)</label>
                                <input
                                    type="text"
                                    value={formData.transactionId}
                                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                                    placeholder="رقم الإيصال أو المعاملة"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>ملاحظات (اختياري)</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="أي ملاحظات إضافية..."
                                rows={3}
                            />
                        </div>

                        <div className="form-group">
                            <label className="required">إثبات الدفع (صورة أو PDF)</label>
                            <div className="file-upload-area">
                                <input
                                    type="file"
                                    id="proof-file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    required
                                    hidden
                                />
                                <label htmlFor="proof-file" className="file-upload-label">
                                    {formData.proofFile ? (
                                        <div className="file-selected">
                                            <span className="file-icon">📎</span>
                                            <span className="file-name">{formData.proofFile.name}</span>
                                            <span className="file-size">
                                                ({(formData.proofFile.size / 1024).toFixed(0)} KB)
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="file-placeholder">
                                            <span className="upload-icon">📤</span>
                                            <span className="upload-text">انقر لرفع الملف</span>
                                            <span className="upload-hint">JPG, PNG, PDF (حتى 5MB)</span>
                                        </div>
                                    )}
                                </label>
                            </div>

                            {preview && (
                                <div className="file-preview">
                                    <img src={preview} alt="Preview" />
                                </div>
                            )}
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={uploading || !formData.proofFile}
                            >
                                {uploading ? '⏳ جاري الرفع...' : '✓ رفع الإثبات'}
                            </button>
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={handleBack}
                                disabled={uploading}
                            >
                                إلغاء
                            </button>
                        </div>
                    </form>

                    {/* Important Notes */}
                    <div className="important-notes">
                        <h4>⚠️ ملاحظات هامة</h4>
                        <ul>
                            <li>تأكد من وضوح الصورة وإمكانية قراءة جميع التفاصيل</li>
                            <li>يجب أن يظهر في الإيصال: المبلغ، التاريخ، ورقم المعاملة</li>
                            <li>سيتم مراجعة الإثبات خلال 24 ساعة من الرفع</li>
                            <li>ستصلك إشعار عند الموافقة أو في حال الحاجة لتوضيحات</li>
                            <li>في حال الرفض، يمكنك رفع إثبات جديد</li>
                        </ul>
                    </div>
                </div>
            </div>

            <style>{`
                .payment-proof-page {
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

                .package-info,
                .bank-info,
                .upload-form,
                .important-notes {
                    background: white;
                    border-radius: 16px;
                    padding: 28px;
                    margin-bottom: 24px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }

                .package-info h3,
                .bank-info h3 {
                    font-size: 18px;
                    font-weight: 700;
                    color: #D60000;
                    margin: 0 0 16px;
                }

                .package-details,
                .bank-details {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .package-details span,
                .bank-item {
                    font-size: 15px;
                    color: #333;
                }

                .bank-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px;
                    background: #F9FAFB;
                    border-radius: 8px;
                }

                .bank-label {
                    font-weight: 600;
                    color: #666;
                }

                .bank-value {
                    font-weight: 700;
                    color: #000;
                }

                .copy-value {
                    font-family: 'Courier New', monospace;
                    background: #FEF3C7;
                    padding: 4px 8px;
                    border-radius: 4px;
                }

                .bank-note {
                    margin-top: 16px;
                    padding: 16px;
                    background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
                    border-radius: 12px;
                    font-size: 14px;
                    color: #92400E;
                    font-weight: 600;
                }

                .form-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #D60000;
                    margin: 0 0 24px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 20px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: 20px;
                }

                .form-group label {
                    font-weight: 700;
                    font-size: 14px;
                    color: #333;
                }

                .form-group label.required::after {
                    content: ' *';
                    color: #D60000;
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
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

                .input-with-unit {
                    position: relative;
                }

                .input-with-unit input {
                    padding-left: 60px;
                }

                .input-unit {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-weight: 700;
                    color: #666;
                }

                .file-upload-area {
                    margin-top: 8px;
                }

                .file-upload-label {
                    display: block;
                    padding: 32px;
                    border: 3px dashed #E0E0E0;
                    border-radius: 12px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .file-upload-label:hover {
                    border-color: #D60000;
                    background: #FEF2F2;
                }

                .file-placeholder {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }

                .upload-icon {
                    font-size: 48px;
                }

                .upload-text {
                    font-size: 16px;
                    font-weight: 700;
                    color: #333;
                }

                .upload-hint {
                    font-size: 13px;
                    color: #666;
                }

                .file-selected {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    color: #16A34A;
                }

                .file-icon {
                    font-size: 32px;
                }

                .file-name {
                    font-weight: 700;
                    font-size: 15px;
                }

                .file-size {
                    font-size: 13px;
                    color: #666;
                }

                .file-preview {
                    margin-top: 16px;
                    text-align: center;
                }

                .file-preview img {
                    max-width: 100%;
                    max-height: 300px;
                    border-radius: 12px;
                    border: 2px solid #E0E0E0;
                }

                .form-actions {
                    display: flex;
                    gap: 16px;
                    margin-top: 32px;
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

                .important-notes h4 {
                    font-size: 16px;
                    font-weight: 700;
                    color: #D60000;
                    margin: 0 0 16px;
                }

                .important-notes ul {
                    margin: 0;
                    padding: 0 0 0 24px;
                    list-style: disc;
                }

                .important-notes li {
                    font-size: 14px;
                    color: #666;
                    line-height: 1.8;
                    margin-bottom: 8px;
                }

                @media (max-width: 768px) {
                    .payment-proof-page {
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
