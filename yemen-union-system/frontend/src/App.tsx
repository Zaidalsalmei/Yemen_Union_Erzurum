import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthRedirect } from './components/auth/AuthRedirect';

// Layouts
import { AdminLayout } from './components/layout/AdminLayout';
import { MemberLayout } from './components/layout/MemberLayout';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';

// Dashboard / Management Pages (Admin Side)
import { Dashboard } from './pages/dashboard';
import { UserList } from './pages/users/UserList';
import { UserCreate } from './pages/users/UserCreate';
import { UserDetail } from './pages/users/UserDetail';
import { UserEdit } from './pages/users/UserEdit';
import { MembershipsList } from './pages/memberships/MembershipsList';
import { MembershipCreate } from './pages/memberships/MembershipCreate';
import { MembershipDetail } from './pages/memberships/MembershipDetail';
import { MembershipEdit } from './pages/memberships/MembershipEdit';
import ActivitiesList from './pages/activities/ActivitiesList';
import ActivityDetail from './pages/activities/ActivityDetail';
import ActivityForm from './pages/activities/ActivityForm';
import { Calendar } from './pages/calendar';
import { Finance } from './pages/finance';
import { Reports } from './pages/reports';
import { Settings } from './pages/settings';
import { RolesList } from './pages/roles';
import { EmailRepliesList } from './pages/email-replies';
import { PostsList, PostCreate, PostShow, MediaLibrary } from './pages/posts';

// Relations Pages
import { SupporterList } from './pages/relations/SupporterList';
import { SupporterDetail } from './pages/relations/SupporterDetail';
import { SupporterCreate } from './pages/relations/SupporterCreate';
import { SupporterEdit } from './pages/relations/SupporterEdit';
import { SupportVisitList } from './pages/relations/SupportVisitList';
import { SupportVisitCreate } from './pages/relations/SupportVisitCreate';
import { SupportVisitDetail } from './pages/relations/SupportVisitDetail';
import { SupportVisitEdit } from './pages/relations/SupportVisitEdit';

// Support Admin Pages
import { SupportTicketsList } from './pages/support';

