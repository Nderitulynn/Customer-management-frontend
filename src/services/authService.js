import { apiHelpers as apiMethods, API_ENDPOINTS } from './api';

class AuthService {
  constructor() {
    this.tokenKey = 'token';
    this.refreshTokenKey = 'refreshToken';
    this.userKey = 'user';
    this.rememberMeKey = 'rememberMe';
  }

  // Login user
  async login(credentials) {
    try {
      const { email, password, rememberMe = false } = credentials;

      const response = await apiMethods.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: email.toLowerCase().trim(),
        password,
        rememberMe,
      });

      const { user, token, refreshToken, permissions, expiresIn } = response;

      // Store authentication data
      this.setAuthData({
        user,
        token,
        refreshToken,
        permissions,
        expiresIn,
        rememberMe,
      });

      // Track login
      this.trackLogin(user);

      return {
        success: true,
        user,
        token,
        permissions,
        message: 'Login successful',
      };
    } catch (error) {
      console.error('Login failed:', error);
      
      // Clear any existing auth data
      this.clearAuthData();
      
      throw {
        success: false,
        message: error.message || 'Login failed',
        type: error.type || 'AUTH_ERROR',
      };
    }
  }

  // Register new user (admin only)
  async register(userData) {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.AUTH.REGISTER, {
        ...userData,
        email: userData.email.toLowerCase().trim(),
      });

      return {
        success: true,
        user: response.user,
        message: 'User registered successfully',
      };
    } catch (error) {
      console.error('Registration failed:', error);
      
      throw {
        success: false,
        message: error.message || 'Registration failed',
        type: error.type || 'REGISTRATION_ERROR',
      };
    }
  }

  // Logout user
  async logout(force = false) {
    try {
      const token = this.getToken();
      const refreshToken = this.getRefreshToken();

      // Call server logout if tokens exist and not forced
      if (!force && (token || refreshToken)) {
        try {
          await apiMethods.post(API_ENDPOINTS.AUTH.LOGOUT, {
            token,
            refreshToken,
          });
        } catch (error) {
          console.warn('Server logout failed:', error);
        }
      }

      // Clear local authentication data
      this.clearAuthData();

      // Track logout
      this.trackLogout();

      return {
        success: true,
        message: 'Logout successful',
      };
    } catch (error) {
      console.error('Logout error:', error);
      
      // Force clear data even if server call fails
      this.clearAuthData();
      
      return {
        success: true,
        message: 'Logout completed',
      };
    }
  }

  // Refresh authentication token
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiMethods.post(API_ENDPOINTS.AUTH.REFRESH, {
        refreshToken,
      });

      const { token: newToken, refreshToken: newRefreshToken, user, expiresIn } = response;

      // Update stored tokens
      this.setToken(newToken);
      if (newRefreshToken) {
        this.setRefreshToken(newRefreshToken);
      }
      if (user) {
        this.setUser(user);
      }

      // Update expiration
      if (expiresIn) {
        this.setTokenExpiration(expiresIn);
      }

      return {
        success: true,
        token: newToken,
        refreshToken: newRefreshToken,
        user,
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // Clear tokens if refresh fails
      this.clearAuthData();
      
      throw {
        success: false,
        message: error.message || 'Token refresh failed',
        type: 'TOKEN_REFRESH_ERROR',
      };
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email: email.toLowerCase().trim(),
      });

      return {
        success: true,
        message: response.message || 'Password reset email sent',
      };
    } catch (error) {
      console.error('Forgot password failed:', error);
      
      throw {
        success: false,
        message: error.message || 'Failed to send password reset email',
        type: 'FORGOT_PASSWORD_ERROR',
      };
    }
  }

  // Reset password
  async resetPassword(resetData) {
    try {
      const { token, password, confirmPassword } = resetData;

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const response = await apiMethods.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        password,
      });

      return {
        success: true,
        message: response.message || 'Password reset successful',
      };
    } catch (error) {
      console.error('Password reset failed:', error);
      
      throw {
        success: false,
        message: error.message || 'Password reset failed',
        type: 'PASSWORD_RESET_ERROR',
      };
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      const { currentPassword, newPassword, confirmPassword } = passwordData;

      if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match');
      }

      const response = await apiMethods.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
      });

      return {
        success: true,
        message: response.message || 'Password changed successfully',
      };
    } catch (error) {
      console.error('Password change failed:', error);
      
      throw {
        success: false,
        message: error.message || 'Password change failed',
        type: 'PASSWORD_CHANGE_ERROR',
      };
    }
  }

  // Verify email
  async verifyEmail(token) {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
        token,
      });

      return {
        success: true,
        message: response.message || 'Email verified successfully',
      };
    } catch (error) {
      console.error('Email verification failed:', error);
      
      throw {
        success: false,
        message: error.message || 'Email verification failed',
        type: 'EMAIL_VERIFICATION_ERROR',
      };
    }
  }

  // Token management methods
  setAuthData({ user, token, refreshToken, permissions, expiresIn, rememberMe }) {
    try {
      // Store tokens
      if (token) this.setToken(token);
      if (refreshToken) this.setRefreshToken(refreshToken);
      
      // Store user data
      if (user) {
        const userData = {
          ...user,
          permissions: permissions || user.permissions || [],
          loginTime: new Date().toISOString(),
        };
        this.setUser(userData);
      }
      
      // Store expiration
      if (expiresIn) {
        this.setTokenExpiration(expiresIn);
      }
      
      // Store remember me preference
      if (rememberMe !== undefined) {
        localStorage.setItem(this.rememberMeKey, JSON.stringify(rememberMe));
      }
    } catch (error) {
      console.error('Failed to set auth data:', error);
    }
  }

  clearAuthData() {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
      localStorage.removeItem(this.userKey);
      localStorage.removeItem(this.rememberMeKey);
      localStorage.removeItem('tokenExpiration');
      
      // Clear session storage
      sessionStorage.removeItem(this.tokenKey);
      sessionStorage.removeItem(this.userKey);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  setRefreshToken(refreshToken) {
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey);
  }

  setUser(user) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser() {
    try {
      const userData = localStorage.getItem(this.userKey);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return null;
    }
  }

  setTokenExpiration(expiresIn) {
    const expirationTime = new Date().getTime() + (expiresIn * 1000);
    localStorage.setItem('tokenExpiration', expirationTime.toString());
  }

  getTokenExpiration() {
    const expiration = localStorage.getItem('tokenExpiration');
    return expiration ? parseInt(expiration, 10) : null;
  }

  // Authentication state checks
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    
    if (!token || !user) {
      return false;
    }

    // Check token expiration
    if (this.isTokenExpired()) {
      return false;
    }

    return true;
  }

  isTokenExpired() {
    const expiration = this.getTokenExpiration();
    
    if (!expiration) {
      return false; // No expiration set, assume valid
    }

    const currentTime = new Date().getTime();
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
    
    return currentTime >= (expiration - bufferTime);
  }

  isTokenExpiringSoon(minutes = 5) {
    const expiration = this.getTokenExpiration();
    
    if (!expiration) {
      return false;
    }

    const currentTime = new Date().getTime();
    const warningTime = minutes * 60 * 1000;
    
    return currentTime >= (expiration - warningTime);
  }

  shouldRememberUser() {
    try {
      const rememberMe = localStorage.getItem(this.rememberMeKey);
      return rememberMe === 'true';
    } catch (error) {
      return false;
    }
  }

  // Role and permission checks
  hasRole(role) {
    const user = this.getUser();
    return user?.role === role;
  }

  isAdmin() {
    return this.hasRole('admin');
  }

  isAssistant() {
    return this.hasRole('assistant');
  }

  hasPermission(permission) {
    const user = this.getUser();
    const permissions = user?.permissions || [];
    
    if (Array.isArray(permissions)) {
      return permissions.includes(permission);
    }
    
    // Handle object-based permissions
    if (typeof permissions === 'object') {
      const [category, action] = permission.split('.');
      return permissions[category]?.[action] === true;
    }
    
    return false;
  }

  hasAnyPermission(permissionsList) {
    return permissionsList.some(permission => this.hasPermission(permission));
  }

  hasAllPermissions(permissionsList) {
    return permissionsList.every(permission => this.hasPermission(permission));
  }

  // User info utilities
  getCurrentUser() {
    return this.getUser();
  }

  getCurrentUserId() {
    const user = this.getUser();
    return user?.id || user?._id;
  }

  getCurrentUserRole() {
    const user = this.getUser();
    return user?.role;
  }

  getCurrentUserName() {
    const user = this.getUser();
    return user?.name || user?.email || 'User';
  }

  // Session management
  extendSession() {
    const user = this.getUser();
    if (user) {
      // Update last activity
      const updatedUser = {
        ...user,
        lastActivity: new Date().toISOString(),
      };
      this.setUser(updatedUser);
    }
  }

  getSessionDuration() {
    const user = this.getUser();
    if (!user?.loginTime) return 0;
    
    const loginTime = new Date(user.loginTime).getTime();
    const currentTime = new Date().getTime();
    
    return currentTime - loginTime;
  }

  // Activity tracking
  trackLogin(user) {
    try {
      // Track login analytics
      const loginData = {
        userId: user.id,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
      };
      
      // Store in session for analytics
      sessionStorage.setItem('lastLogin', JSON.stringify(loginData));
    } catch (error) {
      console.error('Failed to track login:', error);
    }
  }

  trackLogout() {
    try {
      // Track logout analytics
      const logoutData = {
        timestamp: new Date().toISOString(),
        sessionDuration: this.getSessionDuration(),
      };
      
      // Store briefly for analytics
      sessionStorage.setItem('lastLogout', JSON.stringify(logoutData));
    } catch (error) {
      console.error('Failed to track logout:', error);
    }
  }

  // Token validation
  async validateToken() {
    try {
      const token = this.getToken();
      
      if (!token) {
        throw new Error('No token available');
      }

      // Simple validation - try to decode JWT
      const payload = this.decodeJWT(token);
      
      if (!payload || payload.exp * 1000 < Date.now()) {
        throw new Error('Token expired');
      }

      return {
        valid: true,
        payload,
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  // JWT utilities
  decodeJWT(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
    }
  }
}

// Create and export singleton instance
const authService = new AuthService();
export { authService };
export default authService;