import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Financials from './pages/Financials';
import Login from './pages/Login';
import ManageDiseases from './pages/ManageDiseases';
import ManageFees from './pages/ManageFees';
import UsersPage from './pages/Users';
import LandingPage from './pages/LandingPage';
import ManageArticles from './pages/ManageArticles';
import Consultations from './pages/Consultations';
import PaymentsPage from './pages/PaymentsPage';
import SupportTickets from './pages/SupportTickets';
import ServicesManagement from './pages/ServicesManagement';
import VaccinationPage from './pages/VaccinationPage';
import ReportsPage from './pages/ReportsPage';
import VaccineManagement from './pages/VaccineManagement';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

// Public Route Wrapper (redirects to dashboard if logged in)
const PublicRoute = ({ children }: { children: React.ReactElement }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (token) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Admin Login Route */}
      <Route path="/admin/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/login" element={<Navigate to="/admin/login" replace />} />

      {/* Protected Admin routes nested under /admin */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="financials" element={<Financials />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="fees" element={<ManageFees />} />
        <Route path="diseases" element={<ManageDiseases />} />
        <Route path="blogs" element={<ManageArticles />} />
        <Route path="consultations" element={<Consultations />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="support" element={<SupportTickets />} />
        <Route path="services" element={<ServicesManagement />} />
        <Route path="vaccination" element={<VaccinationPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="vaccines" element={<VaccineManagement />} />
      </Route>

      {/* Fallback to Landing Page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
