import api from './api';

/**
 * Analytics Service
 * Handles business analytics, reporting, and data insights
 * Restricted to Admin users only
 */
class AnalyticsService {
  constructor() {
    this.baseURL = '/api/analytics';
  }

  // ================== Dashboard Analytics ==================

  /**
   * Get comprehensive dashboard analytics
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with dashboard analytics
   */
  async getDashboardAnalytics(params = {}) {
    try {
      const {
        period = 'monthly',
        date_from,
        date_to,
        compare_period = false,
        metrics = ['all']
      } = params;

      const response = await api.get(`${this.baseURL}/dashboard`, {
        params: {
          period,
          compare_period,
          metrics: metrics.join(','),
          ...(date_from && { date_from }),
          ...(date_to && { date_to })
        }
      });

      return {
        success: true,
        data: {
          overview: response.data.overview,
          revenue_analytics: response.data.revenue_analytics,
          customer_analytics: response.data.customer_analytics,
          order_analytics: response.data.order_analytics,
          product_analytics: response.data.product_analytics,
          team_performance: response.data.team_performance,
          trends: response.data.trends,
          comparison: response.data.comparison
        },
        message: 'Dashboard analytics fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch dashboard analytics',
        error: error.response?.data || error.message
      };
    }
  }

  // ================== Customer Analytics ==================

