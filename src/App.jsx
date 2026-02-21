import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import AppShell from './components/layout/AppShell';
import LoginPage from './features/auth/LoginPage';
import AuthGuard from './features/auth/AuthGuard';
import DashboardPage from './features/dashboard/DashboardPage';
import AccessCardPage from './features/access-card/AccessCardPage';
import MemberDashboard from './features/membership/MemberDashboard';
import AdminMemberList from './features/membership/AdminMemberList';
import BookingsPage from './features/bookings/BookingsPage';
import SpacesPage from './features/spaces/SpacesPage';
import SpaceDetail from './features/spaces/SpaceDetail';
import EquipmentPage from './features/equipment/EquipmentPage';
import EquipmentDetail from './features/equipment/EquipmentDetail';
import NotificationsPage from './features/notifications/NotificationsPage';
import LogsPage from './features/logs/LogsPage';
import VisitorManagement from './features/visitors/VisitorManagement';
import ProfilePage from './features/profile/ProfilePage';
import AccessRulesPage from './features/admin/AccessRulesPage';
import DevicesPage from './features/admin/DevicesPage';
import UserManagement from './features/admin/UserManagement';
import ScannerPage from './features/scanner/ScannerPage';
import DeviceActivation from './features/scanner/DeviceActivation';
import ScanHistory from './features/scanner/ScanHistory';
import OfflinePage from './pages/OfflinePage';
import InstallPrompt from './components/InstallPrompt';
import { ROLES } from './lib/mockData';

function AppRoutes() {
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = user?.role === ROLES.ADMIN || user?.role === ROLES.HUB_MANAGER;

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/offline" element={<OfflinePage />} />

      <Route element={
        <AuthGuard>
          <AppShell />
        </AuthGuard>
      }>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/access-card" element={<AccessCardPage />} />
        <Route path="/membership" element={<MemberDashboard />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/spaces" element={<SpacesPage />} />
        <Route path="/spaces/:id" element={<SpaceDetail />} />
        <Route path="/equipment" element={<EquipmentPage />} />
        <Route path="/equipment/:id" element={<EquipmentDetail />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/activity" element={<LogsPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Admin routes */}
        <Route path="/members" element={
          <AuthGuard allowedRoles={[ROLES.ADMIN, ROLES.HUB_MANAGER]}>
            <AdminMemberList />
          </AuthGuard>
        } />
        <Route path="/logs" element={
          <AuthGuard allowedRoles={[ROLES.ADMIN, ROLES.HUB_MANAGER, ROLES.SECURITY]}>
            <LogsPage />
          </AuthGuard>
        } />
        <Route path="/access-rules" element={
          <AuthGuard allowedRoles={[ROLES.ADMIN, ROLES.HUB_MANAGER]}>
            <AccessRulesPage />
          </AuthGuard>
        } />
        <Route path="/devices" element={
          <AuthGuard allowedRoles={[ROLES.ADMIN, ROLES.HUB_MANAGER]}>
            <DevicesPage />
          </AuthGuard>
        } />
        <Route path="/visitors" element={
          <AuthGuard allowedRoles={[ROLES.ADMIN, ROLES.HUB_MANAGER]}>
            <VisitorManagement />
          </AuthGuard>
        } />
        <Route path="/users" element={
          <AuthGuard allowedRoles={[ROLES.ADMIN, ROLES.HUB_MANAGER]}>
            <UserManagement />
          </AuthGuard>
        } />

        {/* Hub Manager Scanner routes */}
        <Route path="/scanner" element={
          <AuthGuard allowedRoles={[ROLES.HUB_MANAGER, ROLES.ADMIN]}>
            <ScannerPage />
          </AuthGuard>
        } />
        <Route path="/device-setup" element={
          <AuthGuard allowedRoles={[ROLES.HUB_MANAGER, ROLES.ADMIN]}>
            <DeviceActivation />
          </AuthGuard>
        } />
        <Route path="/scan-history" element={
          <AuthGuard allowedRoles={[ROLES.HUB_MANAGER, ROLES.ADMIN]}>
            <ScanHistory />
          </AuthGuard>
        } />
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

export default function App() {
  const init = useThemeStore((state) => state.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <BrowserRouter>
      <AppRoutes />
      <InstallPrompt />
    </BrowserRouter>
  );
}
