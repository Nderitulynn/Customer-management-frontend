import { apiHelpers as apiMethods, API_ENDPOINTS } from './api';

// Permission constants for new workflow
export const PERMISSIONS = {
  // Customer claiming permissions
  CUSTOMER_CLAIM: 'customer:claim',
  CUSTOMER_CLAIM_ASSIGN: 'customer:claim:assign',
  CUSTOMER_CLAIM_RELEASE: 'customer:claim:release',
  CUSTOMER_CLAIM_TRANSFER: 'customer:claim:transfer',
  CUSTOMER_CLAIM_VIEW_ALL: 'customer:claim:view_all',
  CUSTOMER_CLAIM_MANAGE: 'customer:claim:manage',
  
  // Customer management permissions
  CUSTOMER_VIEW: 'customer:view',
  CUSTOMER_EDIT: 'customer:edit',
  CUSTOMER_CREATE: 'customer:create',
  CUSTOMER_DELETE: 'customer:delete',
  CUSTOMER_BULK_ACTIONS: 'customer:bulk_actions',
  
  // Workflow permissions
  WORKFLOW_MANAGE: 'workflow:manage',
  WORKFLOW_ASSIGN: 'workflow:assign',
  WORKFLOW_ESCALATE: 'workflow:escalate',
  
  // Admin permissions
  ADMIN_PANEL: 'admin:panel',
  USER_MANAGEMENT: 'user:management',
  ROLE_MANAGEMENT: 'role:management',
  PERMISSION_MANAGEMENT: 'permission:management',
  
  // Reporting permissions
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
  ANALYTICS_VIEW: 'analytics:view'
};

// Role constants
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  SUPERVISOR: 'supervisor',
  AGENT: 'agent',
  READONLY: 'readonly'
};

// Feature flags based on roles
export const FEATURE_FLAGS = {
  CUSTOMER_CLAIMING: {
    enabled: true,
    requiredPermissions: [PERMISSIONS.CUSTOMER_CLAIM],
    requiredRoles: [ROLES.AGENT, ROLES.SUPERVISOR, ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]
  },
  BULK_CUSTOMER_ACTIONS: {
    enabled: true,
    requiredPermissions: [PERMISSIONS.CUSTOMER_BULK_ACTIONS],
    requiredRoles: [ROLES.SUPERVISOR, ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]
  },
  CUSTOMER_TRANSFER: {
    enabled: true,
    requiredPermissions: [PERMISSIONS.CUSTOMER_CLAIM_TRANSFER],
    requiredRoles: [ROLES.SUPERVISOR, ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]
  },
  WORKFLOW_ESCALATION: {
    enabled: true,
    requiredPermissions: [PERMISSIONS.WORKFLOW_ESCALATE],
    requiredRoles: [ROLES.AGENT, ROLES.SUPERVISOR, ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]
  },
  ADVANCED_ANALYTICS: {
    enabled: true,
    requiredPermissions: [PERMISSIONS.ANALYTICS_VIEW],
    requiredRoles: [ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]
  }
};

class AuthService {
  constructor() {
    this.tokenKey = 'token';
    this.refreshTokenKey = 'refreshToken';
    this.userKey = 'user';
    this.rememberMeKey = 'rememberMe';
    this.sessionStateKey = 'sessionState';
    this.lastActivityKey = 'lastActivity';
    this.refreshAttemptKey = 'refreshAttempt';
    this.userPermissionsKey = 'userPermissions';
    this.claimedCustomersKey = 'claimedCustomers';
    
    // Session configuration
    this.sessionConfig = {
      maxInactiveTime: 30 * 60 * 1000, // 30 minutes
      maxRefreshAttempts: 3,
      refreshBuffer: 5 * 60 * 1000, // 5 minutes before expiry
    };
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

      // Store user permissions
      if (permissions) {
        this.setUserPermissions(permissions);
      }

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem(this.rememberMeKey, 'true');
      } else {
        localStorage.removeItem(this.rememberMeKey);
      }

