import axios from 'axios';

// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const endTime = new Date();
    const duration = endTime.getTime() - response.config.metadata.startTime.getTime();
    
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.status} ${response.config.url} (${duration}ms)`);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;
      
      // Log error in development
      if (import.meta.env.DEV) {
        console.error(`❌ API Error: ${status} ${originalRequest.url}`, data);
      }

      switch (status) {
        case 401:
          // Unauthorized - Token expired or invalid
          // Clear tokens and dispatch logout event
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Dispatch custom event for AuthContext to handle
          window.dispatchEvent(new CustomEvent('auth:logout', {
            detail: { reason: 'token_expired' }
          }));
          
          // Only redirect if not already on login page
          if (window.location.pathname !== '/login') {
            // Use a small delay to allow AuthContext to handle the event first
            setTimeout(() => {
              if (window.location.pathname !== '/login') {
                window.location.href = '/login';
              }
            }, 100);
          }
          break;

        case 403:
          // Forbidden - Insufficient permissions
          console.warn('Access denied: Insufficient permissions');
          break;

        case 404:
          // Not found
          console.warn('Resource not found');
          break;

        case 429:
          // Rate limit exceeded
          console.warn('Rate limit exceeded. Please try again later.');
          break;

        case 500:
          // Server error
          console.error('Server error. Please try again later.');
          break;

        default:
          console.error('Unexpected error:', status);
      }

      // Return formatted error
      return Promise.reject({
        status,
        message: data?.message || error.message || 'An error occurred',
        data: data,
        originalError: error
      });
    } else if (error.request) {
      // Network error - no response received
      console.error('Network error: No response received');
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your connection.',
        originalError: error
      });
    } else {
      // Request setup error
      console.error('Request setup error:', error.message);
      return Promise.reject({
        status: -1,
        message: error.message || 'Request failed',
        originalError: error
      });
    }
  }
);

// API helper functions to handle your backend's response structure
export const apiHelpers = {
  // GET request helper
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      // Handle your backend's response structure
      if (response.data.success && response.data.data) {
        return { ...response.data.data, ...response.data.token };
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST request helper
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      // Handle your backend's response structure
      if (response.data.success) {
        // For auth endpoints, merge data and token
        if (response.data.data && response.data.token) {
          return {
            ...response.data.data,
            token: response.data.token.accessToken,
            refreshToken: response.data.token.refreshToken
          };
        }
        // For other endpoints, return data or the whole response
        return response.data.data || response.data;
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT request helper
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PATCH request helper
  patch: async (url, data = {}, config = {}) => {
    try {
      const response = await api.patch(url, data, config);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE request helper
  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // File upload helper
  uploadFile: async (url, formData, onUploadProgress = null) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (onUploadProgress) {
        config.onUploadProgress = onUploadProgress;
      }

      const response = await api.post(url, formData, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Download file helper
  downloadFile: async (url, filename) => {
    try {
      const response = await api.get(url, {
        responseType: 'blob',
      });

      // Create blob link to download
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      return true;
    } catch (error) {
      throw error;
    }
  }
};

// FIXED: API endpoints constants with correct /api prefix
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    VERIFY_TOKEN: '/api/auth/verify-token',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
    REGISTER: '/api/auth/register',
    CHANGE_PASSWORD: '/api/auth/change-password',
  },

  // User management endpoints
  USERS: {
    BASE: '/api/users',
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
    CHANGE_PASSWORD: '/api/users/change-password',
    LIST: '/api/users',
    CREATE: '/api/users',
    UPDATE: (id) => `/api/users/${id}`,
    DELETE: (id) => `/api/users/${id}`,
  },

  // Customer endpoints
  CUSTOMERS: {
    BASE: '/api/customers',
    LIST: '/api/customers',
    CREATE: '/api/customers',
    GET: (id) => `/api/customers/${id}`,
    UPDATE: (id) => `/api/customers/${id}`,
    DELETE: (id) => `/api/customers/${id}`,
    SEARCH: '/api/customers/search',
    EXPORT: '/api/customers/export',
  },

  // Order endpoints
  ORDERS: {
    BASE: '/api/orders',
    LIST: '/api/orders',
    CREATE: '/api/orders',
    GET: (id) => `/api/orders/${id}`,
    UPDATE: (id) => `/api/orders/${id}`,
    DELETE: (id) => `/api/orders/${id}`,
    UPDATE_STATUS: (id) => `/api/orders/${id}/status`,
    CUSTOMER_ORDERS: (customerId) => `/api/orders/customer/${customerId}`,
  },

  // WhatsApp endpoints
  WHATSAPP: {
    BASE: '/api/whatsapp',
    SEND_MESSAGE: '/api/whatsapp/send',
    GET_CHATS: '/api/whatsapp/chats',
    GET_CHAT: (id) => `/api/whatsapp/chats/${id}`,
    MARK_READ: (id) => `/api/whatsapp/chats/${id}/read`,
    TEMPLATES: '/api/whatsapp/templates',
  },

  // Notification endpoints
  NOTIFICATIONS: {
    BASE: '/api/notifications',
    LIST: '/api/notifications',
    MARK_READ: (id) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: '/api/notifications/mark-all-read',
    DELETE: (id) => `/api/notifications/${id}`,
  },

  // Financial endpoints (Admin only)
  FINANCIAL: {
    BASE: '/api/financial',
    REVENUE: '/api/financial/revenue',
    PROFITS: '/api/financial/profits',
    COSTS: '/api/financial/costs',
    REPORTS: '/api/financial/reports',
  },

  // Analytics endpoints (Admin only)
  ANALYTICS: {
    BASE: '/api/analytics',
    DASHBOARD: '/api/analytics/dashboard',
    CUSTOMERS: '/api/analytics/customers',
    ORDERS: '/api/analytics/orders',
    PERFORMANCE: '/api/analytics/performance',
  },

  // Dashboard endpoints
  DASHBOARD: {
    ADMIN: '/api/dashboard/admin',
    ASSISTANT: '/api/dashboard/assistant',
    METRICS: '/api/dashboard/metrics',
  },
};

// Rate limiting configuration
export const RATE_LIMITS = {
  DEFAULT: 100, // requests per minute
  AUTH: 5,      // login attempts per minute
  UPLOAD: 10,   // file uploads per minute
  SEARCH: 30,   // search requests per minute
};

// Request timeout configurations
export const TIMEOUTS = {
  DEFAULT: 10000,  // 10 seconds
  UPLOAD: 30000,   // 30 seconds
  DOWNLOAD: 60000, // 60 seconds
};

// Export the configured axios instance and helpers
export default api;
export { apiHelpers as api };

// Export error handler for components
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  if (error.message) {
    return error.message;
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  return defaultMessage;
};