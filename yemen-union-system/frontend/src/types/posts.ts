// ====================================================
// POSTS MODULE - TypeScript Types
// ====================================================

import type { User, Activity } from './index';

export type PostStatus = 'draft' | 'review' | 'published';
export type MediaType = 'image' | 'video' | 'youtube' | 'instagram' | 'canva' | 'file';
export type FileType = 'image' | 'video' | 'pdf' | 'document';

export interface Post {
    id: number;
    title: string;
    description?: string;
    thumbnail?: string;
    media_type: MediaType;
    media_url?: string;
    status: PostStatus;
    created_by: number;
    activity_id?: number;
    scheduled_at?: string;
    published_at?: string;
    is_pinned: boolean;
    is_locked: boolean;
    views_count: number;
    created_at: string;
    updated_at: string;

    // Relations
    author?: User;
    activity?: Activity;
    tags?: PostTag[];
    revisions?: PostRevision[];
    comments?: PostComment[];
}

export interface PostRevision {
    id: number;
    post_id: number;
    title: string;
    description?: string;
    media_url?: string;
    edited_by: number;
    created_at: string;

    // Relations
    editor?: User;
}

export interface PostComment {
    id: number;
    post_id: number;
    comment: string;
    added_by: number;
    created_at: string;

    // Relations
    author?: User;
}

export interface MediaFile {
    id: number;
    file_name: string;
    file_path: string;
    file_type: FileType;
    file_size?: number;
    uploaded_by: number;
    created_at: string;

    // Relations
    uploader?: User;
}

export interface SocialAccount {
    id: number;
    user_id: number;
    instagram_token?: string;
    instagram_user_id?: string;
    whatsapp_number?: string;
    canva_connected: boolean;
    canva_api_key?: string;
    youtube_connected: boolean;
    youtube_channel_id?: string;
    created_at: string;
    updated_at: string;
}

export interface PostTag {
    id: number;
    name: string;
    slug: string;
    created_at: string;
}

// Form Data Interfaces
export interface PostFormData {
    title: string;
    description?: string;
    thumbnail?: string;
    media_type: MediaType;
    media_url?: string;
    status: PostStatus;
    activity_id?: number;
    scheduled_at?: string;
    tags?: number[];
}

export interface MediaUploadData {
    file: File;
    file_type: FileType;
}

export interface SocialImportData {
    type: 'youtube' | 'instagram' | 'canva';
    url?: string;
    media_id?: string;
}

// API Response Types
export interface PostsListResponse {
    data: Post[];
    meta: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
}

export interface PostDetailResponse {
    data: Post;
}

export interface MediaLibraryResponse {
    data: MediaFile[];
    meta: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
}
