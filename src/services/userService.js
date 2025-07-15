import api from './api';
import { storage } from '../utils/storage';
import { ROLES, API_ENDPOINTS } from '../utils/constants';

/**
 * User Service for Macrame Business CMS
 * Handles user management operations, profile updates, and role-based functionality
 */

class UserService {
  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile data
   */
  async getCurrentUser() {
    try {
      const response = await api.get(API_ENDPOINTS.USER.PROFILE);
      return {
        success: true,
        data: response.data.user,
        message: 'Profile loaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to load user profile'
      };
    }
  }

  /**
   * Update current user profile
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user profile
   */
  async updateProfile(userData) {
    try {
      // Validate required fields
      if (!userData.name || !userData.email) {
        return {
          success: false,
          data: null,
          message: 'Name and email are required fields'
        };
      }

      const response = await api.put(API_ENDPOINTS.USER.PROFILE, userData);
      
      // Update stored user data if successful
      if (response.data.user) {
        storage.setUser(response.data.user);
      }

      return {
        success: true,
        data: response.data.user,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to update profile'
      };
    }
  }

  /**
   * Change user password
   * @param {Object} passwordData - Current and new password
   * @returns {Promise<Object>} Password change result
   */
  async changePassword(passwordData) {
    try {
      const { currentPassword, newPassword, confirmPassword } = passwordData;

      // Client-side validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        return {
          success: false,
          message: 'All password fields are required'
        };
      }

      if (newPassword !== confirmPassword) {
        return {
          success: false,
          message: 'New passwords do not match'
        };
      }

      if (newPassword.length < 8) {
        return {
          success: false,
          message: 'New password must be at least 8 characters long'
        };
      }

