import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

import { UserDashboard } from './pages/UserDashboard';
import { StaffDashboard } from './pages/StaffDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

import { BookAppointmentPage } from './pages/BookAppointmentPage';
import { MyAppointmentsPage } from './pages/MyAppointmentsPage';
import { StaffSchedulePage } from './pages/StaffSchedulePage';
import { AppointmentDetailsPage } from './pages/AppointmentDetailsPage';
import { ProfilePage } from './pages/ProfilePage';

import { ManageUsersPage } from './pages/ManageUsersPage';
import { ManageStaffPage } from './pages/ManageStaffPage';
import { ManageServicesPage } from './pages/ManageServicesPage';
import { ManageAppointmentsPage } from './pages/ManageAppointmentsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { Loader } from './components/common/Loader';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <Loader message="Verifying security credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Dynamic Dashboard Resolver based on user role
const RoleDashboardResolver = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'staff') return <StaffDashboard />;
  return <UserDashboard />;
};

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Authenticated Workspace Pages */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<RoleDashboardResolver />} />
        <Route path="/book" element={<BookAppointmentPage />} />
        <Route path="/my-appointments" element={<MyAppointmentsPage />} />
        <Route path="/schedule" element={<StaffSchedulePage />} />
        <Route path="/appointments/:id" element={<AppointmentDetailsPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Admin Management Routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageStaffPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/services"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageServicesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageAppointmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