  /**
   * Get detailed customer analytics
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with customer analytics
   */
  async getCustomerAnalytics(params = {}) {
    try {
      const {
        period = 'monthly',
        date_from,
        date_to,
        segment,
        cohort_analysis = false,
        retention_analysis = false
      } = params;

      const response = await api.get(`${this.baseURL}/customers`, {
        params: {
          period,
          ...(date_from && { date_from }),
          ...(date_to && { date_to }),
          ...(segment && { segment }),
          cohort_analysis,
          retention_analysis
        }
      });

      return {
        success: true,
        data: {
          customer_summary: response.data.customer_summary,
          acquisition_metrics: response.data.acquisition_metrics,
          retention_metrics: response.data.retention_metrics,
          lifetime_value: response.data.lifetime_value,
          segmentation: response.data.segmentation,
          cohort_data: response.data.cohort_data,
          churn_analysis: response.data.churn_analysis,
          geographic_distribution: response.data.geographic_distribution
        },
        message: 'Customer analytics fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching customer analytics:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch customer analytics',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get customer behavior analysis
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with behavior analysis
   */
  async getCustomerBehaviorAnalysis(params = {}) {
    try {
      const {
        date_from,
        date_to,
        behavior_type = 'all',
        customer_segment
      } = params;

      const response = await api.get(`${this.baseURL}/customers/behavior`, {
        params: {
          behavior_type,
          ...(date_from && { date_from }),
          ...(date_to && { date_to }),
          ...(customer_segment && { customer_segment })
        }
      });

      return {
        success: true,
        data: {
          purchase_patterns: response.data.purchase_patterns,
          communication_preferences: response.data.communication_preferences,
          order_timing: response.data.order_timing,
          product_preferences: response.data.product_preferences,
          engagement_metrics: response.data.engagement_metrics,
          satisfaction_scores: response.data.satisfaction_scores
        },
        message: 'Customer behavior analysis fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching customer behavior analysis:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch customer behavior analysis',
        error: error.response?.data || error.message
      };
    }
  }

  // ================== Sales & Order Analytics ==================

  /**
   * Get sales performance analytics
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with sales analytics
   */
  async getSalesAnalytics(params = {}) {
    try {
      const {
        period = 'monthly',
        date_from,
        date_to,
        group_by = 'month',
        include_forecasting = false
      } = params;

      const response = await api.get(`${this.baseURL}/sales`, {
        params: {
          period,
          group_by,
          include_forecasting,
          ...(date_from && { date_from }),
          ...(date_to && { date_to })
        }
      });

      return {
        success: true,
        data: {
          sales_summary: response.data.sales_summary,
          sales_trends: response.data.sales_trends,
          conversion_rates: response.data.conversion_rates,
          average_order_value: response.data.average_order_value,
          sales_by_channel: response.data.sales_by_channel,
          seasonal_patterns: response.data.seasonal_patterns,
          forecasting: response.data.forecasting
        },
        message: 'Sales analytics fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching sales analytics:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch sales analytics',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get order analytics and trends
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with order analytics
   */
  async getOrderAnalytics(params = {}) {
    try {
      const {
        period = 'monthly',
        date_from,
        date_to,
        status_analysis = true,
        fulfillment_analysis = true
      } = params;

      const response = await api.get(`${this.baseURL}/orders`, {
        params: {
          period,
          status_analysis,
          fulfillment_analysis,
          ...(date_from && { date_from }),
          ...(date_to && { date_to })
        }
      });

      return {
        success: true,
        data: {
          order_summary: response.data.order_summary,
          order_volume_trends: response.data.order_volume_trends,
          status_distribution: response.data.status_distribution,
          fulfillment_metrics: response.data.fulfillment_metrics,
          delivery_performance: response.data.delivery_performance,
          order_value_analysis: response.data.order_value_analysis,
          peak_hours: response.data.peak_hours
        },
        message: 'Order analytics fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching order analytics:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch order analytics',
        error: error.response?.data || error.message
      };
    }
  }

  // ================== Product Analytics ==================

  /**
   * Get product performance analytics
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with product analytics
   */
  async getProductAnalytics(params = {}) {
    try {
      const {
        date_from,
        date_to,
        category,
        include_inventory = true,
        include_profitability = true
      } = params;

      const response = await api.get(`${this.baseURL}/products`, {
        params: {
          include_inventory,
          include_profitability,
          ...(date_from && { date_from }),
          ...(date_to && { date_to }),
          ...(category && { category })
        }
      });

      return {
        success: true,
        data: {
          product_summary: response.data.product_summary,
          top_selling_products: response.data.top_selling_products,
          product_performance: response.data.product_performance,
          category_analysis: response.data.category_analysis,
          inventory_metrics: response.data.inventory_metrics,
          profitability_analysis: response.data.profitability_analysis,
          demand_forecasting: response.data.demand_forecasting
        },
        message: 'Product analytics fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching product analytics:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch product analytics',
        error: error.response?.data || error.message
      };
    }
  }

  // ================== Communication Analytics ==================

  /**
   * Get WhatsApp and communication analytics
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with communication analytics
   */
  async getCommunicationAnalytics(params = {}) {
    try {
      const {
        date_from,
        date_to,
        channel = 'whatsapp',
        assistant_id,
        include_sentiment = false
      } = params;

      const response = await api.get(`${this.baseURL}/communication`, {
        params: {
          channel,
          include_sentiment,
          ...(date_from && { date_from }),
          ...(date_to && { date_to }),
          ...(assistant_id && { assistant_id })
        }
      });

      return {
        success: true,
        data: {
          message_summary: response.data.message_summary,
          response_times: response.data.response_times,
          conversation_metrics: response.data.conversation_metrics,
          channel_performance: response.data.channel_performance,
          assistant_performance: response.data.assistant_performance,
          customer_satisfaction: response.data.customer_satisfaction,
          sentiment_analysis: response.data.sentiment_analysis
        },
        message: 'Communication analytics fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching communication analytics:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch communication analytics',
        error: error.response?.data || error.message
      };
    }
  }

  // ================== Team Performance Analytics ==================

  /**
   * Get team and assistant performance analytics
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with team analytics
   */
  async getTeamAnalytics(params = {}) {
    try {
      const {
        date_from,
        date_to,
        assistant_id,
        metric_type = 'overview'
      } = params;

      const response = await api.get(`${this.baseURL}/team`, {
        params: {
          metric_type,
          ...(date_from && { date_from }),
          ...(date_to && { date_to }),
          ...(assistant_id && { assistant_id })
        }
      });

      return {
        success: true,
        data: {
          team_summary: response.data.team_summary,
          individual_performance: response.data.individual_performance,
          productivity_metrics: response.data.productivity_metrics,
          workload_distribution: response.data.workload_distribution,
          quality_metrics: response.data.quality_metrics,
          customer_feedback: response.data.customer_feedback,
          training_insights: response.data.training_insights
        },
        message: 'Team analytics fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching team analytics:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch team analytics',
        error: error.response?.data || error.message
      };
    }
  }

  // ================== Financial Analytics ==================

  /**
   * Get financial performance analytics
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with financial analytics
   */
  async getFinancialAnalytics(params = {}) {
    try {
      const {
        period = 'monthly',
        date_from,
        date_to,
        include_projections = true,
        breakdown_by = 'category'
      } = params;

      const response = await api.get(`${this.baseURL}/financial`, {
        params: {
          period,
          include_projections,
          breakdown_by,
          ...(date_from && { date_from }),
          ...(date_to && { date_to })
        }
      });

      return {
        success: true,
        data: {
          revenue_analytics: response.data.revenue_analytics,
          profit_analytics: response.data.profit_analytics,
          cost_analytics: response.data.cost_analytics,
          cash_flow_analytics: response.data.cash_flow_analytics,
          roi_analysis: response.data.roi_analysis,
          financial_ratios: response.data.financial_ratios,
          projections: response.data.projections
        },
        message: 'Financial analytics fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching financial analytics:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch financial analytics',
        error: error.response?.data || error.message
      };
    }
  }

  // ================== Performance Analytics ==================

  /**
   * Get business performance analytics
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with performance analytics
   */
  async getPerformanceAnalytics(params = {}) {
    try {
      const {
        period = 'monthly',
        date_from,
        date_to,
        include_benchmarks = true,
        comparison_type = 'previous_period'
      } = params;

      const response = await api.get(`${this.baseURL}/performance`, {
        params: {
          period,
          include_benchmarks,
          comparison_type,
          ...(date_from && { date_from }),
          ...(date_to && { date_to })
        }
      });

      return {
        success: true,
        data: {
          kpi_summary: response.data.kpi_summary,
          growth_metrics: response.data.growth_metrics,
          efficiency_metrics: response.data.efficiency_metrics,
          quality_metrics: response.data.quality_metrics,
          benchmarks: response.data.benchmarks,
          goals_tracking: response.data.goals_tracking,
          recommendations: response.data.recommendations
        },
        message: 'Performance analytics fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching performance analytics:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch performance analytics',
        error: error.response?.data || error.message
      };
    }
  }

  // ================== Report Generation ==================

  /**
   * Generate custom analytics report
   * @param {Object} params - Report parameters
   * @returns {Promise} API response with report data
   */
  async generateReport(params = {}) {
    try {
      const {
        report_type = 'comprehensive',
        date_from,
        date_to,
        sections = ['all'],
        format = 'json',
        email_report = false,
        scheduled = false
      } = params;

      const response = await api.post(`${this.baseURL}/reports/generate`, {
        report_type,
        sections,
        format,
        email_report,
        scheduled,
        ...(date_from && { date_from }),
        ...(date_to && { date_to })
      });

      return {
        success: true,
        data: {
          report_id: response.data.report_id,
          report_url: response.data.report_url,
          report_data: response.data.report_data,
          generated_at: response.data.generated_at,
          expires_at: response.data.expires_at
        },
        message: 'Report generated successfully'
      };
    } catch (error) {
      console.error('Error generating report:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to generate report',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get list of generated reports
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with reports list
   */
  async getReports(params = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        report_type,
        date_from,
        date_to
      } = params;

      const response = await api.get(`${this.baseURL}/reports`, {
        params: {
          page,
          limit,
          ...(report_type && { report_type }),
          ...(date_from && { date_from }),
          ...(date_to && { date_to })
        }
      });

      return {
        success: true,
        data: {
          reports: response.data.reports,
          pagination: response.data.pagination,
          total_reports: response.data.total_reports
        },
        message: 'Reports fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch reports',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Download specific report
   * @param {string} reportId - Report ID
   * @param {string} format - Download format (pdf, excel, csv)
   * @returns {Promise} API response with file download
   */
  async downloadReport(reportId, format = 'pdf') {
    try {
      const response = await api.get(`${this.baseURL}/reports/${reportId}/download`, {
        params: { format },
        responseType: 'blob'
      });

      return {
        success: true,
        data: response.data,
        filename: response.headers['content-disposition']?.split('filename=')[1] || `report_${reportId}.${format}`,
        message: 'Report downloaded successfully'
      };
    } catch (error) {
      console.error('Error downloading report:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to download report',
        error: error.response?.data || error.message
      };
    }
  }

  // ================== Data Export ==================

  /**
   * Export analytics data in various formats
   * @param {Object} params - Export parameters
   * @returns {Promise} API response with export data
   */
  async exportData(params = {}) {
    try {
      const {
        data_type = 'dashboard',
        format = 'csv',
        date_from,
        date_to,
        filters = {},
        include_raw_data = false
      } = params;

      const response = await api.post(`${this.baseURL}/export`, {
        data_type,
        format,
        filters,
        include_raw_data,
        ...(date_from && { date_from }),
        ...(date_to && { date_to })
      }, {
        responseType: format === 'json' ? 'json' : 'blob'
      });

      return {
        success: true,
        data: response.data,
        filename: response.headers['content-disposition']?.split('filename=')[1] || `analytics_export.${format}`,
        message: 'Data exported successfully'
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to export data',
        error: error.response?.data || error.message
      };
    }
  }

  // ================== Real-time Analytics ==================

  /**
   * Get real-time business metrics
   * @returns {Promise} API response with real-time data
   */
  async getRealTimeMetrics() {
    try {
      const response = await api.get(`${this.baseURL}/realtime`);

      return {
        success: true,
        data: {
          active_customers: response.data.active_customers,
          pending_orders: response.data.pending_orders,
          today_revenue: response.data.today_revenue,
          active_conversations: response.data.active_conversations,
          response_times: response.data.response_times,
          system_status: response.data.system_status,
          alerts: response.data.alerts
        },
        message: 'Real-time metrics fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch real-time metrics',
        error: error.response?.data || error.message
      };
    }
  }

  // ================== Goals & Targets ==================

  /**
   * Get business goals and target tracking
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with goals data
   */
  async getGoalsTracking(params = {}) {
    try {
      const {
        period = 'monthly',
        goal_type = 'all'
      } = params;

      const response = await api.get(`${this.baseURL}/goals`, {
        params: {
          period,
          goal_type
        }
      });

      return {
        success: true,
        data: {
          revenue_goals: response.data.revenue_goals,
          customer_goals: response.data.customer_goals,
          order_goals: response.data.order_goals,
          team_goals: response.data.team_goals,
          progress_summary: response.data.progress_summary,
          achievements: response.data.achievements
        },
        message: 'Goals tracking fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching goals tracking:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch goals tracking',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Update business goals and targets
   * @param {Object} goals - Goals data
   * @returns {Promise} API response with updated goals
   */
  async updateGoals(goals) {
    try {
      const response = await api.put(`${this.baseURL}/goals`, goals);

      return {
        success: true,
        data: response.data.goals,
        message: 'Goals updated successfully'
      };
    } catch (error) {
      console.error('Error updating goals:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to update goals',
        error: error.response?.data || error.message
      };
    }
  }

  // ================== Utility Methods ==================

  /**
   * Get available analytics periods
   * @returns {Array} Available periods
   */
  getAvailablePeriods() {
    return [
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'quarterly', label: 'Quarterly' },
      { value: 'yearly', label: 'Yearly' },
      { value: 'custom', label: 'Custom Range' }
    ];
  }

  /**
   * Get available metric types
   * @returns {Array} Available metrics
   */
  getAvailableMetrics() {
    return [
      'revenue',
      'customers',
      'orders',
      'products',
      'communication',
      'team',
      'financial',
      'performance'
    ];
  }

  /**
   * Get available export formats
   * @returns {Array} Available formats
   */
  getExportFormats() {
    return [
      { value: 'csv', label: 'CSV' },
      { value: 'excel', label: 'Excel' },
      { value: 'pdf', label: 'PDF' },
      { value: 'json', label: 'JSON' }
    ];
  }
}

// Create and export singleton instance
const analyticsService = new AnalyticsService();
export default analyticsService;