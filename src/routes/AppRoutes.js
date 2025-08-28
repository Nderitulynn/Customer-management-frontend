import { Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Login from '../pages/Login';
import CustomerRegister from '../pages/CustomerRegister';

//Admin components imports
import AdminMain from '../pages/admin/AdminMain.js';

//Assistant components imports
import AssistantDashboard from '../pages/assistant/AssistantDashboard.js';

// Customer components imports
import CustomerDashboard from '../pages/customer/CustomerDashboard';

import { useAuth } from '../context/AuthContext';

// Smart Root Route Component for Role-Based Redirection
const SmartRootRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect based on user role
  if (user?.role === 'admin') {
    return <Navigate to="/admin-dashboard" replace />;
  } else if (user?.role === 'assistant') {
    return <Navigate to="/assistant-dashboard" replace />;
  } else if (user?.role === 'customer') {
    return <Navigate to="/customer-dashboard" replace />;
  }
  
  // Fallback to login if role is unknown
  return <Navigate to="/login" replace />;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<CustomerRegister />} />
      
      {/* Protected Role-Specific Dashboard Routes */}
      <Route path="/admin-dashboard" element={
        <ProtectedRoute requiredRole="admin">
          <AdminMain />
        </ProtectedRoute>
      } />
      
      <Route path="/assistant-dashboard" element={
        <ProtectedRoute requiredRole="assistant">
          <AssistantDashboard />
        </ProtectedRoute>
      } />

      {/* Customer Dashboard Route - Handles all customer sections internally */}
      <Route path="/customer-dashboard" element={
        <ProtectedRoute requiredRole="customer">
          <CustomerDashboard />
        </ProtectedRoute>
      } />

      {/* Customer sub-routes - All handled by CustomerDashboard component */}
      <Route path="/customer/orders" element={
        <ProtectedRoute requiredRole="customer">
          <CustomerDashboard />
        </ProtectedRoute>
      } />

      <Route path="/customer/orders/new" element={
        <ProtectedRoute requiredRole="customer">
          <CustomerDashboard />
        </ProtectedRoute>
      } />

      <Route path="/customer/orders/:orderId" element={
        <ProtectedRoute requiredRole="customer">
          <CustomerDashboard />
        </ProtectedRoute>
      } />

      <Route path="/customer/profile" element={
        <ProtectedRoute requiredRole="customer">
          <CustomerDashboard />
        </ProtectedRoute>
      } />

      {/* Redirect /customer to customer dashboard */}
      <Route path="/customer" element={<Navigate to="/customer-dashboard" replace />} />
      
      {/* Smart Root Route - Role-Based Redirection */}
      <Route path="/" element={<SmartRootRedirect />} />
      
      {/* Catch-all redirect to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}