import api from './api';

/**
 * Financial Service
 * Handles financial operations, revenue tracking, and cost management
 * Restricted to Admin users only
 */
class FinancialService {
  constructor() {
    this.baseURL = '/api/financial';
  }

  // ================== Dashboard Overview ==================

  /**
   * Get financial dashboard overview
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with financial overview
   */
  async getDashboardOverview(params = {}) {
    try {
      const {
        period = 'monthly',
        date_from,
        date_to,
        compare_period = false
      } = params;

      const response = await api.get(`${this.baseURL}/dashboard`, {
        params: {
          period,
          ...(date_from && { date_from }),
          ...(date_to && { date_to }),
          compare_period
        }
      });

      return {
        success: true,
        data: {
          summary: response.data.summary,
          revenue: response.data.revenue,
          expenses: response.data.expenses,
          profit: response.data.profit,
          trends: response.data.trends,
          comparison: response.data.comparison
        },
        message: 'Financial dashboard data fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching financial dashboard:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch financial dashboard',
        error: error.response?.data || error.message
      };
    }
  }

  // ================== Revenue Management ==================

  /**
   * Get revenue data with filtering and grouping
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with revenue data
   */
  async getRevenueData(params = {}) {
    try {
      const {
        period = 'monthly',
        date_from,
        date_to,
        group_by = 'month',
        category,
        product_type,
        customer_segment
      } = params;

      const response = await api.get(`${this.baseURL}/revenue`, {
        params: {
          period,
          group_by,
          ...(date_from && { date_from }),
          ...(date_to && { date_to }),
          ...(category && { category }),
          ...(product_type && { product_type }),
          ...(customer_segment && { customer_segment })
        }
      });

      return {
        success: true,
        data: {
          total_revenue: response.data.total_revenue,
          revenue_by_period: response.data.revenue_by_period,
          revenue_by_category: response.data.revenue_by_category,
          revenue_by_product: response.data.revenue_by_product,
          growth_rate: response.data.growth_rate,
          trends: response.data.trends
        },
        message: 'Revenue data fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch revenue data',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Record new revenue entry
   * @param {Object} revenueData - Revenue information
   * @returns {Promise} API response
   */
  async recordRevenue(revenueData) {
    try {
      const {
        amount,
        source,
        category,
        order_id,
        customer_id,
        payment_method,
        transaction_date,
        description,
        tax_amount = 0
      } = revenueData;

      const response = await api.post(`${this.baseURL}/revenue`, {
        amount,
        source,
        category,
        order_id,
        customer_id,
        payment_method,
        transaction_date,
        description,
        tax_amount
      });

      return {
        success: true,
        data: response.data.revenue,
        message: 'Revenue recorded successfully'
      };
    } catch (error) {
      console.error('Error recording revenue:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to record revenue',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Update revenue entry
   * @param {string} revenueId - Revenue ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise} API response
   */
  async updateRevenue(revenueId, updates) {
    try {
      const response = await api.patch(`${this.baseURL}/revenue/${revenueId}`, updates);

      return {
        success: true,
        data: response.data.revenue,
        message: 'Revenue updated successfully'
      };
    } catch (error) {
      console.error('Error updating revenue:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to update revenue',
        error: error.response?.data || error.message
      };
    }
  }

  // ================== Expense Management ==================

  /**
   * Get expense data with filtering
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with expense data
   */
  async getExpenseData(params = {}) {
    try {
      const {
        period = 'monthly',
        date_from,
        date_to,
        category,
        type,
        group_by = 'month',
        page = 1,
        limit = 50
      } = params;

      const response = await api.get(`${this.baseURL}/expenses`, {
        params: {
          period,
          group_by,
          page,
          limit,
          ...(date_from && { date_from }),
          ...(date_to && { date_to }),
          ...(category && { category }),
          ...(type && { type })
        }
      });

      return {
        success: true,
        data: {
          total_expenses: response.data.total_expenses,
          expenses: response.data.expenses,
          expenses_by_category: response.data.expenses_by_category,
          expenses_by_type: response.data.expenses_by_type,
          trends: response.data.trends,
          pagination: response.data.pagination
        },
        message: 'Expense data fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching expense data:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch expense data',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Record new expense
   * @param {Object} expenseData - Expense information
   * @returns {Promise} API response
   */
  async recordExpense(expenseData) {
    try {
      const {
        amount,
        category,
        type,
        description,
        vendor,
        payment_method,
        transaction_date,
        receipt_file,
        is_recurring = false,
        recurring_frequency
      } = expenseData;

      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('category', category);
      formData.append('type', type);
      formData.append('description', description);
      formData.append('vendor', vendor);
      formData.append('payment_method', payment_method);
      formData.append('transaction_date', transaction_date);
      formData.append('is_recurring', is_recurring);
      
      if (recurring_frequency) {
        formData.append('recurring_frequency', recurring_frequency);
      }
      
      if (receipt_file) {
        formData.append('receipt', receipt_file);
      }

      const response = await api.post(`${this.baseURL}/expenses`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        success: true,
        data: response.data.expense,
        message: 'Expense recorded successfully'
      };
    } catch (error) {
      console.error('Error recording expense:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to record expense',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Update expense entry
   * @param {string} expenseId - Expense ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise} API response
   */
  async updateExpense(expenseId, updates) {
    try {
      const formData = new FormData();
      
      Object.keys(updates).forEach(key => {
        if (key === 'receipt' && updates[key] instanceof File) {
          formData.append('receipt', updates[key]);
        } else {
          formData.append(key, updates[key]);
        }
      });

      const response = await api.patch(`${this.baseURL}/expenses/${expenseId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        success: true,
        data: response.data.expense,
        message: 'Expense updated successfully'
      };
    } catch (error) {
      console.error('Error updating expense:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to update expense',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Delete expense entry
   * @param {string} expenseId - Expense ID
   * @returns {Promise} API response
   */
  async deleteExpense(expenseId) {
    try {
      await api.delete(`${this.baseURL}/expenses/${expenseId}`);

      return {
        success: true,
        message: 'Expense deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to delete expense',
        error: error.response?.data || error.message
      };
    }
  }

  // ================== Profit Analysis ==================

  /**
   * Get profit analysis data
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with profit analysis
   */
  async getProfitAnalysis(params = {}) {
    try {
      const {
        period = 'monthly',
        date_from,
        date_to,
        breakdown_by = 'product',
        include_projections = false
      } = params;

      const response = await api.get(`${this.baseURL}/profit-analysis`, {
        params: {
          period,
          breakdown_by,
          include_projections,
          ...(date_from && { date_from }),
          ...(date_to && { date_to })
        }
      });

      return {
        success: true,
        data: {
          gross_profit: response.data.gross_profit,
          net_profit: response.data.net_profit,
          profit_margin: response.data.profit_margin,
          profit_by_period: response.data.profit_by_period,
          profit_by_category: response.data.profit_by_category,
          cost_breakdown: response.data.cost_breakdown,
          projections: response.data.projections
        },
        message: 'Profit analysis fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching profit analysis:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch profit analysis',
        error: error.response?.data || error.message
      };
    }
  }

  // ================== Cost Management ==================

  /**
   * Get cost breakdown analysis
   * @param {Object} params - Query parameters
   * @returns {Promise} API response