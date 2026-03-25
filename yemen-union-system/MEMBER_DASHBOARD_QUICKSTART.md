# Member Dashboard - Quick Start Guide

## 🚀 Getting Started

### 1. Files Created

The following files have been created for the Member Dashboard:

**Components:**
- `frontend/src/components/dashboard/StatusBanner.tsx`
- `frontend/src/components/dashboard/KpiCard.tsx`
- `frontend/src/components/dashboard/QuickActions.tsx`
- `frontend/src/components/dashboard/SubscriptionCard.tsx`
- `frontend/src/components/dashboard/UpcomingActivitiesList.tsx`
- `frontend/src/components/dashboard/PostsList.tsx`
- `frontend/src/components/dashboard/NotificationsSupport.tsx`
- `frontend/src/components/dashboard/FirstLoginModal.tsx`
- `frontend/src/components/dashboard/index.ts`
- `frontend/src/components/MemberRoute.tsx`

**Pages:**
- `frontend/src/pages/dashboard/MemberDashboard.tsx` (Completely replaced)

**Services:**
- `frontend/src/services/memberDashboardService.ts`

**Types:**
- `frontend/src/types/index.ts` (Updated with Member Dashboard types)

---

## 🧪 Testing the Dashboard

### Step 1: Update Your Routes

Add the member dashboard route to your `App.tsx`:

```tsx
import { MemberDashboard } from './pages/dashboard/MemberDashboard';
import { MemberRoute } from './components/MemberRoute';

// In your routes configuration:
<Route 
  path="/member/dashboard" 
  element={
    <MemberRoute>
      <MemberDashboard />
    </MemberRoute>
  } 
/>
```

### Step 2: Login as a Member

1. Start your development server
2. Login with a **member** account (not admin)
3. You should see:
   - Welcome toast message
   - Last login timestamp
   - Member identity header
   - All dashboard sections

### Step 3: Test Different Scenarios

#### A) **Active Member (Default)**
Current mock data shows an active member with:
- ✅ Paid subscription
- ✅ 350 days remaining
- ✅ All features accessible

#### B) **Test Expiring Soon**
Modify `mockData.kpis.days_remaining` to `5`:
- Should see yellow warning banner
- Subscription card shows reminder

#### C) **Test Expired**
Modify `mockData.subscription.status` to `'expired'`:
- Should see red expired banner
- "تجديد الاشتراك" highlighted in quick actions

#### D) **Test Pending Approval**
Modify `mockData.member.account_status` to `'pending_approval'`:
- Should see blue info banner
- Limited functionality

#### E) **Test Suspended**
Modify `mockData.member.account_status` to `'suspended'`:
```ts
account_status: 'suspended',
suspension_reason: 'مخالفة القوانين الداخلية للاتحاد'
```
- Should see dark banner with reason
- Contact support CTA

#### F) **Test First Login**
Modify `mockData.isFirstLogin` to `true`:
- Should open profile completion modal
- Must fill required fields to continue

---

## 📝 Customization Guide

### Modify Brand Colors

In each component, update the color values:

```tsx
// Current colors
const primaryRed = '#D60000';
const black = '#000000';
const lightGray = '#F5F5F5';

// Change to your preferences
```

### Add More Quick Actions

In `QuickActions.tsx`, add to the `actions` array:

```tsx
{
  id: 'new-action',
  icon: '🎯',
  label: 'Custom Action',
  link: '/custom-path',
}
```

### Modify KPI Cards

In `MemberDashboard.tsx`, update the KPI grid:

```tsx
<KpiCard
  icon="🆕"
  label="Your Custom KPI"
  value={customValue}
  status="success"
/>
```

### Change WhatsApp Number

In `MemberDashboard.tsx`:

```tsx
<QuickActions
  whatsappEnabled={true}
  whatsappNumber="905XXXXXXXXX" // Change this
/>
```

---

## 🔌 Backend Integration

### Current State
- Dashboard uses **mock data** for development
- All components are ready for API integration

### To Connect Backend API

1. **Uncomment API call** in `MemberDashboard.tsx`:

```tsx
// Change from:
// const data = await memberDashboardService.getDashboardData();
// const mockData: MemberDashboardData = { ... }

// To:
const data = await memberDashboardService.getDashboardData();
setDashboardData(data);
```

