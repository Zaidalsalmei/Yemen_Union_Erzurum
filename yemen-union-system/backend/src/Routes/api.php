<?php
/**
 * API Routes Definition
 */

declare(strict_types=1);

use App\Core\Router;
use App\Controllers\AuthController;
use App\Controllers\UserController;
use App\Controllers\MembershipController;
use App\Controllers\ActivityController;
use App\Controllers\DashboardController;
use App\Controllers\FinanceController;
use App\Controllers\ReportController;
use App\Controllers\ReportsController;
use App\Controllers\SponsorController;
use App\Controllers\SponsorshipController;
use App\Controllers\SettingsController;
use App\Controllers\RoleController;
use App\Controllers\FinancialTransactionController;
use App\Controllers\AuditLogController;
use App\Controllers\InternalMessageController;
use App\Controllers\AcademicResourceController;
use App\Controllers\MemberNotificationController;
use App\Controllers\SupportTicketController;
use App\Controllers\PostController;
use App\Controllers\MemberDashboardController;
use App\Controllers\NotificationController;
use App\Controllers\ConversationController;
use App\Controllers\UploadController;

// =====================================================
// PUBLIC ROUTES (No Authentication Required)
// =====================================================

// Auth routes (public)
Router::post('/api/auth/login', [AuthController::class, 'login']);
Router::post('/api/auth/register', [AuthController::class, 'register']);
Router::post('/api/auth/refresh', [AuthController::class, 'refresh']);
Router::post('/api/auth/send-otp', [AuthController::class, 'sendOtp']);
Router::post('/api/auth/verify-otp', [AuthController::class, 'verifyOtp']);
Router::post('/api/auth/request-admin-otp', [AuthController::class, 'requestAdminOtp']);
Router::post('/api/auth/send-recovery-otp', [AuthController::class, 'sendRecoveryOtp']);
Router::post('/api/auth/verify-recovery-otp', [AuthController::class, 'verifyRecoveryOtp']);
Router::post('/api/auth/login-with-otp', [AuthController::class, 'loginWithOtp']);
Router::post('/api/auth/reset-password-with-otp', [AuthController::class, 'resetPasswordWithOtp']);

// Branding and Theme Settings (Public)
Router::get('/api/settings/branding', [\App\Controllers\SettingsController::class, 'getBranding']);

// Health check
Router::get('/api/health', function() {
    return ['success' => true, 'message' => 'API is running', 'timestamp' => date('c')];
});

// =====================================================
// PROTECTED ROUTES (Authentication Required)
// =====================================================

