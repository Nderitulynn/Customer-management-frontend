import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  sessionTimeout: null,
  permissions: [],
  refreshTimer: null
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  TOKEN_REFRESH_SUCCESS: 'TOKEN_REFRESH_SUCCESS',
  TOKEN_REFRESH_FAILURE: 'TOKEN_REFRESH_FAILURE',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SESSION_TIMEOUT_WARNING: 'SESSION_TIMEOUT_WARNING',
  UPDATE_USER_PROFILE: 'UPDATE_USER_PROFILE',
  SET_PERMISSIONS: 'SET_PERMISSIONS'
};

// Auth reducer
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
        error: null,
        permissions: action.payload.permissions || []
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        permissions: []
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false
      };

    case AUTH_ACTIONS.TOKEN_REFRESH_SUCCESS:
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user || state.user,
        error: null
      };

    case AUTH_ACTIONS.TOKEN_REFRESH_FAILURE:
      return {
        ...initialState,
        isLoading: false,
        error: 'Session expired. Please login again.'
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case AUTH_ACTIONS.SESSION_TIMEOUT_WARNING:
      return {
        ...state,
        sessionTimeout: action.payload
      };

    case AUTH_ACTIONS.UPDATE_USER_PROFILE:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload
        }
      };

    case AUTH_ACTIONS.SET_PERMISSIONS:
      return {
        ...state,
        permissions: action.payload
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

  // Session timeout duration (30 minutes)
  const SESSION_TIMEOUT = 30 * 60 * 1000;
  const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before timeout

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  // Set up token refresh timer
  useEffect(() => {
    if (state.isAuthenticated && state.token) {
      setupTokenRefresh();
      setupSessionTimeout();
    }
    return () => {
      clearRefreshTimer();
      clearSessionTimeout();
    };
  }, [state.isAuthenticated, state.token]);

  // Initialize authentication
  const initializeAuth = async () => {
    try {
      // Updated storage keys to match AuthService
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        const user = JSON.parse(userData);
        
        // Verify token validity
        const isValid = await authService.verifyToken(token);
        
        if (isValid) {
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user,
              token,
              permissions: user.permissions || []
            }
          });
        } else {
          // Token is invalid, clear stored data
          clearStoredAuth();
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      clearStoredAuth();
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Helper function to format error messages
  const formatErrorMessage = (error) => {
    // Handle validation errors from backend
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      if (Array.isArray(errors)) {
        return errors.map(err => err.message || err.msg || err).join(', ');
      }
      return 'Validation failed. Please check your input.';
    }
    
    // Handle standard error messages
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    // Handle network errors
    if (error.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred. Please try again.';
  };

  // Login function - FIXED
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await authService.login(credentials);
      
      // FIX: Extract data directly from response (not nested under .data)
      if (response.success) {
        const { user, token, permissions } = response;
        
        // Store authentication data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('loginTime', Date.now().toString());

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token, permissions }
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
      const errorMessage = formatErrorMessage(error);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });
      return { success: false, message: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API to invalidate token on server
      if (state.token) {
        await authService.logout(state.token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearStoredAuth();
      clearRefreshTimer();
      clearSessionTimeout();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Token refresh function
  const refreshToken = async () => {
    try {
      // Updated storage key to match AuthService
      const currentToken = state.token || localStorage.getItem('token');
      
      if (!currentToken) {
        throw new Error('No token available for refresh');
      }

      const response = await authService.refreshToken(currentToken);
      
      if (response.success) {
        const { token, user } = response;
        
        // Updated storage keys to match AuthService
        localStorage.setItem('token', token);
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }

        dispatch({
          type: AUTH_ACTIONS.TOKEN_REFRESH_SUCCESS,
          payload: { token, user }
        });

        return true;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      dispatch({ type: AUTH_ACTIONS.TOKEN_REFRESH_FAILURE });
      clearStoredAuth();
      return false;
    }
  };

  // Update user profile
  const updateUserProfile = async (userData) => {
    try {
      const response = await authService.updateProfile(userData);
      
      if (response.success) {
        const updatedUser = response.user || response;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER_PROFILE,
          payload: updatedUser
        });

        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = formatErrorMessage(error);
      return { success: false, message: errorMessage };
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!state.isAuthenticated || !state.user) return false;
    
    // Admin has all permissions
    if (state.user.role === 'admin') return true;
    
    // Check specific permissions
    return state.permissions.includes(permission);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.isAuthenticated && state.user?.role === role;
  };

  // Check if user can access feature
  const canAccess = (feature) => {
    if (!state.isAuthenticated) return false;
    
    const rolePermissions = {
      admin: [
        'view_dashboard',
        'manage_customers',
        'manage_orders',
        'view_whatsapp',
        'manage_whatsapp',
        'view_financial',
        'manage_financial',
        'view_analytics',
        'manage_users',
        'manage_settings'
      ],
      assistant: [
        'view_dashboard',
        'manage_customers',
        'manage_orders',
        'view_whatsapp',
        'view_basic_analytics'
      ]
    };

    const userPermissions = rolePermissions[state.user?.role] || [];
    return userPermissions.includes(feature);
  };

  // Setup token refresh timer
  const setupTokenRefresh = () => {
    clearRefreshTimer();
    
    // Refresh token every 25 minutes (before 30-minute expiry)
    const refreshInterval = 25 * 60 * 1000;
    
    const timer = setInterval(() => {
      refreshToken();
    }, refreshInterval);

    // Store timer reference for cleanup
    state.refreshTimer = timer;
  };

  // Setup session timeout
  const setupSessionTimeout = () => {
    clearSessionTimeout();
    
    // Updated storage key to match AuthService
    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime) return;

    const elapsed = Date.now() - parseInt(loginTime);
    const remaining = SESSION_TIMEOUT - elapsed;

    if (remaining <= 0) {
      // Session already expired
      logout();
      return;
    }

    // Set warning timer
    const warningTime = remaining - WARNING_TIME;
    if (warningTime > 0) {
      setTimeout(() => {
        dispatch({
          type: AUTH_ACTIONS.SESSION_TIMEOUT_WARNING,
          payload: true
        });
      }, warningTime);
    }

    // Set logout timer
    setTimeout(() => {
      logout();
    }, remaining);
  };

  // Clear refresh timer
  const clearRefreshTimer = () => {
    if (state.refreshTimer) {
      clearInterval(state.refreshTimer);
    }
  };

  // Clear session timeout
  const clearSessionTimeout = () => {
    dispatch({
      type: AUTH_ACTIONS.SESSION_TIMEOUT_WARNING,
      payload: false
    });
  };

  // Clear stored authentication data
  const clearStoredAuth = () => {
    // Updated storage keys to match AuthService
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Extend session
  const extendSession = () => {
    localStorage.setItem('loginTime', Date.now().toString());
    setupSessionTimeout();
    dispatch({
      type: AUTH_ACTIONS.SESSION_TIMEOUT_WARNING,
      payload: false
    });
  };

  // Context value
  const value = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    sessionTimeout: state.sessionTimeout,
    permissions: state.permissions,

    // Actions
    login,
    logout,
    refreshToken,
    updateUserProfile,
    clearError,
    extendSession,

    // Permission checks
    hasPermission,
    hasRole,
    canAccess
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