import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AuthService from '../services/authService';

// Initial state - simplified
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Action types - simplified
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
  INIT_COMPLETE: 'INIT_COMPLETE'
};

// Auth reducer - simplified
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case AUTH_ACTIONS.INIT_COMPLETE:
      return {
        ...state,
        isLoading: false
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  // Simple initialization - check if user is stored
  const initializeAuth = () => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: parsedUser,
            token: storedToken
          }
        });
      } else {
        dispatch({ type: AUTH_ACTIONS.INIT_COMPLETE });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      clearStoredAuth();
      dispatch({ type: AUTH_ACTIONS.INIT_COMPLETE });
    }
  };

  // Login function - using static AuthService
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await AuthService.login(credentials);

      if (response.success) {
        const { user, token } = response.data || response;

        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token }
        });

        return { success: true };
      } else {
        const errorMessage = response.message || 'Login failed';
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: errorMessage
        });
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });
      return { success: false, message: errorMessage };
    }
  };

  // Logout function - updated with redirect
  const logout = async () => {
    try {
      if (state.token) {
        await AuthService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearStoredAuth();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      // Redirect to login page after logout
      window.location.href = '/login';
    }
  };

  // Clear stored authentication data
  const clearStoredAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Simple role checking
  const getUserRole = () => {
    return state.user?.role || null;
  };

  const hasRole = (role) => {
    return state.isAuthenticated && state.user?.role === role;
  };

  const isAdmin = () => {
    return hasRole('admin');
  };

  const isAssistant = () => {
    return hasRole('assistant');
  };

  // ✅ ADDED: Customer role checking function
  const isCustomer = () => {
    return hasRole('customer');
  };

  // ✅ ADDED: Check if user has any staff role (admin or assistant)
  const isStaff = () => {
    return isAdmin() || isAssistant();
  };

  // ✅ UPDATED: Get appropriate dashboard path - now includes customer
  const getDashboardPath = () => {
    if (!state.isAuthenticated) return '/login';
    
    const role = getUserRole();
    switch (role) {
      case 'admin':
        return '/admin-dashboard';
      case 'assistant':
        return '/assistant-dashboard';
      case 'customer':
        return '/customer-dashboard';
      default:
        return '/login';
    }
  };

  // ✅ UPDATED: Check if user can access a route - now includes customer routes
  const canAccessRoute = (routePath) => {
    if (!state.isAuthenticated) return false;

    const role = getUserRole();
    const routeAccess = {
      // Admin routes
      '/admin-dashboard': ['admin'],
      '/admin': ['admin'],
      
      // Assistant routes
      '/assistant-dashboard': ['assistant', 'admin'],
      '/assistant': ['assistant', 'admin'],
      
      // Customer routes - only customers can access
      '/customer-dashboard': ['customer'],
      '/customer': ['customer'],
      '/customer/orders': ['customer'],
      '/customer/profile': ['customer'],
      '/customer/orders/new': ['customer'],
      
      // Shared routes - staff can manage customers
      '/customers': ['admin', 'assistant'],
      '/orders': ['admin', 'assistant']
    };

    const allowedRoles = routeAccess[routePath];
    if (!allowedRoles) return true; // Allow access to undefined routes
    
    return allowedRoles.includes(role);
  };

  // ✅ ADDED: Get user display name with fallback
  const getUserDisplayName = () => {
    if (!state.user) return null;
    return state.user.name || 
           state.user.firstName || 
           state.user.fullName || 
           state.user.username || 
           state.user.email?.split('@')[0] || 
           'User';
  };

  // ✅ ADDED: Check if current user owns a resource
  const isOwner = (resourceUserId) => {
    if (!state.isAuthenticated || !state.user) return false;
    return state.user.id === resourceUserId || state.user._id === resourceUserId;
  };

  // ✅ ADDED: Check if user can perform action based on role hierarchy
  const canPerformAction = (action, targetUserRole = null) => {
    if (!state.isAuthenticated) return false;
    
    const userRole = getUserRole();
    
    const permissions = {
      // Admin can do everything
      admin: {
        createCustomer: true,
        editCustomer: true,
        deleteCustomer: true,
        viewAllOrders: true,
        editAllOrders: true,
        manageUsers: true,
        viewReports: true
      },
      
      // Assistant can manage customers and orders but not users
      assistant: {
        createCustomer: true,
        editCustomer: true,
        deleteCustomer: false,
        viewAllOrders: true,
        editAllOrders: true,
        manageUsers: false,
        viewReports: true
      },
      
      // Customer can only manage own data
      customer: {
        createCustomer: false,
        editCustomer: false,
        deleteCustomer: false,
        viewAllOrders: false,
        editAllOrders: false,
        manageUsers: false,
        viewReports: false,
        createOrder: true,
        editOwnOrder: true,
        viewOwnOrders: true,
        cancelOwnOrder: true,
        editOwnProfile: true
      }
    };

    const userPermissions = permissions[userRole];
    if (!userPermissions) return false;
    
    return userPermissions[action] || false;
  };

  // ✅ ADDED: Get all valid roles for the system
  const getValidRoles = () => {
    return ['admin', 'assistant', 'customer'];
  };

  // ✅ ADDED: Check if user has higher role than target
  const hasHigherRoleThan = (targetRole) => {
    if (!state.isAuthenticated) return false;
    
    const roleHierarchy = {
      admin: 3,
      assistant: 2,
      customer: 1
    };
    
    const userRoleLevel = roleHierarchy[getUserRole()] || 0;
    const targetRoleLevel = roleHierarchy[targetRole] || 0;
    
    return userRoleLevel > targetRoleLevel;
  };

  // Context value
  const value = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    login,
    logout,
    clearError,

    // Role checks
    getUserRole,
    hasRole,
    isAdmin,
    isAssistant,
    isCustomer,        // ✅ ADDED
    isStaff,           // ✅ ADDED
    getDashboardPath,
    canAccessRoute,

    // ✅ ADDED: User utility functions
    getUserDisplayName,
    isOwner,
    canPerformAction,
    getValidRoles,
    hasHigherRoleThan
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export { AuthContext };
export default AuthContext;