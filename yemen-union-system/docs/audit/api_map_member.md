# API MAP - MEMBER ENDPOINTS
**Generated**: 2025-12-14 22:14 UTC+3  
**Auditor**: Full-Stack Auditor Agent  
**Scope**: All APIs needed for Member Home Dashboard + Member Profile Edit

---

## EXISTING APIS (From `backend/src/Routes/api.php`)

### ✅ AUTHENTICATION APIS
| Endpoint | Method | Controller | Auth Required | Role Required | Request Schema | Response Schema | Used By | Status |
|----------|--------|------------|---------------|---------------|----------------|-----------------|---------|--------|
| `/api/auth/me` | GET | `AuthController::me` | ✅ Yes | Any authenticated | - | `{ user: {...}, roles: [...] }` | MemberDashboard (user context) | ✅ EXISTS |
| `/api/auth/logout` | POST | `AuthController::logout` | ✅ Yes | Any authenticated | - | `{ success: true }` | MemberDashboard (logout button) | ✅ EXISTS |
| `/api/auth/change-password` | POST | `AuthController::changePassword` | ✅ Yes | Any authenticated | `{ current_password, new_password }` | `{ success: true }` | ProfileEdit (password tab) | ✅ EXISTS |

### ✅ MEMBERSHIP APIS
| Endpoint | Method | Controller | Auth Required | Role Required | Request Schema | Response Schema | Used By | Status |
|----------|--------|------------|---------------|---------------|----------------|-----------------|---------|--------|
| `/api/memberships/my` | GET | `MembershipController::myMembership` | ✅ Yes | Any authenticated | - | `{ subscription: {...} }` | MemberDashboard (subscription card) | ✅ EXISTS |
| `/api/memberships/packages` | GET | `MembershipController::packages` | ✅ Yes | Any authenticated | - | `{ packages: [...] }` | MembershipRenewal | ✅ EXISTS |

### ✅ ACTIVITY APIS
| Endpoint | Method | Controller | Auth Required | Role Required | Request Schema | Response Schema | Used By | Status |
|----------|--------|------------|---------------|---------------|----------------|-----------------|---------|--------|
| `/api/activities` | GET | `ActivityController::index` | ✅ Yes | Any authenticated | `?status=published` | `{ activities: [...] }` | MemberDashboard (upcoming activities) | ✅ EXISTS |
| `/api/activities/{id}` | GET | `ActivityController::show` | ✅ Yes | Any authenticated | - | `{ activity: {...} }` | ActivityDetail | ✅ EXISTS |
| `/api/activities/{id}/register` | POST | `ActivityController::register` | ✅ Yes | Any authenticated | - | `{ success: true, registration: {...} }` | UpcomingActivitiesList (register button) | ✅ EXISTS |

---

## ❌ MISSING APIS (Must Implement)

### 1. MEMBER DASHBOARD API
**Endpoint**: `GET /api/member/dashboard`  
**Controller**: NEW - `MemberDashboardController::index`  
**Auth**: Required (member only)  
**Role**: Any authenticated user  
**Request**: None  
**Response**:
```json
{
  "success": true,
  "data": {
    "member": {
      "id": 1,
      "full_name": "عبدالله أحمد",
      "phone_number": "05XXXXXXXXX",
      "email": "email@example.com",
      "profile_photo": "/uploads/photos/...",
      "member_id": "MEM-2025-001",
      "branch": "أرضروم – تركيا",
      "join_date": "2024-01-15",
      "last_login_at": "2025-12-14T22:00:00Z",
      "account_status": "active",
      "city": "أرضروم",
      "university": "جامعة أتاتورك",
      "faculty": "كلية الهندسة"
    },
    "kpis": {
      "subscription_status": "paid",
      "subscription_expiry": "2025-12-31",
      "days_remaining": 350,
      "upcoming_activities_count": 3,
      "unread_notifications_count": 5,
      "new_posts_count": 2,
      "missing_documents_count": 0
    },
    "subscription": {
      "id": 1,
      "status": "active",
      "start_date": "2025-01-01",
      "end_date": "2025-12-31",
      "package_name": "اشتراك سنوي",
      "amount": 500,
      "currency": "TRY",
      "is_paid": true,
      "days_until_expiry": 350,
      "payment_proof": {
        "status": "approved",
        "uploaded_at": "2025-01-01",
        "rejection_reason": null
      },
      "last_payment": {
        "amount": 500,
        "currency": "TRY",
        "payment_date": "2025-01-01",
        "status": "approved"
      }
    },
    "upcomingActivities": [
      {
        "id": 1,
        "title_ar": "نشاط ثقافي",
        "description_ar": "وصف النشاط",
        "activity_date": "2025-12-20",
        "start_time": "18:00",
        "location_ar": "مركز الاتحاد",
        "max_participants": 50,
        "participant_count": 25,
        "registration_required": true,
        "is_registered": false
      }
    ],
    "recentPosts": [
      {
        "id": 1,
        "title": "إعلان هام",
        "excerpt": "نص مختصر للمنشور...",
        "category": "announcement",
        "created_at": "2025-12-10",
        "author_name": "الإدارة",
        "is_read": false
      }
    ],
    "notifications": [
      {
        "id": 1,
        "type": "info",
        "title": "تذكير",
        "message": "رسالة الإشعار",
        "action_url": "/memberships/renew",
        "created_at": "2025-12-14"
      }
    ],
    "isFirstLogin": false
  }
}
```
**Used By**: `MemberDashboard.tsx` (main data source)  
**Priority**: 🔴 CRITICAL

