import { apiHelpers } from './api';

class DashboardService {
  constructor() {
    this.baseURL = '/api/admin-dashboard';
  }

  /**
   * Classify errors and determine handling strategy
   * @param {Error} error - The error object from API call
   * @returns {object} Error classification with handling instructions
   */
  _classifyError(error) {
    const status = error.response?.status;
    const isNetworkError = !error.response && error.code === 'NETWORK_ERROR';
    const isTimeoutError = error.code === 'ECONNABORTED' || error.message?.includes('timeout');

    // Authentication/Authorization errors - let them bubble up
    if (status === 401 || status === 403) {
      return {
        shouldThrow: true,
        type: 'auth',
        message: status === 401 ? 'Authentication required' : 'Access denied'
      };
    }

    // Network/connectivity errors
    if (isNetworkError || isTimeoutError) {
      return {
        shouldThrow: false,
        type: 'network',
        message: 'Network connection failed. Please check your internet connection.',
        retryable: true
      };
    }

    // Server errors
    if (status >= 500) {
      return {
        shouldThrow: false,
        type: 'server',
        message: 'Server is temporarily unavailable. Please try again later.',
        retryable: true
      };
    }

    // Not found errors
    if (status === 404) {
      return {
        shouldThrow: false,
        type: 'not_found',
        message: 'Dashboard endpoint not found. Please contact support.',
        retryable: false
      };
    }

    // Client errors (400-499, except 401/403/404)
    if (status >= 400 && status < 500) {
      return {
        shouldThrow: false,
        type: 'client',
        message: 'Invalid request format. Please refresh and try again.',
        retryable: false
      };
    }

    // Unknown errors
    return {
      shouldThrow: false,
      type: 'unknown',
      message: 'An unexpected error occurred. Please try again.',
      retryable: true
    };
  }

  /**
   * Create structured error response for recoverable errors
   * @param {object} errorInfo - Error classification info
   * @param {string} operation - The operation that failed
   * @returns {object} Structured error response with flattened structure
   */
  _createErrorResponse(errorInfo, operation = 'dashboard operation') {
    console.error(`❌ DashboardService ${operation} failed:`, {
      type: errorInfo.type,
      message: errorInfo.message,
      retryable: errorInfo.retryable
    });

    const defaultData = this._getDefaultDashboardData();

    return {
      // Flatten the structure for the hook
      stats: defaultData.stats,
      recentOrders: defaultData.recentOrders,
      assistantStats: defaultData.assistantStats,
      customerStats: defaultData.customerStats,
      recentMessages: defaultData.recentMessages,
      lastUpdated: new Date().toISOString(),
      error: {
        type: errorInfo.type,
        message: errorInfo.message,
        retryable: errorInfo.retryable,
        timestamp: new Date().toISOString(),
        operation
      }
    };
  }

  /**
   * Get default dashboard data structure
   * @returns {object} Default dashboard data
   */
  _getDefaultDashboardData() {
    return {
      stats: {
        totalCustomers: 0,
        totalOrders: 0,
        totalAssistants: 0,
        activeChats: 0,
        monthlyRevenue: 0,
        todayOrders: 0,
        responseRate: 0,
        activeCustomers: 0,
        newCustomers: 0
      },
      recentOrders: [],
      assistantStats: {
        total: 0,
        active: 0,
        inactive: 0,
        online: 0,
        responseTime: 0
      },
      customerStats: {
        total: 0,
        active: 0,
        new: 0,
        growth: 0,
        retention: 0
      },
      recentMessages: []
    };
  }