      // Initialize session state
      this.initializeSessionState();

      // Initialize claimed customers for agents
      if (this.hasPermission(PERMISSIONS.CUSTOMER_CLAIM)) {
        this.initializeClaimedCustomers();
      }

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
      // Release all claimed customers before logout
      if (this.hasPermission(PERMISSIONS.CUSTOMER_CLAIM)) {
        await this.releaseAllClaimedCustomers();
      }

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

  // Enhanced refresh token with improved error handling and validation
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Check refresh attempt count to prevent infinite loops
      const attemptCount = this.getRefreshAttemptCount();
      if (attemptCount >= this.sessionConfig.maxRefreshAttempts) {
        throw new Error('Maximum refresh attempts exceeded');
      }

      // Validate refresh token format and expiration
      if (!this.isValidRefreshToken(refreshToken)) {
        throw new Error('Invalid refresh token format or expired');
      }

      // Increment attempt count
      this.incrementRefreshAttempt();

      const response = await apiMethods.post(API_ENDPOINTS.AUTH.REFRESH, {
        refreshToken
      });

      const { token, refreshToken: newRefreshToken, expiresIn, permissions } = response.data || response;

      if (!token) {
        throw new Error('Token refresh failed: No token received');
      }

      // Update tokens
      this.setToken(token);
      if (newRefreshToken) {
        this.setRefreshToken(newRefreshToken);
      }

      // Update permissions if provided
      if (permissions) {
        this.setUserPermissions(permissions);
      }

      // Reset refresh attempt count on success
      this.resetRefreshAttempt();

      // Update session state
      this.updateSessionState({
        lastRefresh: new Date().toISOString(),
        tokenExpiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null
      });

