// User types
export interface User {
    id: number;
    full_name: string;
    phone_number: string;
    email?: string;
    status: 'pending' | 'active' | 'suspended' | 'banned';
    membership_expiry_date?: string;
    profile_photo?: string;
    date_of_birth?: string;
    gender?: 'male' | 'female';
    nationality?: string;
    city?: string;
    address?: string;
    university?: string;
    faculty?: string;
    study_level?: string;
    major?: string;
    academic_year?: string;
    student_id?: string;
    notes?: string;
    roles?: Role[];
    permissions?: string[];
    created_at: string;
    updated_at?: string;
    reply_count?: number;
}

export interface EmailReply {
    id: number;
    user_id: number;
    sender_email: string;
    subject?: string;
    message: string;
    created_at: string;
}

export interface Role {
    id: number;
    name: string;
    display_name_ar: string;
    description_ar?: string;
    level: number;
    permissions?: string[];
    is_system_role?: boolean;
}

export interface Permission {
    id: number;
    name: string;
    display_name_ar: string;
}

// Auth types
export interface LoginCredentials {
    phone_number: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    user: User;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    errors?: Record<string, string[]>;
    meta?: PaginationMeta;
}

export interface PaginationMeta {
    total: number;
    current_page: number;
    per_page: number;
    last_page: number;
    from: number;
    to: number;
}

// Membership types
export interface MembershipPackage {
    id: number;
    name_ar: string;
    duration_months: number;
    price: number;
    description_ar?: string;
    is_active: boolean;
}

export interface Membership {
    id: number;
    user_id: number;
    // From JOIN in backend
    user_name?: string;
    user_phone?: string;
    // Nested user object (for compatibility)
    user?: {
        id: number;
        full_name: string;
        phone_number: string;
        email?: string;
    };
    package_id: number;
    package_name?: string;
    // Nested membership_type for compatibility
    membership_type?: {
        id: number;
        name_ar: string;
        name_en?: string;
        duration_months: number;
        price: number;
    };
    amount: number;
    currency: string;
    payment_method: string;
    reference_id?: string;
    start_date: string;
    end_date: string;
    duration_months?: number;
    status: 'pending' | 'active' | 'expired' | 'cancelled' | 'refunded';
    notes?: string;
    created_at: string;
    updated_at?: string;
}

// Activity Lifecycle Status
export type ActivityStatus =
    | 'draft'           // مسودة - لم يُنشر بعد
    | 'published'       // منشور - مرئي للجميع
    | 'registration_open'   // التسجيل مفتوح
    | 'registration_closed' // التسجيل مغلق
    | 'in_progress'     // جاري التنفيذ
    | 'completed'       // مكتمل
    | 'cancelled';      // ملغي

export type ActivityVisibility = 'public' | 'members_only' | 'invited_only';
export type ActivityType = 'workshop' | 'seminar' | 'trip' | 'meeting' | 'social' | 'sports' | 'cultural' | 'other';

// Activity Category
export interface ActivityCategory {
    id: number;
    name_ar: string;
    name_en?: string;
    icon?: string;
    color?: string;
    description_ar?: string;
    activities_count?: number;
}

// Main Activity Interface
export interface Activity {
    id: number;
    title_ar: string;
    title_en?: string;
    description_ar?: string;
    description_en?: string;
    cover_image?: string;
    gallery_images?: string[];
    activity_date: string;
    start_time?: string;
    end_date?: string;
    end_time?: string;
    location_ar?: string;
    location_en?: string;
    location_map_url?: string;
    location_coordinates?: { lat: number; lng: number };
    max_participants?: number;
    participant_count?: number;
    waiting_list_count?: number;
    registration_required: boolean;
    registration_deadline?: string;
    status: ActivityStatus;
    visibility: ActivityVisibility;
    activity_type?: ActivityType;
    category_id?: number;
    category?: ActivityCategory;
    tags?: string[];
    has_fee: boolean;
    fee_amount?: number;
    fee_currency?: string;
    is_registered?: boolean;
    registration_status?: 'confirmed' | 'waiting' | 'cancelled';
    has_attended?: boolean;
    created_by: number;
    creator_name?: string;
    organizer?: {
        id: number;
        full_name: string;
        profile_photo?: string;
        role?: string;
        phone_number?: string;
        email?: string;
    };
    average_rating?: number;
    total_ratings?: number;
    created_at: string;
    updated_at?: string;
}

