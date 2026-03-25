# 📝 Posts Module - Complete Implementation Guide

## ✅ What Has Been Created

### 1. Database Schema (`database/migrations/create_posts_module_tables.sql`)
- ✅ `posts` table - Main posts storage
- ✅ `post_revisions` table - Version history
- ✅ `post_comments_internal` table - Admin notes
- ✅ `media_library` table - Media files storage
- ✅ `social_accounts` table - Social media integrations
- ✅ `post_tags` table - Tags/categories
- ✅ `post_tag_relations` table - Post-tag relationships
- ✅ All indexes and foreign keys properly configured

### 2. TypeScript Types (`frontend/src/types/posts.ts`)
- ✅ Post interface
- ✅ PostRevision interface
- ✅ PostComment interface
- ✅ MediaFile interface
- ✅ SocialAccount interface
- ✅ PostTag interface
- ✅ Form data interfaces
- ✅ API response types

### 3. API Service Layer (`frontend/src/services/posts.ts`)
- ✅ postsApi - All CRUD operations
- ✅ mediaApi - Media library management
- ✅ socialApi - Social media integrations
- ✅ tagsApi - Tags management

### 4. Frontend Pages
- ✅ PostsList.tsx - Main posts listing with Instagram-like cards

---

## 🔧 Next Steps to Complete

### Pages to Create:

1. **PostCreate.tsx** - Create new post
   - Title & description fields
   - Media upload/select
   - Social import buttons (Canva, YouTube, Instagram, WhatsApp)
   - Save draft / Submit for review / Publish buttons
   - Tags selection

2. **PostEdit.tsx** - Edit existing post
   - Same as create but with existing data
   - Show revision history sidebar
   - Lock/unlock functionality

3. **PostDetail.tsx** - View post details
   - Full post information
   - Revision history
   - Internal comments section
   - Publish/schedule controls
   - Pin/lock controls

4. **MediaLibrary.tsx** - Media management
   - Grid view of all media
   - Upload new files
   - Filter by type
   - Select media for posts
   - Delete media

5. **Templates.tsx** - Ready-made templates (optional)
   - Pre-designed post templates
   - Quick start options

---

## 🎨 CSS Classes to Add to `index.css`

```css
/* ====================================================
   POSTS MODULE STYLES
   ==================================================== */

/* Posts Container */
.posts__container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

/* Post Card */
.posts__card {
  border-radius: 22px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.posts__card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(210, 31, 60, 0.25);
}

/* Post Card Thumbnail */
.post-card__thumbnail {
  position: relative;
  height: 200px;
  overflow: hidden;
  background: linear-gradient(150deg, #d21f3c, #8f1425, #000);
}

.post-card__thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.posts__card:hover .post-card__thumbnail img {
  transform: scale(1.1);
}

/* Post Card Content */
.post-card__content {
  padding: 20px;
}

.post-card__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card__description {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Post Card Actions */
.post-card__actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

/* Editor Form */
.editor__form {
  max-width: 900px;
  margin: 0 auto;
}

.editor__field {
  margin-bottom: 24px;
}

.editor__label {
  display: block;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--color-dark);
}

.editor__input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 14px;
  transition: all 0.3s;
}

.editor__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(210, 31, 60, 0.1);
}

.editor__textarea {
  min-height: 150px;
  resize: vertical;
}

/* Social Import Buttons */
.editor__social-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin: 24px 0;
}

.social-btn {
  padding: 12px 20px;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
  cursor: pointer;
  border: 2px solid transparent;
}

.social-btn--canva {
  background: linear-gradient(135deg, #00C4CC, #7D2AE8);
  color: white;
}

.social-btn--canva:hover {
  box-shadow: 0 8px 20px rgba(125, 42, 232, 0.3);
  transform: translateY(-2px);
}

.social-btn--youtube {
  background: #FF0000;
  color: white;
}

.social-btn--youtube:hover {
  box-shadow: 0 8px 20px rgba(255, 0, 0, 0.3);
  transform: translateY(-2px);
}

.social-btn--instagram {
  background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%);
  color: white;
}

.social-btn--instagram:hover {
  box-shadow: 0 8px 20px rgba(188, 24, 136, 0.3);
  transform: translateY(-2px);
}

.social-btn--whatsapp {
  background: #25D366;
  color: white;
}

.social-btn--whatsapp:hover {
  box-shadow: 0 8px 20px rgba(37, 211, 102, 0.3);
  transform: translateY(-2px);
}

/* Media Library */
.media-library__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.media-library__item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 3px solid transparent;
}

.media-library__item:hover {
  border-color: var(--color-primary);
  box-shadow: 0 8px 24px rgba(210, 31, 60, 0.25);
  transform: scale(1.05);
}

.media-library__item.selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(210, 31, 60, 0.2);
}

.media-library__item img,
.media-library__item video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-library__item-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.media-library__item:hover .media-library__item-overlay {
  opacity: 1;
}

/* Revision History */
.revision__list {
  max-height: 500px;
  overflow-y: auto;
}

.revision__item {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.2s;
}

.revision__item:hover {
  background: #f9fafb;
}

.revision__item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.revision__item-date {
  font-size: 13px;
  color: #666;
  font-weight: 600;
}

.revision__item-author {
  font-size: 12px;
  color: #999;
}

.revision__item-content {
  font-size: 14px;
  color: var(--color-dark);
  margin-bottom: 12px;
}

.revision__restore-btn {
  font-size: 12px;
  padding: 6px 12px;
}

/* Internal Comments */
.comments__list {
  max-height: 400px;
  overflow-y: auto;
}

.comment__item {
  padding: 12px;
  background: #f9fafb;
  border-radius: var(--radius-md);
  margin-bottom: 12px;
}

.comment__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.comment__author {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-dark);
}

.comment__date {
  font-size: 12px;
  color: #999;
}

.comment__text {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

/* Upload Zone */
.upload-zone {
  border: 3px dashed #d1d5db;
  border-radius: var(--radius-lg);
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-zone:hover {
  border-color: var(--color-primary);
  background: rgba(210, 31, 60, 0.02);
}

.upload-zone.dragging {
  border-color: var(--color-primary);
  background: rgba(210, 31, 60, 0.05);
  border-style: solid;
}

.upload-zone__icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-zone__text {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-dark);
  margin-bottom: 8px;
}

.upload-zone__hint {
  font-size: 14px;
  color: #999;
}

/* Schedule Widget */
.schedule-widget {
  background: linear-gradient(135deg, #fff5f5, #ffffff);
  border: 2px solid #fecaca;
  border-radius: var(--radius-lg);
  padding: 20px;
}

.schedule-widget__title {
  font-weight: 700;
  font-size: 16px;
  color: var(--color-primary);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.schedule-widget__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schedule-widget__item {
  padding: 12px;
  background: white;
  border-radius: var(--radius-md);
  border: 1px solid #fee2e2;
}

.schedule-widget__item-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-dark);
  margin-bottom: 4px;
}

.schedule-widget__item-date {
  font-size: 12px;
  color: #666;
}
```