  /**
   * Get complete dashboard data
   * Calls multiple endpoints and transforms data to match hook expectations
   */
  async getDashboardData() {
    try {
      console.log('📊 DashboardService: Fetching dashboard data...');
      
      // Call the main stats endpoint
      const response = await apiHelpers.get(`${this.baseURL}/stats`);
      
      console.log('📊 Raw API response:', response);
      
      // Extract nested stats data from backend response
      const backendStats = response.stats || {};
      const backendOrders = response.orders || [];
      const backendAssistants = response.assistants || {};
      const backendCustomers = response.customers || {};
      const backendMessages = response.messages || [];
      
      // Transform and flatten the API response structure for the hook
      const flattenedData = {
        stats: {
          totalCustomers: backendStats.totalCustomers || 0,
          totalOrders: backendStats.totalOrders || 0,
          totalAssistants: backendStats.totalAssistants || 0,
          activeChats: backendStats.activeChats || 0,
          monthlyRevenue: backendStats.monthlyRevenue || 0,
          todayOrders: backendStats.todayOrders || backendStats.totalOrders || 0,
          responseRate: backendStats.responseRate || 0,
          activeCustomers: backendStats.activeCustomers || 0,
          newCustomers: backendStats.newCustomers || 0
        },
        recentOrders: backendOrders,
        assistantStats: {
          total: backendAssistants.total || backendStats.totalAssistants || 0,
          active: backendAssistants.active || 0,
          inactive: backendAssistants.inactive || 0,
          online: backendAssistants.online || 0,
          responseTime: backendAssistants.responseTime || 0
        },
        customerStats: {
          total: backendCustomers.total || backendStats.totalCustomers || 0,
          active: backendCustomers.active || backendStats.activeCustomers || 0,
          new: backendCustomers.new || backendStats.newCustomers || 0,
          growth: backendCustomers.growth || 0,
          retention: backendCustomers.retention || 0
        },
        recentMessages: backendMessages,
        lastUpdated: response.timestamp || new Date().toISOString()
      };
      
      console.log('✅ Transformed dashboard data:', flattenedData);
      
      return flattenedData;
      
    } catch (error) {
      console.error('❌ DashboardService error:', error);
      
      const errorInfo = this._classifyError(error);
      
      // For auth errors, let them bubble up to be handled by interceptors
      if (errorInfo.shouldThrow) {
        console.log('🔄 Letting auth error bubble up for proper handling');
        throw error;
      }
      
      // For other errors, return structured error response
      return this._createErrorResponse(errorInfo, 'dashboard data fetch');
    }
  }

  /**
   * Refresh specific metric
   * For now, just calls the main endpoint and returns relevant data
   */
  async refreshMetric(metric) {
    try {
      console.log(`🔄 DashboardService: Refreshing ${metric} metric...`);
      
      // Call the main stats endpoint - you can add specific endpoints later
      const response = await apiHelpers.get(`${this.baseURL}/stats`);
      const backendStats = response.stats || {};
      const backendOrders = response.orders || [];
      const backendAssistants = response.assistants || {};
      const backendCustomers = response.customers || {};
      const backendMessages = response.messages || [];
      
      switch (metric) {
        case 'stats':
          return {
            stats: {
              totalCustomers: backendStats.totalCustomers || 0,
              totalOrders: backendStats.totalOrders || 0,
              totalAssistants: backendStats.totalAssistants || 0,
              activeChats: backendStats.activeChats || 0,
              monthlyRevenue: backendStats.monthlyRevenue || 0,
              todayOrders: backendStats.todayOrders || backendStats.totalOrders || 0,
              responseRate: backendStats.responseRate || 0,
              activeCustomers: backendStats.activeCustomers || 0,
              newCustomers: backendStats.newCustomers || 0
            },
            lastUpdated: response.timestamp || new Date().toISOString()
          };
          
        case 'customers':
          return {
            customerStats: {
              total: backendCustomers.total || backendStats.totalCustomers || 0,
              active: backendCustomers.active || backendStats.activeCustomers || 0,
              new: backendCustomers.new || backendStats.newCustomers || 0,
              growth: backendCustomers.growth || 0,
              retention: backendCustomers.retention || 0
            },
            lastUpdated: response.timestamp || new Date().toISOString()
          };
          
        case 'assistants':
          return {
            assistantStats: {
              total: backendAssistants.total || backendStats.totalAssistants || 0,
              active: backendAssistants.active || 0,
              inactive: backendAssistants.inactive || 0,
              online: backendAssistants.online || 0,
              responseTime: backendAssistants.responseTime || 0
            },
            lastUpdated: response.timestamp || new Date().toISOString()
          };
          
        case 'orders':
          return {
            recentOrders: backendOrders,
            lastUpdated: response.timestamp || new Date().toISOString()
          };
          
        case 'messages':
          return {
            recentMessages: backendMessages,
            lastUpdated: response.timestamp || new Date().toISOString()
          };
          
        default:
          throw new Error(`Unknown metric: ${metric}`);
      }
      
    } catch (error) {
      console.error(`❌ Error refreshing ${metric} metric:`, error);
      
      const errorInfo = this._classifyError(error);
      
      // For auth errors, let them bubble up
      if (errorInfo.shouldThrow) {
        console.log(`🔄 Letting auth error bubble up for ${metric} refresh`);
        throw error;
      }
      
      // For other errors, return structured error response with appropriate default data
      const defaultData = this._getDefaultDashboardData();
      let responseData = { lastUpdated: new Date().toISOString() };
      
      switch (metric) {
        case 'stats':
          responseData.stats = defaultData.stats;
          break;
        case 'customers':
          responseData.customerStats = defaultData.customerStats;
          break;
        case 'assistants':
          responseData.assistantStats = defaultData.assistantStats;
          break;
        case 'orders':
          responseData.recentOrders = defaultData.recentOrders;
          break;
        case 'messages':
          responseData.recentMessages = defaultData.recentMessages;
          break;
        default:
          responseData = { lastUpdated: new Date().toISOString() };
      }
      
      // Add error info to response
      responseData.error = {
        type: errorInfo.type,
        message: errorInfo.message,
        retryable: errorInfo.retryable,
        timestamp: new Date().toISOString(),
        operation: `${metric} metric refresh`
      };
      
      return responseData;
    }
  }

