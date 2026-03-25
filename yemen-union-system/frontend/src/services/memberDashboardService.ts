import api from './api';
import type { ApiResponse, MemberDashboardData, MemberProfileUpdate, SupportTicket, PaymentProof } from '../types';

export const memberDashboardService = {
    /**
     * Get comprehensive member dashboard data
     */
    getDashboardData: async (): Promise<MemberDashboardData> => {
        const response = await api.get<ApiResponse<MemberDashboardData>>('/member/dashboard');
        return response.data.data!;
    },

    /**
     * Update member profile (first login or regular update)
     */
    updateProfile: async (data: MemberProfileUpdate): Promise<void> => {
        await api.put('/member/profile', data);
    },

    /**
     * Upload payment proof
     */
    uploadPaymentProof: async (file: File, subscriptionId: number): Promise<PaymentProof> => {
        const formData = new FormData();
        formData.append('proof', file);
        formData.append('subscription_id', subscriptionId.toString());

        const response = await api.post<ApiResponse<PaymentProof>>(
            '/member/payment-proof',
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' }
            }
        );
        return response.data.data!;
    },

    /**
     * Submit support ticket
     */
    submitSupportTicket: async (ticket: SupportTicket): Promise<void> => {
        const formData = new FormData();
        formData.append('subject', ticket.subject);
        formData.append('message', ticket.message);
        if (ticket.attachment) {
            formData.append('attachment', ticket.attachment);
        }

        await api.post('/member/support-ticket', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    /**
     * Mark notification as read
     */
    markNotificationAsRead: async (notificationId: number): Promise<void> => {
        await api.put(`/notifications/${notificationId}/read`);
    },

    /**
     * Mark all notifications as read
     */
    markAllNotificationsRead: async (): Promise<void> => {
        await api.put('/notifications/read-all');
    },

    /**
     * Mark post as read
     */
    markPostAsRead: async (postId: number): Promise<void> => {
        await api.put(`/posts/${postId}/read`);
    },

    /**
     * Get FAQ list
     */
    getFAQs: async (): Promise<any[]> => {
        const response = await api.get<ApiResponse<any[]>>('/faqs');
        return response.data.data || [];
    },

    /**
     * Logout from all devices
     */
    logoutAllDevices: async (): Promise<void> => {
        await api.post('/auth/logout-all-devices');
    },
};
