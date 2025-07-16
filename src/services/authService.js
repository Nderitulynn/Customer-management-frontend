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
   * Register new user
   * @param {Object} userData - User registration data
   * @param {string} userData.firstName - User first name
   * @param {string} userData.lastName - User last name
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.role - User role (admin/assistant)
   * @returns {Promise<Object>} Registration response
   */
  async register(userData) {
    try {
      // Basic validation
      this.validateUserData(userData);

      const response = await apiHelpers.post(API_ENDPOINTS.AUTH.REGISTER, userData);

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
        message: 'Registration successful'
      };

    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Registration failed'),
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
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Password reset response
   */
  async forgotPassword(email) {
    try {
      if (!email) {
        throw new Error('Email is required');
      }

      const response = await apiHelpers.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email: email.toLowerCase().trim()
      });

      return {
        success: true,
        message: 'Password reset instructions sent to your email'
      };

    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Password reset request failed')
      };
    }
  }

  /**
   * Reset password with token
   * @param {Object} resetData - Password reset data
   * @param {string} resetData.token - Reset token
   * @param {string} resetData.password - New password
   * @returns {Promise<Object>} Password reset response
   */
  async resetPassword(resetData) {
    try {
      const { token, password } = resetData;

      if (!token || !password) {
        throw new Error('Reset token and new password are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const response = await apiHelpers.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        password
      });

      return {
        success: true,
        message: 'Password reset successful'
      };

    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Password reset failed')
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
   * Check if user can edit customer
   * @param {Object} customer - Customer object
   * @returns {boolean} Edit permission status
   */
  canEditCustomer(customer) {
    if (!this.isAuthenticated()) {
      return false;
    }

    const user = this.getUser();
    
    // Admin can edit all customers
    if (user.role === 'admin') {
      return true;
    }
    
    // Assistant can only edit assigned customers
    if (user.role === 'assistant') {
      return customer.assignedTo && customer.assignedTo._id === user._id;
    }
    
    return false;
  }

  /**
   * Check if user can delete customer
   * @returns {boolean} Delete permission status
   */
  canDeleteCustomer() {
    return this.isAdmin();
  }

  /**
   * Check if user can assign customers
   * @returns {boolean} Assignment permission status
   */
  canAssignCustomer() {
    return this.isAdmin();
  }

  /**
   * Check if user can create customers
   * @returns {boolean} Creation permission status
   */
  canCreateCustomer() {
    return this.isAuthenticated();
  }

  /**
   * Check if user can view all customers
   * @returns {boolean} View all permission status
   */
  canViewAllCustomers() {
    return this.isAdmin();
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
   * Initialize authentication state
   * @returns {Promise<Object>} Initialization result
   */
  async initializeAuth() {
    try {
      // Check if we have a token
      if (!this.isAuthenticated()) {
        return {
          success: false,
          message: 'No authentication data found'
        };
      }

      // Check if token is expired
      if (this.isTokenExpired()) {
        this.clearAuthData();
        return {
          success: false,
          message: 'Token expired'
        };
      }

      // Verify token with backend
      const verificationResult = await this.verifyToken();
      
      if (verificationResult.success) {
        return {
          success: true,
          data: {
            user: this.getUser(),
            role: this.getUser().role
          },
          message: 'Authentication initialized successfully'
        };
      }

      return verificationResult;

    } catch (error) {
      this.clearAuthData();
      return {
        success: false,
        message: handleApiError(error, 'Authentication initialization failed')
      };
    }
  }

  /**
   * Validate user data for registration
   * @param {Object} userData - User data to validate
   * @throws {Error} Validation error
   */
  validateUserData(userData) {
    const errors = [];

    // Required fields
    if (!userData.firstName || userData.firstName.trim() === '') {
      errors.push('First name is required');
    }

    if (!userData.lastName || userData.lastName.trim() === '') {
      errors.push('Last name is required');
    }

    if (!userData.email || userData.email.trim() === '') {
      errors.push('Email is required');
    }

    if (!userData.password || userData.password.trim() === '') {
      errors.push('Password is required');
    }

    if (!userData.role || userData.role.trim() === '') {
      errors.push('Role is required');
    }

    // Email validation
    if (userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        errors.push('Invalid email format');
      }
    }

    // Password validation
    if (userData.password && userData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    // Role validation
    if (userData.role && !this.isValidRole(userData.role)) {
      errors.push('Role must be either admin or assistant');
    }

    // Name length validation
    if (userData.firstName && userData.firstName.length > 50) {
      errors.push('First name must be less than 50 characters');
    }

    if (userData.lastName && userData.lastName.length > 50) {
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

  /**
   * Get user capabilities for UI
   * @returns {Object} User capabilities object
   */
  getUserCapabilities() {
    const user = this.getUser();
    
    if (!user) {
      return {
        canEditCustomers: false,
        canDeleteCustomers: false,
        canAssignCustomers: false,
        canCreateCustomers: false,
        canViewAllCustomers: false,
        canManageUsers: false,
        isAdmin: false,
        isAssistant: false
      };
    }

    const isAdmin = user.role === 'admin';
    const isAssistant = user.role === 'assistant';

    return {
      canEditCustomers: isAdmin || isAssistant,
      canDeleteCustomers: isAdmin,
      canAssignCustomers: isAdmin,
      canCreateCustomers: true,
      canViewAllCustomers: isAdmin,
      canManageUsers: isAdmin,
      isAdmin,
      isAssistant,
      role: user.role,
      fullName: this.getUserFullName(),
      initials: this.getUserInitials(),
      roleDisplayName: this.getRoleDisplayName()
    };
  }
}

// Create and export service instance
const authService = new AuthService();
export default authService;