import axios from 'axios';

// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ API Error: ${status} ${originalRequest.url}`, data);
      }

      switch (status) {
        case 401:
          // Unauthorized - Token expired or invalid
          if (!originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
              // Attempt to refresh token
              const refreshToken = localStorage.getItem('refreshToken');
              if (refreshToken) {
                const response = await refreshAuthToken(refreshToken);
                const newToken = response.data.token;
                
                // Update stored token
                localStorage.setItem('token', newToken);
                
                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
            }
          }
          
          // Clear tokens and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Redirect to login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
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

// Token refresh function
const refreshAuthToken = async (refreshToken) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// API helper functions
export const apiHelpers = {
  // GET request helper
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST request helper
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT request helper
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PATCH request helper
  patch: async (url, data = {}, config = {}) => {
    try {
      const response = await api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE request helper
  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
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

// API endpoints constants
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },

  // User management endpoints
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    LIST: '/users',
    CREATE: '/users',
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
  },

  // Customer endpoints
  CUSTOMERS: {
    BASE: '/customers',
    LIST: '/customers',
    CREATE: '/customers',
    GET: (id) => `/customers/${id}`,
    UPDATE: (id) => `/customers/${id}`,
    DELETE: (id) => `/customers/${id}`,
    SEARCH: '/customers/search',
    EXPORT: '/customers/export',
  },

  // Order endpoints
  ORDERS: {
    BASE: '/orders',
    LIST: '/orders',
    CREATE: '/orders',
    GET: (id) => `/orders/${id}`,
    UPDATE: (id) => `/orders/${id}`,
    DELETE: (id) => `/orders/${id}`,
    UPDATE_STATUS: (id) => `/orders/${id}/status`,
    CUSTOMER_ORDERS: (customerId) => `/orders/customer/${customerId}`,
  },

  // WhatsApp endpoints
  WHATSAPP: {
    BASE: '/whatsapp',
    SEND_MESSAGE: '/whatsapp/send',
    GET_CHATS: '/whatsapp/chats',
    GET_CHAT: (id) => `/whatsapp/chats/${id}`,
    MARK_READ: (id) => `/whatsapp/chats/${id}/read`,
    TEMPLATES: '/whatsapp/templates',
  },

  // Notification endpoints
  NOTIFICATIONS: {
    BASE: '/notifications',
    LIST: '/notifications',
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: (id) => `/notifications/${id}`,
  },

  // Financial endpoints (Admin only)
  FINANCIAL: {
    BASE: '/financial',
    REVENUE: '/financial/revenue',
    PROFITS: '/financial/profits',
    COSTS: '/financial/costs',
    REPORTS: '/financial/reports',
  },

  // Analytics endpoints (Admin only)
  ANALYTICS: {
    BASE: '/analytics',
    DASHBOARD: '/analytics/dashboard',
    CUSTOMERS: '/analytics/customers',
    ORDERS: '/analytics/orders',
    PERFORMANCE: '/analytics/performance',
  },

  // Dashboard endpoints
  DASHBOARD: {
    ADMIN: '/dashboard/admin',
    ASSISTANT: '/dashboard/assistant',
    METRICS: '/dashboard/metrics',
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