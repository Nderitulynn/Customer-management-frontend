import api from './api';
import { storage } from '../utils/storage';
import { NOTIFICATION_TYPES, API_ENDPOINTS, NOTIFICATION_SOUNDS } from '../utils/constants';

/**
 * Notification Service for Macrame Business CMS
 * Handles real-time notifications, push notifications, and notification management
 */

class NotificationService {
  constructor() {
    this.eventSource = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000;
    this.soundEnabled = storage.getNotificationSound() !== false;
    this.desktopEnabled = storage.getDesktopNotifications() !== false;
    this.listeners = new Map();
  }

  /**
   * Initialize real-time notification connection
   * @returns {Promise<Boolean>} Connection status
   */
  async initializeRealTime() {
    try {
      const token = storage.getToken();
      if (!token) {
        console.warn('No authentication token found for notifications');
        return false;
      }

      // Close existing connection if any
      this.disconnect();

      // Create Server-Sent Events connection
      this.eventSource = new EventSource(`${API_ENDPOINTS.NOTIFICATIONS.SSE}?token=${token}`);
      
      this.eventSource.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        console.log('Real-time notifications connected');
        this.emit('connection:open');
      };

      this.eventSource.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          this.handleIncomingNotification(notification);
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('Notification connection error:', error);
        this.isConnected = false;
        this.emit('connection:error', error);
        this.handleReconnection();
      };

