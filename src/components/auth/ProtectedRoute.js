import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { checkPermission, hasAnyRole } from '../../utils/permissions';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  requiredPermissions = [],
  requiredRole = null,
  fallbackPath = '/login',
  showFallback = false,
  fallbackComponent = null 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" message="Verifying access..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Handle role-based dashboard routing with admin cross-access
  if (requiredRole) {
    // Admin can access any dashboard (cross-role access)
    if (user?.role === 'admin') {
      return children;
    }
    
    // Assistant can only access their own dashboard
    if (user?.role !== requiredRole) {
      // Redirect to appropriate dashboard based on user role
      const userDashboard = user?.role === 'admin' ? '/admin-dashboard' : '/assistant-dashboard';
      return (
        <Navigate 
          to={userDashboard} 
          state={{ from: location.pathname }} 
          replace 
        />
      );
    }
  }

  // REMOVED: Legacy dashboard routing logic since you only want role-specific dashboards
  // This was causing conflicts with your direct role-based navigation approach

  // Check role-based access
  if (allowedRoles.length > 0 && !hasAnyRole(user, allowedRoles)) {
    if (showFallback && fallbackComponent) {
      return fallbackComponent;
    }
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check permission-based access
  if (requiredPermissions.length > 0 && 
      !requiredPermissions.every(perm => checkPermission(user, perm))) {
    if (showFallback && fallbackComponent) {
      return fallbackComponent;
    }
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // All checks passed, render the protected component
  return children;
};

// Higher-order component version for easier usage
export const withProtectedRoute = (
  WrappedComponent, 
  allowedRoles = [], 
  requiredPermissions = []
) => {
  return (props) => (
    <ProtectedRoute 
      allowedRoles={allowedRoles} 
      requiredPermissions={requiredPermissions}
    >
      <WrappedComponent {...props} />
    </ProtectedRoute>
  );
};

// Specific route protectors for common use cases
export const AdminOnlyRoute = ({ children }) => (
  <ProtectedRoute requiredRole="admin">
    {children}
  </ProtectedRoute>
);

export const AssistantOnlyRoute = ({ children }) => (
  <ProtectedRoute requiredRole="assistant">
    {children}
  </ProtectedRoute>
);

export const AuthenticatedRoute = ({ children }) => (
  <ProtectedRoute>
    {children}
  </ProtectedRoute>
);

export const AdminOrAssistantRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin', 'assistant']}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;