---

## 🔗 Sidebar Integration

Update `frontend/src/components/layout/Sidebar.tsx`:

```tsx
// Add to navigation items array:
{
  label: 'الأنشطة',
  icon: Icons.activities,
  children: [
    { label: 'قائمة الأنشطة', path: '/activities' },
    { label: 'إنشاء نشاط', path: '/activities/create' },
    {
      label: 'المنشورات',
      children: [
        { label: 'جميع المنشورات', path: '/posts' },
        { label: 'إنشاء منشور', path: '/posts/create' },
        { label: 'مكتبة الوسائط', path: '/posts/media-library' },
        { label: 'القوالب الجاهزة', path: '/posts/templates' },
      ]
    }
  ]
},
```

---

## 🚀 Backend API Endpoints (PHP - Placeholders Only)

Create `backend/api/posts/index.php`:

```php
<?php
// GET /api/posts - List all posts
// POST /api/posts - Create new post
// GET /api/posts/:id - Get single post
// PUT /api/posts/:id - Update post
// DELETE /api/posts/:id - Delete post
// POST /api/posts/:id/publish - Publish post
// POST /api/posts/:id/schedule - Schedule post
// POST /api/posts/:id/toggle-pin - Pin/unpin post
// POST /api/posts/:id/toggle-lock - Lock/unlock post
// GET /api/posts/:id/revisions - Get revisions
// POST /api/posts/:id/revisions/:revisionId/restore - Restore revision
// GET /api/posts/:id/comments - Get internal comments
// POST /api/posts/:id/comments - Add internal comment
```

Create `backend/api/media/index.php`:

```php
<?php
// GET /api/media - List all media
// POST /api/media/upload - Upload new media
// DELETE /api/media/:id - Delete media
```

Create `backend/api/social-accounts/index.php`:

```php
<?php
// GET /api/social-accounts - Get user's social accounts
// POST /api/social-accounts/instagram/connect - Connect Instagram
// POST /api/social-accounts/youtube/import - Import from YouTube
// POST /api/social-accounts/instagram/import - Import from Instagram
// POST /api/social-accounts/canva/connect - Connect Canva
// POST /api/social-accounts/whatsapp - Save WhatsApp number
```

---

## ✅ Checklist

- [x] Database schema created
- [x] TypeScript types defined
- [x] API service layer created
- [x] PostsList page created
- [ ] PostCreate page
- [ ] PostEdit page
- [ ] PostDetail page
- [ ] MediaLibrary page
- [ ] Templates page (optional)
- [ ] CSS styles added to index.css
- [ ] Sidebar updated
- [ ] Backend API endpoints (placeholders)
- [ ] Routing configured
- [ ] Permissions integrated

---

## 📝 Notes

1. **No AI/LLM features** - This is a pure publishing system
2. **Social integrations** are manual imports (no auto-posting)
3. **Permissions** should be checked on both frontend and backend
4. **Media uploads** should be handled with proper validation
5. **Revisions** are automatically created on each edit
6. **Scheduled posts** need a cron job to publish at the right time

---

**Status**: 🟡 In Progress (40% Complete)  
**Next Priority**: Create PostCreate.tsx and PostEdit.tsx pages