      return true;
    } catch (error) {
      console.error('Failed to initialize real-time notifications:', error);
      return false;
    }
  }

  /**
   * Disconnect from real-time notifications
   */
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected = false;
      console.log('Real-time notifications disconnected');
    }
  }

  /**
   * Handle automatic reconnection
   */
  handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.initializeRealTime();
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('connection:failed');
    }
  }

  /**
   * Handle incoming notification
   * @param {Object} notification - Notification data
   */
  handleIncomingNotification(notification) {
    // Play sound if enabled
    if (this.soundEnabled && notification.sound !== false) {
      this.playNotificationSound(notification.type);
    }

    // Show desktop notification if enabled
    if (this.desktopEnabled && notification.desktop !== false) {
      this.showDesktopNotification(notification);
    }

    // Emit to listeners
    this.emit('notification:received', notification);
    this.emit(`notification:${notification.type}`, notification);
  }

  /**
   * Get all notifications
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Notifications list
   */
  async getNotifications(filters = {}) {
    try {
      const params = {
        page: filters.page || 1,
        limit: filters.limit || 20,
        type: filters.type,
        status: filters.status || 'all',
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        priority: filters.priority,
        sortBy: filters.sortBy || 'createdAt',
        sortOrder: filters.sortOrder || 'desc'
      };

      const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.LIST, { params });

      return {
        success: true,
        data: {
          notifications: response.data.notifications || [],
          pagination: response.data.pagination || {},
          unreadCount: response.data.unreadCount || 0,
          total: response.data.total || 0
        },
        message: 'Notifications loaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: { notifications: [], pagination: {}, unreadCount: 0, total: 0 },
        message: error.response?.data?.message || 'Failed to load notifications'
      };
    }
  }

  /**
   * Get notification by ID
   * @param {String} notificationId - Notification ID
   * @returns {Promise<Object>} Notification details
   */
  async getNotificationById(notificationId) {
    try {
      if (!notificationId) {
        return {
          success: false,
          data: null,
          message: 'Notification ID is required'
        };
      }

      const response = await api.get(`${API_ENDPOINTS.NOTIFICATIONS.DETAILS}/${notificationId}`);

      return {
        success: true,
        data: response.data.notification,
        message: 'Notification loaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to load notification'
      };
    }
  }

  /**
   * Mark notification as read
   * @param {String} notificationId - Notification ID
   * @returns {Promise<Object>} Update result
   */
  async markAsRead(notificationId) {
    try {
      if (!notificationId) {
        return {
          success: false,
          message: 'Notification ID is required'
        };
      }

      const response = await api.patch(`${API_ENDPOINTS.NOTIFICATIONS.MARK_READ}/${notificationId}`);

      this.emit('notification:read', { notificationId });

      return {
        success: true,
        data: response.data.notification,
        message: 'Notification marked as read'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark notification as read'
      };
    }
  }

  /**
   * Mark multiple notifications as read
   * @param {Array} notificationIds - Array of notification IDs
   * @returns {Promise<Object>} Bulk update result
   */
  async markMultipleAsRead(notificationIds) {
    try {
      if (!notificationIds || notificationIds.length === 0) {
        return {
          success: false,
          message: 'Notification IDs are required'
        };
      }

      const response = await api.patch(API_ENDPOINTS.NOTIFICATIONS.BULK_READ, {
        notificationIds
      });

      this.emit('notifications:bulk_read', { notificationIds });

      return {
        success: true,
        data: response.data,
        message: `${notificationIds.length} notifications marked as read`
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark notifications as read'
      };
    }
  }

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} Update result
   */
  async markAllAsRead() {
    try {
      const response = await api.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);

      this.emit('notifications:all_read');

      return {
        success: true,
        data: response.data,
        message: 'All notifications marked as read'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark all notifications as read'
      };
    }
  }

  /**
   * Delete notification
   * @param {String} notificationId - Notification ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteNotification(notificationId) {
    try {
      if (!notificationId) {
        return {
          success: false,
          message: 'Notification ID is required'
        };
      }

      await api.delete(`${API_ENDPOINTS.NOTIFICATIONS.DELETE}/${notificationId}`);

      this.emit('notification:deleted', { notificationId });

      return {
        success: true,
        message: 'Notification deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete notification'
      };
    }
  }

  /**
   * Delete multiple notifications
   * @param {Array} notificationIds - Array of notification IDs
   * @returns {Promise<Object>} Bulk deletion result
   */
  async deleteMultiple(notificationIds) {
    try {
      if (!notificationIds || notificationIds.length === 0) {
        return {
          success: false,
          message: 'Notification IDs are required'
        };
      }

      const response = await api.delete(API_ENDPOINTS.NOTIFICATIONS.BULK_DELETE, {
        data: { notificationIds }
      });

      this.emit('notifications:bulk_deleted', { notificationIds });

      return {
        success: true,
        data: response.data,
        message: `${notificationIds.length} notifications deleted successfully`
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete notifications'
      };
    }
  }

  /**
   * Get notification settings
   * @returns {Promise<Object>} Notification settings
   */
  async getSettings() {
    try {
      const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.SETTINGS);

      return {
        success: true,
        data: response.data.settings,
        message: 'Notification settings loaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: this.getDefaultSettings(),
        message: error.response?.data?.message || 'Failed to load notification settings'
      };
    }
  }

  /**
   * Update notification settings
   * @param {Object} settings - Notification settings
   * @returns {Promise<Object>} Update result
   */
  async updateSettings(settings) {
    try {
      const response = await api.put(API_ENDPOINTS.NOTIFICATIONS.SETTINGS, settings);

      // Update local settings
      this.soundEnabled = settings.soundEnabled !== false;
      this.desktopEnabled = settings.desktopEnabled !== false;
      
      // Store in localStorage
      storage.setNotificationSound(this.soundEnabled);
      storage.setDesktopNotifications(this.desktopEnabled);

      this.emit('settings:updated', settings);

      return {
        success: true,
        data: response.data.settings,
        message: 'Notification settings updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update notification settings'
      };
    }
  }

  /**
   * Create notification (Admin/System use)
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Created notification
   */
  async createNotification(notificationData) {
    try {
      const requiredFields = ['title', 'message', 'type'];
      const missingFields = requiredFields.filter(field => !notificationData[field]);
      
      if (missingFields.length > 0) {
        return {
          success: false,
          data: null,
          message: `Required fields missing: ${missingFields.join(', ')}`
        };
      }

      // Validate notification type
      if (!Object.values(NOTIFICATION_TYPES).includes(notificationData.type)) {
        return {
          success: false,
          data: null,
          message: 'Invalid notification type'
        };
      }

      const response = await api.post(API_ENDPOINTS.NOTIFICATIONS.CREATE, notificationData);

      return {
        success: true,
        data: response.data.notification,
        message: 'Notification created successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to create notification'
      };
    }
  }

  /**
   * Send broadcast notification (Admin only)
   * @param {Object} broadcastData - Broadcast notification data
   * @returns {Promise<Object>} Broadcast result
   */
  async sendBroadcast(broadcastData) {
    try {
      const requiredFields = ['title', 'message', 'recipients'];
      const missingFields = requiredFields.filter(field => !broadcastData[field]);
      
      if (missingFields.length > 0) {
        return {
          success: false,
          message: `Required fields missing: ${missingFields.join(', ')}`
        };
      }

      const response = await api.post(API_ENDPOINTS.NOTIFICATIONS.BROADCAST, broadcastData);

      return {
        success: true,
        data: response.data,
        message: 'Broadcast notification sent successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send broadcast notification'
      };
    }
  }

  /**
   * Get notification statistics
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Notification statistics
   */
  async getStatistics(filters = {}) {
    try {
      const params = {
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        type: filters.type,
        groupBy: filters.groupBy || 'day'
      };

      const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.STATS, { params });

      return {
        success: true,
        data: response.data.stats,
        message: 'Notification statistics loaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to load notification statistics'
      };
    }
  }

  /**
   * Request desktop notification permission
   * @returns {Promise<String>} Permission status
   */
  async requestDesktopPermission() {
    try {
      if (!('Notification' in window)) {
        return 'not-supported';
      }

      if (Notification.permission === 'granted') {
        return 'granted';
      }

      if (Notification.permission === 'denied') {
        return 'denied';
      }

      const permission = await Notification.requestPermission();
      this.desktopEnabled = permission === 'granted';
      storage.setDesktopNotifications(this.desktopEnabled);

      return permission;
    } catch (error) {
      console.error('Error requesting desktop notification permission:', error);
      return 'error';
    }
  }

  /**
   * Show desktop notification
   * @param {Object} notification - Notification data
   */
  showDesktopNotification(notification) {
    try {
      if (!this.desktopEnabled || Notification.permission !== 'granted') {
        return;
      }

      const options = {
        body: notification.message,
        icon: notification.icon || '/favicon.ico',
        badge: '/badge-icon.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'high',
        silent: !this.soundEnabled
      };

      const desktopNotification = new Notification(notification.title, options);

      desktopNotification.onclick = () => {
        window.focus();
        if (notification.action && notification.actionData) {
          this.emit('notification:action', {
            action: notification.action,
            data: notification.actionData
          });
        }
        desktopNotification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => {
        desktopNotification.close();
      }, 5000);

    } catch (error) {
      console.error('Error showing desktop notification:', error);
    }
  }

  /**
   * Play notification sound
   * @param {String} type - Notification type
   */
  playNotificationSound(type = 'default') {
    try {
      if (!this.soundEnabled) return;

      const soundFile = NOTIFICATION_SOUNDS[type] || NOTIFICATION_SOUNDS.default;
      const audio = new Audio(soundFile);
      audio.volume = 0.5;
      audio.play().catch(error => {
        console.warn('Could not play notification sound:', error);
      });
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  /**
   * Get unread notification count
   * @returns {Promise<Number>} Unread count
   */
  async getUnreadCount() {
    try {
      const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
      return response.data.count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Clear all notifications
   * @returns {Promise<Object>} Clear result
   */
  async clearAll() {
    try {
      const response = await api.delete(API_ENDPOINTS.NOTIFICATIONS.CLEAR_ALL);

      this.emit('notifications:cleared');

      return {
        success: true,
        data: response.data,
        message: 'All notifications cleared successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to clear notifications'
      };
    }
  }

  /**
   * Archive old notifications
   * @param {Number} daysOld - Archive notifications older than X days
   * @returns {Promise<Object>} Archive result
   */
  async archiveOld(daysOld = 30) {
    try {
      const response = await api.post(API_ENDPOINTS.NOTIFICATIONS.ARCHIVE, {
        daysOld
      });

      return {
        success: true,
        data: response.data,
        message: `Archived ${response.data.count || 0} old notifications`
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to archive notifications'
      };
    }
  }

  /**
   * Get default notification settings
   * @returns {Object} Default settings
   */
  getDefaultSettings() {
    return {
      soundEnabled: true,
      desktopEnabled: true,
      emailNotifications: true,
      smsNotifications: false,
      whatsappNotifications: true,
      orderNotifications: true,
      customerNotifications: true,
      systemNotifications: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    };
  }

  /**
   * Event listener management
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data = null) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in notification event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get connection status
   * @returns {Boolean} Connection status
   */
  isRealTimeConnected() {
    return this.isConnected;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.disconnect();
    this.listeners.clear();
  }
}

// Create and export a singleton instance
const notificationService = new NotificationService();
export default notificationService;