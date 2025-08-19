import { apiHelpers, API_ENDPOINTS, handleApiError, apiUtils } from './api.js';

/**
 * Analytics Service - Handles all analytics and reporting operations
 * Provides data visualization, reports, and business intelligence
 */

export const analyticsService = {
  /**
   * Get revenue analytics data
   * @param {Object} params - Query parameters
   * @param {string} params.period - Time period ('7d', '30d', '90d', '1y')
   * @param {string} params.startDate - Start date (YYYY-MM-DD)
   * @param {string} params.endDate - End date (YYYY-MM-DD)
   * @returns {Promise} Revenue analytics data
   */
  getRevenueAnalytics: async (params = {}) => {
    try {
      const queryString = apiUtils.buildQueryString({
        period: params.period || '30d',
        startDate: params.startDate,
        endDate: params.endDate,
        ...params
      });

      const response = await apiHelpers.get(`/api/analytics/revenue?${queryString}`);
      
      return {
        totalRevenue: response.data?.total || 0,
        previousPeriod: response.data?.previousPeriod || 0,
        growth: response.data?.growth || 0,
        chartData: response.data?.chartData || [],
        breakdown: {
          orders: response.data?.breakdown?.orders || 0,
          services: response.data?.breakdown?.services || 0,
          subscriptions: response.data?.breakdown?.subscriptions || 0
        },
        trends: response.data?.trends || []
      };
    } catch (error) {
      console.error('Failed to fetch revenue analytics:', error);
      throw new Error(handleApiError(error, 'Failed to load revenue analytics'));
    }
  },

  /**
   * Get customer analytics data
   * @param {Object} params - Query parameters
   * @returns {Promise} Customer analytics data
   */
  getCustomerAnalytics: async (params = {}) => {
    try {
      const queryString = apiUtils.buildQueryString({
        period: params.period || '30d',
        ...params
      });

      const response = await apiHelpers.get(`/api/analytics/customers?${queryString}`);
      
      return {
        totalCustomers: response.data?.total || 0,
        newCustomers: response.data?.new || 0,
        activeCustomers: response.data?.active || 0,
        retentionRate: response.data?.retentionRate || 0,
        churnRate: response.data?.churnRate || 0,
        customerLifetimeValue: response.data?.clv || 0,
        acquisitionCost: response.data?.cac || 0,
        chartData: response.data?.chartData || [],
        segmentation: response.data?.segmentation || [],
        topCustomers: response.data?.topCustomers || []
      };
    } catch (error) {
      console.error('Failed to fetch customer analytics:', error);
      throw new Error(handleApiError(error, 'Failed to load customer analytics'));
    }
  },

  /**
   * Get order analytics data
   * @param {Object} params - Query parameters
   * @returns {Promise} Order analytics data
   */
  getOrderAnalytics: async (params = {}) => {
    try {
      const queryString = apiUtils.buildQueryString({
        period: params.period || '30d',
        ...params
      });

      const response = await apiHelpers.get(`/api/analytics/orders?${queryString}`);
      
      return {
        totalOrders: response.data?.total || 0,
        completedOrders: response.data?.completed || 0,
        pendingOrders: response.data?.pending || 0,
        cancelledOrders: response.data?.cancelled || 0,
        averageOrderValue: response.data?.averageValue || 0,
        conversionRate: response.data?.conversionRate || 0,
        fulfillmentTime: response.data?.fulfillmentTime || 0,
        chartData: response.data?.chartData || [],
        statusBreakdown: response.data?.statusBreakdown || [],
        topProducts: response.data?.topProducts || []
      };
    } catch (error) {
      console.error('Failed to fetch order analytics:', error);
      throw new Error(handleApiError(error, 'Failed to load order analytics'));
    }
  },

  /**
   * Get assistant performance analytics
   * @param {Object} params - Query parameters
   * @returns {Promise} Assistant performance data
   */
  getAssistantAnalytics: async (params = {}) => {
    try {
      const queryString = apiUtils.buildQueryString({
        period: params.period || '30d',
        assistantId: params.assistantId,
        ...params
      });

      const response = await apiHelpers.get(`/api/analytics/assistants?${queryString}`);
      
      return {
        totalAssistants: response.data?.total || 0,
        activeAssistants: response.data?.active || 0,
        averageResponseTime: response.data?.averageResponseTime || 0,
        totalMessages: response.data?.totalMessages || 0,
        resolvedTickets: response.data?.resolvedTickets || 0,
        customerSatisfaction: response.data?.satisfaction || 0,
        workload: response.data?.workload || [],
        performance: response.data?.performance || [],
        rankings: response.data?.rankings || []
      };
    } catch (error) {
      console.error('Failed to fetch assistant analytics:', error);
      throw new Error(handleApiError(error, 'Failed to load assistant analytics'));
    }
  },

  /**
   * Get message/communication analytics
   * @param {Object} params - Query parameters
   * @returns {Promise} Message analytics data
   */
  getMessageAnalytics: async (params = {}) => {
    try {
      const queryString = apiUtils.buildQueryString({
        period: params.period || '30d',
        ...params
      });

      const response = await apiHelpers.get(`/api/analytics/messages?${queryString}`);
      
      return {
        totalMessages: response.data?.total || 0,
        responded: response.data?.responded || 0,
        pending: response.data?.pending || 0,
        averageResponseTime: response.data?.averageResponseTime || 0,
        resolutionRate: response.data?.resolutionRate || 0,
        satisfactionScore: response.data?.satisfaction || 0,
        channelBreakdown: response.data?.channels || [],
        priorityDistribution: response.data?.priorities || [],
        responseTimeChart: response.data?.responseTimeChart || []
      };
    } catch (error) {
      console.error('Failed to fetch message analytics:', error);
      throw new Error(handleApiError(error, 'Failed to load message analytics'));
    }
  },

  /**
   * Get comprehensive analytics dashboard data
   * @param {Object} params - Query parameters
   * @returns {Promise} Complete analytics overview
   */
  getAnalyticsOverview: async (params = {}) => {
    try {
      const period = params.period || '30d';
      
      // Make parallel requests for better performance
      const [
        revenueData,
        customerData,
        orderData,
        assistantData,
        messageData
      ] = await Promise.allSettled([
        analyticsService.getRevenueAnalytics({ period }),
        analyticsService.getCustomerAnalytics({ period }),
        analyticsService.getOrderAnalytics({ period }),
        analyticsService.getAssistantAnalytics({ period }),
        analyticsService.getMessageAnalytics({ period })
      ]);

      // Handle results from Promise.allSettled
      const getResult = (promise, fallback = {}) => 
        promise.status === 'fulfilled' ? promise.value : fallback;

      return {
        revenue: getResult(revenueData),
        customers: getResult(customerData),
        orders: getResult(orderData),
        assistants: getResult(assistantData),
        messages: getResult(messageData),
        period: period,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch analytics overview:', error);
      throw new Error(handleApiError(error, 'Failed to load analytics overview'));
    }
  },

  /**
   * Get custom report data
   * @param {Object} reportConfig - Report configuration
   * @param {string} reportConfig.type - Report type
   * @param {Object} reportConfig.filters - Report filters
   * @param {Array} reportConfig.metrics - Metrics to include
   * @returns {Promise} Custom report data
   */
  getCustomReport: async (reportConfig) => {
    try {
      const response = await apiHelpers.post('/api/analytics/custom-report', reportConfig);
      
      return {
        data: response.data || [],
        summary: response.summary || {},
        chartData: response.chartData || [],
        exportUrl: response.exportUrl || null,
        generatedAt: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to generate custom report:', error);
      throw new Error(handleApiError(error, 'Failed to generate custom report'));
    }
  },

  /**
   * Get trending analysis
   * @param {Object} params - Query parameters
   * @returns {Promise} Trending analysis data
   */
  getTrendAnalysis: async (params = {}) => {
    try {
      const queryString = apiUtils.buildQueryString({
        metric: params.metric || 'revenue',
        period: params.period || '30d',
        comparison: params.comparison || 'previous_period',
        ...params
      });

      const response = await apiHelpers.get(`/api/analytics/trends?${queryString}`);
      
      return {
        current: response.data?.current || 0,
        previous: response.data?.previous || 0,
        change: response.data?.change || 0,
        changePercent: response.data?.changePercent || 0,
        trend: response.data?.trend || 'neutral', // 'up', 'down', 'neutral'
        forecast: response.data?.forecast || [],
        confidence: response.data?.confidence || 0
      };
    } catch (error) {
      console.error('Failed to fetch trend analysis:', error);
      throw new Error(handleApiError(error, 'Failed to load trend analysis'));
    }
  },

  /**
   * Export analytics data
   * @param {Object} exportConfig - Export configuration
   * @param {string} exportConfig.type - Export type ('csv', 'xlsx', 'pdf')
   * @param {string} exportConfig.data - Data type to export
   * @param {Object} exportConfig.filters - Filters to apply
   * @returns {Promise} Export download URL or blob
   */
  exportAnalytics: async (exportConfig) => {
    try {
      const response = await apiHelpers.post('/api/analytics/export', exportConfig, {
        responseType: exportConfig.type === 'pdf' ? 'blob' : 'json'
      });
      
      if (exportConfig.type === 'pdf') {
        // Handle blob response for PDF
        return {
          blob: response,
          filename: `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`
        };
      }
      
      return {
        downloadUrl: response.downloadUrl,
        filename: response.filename,
        expiresAt: response.expiresAt
      };
    } catch (error) {
      console.error('Failed to export analytics:', error);
      throw new Error(handleApiError(error, 'Failed to export analytics data'));
    }
  }
};

/**
 * Analytics data transformation utilities
 */
export const analyticsUtils = {
  /**
   * Format analytics data for charts
   * @param {Array} data - Raw data array
   * @param {string} xKey - X-axis key
   * @param {string} yKey - Y-axis key
   * @returns {Array} Formatted chart data
   */
  formatChartData: (data, xKey = 'date', yKey = 'value') => {
    if (!Array.isArray(data)) return [];
    
    return data.map(item => ({
      x: item[xKey],
      y: item[yKey] || 0,
      label: item.label || item[xKey],
      ...item
    }));
  },

  /**
   * Calculate growth percentage
   * @param {number} current - Current value
   * @param {number} previous - Previous value
   * @returns {Object} Growth data with percentage and trend
   */
  calculateGrowth: (current, previous) => {
    if (!previous || previous === 0) {
      return { percentage: current > 0 ? 100 : 0, trend: 'up', isPositive: true };
    }
    
    const percentage = ((current - previous) / previous) * 100;
    const trend = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral';
    const isPositive = percentage >= 0;
    
    return {
      percentage: Math.abs(percentage),
      trend,
      isPositive,
      change: current - previous
    };
  },

  /**
   * Generate color palette for charts
   * @param {number} count - Number of colors needed
   * @returns {Array} Array of color hex codes
   */
  generateChartColors: (count) => {
    const baseColors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
      '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
    ];
    
    if (count <= baseColors.length) {
      return baseColors.slice(0, count);
    }
    
    // Generate additional colors if needed
    const colors = [...baseColors];
    for (let i = baseColors.length; i < count; i++) {
      const hue = (i * 137.5) % 360; // Golden angle approximation
      colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    
    return colors;
  },

  /**
   * Format large numbers for display
   * @param {number} num - Number to format
   * @returns {string} Formatted number string
   */
  formatLargeNumber: (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },

  /**
   * Get period label for display
   * @param {string} period - Period code
   * @returns {string} Human-readable period label
   */
  getPeriodLabel: (period) => {
    const labels = {
      '7d': 'Last 7 days',
      '30d': 'Last 30 days',
      '90d': 'Last 3 months',
      '1y': 'Last year',
      'ytd': 'Year to date',
      'mtd': 'Month to date'
    };
    return labels[period] || period;
  },

  /**
   * Calculate trend indicators
   * @param {Array} data - Time series data
   * @param {string} valueKey - Key for values
   * @returns {Object} Trend analysis
   */
  analyzeTrend: (data, valueKey = 'value') => {
    if (!Array.isArray(data) || data.length < 2) {
      return { direction: 'neutral', strength: 0, confidence: 0 };
    }
    
    const values = data.map(item => item[valueKey] || 0);
    const n = values.length;
    
    // Simple linear regression for trend
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumXX += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const direction = slope > 0 ? 'up' : slope < 0 ? 'down' : 'neutral';
    const strength = Math.abs(slope);
    
    // Calculate R-squared for confidence
    const meanY = sumY / n;
    let ssRes = 0, ssTot = 0;
    
    for (let i = 0; i < n; i++) {
      const predicted = (slope * i) + (sumY - slope * sumX) / n;
      ssRes += Math.pow(values[i] - predicted, 2);
      ssTot += Math.pow(values[i] - meanY, 2);
    }
    
    const confidence = ssTot > 0 ? Math.max(0, 1 - (ssRes / ssTot)) : 0;
    
    return {
      direction,
      strength,
      confidence: confidence * 100,
      slope
    };
  }
};

export default analyticsService;