  /**
   * Get system health
   * Calls the health endpoint if available
   */
  async getSystemHealth() {
    try {
      console.log('🏥 DashboardService: Checking system health...');
      
      // Try to call a health endpoint - adjust path as needed  
      // Note: Comment out until health endpoint is implemented
      // const healthData = await apiHelpers.get(`${this.baseURL}/health`);
      
      // For now, return a mock healthy status with flattened structure
      return {
        status: 'healthy',
        database: { status: 'healthy' },
        server: { 
          uptime: Date.now() - 1000000, 
          memory: { used: 0, total: 0 } 
        },
        timestamp: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ System health check failed:', error);
      
      const errorInfo = this._classifyError(error);
      
      // For auth errors, let them bubble up
      if (errorInfo.shouldThrow) {
        console.log('🔄 Letting auth error bubble up for health check');
        throw error;
      }
      
      // For other errors, return basic health info with error context
      return {
        status: 'unknown',
        database: { status: 'unknown' },
        server: { uptime: 0, memory: { used: 0, total: 0 } },
        timestamp: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        error: {
          type: errorInfo.type,
          message: errorInfo.message,
          retryable: errorInfo.retryable,
          timestamp: new Date().toISOString(),
          operation: 'system health check'
        }
      };
    }
  }

  /**
   * Retry a failed operation with exponential backoff
   * @param {Function} operation - The operation to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} baseDelay - Base delay in milliseconds
   */
  async retryOperation(operation, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const errorInfo = this._classifyError(error);
        
        // Don't retry auth errors
        if (errorInfo.shouldThrow) {
          throw error;
        }
        
        // Don't retry non-retryable errors
        if (!errorInfo.retryable) {
          throw error;
        }
        
        // If this was the last attempt, throw the error
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retrying with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`⏳ Retrying operation in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

// Dashboard utilities for formatting and calculations
export const dashboardUtils = {
  /**
   * Format currency values
   */
  formatCurrency: (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount || 0);
  },

  /**
   * Format dates
   */
  formatDate: (date, options = {}) => {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    };
    
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(new Date(date));
  },

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  formatRelativeTime: (date) => {
    const now = new Date();
    const targetDate = new Date(date);
    const diffMs = now - targetDate;
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return dashboardUtils.formatDate(date);
  },

  /**
   * Get status color for UI components
   */
  getStatusColor: (status) => {
    const statusColors = {
      active: 'green',
      inactive: 'gray',
      pending: 'yellow',
      completed: 'green',
      cancelled: 'red',
      processing: 'blue',
      online: 'green',
      offline: 'gray',
      healthy: 'green',
      unhealthy: 'red',
      warning: 'yellow',
      unknown: 'gray'
    };
    
    return statusColors[status?.toLowerCase()] || 'gray';
  },

  /**
   * Calculate percentage change
   */
  calculatePercentageChange: (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    
    return ((current - previous) / previous) * 100;
  },

  /**
   * Check if an error is retryable based on error info
   */
  isRetryableError: (error) => {
    return error?.retryable === true;
  },

  /**
   * Get user-friendly error message
   */
  getErrorMessage: (error) => {
    if (!error) return null;
    
    const defaultMessages = {
      network: 'Connection failed. Please check your internet and try again.',
      server: 'Server is temporarily unavailable. Please try again later.',
      not_found: 'Service not found. Please contact support if this continues.',
      client: 'Invalid request. Please refresh the page and try again.',
      unknown: 'Something went wrong. Please try again.'
    };
    
    return error.message || defaultMessages[error.type] || defaultMessages.unknown;
  }
};

// Create and export singleton instance
export const dashboardService = new DashboardService();

export default dashboardService;