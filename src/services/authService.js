import { apiHelpers, API_ENDPOINTS, handleApiError } from './api';

/**
 * Simplified Authentication Service with Enhanced Debug Logging
 * Fixed token storage issues and simplified response handling
 * Updated to support customer role
 */
class AuthService {
  constructor() {
    this.tokenKey = 'token';
    this.userKey = 'user';
    this.rememberMeKey = 'rememberMe';
    
    console.log('🔧 AuthService initialized');
    this.initializeAuth();
  }

  /**
   * Initialize authentication on service creation
   */
  initializeAuth() {
    try {
      const existingToken = this.getToken();
      const existingUser = this.getUser();
      
      console.log('🔍 Initial auth check:', {
        hasToken: !!existingToken,
        hasUser: !!existingUser,
        tokenLength: existingToken?.length || 0
      });

      if (existingToken && this.isTokenExpired()) {
        console.log('🗑️ Found expired token during initialization, cleaning up');
        this.clearAuthData();
      }
    } catch (error) {
      console.error('❌ Token validation failed during initialization:', error.message);
      this.clearAuthData();
    }
  }

  /**
   * Simplified login with detailed debugging
   */
  async login(credentials) {
    console.log('🚀 Starting login process...');
    
    try {
      const { email, password, rememberMe = false } = credentials;

      // Basic validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      console.log('📤 Sending login request for:', email);

      // Make API call
      const response = await apiHelpers.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: email.toLowerCase().trim(),
        password,
        rememberMe
      });

      console.log('📥 Raw login response received:', {
        success: response.success,
        hasUser: !!response.user,
        hasToken: !!response.token,
        tokenLength: response.token?.length || 0,
        userEmail: response.user?.email,
        userRole: response.user?.role
      });

      // Simplified response handling - based on your actual API response structure
      if (!response.success) {
        console.error('❌ Login failed - API returned success: false');
        throw new Error(response.message || 'Login failed');
      }

      if (!response.token) {
        console.error('❌ Login failed - No token in response');
        throw new Error('No authentication token received');
      }

      if (!response.user) {
        console.error('❌ Login failed - No user data in response');
        throw new Error('No user data received');
      }

      const { user, token } = response;

      // Validate user role
      if (!this.isValidRole(user.role)) {
        console.error('❌ Invalid user role:', user.role);
        throw new Error(`Invalid user role: ${user.role}`);
      }

      console.log('✅ Login data validation passed:', {
        userEmail: user.email,
        userRole: user.role,
        tokenValid: typeof token === 'string' && token.length > 0
      });

      // Store authentication data with detailed logging
      console.log('💾 Storing authentication data...');
      
      this.setToken(token);
      console.log('📋 Token storage attempted');
      
