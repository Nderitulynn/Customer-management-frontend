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
        rememberMe
      });

      // FIX: Handle nested data structure from backend
      // Backend returns: { success: true, data: { user, token } }
      // Frontend needs: { user, token }
      const { user, token, refreshToken, permissions, expiresIn } = response.data || response;

      if (!token || !user) {
        throw new Error('Login failed: Missing token or user data');
      }

      // Store authentication data
      this.setToken(token);
      this.setUser(user);
      
      if (refreshToken) {
        this.setRefreshToken(refreshToken);
      }

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem(this.rememberMeKey, 'true');
      } else {
        localStorage.removeItem(this.rememberMeKey);
      }

      // Store login time for session management
      localStorage.setItem('loginTime', new Date().toISOString());

      return {
        success: true,
        user,
        token,
        refreshToken,
        permissions,
        expiresIn
      };

    } catch (error) {
      console.error('Login error:', error);
      
      // Clear any existing auth data on login failure
      this.clearAuthData();
      
      throw new Error(error.message || 'Login failed');
    }
  }

  // Logout user
  async logout() {
    try {
      // Call logout endpoint if available
      if (this.getToken()) {
        await apiMethods.post(API_ENDPOINTS.AUTH.LOGOUT);
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local auth data
      this.clearAuthData();
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiMethods.post(API_ENDPOINTS.AUTH.REFRESH, {
        refreshToken
      });

      const { token, refreshToken: newRefreshToken } = response.data || response;

      if (token) {
        this.setToken(token);
        if (newRefreshToken) {
          this.setRefreshToken(newRefreshToken);
        }
        return token;
      }

      throw new Error('Token refresh failed');
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearAuthData();
      throw error;
    }
  }

  // Verify token - NEW METHOD ADDED
  async verifyToken(token = null) {
    try {
      // Use provided token or get from storage
      const tokenToVerify = token || this.getToken();
      
      if (!tokenToVerify) {
        return {
          success: false,
          error: 'No token provided'
        };
      }

      // Check if token is expired locally first (for JWT tokens)
      if (this.isTokenExpired()) {
        return {
          success: false,
          error: 'Token expired'
        };
      }

      // Verify token with backend
      const response = await apiMethods.get(API_ENDPOINTS.AUTH.VERIFY, {
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`
        }
      });

      // Handle response data structure
      const { user, valid } = response.data || response;

      if (valid !== false && user) {
        // Update user data if provided
        this.setUser(user);
        
        return {
          success: true,
          user,
          valid: true
        };
      }

      return {
        success: false,
        error: 'Invalid token'
      };

    } catch (error) {
      console.error('Token verification failed:', error);
      return {
        success: false,
        error: error.message || 'Token verification failed'
      };
    }
  }

  // Get current token
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  // Set token
  setToken(token) {
    if (token) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      localStorage.removeItem(this.tokenKey);
    }
  }

  // Get refresh token
  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey);
  }

  // Set refresh token
  setRefreshToken(refreshToken) {
    if (refreshToken) {
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    } else {
      localStorage.removeItem(this.refreshTokenKey);
    }
  }

  // Get current user
  getUser() {
    const userJson = localStorage.getItem(this.userKey);
    return userJson ? JSON.parse(userJson) : null;
  }

  // Set user
  setUser(user) {
    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.userKey);
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Check if user has specific role
  hasRole(role) {
    const user = this.getUser();
    return user && user.roles && user.roles.includes(role);
  }

  // Check if user has specific permission
  hasPermission(permission) {
    const user = this.getUser();
    return user && user.permissions && user.permissions.includes(permission);
  }

  // Check if user is admin
  isAdmin() {
    return this.hasRole('admin') || this.hasRole('administrator');
  }

  // Get remember me preference
  getRememberMe() {
    return localStorage.getItem(this.rememberMeKey) === 'true';
  }

  // Clear all authentication data
  clearAuthData() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.rememberMeKey);
    localStorage.removeItem('loginTime');
  }

  // Check if token is expired (if JWT)
  isTokenExpired() {
    const token = this.getToken();
    if (!token) return true;

    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  // Get authorization header for API requests
  getAuthHeader() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Initialize auth state (call on app startup)
  async initializeAuth() {
    try {
      // Check if we have a token
      if (!this.isAuthenticated()) {
        return { authenticated: false };
      }

      // Verify token with backend
      const verificationResult = await this.verifyToken();
      
      if (verificationResult.success) {
        return { authenticated: true, user: this.getUser() };
      }

      // Token verification failed, try to refresh
      if (this.getRefreshToken()) {
        try {
          await this.refreshToken();
          return { authenticated: true, user: this.getUser() };
        } catch (error) {
          // Refresh failed, clear auth data
          this.clearAuthData();
          return { authenticated: false };
        }
      }

      // No refresh token available, clear auth data
      this.clearAuthData();
      return { authenticated: false };

    } catch (error) {
      console.error('Auth initialization error:', error);
      this.clearAuthData();
      return { authenticated: false };
    }
  }

  // Register new user
  async register(userData) {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      
      // Handle nested data structure similar to login
      const { user, token, refreshToken } = response.data || response;

      if (token && user) {
        this.setToken(token);
        this.setUser(user);
        if (refreshToken) {
          this.setRefreshToken(refreshToken);
        }
        localStorage.setItem('loginTime', new Date().toISOString());
      }

      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email: email.toLowerCase().trim()
      });
      return response;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  // Reset password
  async resetPassword(token, password) {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        password
      });
      return response;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        currentPassword,
        newPassword
      });
      return response;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  // Verify email
  async verifyEmail(token) {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
        token
      });
      return response;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }
}
// Create and export singleton instance
const authService = new AuthService();
export default authService;