2. **Update API Base URL** in `frontend/src/services/api.ts`:

```tsx
const api = axios.create({
  baseURL: 'http://your-backend-url/api',
});
```

3. **Implement Backend Endpoints** (see `MEMBER_DASHBOARD_REPORT.md` for details):
   - `GET /api/member/dashboard`
   - `PUT /api/member/profile`
   - `POST /api/member/payment-proof`
   - etc.

---

## 🎨 Design Customization

### Typography

Update font sizes in component styles:

```css
.member-identity__name {
  font-size: 28px; /* Adjust as needed */
  font-weight: 800;
}
```

### Spacing

Adjust padding/margins:

```css
.member-dashboard__container {
  max-width: 1200px; /* Change container width */
  margin: 0 auto;
}
```

### Animations

Modify transition durations:

```css
transition: all 0.3s ease; /* Change 0.3s to your preference */
```

---

## 🐛 Troubleshooting

### Issue: Dashboard not loading
**Solution:** Check browser console for errors. Ensure all imports are correct.

### Issue: Mock data not showing
**Solution:** Check `loadDashboardData()` function. Verify `mockData` structure matches `MemberDashboardData` type.

### Issue: Styles not applying
**Solution:** Ensure `<style>` tags are present in each component's return statement.

### Issue: Route protection not working
**Solution:** Verify `AuthContext` is properly set up and user roles are being returned from backend.

### Issue: Toast not showing
**Solution:** Ensure `react-hot-toast` is installed and `<Toaster />` is in your `App.tsx`.

---

## 📊 Mock Data Modification

To test different states, modify the `mockData` object in `MemberDashboard.tsx`:

```tsx
const mockData: MemberDashboardData = {
  member: {
    account_status: 'active', // Change to: pending_approval | expired | suspended
    // ... other fields
  },
  kpis: {
    subscription_status: 'paid', // Change to: unpaid | pending
    days_remaining: 350, // Test with: 5, 30, null
    unread_notifications_count: 5, // Test with: 0, 10, 50
    // ... other fields
  },
  subscription: {
    status: 'active', // Change to: expired | pending
    // ... other fields
  },
  upcomingActivities: [], // Add mock activities
  recentPosts: [], // Add mock posts
  notifications: [], // Add mock notifications
  isFirstLogin: false, // Change to: true
};
```

---

## 🔐 Permission Testing

### Member Permissions (Should Work):
- ✅ View own profile
- ✅ View own subscription
- ✅ Upload payment proof
- ✅ Register for activities
- ✅ Read posts
- ✅ Submit support tickets

### Admin Features (Should Be Hidden):
- ❌ Create/edit posts
- ❌ Manage users
- ❌ View finance reports
- ❌ System settings
- ❌ Manage activities (create/edit/delete)

To test, login as admin → should redirect to `/dashboard` (admin dashboard).

---

## 📱 Responsive Testing

Test on different screen sizes:

1. **Desktop** (1920x1080): Full multi-column layout
2. **Tablet** (768px): Adaptive 2-column layout
3. **Mobile** (375px): Single column, stacked layout

Use browser DevTools to simulate different devices.

---

## 🌐 RTL Testing

The dashboard is Arabic RTL by default:
- Text flows right-to-left
- Layout mirrors correctly
- Dates formatted in Arabic

To test LTR (if needed in future):
```css
direction: ltr; /* Change from rtl */
```

---

## ✅ Final Checklist

Before going live:

- [ ] Replace mock data with real API calls
- [ ] Test all quick actions navigation
- [ ] Verify payment proof upload works
- [ ] Test support ticket submission
- [ ] Check all empty states
- [ ] Test error handling (disconnect network)
- [ ] Verify session timeout behavior
- [ ] Test on mobile devices
- [ ] Check accessibility (keyboard navigation)
- [ ] Validate all forms
- [ ] Test with different member statuses
- [ ] Verify route protection working

---

## 📞 Need Help?

If you encounter issues:

1. Check the **MEMBER_DASHBOARD_REPORT.md** for detailed documentation
2. Review component source code comments
3. Inspect browser console for errors
4. Test with mock data variations
5. Verify backend API responses match expected types

---

## 🎉 You're Ready!

The Member Dashboard is fully implemented and ready to use. Start testing with the mock data, then integrate your backend API when ready.

**Enjoy your premium member dashboard!** 🚀