      this.setUser(user);
      console.log('👤 User storage attempted');

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem(this.rememberMeKey, 'true');
        console.log('💭 Remember me preference stored');
      } else {
        localStorage.removeItem(this.rememberMeKey);
        console.log('💭 Remember me preference cleared');
      }

      // CRITICAL: Verify storage actually worked
      const storedToken = this.getToken();
      const storedUser = this.getUser();

      console.log('🔍 Storage verification:', {
        tokenStoredSuccessfully: !!storedToken,
        userStoredSuccessfully: !!storedUser,
        storedTokenLength: storedToken?.length || 0,
        storedUserEmail: storedUser?.email,
        storedTokenMatches: storedToken === token,
        storedUserMatches: JSON.stringify(storedUser) === JSON.stringify(user)
      });

      // Check if storage failed
      if (!storedToken || !storedUser) {
        console.error('💥 CRITICAL ERROR: Authentication data failed to store!', {
          tokenStored: !!storedToken,
          userStored: !!storedUser,
          localStorageAvailable: typeof Storage !== 'undefined',
          localStorageQuota: this.checkLocalStorageQuota()
        });
        throw new Error('Failed to store authentication data');
      }

      console.log('🎉 Login completed successfully!');

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
      console.error('💥 Login error occurred:', {
        message: error.message,
        stack: error.stack
      });
      
      this.clearAuthData();
      
      return {
        success: false,
        message: handleApiError(error, 'Login failed'),
        data: null
      };
    }
  }

  /**
   * Customer registration method
   */
  async registerCustomer(registrationData) {
    console.log('🚀 Starting customer registration process...');
    
    try {
      const { firstName, lastName, email, password, phone } = registrationData;

      // Basic validation
      if (!firstName || !lastName || !email || !password) {
        throw new Error('All required fields must be provided');
      }

      console.log('📤 Sending customer registration request for:', email);

      // Make API call to customer registration endpoint
      const response = await apiHelpers.post(API_ENDPOINTS.AUTH.REGISTER_CUSTOMER, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        password,
        phone: phone?.trim() || '',
        fullName: `${firstName.trim()} ${lastName.trim()}`
      });

      console.log('📥 Raw registration response received:', {
        success: response.success,
        hasUser: !!response.user,
        hasToken: !!response.token,
        userEmail: response.user?.email,
        userRole: response.user?.role
      });

      if (!response.success) {
        console.error('❌ Registration failed - API returned success: false');
        throw new Error(response.message || 'Registration failed');
      }

      if (!response.token || !response.user) {
        console.error('❌ Registration failed - Missing token or user data');
        throw new Error('Registration completed but authentication data is missing');
      }

      const { user, token } = response;

      // Validate user role is customer
      if (user.role !== 'customer') {
        console.error('❌ Registration failed - Invalid user role:', user.role);
        throw new Error('Registration failed: Invalid user role');
      }

      console.log('✅ Registration successful, storing auth data...');

      // Store authentication data (auto-login after registration)
      this.setToken(token);
      this.setUser(user);

      console.log('🎉 Customer registration completed successfully!');

      return {
        success: true,
        data: {
          user,
          token,
          role: user.role,
          customer: response.customer
        },
        message: response.message || 'Registration successful'
      };

    } catch (error) {
      console.error('💥 Customer registration error occurred:', {
        message: error.message,
        stack: error.stack
      });
      
      return {
        success: false,
        message: handleApiError(error, 'Registration failed'),
        data: null
      };
    }
  }

  /**
   * Enhanced token storage with error handling
   */
  setToken(token) {
    console.log('🔑 Attempting to store token...');
    
    try {
      if (!token) {
        console.log('🗑️ Removing token from localStorage');
        localStorage.removeItem(this.tokenKey);
        return;
      }

      if (typeof token !== 'string') {
        console.error('❌ Invalid token type:', typeof token);
        throw new Error('Token must be a string');
      }

      console.log('💾 Storing token in localStorage:', {
        tokenLength: token.length,
        tokenStart: token.substring(0, 20) + '...'
      });

      localStorage.setItem(this.tokenKey, token);
      
      // Verify storage immediately
      const stored = localStorage.getItem(this.tokenKey);
      if (stored !== token) {
        console.error('💥 Token storage verification failed!', {
          expectedLength: token.length,
          storedLength: stored?.length || 0,
          matches: stored === token
        });
        throw new Error('Token storage verification failed');
      }

      console.log('✅ Token stored and verified successfully');
      
    } catch (error) {
      console.error('💥 Token storage error:', error);
      throw error;
    }
  }

  /**
   * Enhanced user storage with error handling
   */
  setUser(user) {
    console.log('👤 Attempting to store user data...');
    
    try {
      if (!user) {
        console.log('🗑️ Removing user data from localStorage');
        localStorage.removeItem(this.userKey);
        return;
      }

      if (typeof user !== 'object') {
        console.error('❌ Invalid user data type:', typeof user);
        throw new Error('User data must be an object');
      }

      const userJson = JSON.stringify(user);
      console.log('💾 Storing user data in localStorage:', {
        userEmail: user.email,
        userRole: user.role,
        dataSize: userJson.length
      });

      localStorage.setItem(this.userKey, userJson);
      
      // Verify storage immediately
      const stored = localStorage.getItem(this.userKey);
      if (stored !== userJson) {
        console.error('💥 User data storage verification failed!');
        throw new Error('User data storage verification failed');
      }

      console.log('✅ User data stored and verified successfully');
      
    } catch (error) {
      console.error('💥 User storage error:', error);
      throw error;
    }
  }

  /**
   * Get token with debugging
   */
  getToken() {
    try {
      const token = localStorage.getItem(this.tokenKey);
      console.log('🔍 Retrieved token:', {
        found: !!token,
        length: token?.length || 0
      });
      return token;
    } catch (error) {
      console.error('❌ Error retrieving token:', error);
      return null;
    }
  }

  /**
   * Get user with debugging
   */
  getUser() {
    try {
      const userJson = localStorage.getItem(this.userKey);
      if (!userJson) {
        console.log('🔍 No user data found in localStorage');
        return null;
      }

      const user = JSON.parse(userJson);
      console.log('🔍 Retrieved user data:', {
        email: user.email,
        role: user.role
      });
      return user;
    } catch (error) {
      console.error('❌ Error parsing user data:', error);
      localStorage.removeItem(this.userKey);
      return null;
    }
  }

  /**
   * Check localStorage quota and availability
   */
  checkLocalStorageQuota() {
    try {
      const test = 'localStorage-test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return {
        available: true,
        error: null
      };
    } catch (error) {
      return {
        available: false,
        error: error.message
      };
    }
  }

  /**
   * Enhanced logout with debugging
   */
  async logout() {
    console.log('🚪 Starting logout process...');
    
    try {
      // Call logout endpoint if available and user is authenticated
      if (this.getToken()) {
        try {
          console.log('📤 Calling server logout endpoint...');
          await apiHelpers.post(API_ENDPOINTS.AUTH.LOGOUT);
          console.log('✅ Server logout successful');
        } catch (error) {
          console.warn('⚠️ Server logout failed (continuing with local logout):', error.message);
        }
      }

      return {
        success: true,
        message: 'Logout successful'
      };

    } catch (error) {
      console.error('❌ Logout error:', error);
      return {
        success: false,
        message: handleApiError(error, 'Logout failed')
      };
    } finally {
      // Always clear local auth data
      console.log('🧹 Clearing local authentication data...');
      this.clearAuthData();
      console.log('✅ Logout completed');
    }
  }

  /**
   * Clear all authentication data with debugging
   */
  clearAuthData() {
    console.log('🧹 Clearing all authentication data...');
    
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      localStorage.removeItem(this.rememberMeKey);
      
      // Verify clearing worked
      const tokenRemoved = !localStorage.getItem(this.tokenKey);
      const userRemoved = !localStorage.getItem(this.userKey);
      const rememberMeRemoved = !localStorage.getItem(this.rememberMeKey);
      
      console.log('🔍 Auth data clearing verification:', {
        tokenRemoved,
        userRemoved,
        rememberMeRemoved,
        allCleared: tokenRemoved && userRemoved && rememberMeRemoved
      });
      
    } catch (error) {
      console.error('❌ Error clearing auth data:', error);
    }
  }

  /**
   * Enhanced authentication check
   */
  isAuthenticated() {
    console.log('🔐 Checking authentication status...');
    
    const token = this.getToken();
    const user = this.getUser();
    
    console.log('🔍 Auth check details:', {
      hasToken: !!token,
      hasUser: !!user,
      tokenLength: token?.length || 0,
      userEmail: user?.email
    });
    
    if (!token || !user) {
      console.log('❌ Authentication failed: missing token or user');
      return false;
    }

    // Check if token is expired
    if (this.isTokenExpired()) {
      console.log('❌ Authentication failed: token expired');
      this.clearAuthData();
      return false;
    }

    console.log('✅ Authentication check passed');
    return true;
  }

  /**
   * Get authorization header for API requests
   */
  getAuthHeader() {
    const token = this.getToken();
    if (!token) {
      console.log('⚠️ No token available for auth header');
      return {};
    }

    // Check if token is expired before using it
    if (this.isTokenExpired()) {
      console.log('⚠️ Token expired, clearing auth data');
      this.clearAuthData();
      return {};
    }

    console.log('✅ Providing auth header with token');
    return { Authorization: `Bearer ${token}` };
  }

  /**
   * Simplified token expiration check
   */
  isTokenExpired() {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('⚠️ Invalid token format');
        return true;
      }

      const payload = JSON.parse(atob(parts[1]));
      
      if (!payload.exp) {
        console.log('ℹ️ Token has no expiration - treating as valid');
        return false;
      }

      const currentTime = Date.now() / 1000;
      const isExpired = payload.exp < currentTime;
      
      if (isExpired) {
        console.log('⏰ Token expired:', {
          expires: new Date(payload.exp * 1000),
          now: new Date()
        });
      }
      
      return isExpired;
    } catch (error) {
      console.log('⚠️ Token validation failed:', error.message);
      return true;
    }
  }

  /**
   * Validate user role - UPDATED to include customer
   */
  isValidRole(role) {
    const validRoles = ['admin', 'assistant', 'customer'];
    const isValid = validRoles.includes(role);
    console.log('🔍 Role validation:', { role, isValid });
    return isValid;
  }

  /**
   * Check user roles - UPDATED to include customer methods
   */
  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
  }

  isAssistant() {
    const user = this.getUser();
    return user && user.role === 'assistant';
  }

  isCustomer() {
    const user = this.getUser();
    return user && user.role === 'customer';
  }

  hasRole(role) {
    const user = this.getUser();
    return user && user.role === role;
  }

  /**
   * Get detailed authentication status for debugging
   */
  getAuthStatus() {
    const token = this.getToken();
    const user = this.getUser();
    
    return {
      hasToken: !!token,
      hasUser: !!user,
      isAuthenticated: this.isAuthenticated(),
      isTokenExpired: this.isTokenExpired(),
      userRole: user?.role,
      userEmail: user?.email,
      rememberMe: localStorage.getItem(this.rememberMeKey) === 'true',
      localStorageStatus: this.checkLocalStorageQuota()
    };
  }

  /**
   * Debug method to print current auth state
   */
  debugAuthState() {
    console.log('🐛 Current Auth State:', this.getAuthStatus());
  }
}

// Create and export service instance
const authService = new AuthService();
export default authService;