// Member Pages (Member Side)
import { MemberDashboard } from './pages/dashboard/MemberDashboard';
import { MembershipCard } from './pages/membership/MembershipCard';
import { MembershipRenewal } from './pages/membership/MembershipRenewal';
import { PaymentProofUpload } from './pages/membership/PaymentProofUpload';
import { MemberActivities } from './pages/activities/MemberActivities';
import { ProfileEdit } from './pages/profile/ProfileEdit';
import { SupportTicketCreate, SupportTicketsList as MemberSupportTicketsList } from './pages/support';
import { PaymentHistory } from './pages/payments/PaymentHistory';
import { Notifications } from './pages/notifications/Notifications';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* 🏠 Root & Redirect Logic */}
        <Route path="/" element={<AuthRedirect />} />

        {/* 🔑 Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* 🛡️ Admin & Executive Routes (/dashboard) */}
        <Route element={<ProtectedRoute permission="dashboard.view_full"><AdminLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Users Management */}
          <Route path="/users" element={<ProtectedRoute permission="users.view_all"><UserList /></ProtectedRoute>} />
          <Route path="/users/create" element={<ProtectedRoute permission="users.create"><UserCreate /></ProtectedRoute>} />
          <Route path="/users/:id" element={<ProtectedRoute permission="users.view_all"><UserDetail /></ProtectedRoute>} />
          <Route path="/users/:id/edit" element={<ProtectedRoute permission="users.update"><UserEdit /></ProtectedRoute>} />

          {/* Memberships Management */}
          <Route path="/memberships" element={<ProtectedRoute permission="memberships.view_all"><MembershipsList /></ProtectedRoute>} />
          <Route path="/memberships/create" element={<ProtectedRoute permission="memberships.create"><MembershipCreate /></ProtectedRoute>} />
          <Route path="/memberships/:id" element={<ProtectedRoute permission="memberships.view_all"><MembershipDetail /></ProtectedRoute>} />
          <Route path="/memberships/:id/edit" element={<ProtectedRoute permission="memberships.update"><MembershipEdit /></ProtectedRoute>} />

          {/* Activities Management */}
          <Route path="/activities" element={<ProtectedRoute permission="activities.view"><ActivitiesList /></ProtectedRoute>} />
          <Route path="/activities/create" element={<ProtectedRoute permission="activities.create"><ActivityForm /></ProtectedRoute>} />
          <Route path="/activities/:id" element={<ProtectedRoute permission="activities.view"><ActivityDetail /></ProtectedRoute>} />
          <Route path="/activities/:id/edit" element={<ProtectedRoute permission="activities.update"><ActivityForm /></ProtectedRoute>} />

          {/* Posts Management */}
          <Route path="/posts" element={<ProtectedRoute permission="posts.view"><PostsList /></ProtectedRoute>} />
          <Route path="/posts/create" element={<ProtectedRoute permission="posts.create"><PostCreate /></ProtectedRoute>} />
          <Route path="/posts/:id" element={<ProtectedRoute permission="posts.view"><PostShow /></ProtectedRoute>} />
          <Route path="/posts/:id/edit" element={<ProtectedRoute permission="posts.update"><PostCreate /></ProtectedRoute>} />
          <Route path="/posts/media-library" element={<ProtectedRoute permission="posts.view"><MediaLibrary /></ProtectedRoute>} />

          {/* Calendar & Reports */}
          <Route path="/calendar" element={<ProtectedRoute permission="calendar.view"><Calendar /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute permission="reports.view"><Reports /></ProtectedRoute>} />

          {/* Finance */}
          <Route path="/finance" element={<ProtectedRoute permission="finance.view"><Finance /></ProtectedRoute>} />
          {/* Note: finance/create not found as a specific file, using Finance dashboard or assuming internal modal */}

          {/* Relations - Sponsors */}
          <Route path="/relations/sponsors" element={<ProtectedRoute permission="sponsors.view"><SupporterList /></ProtectedRoute>} />
          <Route path="/relations/sponsors/create" element={<ProtectedRoute permission="sponsors.create"><SupporterCreate /></ProtectedRoute>} />
          <Route path="/relations/sponsors/:id" element={<ProtectedRoute permission="sponsors.view"><SupporterDetail /></ProtectedRoute>} />
          <Route path="/relations/sponsors/:id/edit" element={<ProtectedRoute permission="sponsors.update"><SupporterEdit /></ProtectedRoute>} />

          {/* Relations - Sponsorships */}
          <Route path="/relations/sponsorships" element={<ProtectedRoute permission="sponsorships.view"><SupportVisitList /></ProtectedRoute>} />
          <Route path="/relations/sponsorships/create" element={<ProtectedRoute permission="sponsorships.create"><SupportVisitCreate /></ProtectedRoute>} />
          <Route path="/relations/sponsorships/:id" element={<ProtectedRoute permission="sponsorships.view"><SupportVisitDetail /></ProtectedRoute>} />
          <Route path="/relations/sponsorships/:id/edit" element={<ProtectedRoute permission="sponsorships.update"><SupportVisitEdit /></ProtectedRoute>} />

          {/* Technical Support Management */}
          <Route path="/support" element={<ProtectedRoute permission="support.view_all"><SupportTicketsList /></ProtectedRoute>} />

          {/* Communications & Settings */}
          <Route path="/email-replies" element={<ProtectedRoute permission="posts.view"><EmailRepliesList /></ProtectedRoute>} />
          <Route path="/roles" element={<ProtectedRoute permission="roles.view"><RolesList /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute permission="settings.view"><Settings /></ProtectedRoute>} />
        </Route>

        {/* 🛡️ Member Routes (/member) */}
        <Route element={<ProtectedRoute><MemberLayout /></ProtectedRoute>}>
          <Route path="/member" element={<MemberDashboard />} />
          <Route path="/member/activities" element={<MemberActivities />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/posts" element={<PostsList />} />

          {/* Membership & Profile */}
          <Route path="/membership/card" element={<MembershipCard />} />
          <Route path="/memberships/renew" element={<MembershipRenewal />} />
          <Route path="/memberships/payment-proof" element={<PaymentProofUpload />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />

          {/* Member Support & Payments */}
          <Route path="/support/create" element={<SupportTicketCreate />} />
          <Route path="/support/tickets" element={<MemberSupportTicketsList />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/payments/history" element={<PaymentHistory />} />
        </Route>

        {/* 🚩 404 - Not Found */}
        <Route path="*" element={
          <div className="h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
            <span className="text-9xl grayscale opacity-20 font-black">404</span>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">الصفحة غير موجودة</p>
            <button onClick={() => window.history.back()} className="text-[#DC2626] font-bold text-xs mt-4">⬅️ العودة للخلف</button>
          </div>
        } />
      </Routes>
    </AuthProvider>
  );
}
