import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';  // FIXED: Default import
import { checkPermission, hasRole, hasAnyRole, hasAllRoles } from '../../utils/permissions';

const RoleBasedComponent = ({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  fallback = null,
  showFallback = true,
  requireAll = true, // For permissions: true = must have ALL, false = must have ANY
  requireAllRoles = false, // For roles: true = must have ALL, false = must have ANY
  invert = false, // Show content when user DOESN'T have access
  className = '',
  style = {}
}) => {
  const { user, isAuthenticated } = useContext(AuthContext);

  // If not authenticated, don't show anything unless specified
  if (!isAuthenticated) {
    return showFallback ? fallback : null;
  }

  // If no restrictions specified, show content to all authenticated users
  if (allowedRoles.length === 0 && requiredPermissions.length === 0) {
    return <div className={className} style={style}>{children}</div>;
  }

  let hasAccess = true;

  // Check role-based access
  if (allowedRoles.length > 0) {
    if (requireAllRoles) {
      hasAccess = hasAllRoles(user, allowedRoles);
    } else {
      hasAccess = hasAnyRole(user, allowedRoles);
    }
  }

  // Check permission-based access (only if role check passed)
  if (hasAccess && requiredPermissions.length > 0) {
    if (requireAll) {
      hasAccess = requiredPermissions.every(permission => 
        checkPermission(user, permission)
      );
    } else {
      hasAccess = requiredPermissions.some(permission => 
        checkPermission(user, permission)
      );
    }
  }

  // Apply invert logic if specified
  if (invert) {
    hasAccess = !hasAccess;
  }

  // Render based on access decision
  if (hasAccess) {
    return <div className={className} style={style}>{children}</div>;
  }

  return showFallback ? fallback : null;
};

// Specialized components for common use cases
export const AdminOnly = ({ children, fallback = null, className = '', style = {} }) => (
  <RoleBasedComponent 
    allowedRoles={['admin']} 
    fallback={fallback}
    className={className}
    style={style}
  >
    {children}
  </RoleBasedComponent>
);

export const AssistantOnly = ({ children, fallback = null, className = '', style = {} }) => (
  <RoleBasedComponent 
    allowedRoles={['assistant']} 
    fallback={fallback}
    className={className}
    style={style}
  >
    {children}
  </RoleBasedComponent>
);

export const AdminOrAssistant = ({ children, fallback = null, className = '', style = {} }) => (
  <RoleBasedComponent 
    allowedRoles={['admin', 'assistant']} 
    fallback={fallback}
    className={className}
    style={style}
  >
    {children}
  </RoleBasedComponent>
);

// Permission-based components
export const WithPermission = ({ 
  permission, 
  children, 
  fallback = null, 
  className = '', 
  style = {} 
}) => (
  <RoleBasedComponent 
    requiredPermissions={[permission]} 
    fallback={fallback}
    className={className}
    style={style}
  >
    {children}
  </RoleBasedComponent>
);

export const WithAnyPermission = ({ 
  permissions = [], 
  children, 
  fallback = null, 
  className = '', 
  style = {} 
}) => (
  <RoleBasedComponent 
    requiredPermissions={permissions} 
    requireAll={false}
    fallback={fallback}
    className={className}
    style={style}
  >
    {children}
  </RoleBasedComponent>
);

export const WithAllPermissions = ({ 
  permissions = [], 
  children, 
  fallback = null, 
  className = '', 
  style = {} 
}) => (
  <RoleBasedComponent 
    requiredPermissions={permissions} 
    requireAll={true}
    fallback={fallback}
    className={className}
    style={style}
  >
    {children}
  </RoleBasedComponent>
);

// Higher-order component version
export const withRoleAccess = (
  WrappedComponent, 
  allowedRoles = [], 
  requiredPermissions = [],
  fallbackComponent = null
) => {
  return (props) => (
    <RoleBasedComponent 
      allowedRoles={allowedRoles} 
      requiredPermissions={requiredPermissions}
      fallback={fallbackComponent}
    >
      <WrappedComponent {...props} />
    </RoleBasedComponent>
  );
};

// Conditional rendering hooks for more complex scenarios
export const useRoleAccess = () => {
  const { user, isAuthenticated } = useContext(AuthContext);

  const checkRoleAccess = (allowedRoles = [], requiredPermissions = []) => {
    if (!isAuthenticated) return false;

    let hasAccess = true;

    // Check roles
    if (allowedRoles.length > 0) {
      hasAccess = hasAnyRole(user, allowedRoles);
    }

    // Check permissions
    if (hasAccess && requiredPermissions.length > 0) {
      hasAccess = requiredPermissions.every(permission => 
        checkPermission(user, permission)
      );
    }

    return hasAccess;
  };

  return {
    user,
    isAuthenticated,
    checkRoleAccess,
    isAdmin: hasRole(user, 'admin'),
    isAssistant: hasRole(user, 'assistant'),
    canAccessFinancials: checkRoleAccess(['admin'], ['view_financials']),
    canManageUsers: checkRoleAccess(['admin'], ['manage_users']),
    canViewAllOrders: checkRoleAccess(['admin', 'assistant'], ['view_orders'])
  };
};

export default RoleBasedComponent;