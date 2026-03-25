import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatArabicDate } from '../../utils/formatters';
import type { Activity, ApiResponse } from '../../types';
import toast from 'react-hot-toast';

type ActivityType = 'educational' | 'social' | 'sports' | 'cultural' | 'volunteer' | 'trip';
type ActivityStatus = 'published' | 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export function ActivityList() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [filter, setFilter] = useState<'all' | ActivityType>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | ActivityStatus>('all');

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['activities'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Activity[]>>('/activities');
            return response.data.data!;
        },
    });

    const activityTypes = [
        { value: 'all', label: 'الكل', icon: '📋', color: '#6B7280' },
        { value: 'educational', label: 'تعليمي', icon: '📚', color: '#3B82F6' },
        { value: 'social', label: 'اجتماعي', icon: '🤝', color: '#10B981' },
        { value: 'sports', label: 'رياضي', icon: '⚽', color: '#F59E0B' },
        { value: 'cultural', label: 'ثقافي', icon: '🎭', color: '#8B5CF6' },
        { value: 'volunteer', label: 'تطوعي', icon: '❤️', color: '#EF4444' },
        { value: 'trip', label: 'رحلة', icon: '🚌', color: '#06B6D4' },
    ];

    const statusFilters = [
        { value: 'all', label: 'الكل', icon: '📋' },
        { value: 'published', label: 'منشور', icon: '✅' },
        { value: 'draft', label: 'مسودة', icon: '📝' },
        { value: 'upcoming', label: 'قادم', icon: '📅' },
        { value: 'completed', label: 'مكتمل', icon: '🏆' },
    ];

    const getFilteredActivities = () => {
        if (!data) return [];

        let filtered = data;

        // Filter by type
        if (filter !== 'all') {
            filtered = filtered.filter(a => a.type === filter);
        }

        // Filter by status
        if (statusFilter !== 'all') {
            const now = new Date();
            filtered = filtered.filter(a => {
                if (statusFilter === 'published') return a.status === 'published';
                if (statusFilter === 'draft') return a.status === 'draft';
                if (statusFilter === 'upcoming') return new Date(a.activity_date) > now && a.status === 'published';
                if (statusFilter === 'completed') return new Date(a.activity_date) < now;
                return true;
            });
        }

        return filtered.sort((a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime());
    };

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('هل أنت متأكد من حذف هذا النشاط؟')) return;

        try {
            await api.delete(`/activities/${id}`);
            toast.success('تم حذف النشاط بنجاح');
            refetch();
        } catch (error) {
            toast.error('حدث خطأ في حذف النشاط');
        }
    };

    const getTypeInfo = (type: string) => {
        return activityTypes.find(t => t.value === type) || activityTypes[0];
    };

    const getCapacityPercentage = (registered: number, capacity: number) => {
        return capacity > 0 ? (registered / capacity) * 100 : 0;
    };

    const handleBack = () => {
        navigate('/');
    };

    const handleCreateNew = () => {
        navigate('/activities/create');
    };

    const filteredActivities = getFilteredActivities();

    return (
        <>
            <div className="admin-activities-page">
                {/* Page Header */}
                <div className="page-header">
                    <div className="header-content">
                        <div>
                            <h1 className="page-title">🎫 إدارة الأنشطة والفعاليات</h1>
                            <p className="page-subtitle">إدارة وتنظيم جميع أنشطة الاتحاد</p>
                        </div>
                        <div className="header-actions">
                            <button className="create-btn" onClick={handleCreateNew}>
                                + إنشاء نشاط جديد
                            </button>
                            <button className="refresh-btn" onClick={() => refetch()}>
                                🔄 تحديث
                            </button>
                            <button className="back-btn" onClick={handleBack}>
                                العودة
                            </button>
                        </div>
                    </div>
                </div>

                <div className="content-wrapper">
                    {/* Status Filter Tabs */}
                    <div className="status-tabs">
                        {statusFilters.map((s) => (
                            <button
                                key={s.value}
                                className={`status-tab ${statusFilter === s.value ? 'status-tab--active' : ''}`}
                                onClick={() => setStatusFilter(s.value as any)}
                            >
                                {s.icon} {s.label}
                            </button>
                        ))}
                    </div>

                    {/* Type Filters */}
                    <div className="type-filters">
                        {activityTypes.map((type) => (
                            <button
                                key={type.value}
                                className={`type-filter ${filter === type.value ? 'type-filter--active' : ''}`}
                                onClick={() => setFilter(type.value as any)}
                                style={{
                                    borderColor: filter === type.value ? type.color : '#E0E0E0',
                                    color: filter === type.value ? type.color : '#666',
                                }}
                            >
                                <span className="filter-icon">{type.icon}</span>
                                <span className="filter-label">{type.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Activities Grid */}
                    {isLoading ? (
                        <div className="loading-state">
                            <div className="loading-spinner">⏳</div>
                            <p>جاري تحميل الأنشطة...</p>
                        </div>
                    ) : filteredActivities.length > 0 ? (
                        <div className="activities-grid">
                            {filteredActivities.map((activity) => {
                                const typeInfo = getTypeInfo(activity.type || 'educational');
                                const capacityPercentage = getCapacityPercentage(
                                    activity.participant_count || 0,
                                    activity.max_participants || 0
                                );
                                const isPast = new Date(activity.activity_date) < new Date();
                                const isFull = (activity.participant_count || 0) >= (activity.max_participants || 0);

                                return (
                                    <div key={activity.id} className="activity-card">
                                        {/* Card Header */}
                                        <div className="activity-card__header">
                                            <div
                                                className="activity-type-badge"
                                                style={{ backgroundColor: typeInfo.color }}
                                            >
                                                {typeInfo.icon} {typeInfo.label}
                                            </div>
                                            <div className="status-badges">
                                                {activity.status === 'published' ? (
                                                    <div className="status-badge status-badge--published">
                                                        ✅ منشور
                                                    </div>
                                                ) : (
                                                    <div className="status-badge status-badge--draft">
                                                        📝 مسودة
                                                    </div>
                                                )}
                                                {isPast && (
                                                    <div className="status-badge status-badge--completed">
                                                        🏆 مكتمل
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="activity-card__body">
                                            <h3 className="activity-title">{activity.title_ar}</h3>
                                            <p className="activity-description">
                                                {activity.description_ar || 'لا يوجد وصف'}
                                            </p>

                                            <div className="activity-details">
                                                <div className="detail-item">
                                                    <span className="detail-icon">📅</span>
                                                    <span className="detail-text">
                                                        {formatArabicDate(activity.activity_date)}
                                                    </span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-icon">⏰</span>
                                                    <span className="detail-text">
                                                        {activity.activity_time || 'غير محدد'}
                                                    </span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-icon">📍</span>
                                                    <span className="detail-text">
                                                        {activity.location_ar || 'غير محدد'}
                                                    </span>
                                                </div>
                                                {activity.fee && activity.fee > 0 && (
                                                    <div className="detail-item">
                                                        <span className="detail-icon">💰</span>
                                                        <span className="detail-text">{activity.fee} TRY</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Capacity Bar */}
                                            {activity.max_participants && activity.max_participants > 0 && (
                                                <div className="capacity-section">
                                                    <div className="capacity-info">
                                                        <span>المسجلين: {activity.participant_count || 0}/{activity.max_participants}</span>
                                                        <span className={isFull ? 'capacity-full' : ''}>
                                                            {isFull ? 'مكتمل' : `${activity.max_participants - (activity.participant_count || 0)} مقعد متبقي`}
                                                        </span>
                                                    </div>
                                                    <div className="capacity-bar">
                                                        <div
                                                            className="capacity-fill"
                                                            style={{
                                                                width: `${capacityPercentage}%`,
                                                                backgroundColor: capacityPercentage >= 90 ? '#EF4444' : capacityPercentage >= 70 ? '#F59E0B' : '#10B981',
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Footer - Admin Actions */}
                                        <div className="activity-card__footer">
                                            <button
                                                className="action-btn action-btn--view"
                                                onClick={() => navigate(`/activities/${activity.id}`)}
                                            >
                                                👁️ عرض
                                            </button>
                                            <button
                                                className="action-btn action-btn--edit"
                                                onClick={() => navigate(`/activities/${activity.id}/edit`)}
                                            >
                                                ✏️ تعديل
                                            </button>
                                            <button
                                                className="action-btn action-btn--delete"
                                                onClick={(e) => handleDelete(activity.id, e)}
                                            >
                                                🗑️ حذف
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">📭</div>
                            <h3>لا توجد أنشطة</h3>
                            <p>لم يتم إنشاء أي أنشطة بعد</p>
                            <button className="empty-action-btn" onClick={handleCreateNew}>
                                + إنشاء نشاط جديد
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .admin-activities-page {
                    min-height: 100vh;
                    padding: 24px;
                    background: linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%);
                }

                .page-header {
                    max-width: 1400px;
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

                .header-actions {
                    display: flex;
                    gap: 12px;
                }

                .create-btn {
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #D60000 0%, #8A0000 100%);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(214, 0, 0, 0.3);
                }

                .create-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(214, 0, 0, 0.4);
                }

                .refresh-btn {
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

                .refresh-btn:hover {
                    border-color: #10B981;
                    color: #10B981;
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
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .status-tabs {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                }

                .status-tab {
                    flex: 1;
                    min-width: 150px;
                    padding: 14px;
                    background: white;
                    border: 2px solid #E0E0E0;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 14px;
                    color: #666;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .status-tab:hover {
                    border-color: #D60000;
                    color: #D60000;
                }

                .status-tab--active {
                    background: linear-gradient(135deg, #D60000 0%, #8A0000 100%);
                    color: white;
                    border-color: #D60000;
                }

                .type-filters {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 32px;
                    flex-wrap: wrap;
                }

                .type-filter {
                    padding: 12px 20px;
                    background: white;
                    border: 2px solid #E0E0E0;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-weight: 600;
                    font-size: 14px;
                }

                .type-filter:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .type-filter--active {
                    border-width: 2px;
                    font-weight: 700;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .filter-icon {
                    font-size: 18px;
                }

                .activities-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 24px;
                }

                .activity-card {
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                }

                .activity-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
                }

                .activity-card__header {
                    padding: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 2px solid #F5F5F5;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .activity-type-badge {
                    padding: 6px 16px;
                    border-radius: 20px;
                    color: white;
                    font-size: 13px;
                    font-weight: 700;
                }

                .status-badges {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .status-badge {
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                }

                .status-badge--published {
                    background: #DCFCE7;
                    color: #16A34A;
                }

                .status-badge--draft {
                    background: #FEF3C7;
                    color: #D97706;
                }

                .status-badge--completed {
                    background: #F3F4F6;
                    color: #6B7280;
                }

                .activity-card__body {
                    padding: 20px;
                    flex: 1;
                }

                .activity-title {
                    font-size: 18px;
                    font-weight: 800;
                    color: #000;
                    margin: 0 0 12px;
                }

                .activity-description {
                    font-size: 14px;
                    color: #666;
                    line-height: 1.6;
                    margin: 0 0 20px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .activity-details {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .detail-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 14px;
                    color: #333;
                }

                .detail-icon {
                    font-size: 18px;
                    flex-shrink: 0;
                }

                .detail-text {
                    flex: 1;
                }

                .capacity-section {
                    margin-bottom: 16px;
                }

                .capacity-info {
                    display: flex;
                    justify-content: space-between;
                    font-size: 13px;
                    color: #666;
                    margin-bottom: 8px;
                    font-weight: 600;
                }

                .capacity-full {
                    color: #EF4444;
                    font-weight: 700;
                }

                .capacity-bar {
                    height: 8px;
                    background: #E0E0E0;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .capacity-fill {
                    height: 100%;
                    transition: width 0.3s ease;
                    border-radius: 4px;
                }

                .activity-card__footer {
                    padding: 16px;
                    border-top: 2px solid #F5F5F5;
                    display: flex;
                    gap: 8px;
                }

                .action-btn {
                    flex: 1;
                    padding: 10px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: none;
                }

                .action-btn--view {
                    background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
                    color: white;
                }

                .action-btn--view:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }

                .action-btn--edit {
                    background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
                    color: white;
                }

                .action-btn--edit:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
                }

                .action-btn--delete {
                    background: white;
                    color: #EF4444;
                    border: 2px solid #EF4444;
                }

                .action-btn--delete:hover {
                    background: #EF4444;
                    color: white;
                }

                .loading-state,
                .empty-state {
                    text-align: center;
                    padding: 80px 20px;
                    background: white;
                    border-radius: 16px;
                }

                .loading-spinner {
                    font-size: 60px;
                    margin-bottom: 20px;
                    animation: spin 2s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .empty-icon {
                    font-size: 80px;
                    margin-bottom: 20px;
                }

                .empty-state h3 {
                    font-size: 24px;
                    font-weight: 800;
                    color: #000;
                    margin: 0 0 12px;
                }

                .empty-state p {
                    font-size: 16px;
                    color: #666;
                    margin: 0 0 24px;
                }

                .empty-action-btn {
                    padding: 14px 32px;
                    background: linear-gradient(135deg, #D60000 0%, #8A0000 100%);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 15px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(214, 0, 0, 0.3);
                }

                .empty-action-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(214, 0, 0, 0.4);
                }

                @media (max-width: 768px) {
                    .admin-activities-page {
                        padding: 16px;
                    }

                    .header-content {
                        flex-direction: column;
                        gap: 16px;
                        padding: 20px;
                    }

                    .header-actions {
                        width: 100%;
                        flex-direction: column;
                    }

                    .create-btn,
                    .refresh-btn,
                    .back-btn {
                        width: 100%;
                    }

                    .status-tabs {
                        flex-direction: column;
                    }

                    .status-tab {
                        width: 100%;
                    }

                    .type-filters {
                        justify-content: center;
                    }

                    .activities-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </>
    );
}
