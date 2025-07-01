import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { userService } from '../services/userService';

// Initial state
const initialState = {
  // User profile information
  profile: {
    id: null,
    name: '',
    email: '',
    role: 'assistant', // 'admin' or 'assistant'
    avatar: null,
    phone: '',
    department: '',
    joinDate: null,
    lastActive: null,
    isActive: true,
    permissions: [],
    settings: {
      notifications: {
        email: true,
        sms: false,
        push: true,
        sound: true,
        desktop: true
      },
      dashboard: {
        layout: 'grid',
        cardsPerRow: 3,
        showMetrics: true,
        autoRefresh: true,
        refreshInterval: 30000
      },
      whatsapp: {
        autoAssign: true,
        quickReplies: true,
        showTyping: true,
        soundNotification: true
      },
      privacy: {
        showOnlineStatus: true,
        shareActivity: true,
        allowDirectMessages: true
      }
    }
  },
  
  // User permissions and access control
  permissions: {
    customers: {
      view: false,
      create: false,
      edit: false,
      delete: false,
      export: false,
      bulkActions: false
    },
    orders: {
      view: false,
      create: false,
      edit: false,
      delete: false,
      updateStatus: false,
      processPayments: false,
      generateReports: false
    },
    whatsapp: {
      viewChats: false,
      sendMessages: false,
      manageContacts: false,
      broadcast: false,
      templates: false,
      analytics: false
    },
    financial: {
      viewRevenue: false,
      viewProfits: false,
      viewCosts: false,
      editFinancial: false,
      generateReports: false,
      exportData: false
    },
    analytics: {
      viewBasic: false,
      viewAdvanced: false,
      viewCustomer: false,
      viewBusiness: false,
      exportReports: false,
      customReports: false
    },
    system: {
      manageUsers: false,
      systemSettings: false,
      backupData: false,
      viewLogs: false,
      manageIntegrations: false
    }
  },
  
  // Role-based feature access
  features: {
    dashboard: {
      adminView: false,
      assistantView: false,
      metrics: false,
      charts: false,
      quickActions: false
    },
    notifications: {
      receive: false,
      manage: false,
      broadcast: false,
      schedule: false
    }
  },
  
  // User activity and stats
  activity: {
    lastLogin: null,
    totalSessions: 0,
    totalOrders: 0,
    totalCustomers: 0,
    messagesHandled: 0,
    responseTime: 0,
    rating: 0,
    completedTasks: 0,
    pendingTasks: 0
  },
  
  // UI state
  isLoading: false,
  isUpdating: false,
  error: null,
  lastUpdated: null
};

// Action types
const USER_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_UPDATING: 'SET_UPDATING',
  SET_ERROR: 'SET_ERROR',
  SET_PROFILE: 'SET_PROFILE',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  SET_PERMISSIONS: 'SET_PERMISSIONS',
  UPDATE_PERMISSIONS: 'UPDATE_PERMISSIONS',
  SET_FEATURES: 'SET_FEATURES',
  UPDATE_ACTIVITY: 'UPDATE_ACTIVITY',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  RESET_USER: 'RESET_USER',
  SET_LAST_UPDATED: 'SET_LAST_UPDATED'
};

