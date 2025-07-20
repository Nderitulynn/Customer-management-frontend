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

// API endpoints constants
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    REGISTER: '/api/auth/register',
    VERIFY_TOKEN: '/api/auth/verify-token',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    CHANGE_PASSWORD: '/api/auth/change-password',
  },

  // User management endpoints
  USERS: {
    BASE: '/api/users',
    PROFILE: '/api/users/profile',
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
  },

  // Dashboard endpoints
  DASHBOARD: {
    ADMIN: '/api/dashboard/admin',
    ASSISTANT: '/api/dashboard/assistant',
    METRICS: '/api/dashboard/metrics',
  },

  // Notification endpoints
  NOTIFICATIONS: {
    BASE: '/api/notifications',
    LIST: '/api/notifications',
    MARK_READ: (id) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: '/api/notifications/mark-all-read',
    DELETE: (id) => `/api/notifications/${id}`,
  },
};

// ============================================
// SERVICE CLASSES
// ============================================

// Base service class for common CRUD operations
class BaseService {
  constructor(endpoints) {
    this.endpoints = endpoints;
  }

  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${this.endpoints.LIST}?${queryString}` : this.endpoints.LIST;
    return await apiHelpers.get(url);
  }

  async getById(id) {
    return await apiHelpers.get(this.endpoints.GET(id));
  }

  async create(data) {
    return await apiHelpers.post(this.endpoints.CREATE, data);
  }

  async update(id, data) {
    return await apiHelpers.put(this.endpoints.UPDATE(id), data);
  }

  async delete(id) {
    return await apiHelpers.delete(this.endpoints.DELETE(id));
  }
}

// Customer Service
class CustomerService extends BaseService {
  constructor() {
    super(API_ENDPOINTS.CUSTOMERS);
  }

  async search(query, params = {}) {
    const searchParams = new URLSearchParams({ q: query, ...params }).toString();
    return await apiHelpers.get(`${this.endpoints.SEARCH}?${searchParams}`);
  }

  async export(format = 'csv') {
    return await apiHelpers.get(`${this.endpoints.EXPORT}?format=${format}`);
  }

  async getCustomerOrders(customerId) {
    return await apiHelpers.get(API_ENDPOINTS.ORDERS.CUSTOMER_ORDERS(customerId));
  }
}

// Order Service
class OrderService extends BaseService {
  constructor() {
    super(API_ENDPOINTS.ORDERS);
  }

  async updateStatus(id, status) {
    return await apiHelpers.patch(this.endpoints.UPDATE_STATUS(id), { status });
  }

  async getByCustomer(customerId) {
    return await apiHelpers.get(this.endpoints.CUSTOMER_ORDERS(customerId));
  }
}

// User Service
class UserService extends BaseService {
  constructor() {
    super(API_ENDPOINTS.USERS);
  }

  async getProfile() {
    return await apiHelpers.get(this.endpoints.PROFILE);
  }

  async updateProfile(data) {
    return await apiHelpers.put(this.endpoints.PROFILE, data);
  }

  async changePassword(data) {
    return await apiHelpers.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  }
}

// Auth Service
class AuthService {
  constructor() {
    this.endpoints = API_ENDPOINTS.AUTH;
  }

  async login(credentials) {
    return await apiHelpers.post(this.endpoints.LOGIN, credentials);
  }

  async logout() {
    return await apiHelpers.post(this.endpoints.LOGOUT);
  }

  async register(userData) {
    return await apiHelpers.post(this.endpoints.REGISTER, userData);
  }

  async verifyToken() {
    return await apiHelpers.get(this.endpoints.VERIFY_TOKEN);
  }

  async forgotPassword(email) {
    return await apiHelpers.post(this.endpoints.FORGOT_PASSWORD, { email });
  }

  async resetPassword(token, password) {
    return await apiHelpers.post(this.endpoints.RESET_PASSWORD, { token, password });
  }

  async changePassword(data) {
    return await apiHelpers.post(this.endpoints.CHANGE_PASSWORD, data);
  }
}

// WhatsApp Service
class WhatsAppService {
  constructor() {
    this.endpoints = API_ENDPOINTS.WHATSAPP;
  }

  async sendMessage(data) {
    return await apiHelpers.post(this.endpoints.SEND_MESSAGE, data);
  }

  async getChats(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${this.endpoints.GET_CHATS}?${queryString}` : this.endpoints.GET_CHATS;
    return await apiHelpers.get(url);
  }

  async getChat(id) {
    return await apiHelpers.get(this.endpoints.GET_CHAT(id));
  }

  async markAsRead(id) {
    return await apiHelpers.patch(this.endpoints.MARK_READ(id));
  }
}

// Dashboard Service
class DashboardService {
  constructor() {
    this.endpoints = API_ENDPOINTS.DASHBOARD;
  }

  async getAdminDashboard() {
    return await apiHelpers.get(this.endpoints.ADMIN);
  }

  async getAssistantDashboard() {
    return await apiHelpers.get(this.endpoints.ASSISTANT);
  }

  async getMetrics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${this.endpoints.METRICS}?${queryString}` : this.endpoints.METRICS;
    return await apiHelpers.get(url);
  }
}

// Notification Service
class NotificationService {
  constructor() {
    this.endpoints = API_ENDPOINTS.NOTIFICATIONS;
  }

  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${this.endpoints.LIST}?${queryString}` : this.endpoints.LIST;
    return await apiHelpers.get(url);
  }

  async markAsRead(id) {
    return await apiHelpers.patch(this.endpoints.MARK_READ(id));
  }

  async markAllAsRead() {
    return await apiHelpers.patch(this.endpoints.MARK_ALL_READ);
  }

  async delete(id) {
    return await apiHelpers.delete(this.endpoints.DELETE(id));
  }
}

// ============================================
// SERVICE INSTANCES - Export these for use in components
// ============================================

export const customerService = new CustomerService();
export const orderService = new OrderService();
export const userService = new UserService();
export const authService = new AuthService();
export const whatsappService = new WhatsAppService();
export const dashboardService = new DashboardService();
export const notificationService = new NotificationService();

// Export the configured axios instance
export default api;
export { apiHelpers as api };

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