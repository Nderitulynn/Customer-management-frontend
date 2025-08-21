import axios from 'axios';

// API Base Configuration
const API_BASE_URL = 'http://localhost:5000'; //Temporary fix

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simplified token management functions
const getAuthToken = () => {
  return localStorage.getItem('token');
};

const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// SIMPLIFIED Request interceptor - Remove async complexity
api.interceptors.request.use(
  (config) => {
    try {
      // Direct localStorage access - no async operations
      const token = getAuthToken();
      
      if (token && !isTokenExpired(token)) {
        config.headers.Authorization = `Bearer ${token}`;
        
        // Debug logging
        if (import.meta.env.DEV) {
          console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
          console.log('Auth header included:', `Bearer ${token.substring(0, 20)}...`);
        }
      } else {
        if (import.meta.env.DEV) {
          console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
          console.log('No valid token found - request sent without auth');
        }
      }

      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// SIMPLIFIED Response interceptor - Remove async complexity
api.interceptors.response.use(
  (response) => {
    // Simple response logging for development
    if (import.meta.env.DEV) {
      console.log(`API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    const originalRequest = error.config;

    // Handle authentication errors - simplified approach
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log('Received 401 - clearing auth data and redirecting to login');
      
      // Direct cleanup - no async operations
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('rememberMe');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Enhanced error logging
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method,
        message: error.response?.data?.message || error.message
      });
    }

    return Promise.reject(error);
  }
);

// Simplified API helper functions with consistent response handling
export const apiHelpers = {
  // GET request with simplified response handling
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST request with simplified response handling
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT request
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PATCH request
  patch: async (url, data = {}, config = {}) => {
    try {
      const response = await api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE request
  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// API endpoints constants - Updated with MESSAGES endpoints
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    REGISTER_ADMIN: '/api/auth/register-admin',
    REGISTER_CUSTOMER: '/api/auth/register-customer',
    VERIFY: '/api/auth/verify-token',
    VERIFY_TOKEN: '/api/auth/verify-token',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    CHANGE_PASSWORD: '/api/auth/change-password',
  },

  // User management endpoints
  USERS: {
    // Admin endpoints
    LIST_ALL: '/api/users',
    REGISTER_ADMIN: '/api/users/register-admin',
    
    // Assistant management endpoints (admin only)
    ASSISTANTS: {
      LIST: '/api/users/assistants',
      GET: (id) => `/api/users/assistants/${id}`,
      CREATE: '/api/users/assistants',
      UPDATE: (id) => `/api/users/assistants/${id}`,
      DELETE: (id) => `/api/users/assistants/${id}`,
      TOGGLE_STATUS: (id) => `/api/users/assistants/${id}/status`,
      RESET_PASSWORD: (id) => `/api/users/assistants/${id}/reset-password`,
    },

    // Profile endpoints (both admin & assistant)
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
    CHANGE_PASSWORD: '/api/users/change-password',
    
    // Customer assignment endpoints (admin only)
    ASSIGN_CUSTOMER: '/api/users/assign-customer',
    UNASSIGN_CUSTOMER: '/api/users/unassign-customer',
  },

  // Customer endpoints
  CUSTOMERS: {
    LIST: '/api/customers',
    GET: (id) => `/api/customers/${id}`,
    CREATE: '/api/customers',
    UPDATE: (id) => `/api/customers/${id}`,
    DELETE: (id) => `/api/customers/${id}`,
    CLAIM: (id) => `/api/customers/${id}/claim`,
    ASSIGN: (id) => `/api/customers/${id}/assign`,
    ORDERS: (id) => `/api/customers/${id}/orders`,
    
    RECENT: '/api/customers/recent',
    UNASSIGNED: '/api/customers',
    ASSIGNED: '/api/customers',
  },

  // Order endpoints
  ORDERS: {
    LIST: '/api/orders',
    GET: (id) => `/api/orders/${id}`,
    CREATE: '/api/orders',
    UPDATE: (id) => `/api/orders/${id}`,
    DELETE: (id) => `/api/orders/${id}`,
  },

  // Invoice endpoints
  INVOICES: {
    LIST: '/api/invoices',
    GET: (id) => `/api/invoices/${id}`,
    CREATE: '/api/invoices',
    UPDATE: (id) => `/api/invoices/${id}`,
    DELETE: (id) => `/api/invoices/${id}`,
    STATS: '/api/invoices/stats',
    FROM_ORDER: (orderId) => `/api/invoices/from-order/${orderId}`,
    UPDATE_STATUS: (id) => `/api/invoices/${id}/status`
  },

  // MESSAGES endpoints - NEWLY ADDED
  MESSAGES: {
    LIST: '/api/messages',                          // GET - List messages with filters
    DETAIL: '/api/messages',                        // GET /:id - Get message details  
    CREATE: '/api/messages',                        // POST - Create new message (customers)
    STATS: '/api/messages/stats',                   // GET - Get message statistics
    MARK_READ: '/api/messages/read',                // PUT /:id - Mark single message as read
    MARK_READ_BULK: '/api/messages/read-bulk',      // PUT - Mark multiple messages as read
    REPLY: '/api/messages/reply',                   // POST /:id - Send reply to message
    UPDATE_PRIORITY: '/api/messages/priority',      // PUT /:id - Update message priority
    DELETE: '/api/messages',                        // DELETE /:id - Delete message
    SEARCH: '/api/messages/search',                 // GET - Advanced message search
    RECENT: '/api/messages/recent',                 // GET - Get recent messages for dashboard
    
    // Customer-specific endpoints
    CUSTOMER_CONVERSATIONS: '/api/customers/messages/conversations', // GET - Customer's conversations
    ASSIGNED_ASSISTANT: '/api/customers/assigned-assistant',          // GET - Get assigned assistant info
    
    // Thread/conversation endpoints
    THREAD: '/api/messages/thread',                 // GET /:id/thread - Get conversation thread
    CONVERSATION_HISTORY: '/api/messages/conversations' // GET - Get all conversations for user
  },

  // Stats endpoint
  STATS: {
    DASHBOARD: '/api/stats',
    CUSTOMERS: '/api/stats/customers',
    ORDERS: '/api/stats/orders',
    USERS: '/api/stats/users',
  },

  // Legacy support - keep old structure for backward compatibility
  ASSISTANTS: {
    LIST: '/api/users/assistants',
    GET: (id) => `/api/users/assistants/${id}`,
    CREATE: '/api/users/assistants',
    UPDATE: (id) => `/api/users/assistants/${id}`,
    DELETE: (id) => `/api/users/assistants/${id}`,
    PROFILE: '/api/users/profile',
    TOGGLE_STATUS: (id) => `/api/users/assistants/${id}/status`,
    RESET_PASSWORD: (id) => `/api/users/assistants/${id}/reset-password`,
  },
};

// Enhanced error handler for components with better error messages
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error Details:', {
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    message: error.message,
    url: error.config?.url,
    method: error.config?.method
  });
  
  // Handle different types of errors
  if (error.response?.status === 401) {
    return 'Authentication required. Please log in again.';
  }
  
  if (error.response?.status === 403) {
    return 'Access denied. You don\'t have permission to perform this action.';
  }
  
  if (error.response?.status === 404) {
    return 'The requested resource was not found.';
  }
  
  if (error.response?.status === 500) {
    return 'Server error. Please try again later.';
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message === 'Network Error') {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  
  if (error.message) {
    return error.message;
  }
  
  return defaultMessage;
};

// SIMPLIFIED Utility functions for common API operations
export const apiUtils = {
  // Build query string from object
  buildQueryString: (params) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        query.append(key, value);
      }
    });
    return query.toString();
  },

  // SIMPLIFIED: Check if user is authenticated - no async operations
  requireAuth: () => {
    const token = getAuthToken();
    if (!token || isTokenExpired(token)) {
      throw new Error('Authentication required');
    }
    return true;
  },

  // SIMPLIFIED: Get current user - synchronous only
  getCurrentUser: () => {
    try {
      const userJson = localStorage.getItem('user');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  // Check authentication status synchronously
  isAuthenticated: () => {
    const token = getAuthToken();
    return token && !isTokenExpired(token);
  },

  // Get auth header for manual requests
  getAuthHeader: () => {
    const token = getAuthToken();
    if (token && !isTokenExpired(token)) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }
};  

// Export the configured axios instance for direct use if needed
export default api;