import api from './api';
import type { ApiResponse, User, AuthResponse, LoginCredentials } from '../types';

export const authService = {
    /**
     * Login user
     */
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
        const data = response.data.data!;

        // Store tokens
        if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
        }
        if (data.refresh_token) {
            localStorage.setItem('refresh_token', data.refresh_token);
        }
        // ✅ FIX: Also save user to localStorage
        if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
        }

        return data;
    },

    /**
     * Logout user
     */
    logout: async (): Promise<void> => {
        try {
            await api.post('/auth/logout');
        } catch {
            // Ignore logout errors
        }
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    },

    /**
     * Get current user profile
     */
    getMe: async (): Promise<User> => {
        const response = await api.get<ApiResponse<User>>('/auth/me');
        return response.data.data!;
    },

    /**
     * Change password
     */
    changePassword: async (data: {
        current_password: string;
        new_password: string;
        confirm_password: string;
    }): Promise<void> => {
        await api.post('/auth/change-password', data);
    },

    /**
     * Register new user
     */
    register: async (data: {
        full_name: string;
        phone_number: string;
        email?: string;
        password: string;
    }): Promise<void> => {
        await api.post('/auth/register', data);
    },

    /**
     * Send Verification OTP
     */
    sendOtp: async (phoneNumber: string): Promise<any> => {
        const response = await api.post('/auth/send-otp', { phone_number: phoneNumber });
        return response.data;
    },

    /**
     * Verify OTP
     */
    verifyOtp: async (phoneNumber: string, otp: string): Promise<void> => {
        await api.post('/auth/verify-otp', { phone_number: phoneNumber, otp });
    },

    /**
     * Send Recovery OTP
     */
    sendRecoveryOtp: async (phoneNumber: string): Promise<any> => {
        const response = await api.post('/auth/send-recovery-otp', { phone_number: phoneNumber });
        return response.data;
    },

    /**
     * Verify Recovery OTP
     */
    verifyRecoveryOtp: async (phoneNumber: string, otp: string): Promise<any> => {
        const response = await api.post<ApiResponse<any>>('/auth/verify-recovery-otp', {
            phone_number: phoneNumber,
            otp
        });
        return response.data.data!;
    },

    /**
     * Login with OTP
     */
    loginWithOtp: async (phoneNumber: string, otp: string): Promise<AuthResponse> => {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/login-with-otp', {
            phone_number: phoneNumber,
            otp
        });

        const data = response.data.data!;

        // Store tokens
        if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
        }
        if (data.refresh_token) {
            localStorage.setItem('refresh_token', data.refresh_token);
        }
        if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
        }

        return data;
    },

    /**
     * Reset password using OTP
     */
    resetPasswordWithOtp: async (phoneNumber: string, otp: string, newPassword: string, confirmPassword: string): Promise<void> => {
        await api.post('/auth/reset-password-with-otp', {
            phone_number: phoneNumber,
            otp,
            new_password: newPassword,
            confirm_password: confirmPassword
        });
    },

    /**
     * Get user permissions and related data
     */
    getMyPermissions: async (): Promise<any> => {
        const response = await api.get<ApiResponse<any>>('/me/permissions');
        return response.data.data;
    },
};
