import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { ApiResponse } from '../../types';

type ActivityType = 'educational' | 'social' | 'sports' | 'cultural' | 'volunteer' | 'trip';

interface ActivityFormData {
    title_ar: string;
    description_ar?: string;
    type: ActivityType;
    activity_date: string;
    activity_time?: string;
    end_date?: string;
    location_ar?: string;
    max_participants?: number;
    registration_required: boolean;
    visibility: 'public' | 'members_only' | 'invited_only';
    has_fee: boolean;
    fee_amount?: number;
    status: 'published' | 'draft';
}

export function ActivityCreate() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<ActivityFormData>({
        defaultValues: {
            registration_required: true,
            visibility: 'public',
            has_fee: false,
            status: 'draft',
            type: 'educational',
        },
    });

    const hasFee = watch('has_fee');
    const selectedType = watch('type');

    const activityTypes = [
        { value: 'educational', label: 'تعليمي', icon: '📚', color: '#3B82F6', description: 'ورش عمل ودورات تدريبية' },
        { value: 'social', label: 'اجتماعي', icon: '🤝', color: '#10B981', description: 'لقاءات وتعارف' },
        { value: 'sports', label: 'رياضي', icon: '⚽', color: '#F59E0B', description: 'بطولات ومباريات' },
        { value: 'cultural', label: 'ثقافي', icon: '🎭', color: '#8B5CF6', description: 'أمسيات وفعاليات ثقافية' },
        { value: 'volunteer', label: 'تطوعي', icon: '❤️', color: '#EF4444', description: 'حملات خيرية' },
        { value: 'trip', label: 'رحلة', icon: '🚌', color: '#06B6D4', description: 'رحلات ترفيهية' },
    ];

    const createActivityMutation = useMutation({
        mutationFn: async (data: ActivityFormData) => {
            const response = await api.post<ApiResponse<any>>('/activities', data);
            return response.data;
        },
        onSuccess: () => {
            toast.success('تم إنشاء النشاط بنجاح');
            queryClient.invalidateQueries({ queryKey: ['activities'] });
            navigate('/activities');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'حدث خطأ في إنشاء النشاط';
            toast.error(message);
        },
    });

    const onSubmit = (data: ActivityFormData) => {
        createActivityMutation.mutate(data);
    };

    const handleSaveAsDraft = () => {
        setValue('status', 'draft');
        handleSubmit(onSubmit)();
    };

    const handlePublish = () => {
        setValue('status', 'published');
        handleSubmit(onSubmit)();
    };

    const handleBack = () => {
        navigate('/activities');
    };

    return (
        <>
            <div className="activity-create-page">
                {/* Page Header */}
                <div className="page-header">
                    <div className="header-content">
                        <div>
                            <h1 className="page-title">🎫 إنشاء نشاط جديد</h1>
                            <p className="page-subtitle">أضف فعالية أو نشاط جديد للاتحاد</p>
                        </div>
                        <button className="back-btn" onClick={handleBack}>
                            ✕ إلغاء
                        </button>
                    </div>
                </div>

                <div className="content-wrapper">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Activity Type Selection */}
                        <div className="form-section">
                            <h2 className="section-title">نوع النشاط</h2>
                            <p className="section-subtitle">اختر نوع النشاط المناسب</p>

                            <div className="type-grid">
                                {activityTypes.map((type) => (
                                    <label
                                        key={type.value}
                                        className={`type-card ${selectedType === type.value ? 'type-card--selected' : ''}`}
                                        style={{
                                            borderColor: selectedType === type.value ? type.color : '#E0E0E0',
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            value={type.value}
                                            {...register('type', { required: 'نوع النشاط مطلوب' })}
                                            hidden
                                        />
                                        <div
                                            className="type-icon"
                                            style={{
                                                backgroundColor: selectedType === type.value ? type.color : '#F5F5F5',
                                                color: selectedType === type.value ? 'white' : '#666',
                                            }}
                                        >
                                            {type.icon}
                                        </div>
                                        <div className="type-info">
                                            <h3 className="type-label">{type.label}</h3>
                                            <p className="type-description">{type.description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {errors.type && <p className="error-message">{errors.type.message}</p>}
                        </div>

                        {/* Basic Information */}
                        <div className="form-section">
                            <h2 className="section-title">المعلومات الأساسية</h2>
                            <p className="section-subtitle">أدخل عنوان ووصف النشاط</p>

                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label className="required">عنوان النشاط</label>
                                    <input
                                        type="text"
                                        placeholder="مثال: ورشة عمل البرمجة بلغة Python"
                                        {...register('title_ar', {
                                            required: 'عنوان النشاط مطلوب',
                                            minLength: { value: 5, message: 'العنوان يجب أن يكون 5 أحرف على الأقل' },
                                        })}
                                    />
                                    {errors.title_ar && <p className="error-message">{errors.title_ar.message}</p>}
                                </div>

                                <div className="form-group full-width">
                                    <label>وصف النشاط</label>
                                    <textarea
                                        rows={4}
                                        placeholder="اكتب وصفاً تفصيلياً للنشاط..."
                                        {...register('description_ar')}
                                    />
                                    {errors.description_ar && <p className="error-message">{errors.description_ar.message}</p>}
                                </div>

                                <div className="form-group">
                                    <label className="required">تاريخ النشاط</label>
                                    <input
                                        type="date"
                                        {...register('activity_date', { required: 'تاريخ النشاط مطلوب' })}
                                    />
                                    {errors.activity_date && <p className="error-message">{errors.activity_date.message}</p>}
                                </div>

                                <div className="form-group">
                                    <label>وقت النشاط</label>
                                    <input
                                        type="time"
                                        {...register('activity_time')}
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>موقع النشاط</label>
                                    <input
                                        type="text"
                                        placeholder="مثال: قاعة المؤتمرات - الطابق الثاني"
                                        {...register('location_ar')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="form-section">
                            <h2 className="section-title">إعدادات النشاط</h2>
                            <p className="section-subtitle">حدد خيارات التسجيل والرؤية</p>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="required">مستوى الرؤية</label>
                                    <select {...register('visibility', { required: 'مستوى الرؤية مطلوب' })}>
                                        <option value="public">🌍 عام للجميع</option>
                                        <option value="members_only">👥 للأعضاء فقط</option>
                                        <option value="invited_only">✉️ بدعوة فقط</option>
                                    </select>
                                    {errors.visibility && <p className="error-message">{errors.visibility.message}</p>}
                                </div>

                                <div className="form-group">
                                    <label>الحد الأقصى للمشاركين</label>
                                    <input
                                        type="number"
                                        placeholder="اتركه فارغاً لعدم وجود حد"
                                        {...register('max_participants', {
                                            min: { value: 1, message: 'يجب أن يكون 1 على الأقل' },
                                        })}
                                    />
                                    {errors.max_participants && <p className="error-message">{errors.max_participants.message}</p>}
                                </div>

                                <div className="form-group full-width">
                                    <div className="checkbox-group">
                                        <input
                                            type="checkbox"
                                            id="registration_required"
                                            {...register('registration_required')}
                                        />
                                        <label htmlFor="registration_required">
                                            <strong>يتطلب تسجيل مسبق</strong>
                                            <span>يجب على المشاركين التسجيل قبل الحضور</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="form-group full-width">
                                    <div className="checkbox-group">
                                        <input
                                            type="checkbox"
                                            id="has_fee"
                                            {...register('has_fee')}
                                        />
                                        <label htmlFor="has_fee">
                                            <strong>يتطلب رسوم مشاركة</strong>
                                            <span>هل هناك رسوم للمشاركة في النشاط؟</span>
                                        </label>
                                    </div>
                                </div>

                                {hasFee && (
                                    <div className="form-group">
                                        <label className="required">مبلغ الرسوم (TRY)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="أدخل المبلغ"
                                            {...register('fee_amount', {
                                                required: hasFee ? 'مبلغ الرسوم مطلوب' : false,
                                                min: { value: 0, message: 'المبلغ يجب أن يكون موجباً' },
                                            })}
                                        />
                                        {errors.fee_amount && <p className="error-message">{errors.fee_amount.message}</p>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="action-btn action-btn--cancel"
                                onClick={handleBack}
                            >
                                إلغاء
                            </button>
                            <button
                                type="button"
                                className="action-btn action-btn--draft"
                                onClick={handleSaveAsDraft}
                                disabled={createActivityMutation.isPending}
                            >
                                {createActivityMutation.isPending && watch('status') === 'draft' ? '⏳ جاري الحفظ...' : '📝 حفظ كمسودة'}
                            </button>
                            <button
                                type="button"
                                className="action-btn action-btn--publish"
                                onClick={handlePublish}
                                disabled={createActivityMutation.isPending}
                            >
                                {createActivityMutation.isPending && watch('status') === 'published' ? '⏳ جاري النشر...' : '✓ نشر النشاط'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                .activity-create-page {
                    min-height: 100vh;
                    padding: 24px;
                    background: linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%);
                }

                .page-header {
                    max-width: 1000px;
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
                    border-color: #EF4444;
                    color: #EF4444;
                }

                .content-wrapper {
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .form-section {
                    background: white;
                    border-radius: 16px;
                    padding: 32px;
                    margin-bottom: 24px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }

                .section-title {
                    font-size: 20px;
                    font-weight: 800;
                    color: #D60000;
                    margin: 0 0 8px;
                }

                .section-subtitle {
                    font-size: 14px;
                    color: #666;
                    margin: 0 0 24px;
                }

                .type-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 16px;
                    margin-bottom: 8px;
                }

                .type-card {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 20px;
                    border: 3px solid #E0E0E0;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: white;
                }

                .type-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .type-card--selected {
                    border-width: 3px;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
                }

                .type-icon {
                    width: 60px;
                    height: 60px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    flex-shrink: 0;
                    transition: all 0.3s ease;
                }

                .type-info {
                    flex: 1;
                }

                .type-label {
                    font-size: 16px;
                    font-weight: 800;
                    color: #000;
                    margin: 0 0 4px;
                }

                .type-description {
                    font-size: 13px;
                    color: #666;
                    margin: 0;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-group.full-width {
                    grid-column: 1 / -1;
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

                .checkbox-group {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 16px;
                    background: #F9FAFB;
                    border-radius: 10px;
                }

                .checkbox-group input[type="checkbox"] {
                    width: 20px;
                    height: 20px;
                    margin-top: 2px;
                    cursor: pointer;
                    flex-shrink: 0;
                }

                .checkbox-group label {
                    flex: 1;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .checkbox-group label strong {
                    font-size: 15px;
                    color: #000;
                }

                .checkbox-group label span {
                    font-size: 13px;
                    color: #666;
                    font-weight: 400;
                }

                .error-message {
                    color: #EF4444;
                    font-size: 13px;
                    font-weight: 600;
                    margin: 0;
                }

                .form-actions {
                    display: flex;
                    gap: 16px;
                    justify-content: flex-end;
                    padding: 24px 32px;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }

                .action-btn {
                    padding: 14px 32px;
                    border-radius: 10px;
                    font-weight: 800;
                    font-size: 15px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: none;
                }

                .action-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .action-btn--cancel {
                    background: white;
                    color: #666;
                    border: 2px solid #E0E0E0;
                }

                .action-btn--cancel:hover:not(:disabled) {
                    background: #F9FAFB;
                    border-color: #999;
                }

                .action-btn--draft {
                    background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
                    color: white;
                    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
                }

                .action-btn--draft:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
                }

                .action-btn--publish {
                    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                    color: white;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                }

                .action-btn--publish:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
                }

                @media (max-width: 768px) {
                    .activity-create-page {
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

                    .form-section {
                        padding: 24px 20px;
                    }

                    .type-grid {
                        grid-template-columns: 1fr;
                    }

                    .form-grid {
                        grid-template-columns: 1fr;
                    }

                    .form-actions {
                        flex-direction: column;
                        padding: 20px;
                    }

                    .action-btn {
                        width: 100%;
                    }
                }
            `}</style>
        </>
    );
}
