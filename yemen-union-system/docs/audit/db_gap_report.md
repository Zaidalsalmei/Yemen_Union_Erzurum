# DATABASE GAP REPORT - MEMBER SYSTEM
**Generated**: 2025-12-14 22:15 UTC+3  
**Auditor**: Full-Stack Auditor Agent  
**Database**: MySQL (utf8mb4)  
**Scope**: Tables/columns needed for Member Home Dashboard + Member APIs

---

## EXISTING SCHEMA ANALYSIS

### ✅ EXISTING TABLES (From `complete_database_schema.sql`)
1. `users` - User accounts ✅
2. `roles` - User roles ✅
3. `permissions` - Permissions ✅
4. `user_roles` - User-role mapping ✅
5. `role_permissions` - Role-permission mapping ✅
6. `sessions` - User sessions ✅
7. `verification_codes` - OTP codes ✅
8. `memberships` - Membership subscriptions ✅
9. `activities` - Activities/events ✅
10. `activity_participants` - Activity registrations ✅
11. `sponsors` - Sponsors ✅
12. `sponsorships` - Sponsorships ✅
13. `system_settings` - System settings ✅

---

## ❌ MISSING TABLES (Must Create)

### 1. `payment_proofs` - Payment Proof Uploads
**Purpose**: Store payment proof images uploaded by members for membership renewals

```sql
CREATE TABLE IF NOT EXISTS payment_proofs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    membership_id INT NOT NULL,
    user_id INT NOT NULL,
    proof_image_url VARCHAR(500) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    notes TEXT,
    rejection_reason TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INT NULL,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (membership_id) REFERENCES memberships(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_membership (membership_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_uploaded_at (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Used By**: 
- `POST /api/memberships/payment-proof`
- `GET /api/member/payments/history`
- `SubscriptionCard.tsx`

**Priority**: 🔴 CRITICAL

---

### 2. `support_tickets` - Support Tickets
**Purpose**: Store support tickets created by members

```sql
CREATE TABLE IF NOT EXISTS support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    attachment_url VARCHAR(500),
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    assigned_to INT NULL,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_ticket_number (ticket_number),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Used By**: 
- `POST /api/support/tickets`
- `NotificationsSupport.tsx`

**Priority**: 🟡 MEDIUM

---

### 3. `support_ticket_replies` - Support Ticket Replies
**Purpose**: Store replies to support tickets (from members or admins)

```sql
CREATE TABLE IF NOT EXISTS support_ticket_replies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    attachment_url VARCHAR(500),
    is_admin_reply TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_ticket (ticket_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Used By**: Support ticket detail page (future)

**Priority**: 🟡 MEDIUM

---

### 4. `notifications` - User Notifications
**Purpose**: Store system notifications for users

```sql
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500),
    is_read TINYINT(1) DEFAULT 0,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Notes**:
- `user_id` can be NULL for system-wide notifications
- Notifications are automatically created by system events (e.g., membership expiry, payment approval)

**Used By**: 
- `GET /api/member/notifications`
- `NotificationsSupport.tsx`
- `Notifications.tsx`

**Priority**: 🟡 MEDIUM

---

### 5. `posts` - Posts/Announcements
**Purpose**: Store posts and announcements created by admins

