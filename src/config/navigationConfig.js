import { 
  LayoutDashboard,
  Users, 
  UserPlus,
  ShoppingCart,
  Settings,
  BarChart3,
  MessageSquare,
  FileText,
  Bell,
  CreditCard,
  Package,
  TrendingUp,
  HelpCircle,
  Shield,
  Database,
  LogOut
} from 'lucide-react';

// User roles for permission-based navigation
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  OPERATOR: 'operator'
};

// Navigation configuration with grouping, permissions, and metadata
export const navigationConfig = {
  // Main navigation sections
  main: [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      path: '/admin/overview',
      permissions: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.OPERATOR],
      badge: null,
      description: 'Dashboard overview and key metrics'
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      path: '/admin/customers',
      permissions: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      badge: null,
      description: 'Manage customer accounts and profiles'
    },
    {
      id: 'assistants',
      label: 'Assistants',
      icon: UserPlus,
      path: '/admin/assistants',
      permissions: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      badge: null,
      description: 'Manage AI assistants and configurations'
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart,
      path: '/admin/orders',
      permissions: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.OPERATOR],
      badge: null, // Could be dynamically set to show pending orders count
      description: 'View and manage customer orders'
    }
  ],

  // Analytics and reporting section
  analytics: [
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: '/admin/analytics',
      permissions: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      badge: null,
      description: 'Business analytics and performance metrics'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      path: '/admin/reports',
      permissions: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      badge: null,
      description: 'Generate and view business reports'
    },
    {
      id: 'trends',
      label: 'Trends',
      icon: TrendingUp,
      path: '/admin/trends',
      permissions: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      badge: null,
      description: 'Market trends and insights'
    }
  ],

  // Communication section
  communication: [
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      path: '/admin/messages',
      permissions: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.OPERATOR],
      badge: null, // Could show unread message count
      description: 'Customer messages and support tickets'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      path: '/admin/notifications',
      permissions: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      badge: null,
      description: 'System notifications and alerts'
    }
  ],

  // Business management section
  business: [
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      path: '/admin/products',
      permissions: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
      badge: null,
      description: 'Manage product catalog and inventory'
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      path: '/admin/payments',
      permissions: [USER_ROLES.ADMIN],
      badge: null,
      description: 'Payment processing and financial data'
    }
  ],

  // System and settings section
  system: [
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/admin/settings',
      permissions: [USER_ROLES.ADMIN],
      badge: null,
      description: 'System configuration and preferences'
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      path: '/admin/security',
      permissions: [USER_ROLES.ADMIN],
      badge: null,
      description: 'Security settings and access controls'
    },
    {
      id: 'database',
      label: 'Database',
      icon: Database,
      path: '/admin/database',
      permissions: [USER_ROLES.ADMIN],
      badge: null,
      description: 'Database management and backups'
    }
  ],

  // Footer/utility section
  footer: [
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      path: '/admin/help',
      permissions: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.OPERATOR],
      badge: null,
      description: 'Documentation and support resources'
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: LogOut,
      path: '/logout',
      permissions: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.OPERATOR],
      badge: null,
      description: 'Sign out of admin panel',
      variant: 'danger'
    }
  ]
};

// Group labels for sidebar organization
export const navigationGroups = {
  main: 'Main Navigation',
  analytics: 'Analytics & Reports',
  communication: 'Communication',
  business: 'Business Management',
  system: 'System & Settings',
  footer: null // No label for footer section
};

// Helper functions for navigation management
export const navigationHelpers = {
  // Get all menu items for a specific user role
  getMenuItemsByRole: (userRole) => {
    const allItems = [];
    Object.values(navigationConfig).forEach(section => {
      section.forEach(item => {
        if (item.permissions.includes(userRole)) {
          allItems.push(item);
        }
      });
    });
    return allItems;
  },

  // Get menu items by section
  getMenuItemsBySection: (sectionName) => {
    return navigationConfig[sectionName] || [];
  },

  // Find a specific menu item by ID
  getMenuItemById: (itemId) => {
    for (const section of Object.values(navigationConfig)) {
      const item = section.find(item => item.id === itemId);
      if (item) return item;
    }
    return null;
  },

  // Get all sections that a user has access to
  getAccessibleSections: (userRole) => {
    const accessibleSections = {};
    Object.entries(navigationConfig).forEach(([sectionKey, items]) => {
      const accessibleItems = items.filter(item => 
        item.permissions.includes(userRole)
      );
      if (accessibleItems.length > 0) {
        accessibleSections[sectionKey] = accessibleItems;
      }
    });
    return accessibleSections;
  },

  // Check if user has permission for a specific menu item
  hasPermission: (itemId, userRole) => {
    const item = navigationHelpers.getMenuItemById(itemId);
    return item ? item.permissions.includes(userRole) : false;
  },

  // Get default active section for a user role
  getDefaultActiveSection: (userRole) => {
    // Always try to return 'overview' if user has access
    if (navigationHelpers.hasPermission('overview', userRole)) {
      return 'overview';
    }
    
    // Otherwise return the first accessible item
    const accessibleItems = navigationHelpers.getMenuItemsByRole(userRole);
    return accessibleItems.length > 0 ? accessibleItems[0].id : null;
  }
};

export default navigationConfig;