---

### 2. MEMBER PROFILE UPDATE API
**Endpoint**: `PUT /api/member/profile`  
**Controller**: NEW - `MemberProfileController::update`  
**Auth**: Required (member only)  
**Role**: Any authenticated user  
**Request** (multipart/form-data):
```json
{
  "full_name": "عبدالله أحمد",
  "email": "email@example.com",
  "city": "أرضروم",
  "university": "جامعة أتاتورك",
  "faculty": "كلية الهندسة",
  "profile_photo": "<File>"
}
```
**Response**:
```json
{
  "success": true,
  "message": "تم تحديث البيانات بنجاح",
  "data": {
    "user": {
      "id": 1,
      "full_name": "عبدالله أحمد",
      "email": "email@example.com",
      "city": "أرضروم",
      "university": "جامعة أتاتورك",
      "faculty": "كلية الهندسة",
      "profile_photo": "/uploads/photos/..."
    }
  }
}
```
**Validation**:
- `full_name`: required, string, max:255
- `email`: optional, email, unique (except current user)
- `city`: required, string, max:100
- `university`: optional, string, max:255
- `faculty`: optional, string, max:255
- `profile_photo`: optional, file, mimes:jpg,jpeg,png,webp, max:2048KB

**Used By**: `ProfileEdit.tsx` (profile tab submit)  
**Priority**: 🔴 CRITICAL

---

### 3. LOGOUT ALL DEVICES API
**Endpoint**: `POST /api/auth/logout-all-devices`  
**Controller**: `AuthController::logoutAllDevices`  
**Auth**: Required (member only)  
**Role**: Any authenticated user  
**Request**: None  
**Response**:
```json
{
  "success": true,
  "message": "تم تسجيل الخروج من جميع الأجهزة",
  "data": {
    "revoked_sessions_count": 3
  }
}
```
**Implementation**:
- Revoke all sessions for the current user except the current session
- Update `sessions.revoked_at` for all user sessions
- Return count of revoked sessions

**Used By**: `MemberDashboard.tsx` (lock icon button)  
**Priority**: 🟡 MEDIUM

---

### 4. ACTIVITY UNREGISTER API
**Endpoint**: `POST /api/activities/{id}/unregister`  
**Controller**: `ActivityController::unregister`  
**Auth**: Required (member only)  
**Role**: Any authenticated user  
**Request**: None  
**Response**:
```json
{
  "success": true,
  "message": "تم إلغاء التسجيل بنجاح",
  "data": {
    "activity_id": 1,
    "user_id": 1
  }
}
```
**Implementation**:
- Delete record from `activity_participants` where `activity_id` = {id} AND `user_id` = current user
- Ensure user can only unregister themselves
- Check if activity allows unregistration (e.g., not past deadline)

**Used By**: `UpcomingActivitiesList.tsx` (unregister button)  
**Priority**: 🟡 MEDIUM