      const response = await api.put(API_ENDPOINTS.USER.CHANGE_PASSWORD, {
        currentPassword,
        newPassword
      });

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to change password'
      };
    }
  }

  /**
   * Get all users (Admin only)
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} List of users
   */
  async getUsers(filters = {}) {
    try {
      const params = {
        page: filters.page || 1,
        limit: filters.limit || 10,
        role: filters.role,
        status: filters.status,
        search: filters.search,
        sortBy: filters.sortBy || 'createdAt',
        sortOrder: filters.sortOrder || 'desc'
      };

      const response = await api.get(API_ENDPOINTS.USER.LIST, { params });

      return {
        success: true,
        data: {
          users: response.data.users || [],
          pagination: response.data.pagination || {},
          total: response.data.total || 0
        },
        message: 'Users loaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: { users: [], pagination: {}, total: 0 },
        message: error.response?.data?.message || 'Failed to load users'
      };
    }
  }

  /**
   * Get user by ID (Admin only)
   * @param {String} userId - User ID
   * @returns {Promise<Object>} User details
   */
  async getUserById(userId) {
    try {
      if (!userId) {
        return {
          success: false,
          data: null,
          message: 'User ID is required'
        };
      }

      const response = await api.get(`${API_ENDPOINTS.USER.DETAILS}/${userId}`);

      return {
        success: true,
        data: response.data.user,
        message: 'User details loaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to load user details'
      };
    }
  }

  /**
   * Create new user (Admin only)
   * @param {Object} userData - New user data
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    try {
      // Validate required fields
      const requiredFields = ['name', 'email', 'password', 'role'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        return {
          success: false,
          data: null,
          message: `Required fields missing: ${missingFields.join(', ')}`
        };
      }

      // Validate role
      if (!Object.values(ROLES).includes(userData.role)) {
        return {
          success: false,
          data: null,
          message: 'Invalid user role specified'
        };
      }

      const response = await api.post(API_ENDPOINTS.USER.CREATE, userData);

      return {
        success: true,
        data: response.data.user,
        message: 'User created successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to create user'
      };
    }
  }

  /**
   * Update user (Admin only)
   * @param {String} userId - User ID to update
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(userId, userData) {
    try {
      if (!userId) {
        return {
          success: false,
          data: null,
          message: 'User ID is required'
        };
      }

      // Validate role if provided
      if (userData.role && !Object.values(ROLES).includes(userData.role)) {
        return {
          success: false,
          data: null,
          message: 'Invalid user role specified'
        };
      }

      const response = await api.put(`${API_ENDPOINTS.USER.UPDATE}/${userId}`, userData);

      return {
        success: true,
        data: response.data.user,
        message: 'User updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to update user'
      };
    }
  }

  /**
   * Delete user (Admin only)
   * @param {String} userId - User ID to delete
   * @returns {Promise<Object>} Deletion result
   */
  async deleteUser(userId) {
    try {
      if (!userId) {
        return {
          success: false,
          message: 'User ID is required'
        };
      }

      await api.delete(`${API_ENDPOINTS.USER.DELETE}/${userId}`);

      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete user'
      };
    }
  }

  /**
   * Update user status (Admin only)
   * @param {String} userId - User ID
   * @param {String} status - New status (active/inactive)
   * @returns {Promise<Object>} Status update result
   */
  async updateUserStatus(userId, status) {
    try {
      if (!userId || !status) {
        return {
          success: false,
          message: 'User ID and status are required'
        };
      }

      const validStatuses = ['active', 'inactive', 'suspended'];
      if (!validStatuses.includes(status)) {
        return {
          success: false,
          message: 'Invalid status. Must be: active, inactive, or suspended'
        };
      }

      const response = await api.patch(`${API_ENDPOINTS.USER.UPDATE_STATUS}/${userId}`, {
        status
      });

      return {
        success: true,
        data: response.data.user,
        message: `User status updated to ${status}`
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update user status'
      };
    }
  }

  /**
   * Get user activity log (Admin only)
   * @param {String} userId - User ID
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} User activity data
   */
  async getUserActivity(userId, filters = {}) {
    try {
      if (!userId) {
        return {
          success: false,
          data: [],
          message: 'User ID is required'
        };
      }

      const params = {
        page: filters.page || 1,
        limit: filters.limit || 20,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        activityType: filters.activityType
      };

      const response = await api.get(`${API_ENDPOINTS.USER.ACTIVITY}/${userId}`, {
        params
      });

      return {
        success: true,
        data: response.data.activities || [],
        pagination: response.data.pagination || {},
        message: 'Activity log loaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to load user activity'
      };
    }
  }

  /**
   * Get user statistics (Admin only)
   * @param {String} userId - User ID
   * @returns {Promise<Object>} User statistics
   */
  async getUserStats(userId) {
    try {
      if (!userId) {
        return {
          success: false,
          data: null,
          message: 'User ID is required'
        };
      }

      const response = await api.get(`${API_ENDPOINTS.USER.STATS}/${userId}`);

      return {
        success: true,
        data: response.data.stats,
        message: 'User statistics loaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to load user statistics'
      };
    }
  }

  /**
   * Reset user password (Admin only)
   * @param {String} userId - User ID
   * @param {String} newPassword - New temporary password
   * @returns {Promise<Object>} Password reset result
   */
  async resetUserPassword(userId, newPassword) {
    try {
      if (!userId || !newPassword) {
        return {
          success: false,
          message: 'User ID and new password are required'
        };
      }

      if (newPassword.length < 8) {
        return {
          success: false,
          message: 'Password must be at least 8 characters long'
        };
      }

      const response = await api.post(`${API_ENDPOINTS.USER.RESET_PASSWORD}/${userId}`, {
        newPassword
      });

      return {
        success: true,
        data: response.data,
        message: 'Password reset successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password'
      };
    }
  }

  /**
   * Upload user avatar
   * @param {File} file - Avatar image file
   * @returns {Promise<Object>} Upload result
   */
  async uploadAvatar(file) {
    try {
      if (!file) {
        return {
          success: false,
          message: 'File is required'
        };
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          message: 'Invalid file type. Only JPEG, PNG, and GIF are allowed'
        };
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        return {
          success: false,
          message: 'File size too large. Maximum size is 5MB'
        };
      }

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post(API_ENDPOINTS.USER.UPLOAD_AVATAR, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        success: true,
        data: {
          avatarUrl: response.data.avatarUrl,
          user: response.data.user
        },
        message: 'Avatar uploaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload avatar'
      };
    }
  }

  /**
   * Get user permissions
   * @param {String} userId - User ID (optional, defaults to current user)
   * @returns {Promise<Object>} User permissions
   */
  async getUserPermissions(userId = null) {
    try {
      const endpoint = userId 
        ? `${API_ENDPOINTS.USER.PERMISSIONS}/${userId}`
        : API_ENDPOINTS.USER.PERMISSIONS;

      const response = await api.get(endpoint);

      return {
        success: true,
        data: response.data.permissions || [],
        message: 'Permissions loaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to load permissions'
      };
    }
  }

  /**
   * Check if current user has specific permission
   * @param {String} permission - Permission to check
   * @returns {Promise<Boolean>} Permission status
   */
  async hasPermission(permission) {
    try {
      const result = await this.getUserPermissions();
      if (result.success) {
        return result.data.includes(permission);
      }
      return false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Bulk update user status (Admin only)
   * @param {Array} userIds - Array of user IDs
   * @param {String} status - New status
   * @returns {Promise<Object>} Bulk update result
   */
  async bulkUpdateStatus(userIds, status) {
    try {
      if (!userIds || userIds.length === 0) {
        return {
          success: false,
          message: 'User IDs are required'
        };
      }

      if (!['active', 'inactive', 'suspended'].includes(status)) {
        return {
          success: false,
          message: 'Invalid status. Must be: active, inactive, or suspended'
        };
      }

      const response = await api.patch(API_ENDPOINTS.USER.BULK_UPDATE_STATUS, {
        userIds,
        status
      });

      return {
        success: true,
        data: response.data,
        message: `${userIds.length} users updated successfully`
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update users'
      };
    }
  }

  /**
   * Bulk delete users (Admin only)
   * @param {Array} userIds - Array of user IDs to delete
   * @returns {Promise<Object>} Bulk delete result
   */
  async bulkDeleteUsers(userIds) {
    try {
      if (!userIds || userIds.length === 0) {
        return {
          success: false,
          message: 'User IDs are required'
        };
      }

      const response = await api.delete(API_ENDPOINTS.USER.BULK_DELETE, {
        data: { userIds }
      });

      return {
        success: true,
        data: response.data,
        message: `${userIds.length} users deleted successfully`
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete users'
      };
    }
  }

  /**
   * Get assistant workload data for admin dashboard
   * @returns {Promise<Object>} Assistant workload statistics
   */
  async getAssistantWorkload() {
    try {
      const response = await api.get(API_ENDPOINTS.USER.ASSISTANT_WORKLOAD);

      return {
        success: true,
        data: response.data.workload || [],
        message: 'Assistant workload loaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to load assistant workload'
      };
    }
  }

  /**
   * Get available assistants for customer assignment
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Available assistants
   */
  async getAvailableAssistants(filters = {}) {
    try {
      const params = {
        includeWorkload: filters.includeWorkload || true,
        maxWorkload: filters.maxWorkload,
        sortBy: filters.sortBy || 'workload',
        sortOrder: filters.sortOrder || 'asc'
      };

      const response = await api.get(API_ENDPOINTS.USER.AVAILABLE_ASSISTANTS, {
        params
      });

      return {
        success: true,
        data: response.data.assistants || [],
        message: 'Available assistants loaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to load available assistants'
      };
    }
  }

  /**
   * Get assistant performance metrics
   * @param {String} assistantId - Assistant user ID
   * @param {Object} filters - Filter parameters (dateRange, etc.)
   * @returns {Promise<Object>} Assistant performance data
   */
  async getAssistantPerformance(assistantId, filters = {}) {
    try {
      if (!assistantId) {
        return {
          success: false,
          data: null,
          message: 'Assistant ID is required'
        };
      }

      const params = {
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        includeCustomers: filters.includeCustomers || false,
        includeActivity: filters.includeActivity || false
      };

      const response = await api.get(`${API_ENDPOINTS.USER.ASSISTANT_PERFORMANCE}/${assistantId}`, {
        params
      });

      return {
        success: true,
        data: response.data.performance,
        message: 'Assistant performance loaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to load assistant performance'
      };
    }
  }

  /**
   * Export users data (Admin only)
   * @param {Object} filters - Export filters
   * @returns {Promise<Object>} Export result
   */
  async exportUsers(filters = {}) {
    try {
      const params = {
        format: filters.format || 'csv',
        role: filters.role,
        status: filters.status,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        includeWorkload: filters.includeWorkload || false
      };

      const response = await api.get(API_ENDPOINTS.USER.EXPORT, {
        params,
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.${params.format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        data: response.data,
        message: 'Users exported successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to export users'
      };
    }
  }

  /**
   * Send notification to user (Admin only)
   * @param {String} userId - User ID
   * @param {Object} notification - Notification data
   * @returns {Promise<Object>} Notification result
   */
  async sendNotification(userId, notification) {
    try {
      if (!userId) {
        return {
          success: false,
          message: 'User ID is required'
        };
      }

      if (!notification.title || !notification.message) {
        return {
          success: false,
          message: 'Notification title and message are required'
        };
      }

      const response = await api.post(`${API_ENDPOINTS.USER.SEND_NOTIFICATION}/${userId}`, {
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        priority: notification.priority || 'normal'
      });

      return {
        success: true,
        data: response.data,
        message: 'Notification sent successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send notification'
      };
    }
  }

  /**
   * Get user overview for dashboard
   * @returns {Promise<Object>} User overview data
   */
  async getUserOverview() {
    try {
      const response = await api.get(API_ENDPOINTS.USER.OVERVIEW);

      return {
        success: true,
        data: response.data.overview,
        message: 'User overview loaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to load user overview'
      };
    }
  }
}

// Create and export a singleton instance
const userService = new UserService();
export default userService;