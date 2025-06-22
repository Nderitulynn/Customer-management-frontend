// src/constants/notifications.js

export const NOTIFICATION_TYPES = {
  // Financial notifications
  DAILY_REVENUE: 'daily_revenue',
  NEW_ORDER: 'new_order',
  PAYMENT_ALERT: 'payment_alert',
  REVENUE_MILESTONE: 'revenue_milestone',
  
  // Team & System notifications
  TEAM_ACTIVITY: 'team_activity',
  SYSTEM_ALERT: 'system_alert',
  USER_LOGIN: 'user_login',
  
  // Customer & Communication notifications
  NEW_WHATSAPP: 'new_whatsapp',
  ORDER_UPDATE: 'order_update',
  CUSTOMER_FOLLOWUP: 'customer_followup',
  MESSAGE_RESPONSE_TIME: 'message_response_time',
  
  // General business notifications
  ORDER_STATUS_CHANGE: 'order_status_change',
  NEW_CUSTOMER: 'new_customer',
  CUSTOMER_COMPLAINT: 'customer_complaint'
};

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

export const NOTIFICATION_CATEGORIES = {
  FINANCIAL: 'financial',
  CUSTOMER: 'customer',
  TEAM: 'team',
  SYSTEM: 'system',
  COMMUNICATION: 'communication'
};

// Owner/Admin Notifications Configuration
export const OWNER_NOTIFICATIONS = {
  [NOTIFICATION_TYPES.DAILY_REVENUE]: {
    title: 'Daily Revenue Summary',
    description: 'Daily sales and revenue report',
    category: NOTIFICATION_CATEGORIES.FINANCIAL,
    priority: NOTIFICATION_PRIORITIES.MEDIUM,
    schedule: 'daily', // Send at end of day
    time: '18:00'
  },
  
  [NOTIFICATION_TYPES.NEW_ORDER]: {
    title: 'New Order Created',
    description: 'A new macrame order has been placed',
    category: NOTIFICATION_CATEGORIES.CUSTOMER,
    priority: NOTIFICATION_PRIORITIES.HIGH,
    schedule: 'immediate'
  },
  
  [NOTIFICATION_TYPES.PAYMENT_ALERT]: {
    title: 'Payment Alert',
    description: 'Payment received or payment overdue',
    category: NOTIFICATION_CATEGORIES.FINANCIAL,
    priority: NOTIFICATION_PRIORITIES.HIGH,
    schedule: 'immediate'
  },
  
  [NOTIFICATION_TYPES.TEAM_ACTIVITY]: {
    title: 'Team Activity Summary',
    description: 'Summary of team member activities and performance',
    category: NOTIFICATION_CATEGORIES.TEAM,
    priority: NOTIFICATION_PRIORITIES.MEDIUM,
    schedule: 'daily',
    time: '17:00'
  },
  
  [NOTIFICATION_TYPES.SYSTEM_ALERT]: {
    title: 'System Alert',
    description: 'Important system notifications and updates',
    category: NOTIFICATION_CATEGORIES.SYSTEM,
    priority: NOTIFICATION_PRIORITIES.URGENT,
    schedule: 'immediate'
  },
  
  [NOTIFICATION_TYPES.REVENUE_MILESTONE]: {
    title: 'Revenue Milestone',
    description: 'Monthly or quarterly revenue goals achieved',
    category: NOTIFICATION_CATEGORIES.FINANCIAL,
    priority: NOTIFICATION_PRIORITIES.HIGH,
    schedule: 'milestone'
  }
};

// Assistant Notifications Configuration
export const ASSISTANT_NOTIFICATIONS = {
  [NOTIFICATION_TYPES.NEW_WHATSAPP]: {
    title: 'New WhatsApp Message',
    description: 'New customer message received via WhatsApp',
    category: NOTIFICATION_CATEGORIES.COMMUNICATION,
    priority: NOTIFICATION_PRIORITIES.HIGH,
    schedule: 'immediate'
  },
  
  [NOTIFICATION_TYPES.ORDER_UPDATE]: {
    title: 'Order Status Update Request',
    description: 'Customer requesting order status update',
    category: NOTIFICATION_CATEGORIES.CUSTOMER,
    priority: NOTIFICATION_PRIORITIES.MEDIUM,
    schedule: 'immediate'
  },
  
  [NOTIFICATION_TYPES.CUSTOMER_FOLLOWUP]: {
    title: 'Customer Follow-up Reminder',
    description: 'Scheduled follow-up with customer',
    category: NOTIFICATION_CATEGORIES.CUSTOMER,
    priority: NOTIFICATION_PRIORITIES.MEDIUM,
    schedule: 'scheduled'
  },
  
  [NOTIFICATION_TYPES.MESSAGE_RESPONSE_TIME]: {
    title: 'Response Time Alert',
    description: 'Customer message requires urgent response',
    category: NOTIFICATION_CATEGORIES.COMMUNICATION,
    priority: NOTIFICATION_PRIORITIES.URGENT,
    schedule: 'delayed', // After 30 minutes of no response
    delay: 30 // minutes
  },
  
  [NOTIFICATION_TYPES.ORDER_STATUS_CHANGE]: {
    title: 'Order Status Changed',
    description: 'Order status has been updated',
    category: NOTIFICATION_CATEGORIES.CUSTOMER,
    priority: NOTIFICATION_PRIORITIES.MEDIUM,
    schedule: 'immediate'
  }
};

