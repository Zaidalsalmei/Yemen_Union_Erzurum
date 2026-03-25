# 📧 Email Reply System Implementation

## Overview
This feature allows the system to fetch email replies from an Outlook inbox via IMAP and display them in the Admin Dashboard associated with the correct user.

## ✅ Completed Components
1. **Database Table**: `email_replies` created via migration.
2. **Backend Controller**: `EmailReplyController` implemented with IMAP logic and body cleaning.
3. **API Routes**:
   - `GET /api/email-replies/fetch` (Triggers IMAP fetch)
   - `GET /api/users/{id}/replies` (Gets replies for a user)
4. **Dashboard Integration**:
   - Added "Check Replies" button in Users List.
   - Added "📩 Reply" badge for users with replies.
   - Added Reply Details Modal.

## ⚙️ Configuration Required
You MUST add the following to your `backend/.env` file for the system to work:

```env
IMAP_HOST=outlook.office365.com:993/imap/ssl
IMAP_USERNAME=your-email@outlook.com
IMAP_PASSWORD=your-password
```

**Note:** If using Gmail, you may need an App Password. For Outlook, ensure IMAP is enabled.

## 🚀 How to Run Migration
If you haven't already, run the migration script:

```bash
php backend/run_email_migration.php
```

## 🔍 How it Works
1. Admin clicks **"جلب الردود" (Fetch Replies)** in the Users page.
2. System connects to Outlook, fetches **Unread** emails.
3. System matches Sender Email -> User Email.
4. Replies are stored in the database.
5. Users with replies show a **Red Badge**.
6. Clicking the badge opens the reply conversation.
