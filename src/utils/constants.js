// src/utils/constants.js
// Core application constants for Macrame Business CMS

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  ORDER_NEW: 'order_new',
  ORDER_UPDATED: 'order_updated',
  ORDER_COMPLETED: 'order_completed',
  ORDER_CANCELLED: 'order_cancelled',
  CUSTOMER_NEW: 'customer_new',
  CUSTOMER_UPDATED: 'customer_updated',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_OVERDUE: 'payment_overdue',
  INVENTORY_LOW: 'inventory_low',
  INVENTORY_OUT: 'inventory_out',
  WHATSAPP_MESSAGE: 'whatsapp_message',
  WHATSAPP_DELIVERED: 'whatsapp_delivered',
  WHATSAPP_READ: 'whatsapp_read',
  SYSTEM_UPDATE: 'system_update',
  SYSTEM_ERROR: 'system_error',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  ANALYTICS_REPORT: 'analytics_report'
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',
  VERIFY_EMAIL: '/auth/verify-email',
  
  // User Management
  USERS: '/users',
  USER_PROFILE: '/users/profile',
  USER_PERMISSIONS: '/users/permissions',
  USER_ROLES: '/users/roles',
  
  // Customer Management
  CUSTOMERS: '/customers',
  CUSTOMER_ORDERS: '/customers/:id/orders',
  CUSTOMER_PAYMENTS: '/customers/:id/payments',
  CUSTOMER_NOTES: '/customers/:id/notes',
  
  // Order Management
  ORDERS: '/orders',
  ORDER_STATUS: '/orders/:id/status',
  ORDER_ITEMS: '/orders/:id/items',
  ORDER_PAYMENTS: '/orders/:id/payments',
  ORDER_TRACKING: '/orders/:id/tracking',
  
  // Product/Inventory Management
  PRODUCTS: '/products',
  PRODUCT_CATEGORIES: '/products/categories',
  INVENTORY: '/inventory',
  INVENTORY_ALERTS: '/inventory/alerts',
  
  // WhatsApp Integration
  WHATSAPP_SEND: '/whatsapp/send',
  WHATSAPP_WEBHOOK: '/whatsapp/webhook',
  WHATSAPP_TEMPLATES: '/whatsapp/templates',
  WHATSAPP_CONTACTS: '/whatsapp/contacts',
  WHATSAPP_MESSAGES: '/whatsapp/messages',
  
  // Financial Management
  PAYMENTS: '/payments',
  INVOICES: '/invoices',
  EXPENSES: '/expenses',
  FINANCIAL_REPORTS: '/financial/reports',
  
  // Analytics & Reporting
  ANALYTICS_DASHBOARD: '/analytics/dashboard',
  ANALYTICS_SALES: '/analytics/sales',
  ANALYTICS_CUSTOMERS: '/analytics/customers',
  ANALYTICS_PRODUCTS: '/analytics/products',
  ANALYTICS_FINANCIAL: '/analytics/financial',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_SSE: '/notifications/sse',
  NOTIFICATIONS_MARK_READ: '/notifications/:id/read',
  NOTIFICATIONS_MARK_ALL_READ: '/notifications/mark-all-read',
  NOTIFICATIONS_SETTINGS: '/notifications/settings',
  
  // File Management
  UPLOAD: '/files/upload',
  DOWNLOAD: '/files/:id/download',
  DELETE_FILE: '/files/:id',
  
  // System
  SYSTEM_STATUS: '/system/status',
  SYSTEM_LOGS: '/system/logs',
  SYSTEM_BACKUP: '/system/backup',
  SYSTEM_SETTINGS: '/system/settings'
};

// Notification Sounds
export const NOTIFICATION_SOUNDS = {
  DEFAULT: '/sounds/notification-default.mp3',
  SUCCESS: '/sounds/notification-success.mp3',
  ERROR: '/sounds/notification-error.mp3',
  WARNING: '/sounds/notification-warning.mp3',
  ORDER_NEW: '/sounds/order-new.mp3',
  ORDER_COMPLETED: '/sounds/order-completed.mp3',
  PAYMENT_RECEIVED: '/sounds/payment-received.mp3',
  WHATSAPP_MESSAGE: '/sounds/whatsapp-message.mp3',
  SYSTEM_ALERT: '/sounds/system-alert.mp3'
};

// Application Status
export const APP_STATUS = {
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error',
  OFFLINE: 'offline'
};

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  VIEWER: 'viewer'
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PARTIALLY_PAID: 'partially_paid',
  OVERDUE: 'overdue',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled'
};

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DD HH:mm:ss'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  AVAILABLE_PAGE_SIZES: [10, 20, 50, 100]
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
  }
};

// WhatsApp Message Types
export const WHATSAPP_MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  DOCUMENT: 'document',
  TEMPLATE: 'template',
  INTERACTIVE: 'interactive'
};

// Analytics Time Ranges
export const ANALYTICS_TIME_RANGES = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last_7_days',
  LAST_30_DAYS: 'last_30_days',
  LAST_3_MONTHS: 'last_3_months',
  LAST_6_MONTHS: 'last_6_months',
  LAST_YEAR: 'last_year',
  CUSTOM: 'custom'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  REMEMBER_ME: 'remember_me',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  NOTIFICATION_SETTINGS: 'notification_settings'
};

// Theme Options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

// Application Configuration
export const APP_CONFIG = {
  NAME: 'Macrame Business CMS',
  VERSION: '1.0.0',
  COMPANY: 'Macrame Business Solutions',
  SUPPORT_EMAIL: 'support@macramebusiness.com',
  SUPPORT_PHONE: '+254-XXX-XXXXXX'
};