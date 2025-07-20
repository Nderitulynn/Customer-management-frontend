import { apiHelpers, API_ENDPOINTS, handleApiError } from './api';

/**
 * Simplified Authentication Service for School Project
 * Handles user authentication with role-based access (admin/assistant)
 */
class AuthService {
  constructor() {
    this.tokenKey = 'token';
    this.userKey = 'user';
    this.rememberMeKey = 'rememberMe';
  }

  /**
   * Login user with email and password
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @param {boolean} credentials.rememberMe - Remember user preference
   * @returns {Promise<Object>} Login response with user data
   */
  async login(credentials) {
    try {
      const { email, password, rememberMe = false } = credentials;

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const response = await apiHelpers.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: email.toLowerCase().trim(),
        password,
        rememberMe
      });

      const { user, token } = response.data || response;

      if (!token || !user) {
        throw new Error('Invalid credentials');
      }

      // Validate user role
      if (!this.isValidRole(user.role)) {
        throw new Error('Invalid user role');
      }

      // Store authentication data
      this.setToken(token);
      this.setUser(user);

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem(this.rememberMeKey, 'true');
      } else {
        localStorage.removeItem(this.rememberMeKey);
      }

      return {
        success: true,
        data: {
          user,
          token,
          role: user.role
        },
        message: 'Login successful'
      };

    } catch (error) {
      this.clearAuthData();
      return {
        success: false,
        message: handleApiError(error, 'Login failed'),
        data: null
      };
    }
  }

  /**
   * Logout current user
   * @returns {Promise<Object>} Logout response
   */
  async logout() {
    try {
      // Call logout endpoint if available
      if (this.getToken()) {
        await apiHelpers.post(API_ENDPOINTS.AUTH.LOGOUT);
      }

      return {
        success: true,
        message: 'Logout successful'
      };

    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Logout failed')
      };
    } finally {
      // Always clear local auth data
      this.clearAuthData();
    }
  }

  /**
   * Register new admin (one-time setup)
   * @param {Object} adminData - Admin registration data
   * @param {string} adminData.firstName - Admin first name
   * @param {string} adminData.lastName - Admin last name
   * @param {string} adminData.email - Admin email
   * @param {string} adminData.password - Admin password
   * @returns {Promise<Object>} Registration response
   */
  async registerAdmin(adminData) {
    try {
      // Basic validation
      this.validateAdminData(adminData);

      const response = await apiHelpers.post(API_ENDPOINTS.AUTH.REGISTER_ADMIN, {
        ...adminData,
        role: 'admin' // Ensure role is set to admin
      });

      const { user, token } = response.data || response;

      if (token && user) {
        this.setToken(token);
        this.setUser(user);
      }

      return {
        success: true,
        data: {
          user,
          token,
          role: user.role
        },
        message: 'Admin registration successful'
      };

    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Admin registration failed'),
        data: null
      };
    }
  }

  /**
   * Verify current token validity
   * @returns {Promise<Object>} Token verification response
   */
  async verifyToken() {
    try {
      const token = this.getToken();
      
      if (!token) {
        throw new Error('No token found');
      }

      const response = await apiHelpers.get(API_ENDPOINTS.AUTH.VERIFY);

      const { user, valid } = response.data || response;

      if (valid && user) {
        this.setUser(user);
        return {
          success: true,
          data: {
            user,
            valid: true,
            role: user.role
          }
        };
      }

      throw new Error('Invalid token');

    } catch (error) {
      this.clearAuthData();
      return {
        success: false,
        message: handleApiError(error, 'Token verification failed'),
        data: null
      };
    }
  }

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @returns {Promise<Object>} Password change response
   */
  async changePassword(passwordData) {
    try {
      const { currentPassword, newPassword } = passwordData;

      if (!currentPassword || !newPassword) {
        throw new Error('Current password and new password are required');
      }

      if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long');
      }

      const response = await apiHelpers.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
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
        message: handleApiError(error, 'Password change failed')
      };
    }
  }

  /**
   * Get current authentication token
   * @returns {string|null} Current token
   */
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Set authentication token
   * @param {string} token - Token to store
   */
  setToken(token) {
    if (token) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      localStorage.removeItem(this.tokenKey);
    }
  }

  /**
   * Get current user data
   * @returns {Object|null} Current user
   */
  getUser() {
    const userJson = localStorage.getItem(this.userKey);
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Set user data
   * @param {Object} user - User data to store
   */
  setUser(user) {
    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.userKey);
    }
  }

  /**
   * Get remember me preference
   * @returns {boolean} Remember me status
   */
  getRememberMe() {
    return localStorage.getItem(this.rememberMeKey) === 'true';
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  /**
   * Check if user is admin
   * @returns {boolean} Admin status
   */
  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
  }

  /**
   * Check if user is assistant
   * @returns {boolean} Assistant status
   */
  isAssistant() {
    const user = this.getUser();
    return user && user.role === 'assistant';
  }

  /**
   * Check if user has specific role
   * @param {string} role - Role to check (admin/assistant)
   * @returns {boolean} Role check result
   */
  hasRole(role) {
    const user = this.getUser();
    return user && user.role === role;
  }

  /**
   * Get authorization header for API requests
   * @returns {Object} Authorization header object
   */
  getAuthHeader() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Clear all authentication data
   */
  clearAuthData() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.rememberMeKey);
  }

  /**
   * Check if token is expired (for JWT tokens)
   * @returns {boolean} Token expiration status
   */
  isTokenExpired() {
    const token = this.getToken();
    if (!token) return true;

    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      // If token is not JWT or malformed, consider it expired
      return true;
    }
  }

  /**
   * Validate admin data for registration
   * @param {Object} adminData - Admin data to validate
   * @throws {Error} Validation error
   */
  validateAdminData(adminData) {
    const errors = [];

    // Required fields
    if (!adminData.firstName || adminData.firstName.trim() === '') {
      errors.push('First name is required');
    }

    if (!adminData.lastName || adminData.lastName.trim() === '') {
      errors.push('Last name is required');
    }

    if (!adminData.email || adminData.email.trim() === '') {
      errors.push('Email is required');
    }

    if (!adminData.password || adminData.password.trim() === '') {
      errors.push('Password is required');
    }

    // Email validation
    if (adminData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(adminData.email)) {
        errors.push('Invalid email format');
      }
    }

    // Password validation
    if (adminData.password && adminData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    // Name length validation
    if (adminData.firstName && adminData.firstName.length > 50) {
      errors.push('First name must be less than 50 characters');
    }

    if (adminData.lastName && adminData.lastName.length > 50) {
      errors.push('Last name must be less than 50 characters');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  /**
   * Check if role is valid
   * @param {string} role - Role to validate
   * @returns {boolean} Validation result
   */
  isValidRole(role) {
    const validRoles = ['admin', 'assistant'];
    return validRoles.includes(role);
  }

  /**
   * Get user full name
   * @returns {string} User full name
   */
  getUserFullName() {
    const user = this.getUser();
    if (!user) return '';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  }

  /**
   * Get user initials
   * @returns {string} User initials
   */
  getUserInitials() {
    const user = this.getUser();
    if (!user) return '';
    
    const firstInitial = user.firstName ? user.firstName.charAt(0).toUpperCase() : '';
    const lastInitial = user.lastName ? user.lastName.charAt(0).toUpperCase() : '';
    
    return firstInitial + lastInitial;
  }

  /**
   * Get user role display name
   * @returns {string} Role display name
   */
  getRoleDisplayName() {
    const user = this.getUser();
    if (!user) return '';
    
    const roleNames = {
      admin: 'Administrator',
      assistant: 'Assistant'
    };
    
    return roleNames[user.role] || user.role;
  }

  /**
   * Check if current user can manage target user
   * @param {Object} targetUser - Target user object
   * @returns {boolean} Management permission status
   */
  canManageUser(targetUser) {
    if (!this.isAuthenticated() || !targetUser) {
      return false;
    }

    const currentUser = this.getUser();
    
    // Admin can manage assistants but not other admins
    if (currentUser.role === 'admin') {
      return targetUser.role === 'assistant';
    }
    
    // Assistants cannot manage other users
    return false;
  }
}

// Create and export service instance
const authService = new AuthService();
export default authService;