Router::group(['middleware' => ['auth']], function() {
    
    // Auth
    Router::post('/api/auth/logout', [AuthController::class, 'logout']);
    Router::get('/api/auth/me', [AuthController::class, 'me']);
    Router::get('/api/me/permissions', [UserController::class, 'myPermissions']);
    Router::post('/api/auth/change-password', [AuthController::class, 'changePassword']);
    
    // Profile (Current User)
    Router::get('/api/profile', [UserController::class, 'profile']);
    Router::put('/api/profile', [UserController::class, 'updateProfile']);
    Router::put('/api/profile/password', [UserController::class, 'updatePassword']);
    
    // Dashboard
    Router::get('/api/dashboard', [DashboardController::class, 'index']);

    // Notifications
    Router::get('/api/notifications', [NotificationController::class, 'index']);
    Router::get('/api/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Router::put('/api/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Router::delete('/api/notifications/clear-read', [NotificationController::class, 'clearRead']);
    Router::put('/api/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Router::delete('/api/notifications/{id}', [NotificationController::class, 'destroy']);
    
    // Uploads
    Router::post('/api/upload/image', [UploadController::class, 'uploadImage']);
    Router::delete('/api/upload/image', [UploadController::class, 'deleteImage']);

    
    // =====================================================
    // FINANCE
    // =====================================================
    
    // Finance stats
    Router::get('/api/finance/stats', [FinanceController::class, 'stats'], ['permission:memberships.view_all']);
    
    // Finance overview (stats + transactions)
    Router::get('/api/finance/overview', [FinanceController::class, 'overview'], ['permission:memberships.view_all']);
    
    // Financial transactions
    Router::get('/api/finance/transactions', [FinanceController::class, 'transactions'], ['permission:memberships.view_all']);
    
    // =====================================================
    // REPORTS
    // =====================================================
    
    // Reports stats (all-in-one)
    Router::get('/api/reports/stats', [ReportsController::class, 'stats']);
    
    // Reports overview (New)
    Router::get('/api/reports/overview', [ReportController::class, 'overview']);
    
    // Members report
    Router::get('/api/reports/members', [ReportsController::class, 'members']);
    
    // Subscriptions report
    Router::get('/api/reports/subscriptions', [ReportsController::class, 'subscriptions']);
    
    // Activities report
    Router::get('/api/reports/activities', [ReportsController::class, 'activities']);
    
    // Finance report
    Router::get('/api/reports/finance', [ReportsController::class, 'finance']);
    
    // =====================================================
    // USERS
    // =====================================================
    
    // List users (requires permission)
    Router::get('/api/users', [UserController::class, 'index'], ['permission:users.view_all']);
    
    // Create user (requires permission)
    Router::post('/api/users', [UserController::class, 'store'], ['permission:users.create']);
    
    // View single user
    Router::get('/api/users/{id}', [UserController::class, 'show'], ['permission:users.view_all']);
    
    // Update user
    Router::put('/api/users/{id}', [UserController::class, 'update'], ['permission:users.update_all']);
    
    // Delete user
    Router::delete('/api/users/{id}', [UserController::class, 'destroy'], ['permission:users.delete']);
    
    // Verify user
    Router::post('/api/users/{id}/verify', [UserController::class, 'verify'], ['permission:users.verify']);
    
    // Ban user
    Router::post('/api/users/{id}/ban', [UserController::class, 'ban'], ['permission:users.ban']);
    
    // =====================================================
    // MEMBERSHIPS
    // =====================================================
    
    // Get membership packages (public for members)
    Router::get('/api/memberships/packages', [MembershipController::class, 'packages']);
    
    // Get my membership
    Router::get('/api/memberships/my', [MembershipController::class, 'myMembership']);

    // Get membership card data
    Router::get('/api/membership/card', [MembershipController::class, 'card']);
    
    // List all memberships (requires permission)
    Router::get('/api/memberships', [MembershipController::class, 'index'], ['permission:memberships.view_all']);
    
    // Create membership
    Router::post('/api/memberships', [MembershipController::class, 'store'], ['permission:memberships.create']);
    
    // Renew membership
    Router::post('/api/memberships/renew', [MembershipController::class, 'renew']);

    // View single membership
    Router::get('/api/memberships/{id}', [MembershipController::class, 'show'], ['permission:memberships.view_all']);
    
    // Update membership
    Router::put('/api/memberships/{id}', [MembershipController::class, 'update'], ['permission:memberships.update']);
    
    // Cancel membership
    Router::put('/api/memberships/{id}/cancel', [MembershipController::class, 'cancel'], ['permission:memberships.update']);
    
    // Delete/Cancel membership
    Router::delete('/api/memberships/{id}', [MembershipController::class, 'destroy'], ['permission:memberships.update']);
    
    // =====================================================
    // ACTIVITIES
    // =====================================================
    
    // List activities (published for all, all for coordinators)
    Router::get('/api/activities', [ActivityController::class, 'index']);
    
    // View single activity
    Router::get('/api/activities/{id}', [ActivityController::class, 'show']);
    
    // Create activity
    Router::post('/api/activities', [ActivityController::class, 'store'], ['permission:activities.create']);
    
    // Update activity
    Router::put('/api/activities/{id}', [ActivityController::class, 'update'], ['permission:activities.update']);
    
    // Delete activity
    Router::delete('/api/activities/{id}', [ActivityController::class, 'destroy'], ['permission:activities.delete']);
    
    // Publish activity
    Router::post('/api/activities/{id}/publish', [ActivityController::class, 'publish'], ['permission:activities.publish']);
    
    // Get participants
    Router::get('/api/activities/{id}/participants', [ActivityController::class, 'participants'], ['permission:activities.manage_participants']);
    
    // Register for activity
    Router::post('/api/activities/{id}/register', [ActivityController::class, 'register']);
    
    // Check in participant
    Router::post('/api/activities/{id}/checkin', [ActivityController::class, 'checkIn'], ['permission:activities.checkin']);
    
    // =====================================================
    // SPONSORS (الجهات الداعمة)
    // =====================================================
    
    // Sponsor stats
    Router::get('/api/sponsors/stats', [SponsorController::class, 'stats'], ['permission:sponsors.view']);
    
    // Sponsor dropdown (for forms)
    Router::get('/api/sponsors/dropdown', [SponsorController::class, 'dropdown']);
    
    // List sponsors
    Router::get('/api/sponsors', [SponsorController::class, 'index'], ['permission:sponsors.view']);
    
    // Create sponsor
    Router::post('/api/sponsors', [SponsorController::class, 'store'], ['permission:sponsors.create']);
    
    // View single sponsor
    Router::get('/api/sponsors/{id}', [SponsorController::class, 'show'], ['permission:sponsors.view']);
    
    // Update sponsor
    Router::put('/api/sponsors/{id}', [SponsorController::class, 'update'], ['permission:sponsors.update']);
    
    // Delete sponsor
    Router::delete('/api/sponsors/{id}', [SponsorController::class, 'destroy'], ['permission:sponsors.delete']);
    
    // =====================================================
    // SPONSORSHIPS (الرعايات)
    // =====================================================
    
    // Sponsorship stats
    Router::get('/api/sponsorships/stats', [SponsorshipController::class, 'stats'], ['permission:sponsorships.view']);
    
    // Recent sponsorships (for dashboard)
    Router::get('/api/sponsorships/recent', [SponsorshipController::class, 'recent']);
    
    // Calendar events
    Router::get('/api/sponsorships/calendar', [SponsorshipController::class, 'calendar']);
    
    // List sponsorships
    Router::get('/api/sponsorships', [SponsorshipController::class, 'index'], ['permission:sponsorships.view']);
    
    // Create sponsorship
    Router::post('/api/sponsorships', [SponsorshipController::class, 'store'], ['permission:sponsorships.create']);
    
    // View single sponsorship
    Router::get('/api/sponsorships/{id}', [SponsorshipController::class, 'show'], ['permission:sponsorships.view']);
    
    // Update sponsorship
    Router::put('/api/sponsorships/{id}', [SponsorshipController::class, 'update'], ['permission:sponsorships.create']);
    
    // Approve/Reject sponsorship
    Router::post('/api/sponsorships/{id}/approve', [SponsorshipController::class, 'approve'], ['permission:sponsorships.create']);
    Router::post('/api/sponsorships/{id}/reject', [SponsorshipController::class, 'reject'], ['permission:sponsorships.create']);

    // Delete sponsorship
    Router::delete('/api/sponsorships/{id}', [SponsorshipController::class, 'destroy'], ['permission:sponsorships.create']);

    // =====================================================
    // SETTINGS
    // =====================================================
    
    // Get all settings
    Router::get('/api/settings', [SettingsController::class, 'index'], ['permission:settings.view']);
    
    // Update settings
    Router::put('/api/settings', [SettingsController::class, 'update'], ['permission:settings.update']);
    
    // Branding settings management (Protected)
    Router::put('/api/settings/branding', [SettingsController::class, 'updateBranding'], ['permission:settings.branding']);
    Router::post('/api/settings/branding/logo', [SettingsController::class, 'uploadLogo'], ['permission:settings.branding']);
    Router::delete('/api/settings/branding/logo', [SettingsController::class, 'removeLogo'], ['permission:settings.branding']);
    
    // System settings
    Router::get('/api/settings/system', [SettingsController::class, 'getSystem'], ['permission:settings.view']);
    Router::put('/api/settings/system', [SettingsController::class, 'updateSystem'], ['permission:settings.update']);
    
    // Notification settings
    Router::get('/api/settings/notifications', [SettingsController::class, 'getNotifications'], ['permission:settings.view']);
    Router::put('/api/settings/notifications', [SettingsController::class, 'updateNotifications'], ['permission:settings.update']);

    // =====================================================
    // MEMBER NOTIFICATIONS
    // =====================================================
    
    // Member notifications
    Router::get('/api/member/notifications', [MemberNotificationController::class, 'index']);
    Router::post('/api/member/notifications/mark-all-read', [MemberNotificationController::class, 'markAllAsRead']);
    Router::post('/api/member/notifications/{id}/mark-read', [MemberNotificationController::class, 'markAsRead']);
    Router::delete('/api/member/notifications/{id}', [MemberNotificationController::class, 'destroy']);

    // =====================================================
    // ROLES & PERMISSIONS
    // =====================================================
    
    // Roles
    Router::get('/api/roles', [RoleController::class, 'index'], ['permission:roles.view']);
    Router::post('/api/roles', [RoleController::class, 'store'], ['permission:roles.manage']);
    Router::get('/api/roles/{id}', [RoleController::class, 'show'], ['permission:roles.view']);
    Router::put('/api/roles/{id}', [RoleController::class, 'update'], ['permission:roles.manage']);
    Router::delete('/api/roles/{id}', [RoleController::class, 'destroy'], ['permission:roles.manage']);
    Router::get('/api/roles/{id}/permissions', [RoleController::class, 'getRolePermissions']);
    Router::put('/api/roles/{id}/permissions', [RoleController::class, 'updateRolePermissions']);
    
    // Permissions list
    Router::get('/api/permissions', [RoleController::class, 'permissions'], ['permission:roles.manage']);
    
    // User Roles & Permissions
    Router::get('/api/users/{id}/roles', [UserController::class, 'getUserRole']);
    Router::post('/api/users/{id}/roles', [UserController::class, 'assignRole']);
    Router::delete('/api/users/{id}/roles', [UserController::class, 'removeRole']);
    Router::get('/api/roles/list', [RoleController::class, 'dropdown']);
    
    // Legacy / Specific routes
    Router::get('/api/users/{id}/permissions', [RoleController::class, 'userPermissions'], ['permission:roles.manage']);

    // =====================================================
    // FINANCIAL TRANSACTIONS (المعاملات المالية)
    // =====================================================
    Router::get('/api/financial-transactions/stats', [FinancialTransactionController::class, 'stats'], ['permission:finance.view']);
    Router::get('/api/financial-transactions', [FinancialTransactionController::class, 'index'], ['permission:finance.view']);
    Router::post('/api/financial-transactions', [FinancialTransactionController::class, 'store'], ['permission:finance.create']);
    Router::get('/api/financial-transactions/{id}', [FinancialTransactionController::class, 'show'], ['permission:finance.view']);
    Router::put('/api/financial-transactions/{id}', [FinancialTransactionController::class, 'update'], ['permission:finance.update']);
    Router::post('/api/financial-transactions/{id}/approve', [FinancialTransactionController::class, 'approve'], ['permission:finance.approve']);
    Router::post('/api/financial-transactions/{id}/reject', [FinancialTransactionController::class, 'reject'], ['permission:finance.approve']);
    Router::delete('/api/financial-transactions/{id}', [FinancialTransactionController::class, 'destroy'], ['permission:finance.delete']);

    // =====================================================
    // AUDIT LOGS (سجل النشاطات)
    // =====================================================
    Router::get('/api/audit-logs/stats', [AuditLogController::class, 'stats'], ['permission:audit.view']);
    Router::get('/api/audit-logs', [AuditLogController::class, 'index'], ['permission:audit.view']);
    Router::delete('/api/audit-logs/old', [AuditLogController::class, 'clearOld'], ['permission:audit.manage']);

    // =====================================================
    // INTERNAL MESSAGES (الرسائل الداخلية)
    // =====================================================
    Router::get('/api/messages/unread-count', [InternalMessageController::class, 'unreadCount']);
    Router::get('/api/messages/inbox', [InternalMessageController::class, 'inbox']);
    Router::get('/api/messages/sent', [InternalMessageController::class, 'sent']);
    Router::get('/api/messages/{id}', [InternalMessageController::class, 'show']);
    Router::post('/api/messages', [InternalMessageController::class, 'store']);
    Router::delete('/api/messages/{id}', [InternalMessageController::class, 'destroy']);

    // =====================================================
    // ACADEMIC RESOURCES (المحتوى الأكاديمي)
    // =====================================================
    Router::get('/api/academic-resources/stats', [AcademicResourceController::class, 'stats'], ['permission:academic.manage']);
    Router::get('/api/academic-resources', [AcademicResourceController::class, 'index']);
    Router::post('/api/academic-resources', [AcademicResourceController::class, 'store']);
    Router::get('/api/academic-resources/{id}', [AcademicResourceController::class, 'show']);
    Router::put('/api/academic-resources/{id}', [AcademicResourceController::class, 'update'], ['permission:academic.manage']);
    Router::post('/api/academic-resources/{id}/publish', [AcademicResourceController::class, 'publish'], ['permission:academic.manage']);
    Router::post('/api/academic-resources/{id}/download', [AcademicResourceController::class, 'download']);
    Router::delete('/api/academic-resources/{id}', [AcademicResourceController::class, 'destroy'], ['permission:academic.manage']);

    // =====================================================
    // SUPPORT TICKETS (تذاكر الدعم)
    // =====================================================
    Router::get('/api/support-tickets/stats', [SupportTicketController::class, 'stats'], ['permission:support.view_all']);
    Router::get('/api/support-tickets', [SupportTicketController::class, 'index']);
    Router::post('/api/support-tickets', [SupportTicketController::class, 'store']);
    Router::get('/api/support-tickets/{id}', [SupportTicketController::class, 'show']);
    Router::put('/api/support-tickets/{id}', [SupportTicketController::class, 'update'], ['permission:support.manage']);
    Router::post('/api/support-tickets/{id}/reply', [SupportTicketController::class, 'reply']);
    Router::post('/api/support-tickets/{id}/close', [SupportTicketController::class, 'close']);

    // =====================================================
    // POSTS (المنشورات والإعلانات)
    // =====================================================
    Router::get('/api/posts', [PostController::class, 'index']);
    Router::post('/api/posts', [PostController::class, 'store'], ['permission:posts.create']);
    Router::get('/api/posts/{id}', [PostController::class, 'show']);
    Router::put('/api/posts/{id}', [PostController::class, 'update'], ['permission:posts.update']);
    Router::delete('/api/posts/{id}', [PostController::class, 'destroy'], ['permission:posts.delete']);
    Router::post('/api/posts/{id}/publish', [PostController::class, 'publish'], ['permission:posts.manage']);
    Router::post('/api/posts/{id}/unpublish', [PostController::class, 'unpublish'], ['permission:posts.manage']);

    Router::get('/api/member/dashboard', [MemberDashboardController::class, 'index']);
    Router::put('/api/member/profile', [UserController::class, 'updateProfile']);

    // =====================================================
    // CHAT & CONVERSATIONS
    // =====================================================
    Router::get('/api/conversations', [ConversationController::class, 'index']);
    Router::post('/api/conversations', [ConversationController::class, 'store']);
    Router::get('/api/conversations/unread-count', [ConversationController::class, 'unreadCount']);
    Router::get('/api/conversations/{id}/messages', [ConversationController::class, 'messages']);
    Router::post('/api/conversations/{id}/messages', [ConversationController::class, 'sendMessage']);
    Router::get('/api/conversations/{id}/poll', [ConversationController::class, 'poll']);
    Router::post('/api/conversations/{id}/typing', [ConversationController::class, 'typing']);
    Router::delete('/api/conversations/{id}/messages/{msgId}', [ConversationController::class, 'deleteMessage']);
});

