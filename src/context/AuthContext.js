import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AuthService from '../services/AuthService';

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

  // Logout function - using static AuthService
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

  // Get appropriate dashboard path
  const getDashboardPath = () => {
    if (!state.isAuthenticated) return '/login';
    
    const role = getUserRole();
    switch (role) {
      case 'admin':
        return '/admin-dashboard';
      case 'assistant':
        return '/assistant-dashboard';
      default:
        return '/login';
    }
  };

  // Check if user can access a route
  const canAccessRoute = (routePath) => {
    if (!state.isAuthenticated) return false;

    const role = getUserRole();
    const routeAccess = {
      '/admin-dashboard': ['admin'],
      '/assistant-dashboard': ['assistant'],
      '/customer': ['admin', 'assistant']
    };

    const allowedRoles = routeAccess[routePath];
    if (!allowedRoles) return true; // Allow access to undefined routes
    
    return allowedRoles.includes(role);
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
    getDashboardPath,
    canAccessRoute
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