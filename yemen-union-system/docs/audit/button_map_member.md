# BUTTON MAP - MEMBER HOME DASHBOARD + MEMBER PAGE
**Generated**: 2025-12-14 22:13 UTC+3  
**Auditor**: Full-Stack Auditor Agent  
**Pages Audited**: Member Home Dashboard (`MemberDashboard.tsx`) + Member Profile Edit (`ProfileEdit.tsx`)

---

## PAGE 1: MEMBER HOME DASHBOARD (`/` or `/member-dashboard`)
**File**: `frontend/src/pages/dashboard/MemberDashboard.tsx`

### SECTION 1: HEADER IDENTITY
| # | Element | Label/Icon | Behavior | Implementation | API/Route | Permission | Data Needed | Status |
|---|---------|------------|----------|----------------|-----------|------------|-------------|--------|
| 1.1 | Button | "عرض بطاقة العضوية" | Navigate to membership card | `onClick={() => navigate('/membership/card')}` | `/membership/card` | Member (authenticated) | - | ✅ OK |
| 1.2 | Button | "تسجيل خروج" | Logout user | `onClick={handleLogout}` | Calls `logout()` from AuthContext | Member (authenticated) | - | ✅ OK |
| 1.3 | Button | 🔒 (Lock icon) | Logout from all devices | `onClick={handleLogoutAllDevices}` | `memberDashboardService.logoutAllDevices()` | Member (authenticated) | - | ⚠️ MISSING_API |

### SECTION 2: KPI CARDS (6 cards)
| # | Element | Label/Icon | Behavior | Implementation | API/Route | Permission | Data Needed | Status |
|---|---------|------------|----------|----------------|-----------|------------|-------------|--------|
| 2.1 | KPI Card | 💰 "حالة الاشتراك" | Display subscription status | Display only | - | - | `kpis.subscription_status` | ✅ OK |
| 2.2 | KPI Card | 📅 "تاريخ انتهاء الاشتراك" | Display expiry date | Display only | - | - | `kpis.subscription_expiry`, `kpis.days_remaining` | ✅ OK |
| 2.3 | KPI Card (Clickable) | 🎫 "الأنشطة القادمة" | Navigate to activities | `onClick={() => navigate('/activities')}` | `/activities` | Member (authenticated) | `kpis.upcoming_activities_count` | ⚠️ ROUTE_BLOCKED (admin only) |
| 2.4 | KPI Card (Clickable) | 🔔 "إشعارات غير مقروءة" | Navigate to notifications | `onClick={() => navigate('/notifications')}` | `/notifications` | Member (authenticated) | `kpis.unread_notifications_count` | ✅ OK |
| 2.5 | KPI Card (Clickable) | 📰 "منشورات جديدة" | Navigate to posts | `onClick={() => navigate('/posts')}` | `/posts` | Member (authenticated) | `kpis.new_posts_count` | ⚠️ ROUTE_BLOCKED (admin only) |
| 2.6 | KPI Card | 📄 "مستندات ناقصة" | Display missing documents count | Display only | - | - | `kpis.missing_documents_count` | ✅ OK |

### SECTION 3: QUICK ACTIONS (8 buttons)
| # | Element | Label/Icon | Behavior | Implementation | API/Route | Permission | Data Needed | Status |
|---|---------|------------|----------|----------------|-----------|------------|-------------|--------|
| 3.1 | Button | 💳 "تجديد الاشتراك" | Navigate to renewal page | `navigate('/memberships/renew')` | `/memberships/renew` | Member (authenticated) | - | ✅ OK |
| 3.2 | Button | 📄 "رفع إثبات دفع" | Navigate to payment proof upload | `navigate('/memberships/payment-proof')` | `/memberships/payment-proof` | Member (authenticated) | - | ✅ OK |
| 3.3 | Button | ✏️ "تحديث بياناتي" | Navigate to profile edit | `navigate('/profile/edit')` | `/profile/edit` | Member (authenticated) | - | ✅ OK |
| 3.4 | Button | 🎫 "الأنشطة والفعاليات" | Navigate to member activities | `navigate('/member/activities')` | `/member/activities` | Member (authenticated) | - | ✅ OK |
| 3.5 | Button | 📅 "التقويم" | Navigate to calendar | `navigate('/calendar')` | `/calendar` | Member (authenticated) | - | ✅ OK |
| 3.6 | Button | 💬 "الدعم / تذكرة جديدة" | Navigate to support ticket creation | `navigate('/support/new')` | `/support/new` | Member (authenticated) | - | ✅ OK |
| 3.7 | Button | 🎴 "تحميل بطاقة العضو PDF" | Navigate to membership card | `navigate('/membership/card')` | `/membership/card` | Member (authenticated) | - | ✅ OK |
| 3.8 | Button (Conditional) | 📱 "تواصل واتساب مع الإدارة" | Open WhatsApp in new tab | `window.open(whatsappLink, '_blank')` | External link | Member (authenticated) | `whatsappNumber` | ✅ OK |

