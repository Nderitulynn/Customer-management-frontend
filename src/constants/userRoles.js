// src/constants/userRoles.js

export const USER_ROLES = {
  ADMIN: 'admin',
  ASSISTANT: 'assistant'
};

export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Admin/Owner',
  [USER_ROLES.ASSISTANT]: 'Assistant'
};

// Define what each role can access
export const PERMISSIONS = {
  // Financial & Business Data
  VIEW_FINANCIAL_DATA: 'view_financial_data',
  VIEW_REVENUE: 'view_revenue',
  VIEW_PROFITS: 'view_profits',
  VIEW_COSTS: 'view_costs',
  VIEW_PRICING: 'view_pricing',
  
  // Customer Management
  VIEW_ALL_CUSTOMERS: 'view_all_customers',
  VIEW_CUSTOMER_CONTACT: 'view_customer_contact',
  EDIT_CUSTOMERS: 'edit_customers',
  DELETE_CUSTOMERS: 'delete_customers',
  
  // Orders & Projects
  VIEW_ALL_ORDERS: 'view_all_orders',
  VIEW_ORDER_STATUS: 'view_order_status',
  UPDATE_ORDER_STATUS: 'update_order_status',
  VIEW_ORDER_HISTORY: 'view_order_history',
  
  // Communication
  VIEW_ALL_WHATSAPP: 'view_all_whatsapp',
  VIEW_ASSIGNED_WHATSAPP: 'view_assigned_whatsapp',
  SEND_WHATSAPP: 'send_whatsapp',
  
  // Analytics & Reports
  VIEW_BUSINESS_ANALYTICS: 'view_business_analytics',
  VIEW_TEAM_PERFORMANCE: 'view_team_performance',
  VIEW_BASIC_METRICS: 'view_basic_metrics',
  
  // System Management
  MANAGE_SYSTEM_SETTINGS: 'manage_system_settings',
  MANAGE_USERS: 'manage_users',
  MANAGE_TEAM: 'manage_team',
  
  // Notifications
  RECEIVE_FINANCIAL_ALERTS: 'receive_financial_alerts',
  RECEIVE_TEAM_ALERTS: 'receive_team_alerts',
  RECEIVE_CUSTOMER_ALERTS: 'receive_customer_alerts'
};

// Role-based permission mapping
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    // ✅ Admin/Owner Can See Everything
    PERMISSIONS.VIEW_FINANCIAL_DATA,
    PERMISSIONS.VIEW_REVENUE,
    PERMISSIONS.VIEW_PROFITS,
    PERMISSIONS.VIEW_COSTS,
    PERMISSIONS.VIEW_PRICING,
    PERMISSIONS.VIEW_ALL_CUSTOMERS,
    PERMISSIONS.VIEW_CUSTOMER_CONTACT,
    PERMISSIONS.EDIT_CUSTOMERS,
    PERMISSIONS.DELETE_CUSTOMERS,
    PERMISSIONS.VIEW_ALL_ORDERS,
    PERMISSIONS.VIEW_ORDER_STATUS,
    PERMISSIONS.UPDATE_ORDER_STATUS,
    PERMISSIONS.VIEW_ORDER_HISTORY,
    PERMISSIONS.VIEW_ALL_WHATSAPP,
    PERMISSIONS.SEND_WHATSAPP,
    PERMISSIONS.VIEW_BUSINESS_ANALYTICS,
    PERMISSIONS.VIEW_TEAM_PERFORMANCE,
    PERMISSIONS.VIEW_BASIC_METRICS,
    PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_TEAM,
    PERMISSIONS.RECEIVE_FINANCIAL_ALERTS,
    PERMISSIONS.RECEIVE_TEAM_ALERTS,
    PERMISSIONS.RECEIVE_CUSTOMER_ALERTS
  ],
  
  [USER_ROLES.ASSISTANT]: [
    // ✅ Assistant Can See (Limited)
    PERMISSIONS.VIEW_CUSTOMER_CONTACT,
    PERMISSIONS.EDIT_CUSTOMERS, // Can edit customer info but not see financial data
    PERMISSIONS.VIEW_ORDER_STATUS,
    PERMISSIONS.UPDATE_ORDER_STATUS,
    PERMISSIONS.VIEW_ASSIGNED_WHATSAPP, // Only assigned conversations
    PERMISSIONS.SEND_WHATSAPP,
    PERMISSIONS.VIEW_BASIC_METRICS,
    PERMISSIONS.RECEIVE_CUSTOMER_ALERTS
    
    // ❌ Assistant Cannot See:
    // - Financial data (revenue, profits, costs, pricing)
    // - System configuration
    // - Team management
    // - Business analytics
    // - All WhatsApp conversations (only assigned ones)
  ]
};

// Permission checker functions
export const hasPermission = (userRole, permission) => {
  if (!userRole || !permission) return false;
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

export const canViewFinancialData = (userRole) => {
  return hasPermission(userRole, PERMISSIONS.VIEW_FINANCIAL_DATA);
};

export const canViewAllCustomers = (userRole) => {
  return hasPermission(userRole, PERMISSIONS.VIEW_ALL_CUSTOMERS);
};

export const canManageSystem = (userRole) => {
  return hasPermission(userRole, PERMISSIONS.MANAGE_SYSTEM_SETTINGS);
};

export const canViewAllWhatsApp = (userRole) => {
  return hasPermission(userRole, PERMISSIONS.VIEW_ALL_WHATSAPP);
};

export const canViewBusinessAnalytics = (userRole) => {
  return hasPermission(userRole, PERMISSIONS.VIEW_BUSINESS_ANALYTICS);
};

export const canManageTeam = (userRole) => {
  return hasPermission(userRole, PERMISSIONS.MANAGE_TEAM);
};

// UI Component access based on role
export const COMPONENT_ACCESS = {
  [USER_ROLES.ADMIN]: {
    dashboard: ['revenue', 'customers', 'orders', 'analytics', 'team'],
    sidebar: ['customers', 'orders', 'whatsapp', 'analytics', 'team', 'settings', 'financial'],
    pages: ['all']
  },
  
  [USER_ROLES.ASSISTANT]: {
    dashboard: ['customers', 'orders', 'basic-metrics'],
    sidebar: ['customers', 'orders', 'whatsapp'],
    pages: ['customers', 'orders', 'whatsapp', 'profile']
  }
};

export const getAccessibleComponents = (userRole, componentType) => {
  return COMPONENT_ACCESS[userRole]?.[componentType] || [];
};

export const canAccessComponent = (userRole, componentType, componentName) => {
  const accessibleComponents = getAccessibleComponents(userRole, componentType);
  return accessibleComponents.includes('all') || accessibleComponents.includes(componentName);
};

// Route protection
export const PROTECTED_ROUTES = {
  ADMIN_ONLY: [
    '/admin',
    '/analytics',
    '/financial',
    '/team',
    '/settings',
    '/system-config'
  ],
  
  ASSISTANT_RESTRICTED: [
    '/financial',
    '/analytics',
    '/team',
    '/settings'
  ]
};

export const canAccessRoute = (userRole, route) => {
  if (userRole === USER_ROLES.ADMIN) {
    return true; // Admin can access all routes
  }
  
  if (userRole === USER_ROLES.ASSISTANT) {
    return !PROTECTED_ROUTES.ASSISTANT_RESTRICTED.some(restrictedRoute => 
      route.startsWith(restrictedRoute)
    );
  }
  
  return false;
};