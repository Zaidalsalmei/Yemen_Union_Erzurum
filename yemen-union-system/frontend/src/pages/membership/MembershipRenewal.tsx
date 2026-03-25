import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface SubscriptionPackage {
    id: string;
    name: string;
    nameEn: string;
    duration: number; // in months
    price: number;
    currency: string;
    features: string[];
    popular?: boolean;
}

export function MembershipRenewal() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Mock packages - replace with API call
    const packages: SubscriptionPackage[] = [
        {
            id: 'monthly',
            name: 'اشتراك شهري',
            nameEn: 'Monthly',
            duration: 1,
            price: 99,
            currency: 'TRY',
            features: [
                'الوصول لجميع الأنشطة',
                'خصومات على الفعاليات',
                'دعم فني',
            ],
        },
        {
            id: 'quarterly',
            name: 'اشتراك ربع سنوي',
            nameEn: 'Quarterly',
            duration: 3,
            price: 244,
            currency: 'TRY',
            features: [
                'الوصول لجميع الأنشطة',
                'خصومات على الفعاليات',
                'دعم فني',
                'خصم 13% على السعر الشهري',
            ],
        },
        {
            id: 'semi-annual',
            name: 'اشتراك نصف سنوي',
            nameEn: 'Semi-Annual',
            duration: 6,
            price: 454,
            currency: 'TRY',
            features: [
                'الوصول لجميع الأنشطة',
                'خصومات على الفعاليات',
                'دعم فني ذو أولوية',
                'خصم 20% على السعر الشهري',
                'بطاقة عضوية مميزة',
            ],
            popular: true,
        },
        {
            id: 'annual',
            name: 'اشتراك سنوي',
            nameEn: 'Annual',
            duration: 12,
            price: 799,
            currency: 'TRY',
            features: [
                'الوصول لجميع الأنشطة',
                'خصومات على الفعاليات',
                'دعم فني VIP',
                'خصم 33% على السعر الشهري',
                'بطاقة عضوية ذهبية',
                'هدايا حصرية',
            ],
        },
    ];

    const handleSelectPackage = (packageId: string) => {
        setSelectedPackage(packageId);
    };

    const handleProceedToPayment = () => {
        if (!selectedPackage) {
            toast.error('يرجى اختيار باقة الاشتراك أولاً');
            return;
        }

        const pkg = packages.find(p => p.id === selectedPackage);
        if (!pkg) return;

        // In real app, this would create a payment order and redirect
        toast.success(`تم اختيار ${pkg.name}. سيتم توجيهك لصفحة الدفع...`);

        // Simulate navigation to payment instructions
        setTimeout(() => {
            navigate('/memberships/payment-proof', {
                state: {
                    package: pkg,
                    renewalRequest: true
                }
            });
        }, 1500);
    };

    const handleBack = () => {
        navigate('/');
    };

    return (
        <>
            <div className="renewal-page">
                {/* Page Header */}
                <div className="page-header no-print">
                    <div className="header-content">
                        <div>
                            <h1 className="page-title">💳 تجديد الاشتراك</h1>
                            <p className="page-subtitle">اختر الباقة المناسبة لك وجدد عضويتك</p>
                        </div>
                        <button className="back-btn" onClick={handleBack}>
                            العودة للوحة التحكم
                        </button>
                    </div>
                </div>

                {/* Current Membership Info */}
                <div className="current-membership">
                    <div className="current-membership__icon">ℹ️</div>
                    <div className="current-membership__content">
                        <h3>معلومات العضوية الحالية</h3>
                        <div className="membership-details">
                            <span><strong>الاسم:</strong> {user?.full_name}</span>
                            <span><strong>رقم العضوية:</strong> MEM-2025-001</span>
                            <span><strong>تاريخ الانتهاء:</strong> 31/12/2025</span>
                        </div>
                    </div>
                </div>

                {/* Packages Grid */}
                <div className="packages-section">
                    <h2 className="section-title">اختر باقة الاشتراك</h2>

                    <div className="packages-grid">
                        {packages.map((pkg) => (
                            <div
                                key={pkg.id}
                                className={`package-card ${selectedPackage === pkg.id ? 'package-card--selected' : ''} ${pkg.popular ? 'package-card--popular' : ''}`}
                                onClick={() => handleSelectPackage(pkg.id)}
                            >
                                {pkg.popular && (
                                    <div className="package-card__badge">الأكثر شيوعاً</div>
                                )}

                                <div className="package-card__header">
                                    <h3 className="package-card__name">{pkg.name}</h3>
                                    <div className="package-card__duration">{pkg.duration} شهر</div>
                                </div>

                                <div className="package-card__price">
                                    <span className="price-amount">{pkg.price}</span>
                                    <span className="price-currency">{pkg.currency}</span>
                                </div>

                                <div className="package-card__features">
                                    {pkg.features.map((feature, index) => (
                                        <div key={index} className="feature-item">
                                            <span className="feature-icon">✓</span>
                                            <span className="feature-text">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="package-card__select">
                                    {selectedPackage === pkg.id ? (
                                        <div className="selected-indicator">✓ تم الاختيار</div>
                                    ) : (
                                        <div className="select-text">انقر للاختيار</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Instructions */}
                <div className="payment-instructions">
                    <h3 className="instructions-title">📋 تعليمات الدفع</h3>
                    <div className="instructions-content">
                        <div className="instruction-step">
                            <div className="step-number">1</div>
                            <div className="step-text">اختر الباقة المناسبة من الأعلى</div>
                        </div>
                        <div className="instruction-step">
                            <div className="step-number">2</div>
                            <div className="step-text">انقر على "متابعة للدفع"</div>
                        </div>
                        <div className="instruction-step">
                            <div className="step-number">3</div>
                            <div className="step-text">قم بتحويل المبلغ إلى الحساب البنكي المحدد</div>
                        </div>
                        <div className="instruction-step">
                            <div className="step-number">4</div>
                            <div className="step-text">ارفع إثبات الدفع في الصفحة التالية</div>
                        </div>
                        <div className="instruction-step">
                            <div className="step-number">5</div>
                            <div className="step-text">انتظر موافقة الإدارة (عادة خلال 24 ساعة)</div>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="action-section">
                    <button
                        className="proceed-btn"
                        onClick={handleProceedToPayment}
                        disabled={!selectedPackage || loading}
                    >
                        {loading ? 'جاري المعالجة...' : 'متابعة للدفع →'}
                    </button>
                </div>

                {/* Contact Support */}
                <div className="support-section">
                    <p>هل تحتاج مساعدة؟ <a href="/support/new">تواصل مع الدعم</a></p>
                </div>
            </div>

            <style>{`
                .renewal-page {
                    min-height: 100vh;
                    padding: 24px;
                    background: linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%);
                }

                .page-header {
                    max-width: 1200px;
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

                .current-membership {
                    max-width: 1200px;
                    margin: 0 auto 32px;
                    background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
                    border: 2px solid #3B82F6;
                    border-radius: 16px;
                    padding: 24px;
                    display: flex;
                    gap: 20px;
                    align-items: center;
                }

                .current-membership__icon {
                    font-size: 48px;
                    flex-shrink: 0;
                }

                .current-membership__content h3 {
                    font-size: 18px;
                    font-weight: 700;
                    color: #1E40AF;
                    margin: 0 0 12px;
                }

                .membership-details {
                    display: flex;
                    gap: 24px;
                    flex-wrap: wrap;
                    font-size: 14px;
                    color: #1E3A8A;
                }

                .packages-section {
                    max-width: 1200px;
                    margin: 0 auto 32px;
                }

                .section-title {
                    font-size: 24px;
                    font-weight: 800;
                    color: #D60000;
                    text-align: center;
                    margin: 0 0 32px;
                }

                .packages-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 24px;
                }

                .package-card {
                    background: white;
                    border: 3px solid #E0E0E0;
                    border-radius: 20px;
                    padding: 28px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .package-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
                    border-color: #D60000;
                }

                .package-card--selected {
                    border-color: #D60000;
                    border-width: 3px;
                    background: linear-gradient(135deg, #FEF2F2 0%, #FFFFFF 100%);
                    box-shadow: 0 8px 24px rgba(214, 0, 0, 0.2);
                }

                .package-card--popular {
                    border-color: #F59E0B;
                }

                .package-card__badge {
                    position: absolute;
                    top: 16px;
                    left: 16px;
                    background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
                    color: white;
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                }

                .package-card__header {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .package-card__name {
                    font-size: 22px;
                    font-weight: 800;
                    color: #000;
                    margin: 0 0 8px;
                }

                .package-card__duration {
                    font-size: 14px;
                    color: #666;
                    font-weight: 600;
                }

                .package-card__price {
                    text-align: center;
                    margin-bottom: 24px;
                    padding: 20px;
                    background: linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%);
                    border-radius: 12px;
                }

                .price-amount {
                    font-size: 48px;
                    font-weight: 900;
                    color: #D60000;
                    display: block;
                    line-height: 1;
                }

                .price-currency {
                    font-size: 18px;
                    color: #666;
                    font-weight: 600;
                }

                .package-card__features {
                    margin-bottom: 24px;
                }

                .feature-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 12px;
                    font-size: 14px;
                    color: #333;
                }

                .feature-icon {
                    width: 24px;
                    height: 24px;
                    background: #DCFCE7;
                    color: #16A34A;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 900;
                    flex-shrink: 0;
                }

                .feature-text {
                    flex: 1;
                }

                .package-card__select {
                    text-align: center;
                    padding-top: 20px;
                    border-top: 2px solid #E0E0E0;
                }

                .selected-indicator {
                    color: #16A34A;
                    font-weight: 800;
                    font-size: 16px;
                }

                .select-text {
                    color: #666;
                    font-size: 14px;
                }

                .payment-instructions {
                    max-width: 800px;
                    margin: 0 auto 32px;
                    background: white;
                    border-radius: 16px;
                    padding: 28px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }

                .instructions-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #D60000;
                    margin: 0 0 24px;
                }

                .instructions-content {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .instruction-step {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .step-number {
                    width: 36px;
                    height: 36px;
                    background: linear-gradient(135deg, #D60000 0%, #8A0000 100%);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    flex-shrink: 0;
                }

                .step-text {
                    font-size: 15px;
                    color: #333;
                    line-height: 1.5;
                }

                .action-section {
                    max-width: 600px;
                    margin: 0 auto 24px;
                }

                .proceed-btn {
                    width: 100%;
                    padding: 18px;
                    background: linear-gradient(135deg, #D60000 0%, #8A0000 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 800;
                    font-size: 18px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 6px 20px rgba(214, 0, 0, 0.3);
                }

                .proceed-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(214, 0, 0, 0.4);
                }

                .proceed-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .support-section {
                    text-align: center;
                    font-size: 14px;
                    color: #666;
                }

                .support-section a {
                    color: #D60000;
                    font-weight: 700;
                    text-decoration: none;
                }

                .support-section a:hover {
                    text-decoration: underline;
                }

                @media (max-width: 768px) {
                    .renewal-page {
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

                    .current-membership {
                        flex-direction: column;
                        text-align: center;
                    }

                    .membership-details {
                        flex-direction: column;
                        gap: 8px;
                    }

                    .packages-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </>
    );
}