// Activity Registration
export interface ActivityRegistration {
    id: number;
    activity_id: number;
    user_id: number;
    user: {
        id: number;
        full_name: string;
        phone_number: string;
        email?: string;
        profile_photo?: string;
    };
    status: 'pending' | 'confirmed' | 'waiting' | 'cancelled' | 'no_show';
    registration_date: string;
    confirmation_date?: string;
    cancellation_date?: string;
    cancellation_reason?: string;
    ticket_code?: string;
    qr_code?: string;
    notes?: string;
    created_at: string;
}

// Activity Attendance
export interface ActivityAttendance {
    id: number;
    registration_id: number;
    activity_id: number;
    user_id: number;
    user_name: string;
    check_in_time?: string;
    check_out_time?: string;
    check_in_method: 'manual' | 'qr_code' | 'auto';
    checked_in_by?: number;
    checked_in_by_name?: string;
    notes?: string;
}

// Activity Ticket
export interface ActivityTicket {
    id: number;
    registration_id: number;
    ticket_code: string;
    qr_code_data: string;
    activity: {
        id: number;
        title_ar: string;
        activity_date: string;
        location_ar?: string;
    };
    user: {
        id: number;
        full_name: string;
    };
    status: 'valid' | 'used' | 'expired' | 'cancelled';
    issued_at: string;
    used_at?: string;
}

// Activity Feedback/Rating
export interface ActivityFeedback {
    id: number;
    activity_id: number;
    user_id: number;
    user_name: string;
    user_photo?: string;
    rating: number; // 1-5
    comment?: string;
    is_anonymous: boolean;
    created_at: string;
    updated_at?: string;
}

// Activity Statistics
export interface ActivityStatistics {
    total_registrations: number;
    confirmed_registrations: number;
    waiting_list: number;
    cancellations: number;
    attendance_count: number;
    attendance_rate: number;
    average_rating: number;
    total_ratings: number;
    revenue?: number;
}

// Activity Analytics
export interface ActivityAnalytics {
    registration_trend: { date: string; count: number }[];
    attendance_by_time: { time: string; count: number }[];
    rating_distribution: { rating: number; count: number }[];
    top_activities: { id: number; title: string; registrations: number }[];
    category_distribution: { category: string; count: number }[];
}


// Dashboard types
export interface DashboardStats {
    total_members: number;
    active_members: number;
    pending_members: number;
    members_with_membership: number;
    monthly_income: number;
    upcoming_activities: number;
}

export interface DashboardData {
    stats: DashboardStats;
    recent_activity: AuditLog[];
    upcoming_activities: Activity[];
    expiring_memberships: ExpiringMembership[];
    recent_notifications?: Notification[];
    recent_support_tickets?: SupportTicketSummary[];
}

export interface AuditLog {
    id: number;
    user_id: number;
    user_name?: string;
    action: string;
    entity_type: string;
    entity_id: number;
    created_at: string;
}

export interface ExpiringMembership {
    id: number;
    full_name: string;
    phone_number: string;
    membership_expiry_date: string;
    days_remaining: number;
}

export interface SupportTicketSummary {
    id: number;
    ticket_number: string;
    subject: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'pending' | 'closed';
    attachment_url?: string;
    created_at: string;
    member_name: string;
    member_id?: string;
    phone_number?: string;
    replies_count?: number;
}

// =====================================================
// SPONSORS & SPONSORSHIPS (Relations Module)
// =====================================================

// Sponsor Types (based on 001_full_schema.sql)
export type SponsorType = 'individual' | 'company' | 'organization' | 'government';

// A backward compatibility alias for old code
export type Supporter = Sponsor;

export interface Sponsor {
    id: number;
    name: string;
    type: SponsorType;
    contact_person?: string;
    phone?: string;
    email?: string;
    address?: string;
    description_ar?: string;
    logo_url?: string;
    website?: string;
    is_active: boolean;
    total_sponsored: number;
    created_at: string;
    updated_at?: string;
    // Backward compatibility aliases
    city?: string; // maps to address
    representative_name?: string; // maps to contact_person
    total_support_amount?: number; // maps to total_sponsored
    total_visits?: number; // computed from sponsorships count
    recent_sponsorships?: Sponsorship[];
}

// Sponsorship Types
export type SponsorshipCategory = 'general' | 'activity' | 'project' | 'scholarship' | 'emergency';
export type SponsorshipStatus = 'pending' | 'received' | 'allocated' | 'refunded';