---

### 5. ACTIVITY CHECK-IN API
**Endpoint**: `POST /api/activities/{id}/checkin`  
**Controller**: `ActivityController::checkIn`  
**Auth**: Required (member only)  
**Role**: Any authenticated user (member can check-in themselves)  
**Request**: None  
**Response**:
```json
{
  "success": true,
  "message": "تم تسجيل حضورك بنجاح",
  "data": {
    "activity_id": 1,
    "user_id": 1,
    "checked_in_at": "2025-12-14T18:30:00Z",
    "attendance_status": "attended"
  }
}
```
**Implementation**:
- Update `activity_participants` set `attendance_status` = 'attended', `checked_in_at` = NOW()
- Only allow check-in on the day of the activity
- Only allow check-in if user is registered

**Used By**: `UpcomingActivitiesList.tsx` (check-in button)  
**Priority**: 🟡 MEDIUM

---

### 6. SUPPORT TICKET CREATE API
**Endpoint**: `POST /api/support/tickets`  
**Controller**: NEW - `SupportTicketController::store`  
**Auth**: Required (member only)  
**Role**: Any authenticated user  
**Request** (multipart/form-data):
```json
{
  "subject": "موضوع التذكرة",
  "message": "رسالة التذكرة",
  "attachment": "<File>"
}
```
**Response**:
```json
{
  "success": true,
  "message": "تم إرسال رسالتك بنجاح. سنتواصل معك قريباً",
  "data": {
    "ticket": {
      "id": 1,
      "ticket_number": "TKT-2025-001",
      "subject": "موضوع التذكرة",
      "status": "open",
      "created_at": "2025-12-14T22:00:00Z"
    }
  }
}
```
**Validation**:
- `subject`: required, string, max:255
- `message`: required, string, max:5000
- `attachment`: optional, file, mimes:jpg,jpeg,png,pdf,doc,docx, max:5120KB

**Database**: Requires new `support_tickets` table (see `db_gap_report.md`)

**Used By**: `NotificationsSupport.tsx` (support form submit)  
**Priority**: 🟡 MEDIUM

---

### 7. PAYMENT PROOF UPLOAD API
**Endpoint**: `POST /api/memberships/payment-proof`  
**Controller**: `MembershipController::uploadPaymentProof`  
**Auth**: Required (member only)  
**Role**: Any authenticated user  
**Request** (multipart/form-data):
```json
{
  "membership_id": 1,
  "proof_image": "<File>",
  "notes": "ملاحظات اختيارية"
}
```
**Response**:
```json
{
  "success": true,
  "message": "تم رفع إثبات الدفع بنجاح. سيتم مراجعته قريباً",
  "data": {
    "payment_proof": {
      "id": 1,
      "membership_id": 1,
      "proof_image_url": "/uploads/proofs/...",
      "status": "pending",
      "uploaded_at": "2025-12-14T22:00:00Z"
    }
  }
}
```
**Validation**:
- `membership_id`: required, exists in memberships table, belongs to current user
- `proof_image`: required, file, mimes:jpg,jpeg,png,pdf, max:5120KB
- `notes`: optional, string, max:500

**Database**: Requires new `payment_proofs` table (see `db_gap_report.md`)

**Used By**: `PaymentProofUpload.tsx`, `SubscriptionCard.tsx`  
**Priority**: 🔴 CRITICAL

---

