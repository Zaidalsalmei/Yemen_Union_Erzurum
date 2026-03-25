# Project Structure: yemen-union-system
```text
yemen-union-system/
│   ├── ACTIVITIES_COMPLETE.md
│   ├── ACTIVITIES_PROGRESS.md
│   ├── ACTIVITIES_REDESIGN_REPORT.md
│   ├── ACTIVITIES_UPGRADE_PLAN.md
│   ├── ADMIN_DASHBOARD_FIX.md
│   ├── Apache
│   ├── API_AUDIT_REPORT.json
│   ├── API_AUDIT_REPORT_AR.md
│   ├── API_FIXES_COMPLETE.md
│   ├── AUDIT_CHANGES_REPORT.md
│   ├── AUDIT_PROGRESS_LOG.md
│   ├── broken_buttons.md
│   ├── check_admin.php
│   ├── check_settings.php
│   ├── check_users.php
│   ├── COMPLETE_DELIVERY_REPORT.md
│   ├── COMPLETE_QA_SCAN_REPORT.json
│   ├── DASHBOARD_FIX_REPORT.md
│   ├── Dashboard_Report.md
│   ├── debug_settings.php
│   ├── EMAIL_REPLIES_ACTIVATION_GUIDE.md
│   ├── EMAIL_REPLIES_GUIDE.md
│   ├── FINAL_ACHIEVEMENT_REPORT.md
│   ├── FINAL_API_REPORT.md
│   ├── FINAL_COMPLETE_REPORT.md
│   ├── FINAL_SYSTEM_REPORT.md
│   ├── FIX_REPORT.md
│   ├── FULL_QA_AUTOMATION_REPORT.md
│   ├── FULL_STACK_AUDIT_REPORT.md
│   ├── ICON_FIXES_REPORT.md
│   ├── IMPLEMENTATION_REPORT_REPLIES.md
│   ├── LINKS_STATUS.md
│   ├── LIVE_API_TEST_REPORT.md
│   ├── LOGIN_CREDENTIALS.md
│   ├── LOGIN_FIX_INSTRUCTIONS.md
│   ├── LOGIN_FIX_REPORT.md
│   ├── MEMBERSHIP_CARD_DOCUMENTATION.md
│   ├── MEMBERSHIP_CARD_QUICKSTART.md
│   ├── MEMBER_DASHBOARD_DELIVERY.md
│   ├── MEMBER_DASHBOARD_EXECUTIVE_SUMMARY.md
│   ├── MEMBER_DASHBOARD_QUICKSTART.md
│   ├── MEMBER_DASHBOARD_REPORT.md
│   ├── MEMBER_DASHBOARD_VISUAL_MAP.md
│   ├── MySQL
│   ├── MYSQL_FIX_GUIDE.md
│   ├── OTP_RECOVERY_FEATURE_REPORT.md
│   ├── populate_settings.php
│   ├── QA_AUTOMATION_REPORT.md
│   ├── QA_DOCUMENTATION_INDEX.md
│   ├── QA_EXECUTIVE_SUMMARY.md
│   ├── QA_FIXES.md
│   ├── QA_SCAN_DATA.json
│   ├── QUICK_START_OTP_FEATURE.md
│   ├── README.md
│   ├── REDESIGN_REPORT.md
│   ├── repair_verification.php
│   ├── reproduce_settings.php
│   ├── reset_admin.php
│   ├── RESPONSIVE_DESIGN_REPORT.md
│   ├── RESPONSIVE_IMPLEMENTATION.md
│   ├── run_migration.php
│   ├── SERVER_FIX.md
│   ├── SIDEBAR_UPDATE.md
│   ├── start-system.ps1
│   ├── START.bat
│   ├── Starting
│   ├── STARTUP_GUIDE.md
│   ├── start_system.bat
│   ├── SYSTEM_AUDIT_PLAN.md
│   ├── SYSTEM_COMPLETE_REPORT.md
│   ├── System_Evaluation_Report.md
│   ├── TESTING_GUIDE.md
│   ├── test_db_connection.php
│   ├── UI_IMPROVEMENT_PLAN.md
│   ├── ULTIMATE_FINAL_REPORT.md
│   ├── UPDATE_REPORT_MEMBERSHIP_LIST.md
│   ├── UPDATE_REPORT_USER_DETAIL.md
│   ├── UPDATE_REPORT_USER_EDIT.md
│   ├── URL
│   ├── ‏‏start_system.bat - اختصار.lnk
│   ├── backend/
│   │   ├── add_admin_role.php
│   │   ├── add_permissions.php
│   │   ├── api_test.php
│   │   ├── audit_api.php
│   │   ├── audit_database.php
│   │   ├── check_branding.php
│   │   ├── check_memberships_schema.php
│   │   ├── check_sessions_schema.php
│   │   ├── check_settings.php
│   │   ├── check_users_schema.php
│   │   ├── check_user_roles_schema.php
│   │   ├── composer.json
│   │   ├── composer.lock
│   │   ├── composer.phar
│   │   ├── create_admin.php
│   │   ├── create_admin_user.sql
│   │   ├── database.sqlite
│   │   ├── debug_db.php
│   │   ├── debug_login.php
│   │   ├── debug_schema.php
│   │   ├── describe_finance.php
│   │   ├── describe_memberships.php
│   │   ├── dump.php
│   │   ├── dump_finance.php
│   │   ├── final_verification.php
│   │   ├── fix_database_calls.php
│   │   ├── fix_database_tables.sql
│   │   ├── fix_password.php
│   │   ├── force_reset_test.php
│   │   ├── get_test_users.php
│   │   ├── get_users.php
│   │   ├── investigate_login.php
│   │   ├── list_columns.php
│   │   ├── list_columns_v2.php
│   │   ├── migrate_verification.php
│   │   ├── password_hash.txt
│   │   ├── quick_api_test.php
│   │   ├── quick_test.php
│   │   ├── router.php
│   │   ├── run_db_fix.php
│   │   ├── run_email_migration.php
│   │   ├── run_hardening_migration.php
│   │   ├── run_sql.php
│   │   ├── seed_data.php
│   │   ├── set_test_password.php
│   │   ├── sync_finance.php
│   │   ├── test.php
│   │   ├── test_api.php
│   │   ├── test_api_full.php
│   │   ├── test_create_sync.php
│   │   ├── test_dashboard.php
│   │   ├── test_email_replies.php
│   │   ├── test_finance_api.php
│   │   ├── test_imap_connection.php
│   │   ├── test_login.php
│   │   ├── test_login_script.php
│   │   ├── test_login_v2.php
│   │   ├── test_membership_api.php
│   │   ├── test_password.php
│   │   ├── test_perms.php
│   │   ├── test_reset_flow.php
│   │   ├── test_search.php
│   │   ├── test_search2.php
│   │   ├── test_users.php
│   │   ├── update_finance_schema.php
│   │   ├── update_membership_schema.php
│   │   ├── update_settings_db.php
│   │   ├── verify_ryan_pass.php
│   │   ├── app/
│   │   │   ├── Http/
│   │   │   │   ├── Controllers/
│   │   │   │   │   ├── Api/
│   │   │   │   │   │   ├── VerificationController.php
│   │   │   ├── Services/
│   │   │   │   ├── WasenderService.php
│   │   ├── database/
│   │   │   ├── complete_database_schema.sql
│   │   │   ├── create_missing_tables.sql
│   │   │   ├── database.sqlite
│   │   │   ├── backups/
│   │   │   ├── migrations/
│   │   │   │   ├── 001_full_schema.sql
│   │   │   │   ├── 002_password_reset_system.sql
│   │   │   │   ├── 003_member_dashboard_FINAL.sql
│   │   │   │   ├── 003_member_dashboard_tables.sql
│   │   │   │   ├── 003_member_dashboard_tables_simplified.sql
│   │   │   │   ├── 003_simple_tables.sql
│   │   │   │   ├── 004_check_support_tickets.sql
│   │   │   │   ├── 004_create_system_logs_table.sql
│   │   │   │   ├── 005_create_email_replies_table.sql
│   │   │   │   ├── 005_test_support_tickets.sql
│   │   │   │   ├── 006_fix_notifications_table.sql
│   │   │   │   ├── 007_complete_fix_all_tables.sql
│   │   │   │   ├── 008_new_core_tables.sql
│   │   │   │   ├── 01_hardening_schema.sql
│   │   │   │   ├── 2025_12_08_000001_create_verification_codes_table.php
│   │   │   │   ├── apply_db_fixes.php
│   │   │   │   ├── apply_memberships_db.php
│   │   │   │   ├── check_user.php
│   │   │   │   ├── create_email_replies_table.sql
│   │   │   │   ├── create_test_user.sql
│   │   │   │   ├── fix_activities_table.php
│   │   │   │   ├── fix_memberships_status.php
│   │   │   │   ├── fix_president_permissions.php
│   │   │   │   ├── fix_users_deleted_at.php
│   │   │   │   ├── fix_user_roles_expires_at.php
│   │   │   │   ├── new_tables_and_relationships.sql
│   │   │   │   ├── reset_password.php
│   │   │   │   ├── run_update.php
│   │   │   │   ├── seed_dev_user.sql
│   │   │   │   ├── update_roles_permissions.sql
│   │   │   ├── seeds/
│   │   │   │   ├── insert_default_settings.sql
│   │   ├── docs/
│   │   │   ├── openapi_member.json
│   │   ├── public/
│   │   │   ├── check_fin_schema.php
│   │   │   ├── check_imap.php
│   │   │   ├── check_pending_tx.php
│   │   │   ├── check_president_specific_perms.php
│   │   │   ├── check_real_status.php
│   │   │   ├── check_spons_cols.php
│   │   │   ├── check_spons_txs.php
│   │   │   ├── check_transactions.php
│   │   │   ├── clear-cache.php
│   │   │   ├── create_notifications_table.php
│   │   │   ├── debug_president_perms.php
│   │   │   ├── debug_sponsorships.php
│   │   │   ├── fix_notifs.php
│   │   │   ├── fix_packages.php
│   │   │   ├── fix_spons_table.php
│   │   │   ├── index.php
│   │   │   ├── list_tables.php
│   │   │   ├── list_users.php
│   │   │   ├── router.php
│   │   │   ├── seed_and_cleanup.php
│   │   │   ├── test_api_direct.php
│   │   │   ├── test_db.php
│   │   │   ├── test_email_replies.php
│   │   │   ├── test_memberships_db.php
│   │   │   ├── test_noti.php
│   │   │   ├── test_packages.php
│   │   │   ├── test_sponsor_db.php
│   │   │   ├── uploads/
│   │   │   │   ├── activities/
│   │   │   │   ├── branding/
│   │   │   │   │   ├── logo_1765313824.png
│   │   │   │   ├── posts/
│   │   │   │   ├── profiles/
│   │   │   │   │   ├── profiles_1772809364_1108818d0ba2e9bf.png
│   │   │   │   │   ├── profiles_1772809398_35fa051e7f931c70.png
│   │   │   │   │   ├── profiles_1772810545_4c457ff66b1c2270.jpg
│   │   │   │   │   ├── profiles_1772810629_8b99196abc11015a.jpg
│   │   │   │   │   ├── profiles_1772811370_d7639da371a29386.png
│   │   │   │   │   ├── profiles_1774059401_50cd33a8d55ca3a0.png
│   │   │   │   ├── receipts/
│   │   ├── scripts/
│   │   ├── src/
│   │   │   ├── Config/
│   │   │   │   ├── Database.php
│   │   │   ├── Controllers/
│   │   │   │   ├── AcademicResourceController.php
│   │   │   │   ├── ActivityController.php
│   │   │   │   ├── AuditLogController.php
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── ConversationController.php
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── EmailReplyController.php
│   │   │   │   ├── FinanceController.php
│   │   │   │   ├── FinancialTransactionController.php
│   │   │   │   ├── InternalMessageController.php
│   │   │   │   ├── MemberDashboardController.php
│   │   │   │   ├── MemberNotificationController.php
│   │   │   │   ├── MemberPaymentController.php
│   │   │   │   ├── MemberPostController.php
│   │   │   │   ├── MemberProfileController.php
│   │   │   │   ├── MembershipController.php
│   │   │   │   ├── NotificationController.php
│   │   │   │   ├── PostController.php
│   │   │   │   ├── ReportController.php
│   │   │   │   ├── ReportsController.php
│   │   │   │   ├── RoleController.php
│   │   │   │   ├── RolePermissionController.php
│   │   │   │   ├── SettingsController.php
│   │   │   │   ├── SponsorController.php
│   │   │   │   ├── SponsorshipController.php
│   │   │   │   ├── SupportTicketController.php
│   │   │   │   ├── UploadController.php
│   │   │   │   ├── UserController.php
│   │   │   │   ├── VerificationController.php
│   │   │   ├── Core/
│   │   │   │   ├── Database.php
│   │   │   │   ├── ExceptionHandler.php
│   │   │   │   ├── Request.php
│   │   │   │   ├── Router.php
│   │   │   ├── Exceptions/
│   │   │   │   ├── AuthenticationException.php
│   │   │   │   ├── AuthorizationException.php
│   │   │   │   ├── NotFoundException.php
│   │   │   │   ├── ValidationException.php
│   │   │   ├── Helpers/
│   │   │   │   ├── Logger.php
│   │   │   │   ├── NotificationHelper.php
│   │   │   │   ├── NumberHelper.php
│   │   │   │   ├── ResponseHelper.php
│   │   │   ├── Middleware/
│   │   │   │   ├── AuthMiddleware.php
│   │   │   │   ├── CorsMiddleware.php
│   │   │   │   ├── PermissionMiddleware.php
│   │   │   │   ├── RateLimitMiddleware.php
│   │   │   ├── Models/
│   │   │   ├── Repositories/
│   │   │   │   ├── ActivityRepository.php
│   │   │   │   ├── MembershipRepository.php
│   │   │   │   ├── UserRepository.php
│   │   │   ├── Routes/
│   │   │   │   ├── api.php
│   │   │   ├── Services/
│   │   │   │   ├── OtpService.php
│   │   │   │   ├── SystemLogger.php
│   │   │   │   ├── WasenderService.php
│   │   │   │   ├── Auth/
│   │   │   │   │   ├── AuthService.php
│   │   │   │   │   ├── JwtService.php
│   │   │   │   ├── Finance/
│   │   │   │   ├── User/
│   │   │   ├── Validators/
│   │   ├── storage/
│   │   │   ├── cache/
│   │   │   │   ├── rate_limits/
│   │   │   ├── logs/
│   │   │   │   ├── error.log
│   │   │   ├── rate_limits/
│   │   │   │   ├── 1ec27e7766f05a3451c22ecbefb17672.json
│   │   │   │   ├── 4ba9122b9eaf672525059eb6a8844b98.json
│   │   │   │   ├── 5d33f552f6478ce6f34bd73f48415462.json
│   │   │   ├── uploads/
│   │   │   │   ├── documents/
│   │   │   │   ├── profiles/
│   ├── database/
│   │   ├── migrations/
│   │   │   ├── create_posts_module_tables.sql
│   ├── docs/
│   │   ├── features_showcase.md
│   │   ├── USER_DETAIL_PAGE.md
│   │   ├── user_guide.md
│   │   ├── audit/
│   │   │   ├── api_map_member.md
│   │   │   ├── API_TESTING_GUIDE.md
│   │   │   ├── BACKEND_APIS_COMPLETE.md
│   │   │   ├── BACKEND_PROGRESS.md
│   │   │   ├── button_map_member.md
│   │   │   ├── db_gap_report.md
│   │   │   ├── ERRORS_AND_FIXES_AR.md
│   │   │   ├── FINAL_AUDIT_REPORT.md
│   │   │   ├── INDEX.md
│   │   │   ├── MIGRATION_SUCCESS_REPORT_AR.md
│   │   │   ├── SESSION_SUMMARY_20251214.md
│   │   │   ├── TROUBLESHOOTING_SUPPORT_TICKETS.md
│   │   │   ├── yemen-union-member-apis.postman_collection.json
│   ├── frontend/
│   │   ├── eslint.config.js
│   │   ├── index.html
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   ├── patch.js
│   │   ├── README.md
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.app.json
│   │   ├── tsconfig.json
│   │   ├── tsconfig.node.json
│   │   ├── tsc_b_errors.log
│   │   ├── tsc_errors.log
│   │   ├── tsc_errors_utf8.txt
│   │   ├── vite.config.ts
│   │   ├── public/
│   │   │   ├── favicon.ico
│   │   │   ├── logo.jpg
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── index.css
│   │   │   ├── main.tsx
│   │   │   ├── assets/
│   │   │   │   ├── react.svg
│   │   │   ├── components/
│   │   │   │   ├── ImageUpload.tsx
│   │   │   │   ├── MemberRoute.tsx
│   │   │   │   ├── NotificationBell.tsx
│   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   ├── activities/
│   │   │   │   │   ├── ActivityAnalyticsCard.tsx
│   │   │   │   │   ├── ActivityCalendarView.tsx
│   │   │   │   │   ├── ActivityFilters.tsx
│   │   │   │   │   ├── ActivityGallery.tsx
│   │   │   │   │   ├── FeedbackSection.tsx
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── OrganizerProfile.tsx
│   │   │   │   │   ├── RegistrationPanel.tsx
│   │   │   │   ├── auth/
│   │   │   │   │   ├── AuthRedirect.tsx
│   │   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   ├── Chat/
│   │   │   │   │   ├── FloatingChat.tsx
│   │   │   │   ├── common/
│   │   │   │   │   ├── Badge.tsx
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Card.tsx
│   │   │   │   │   ├── EmptyState.tsx
│   │   │   │   │   ├── GlobalSearch.tsx
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── Input.tsx
│   │   │   │   │   ├── Modal.tsx
│   │   │   │   │   ├── Skeleton.tsx
│   │   │   │   │   ├── Spinner.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── ChartComponents.tsx
│   │   │   │   │   ├── DashboardWidgets.tsx
│   │   │   │   │   ├── FirstLoginModal.tsx
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── KpiCard.tsx
│   │   │   │   │   ├── NotificationsSupport.tsx
│   │   │   │   │   ├── PostsList.tsx
│   │   │   │   │   ├── QuickActions.tsx
│   │   │   │   │   ├── StatusBanner.tsx
│   │   │   │   │   ├── SubscriptionCard.tsx
│   │   │   │   │   ├── UpcomingActivitiesList.tsx
│   │   │   │   ├── frontend/
│   │   │   │   │   ├── src/
│   │   │   │   │   │   ├── components/
│   │   │   │   │   │   │   ├── Chat/
│   │   │   │   ├── layout/
│   │   │   │   │   ├── AdminLayout.tsx
│   │   │   │   │   ├── BackgroundWatermark.tsx
│   │   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   │   ├── MemberLayout.tsx
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── settings/
│   │   │   │   │   ├── RolesManager.tsx
│   │   │   │   ├── users/
│   │   │   │   │   ├── UserRoleManager.tsx
│   │   │   ├── contexts/
│   │   │   │   ├── AuthContext.tsx
│   │   │   │   ├── BrandingContext.tsx
│   │   │   │   ├── PermissionsContext.tsx
│   │   │   │   ├── ThemeContext.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── usePermission.ts
│   │   │   ├── pages/
│   │   │   │   ├── activities/
│   │   │   │   │   ├── ActivitiesList.tsx
│   │   │   │   │   ├── ActivityCreate.tsx
│   │   │   │   │   ├── ActivityDetail.tsx
│   │   │   │   │   ├── ActivityEdit.tsx
│   │   │   │   │   ├── ActivityForm.tsx
│   │   │   │   │   ├── ActivityList.tsx
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── MemberActivities.tsx
│   │   │   │   ├── auth/
│   │   │   │   │   ├── ForgotPassword.tsx
│   │   │   │   │   ├── Login.tsx
│   │   │   │   │   ├── Login_NEW.tsx
│   │   │   │   │   ├── Register.tsx
│   │   │   │   ├── calendar/
│   │   │   │   │   ├── index.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   ├── MemberDashboard.tsx
│   │   │   │   ├── email-replies/
│   │   │   │   │   ├── EmailRepliesList.tsx
│   │   │   │   │   ├── index.ts
│   │   │   │   ├── finance/
│   │   │   │   │   ├── index.tsx
│   │   │   │   ├── membership/
│   │   │   │   │   ├── MembershipCard.tsx
│   │   │   │   │   ├── MembershipRenewal.tsx
│   │   │   │   │   ├── PaymentProofUpload.tsx
│   │   │   │   ├── memberships/
│   │   │   │   │   ├── MembershipCreate.tsx
│   │   │   │   │   ├── MembershipDetail.tsx
│   │   │   │   │   ├── MembershipEdit.tsx
│   │   │   │   │   ├── MembershipList.tsx
│   │   │   │   │   ├── MembershipsList.tsx
│   │   │   │   ├── notifications/
│   │   │   │   │   ├── Notifications.tsx
│   │   │   │   ├── payments/
│   │   │   │   │   ├── PaymentHistory.tsx
│   │   │   │   ├── posts/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── MediaLibrary.tsx
│   │   │   │   │   ├── PostCreate.tsx
│   │   │   │   │   ├── PostDetail.tsx
│   │   │   │   │   ├── PostEdit.tsx
│   │   │   │   │   ├── PostShow.tsx
│   │   │   │   │   ├── PostsList.tsx
│   │   │   │   ├── profile/
│   │   │   │   │   ├── ProfileEdit.tsx
│   │   │   │   ├── relations/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── SupporterCreate.tsx
│   │   │   │   │   ├── SupporterDetail.tsx
│   │   │   │   │   ├── SupporterEdit.tsx
│   │   │   │   │   ├── SupporterList.tsx
│   │   │   │   │   ├── SupportVisitCreate.tsx
│   │   │   │   │   ├── SupportVisitDetail.tsx
│   │   │   │   │   ├── SupportVisitEdit.tsx
│   │   │   │   │   ├── SupportVisitList.tsx
│   │   │   │   ├── reports/
│   │   │   │   │   ├── index.tsx
│   │   │   │   ├── roles/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── RolesList.tsx
│   │   │   │   ├── settings/
│   │   │   │   │   ├── index.tsx
│   │   │   │   ├── support/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── SupportTicketCreate.tsx
│   │   │   │   │   ├── SupportTicketsList.tsx
│   │   │   │   ├── users/
│   │   │   │   │   ├── UserCreate.tsx
│   │   │   │   │   ├── UserDetail.tsx
│   │   │   │   │   ├── UserEdit.tsx
│   │   │   │   │   ├── UserList.tsx
│   │   │   ├── services/
│   │   │   │   ├── api.ts
│   │   │   │   ├── authService.ts
│   │   │   │   ├── memberDashboardService.ts
│   │   │   │   ├── posts.ts
│   │   │   ├── styles/
│   │   │   │   ├── pages.css
│   │   │   │   ├── posts.css
│   │   │   │   ├── user-edit.css
│   │   │   ├── types/
│   │   │   │   ├── index.ts
│   │   │   │   ├── posts.ts
│   │   │   ├── utils/
│   │   │   │   ├── formatters.ts
│   │   │   │   ├── images.ts
│   │   │   │   ├── permissions.ts
│   │   │   ├── __tests__/
│   │   │   │   ├── smoke/
│   │   │   │   │   ├── member-dashboard.spec.ts
│   ├── reports_design/
│   │   ├── report.css
│   │   ├── report_template.html
```