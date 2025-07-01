import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import notificationService from '../services/notificationService';

// Initial state
const initialState = {
  notifications: [],
  toasts: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  settings: {
    soundEnabled: true,
    desktopEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    autoPlaySound: true,
    soundVolume: 0.7,
    showToasts: true,
    toastDuration: 5000,
    maxToasts: 5
  },
  connectionStatus: 'disconnected', // connected, disconnected, reconnecting
  lastUpdated: null
};

// Action types
const NOTIFICATION_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Notifications
  LOAD_NOTIFICATIONS_SUCCESS: 'LOAD_NOTIFICATIONS_SUCCESS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  UPDATE_NOTIFICATION: 'UPDATE_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  
  // Toasts
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
  CLEAR_TOASTS: 'CLEAR_TOASTS',
  
  // Settings
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  LOAD_SETTINGS: 'LOAD_SETTINGS',
  
  // Connection
  SET_CONNECTION_STATUS: 'SET_CONNECTION_STATUS',
  SET_LAST_UPDATED: 'SET_LAST_UPDATED'
};

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  ORDER: 'order',
  CUSTOMER: 'customer',
  WHATSAPP: 'whatsapp',
  SYSTEM: 'system',
  PAYMENT: 'payment'
};

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Notification reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case NOTIFICATION_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case NOTIFICATION_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case NOTIFICATION_ACTIONS.LOAD_NOTIFICATIONS_SUCCESS:
      const notifications = Array.isArray(action.payload) ? action.payload : [];
      return {
        ...state,
        notifications,
        unreadCount: notifications.filter(n => !n.read).length,
        isLoading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      };

    case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
      const newNotification = {
        id: action.payload.id || Date.now().toString(),
        ...action.payload,
        createdAt: action.payload.createdAt || new Date().toISOString(),
        read: false
      };
      
      const currentNotifications = Array.isArray(state.notifications) ? state.notifications : [];
      
      return {
        ...state,
        notifications: [newNotification, ...currentNotifications],
        unreadCount: state.unreadCount + 1,
        lastUpdated: new Date().toISOString()
      };

    case NOTIFICATION_ACTIONS.UPDATE_NOTIFICATION:
      return {
        ...state,
        notifications: (state.notifications || []).map(notification =>
          notification.id === action.payload.id
            ? { ...notification, ...action.payload.updates }
            : notification
        ),
        lastUpdated: new Date().toISOString()
      };

    case NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION:
      const safeNotifications = state.notifications || [];
      const removedNotification = safeNotifications.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: safeNotifications.filter(n => n.id !== action.payload),
        unreadCount: removedNotification && !removedNotification.read 
          ? state.unreadCount - 1 
          : state.unreadCount,
        lastUpdated: new Date().toISOString()
      };

    case NOTIFICATION_ACTIONS.MARK_AS_READ:
      const notificationsForRead = state.notifications || [];
      const notificationToRead = notificationsForRead.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: notificationsForRead.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true, readAt: new Date().toISOString() }
            : notification
        ),
        unreadCount: notificationToRead && !notificationToRead.read 
          ? state.unreadCount - 1 
          : state.unreadCount,
        lastUpdated: new Date().toISOString()
      };

    case NOTIFICATION_ACTIONS.MARK_ALL_AS_READ:
      return {
        ...state,
        notifications: (state.notifications || []).map(notification => ({
          ...notification,
          read: true,
          readAt: notification.read ? notification.readAt : new Date().toISOString()
        })),
        unreadCount: 0,
        lastUpdated: new Date().toISOString()
      };

    case NOTIFICATION_ACTIONS.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
        lastUpdated: new Date().toISOString()
      };

    case NOTIFICATION_ACTIONS.ADD_TOAST:
      const newToast = {
        id: action.payload.id || Date.now().toString(),
        ...action.payload,
        createdAt: new Date().toISOString()
      };
      
      const currentToasts = Array.isArray(state.toasts) ? state.toasts : [];
      // Limit number of toasts
      const updatedToasts = [newToast, ...currentToasts].slice(0, state.settings.maxToasts);
      
      return {
        ...state,
        toasts: updatedToasts
      };

    case NOTIFICATION_ACTIONS.REMOVE_TOAST:
      return {
        ...state,
        toasts: (state.toasts || []).filter(toast => toast.id !== action.payload)
      };

    case NOTIFICATION_ACTIONS.CLEAR_TOASTS:
      return {
        ...state,
        toasts: []
      };

    case NOTIFICATION_ACTIONS.LOAD_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };

    case NOTIFICATION_ACTIONS.UPDATE_SETTINGS:
      const newSettings = { ...state.settings, ...action.payload };
      return {
        ...state,
        settings: newSettings
      };

    case NOTIFICATION_ACTIONS.SET_CONNECTION_STATUS:
      return {
        ...state,
        connectionStatus: action.payload
      };

    case NOTIFICATION_ACTIONS.SET_LAST_UPDATED:
      return {
        ...state,
        lastUpdated: action.payload
      };

    default:
      return state;
  }
};