### 8. PAYMENT HISTORY API
**Endpoint**: `GET /api/member/payments/history`  
**Controller**: NEW - `MemberPaymentController::history`  
**Auth**: Required (member only)  
**Role**: Any authenticated user  
**Request**: Query params: `?page=1&limit=20`  
**Response**:
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": 1,
        "membership_id": 1,
        "amount": 500,
        "currency": "TRY",
        "payment_method": "bank_transfer",
        "payment_date": "2025-01-01",
        "status": "approved",
        "proof_image_url": "/uploads/proofs/...",
        "notes": "ملاحظات",
        "approved_by": "أحمد محمد",
        "approved_at": "2025-01-02"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 1,
      "per_page": 20
    }
  }
}
```
**Implementation**:
- Fetch all payment proofs for current user's memberships
- Order by payment_date DESC
- Include pagination

**Used By**: `PaymentHistory.tsx`, `SubscriptionCard.tsx`  
**Priority**: 🟡 MEDIUM

---

### 9. MEMBER NOTIFICATIONS API
**Endpoint**: `GET /api/member/notifications`  
**Controller**: NEW - `MemberNotificationController::index`  
**Auth**: Required (member only)  
**Role**: Any authenticated user  
**Request**: Query params: `?page=1&limit=20&unread_only=false`  
**Response**:
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "type": "info",
        "title": "تذكير",
        "message": "رسالة الإشعار",
        "action_url": "/memberships/renew",
        "is_read": false,
        "created_at": "2025-12-14T22:00:00Z"
      }
    ],
    "unread_count": 5,
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 5,
      "per_page": 20
    }
  }
}
```
**Database**: Requires new `notifications` table (see `db_gap_report.md`)

**Used By**: `NotificationsSupport.tsx`, `Notifications.tsx`  
**Priority**: 🟡 MEDIUM

---

### 10. MEMBER POSTS API (Read-Only)
**Endpoint**: `GET /api/member/posts`  
**Controller**: NEW - `MemberPostController::index`  
**Auth**: Required (member only)  
**Role**: Any authenticated user  
**Request**: Query params: `?category=all&page=1&limit=20`  
**Response**:
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 1,
        "title": "إعلان هام",
        "excerpt": "نص مختصر للمنشور...",
        "category": "announcement",
        "created_at": "2025-12-10",
        "author_name": "الإدارة",
        "is_read": false
      }
    ],
    "new_posts_count": 2,
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 10,
      "per_page": 20
    }
  }
}
```
**Database**: Requires `post_reads` table to track which posts member has read (see `db_gap_report.md`)

**Used By**: `PostsList.tsx`, member posts page  
**Priority**: 🟡 MEDIUM

---

## 🔒 SECURITY & PERMISSIONS

### CRITICAL SECURITY RULES
1. **Member Scope Enforcement**:
   - ALL member APIs MUST restrict data to the authenticated user's `user_id` from JWT token
   - NEVER trust `user_id` or `member_id` from request body/query params
   - Example: `WHERE user_id = $currentUserId` (from JWT)

2. **Role-Based Access Control**:
   - Member APIs should NOT require admin permissions
   - Use middleware: `['middleware' => ['auth']]` (no role restriction)
   - Members should NOT be able to access admin-only routes

3. **Input Validation**:
   - Validate ALL inputs server-side
   - Sanitize file uploads (check MIME type, size, extension)
   - Use prepared statements to prevent SQL injection

4. **Rate Limiting**:
   - Implement rate limiting on sensitive endpoints (e.g., support ticket creation)
   - Prevent abuse of file upload endpoints

5. **Error Handling**:
   - Return consistent error format:
     ```json
     {
       "success": false,
       "message": "رسالة الخطأ",
       "error": {
         "code": "ERROR_CODE",
         "details": {...}
       }
     }
     ```
   - Log all errors server-side
   - Never expose sensitive information in error messages

---

## 📊 API SUMMARY

### Existing APIs
- **Total**: 8
- **Authentication**: 3
- **Membership**: 2
- **Activity**: 3

### Missing APIs
- **Total**: 10
- **Critical Priority**: 3
- **Medium Priority**: 7

### Implementation Order (Priority)
1. 🔴 `GET /api/member/dashboard` (main data source)
2. 🔴 `PUT /api/member/profile` (profile update)
3. 🔴 `POST /api/memberships/payment-proof` (payment proof upload)
4. 🟡 `GET /api/member/payments/history` (payment history)
5. 🟡 `POST /api/support/tickets` (support tickets)
6. 🟡 `POST /api/activities/{id}/unregister` (activity unregister)
7. 🟡 `POST /api/activities/{id}/checkin` (activity check-in)
8. 🟡 `GET /api/member/notifications` (notifications)
9. 🟡 `GET /api/member/posts` (posts read-only)
10. 🟡 `POST /api/auth/logout-all-devices` (logout all devices)

---

**Next Steps**: See `db_gap_report.md` for required database tables/columns and migration scripts.