// Reducer function
const userReducer = (state, action) => {
  switch (action.type) {
    case USER_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error
      };

    case USER_ACTIONS.SET_UPDATING:
      return {
        ...state,
        isUpdating: action.payload
      };

    case USER_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isUpdating: false
      };

    case USER_ACTIONS.SET_PROFILE:
      return {
        ...state,
        profile: {
          ...state.profile,
          ...action.payload
        },
        isLoading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      };

    case USER_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        profile: {
          ...state.profile,
          ...action.payload
        },
        lastUpdated: new Date().toISOString()
      };

    case USER_ACTIONS.SET_PERMISSIONS:
      return {
        ...state,
        permissions: action.payload,
        lastUpdated: new Date().toISOString()
      };

    case USER_ACTIONS.UPDATE_PERMISSIONS:
      return {
        ...state,
        permissions: {
          ...state.permissions,
          ...action.payload
        },
        lastUpdated: new Date().toISOString()
      };

    case USER_ACTIONS.SET_FEATURES:
      return {
        ...state,
        features: action.payload,
        lastUpdated: new Date().toISOString()
      };

    case USER_ACTIONS.UPDATE_ACTIVITY:
      return {
        ...state,
        activity: {
          ...state.activity,
          ...action.payload
        },
        lastUpdated: new Date().toISOString()
      };

    case USER_ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        profile: {
          ...state.profile,
          settings: {
            ...state.profile.settings,
            ...action.payload
          }
        },
        lastUpdated: new Date().toISOString()
      };

    case USER_ACTIONS.RESET_USER:
      return {
        ...initialState
      };

    case USER_ACTIONS.SET_LAST_UPDATED:
      return {
        ...state,
        lastUpdated: action.payload
      };

    default:
      return state;
  }
};

// Create context
const UserContext = createContext();

