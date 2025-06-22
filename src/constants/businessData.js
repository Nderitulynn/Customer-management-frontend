// src/constants/businessData.js

export const CUSTOMER_TYPES = {
  NEW: 'new_customer',
  REGULAR: 'regular_customer'
};

export const CUSTOMER_TYPE_LABELS = {
  [CUSTOMER_TYPES.NEW]: 'New Customer',
  [CUSTOMER_TYPES.REGULAR]: 'Regular Customer'
};

export const PROJECT_TYPES = {
  WALL_HANGING: 'wall_hanging',
  PLANT_HANGER: 'plant_hanger',
  KEYCHAIN: 'keychain',
  BAG: 'bag',
  CURTAIN: 'curtain',
  ROOM_DIVIDER: 'room_divider',
  COASTER: 'coaster',
  BOOKMARK: 'bookmark',
  JEWELRY: 'jewelry',
  CUSTOM: 'custom'
};

export const PROJECT_TYPE_LABELS = {
  [PROJECT_TYPES.WALL_HANGING]: 'Wall Hanging',
  [PROJECT_TYPES.PLANT_HANGER]: 'Plant Hanger',
  [PROJECT_TYPES.KEYCHAIN]: 'Keychain',
  [PROJECT_TYPES.BAG]: 'Bag/Purse',
  [PROJECT_TYPES.CURTAIN]: 'Curtain',
  [PROJECT_TYPES.ROOM_DIVIDER]: 'Room Divider',
  [PROJECT_TYPES.COASTER]: 'Coaster Set',
  [PROJECT_TYPES.BOOKMARK]: 'Bookmark',
  [PROJECT_TYPES.JEWELRY]: 'Jewelry',
  [PROJECT_TYPES.CUSTOM]: 'Custom Project'
};

export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  READY_FOR_PICKUP: 'ready_for_pickup',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUSES.PENDING]: 'Pending',
  [ORDER_STATUSES.CONFIRMED]: 'Confirmed',
  [ORDER_STATUSES.IN_PROGRESS]: 'In Progress',
  [ORDER_STATUSES.READY_FOR_PICKUP]: 'Ready for Pickup',
  [ORDER_STATUSES.COMPLETED]: 'Completed',
  [ORDER_STATUSES.CANCELLED]: 'Cancelled'
};

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUSES.PENDING]: '#f59e0b', // amber
  [ORDER_STATUSES.CONFIRMED]: '#3b82f6', // blue
  [ORDER_STATUSES.IN_PROGRESS]: '#8b5cf6', // purple
  [ORDER_STATUSES.READY_FOR_PICKUP]: '#10b981', // emerald
  [ORDER_STATUSES.COMPLETED]: '#22c55e', // green
  [ORDER_STATUSES.CANCELLED]: '#ef4444' // red
};

export const MATERIAL_TYPES = {
  COTTON_CORD: 'cotton_cord',
  JUTE_ROPE: 'jute_rope',
  NYLON_CORD: 'nylon_cord',
  HEMP_ROPE: 'hemp_rope',
  POLYESTER_CORD: 'polyester_cord',
  SILK_CORD: 'silk_cord',
  LEATHER_CORD: 'leather_cord'
};

export const MATERIAL_TYPE_LABELS = {
  [MATERIAL_TYPES.COTTON_CORD]: 'Cotton Cord',
  [MATERIAL_TYPES.JUTE_ROPE]: 'Jute Rope',
  [MATERIAL_TYPES.NYLON_CORD]: 'Nylon Cord',
  [MATERIAL_TYPES.HEMP_ROPE]: 'Hemp Rope',
  [MATERIAL_TYPES.POLYESTER_CORD]: 'Polyester Cord',
  [MATERIAL_TYPES.SILK_CORD]: 'Silk Cord',
  [MATERIAL_TYPES.LEATHER_CORD]: 'Leather Cord'
};

export const COMMUNICATION_PREFERENCES = {
  WHATSAPP: 'whatsapp',
  PHONE: 'phone',
  EMAIL: 'email',
  SMS: 'sms'
};

export const COMMUNICATION_LABELS = {
  [COMMUNICATION_PREFERENCES.WHATSAPP]: 'WhatsApp',
  [COMMUNICATION_PREFERENCES.PHONE]: 'Phone Call',
  [COMMUNICATION_PREFERENCES.EMAIL]: 'Email',
  [COMMUNICATION_PREFERENCES.SMS]: 'SMS'
};

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

export const PRIORITY_LABELS = {
  [PRIORITY_LEVELS.LOW]: 'Low',
  [PRIORITY_LEVELS.MEDIUM]: 'Medium',
  [PRIORITY_LEVELS.HIGH]: 'High',
  [PRIORITY_LEVELS.URGENT]: 'Urgent'
};

export const PRIORITY_COLORS = {
  [PRIORITY_LEVELS.LOW]: '#6b7280', // gray
  [PRIORITY_LEVELS.MEDIUM]: '#3b82f6', // blue
  [PRIORITY_LEVELS.HIGH]: '#f59e0b', // amber
  [PRIORITY_LEVELS.URGENT]: '#ef4444' // red
};

// Default values for forms
export const DEFAULT_VALUES = {
  customerType: CUSTOMER_TYPES.NEW,
  communicationPreference: COMMUNICATION_PREFERENCES.WHATSAPP,
  orderStatus: ORDER_STATUSES.PENDING,
  priority: PRIORITY_LEVELS.MEDIUM
};

// Helper functions
export const getCustomerTypeBadgeColor = (type) => {
  switch (type) {
    case CUSTOMER_TYPES.NEW:
      return '#10b981'; // emerald
    case CUSTOMER_TYPES.REGULAR:
      return '#3b82f6'; // blue
    default:
      return '#6b7280'; // gray
  }
};

export const getOrderStatusProgress = (status) => {
  const statusOrder = [
    ORDER_STATUSES.PENDING,
    ORDER_STATUSES.CONFIRMED,
    ORDER_STATUSES.IN_PROGRESS,
    ORDER_STATUSES.READY_FOR_PICKUP,
    ORDER_STATUSES.COMPLETED
  ];
  
  const currentIndex = statusOrder.indexOf(status);
  return currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0;
};