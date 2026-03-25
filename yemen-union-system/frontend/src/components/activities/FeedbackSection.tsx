import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Button } from '../common';
import { formatArabicDate } from '../../utils/formatters';
import type { ActivityFeedback } from '../../types';

interface FeedbackSectionProps {
    activityId: number;
    feedbacks: ActivityFeedback[];
    averageRating: number;
    totalRatings: number;
    canAddFeedback: boolean;
    hasUserFeedback?: boolean;
}

export function FeedbackSection({
    activityId,
    feedbacks,
    averageRating,
    totalRatings,
    canAddFeedback,
    hasUserFeedback
}: FeedbackSectionProps) {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);

    const submitMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post(`/activities/${activityId}/feedback`, {
                rating,
                comment,
                is_anonymous: isAnonymous
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activity', activityId] });
            toast.success('تم إرسال تقييمك بنجاح! 🌟');
            setShowForm(false);
            setComment('');
            setRating(5);
        },
        onError: () => {
            toast.error('حدث خطأ في إرسال التقييم');
        }
    });

    const renderStars = (value: number, interactive = false, onSelect?: (n: number) => void) => {
        return (
            <div className="feedback-rating">
                {[1, 2, 3, 4, 5].map(n => (
                    <span
                        key={n}
                        className={`star ${n <= value ? 'star-filled' : 'star-empty'} ${interactive ? 'cursor-pointer' : ''}`}
                        onClick={() => interactive && onSelect?.(n)}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="feedback-section">
            <div className="feedback-header">
                <h3 className="feedback-title">
                    <span>⭐</span> التقييمات والآراء
                </h3>
                <div className="feedback-summary">
                    {renderStars(Math.round(averageRating))}
                    <span className="feedback-average">{averageRating.toFixed(1)}</span>
                    <span className="feedback-count">({totalRatings} تقييم)</span>
                </div>
            </div>

            {/* Add Feedback Button */}
            {canAddFeedback && !hasUserFeedback && !showForm && (
                <Button
                    variant="secondary"
                    onClick={() => setShowForm(true)}
                    style={{ marginBottom: '1rem' }}
                >
                    <span>✍️</span> أضف تقييمك
                </Button>
            )}

            {/* Feedback Form */}
            {showForm && (
                <div className="feedback-form animate-fadeIn">
                    <div className="feedback-form-rating">
                        <label>تقييمك:</label>
                        {renderStars(rating, true, setRating)}
                    </div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="شاركنا رأيك عن هذا النشاط... (اختياري)"
                        rows={3}
                        className="feedback-textarea"
                    />
                    <label className="feedback-anonymous">
                        <input
                            type="checkbox"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                        />
                        <span>تقييم مجهول</span>
                    </label>
                    <div className="feedback-form-actions">
                        <Button
                            variant="secondary"
                            onClick={() => setShowForm(false)}
                        >
                            إلغاء
                        </Button>
                        <Button
                            onClick={() => submitMutation.mutate()}
                            loading={submitMutation.isPending}
                        >
                            إرسال التقييم
                        </Button>
                    </div>
                </div>
            )}

            {/* Feedback List */}
            <div className="feedback-list">
                {feedbacks.length === 0 ? (
                    <div className="empty-feedback">
                        <span>💬</span>
                        <p>لا توجد تقييمات بعد. كن أول من يضيف تقييمه!</p>
                    </div>
                ) : (
                    feedbacks.map(feedback => (
                        <div key={feedback.id} className="feedback-item">
                            <div className="feedback-item-header">
                                <div className="feedback-author">
                                    <div className="feedback-author-avatar">
                                        {feedback.is_anonymous ? '👤' : (
                                            feedback.user_photo ? (
                                                <img src={feedback.user_photo} alt="" />
                                            ) : feedback.user_name[0]
                                        )}
                                    </div>
                                    <div>
                                        <span className="feedback-author-name">
                                            {feedback.is_anonymous ? 'مجهول' : feedback.user_name}
                                        </span>
                                        <span className="feedback-date">
                                            {formatArabicDate(feedback.created_at)}
                                        </span>
                                    </div>
                                </div>
                                {renderStars(feedback.rating)}
                            </div>
                            {feedback.comment && (
                                <p className="feedback-comment">{feedback.comment}</p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
