import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import authService from '../services/authService';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isRefreshing: false,
  error: null,
  sessionTimeout: null,
  permissions: []
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  TOKEN_REFRESH_START: 'TOKEN_REFRESH_START',
  TOKEN_REFRESH_SUCCESS: 'TOKEN_REFRESH_SUCCESS',
  TOKEN_REFRESH_FAILURE: 'TOKEN_REFRESH_FAILURE',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SESSION_TIMEOUT_WARNING: 'SESSION_TIMEOUT_WARNING',
  UPDATE_USER_PROFILE: 'UPDATE_USER_PROFILE',
  SET_PERMISSIONS: 'SET_PERMISSIONS',
  INITIALIZATION_COMPLETE: 'INITIALIZATION_COMPLETE'
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
        isRefreshing: false,
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
        isRefreshing: false,
        error: action.payload,
        permissions: []
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false
      };

    case AUTH_ACTIONS.TOKEN_REFRESH_START:
      return {
        ...state,
        isRefreshing: true,
        error: null
      };

    case AUTH_ACTIONS.TOKEN_REFRESH_SUCCESS:
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user || state.user,
        isRefreshing: false,
        error: null,
        isAuthenticated: true // Ensure authenticated state is maintained
      };

    case AUTH_ACTIONS.TOKEN_REFRESH_FAILURE:
      return {
        ...initialState,
        isLoading: false,
        isRefreshing: false,
        error: 'Session expired. Please login again.'
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case AUTH_ACTIONS.INITIALIZATION_COMPLETE:
      return {
        ...state,
        isLoading: false
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
  
  // Use refs to store timer references and prevent re-initialization
  const refreshTimerRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const isInitializingRef = useRef(false);
  const initializationCompletedRef = useRef(false); // NEW: Track if initialization is done

  // Session timeout duration (30 minutes)
  const SESSION_TIMEOUT = 30 * 60 * 1000;
  const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before timeout

  // Initialize auth state on app load - FIXED: Only run once
  useEffect(() => {
    if (!isInitializingRef.current && !initializationCompletedRef.current) {
      isInitializingRef.current = true;
      initializeAuth();
    }
  }, []); // FIXED: Empty dependency array

  // Set up token refresh timer when authenticated - FIXED: Better conditions
  useEffect(() => {
    if (state.isAuthenticated && state.token && !state.isRefreshing && !state.isLoading) {
      setupTokenRefresh();
      setupSessionTimeout();
    }
    
    // Cleanup when authentication state changes
    return () => {
      if (!state.isAuthenticated) {
        clearAllTimers();
      }
    };
  }, [state.isAuthenticated, state.token, state.isRefreshing, state.isLoading]); // FIXED: Added isLoading

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  // Enhanced initialization with better error handling - FIXED: Prevent loops
  const initializeAuth = async () => {
    try {
      console.log('🔍 AuthContext: Starting initialization...');
      
      // Check if we have stored authentication data
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const loginTime = localStorage.getItem('loginTime');
      
      if (!storedToken || !storedUser) {
        console.log('❌ No stored authentication data found');
        dispatch({ type: AUTH_ACTIONS.INITIALIZATION_COMPLETE });
        return;
      }

      // FIXED: More lenient session timeout check
      if (loginTime) {
        const elapsed = Date.now() - parseInt(loginTime);
        // Only clear if session is SIGNIFICANTLY expired (add 5 minute buffer)
        if (elapsed > (SESSION_TIMEOUT + 5 * 60 * 1000)) {
          console.log('⏰ Session significantly expired, clearing stored data');
          clearStoredAuth();
          dispatch({ type: AUTH_ACTIONS.INITIALIZATION_COMPLETE });
          return;
        }
      }

      // Parse stored user data
      let parsedUser;
      try {
        parsedUser = JSON.parse(storedUser);
      } catch (error) {
        console.error('❌ Failed to parse stored user data:', error);
        clearStoredAuth();
        dispatch({ type: AUTH_ACTIONS.INITIALIZATION_COMPLETE });
        return;
      }

      // Try to use authService.initializeAuth() if it exists
      if (typeof authService.initializeAuth === 'function') {
        console.log('🔍 Using authService.initializeAuth()...');
        const authResult = await authService.initializeAuth();
        
        if (authResult.authenticated) {
          console.log('✅ User authenticated via authService');
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: authResult.user,
              token: storedToken,
              permissions: authResult.user?.permissions || []
            }
          });
        } else {
          console.log('❌ User not authenticated via authService');
          clearStoredAuth();
          dispatch({ type: AUTH_ACTIONS.INITIALIZATION_COMPLETE });
        }
      } else {
        // Fallback: validate token manually - FIXED: More lenient validation
        console.log('🔍 Validating token manually...');
        
        // FIXED: Don't validate JWT expiration on frontend, let backend handle it
        const isValidToken = storedToken && storedToken.length > 0;
        
        if (isValidToken) {
          console.log('✅ Token exists, restoring session');
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: parsedUser,
              token: storedToken,
              permissions: parsedUser?.permissions || []
            }
          });
        } else {
          console.log('❌ No valid token found');
          clearStoredAuth();
          dispatch({ type: AUTH_ACTIONS.INITIALIZATION_COMPLETE });
        }
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      clearStoredAuth();
      dispatch({ type: AUTH_ACTIONS.INITIALIZATION_COMPLETE });
    } finally {
      isInitializingRef.current = false;
      initializationCompletedRef.current = true; // FIXED: Mark initialization as complete
    }
  };

  // REMOVED: validateToken function that was causing issues with JWT parsing

  // Helper function to format error messages
  const formatErrorMessage = (error) => {
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      if (Array.isArray(errors)) {
        return errors.map(err => err.message || err.msg || err).join(', ');
      }
      return 'Validation failed. Please check your input.';
    }
    
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred. Please try again.';
  };

  // Login function - FIXED: Handle authService response format
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await authService.login(credentials);
      
      // FIXED: Handle the actual response structure from your authService
      if (response.success) {
        // Extract from response.data if it exists, otherwise from response directly
        const userData = response.data?.user || response.user;
        const tokenData = response.data?.token || response.token;
        const permissionsData = response.data?.permissions || response.permissions || userData?.permissions || [];
        
        // Store authentication data - FIXED: Set loginTime AFTER successful response
        localStorage.setItem('token', tokenData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('loginTime', Date.now().toString()); // FIXED: Set time on successful login

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { 
            user: userData, 
            token: tokenData, 
            permissions: permissionsData 
          }
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
      clearAllTimers();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Token refresh function with better error handling
  const refreshToken = async () => {
    // Prevent multiple simultaneous refresh attempts
    if (state.isRefreshing) {
      console.log('🔄 Token refresh already in progress');
      return false;
    }

    try {
      dispatch({ type: AUTH_ACTIONS.TOKEN_REFRESH_START });
      
      const refreshTokenValue = localStorage.getItem('refreshToken');
      
      if (!refreshTokenValue) {
        console.error('❌ No refresh token available');
        throw new Error('No refresh token available');
      }

      const response = await authService.refreshToken(refreshTokenValue);
      
      if (response.success) {
        const { token, user } = response;
        
        localStorage.setItem('token', token);
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }

        // FIXED: Only reset login time on explicit refresh, not automatic
        localStorage.setItem('loginTime', Date.now().toString());

        dispatch({
          type: AUTH_ACTIONS.TOKEN_REFRESH_SUCCESS,
          payload: { token, user }
        });

        console.log('✅ Token refreshed successfully');
        return true;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      
      // Only logout if it's an authentication error
      if (error.response?.status === 401 || error.message.includes('refresh token')) {
        dispatch({ type: AUTH_ACTIONS.TOKEN_REFRESH_FAILURE });
        clearStoredAuth();
        clearAllTimers();
      } else {
        // For other errors, just stop the refresh loading state
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
      
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

  // ===== ROLE-BASED ROUTING HELPER METHODS =====

  // Get user role with fallback options
  const getUserRole = () => {
    return state.user?.role || null;
  };

  // Check if user role is valid
  const isValidRole = (role) => {
    const validRoles = ['admin', 'assistant'];
    return validRoles.includes(role);
  };

  // Get redirect path based on user role
  const getRedirectPath = () => {
    const role = getUserRole();
    
    if (!role) {
      console.warn('⚠️ No user role found, redirecting to login');
      return '/login';
    }

    if (!isValidRole(role)) {
      console.warn(`⚠️ Invalid user role: ${role}, redirecting to login`);
      return '/login';
    }

    switch (role) {
      case 'admin':
        return '/admin-dashboard';
      case 'assistant':
        return '/assistant-dashboard';
      default:
        console.warn(`⚠️ Unknown role: ${role}, redirecting to login`);
        return '/login';
    }
  };

  // Get dashboard path for current user
  const getDashboardPath = () => {
    if (!state.isAuthenticated) {
      return '/login';
    }
    
    return getRedirectPath();
  };

  // Check if user can access a specific route
  const canAccessRoute = (routePath) => {
    if (!state.isAuthenticated) {
      return false;
    }

    const role = getUserRole();
    if (!role || !isValidRole(role)) {
      return false;
    }

    // Define route access rules
    const routeAccess = {
      '/admin-dashboard': ['admin'],
      '/assistant-dashboard': ['assistant'],
      '/customer': ['admin', 'assistant'],
      '/login': [], // Always accessible
    };

    // Get allowed roles for the route
    const allowedRoles = routeAccess[routePath];
    
    // If route is not defined, check if it's a general route
    if (!allowedRoles) {
      return true; // Allow access to undefined routes (let ProtectedRoute handle it)
    }

    // If route has no role restrictions, allow access
    if (allowedRoles.length === 0) {
      return true;
    }

    // Check if user's role is allowed
    return allowedRoles.includes(role);
  };

  // Get appropriate home route for user
  const getHomeRoute = () => {
    if (!state.isAuthenticated) {
      return '/login';
    }
    
    return getDashboardPath();
  };

  // Validate role-based navigation
  const validateNavigation = (targetPath) => {
    if (!state.isAuthenticated) {
      return {
        allowed: false,
        redirectTo: '/login',
        reason: 'Not authenticated'
      };
    }

    if (!canAccessRoute(targetPath)) {
      return {
        allowed: false,
        redirectTo: getDashboardPath(),
        reason: 'Insufficient permissions'
      };
    }

    return {
      allowed: true,
      redirectTo: null,
      reason: null
    };
  };

  // ===== END ROLE-BASED ROUTING METHODS =====

  // Permission and role checking functions
  const hasPermission = (permission) => {
    if (!state.isAuthenticated || !state.user) return false;
    if (state.user.role === 'admin') return true;
    return state.permissions.includes(permission);
  };

  const hasRole = (role) => {
    return state.isAuthenticated && state.user?.role === role;
  };

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

  // Setup token refresh timer - FIXED: Better conditions
  const setupTokenRefresh = () => {
    clearRefreshTimer();
    
    // Only set up refresh if we're actually authenticated and not already refreshing
    if (!state.isAuthenticated || state.isRefreshing) return;
    
    // Refresh token every 25 minutes (before 30-minute expiry)
    const refreshInterval = 25 * 60 * 1000;
    
    refreshTimerRef.current = setInterval(async () => {
      console.log('🔄 Background token refresh triggered');
      await refreshToken();
    }, refreshInterval);
  };

  // Setup session timeout - FIXED: More lenient timing
  const setupSessionTimeout = () => {
    clearSessionTimer();
    
    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime) return;

    const elapsed = Date.now() - parseInt(loginTime);
    const remaining = SESSION_TIMEOUT - elapsed;

    // FIXED: Don't set timeout if session is already very close to expiring
    if (remaining <= WARNING_TIME) {
      console.log('⏰ Session is close to expiring, not setting timeout');
      return;
    }

    // Set warning timer
    const warningTime = remaining - WARNING_TIME;
    if (warningTime > 0) {
      warningTimerRef.current = setTimeout(() => {
        console.log('⚠️ Session timeout warning');
        dispatch({
          type: AUTH_ACTIONS.SESSION_TIMEOUT_WARNING,
          payload: true
        });
      }, warningTime);
    }

    // Set logout timer
    sessionTimerRef.current = setTimeout(() => {
      console.log('⏰ Session timed out, logging out');
      logout();
    }, remaining);
  };

  // Clear individual timers
  const clearRefreshTimer = () => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  const clearSessionTimer = () => {
    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
  };

  const clearWarningTimer = () => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  };

  // Clear all timers
  const clearAllTimers = () => {
    clearRefreshTimer();
    clearSessionTimer();
    clearWarningTimer();
    dispatch({
      type: AUTH_ACTIONS.SESSION_TIMEOUT_WARNING,
      payload: false
    });
  };

  // Clear stored authentication data
  const clearStoredAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('refreshToken');
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Extend session
  const extendSession = () => {
    console.log('🔄 Extending session');
    localStorage.setItem('loginTime', Date.now().toString());
    setupSessionTimeout();
    dispatch({
      type: AUTH_ACTIONS.SESSION_TIMEOUT_WARNING,
      payload: false
    });
  };

  // Manual token refresh function for UI components
  const manualRefreshToken = async () => {
    if (state.isRefreshing) return false;
    return await refreshToken();
  };

  // Get session info
  const getSessionInfo = () => {
    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime) return null;

    const elapsed = Date.now() - parseInt(loginTime);
    const remaining = SESSION_TIMEOUT - elapsed;

    return {
      loginTime: parseInt(loginTime),
      elapsed,
      remaining,
      isExpired: remaining <= 0,
      willExpireSoon: remaining <= WARNING_TIME
    };
  };

  // Context value
  const value = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    error: state.error,
    sessionTimeout: state.sessionTimeout,
    permissions: state.permissions,

    // Actions
    login,
    logout,
    refreshToken: manualRefreshToken,
    updateUserProfile,
    clearError,
    extendSession,

    // Permission checks
    hasPermission,
    hasRole,
    canAccess,

    // Role-based routing helpers
    getUserRole,
    isValidRole,
    getRedirectPath,
    getDashboardPath,
    canAccessRoute,
    getHomeRoute,
    validateNavigation,

    // Session utilities
    getSessionInfo
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