// User provider component
export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Initialize user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      initializeUser();
    } else {
      dispatch({ type: USER_ACTIONS.RESET_USER });
    }
  }, [isAuthenticated, user]);

  // Initialize user profile and permissions
  const initializeUser = async () => {
    try {
      dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });

      // Set basic profile from auth user
      const basicProfile = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone || '',
        department: user.department || '',
        joinDate: user.createdAt,
        lastActive: new Date().toISOString(),
        isActive: user.isActive !== false
      };

      dispatch({ type: USER_ACTIONS.SET_PROFILE, payload: basicProfile });

      // Load detailed user data
      const [profileData, permissionsData, activityData] = await Promise.all([
        userService.getProfile(user.id),
        userService.getPermissions(user.id),
        userService.getActivity(user.id)
      ]);

      // Update profile with detailed data
      if (profileData) {
        dispatch({ type: USER_ACTIONS.UPDATE_PROFILE, payload: profileData });
      }

      // Set permissions based on role and custom permissions
      const rolePermissions = getRolePermissions(user.role);
      const finalPermissions = mergePermissions(rolePermissions, permissionsData);
      dispatch({ type: USER_ACTIONS.SET_PERMISSIONS, payload: finalPermissions });

      // Set features based on permissions
      const features = generateFeatures(finalPermissions, user.role);
      dispatch({ type: USER_ACTIONS.SET_FEATURES, payload: features });

      // Update activity data
      if (activityData) {
        dispatch({ type: USER_ACTIONS.UPDATE_ACTIVITY, payload: activityData });
      }

    } catch (error) {
      console.error('Failed to initialize user:', error);
      dispatch({ type: USER_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Get role-based permissions
  const getRolePermissions = (role) => {
    const adminPermissions = {
      customers: { view: true, create: true, edit: true, delete: true, export: true, bulkActions: true },
      orders: { view: true, create: true, edit: true, delete: true, updateStatus: true, processPayments: true, generateReports: true },
      whatsapp: { viewChats: true, sendMessages: true, manageContacts: true, broadcast: true, templates: true, analytics: true },
      financial: { viewRevenue: true, viewProfits: true, viewCosts: true, editFinancial: true, generateReports: true, exportData: true },
      analytics: { viewBasic: true, viewAdvanced: true, viewCustomer: true, viewBusiness: true, exportReports: true, customReports: true },
      system: { manageUsers: true, systemSettings: true, backupData: true, viewLogs: true, manageIntegrations: true }
    };

    const assistantPermissions = {
      customers: { view: true, create: true, edit: true, delete: false, export: false, bulkActions: false },
      orders: { view: true, create: true, edit: true, delete: false, updateStatus: true, processPayments: false, generateReports: false },
      whatsapp: { viewChats: true, sendMessages: true, manageContacts: false, broadcast: false, templates: true, analytics: false },
      financial: { viewRevenue: false, viewProfits: false, viewCosts: false, editFinancial: false, generateReports: false, exportData: false },
      analytics: { viewBasic: true, viewAdvanced: false, viewCustomer: false, viewBusiness: false, exportReports: false, customReports: false },
      system: { manageUsers: false, systemSettings: false, backupData: false, viewLogs: false, manageIntegrations: false }
    };

    return role === 'admin' ? adminPermissions : assistantPermissions;
  };

  // Merge role permissions with custom permissions
  const mergePermissions = (rolePermissions, customPermissions) => {
    if (!customPermissions) return rolePermissions;

    const merged = { ...rolePermissions };
    
    Object.keys(customPermissions).forEach(category => {
      if (merged[category]) {
        merged[category] = { ...merged[category], ...customPermissions[category] };
      }
    });

    return merged;
  };

  // Generate features based on permissions
  const generateFeatures = (permissions, role) => {
    return {
      dashboard: {
        adminView: role === 'admin',
        assistantView: role === 'assistant',
        metrics: permissions.analytics?.viewBasic || false,
        charts: permissions.analytics?.viewAdvanced || false,
        quickActions: true
      },
      notifications: {
        receive: true,
        manage: role === 'admin',
        broadcast: permissions.whatsapp?.broadcast || false,
        schedule: role === 'admin'
      }
    };
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      dispatch({ type: USER_ACTIONS.SET_UPDATING, payload: true });
      
      const updatedProfile = await userService.updateProfile(state.profile.id, profileData);
      dispatch({ type: USER_ACTIONS.UPDATE_PROFILE, payload: updatedProfile });
      
      return { success: true, data: updatedProfile };
    } catch (error) {
      dispatch({ type: USER_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: USER_ACTIONS.SET_UPDATING, payload: false });
    }
  };

  // Update user settings
  const updateSettings = async (settingsData) => {
    try {
      dispatch({ type: USER_ACTIONS.SET_UPDATING, payload: true });
      
      const updatedSettings = await userService.updateSettings(state.profile.id, settingsData);
      dispatch({ type: USER_ACTIONS.UPDATE_SETTINGS, payload: updatedSettings });
      
      // Save to localStorage for immediate access
      localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
      
      return { success: true, data: updatedSettings };
    } catch (error) {
      dispatch({ type: USER_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: USER_ACTIONS.SET_UPDATING, payload: false });
    }
  };

  // Update activity stats
  const updateActivity = (activityData) => {
    dispatch({ type: USER_ACTIONS.UPDATE_ACTIVITY, payload: activityData });
  };

  // Permission checking utilities
  const hasPermission = (category, action) => {
    return state.permissions[category]?.[action] || false;
  };

  const hasAnyPermission = (category, actions) => {
    return actions.some(action => hasPermission(category, action));
  };

  const hasAllPermissions = (category, actions) => {
    return actions.every(action => hasPermission(category, action));
  };

  const canAccess = (feature) => {
    const [category, specific] = feature.split('.');
    
    if (specific) {
      return state.features[category]?.[specific] || false;
    }
    
    return Object.values(state.features[category] || {}).some(Boolean);
  };

  // Role checking utilities
  const isAdmin = () => state.profile.role === 'admin';
  const isAssistant = () => state.profile.role === 'assistant';
  const hasRole = (role) => state.profile.role === role;

  // Get user display info
  const getDisplayName = () => state.profile.name || state.profile.email || 'User';
  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: USER_ACTIONS.SET_ERROR, payload: null });
  };

  // Refresh user data
  const refreshUser = () => {
    if (isAuthenticated && user) {
      initializeUser();
    }
  };

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    updateProfile,
    updateSettings,
    updateActivity,
    refreshUser,
    clearError,
    
    // Permission utilities
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    
    // Role utilities
    isAdmin,
    isAssistant,
    hasRole,
    
    // Display utilities
    getDisplayName,
    getInitials
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;