      return {
        success: true,
        token,
        refreshToken: newRefreshToken,
        expiresIn,
        permissions
      };

    } catch (error) {
      console.error('Token refresh error:', error);
      
      // Handle specific error cases
      if (error.message.includes('refresh token') || error.message.includes('expired')) {
        this.clearAuthData();
        throw new Error('Session expired. Please log in again.');
      }

      if (error.message.includes('Maximum refresh attempts')) {
        this.clearAuthData();
        throw new Error('Too many refresh attempts. Please log in again.');
      }

      // For network errors, don't clear auth data immediately
      if (error.name === 'NetworkError' || error.message.includes('network')) {
        throw new Error('Network error during token refresh. Please try again.');
      }

      // For other errors, clear auth data
      this.clearAuthData();
      throw error;
    }
  }

  // Enhanced token refresh validation
  isValidRefreshToken(refreshToken = null) {
    const token = refreshToken || this.getRefreshToken();
    
    if (!token) return false;

    try {
      // For JWT refresh tokens, check structure and expiration
      if (token.includes('.')) {
        const parts = token.split('.');
        if (parts.length !== 3) return false;

        const payload = JSON.parse(atob(parts[1]));
        const currentTime = Date.now() / 1000;
        
        // Check if refresh token is expired
        if (payload.exp && payload.exp < currentTime) {
          return false;
        }

        // Check if it's actually a refresh token
        if (payload.type && payload.type !== 'refresh') {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error validating refresh token:', error);
      return false;
    }
  }

  // Session state tracking methods
  initializeSessionState() {
    const sessionState = {
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      refreshAttempts: 0,
      isActive: true,
      deviceInfo: this.getDeviceInfo(),
      claimedCustomersCount: 0,
      lastClaimActivity: null
    };

    localStorage.setItem(this.sessionStateKey, JSON.stringify(sessionState));
    localStorage.setItem(this.lastActivityKey, new Date().toISOString());
  }

  updateSessionState(updates) {
    const currentState = this.getSessionState();
    const newState = {
      ...currentState,
      ...updates,
      lastActivity: new Date().toISOString()
    };

    localStorage.setItem(this.sessionStateKey, JSON.stringify(newState));
    localStorage.setItem(this.lastActivityKey, new Date().toISOString());
  }

  getSessionState() {
    const stateJson = localStorage.getItem(this.sessionStateKey);
    return stateJson ? JSON.parse(stateJson) : null;
  }

  isSessionActive() {
    const sessionState = this.getSessionState();
    if (!sessionState) return false;

    const lastActivity = new Date(sessionState.lastActivity);
    const now = new Date();
    const timeSinceLastActivity = now - lastActivity;

    return timeSinceLastActivity < this.sessionConfig.maxInactiveTime;
  }

  getSessionDuration() {
    const sessionState = this.getSessionState();
    if (!sessionState) return 0;

    const loginTime = new Date(sessionState.loginTime);
    const now = new Date();
    return now - loginTime;
  }

  getTimeSinceLastActivity() {
    const lastActivity = localStorage.getItem(this.lastActivityKey);
    if (!lastActivity) return 0;

    const lastActivityTime = new Date(lastActivity);
    const now = new Date();
    return now - lastActivityTime;
  }

  recordActivity() {
    this.updateSessionState({
      lastActivity: new Date().toISOString()
    });
  }

  // Refresh attempt tracking
  getRefreshAttemptCount() {
    const attempts = localStorage.getItem(this.refreshAttemptKey);
    return attempts ? parseInt(attempts, 10) : 0;
  }

  incrementRefreshAttempt() {
    const currentCount = this.getRefreshAttemptCount();
    localStorage.setItem(this.refreshAttemptKey, (currentCount + 1).toString());
  }

  resetRefreshAttempt() {
    localStorage.removeItem(this.refreshAttemptKey);
  }

  // Device info for session tracking
  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timestamp: new Date().toISOString()
    };
  }

  // Enhanced initialization method
  async initializeAuth() {
    try {
      // Check if we have a token
      if (!this.isAuthenticated()) {
        return { authenticated: false, reason: 'No token found' };
      }

      // Check session activity
      if (!this.isSessionActive()) {
        this.clearAuthData();
        return { authenticated: false, reason: 'Session expired due to inactivity' };
      }

      // Check if token needs refresh soon
      if (this.shouldRefreshToken()) {
        try {
          await this.refreshToken();
        } catch (error) {
          return { authenticated: false, reason: 'Token refresh failed', error: error.message };
        }
      }

      // Verify token with backend
      const verificationResult = await this.verifyToken();
      
      if (verificationResult.success) {
        this.recordActivity();
        
        // Initialize claimed customers for agents
        if (this.hasPermission(PERMISSIONS.CUSTOMER_CLAIM)) {
          this.initializeClaimedCustomers();
        }
        
        return { 
          authenticated: true, 
          user: this.getUser(),
          sessionState: this.getSessionState(),
          permissions: this.getUserPermissions(),
          claimedCustomers: this.getClaimedCustomers()
        };
      }

      // Token verification failed, try to refresh
      if (this.getRefreshToken()) {
        try {
          await this.refreshToken();
          this.recordActivity();
          return { 
            authenticated: true, 
            user: this.getUser(),
            sessionState: this.getSessionState(),
            permissions: this.getUserPermissions(),
            claimedCustomers: this.getClaimedCustomers()
          };
        } catch (error) {
          // Refresh failed, clear auth data
          this.clearAuthData();
          return { authenticated: false, reason: 'Token refresh failed', error: error.message };
        }
      }

      // No refresh token available, clear auth data
      this.clearAuthData();
      return { authenticated: false, reason: 'No refresh token available' };

    } catch (error) {
      console.error('Auth initialization error:', error);
      this.clearAuthData();
      return { authenticated: false, reason: 'Initialization error', error: error.message };
    }
  }

  // Check if token should be refreshed proactively
  shouldRefreshToken() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;
      const bufferTime = this.sessionConfig.refreshBuffer / 1000;

      return timeUntilExpiry < bufferTime;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return false;
    }
  }

  // Verify token - existing method with minor enhancements
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
      const { user, valid, permissions } = response.data || response;

      if (valid !== false && user) {
        // Update user data and permissions if provided
        this.setUser(user);
        if (permissions) {
          this.setUserPermissions(permissions);
        }
        this.recordActivity();
        
        return {
          success: true,
          user,
          valid: true,
          permissions
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

  // User permissions management
  getUserPermissions() {
    const permissionsJson = localStorage.getItem(this.userPermissionsKey);
    return permissionsJson ? JSON.parse(permissionsJson) : [];
  }

  setUserPermissions(permissions) {
    if (permissions && Array.isArray(permissions)) {
      localStorage.setItem(this.userPermissionsKey, JSON.stringify(permissions));
    } else {
      localStorage.removeItem(this.userPermissionsKey);
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

  // Check if user has any of the specified roles
  hasAnyRole(roles) {
    const user = this.getUser();
    if (!user || !user.roles) return false;
    return roles.some(role => user.roles.includes(role));
  }

  // Check if user has all of the specified roles
  hasAllRoles(roles) {
    const user = this.getUser();
    if (!user || !user.roles) return false;
    return roles.every(role => user.roles.includes(role));
  }

  // Enhanced permission checking
  hasPermission(permission) {
    const user = this.getUser();
    const permissions = this.getUserPermissions();
    
    // Check user permissions from both user object and stored permissions
    const userPermissions = user?.permissions || [];
    const allPermissions = [...userPermissions, ...permissions];
    
    return allPermissions.includes(permission);
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(permissions) {
    return permissions.some(permission => this.hasPermission(permission));
  }

  // Check if user has all of the specified permissions
  hasAllPermissions(permissions) {
    return permissions.every(permission => this.hasPermission(permission));
  }

  // Check if user is admin
  isAdmin() {
    return this.hasRole(ROLES.ADMIN) || this.hasRole(ROLES.SUPER_ADMIN);
  }

  // Check if user is supervisor or higher
  isSupervisorOrHigher() {
    return this.hasAnyRole([ROLES.SUPERVISOR, ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]);
  }

  // Check if user is manager or higher
  isManagerOrHigher() {
    return this.hasAnyRole([ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]);
  }

  // Feature flag checking
  isFeatureEnabled(featureName) {
    const feature = FEATURE_FLAGS[featureName];
    if (!feature || !feature.enabled) return false;

    // Check if user has required permissions
    if (feature.requiredPermissions && !this.hasAllPermissions(feature.requiredPermissions)) {
      return false;
    }

    // Check if user has required roles
    if (feature.requiredRoles && !this.hasAnyRole(feature.requiredRoles)) {
      return false;
    }

    return true;
  }

  // Customer claiming functionality
  initializeClaimedCustomers() {
    const existing = localStorage.getItem(this.claimedCustomersKey);
    if (!existing) {
      localStorage.setItem(this.claimedCustomersKey, JSON.stringify([]));
    }
  }

  getClaimedCustomers() {
    const claimedJson = localStorage.getItem(this.claimedCustomersKey);
    return claimedJson ? JSON.parse(claimedJson) : [];
  }

  setClaimedCustomers(customers) {
    localStorage.setItem(this.claimedCustomersKey, JSON.stringify(customers));
    this.updateSessionState({
      claimedCustomersCount: customers.length,
      lastClaimActivity: new Date().toISOString()
    });
  }

  addClaimedCustomer(customerId) {
    if (!this.hasPermission(PERMISSIONS.CUSTOMER_CLAIM)) {
      throw new Error('Insufficient permissions to claim customers');
    }

    const claimed = this.getClaimedCustomers();
    if (!claimed.includes(customerId)) {
      claimed.push(customerId);
      this.setClaimedCustomers(claimed);
    }
  }

  removeClaimedCustomer(customerId) {
    if (!this.hasPermission(PERMISSIONS.CUSTOMER_CLAIM_RELEASE)) {
      throw new Error('Insufficient permissions to release customers');
    }

    const claimed = this.getClaimedCustomers();
    const updated = claimed.filter(id => id !== customerId);
    this.setClaimedCustomers(updated);
  }

  isCustomerClaimed(customerId) {
    const claimed = this.getClaimedCustomers();
    return claimed.includes(customerId);
  }

  canClaimCustomer() {
    return this.hasPermission(PERMISSIONS.CUSTOMER_CLAIM);
  }

  canReleaseCustomer() {
    return this.hasPermission(PERMISSIONS.CUSTOMER_CLAIM_RELEASE);
  }

  canTransferCustomer() {
    return this.hasPermission(PERMISSIONS.CUSTOMER_CLAIM_TRANSFER);
  }

  canManageCustomerClaims() {
    return this.hasPermission(PERMISSIONS.CUSTOMER_CLAIM_MANAGE);
  }

  canViewAllCustomerClaims() {
    return this.hasPermission(PERMISSIONS.CUSTOMER_CLAIM_VIEW_ALL);
  }

  async releaseAllClaimedCustomers() {
    if (!this.hasPermission(PERMISSIONS.CUSTOMER_CLAIM_RELEASE)) {
      return;
    }

    try {
      const claimed = this.getClaimedCustomers();
      if (claimed.length > 0) {
        // Call API to release all claimed customers
        await apiMethods.post(API_ENDPOINTS.CUSTOMERS.RELEASE_ALL, {
          customerIds: claimed
        });
      }
      
      // Clear local claimed customers
      this.setClaimedCustomers([]);
    } catch (error) {
      console.error('Error releasing claimed customers:', error);
    }
  }

  // Get remember me preference
  getRememberMe() {
    return localStorage.getItem(this.rememberMeKey) === 'true';
  }

  // Enhanced clear auth data method
  clearAuthData() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.userPermissionsKey);
    localStorage.removeItem(this.claimedCustomersKey);
    localStorage.removeItem(this.rememberMeKey);
    localStorage.removeItem('loginTime');
    localStorage.removeItem(this.sessionStateKey);
    localStorage.removeItem(this.lastActivityKey);
    localStorage.removeItem(this.refreshAttemptKey);
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

  // Register new user
  async register(userData) {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      
      // Handle nested data structure similar to login
      const { user, token, refreshToken, permissions } = response.data || response;

      if (token && user) {
        this.setToken(token);
        this.setUser(user);
        if (refreshToken) {
          this.setRefreshToken(refreshToken);
        }
        if (permissions) {
          this.setUserPermissions(permissions);
        }
        this.initializeSessionState();
        
        // Initialize claimed customers for agents
        if (this.hasPermission(PERMISSIONS.CUSTOMER_CLAIM)) {
          this.initializeClaimedCustomers();
        }
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

  // Get user role hierarchy level (for comparison)
  getUserRoleLevel() {
    const user = this.getUser();
    if (!user || !user.roles) return 0;

    const roleLevels = {
      [ROLES.READONLY]: 1,
      [ROLES.AGENT]: 2,
      [ROLES.SUPERVISOR]: 3,
      [ROLES.MANAGER]: 4,
      [ROLES.ADMIN]: 5,
      [ROLES.SUPER_ADMIN]: 6
    };

    return Math.max(...user.roles.map(role => roleLevels[role] || 0));
  }

  // Check if user can perform action on target user
  canManageUser(targetUser) {
    if (!targetUser) return false;
    
    const currentUserLevel = this.getUserRoleLevel();
    const targetUserLevel = Math.max(...(targetUser.roles || []).map(role => {
      const roleLevels = {
        [ROLES.READONLY]: 1,
        [ROLES.AGENT]: 2,
        [ROLES.SUPERVISOR]: 3,
        [ROLES.MANAGER]: 4,
        [ROLES.ADMIN]: 5,
        [ROLES.SUPER_ADMIN]: 6
      };
      return roleLevels[role] || 0;
    }));

    return currentUserLevel > targetUserLevel;
  }

  // Get current user's capabilities
  getUserCapabilities() {
    const user = this.getUser();
    const permissions = this.getUserPermissions();
    const roles = user?.roles || [];

    return {
      canClaimCustomers: this.canClaimCustomer(),
      canReleaseCustomers: this.canReleaseCustomer(),
      canTransferCustomers: this.canTransferCustomer(),
      canManageCustomerClaims: this.canManageCustomerClaims(),
      canViewAllCustomerClaims: this.canViewAllCustomerClaims(),
      canBulkActions: this.hasPermission(PERMISSIONS.CUSTOMER_BULK_ACTIONS),
      canEscalateWorkflow: this.hasPermission(PERMISSIONS.WORKFLOW_ESCALATE),
      canManageWorkflow: this.hasPermission(PERMISSIONS.WORKFLOW_MANAGE),
      canViewReports: this.hasPermission(PERMISSIONS.REPORTS_VIEW),
      canExportReports: this.hasPermission(PERMISSIONS.REPORTS_EXPORT),
      canViewAnalytics: this.hasPermission(PERMISSIONS.ANALYTICS_VIEW),
      canAccessAdminPanel: this.hasPermission(PERMISSIONS.ADMIN_PANEL),
      canManageUsers: this.hasPermission(PERMISSIONS.USER_MANAGEMENT),
      canManageRoles: this.hasPermission(PERMISSIONS.ROLE_MANAGEMENT),
      canManagePermissions: this.hasPermission(PERMISSIONS.PERMISSION_MANAGEMENT),
      isAdmin: this.isAdmin(),
      isSupervisorOrHigher: this.isSupervisorOrHigher(),
      isManagerOrHigher: this.isManagerOrHigher(),
      userRoleLevel: this.getUserRoleLevel(),
      roles,
      permissions,
      claimedCustomersCount: this.getClaimedCustomers().length,
      enabledFeatures: this.getEnabledFeatures()
    };
  }

  // Get all enabled features for current user
  getEnabledFeatures() {
    const enabledFeatures = {};
    
    Object.keys(FEATURE_FLAGS).forEach(featureName => {
      enabledFeatures[featureName] = this.isFeatureEnabled(featureName);
    });

    return enabledFeatures;
  }

  // Workflow permission helpers
  canAssignWorkflow() {
    return this.hasPermission(PERMISSIONS.WORKFLOW_ASSIGN);
  }

  canEscalateWorkflow() {
    return this.hasPermission(PERMISSIONS.WORKFLOW_ESCALATE);
  }

  canManageWorkflow() {
    return this.hasPermission(PERMISSIONS.WORKFLOW_MANAGE);
  }

  // Customer management permission helpers
  canViewCustomer() {
    return this.hasPermission(PERMISSIONS.CUSTOMER_VIEW);
  }

  canEditCustomer() {
    return this.hasPermission(PERMISSIONS.CUSTOMER_EDIT);
  }

  canCreateCustomer() {
    return this.hasPermission(PERMISSIONS.CUSTOMER_CREATE);
  }

  canDeleteCustomer() {
    return this.hasPermission(PERMISSIONS.CUSTOMER_DELETE);
  }

  canBulkActionsCustomer() {
    return this.hasPermission(PERMISSIONS.CUSTOMER_BULK_ACTIONS);
  }

  // Advanced permission checking with context
  hasContextualPermission(permission, context = {}) {
    // Base permission check
    if (!this.hasPermission(permission)) {
      return false;
    }

    // Context-specific checks
    switch (permission) {
      case PERMISSIONS.CUSTOMER_CLAIM:
        // Check if user has reached claim limit
        if (context.maxClaims && this.getClaimedCustomers().length >= context.maxClaims) {
          return false;
        }
        break;

      case PERMISSIONS.CUSTOMER_CLAIM_TRANSFER:
        // Check if user can transfer to target user
        if (context.targetUser && !this.canManageUser(context.targetUser)) {
          return false;
        }
        break;

      case PERMISSIONS.WORKFLOW_ESCALATE:
        // Check if user can escalate to target level
        if (context.targetLevel && this.getUserRoleLevel() <= context.targetLevel) {
          return false;
        }
        break;

      default:
        break;
    }

    return true;
  }

  // Get permission context for UI
  getPermissionContext() {
    const user = this.getUser();
    const sessionState = this.getSessionState();
    
    return {
      userId: user?.id,
      userRoles: user?.roles || [],
      userPermissions: this.getUserPermissions(),
      claimedCustomers: this.getClaimedCustomers(),
      sessionActive: this.isSessionActive(),
      sessionDuration: this.getSessionDuration(),
      lastActivity: sessionState?.lastActivity,
      roleLevel: this.getUserRoleLevel(),
      capabilities: this.getUserCapabilities(),
      featureFlags: this.getEnabledFeatures()
    };
  }

  // Check if user should see beta features
  shouldShowBetaFeatures() {
    return this.isManagerOrHigher() || this.hasPermission('beta:access');
  }

  // Check if user is in specific department/team
  isInDepartment(department) {
    const user = this.getUser();
    return user?.department === department;
  }

  isInTeam(team) {
    const user = this.getUser();
    return user?.team === team;
  }

  // Enhanced permission validation for customer claiming workflow
  validateCustomerClaimPermission(action, context = {}) {
    const validations = {
      claim: () => {
        if (!this.canClaimCustomer()) {
          return { valid: false, message: 'You do not have permission to claim customers' };
        }
        
        if (context.maxClaims && this.getClaimedCustomers().length >= context.maxClaims) {
          return { valid: false, message: `You have reached the maximum number of claimed customers (${context.maxClaims})` };
        }
        
        if (context.customerId && this.isCustomerClaimed(context.customerId)) {
          return { valid: false, message: 'This customer is already claimed by you' };
        }
        
        return { valid: true };
      },

      release: () => {
        if (!this.canReleaseCustomer()) {
          return { valid: false, message: 'You do not have permission to release customers' };
        }
        
        if (context.customerId && !this.isCustomerClaimed(context.customerId)) {
          return { valid: false, message: 'This customer is not claimed by you' };
        }
        
        return { valid: true };
      },

      transfer: () => {
        if (!this.canTransferCustomer()) {
          return { valid: false, message: 'You do not have permission to transfer customers' };
        }
        
        if (context.targetUser && !this.canManageUser(context.targetUser)) {
          return { valid: false, message: 'You cannot transfer customers to this user' };
        }
        
        if (context.customerId && !this.isCustomerClaimed(context.customerId)) {
          return { valid: false, message: 'This customer is not claimed by you' };
        }
        
        return { valid: true };
      },

      manage: () => {
        if (!this.canManageCustomerClaims()) {
          return { valid: false, message: 'You do not have permission to manage customer claims' };
        }
        
        return { valid: true };
      },

      viewAll: () => {
        if (!this.canViewAllCustomerClaims()) {
          return { valid: false, message: 'You do not have permission to view all customer claims' };
        }
        
        return { valid: true };
      }
    };

    const validator = validations[action];
    if (!validator) {
      return { valid: false, message: 'Invalid action specified' };
    }

    return validator();
  }

  // Activity tracking for customer claims
  trackClaimActivity(action, customerId, metadata = {}) {
    const activity = {
      action,
      customerId,
      timestamp: new Date().toISOString(),
      userId: this.getUser()?.id,
      metadata
    };

    // Store in session for potential API sync
    const sessionState = this.getSessionState();
    const activities = sessionState?.claimActivities || [];
    activities.push(activity);

    this.updateSessionState({
      claimActivities: activities.slice(-50), // Keep last 50 activities
      lastClaimActivity: activity.timestamp
    });

    return activity;
  }

  // Get recent claim activities
  getRecentClaimActivities(limit = 10) {
    const sessionState = this.getSessionState();
    const activities = sessionState?.claimActivities || [];
    return activities.slice(-limit);
  }

  // Clear claim activities
  clearClaimActivities() {
    this.updateSessionState({
      claimActivities: [],
      lastClaimActivity: null
    });
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;