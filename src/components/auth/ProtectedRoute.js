import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { checkPermission, hasRole } from '../../utils/permissions';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  requiredPermissions = [],
  fallbackPath = '/login',
  showFallback = false,
  fallbackComponent = null 
}) => {
  const { user, isAuthenticated, isLoading, checkAuthStatus } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated && !isLoading) {
        await checkAuthStatus();
      }
      setIsChecking(false);
    };

    verifyAuth();
  }, [isAuthenticated, isLoading, checkAuthStatus]);

  // Show loading spinner while checking authentication
  if (isLoading || isChecking) {
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

  // Check role-based access
  if (allowedRoles.length > 0 && !hasRole(user, allowedRoles)) {
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
  <ProtectedRoute allowedRoles={['admin']}>
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