// Notification templates
export const NOTIFICATION_TEMPLATES = {
  [NOTIFICATION_TYPES.DAILY_REVENUE]: {
    title: 'Daily Revenue: ${amount}',
    body: 'Today\'s revenue: ${amount}. Orders: ${orderCount}. Top product: ${topProduct}',
    icon: '💰'
  },
  
  [NOTIFICATION_TYPES.NEW_ORDER]: {
    title: 'New Order #${orderNumber}',
    body: '${customerName} ordered ${projectType} - ${amount}',
    icon: '📝'
  },
  
  [NOTIFICATION_TYPES.PAYMENT_ALERT]: {
    title: 'Payment ${status}',
    body: '${customerName} - Order #${orderNumber} - ${amount}',
    icon: '💳'
  },
  
  [NOTIFICATION_TYPES.NEW_WHATSAPP]: {
    title: 'New WhatsApp from ${customerName}',
    body: '${messagePreview}',
    icon: '💬'
  },
  
  [NOTIFICATION_TYPES.ORDER_UPDATE]: {
    title: 'Order Update Request',
    body: '${customerName} asking about Order #${orderNumber}',
    icon: '❓'
  },
  
  [NOTIFICATION_TYPES.CUSTOMER_FOLLOWUP]: {
    title: 'Follow-up: ${customerName}',
    body: 'Scheduled follow-up for ${reason}',
    icon: '📞'
  }
};

// Notification delivery methods
export const DELIVERY_METHODS = {
  IN_APP: 'in_app',
  EMAIL: 'email',
  PUSH: 'push',
  SMS: 'sms',
  WHATSAPP: 'whatsapp'
};

// Role-based delivery preferences
export const ROLE_DELIVERY_PREFERENCES = {
  [import('./userRoles.js').USER_ROLES?.ADMIN]: {
    financial: [DELIVERY_METHODS.IN_APP, DELIVERY_METHODS.EMAIL],
    team: [DELIVERY_METHODS.IN_APP],
    system: [DELIVERY_METHODS.IN_APP, DELIVERY_METHODS.EMAIL],
    customer: [DELIVERY_METHODS.IN_APP]
  },
  
  [import('./userRoles.js').USER_ROLES?.ASSISTANT]: {
    communication: [DELIVERY_METHODS.IN_APP, DELIVERY_METHODS.PUSH],
    customer: [DELIVERY_METHODS.IN_APP],
    system: [DELIVERY_METHODS.IN_APP]
  }
};

// Notification settings
export const NOTIFICATION_SETTINGS = {
  MAX_NOTIFICATIONS_PER_DAY: 50,
  BATCH_SIZE: 10,
  RETRY_ATTEMPTS: 3,
  QUIET_HOURS: {
    start: '22:00',
    end: '07:00'
  }
};

// Helper functions
export const getNotificationsByRole = (role) => {
  if (role === 'admin') {
    return { ...OWNER_NOTIFICATIONS, ...ASSISTANT_NOTIFICATIONS };
  }
  return ASSISTANT_NOTIFICATIONS;
};

export const formatNotification = (type, data) => {
  const template = NOTIFICATION_TEMPLATES[type];
  if (!template) return null;
  
  let title = template.title;
  let body = template.body;
  
  // Replace template variables with actual data
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
    title = title.replace(regex, data[key]);
    body = body.replace(regex, data[key]);
  });
  
  return {
    title,
    body,
    icon: template.icon,
    type,
    data,
    timestamp: new Date().toISOString()
  };
};

export const shouldSendNotification = (type, userRole, currentTime) => {
  const notifications = getNotificationsByRole(userRole);
  const config = notifications[type];
  
  if (!config) return false;
  
  // Check quiet hours
  const quietStart = NOTIFICATION_SETTINGS.QUIET_HOURS.start;
  const quietEnd = NOTIFICATION_SETTINGS.QUIET_HOURS.end;
  const now = new Date(currentTime);
  const currentHour = now.getHours();
  
  // Skip non-urgent notifications during quiet hours
  if (config.priority !== NOTIFICATION_PRIORITIES.URGENT) {
    const quietStartHour = parseInt(quietStart.split(':')[0]);
    const quietEndHour = parseInt(quietEnd.split(':')[0]);
    
    if (currentHour >= quietStartHour || currentHour <= quietEndHour) {
      return false;
    }
  }
  
  return true;
};

export const getNotificationPriorityColor = (priority) => {
  const colors = {
    [NOTIFICATION_PRIORITIES.LOW]: '#6b7280',
    [NOTIFICATION_PRIORITIES.MEDIUM]: '#3b82f6',
    [NOTIFICATION_PRIORITIES.HIGH]: '#f59e0b',
    [NOTIFICATION_PRIORITIES.URGENT]: '#ef4444'
  };
  
  return colors[priority] || colors[NOTIFICATION_PRIORITIES.MEDIUM];
};