```sql
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt VARCHAR(500),
    category ENUM('announcement', 'event', 'financial_alert', 'general') DEFAULT 'general',
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    author_id INT NOT NULL,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_published_at (published_at),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Used By**: 
- `GET /api/member/posts`
- `PostsList.tsx`
- Admin posts management

**Priority**: 🟡 MEDIUM

---

### 6. `post_reads` - Post Read Tracking
**Purpose**: Track which posts each user has read (to show "NEW" badge)

```sql
CREATE TABLE IF NOT EXISTS post_reads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_post_read (post_id, user_id),
    INDEX idx_post (post_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Used By**: 
- `GET /api/member/posts` (to determine `is_read` field)
- `PostsList.tsx` (to show NEW badge)

**Priority**: 🟡 MEDIUM

---

### 7. `faqs` - Frequently Asked Questions
**Purpose**: Store FAQs for member dashboard

```sql
CREATE TABLE IF NOT EXISTS faqs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    category ENUM('subscription', 'activities', 'profile', 'general') DEFAULT 'general',
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_is_active (is_active),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Used By**: 
- `GET /api/member/dashboard` (returns FAQs)
- `NotificationsSupport.tsx`

**Priority**: 🟢 LOW

---

## ⚠️ MISSING COLUMNS (Additive Changes to Existing Tables)

### 1. `users` Table - Add Missing Columns
**Current Schema**: Has basic user fields  
**Missing Columns**:
```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS member_id VARCHAR(50) UNIQUE AFTER id,
ADD COLUMN IF NOT EXISTS branch VARCHAR(100) DEFAULT 'أرضروم – تركيا' AFTER city,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT AFTER status,
ADD INDEX idx_member_id (member_id);
```

**Purpose**:
- `member_id`: Unique member identifier (e.g., "MEM-2025-001")
- `branch`: Member's branch/location
- `suspension_reason`: Reason for account suspension (if status = 'suspended')

**Used By**: 
- `GET /api/member/dashboard`
- `MemberDashboard.tsx`

**Priority**: 🔴 CRITICAL

---

### 2. `memberships` Table - Add Payment Tracking
**Current Schema**: Has basic membership fields  
**Missing Columns**:
```sql
ALTER TABLE memberships 
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'TRY' AFTER amount,
ADD COLUMN IF NOT EXISTS is_paid TINYINT(1) DEFAULT 0 AFTER payment_status;
```

**Purpose**:
- `currency`: Currency of payment (TRY, USD, etc.)
- `is_paid`: Quick boolean flag for payment status

**Used By**: 
- `GET /api/member/dashboard`
- `SubscriptionCard.tsx`

**Priority**: 🔴 CRITICAL

---

### 3. `activities` Table - Add Arabic Fields
**Current Schema**: Has English fields only  
**Missing Columns**:
```sql
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS title_ar VARCHAR(255) AFTER title,
ADD COLUMN IF NOT EXISTS description_ar TEXT AFTER description,
ADD COLUMN IF NOT EXISTS location_ar VARCHAR(255) AFTER location,
ADD COLUMN IF NOT EXISTS start_time TIME AFTER start_date,
ADD COLUMN IF NOT EXISTS end_time TIME AFTER end_date,
ADD COLUMN IF NOT EXISTS registration_required TINYINT(1) DEFAULT 1 AFTER max_participants;
```

**Purpose**:
- `title_ar`, `description_ar`, `location_ar`: Arabic translations
- `start_time`, `end_time`: Separate time fields
- `registration_required`: Whether registration is required

**Used By**: 
- `GET /api/activities`
- `UpcomingActivitiesList.tsx`

**Priority**: 🔴 CRITICAL

---

### 4. `sessions` Table - Add Token Field
**Current Schema**: Has basic session fields  
**Missing Columns**:
```sql
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS token VARCHAR(500) UNIQUE AFTER id,
ADD INDEX idx_token (token);
```

**Purpose**:
- `token`: JWT token for session validation
- Used for "logout all devices" functionality

**Used By**: 
- `POST /api/auth/logout-all-devices`

**Priority**: 🟡 MEDIUM

---

## 🔗 MISSING FOREIGN KEY CONSTRAINTS

### Add Missing Constraints
```sql
-- Ensure all foreign keys have proper ON DELETE behavior
-- (Most are already correct in schema, but verify)

-- Example: Ensure payment_proofs cascade deletes
ALTER TABLE payment_proofs 
ADD CONSTRAINT fk_payment_proofs_membership 
FOREIGN KEY (membership_id) REFERENCES memberships(id) ON DELETE CASCADE;

ALTER TABLE payment_proofs 
ADD CONSTRAINT fk_payment_proofs_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

**Priority**: 🟡 MEDIUM

---

## 📊 DATABASE MIGRATION PLAN

### Migration Script: `003_member_dashboard_tables.sql`
**Location**: `backend/database/migrations/003_member_dashboard_tables.sql`

```sql
-- ================================================
-- Migration: Member Dashboard Tables & Columns
-- Created: 2025-12-14
-- Description: Add missing tables and columns for member dashboard
-- ================================================

USE yemen_union_db;

-- 1. Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS member_id VARCHAR(50) UNIQUE AFTER id,
ADD COLUMN IF NOT EXISTS branch VARCHAR(100) DEFAULT 'أرضروم – تركيا' AFTER city,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT AFTER status,
ADD INDEX idx_member_id (member_id);

-- 2. Add missing columns to memberships table
ALTER TABLE memberships 
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'TRY' AFTER amount,
ADD COLUMN IF NOT EXISTS is_paid TINYINT(1) DEFAULT 0 AFTER payment_status;

-- 3. Add missing columns to activities table
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS title_ar VARCHAR(255) AFTER title,
ADD COLUMN IF NOT EXISTS description_ar TEXT AFTER description,
ADD COLUMN IF NOT EXISTS location_ar VARCHAR(255) AFTER location,
ADD COLUMN IF NOT EXISTS start_time TIME AFTER start_date,
ADD COLUMN IF NOT EXISTS end_time TIME AFTER end_date,
ADD COLUMN IF NOT EXISTS registration_required TINYINT(1) DEFAULT 1 AFTER max_participants;

-- 4. Add token column to sessions table
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS token VARCHAR(500) UNIQUE AFTER id,
ADD INDEX idx_token (token);

-- 5. Create payment_proofs table
CREATE TABLE IF NOT EXISTS payment_proofs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    membership_id INT NOT NULL,
    user_id INT NOT NULL,
    proof_image_url VARCHAR(500) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    notes TEXT,
    rejection_reason TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INT NULL,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (membership_id) REFERENCES memberships(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_membership (membership_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_uploaded_at (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    attachment_url VARCHAR(500),
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    assigned_to INT NULL,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_ticket_number (ticket_number),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Create support_ticket_replies table
CREATE TABLE IF NOT EXISTS support_ticket_replies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    attachment_url VARCHAR(500),
    is_admin_reply TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_ticket (ticket_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500),
    is_read TINYINT(1) DEFAULT 0,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt VARCHAR(500),
    category ENUM('announcement', 'event', 'financial_alert', 'general') DEFAULT 'general',
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    author_id INT NOT NULL,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_published_at (published_at),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Create post_reads table
CREATE TABLE IF NOT EXISTS post_reads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_post_read (post_id, user_id),
    INDEX idx_post (post_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Create faqs table
CREATE TABLE IF NOT EXISTS faqs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    category ENUM('subscription', 'activities', 'profile', 'general') DEFAULT 'general',
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_is_active (is_active),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- End of Migration
-- ================================================
```

**Priority**: 🔴 CRITICAL - Run this migration before implementing APIs

---

## 📊 SUMMARY

### Missing Tables
- **Total**: 7
- **Critical**: 1 (`payment_proofs`)
- **Medium**: 5 (`support_tickets`, `support_ticket_replies`, `notifications`, `posts`, `post_reads`)
- **Low**: 1 (`faqs`)

### Missing Columns
- **Total**: 13 columns across 4 tables
- **Critical**: 9 columns (`users`, `memberships`, `activities`)
- **Medium**: 4 columns (`sessions`)

### Migration Scripts
- **Total**: 1 comprehensive migration script
- **File**: `backend/database/migrations/003_member_dashboard_tables.sql`

---

**Next Steps**: 
1. Review and run migration script `003_member_dashboard_tables.sql`
2. Verify all tables and columns are created successfully
3. Populate sample data for testing (FAQs, notifications, posts)
4. Implement missing APIs (see `api_map_member.md`)
5. Wire frontend to real APIs (replace mock data)
