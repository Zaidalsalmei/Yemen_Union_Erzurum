import type { Post, PostFormData, MediaFile } from '../types/posts';
import api from './api';
import type { ApiResponse } from '../types';

// ====================================================
// POSTS API SERVICE
// ====================================================

export const postsApi = {
    // Get all posts with filters
    getPosts: async (params?: {
        status?: string;
        search?: string;
        activity_id?: number;
        page?: number;
        per_page?: number;
    }) => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.activity_id) queryParams.append('activity_id', String(params.activity_id));
        if (params?.page) queryParams.append('page', String(params.page));
        if (params?.per_page) queryParams.append('per_page', String(params.per_page));

        const response = await api.get<ApiResponse<Post[]>>(`/posts?${queryParams}`);
        return response.data;
    },

    // Get single post
    getPost: async (id: number) => {
        const response = await api.get<ApiResponse<Post>>(`/posts/${id}`);
        return response.data;
    },

    // Create post
    createPost: async (data: PostFormData) => {
        const response = await api.post<ApiResponse<Post>>('/posts', data);
        return response.data;
    },

    // Update post
    updatePost: async (id: number, data: Partial<PostFormData>) => {
        const response = await api.put<ApiResponse<Post>>(`/posts/${id}`, data);
        return response.data;
    },

    // Delete post
    deletePost: async (id: number) => {
        const response = await api.delete<ApiResponse<void>>(`/posts/${id}`);
        return response.data;
    },

    // Publish post
    publishPost: async (id: number) => {
        const response = await api.post<ApiResponse<Post>>(`/posts/${id}/publish`);
        return response.data;
    },

    // Schedule post
    schedulePost: async (id: number, scheduled_at: string) => {
        const response = await api.post<ApiResponse<Post>>(`/posts/${id}/schedule`, { scheduled_at });
        return response.data;
    },

    // Pin/Unpin post
    togglePin: async (id: number) => {
        const response = await api.post<ApiResponse<Post>>(`/posts/${id}/toggle-pin`);
        return response.data;
    },

    // Lock/Unlock post
    toggleLock: async (id: number) => {
        const response = await api.post<ApiResponse<Post>>(`/posts/${id}/toggle-lock`);
        return response.data;
    },

    // Get post revisions
    getRevisions: async (postId: number) => {
        const response = await api.get<ApiResponse<any[]>>(`/posts/${postId}/revisions`);
        return response.data;
    },

    // Restore revision
    restoreRevision: async (postId: number, revisionId: number) => {
        const response = await api.post<ApiResponse<Post>>(`/posts/${postId}/revisions/${revisionId}/restore`);
        return response.data;
    },

    // Add internal comment
    addComment: async (postId: number, comment: string) => {
        const response = await api.post<ApiResponse<any>>(`/posts/${postId}/comments`, { comment });
        return response.data;
    },

    // Get comments
    getComments: async (postId: number) => {
        const response = await api.get<ApiResponse<any[]>>(`/posts/${postId}/comments`);
        return response.data;
    },
};

// ====================================================
// MEDIA LIBRARY API
// ====================================================

export const mediaApi = {
    // Get all media
    getMedia: async (params?: {
        file_type?: string;
        search?: string;
        page?: number;
        per_page?: number;
    }) => {
        const queryParams = new URLSearchParams();
        if (params?.file_type) queryParams.append('file_type', params.file_type);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.page) queryParams.append('page', String(params.page));
        if (params?.per_page) queryParams.append('per_page', String(params.per_page));

        const response = await api.get<ApiResponse<MediaFile[]>>(`/media?${queryParams}`);
        return response.data;
    },

    // Upload media
    uploadMedia: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<ApiResponse<MediaFile>>('/media/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Delete media
    deleteMedia: async (id: number) => {
        const response = await api.delete<ApiResponse<void>>(`/media/${id}`);
        return response.data;
    },
};

// ====================================================
// SOCIAL MEDIA API
// ====================================================

export const socialApi = {
    // Get user's social accounts
    getSocialAccounts: async () => {
        const response = await api.get<ApiResponse<any>>('/social-accounts');
        return response.data;
    },

    // Connect Instagram
    connectInstagram: async (code: string) => {
        const response = await api.post<ApiResponse<any>>('/social-accounts/instagram/connect', { code });
        return response.data;
    },

    // Import from YouTube
    importFromYouTube: async (url: string) => {
        const response = await api.post<ApiResponse<any>>('/social-accounts/youtube/import', { url });
        return response.data;
    },

    // Import from Instagram
    importFromInstagram: async (media_id: string) => {
        const response = await api.post<ApiResponse<any>>('/social-accounts/instagram/import', { media_id });
        return response.data;
    },

    // Connect Canva
    connectCanva: async (api_key: string) => {
        const response = await api.post<ApiResponse<any>>('/social-accounts/canva/connect', { api_key });
        return response.data;
    },

    // Save WhatsApp number
    saveWhatsApp: async (number: string) => {
        const response = await api.post<ApiResponse<any>>('/social-accounts/whatsapp', { number });
        return response.data;
    },
};

// ====================================================
// TAGS API
// ====================================================

export const tagsApi = {
    // Get all tags
    getTags: async () => {
        const response = await api.get<ApiResponse<any[]>>('/posts/tags');
        return response.data;
    },

    // Create tag
    createTag: async (name: string) => {
        const response = await api.post<ApiResponse<any>>('/posts/tags', { name });
        return response.data;
    },
};