// Create context
const NotificationContext = createContext();

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const connectionRef = useRef(null);
  const toastTimeoutsRef = useRef(new Map());

  // Load settings from localStorage on initialization
  useEffect(() => {
    loadSettings();
    requestNotificationPermission();
    loadNotifications();
  }, []);

  // Set up real-time connection
  useEffect(() => {
    setupRealTimeConnection();
    return () => {
      cleanup();
    };
  }, []);

  // Load notification settings
  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('notification_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        dispatch({
          type: NOTIFICATION_ACTIONS.LOAD_SETTINGS,
          payload: settings
        });
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  // Save settings to localStorage
  const saveSettings = (settings) => {
    try {
      localStorage.setItem('notification_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
      } catch (error) {
        console.error('Failed to request notification permission:', error);
      }
    }
  };

  // Load notifications from server
  const loadNotifications = async () => {
    try {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: true });
      
      const response = await notificationService.getNotifications();
      
      if (response.success) {
        dispatch({
          type: NOTIFICATION_ACTIONS.LOAD_NOTIFICATIONS_SUCCESS,
          payload: response.data
        });
      } else {
        throw new Error(response.message || 'Failed to load notifications');
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      dispatch({
        type: NOTIFICATION_ACTIONS.SET_ERROR,
        payload: error.message
      });
    }
  };

  // Setup real-time connection
  const setupRealTimeConnection = async () => {
    try {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_CONNECTION_STATUS, payload: 'connecting' });
      
      // Initialize WebSocket or Server-Sent Events connection
      const connection = await notificationService.initializeRealTime({
        onMessage: handleRealTimeNotification,
        onConnect: () => {
          dispatch({ type: NOTIFICATION_ACTIONS.SET_CONNECTION_STATUS, payload: 'connected' });
        },
        onDisconnect: () => {
          dispatch({ type: NOTIFICATION_ACTIONS.SET_CONNECTION_STATUS, payload: 'disconnected' });
        },
        onError: (error) => {
          console.error('Real-time connection error:', error);
          dispatch({ type: NOTIFICATION_ACTIONS.SET_CONNECTION_STATUS, payload: 'disconnected' });
        }
      });

      connectionRef.current = connection;
    } catch (error) {
      console.error('Failed to setup real-time connection:', error);
      dispatch({ type: NOTIFICATION_ACTIONS.SET_CONNECTION_STATUS, payload: 'disconnected' });
    }
  };

  // Handle real-time notifications
  const handleRealTimeNotification = useCallback((notification) => {
    addNotification(notification);
    
    // Show toast if enabled
    if (state.settings.showToasts) {
      showToast({
        type: notification.type || TOAST_TYPES.INFO,
        title: notification.title,
        message: notification.message
      });
    }

    // Play sound if enabled
    if (state.settings.soundEnabled && state.settings.autoPlaySound) {
      playNotificationSound();
    }

    // Show desktop notification if enabled
    if (state.settings.desktopEnabled) {
      showDesktopNotification(notification);
    }
  }, [state.settings]);

  // Add notification
  const addNotification = (notification) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION,
      payload: notification
    });
  };

  // Update notification
  const updateNotification = (id, updates) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.UPDATE_NOTIFICATION,
      payload: { id, updates }
    });
  };

  // Remove notification
  const removeNotification = (id) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION,
      payload: id
    });
  };

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      dispatch({
        type: NOTIFICATION_ACTIONS.MARK_AS_READ,
        payload: id
      });

      // Update on server
      await notificationService.markAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Optionally revert the optimistic update
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      dispatch({ type: NOTIFICATION_ACTIONS.MARK_ALL_AS_READ });

      // Update on server
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Optionally revert the optimistic update
    }
  };

  // Clear all notifications
  const clearNotifications = async () => {
    try {
      dispatch({ type: NOTIFICATION_ACTIONS.CLEAR_NOTIFICATIONS });

      // Clear on server
      await notificationService.clearNotifications();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
      // Optionally revert the optimistic update
    }
  };

  // Show toast notification
  const showToast = (toast) => {
    const toastId = toast.id || Date.now().toString();
    
    dispatch({
      type: NOTIFICATION_ACTIONS.ADD_TOAST,
      payload: {
        ...toast,
        id: toastId
      }
    });

    // Auto-remove toast after specified duration
    if (toast.duration !== 0) { // 0 means persistent
      const timeoutId = setTimeout(() => {
        removeToast(toastId);
      }, toast.duration || state.settings.toastDuration);
      
      toastTimeoutsRef.current.set(toastId, timeoutId);
    }

    return toastId;
  };

  // Remove toast
  const removeToast = (id) => {
    // Clear any pending timeout
    const timeoutId = toastTimeoutsRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      toastTimeoutsRef.current.delete(id);
    }

    dispatch({
      type: NOTIFICATION_ACTIONS.REMOVE_TOAST,
      payload: id
    });
  };

  // Clear all toasts
  const clearToasts = () => {
    // Clear all pending timeouts
    toastTimeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
    toastTimeoutsRef.current.clear();

    dispatch({ type: NOTIFICATION_ACTIONS.CLEAR_TOASTS });
  };

  // Show desktop notification
  const showDesktopNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const desktopNotification = new Notification(notification.title, {
          body: notification.message,
          icon: notification.icon || '/favicon.ico',
          tag: notification.id,
          requireInteraction: notification.priority === 'high'
        });

        desktopNotification.onclick = () => {
          window.focus();
          if (notification.action) {
            notification.action();
          }
          desktopNotification.close();
        };

        // Auto-close after 10 seconds
        setTimeout(() => {
          desktopNotification.close();
        }, 10000);

      } catch (error) {
        console.error('Failed to show desktop notification:', error);
      }
    }
  };

  // Play notification sound
  const playNotificationSound = () => {
    if (state.settings.soundEnabled) {
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = state.settings.soundVolume;
        audio.play().catch(error => {
          console.warn('Failed to play notification sound:', error);
        });
      } catch (error) {
        console.error('Failed to create notification sound:', error);
      }
    }
  };

  // Update notification settings
  const updateSettings = (newSettings) => {
    const updatedSettings = { ...state.settings, ...newSettings };
    
    dispatch({
      type: NOTIFICATION_ACTIONS.UPDATE_SETTINGS,
      payload: newSettings
    });

    // Save to localStorage
    saveSettings(updatedSettings);
  };

  // Get notifications by type
  const getNotificationsByType = (type) => {
    return (state.notifications || []).filter(notification => notification.type === type);
  };

  // Get unread notifications
  const getUnreadNotifications = () => {
    return (state.notifications || []).filter(notification => !notification.read);
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: NOTIFICATION_ACTIONS.CLEAR_ERROR });
  };

  // Cleanup function
  const cleanup = () => {
    // Clear all toast timeouts
    toastTimeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
    toastTimeoutsRef.current.clear();

    // Close real-time connection
    if (connectionRef.current) {
      connectionRef.current.close?.();
    }

    // Cleanup notification service
    notificationService.cleanup?.();
  };

  // Convenience methods for different toast types
  const showSuccess = (message, title = 'Success') => {
    return showToast({
      type: TOAST_TYPES.SUCCESS,
      title,
      message
    });
  };

  const showError = (message, title = 'Error') => {
    return showToast({
      type: TOAST_TYPES.ERROR,
      title,
      message,
      duration: 0 // Persistent for errors
    });
  };

  const showWarning = (message, title = 'Warning') => {
    return showToast({
      type: TOAST_TYPES.WARNING,
      title,
      message
    });
  };

  const showInfo = (message, title = 'Info') => {
    return showToast({
      type: TOAST_TYPES.INFO,
      title,
      message
    });
  };

  // Context value
  const value = {
    // State
    notifications: state.notifications,
    toasts: state.toasts,
    unreadCount: state.unreadCount,
    isLoading: state.isLoading,
    error: state.error,
    settings: state.settings,
    connectionStatus: state.connectionStatus,
    lastUpdated: state.lastUpdated,

    // Notification actions
    addNotification,
    updateNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    loadNotifications,

    // Toast actions
    showToast,
    removeToast,
    clearToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,

    // Settings
    updateSettings,

    // Utility functions
    getNotificationsByType,
    getUnreadNotifications,
    playNotificationSound,
    clearError,

    // Constants
    NOTIFICATION_TYPES,
    TOAST_TYPES
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
};

// Export context for direct access if needed
export default NotificationContext;