### SECTION 4: SUBSCRIPTION CARD
| # | Element | Label/Icon | Behavior | Implementation | API/Route | Permission | Data Needed | Status |
|---|---------|------------|----------|----------------|-----------|------------|-------------|--------|
| 4.1 | Button | "رفع إثبات دفع" OR "إعادة رفع الإثبات" | Navigate to payment proof upload | `onClick={onUploadProof}` → `navigate('/payments/upload-proof')` | `/payments/upload-proof` | Member (authenticated) | - | ⚠️ WRONG_ROUTE (should be `/memberships/payment-proof`) |
| 4.2 | Button | "عرض سجل المدفوعات" | Navigate to payment history | `onClick={onViewHistory}` → `navigate('/payments/history')` | `/payments/history` | Member (authenticated) | - | ✅ OK |

### SECTION 5: UPCOMING ACTIVITIES LIST
| # | Element | Label/Icon | Behavior | Implementation | API/Route | Permission | Data Needed | Status |
|---|---------|------------|----------|----------------|-----------|------------|-------------|--------|
| 5.1 | Button (per activity) | "تفاصيل" | Navigate to activity details | `navigate(\`/activities/${activity.id}\`)` | `/activities/:id` | Member (authenticated) | `activity.id` | ⚠️ ROUTE_BLOCKED (admin only) |
| 5.2 | Button (conditional) | "سجّل حضورك" | Check-in to activity | `onClick` handler (placeholder) | - | Member (authenticated) | `activity.id` | ❌ NO_HANDLER |
| 5.3 | Button (conditional) | "تسجيل" OR "إلغاء التسجيل" | Register/unregister for activity | `handleRegister(activityId, isRegistered)` | - | Member (authenticated) | `activity.id`, `activity.is_registered` | ⚠️ MISSING_API |
| 5.4 | Button | "عرض كل الأنشطة →" | Navigate to all activities | `onClick={onViewAll}` → `navigate('/activities')` | `/activities` | Member (authenticated) | - | ⚠️ ROUTE_BLOCKED (admin only) |

### SECTION 6: POSTS LIST
| # | Element | Label/Icon | Behavior | Implementation | API/Route | Permission | Data Needed | Status |
|---|---------|------------|----------|----------------|-----------|------------|-------------|--------|
| 6.1 | Filter Button | "الكل" | Filter posts by all categories | `onClick={() => setFilter('all')}` | - | - | - | ✅ OK |
| 6.2 | Filter Button | "إعلانات" | Filter posts by announcements | `onClick={() => setFilter('announcement')}` | - | - | - | ✅ OK |
| 6.3 | Filter Button | "فعاليات" | Filter posts by events | `onClick={() => setFilter('event')}` | - | - | - | ✅ OK |
| 6.4 | Filter Button | "تنبيهات مالية" | Filter posts by financial alerts | `onClick={() => setFilter('financial_alert')}` | - | - | - | ✅ OK |
| 6.5 | Post Item (clickable) | Post title | Navigate to post details | `onClick={() => navigate(\`/posts/${post.id}\`)}` | `/posts/:id` | Member (authenticated) | `post.id` | ⚠️ ROUTE_BLOCKED (admin only) |
| 6.6 | Button | "عرض كل المنشورات →" | Navigate to all posts | `onClick={onViewAll}` → `navigate('/posts')` | `/posts` | Member (authenticated) | - | ⚠️ ROUTE_BLOCKED (admin only) |

### SECTION 7: NOTIFICATIONS & SUPPORT
| # | Element | Label/Icon | Behavior | Implementation | API/Route | Permission | Data Needed | Status |
|---|---------|------------|----------|----------------|-----------|------------|-------------|--------|
| 7.1 | Notification Item (clickable) | Notification title | Navigate to action URL | `onClick={() => navigate(notification.action_url)}` | `notification.action_url` | Member (authenticated) | `notification.action_url` | ✅ OK |
| 7.2 | Button | "عرض كل الإشعارات →" | Navigate to all notifications | `onClick={onViewAllNotifications}` → `navigate('/notifications')` | `/notifications` | Member (authenticated) | - | ✅ OK |
| 7.3 | Button | "تواصل مع الإدارة" | Open support form | `onClick={() => setShowSupportForm(true)}` | - | - | - | ✅ OK |
| 7.4 | Form Submit Button | "إرسال" | Submit support ticket | `onSubmit={handleSupportSubmit}` | - | Member (authenticated) | `supportSubject`, `supportMessage`, `supportFile` | ⚠️ MISSING_API |
| 7.5 | Button | "إلغاء" | Close support form | `onClick={() => setShowSupportForm(false)}` | - | - | - | ✅ OK |
| 7.6 | FAQ Item (details/summary) | FAQ question | Expand/collapse answer | Native `<details>` element | - | - | - | ✅ OK |