export interface Sponsorship {
    id: number;
    sponsor_id: number;
    sponsor_name?: string;
    sponsor_type?: SponsorType;
    // Nested sponsor object (when fetched with relations)
    sponsor?: Sponsor;
    amount: number;
    currency: string;
    purpose_ar: string;
    category: SponsorshipCategory;
    activity_id?: number;
    activity_title?: string;
    // Nested activity object (when fetched with relations)
    activity?: {
        id: number;
        title_ar: string;
        start_date: string;
    };
    reference_id: string;
    receipt_number?: string;
    received_date: string;
    status: SponsorshipStatus;
    notes?: string;
    created_by: number;
    created_by_name?: string;
    created_at: string;
    updated_at?: string;
}

// Sponsors Statistics
export interface SupportersStats {
    total_sponsors: number;
    active_sponsors: number;
    total_sponsored: number;
    total_sponsorships: number;
    this_month_amount: number;
    top_sponsors: Sponsor[];
    // Backward compatibility aliases
    total_supporters?: number;
    active_supporters?: number;
    total_support_amount?: number;
    total_visits?: number;
}

// Form types for creating/editing
export interface SponsorFormData {
    name: string;
    type?: SponsorType;
    contact_person?: string;
    phone?: string;
    email?: string;
    address?: string;
    description_ar?: string;
    logo_url?: string;
    website?: string;
    is_active?: boolean;
}

export interface SponsorshipFormData {
    sponsor_id: number;
    amount: number;
    currency?: string;
    purpose_ar: string;
    category?: SponsorshipCategory;
    activity_id?: number;
    receipt_number?: string;
    received_date: string;
    status?: SponsorshipStatus;
    notes?: string;
}

// Calendar event type for sponsorships
export interface SponsorshipCalendarEvent {
    id: number;
    date: string;
    title: string;
    amount: number;
    currency: string;
    category: string;
    event_type: 'sponsorship';
}

// =====================================================
// MEMBER DASHBOARD TYPES
// =====================================================

export type MemberAccountStatus = 'active' | 'pending_approval' | 'expired' | 'suspended';

export interface MemberDashboardData {
    member: MemberProfile;
    kpis: MemberKPIs;
    subscription: MemberSubscription;
    upcomingActivities: Activity[];
    recentPosts: Post[];
    notifications: Notification[];
    isFirstLogin: boolean;
}

export interface MemberProfile {
    id: number;
    full_name: string;
    phone_number: string;
    email?: string;
    profile_photo?: string;
    member_id: string;
    branch: string;
    join_date: string;
    last_login_at: string;
    account_status: MemberAccountStatus;
    city?: string;
    university?: string;
    faculty?: string;
    suspension_reason?: string;
}

export interface MemberKPIs {
    subscription_status: 'paid' | 'unpaid' | 'pending';
    subscription_expiry: string | null;
    days_remaining: number | null;
    upcoming_activities_count: number;
    unread_notifications_count: number;
    new_posts_count: number;
    missing_documents_count: number;
}

export interface MemberSubscription {
    id: number;
    status: 'active' | 'expired' | 'pending';
    start_date: string;
    end_date: string;
    package_name: string;
    amount: number;
    currency: string;
    is_paid: boolean;
    last_payment?: Payment;
    payment_proof?: PaymentProof;
    days_until_expiry: number;
}

export interface Payment {
    id: number;
    amount: number;
    currency: string;
    payment_date: string;
    status: 'pending' | 'approved' | 'rejected';
    payment_method: string;
}

export interface PaymentProof {
    id: number;
    file_url: string;
    upload_date: string;
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string;
    reviewed_at?: string;
    reviewed_by_name?: string;
}

export interface Post {
    id: number;
    title: string;
    excerpt: string;
    content: string;
    category: 'announcement' | 'event' | 'financial_alert' | 'general';
    cover_image?: string;
    created_at: string;
    is_read: boolean;
    author_name?: string;
}

export interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    is_read: boolean;
    created_at: string;
    action_url?: string;
}

export interface SupportTicket {
    subject: string;
    message: string;
    attachment?: File;
}

export interface FAQ {
    id: number;
    question: string;
    answer: string;
    category: string;
}

export interface MemberProfileUpdate {
    full_name?: string;
    city?: string;
    university?: string;
    faculty?: string;
    email?: string;
}

