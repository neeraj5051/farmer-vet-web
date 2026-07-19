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
import ManageServiceCards from './pages/ManageServiceCards';

// Admin V2 Imports
import AdminLayoutV2 from './layouts/AdminLayoutV2';
import OperationsOverview from './pages/admin-v2/OperationsOverview';
import FinancialOverview from './pages/admin-v2/FinancialOverview';
import RevenueScreen from './pages/admin-v2/RevenueScreen';
import VetPayoutsScreen from './pages/admin-v2/VetPayoutsScreen';
import TransactionsScreen from './pages/admin-v2/TransactionsScreen';
import BookingsScreen from './pages/admin-v2/BookingsScreen';
import ConsultationsScreen from './pages/admin-v2/ConsultationsScreen';
import FarmersScreen from './pages/admin-v2/FarmersScreen';
import VetsScreen from './pages/admin-v2/VetsScreen';
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
    const userStr = localStorage.getItem('user');
    let role = '';
    if (userStr) {
      try { role = JSON.parse(userStr).role; } catch (e) {}
    }
    if (role === 'support_executive') {
      return <Navigate to="/support" replace />;
    }
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
        <Route path="articles" element={<ManageArticles />} />
        <Route path="service-cards" element={<ManageServiceCards />} />
        <Route path="consultations" element={<Consultations />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="support" element={<SupportTickets />} />
        <Route path="services" element={<ServicesManagement />} />
        <Route path="vaccination" element={<VaccinationPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="vaccines" element={<VaccineManagement />} />
      </Route>

      {/* Protected Admin V2 routes (New Redesign) */}
      <Route path="/admin-v2" element={
        <AdminLayoutV2 />
      }>
        <Route index element={<Navigate to="operations" replace />} />
        <Route path="operations" element={<OperationsOverview />} />
        <Route path="financials" element={<FinancialOverview />} />
        <Route path="revenue" element={<RevenueScreen />} />
        <Route path="payouts" element={<VetPayoutsScreen />} />
        <Route path="transactions" element={<TransactionsScreen />} />
        <Route path="bookings" element={<BookingsScreen />} />
        <Route path="consultations" element={<ConsultationsScreen />} />
        <Route path="farmers" element={<FarmersScreen />} />
        <Route path="vets" element={<VetsScreen />} />
        {/* Stub routes for remaining pages */}
        <Route path="*" element={<div style={{padding: 24}}>Content coming soon in subsequent phases.</div>} />
      </Route>

      {/* Protected Support Executive route */}
      <Route path="/support" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<SupportTickets />} />
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
