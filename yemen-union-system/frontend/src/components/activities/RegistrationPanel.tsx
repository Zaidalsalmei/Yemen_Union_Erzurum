import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Button } from '../common';
import { formatArabicNumber, formatArabicDate } from '../../utils/formatters';
import type { Activity, ActivityRegistration } from '../../types';

interface RegistrationPanelProps {
    activity: Activity;
    isUserMember: boolean;
    currentUserId?: number;
    registrations?: ActivityRegistration[];
}

export function RegistrationPanel({
    activity,
    isUserMember,
    currentUserId,
    registrations = []
}: RegistrationPanelProps) {
    const queryClient = useQueryClient();
    const [showWaitingList, setShowWaitingList] = useState(false);

    // Calculate registration stats
    const confirmedCount = activity.participant_count || 0;
    const maxParticipants = activity.max_participants || 0;
    const waitingCount = activity.waiting_list_count || 0;
    const availableSeats = maxParticipants > 0 ? maxParticipants - confirmedCount : Infinity;
    const isFull = maxParticipants > 0 && confirmedCount >= maxParticipants;
    const isRegistered = activity.is_registered;
    const registrationStatus = activity.registration_status;

    // Check if registration is allowed
    const now = new Date();
    const activityDate = new Date(activity.activity_date);
    const registrationDeadline = activity.registration_deadline
        ? new Date(activity.registration_deadline)
        : activityDate;
    const isRegistrationOpen = activity.status === 'registration_open' || activity.status === 'published';
    const isPastDeadline = now > registrationDeadline;
    const canRegister = isUserMember && isRegistrationOpen && !isPastDeadline && !isRegistered;

    // Register mutation
    const registerMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post(`/activities/${activity.id}/register`);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['activity', activity.id] });
            queryClient.invalidateQueries({ queryKey: ['activities'] });
            if (data.data?.status === 'waiting') {
                toast.success('تم إضافتك لقائمة الانتظار');
            } else {
                toast.success('تم تسجيلك بنجاح! 🎉');
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'حدث خطأ في التسجيل';
            toast.error(message);
        },
    });

    // Cancel registration mutation
    const cancelMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/activities/${activity.id}/register`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activity', activity.id] });
            queryClient.invalidateQueries({ queryKey: ['activities'] });
            toast.success('تم إلغاء تسجيلك');
        },
        onError: () => {
            toast.error('حدث خطأ في إلغاء التسجيل');
        },
    });

    const getProgressPercentage = () => {
        if (!maxParticipants) return 0;
        return Math.min((confirmedCount / maxParticipants) * 100, 100);
    };

    const getProgressColor = () => {
        const percentage = getProgressPercentage();
        if (percentage >= 100) return 'full';
        if (percentage >= 80) return 'warning';
        if (percentage >= 50) return 'success';
        return 'default';
    };

    return (
        <div className="registration-panel">
            {/* Header */}
            <div className="registration-panel-header">
                <h3>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    التسجيل في النشاط
                </h3>
            </div>

            {/* Registration Stats */}
            {maxParticipants > 0 && (
                <div className="registration-stats">
                    {/* Donut Chart */}
                    <div className="registration-donut">
                        <svg viewBox="0 0 100 100">
                            <circle
                                className="donut-bg"
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                strokeWidth="12"
                            />
                            <circle
                                className={`donut-progress ${getProgressColor()}`}
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                strokeWidth="12"
                                strokeDasharray={`${getProgressPercentage() * 2.51} 251`}
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <div className="donut-center">
                            <span className="donut-value">{formatArabicNumber(confirmedCount)}</span>
                            <span className="donut-label">مسجل</span>
                        </div>
                    </div>

                    {/* Stats Details */}
                    <div className="registration-stats-details">
                        <div className="stat-row">
                            <span className="stat-label">المقاعد الكلية</span>
                            <span className="stat-value">{formatArabicNumber(maxParticipants)}</span>
                        </div>
                        <div className="stat-row">
                            <span className="stat-label">المسجلون</span>
                            <span className="stat-value confirmed">{formatArabicNumber(confirmedCount)}</span>
                        </div>
                        <div className="stat-row">
                            <span className="stat-label">المتاح</span>
                            <span className={`stat-value ${availableSeats <= 5 ? 'warning' : ''}`}>
                                {formatArabicNumber(Math.max(availableSeats, 0))}
                            </span>
                        </div>
                        {waitingCount > 0 && (
                            <div className="stat-row">
                                <span className="stat-label">قائمة الانتظار</span>
                                <span className="stat-value waiting">{formatArabicNumber(waitingCount)}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Progress Bar */}
            {maxParticipants > 0 && (
                <div className="registration-progress">
                    <div className="progress-bar-header">
                        <span>نسبة الامتلاء</span>
                        <span>{Math.round(getProgressPercentage())}%</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className={`progress-bar-fill ${getProgressColor()}`}
                            style={{ width: `${getProgressPercentage()}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Registration Deadline */}
            {activity.registration_deadline && (
                <div className={`registration-deadline ${isPastDeadline ? 'expired' : ''}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                        {isPastDeadline ? 'انتهى التسجيل: ' : 'آخر موعد للتسجيل: '}
                        {formatArabicDate(activity.registration_deadline)}
                    </span>
                </div>
            )}

            {/* Registration Status Messages */}
            {isRegistered && (
                <div className={`registration-status-card ${registrationStatus}`}>
                    {registrationStatus === 'confirmed' && (
                        <>
                            <div className="status-icon">✅</div>
                            <div className="status-content">
                                <h4>أنت مسجل!</h4>
                                <p>تم تأكيد تسجيلك في هذا النشاط</p>
                            </div>
                        </>
                    )}
                    {registrationStatus === 'waiting' && (
                        <>
                            <div className="status-icon">⏳</div>
                            <div className="status-content">
                                <h4>في قائمة الانتظار</h4>
                                <p>سيتم إعلامك عند توفر مقعد</p>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="registration-actions">
                {!isUserMember ? (
                    <div className="not-member-notice">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>التسجيل متاح للأعضاء فقط</span>
                    </div>
                ) : !isRegistrationOpen ? (
                    <div className="registration-closed-notice">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>التسجيل مغلق حالياً</span>
                    </div>
                ) : isPastDeadline ? (
                    <div className="registration-closed-notice">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>انتهى موعد التسجيل</span>
                    </div>
                ) : isRegistered ? (
                    <Button
                        variant="danger"
                        fullWidth
                        onClick={() => cancelMutation.mutate()}
                        loading={cancelMutation.isPending}
                    >
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        إلغاء التسجيل
                    </Button>
                ) : (
                    <Button
                        fullWidth
                        size="lg"
                        onClick={() => registerMutation.mutate()}
                        loading={registerMutation.isPending}
                        disabled={isFull && waitingCount >= 10}
                    >
                        {isFull ? (
                            <>
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                الانضمام لقائمة الانتظار
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                سجّل الآن
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Waiting List Toggle */}
            {waitingCount > 0 && (
                <button
                    className="waiting-list-toggle"
                    onClick={() => setShowWaitingList(!showWaitingList)}
                >
                    <span>عرض قائمة الانتظار ({formatArabicNumber(waitingCount)})</span>
                    <svg
                        className={`w-4 h-4 transition-transform ${showWaitingList ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            )}

            {/* Fee Notice */}
            {activity.has_fee && activity.fee_amount && (
                <div className="fee-notice">
                    <div className="fee-icon">💰</div>
                    <div className="fee-content">
                        <span className="fee-label">رسوم المشاركة</span>
                        <span className="fee-amount">
                            {formatArabicNumber(activity.fee_amount)} {activity.fee_currency || 'ل.ت'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
