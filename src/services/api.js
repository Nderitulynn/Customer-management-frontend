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
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Simple request logging for development
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and basic token refresh
api.interceptors.response.use(
  (response) => {
    // Simple response logging for development
    if (import.meta.env.DEV) {
      console.log(`API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Token expired - attempt refresh
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken
          });

          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.token || {};

          if (accessToken) {
            localStorage.setItem('token', accessToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Token refresh failed - logout user
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      } else {
        // No refresh token - logout immediately
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Simple API helper functions
export const apiHelpers = {
  // GET request
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      // Handle your backend's response structure
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST request
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
        return response.data.data || response.data;
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT request
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

  // PATCH request
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

  // DELETE request
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
  }
};

// API endpoints constants - Updated for Admin/Assistant system
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    REGISTER_ADMIN: '/api/auth/register-admin',
    VERIFY_TOKEN: '/api/auth/verify-token',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    CHANGE_PASSWORD: '/api/auth/change-password',
  },

  // Admin management endpoints
  ADMINS: {
    LIST: '/api/admins',
    GET: (id) => `/api/admins/${id}`,
    CREATE: '/api/admins',
    UPDATE: (id) => `/api/admins/${id}`,
    DELETE: (id) => `/api/admins/${id}`,
    PROFILE: '/api/admins/profile',
  },

  // Assistant management endpoints
  ASSISTANTS: {
    LIST: '/api/assistants',
    GET: (id) => `/api/assistants/${id}`,
    CREATE: '/api/assistants',
    UPDATE: (id) => `/api/assistants/${id}`,
    DELETE: (id) => `/api/assistants/${id}`,
    PROFILE: '/api/assistants/profile',
  },

  // Customer endpoints
  CUSTOMERS: {
    LIST: '/api/customers',
    GET: (id) => `/api/customers/${id}`,
    CREATE: '/api/customers',
    UPDATE: (id) => `/api/customers/${id}`,
    DELETE: (id) => `/api/customers/${id}`,
  },

  // Order endpoints
  ORDERS: {
    LIST: '/api/orders',
    GET: (id) => `/api/orders/${id}`,
    CREATE: '/api/orders',
    UPDATE: (id) => `/api/orders/${id}`,
    DELETE: (id) => `/api/orders/${id}`,
  },
};

// Simple error handler for components
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return defaultMessage;
};

// Export the configured axios instance for direct use if needed
export default api;