---

## PAGE 2: MEMBER PROFILE EDIT (`/profile/edit`)
**File**: `frontend/src/pages/profile/ProfileEdit.tsx`

### SECTION 1: PAGE HEADER
| # | Element | Label/Icon | Behavior | Implementation | API/Route | Permission | Data Needed | Status |
|---|---------|------------|----------|----------------|-----------|------------|-------------|--------|
| 8.1 | Button | "العودة لحسابي" | Navigate back to settings | `onClick={handleBack}` → `navigate('/settings')` | `/settings` | Member (authenticated) | - | ⚠️ ROUTE_BLOCKED (president only) |

### SECTION 2: TABS
| # | Element | Label/Icon | Behavior | Implementation | API/Route | Permission | Data Needed | Status |
|---|---------|------------|----------|----------------|-----------|------------|-------------|--------|
| 8.2 | Tab Button | 📝 "المعلومات الشخصية" | Switch to profile tab | `onClick={() => setActiveTab('profile')}` | - | - | - | ✅ OK |
| 8.3 | Tab Button | 🔒 "تغيير كلمة المرور" | Switch to password tab | `onClick={() => setActiveTab('password')}` | - | - | - | ✅ OK |

### SECTION 3: PROFILE TAB
| # | Element | Label/Icon | Behavior | Implementation | API/Route | Permission | Data Needed | Status |
|---|---------|------------|----------|----------------|-----------|------------|-------------|--------|
| 8.4 | File Input | "الصورة الشخصية" | Upload profile photo | `onChange={handlePhotoChange}` | - | - | File (image) | ✅ OK (client-side validation) |
| 8.5 | Form Submit Button | ✓ "حفظ التغييرات" | Submit profile update | `onSubmit={handleProfileSubmit}` | - | Member (authenticated) | `full_name`, `email`, `city`, `university`, `faculty`, `profile_photo` | ⚠️ MISSING_API |
| 8.6 | Button | "إلغاء" | Navigate back to settings | `onClick={handleBack}` → `navigate('/settings')` | `/settings` | Member (authenticated) | - | ⚠️ ROUTE_BLOCKED (president only) |

### SECTION 4: PASSWORD TAB
| # | Element | Label/Icon | Behavior | Implementation | API/Route | Permission | Data Needed | Status |
|---|---------|------------|----------|----------------|-----------|------------|-------------|--------|
| 8.7 | Form Submit Button | ✓ "تغيير كلمة المرور" | Submit password change | `onSubmit={handlePasswordSubmit}` | - | Member (authenticated) | `current_password`, `new_password`, `confirm_password` | ⚠️ MISSING_API |
| 8.8 | Button | "إعادة تعيين" | Reset password form fields | `onClick={() => setPasswordData({...})` | - | - | - | ✅ OK |

---

## SUMMARY OF ISSUES

### 🔴 CRITICAL ISSUES (Must Fix)
1. **ROUTE_BLOCKED**: Members cannot access `/activities`, `/posts`, `/settings` - these are admin-only routes but referenced in member dashboard
2. **MISSING_API**: No backend API for:
   - Logout from all devices
   - Activity registration/unregistration
   - Support ticket submission
   - Profile update
   - Password change
3. **WRONG_ROUTE**: Subscription card uses `/payments/upload-proof` but should use `/memberships/payment-proof`

### ⚠️ MEDIUM ISSUES (Should Fix)
1. **NO_HANDLER**: "سجّل حضورك" button has no implementation
2. **MOCK_DATA**: Dashboard loads mock data instead of real API calls

### 📊 BUTTON COUNT
- **Total Interactive Elements**: 42
- **OK**: 25 (59.5%)
- **MISSING_API**: 5 (11.9%)
- **ROUTE_BLOCKED**: 7 (16.7%)
- **WRONG_ROUTE**: 1 (2.4%)
- **NO_HANDLER**: 1 (2.4%)
- **Other Issues**: 3 (7.1%)

---

**Next Steps**: See `api_map_member.md` for required API implementations and `db_gap_report.md` for database changes.
