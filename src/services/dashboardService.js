import { apiHelpers, API_ENDPOINTS, handleApiError } from './api.js';

/**
 * Dashboard Service - Handles all dashboard-related API operations
 * Provides overview stats, metrics, and dashboard-specific data
 */

export const dashboardService = {
  /**
   * Get comprehensive dashboard statistics
   * @returns {Promise} Dashboard stats including all key metrics
   */
  getDashboardStats: async () => {
    try {
     const response = await apiHelpers.get('/api/customers/stats');

      // Transform API response to match dashboard component expectations
      return {
        stats: {
          totalCustomers: response.data?.totalCustomers || 0,
          todayOrders: response.data?.orderCount || 0,
          totalAssistants: response.data?.assistantCount || 0,
          // Set default values for metrics not provided by backend
          activeChats: 0,
          monthlyRevenue: 0,
          responseRate: 0,
          activeCustomers: 0,
          newCustomers: 0,
        },
        timestamp: response.data?.timestamp || new Date().toISOString(),
        success: true
      };
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw new Error(handleApiError(error, 'Failed to load dashboard statistics'));
    }
  },

  /**
   * Get recent orders for dashboard overview
   * @param {number} limit - Number of orders to fetch (default: 5)
   * @returns {Promise} Array of recent orders
   */
  getRecentOrders: async (limit = 5) => {
    try {
      const response = await apiHelpers.get('/api/admin-dashboard/stats/orders');
      
      // Transform orders data for dashboard display
      const recentOrders = response.data?.recentOrders || [];
      return recentOrders.slice(0, limit).map(order => ({
        id: order._id || order.id,
        customer: order.customerId?.fullName || 'Unknown Customer',
        item: order.orderNumber || 'Order Items',
        amount: order.orderTotal || 0,
        status: order.status || 'pending',
        date: new Date(order.createdAt).toLocaleDateString() || 'N/A'
      }));
    } catch (error) {
      console.error('Failed to fetch recent orders:', error);
      // Return empty array on error to prevent UI breaks
      return [];
    }
  },

  /**
   * Get assistant statistics for dashboard
   * @returns {Promise} Assistant stats object
   */
  getAssistantStats: async () => {
    try {
      const response = await apiHelpers.get('/api/admin-dashboard/stats/users');
      
      const userDistribution = response.data?.userDistribution || {};
      const assistantStats = response.data?.assistantStats || [];
      
      return {
        total: userDistribution.assistant || 0,
        active: assistantStats.filter(a => a.isActive).length || 0,
        inactive: assistantStats.filter(a => !a.isActive).length || 0,
        online: 0, // Backend doesn't provide online status
        responseTime: 0 // Backend doesn't provide response time
      };
    } catch (error) {
      console.error('Failed to fetch assistant stats:', error);
      // Return default stats structure
      return {
        total: 0,
        active: 0,
        inactive: 0,
        online: 0,
        responseTime: 0
      };
    }
  },

  /**
   * Get customer overview statistics
   * @returns {Promise} Customer stats object
   */
  getCustomerStats: async () => {
    try {
      console.log('🔍 DEBUG: Calling customer stats API...');
      const response = await apiHelpers.get('/api/admin-dashboard/stats/customers');
      
      console.log('🔍 DEBUG: Full API response:', response);
      console.log('🔍 DEBUG: response.data:', response.data);
      console.log('🔍 DEBUG: response.data?.data:', response.data?.data);
      console.log('🔍 DEBUG: response.data?.data?.total:', response.data?.data?.total);
      
      const statusDistribution = response.data?.statusDistribution || {};
      const monthlyGrowth = response.data?.monthlyGrowth || [];
      
      // Calculate growth percentage from monthly data
      const growth = monthlyGrowth.length >= 2 
        ? ((monthlyGrowth[monthlyGrowth.length - 1]?.count || 0) - (monthlyGrowth[monthlyGrowth.length - 2]?.count || 0)) 
        : 0;
      
      const result = {
        total: response.data?.total || 0,
        active: statusDistribution.active || 0,
        new: monthlyGrowth[monthlyGrowth.length - 1]?.count || 0,
        growth: growth,
        retention: 0 // Backend doesn't provide retention data
      };
      
      console.log('🔍 DEBUG: Final customer stats result:', result);
      return result;
    } catch (error) {
      console.error('❌ ERROR: Failed to fetch customer stats:', error);
      return {
        total: 0,
        active: 0,
        new: 0,
        growth: 0,
        retention: 0
      };
    }
  },

  /**
   * Get recent messages for dashboard
   * @param {number} limit - Number of messages to fetch
   * @returns {Promise} Array of recent messages
   */
  getRecentMessages: async (limit = 10) => {
    try {
      const response = await apiHelpers.get(`/api/admin-dashboard/recent?limit=${limit}`);
      
      const messages = response.data?.messages || [];
      return messages.map(message => ({
        id: message._id || message.id,
        customer: message.customer?.fullName || 'Unknown',
        subject: 'Message', // Backend doesn't provide subject
        snippet: message.content?.substring(0, 100) + '...' || '',
        timestamp: new Date(message.createdAt).toLocaleString(),
        status: message.status || 'unread',
        priority: 'normal' // Backend doesn't provide priority
      }));
    } catch (error) {
      console.error('Failed to fetch recent messages:', error);
      return [];
    }
  },

  /**
   * Get system health metrics
   * @returns {Promise} System health data
   */
  getSystemHealth: async () => {
    try {
      const response = await apiHelpers.get('/api/admin-dashboard/');
      
      return {
        status: response.data?.status || 'unknown',
        uptime: response.data?.server?.uptime || 0,
        memoryUsage: response.data?.server?.memory?.used || 0,
        activeConnections: 0, // Backend doesn't provide connection count
        lastUpdate: response.data?.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch system health:', error);
      return {
        status: 'error',
        uptime: 0,
        memoryUsage: 0,
        activeConnections: 0,
        lastUpdate: new Date().toISOString()
      };
    }
  },

  /**
   * Get comprehensive dashboard data in one call
   * This combines multiple endpoints for efficiency
   * @returns {Promise} Complete dashboard data object
   */
  getDashboardData: async () => {
    try {
      // Make parallel requests for better performance
      const [
        dashboardStats,
        recentOrders,
        assistantStats,
        customerStats,
        recentMessages
      ] = await Promise.allSettled([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentOrders(5),
        dashboardService.getAssistantStats(),
        dashboardService.getCustomerStats(),
        dashboardService.getRecentMessages(5)
      ]);

      // Handle results from Promise.allSettled
      const getResult = (promise, fallback) => 
        promise.status === 'fulfilled' ? promise.value : fallback;

      return {
        stats: getResult(dashboardStats, { stats: {} }).stats,
        recentOrders: getResult(recentOrders, []),
        assistantStats: getResult(assistantStats, { total: 0, active: 0, inactive: 0 }),
        customerStats: getResult(customerStats, { total: 0, active: 0, new: 0 }),
        recentMessages: getResult(recentMessages, []),
        lastUpdated: new Date().toISOString(),
        loading: false
      };
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      throw new Error(handleApiError(error, 'Failed to load dashboard data'));
    }
  },

  /**
   * Refresh specific dashboard metrics
   * @param {string} metric - Specific metric to refresh ('stats', 'orders', 'assistants', etc.)
   * @returns {Promise} Updated metric data
   */
  refreshMetric: async (metric) => {
    try {
      switch (metric) {
        case 'stats':
          return await dashboardService.getDashboardStats();
        case 'orders':
          return await dashboardService.getRecentOrders();
        case 'assistants':
          return await dashboardService.getAssistantStats();
        case 'customers':
          return await dashboardService.getCustomerStats();
        case 'messages':
          return await dashboardService.getRecentMessages();
        case 'health':
          return await dashboardService.getSystemHealth();
        default:
          throw new Error(`Unknown metric: ${metric}`);
      }
    } catch (error) {
      console.error(`Failed to refresh ${metric} metric:`, error);
      throw new Error(handleApiError(error, `Failed to refresh ${metric} data`));
    }
  }
};

/**
 * Dashboard data transformation utilities
 */
export const dashboardUtils = {
  /**
   * Format currency values for display
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code (default: KSh)
   * @returns {string} Formatted currency string
   */
  formatCurrency: (amount, currency = 'KSh') => {
    if (typeof amount !== 'number' || isNaN(amount)) return `${currency} 0`;
    return `${currency} ${amount.toLocaleString()}`;
  },

  /**
   * Calculate percentage change
   * @param {number} current - Current value
   * @param {number} previous - Previous value
   * @returns {number} Percentage change
   */
  calculatePercentageChange: (current, previous) => {
    if (!previous || previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  },

  /**
   * Get status color class for UI elements
   * @param {string} status - Status value
   * @returns {string} Tailwind CSS class string
   */
  getStatusColor: (status) => {
    const statusColors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'delivered': 'bg-green-100 text-green-800',
      'shipped': 'bg-blue-100 text-blue-800'
    };
    return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  },

  /**
   * Format date for dashboard display
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDate: (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  },

  /**
   * Format relative time (e.g., "2 hours ago")
   * @param {string|Date} date - Date to format
   * @returns {string} Relative time string
   */
  formatRelativeTime: (date) => {
    if (!date) return 'N/A';
    try {
      const now = new Date();
      const past = new Date(date);
      const diffMs = now - past;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      return past.toLocaleDateString();
    } catch (error) {
      return 'N/A';
    }
  }
};

export default dashboardService;