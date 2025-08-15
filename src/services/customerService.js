import { apiHelpers } from './api';

export class CustomerService {
  
  /**
   * Get dashboard statistics - Returns stats object directly
   */
  static async getDashboardStats() {
    try {
      const response = await apiHelpers.get('/api/customers/stats');
      
      // Extract data from backend response format { success: true, data: stats }
      const stats = response.success ? response.data : response;
      
      // Return stats object with assignment-related fields
      return {
        totalCustomers: stats.totalCustomers || 0,
        activeCustomers: stats.activeCustomers || 0,
        inactiveCustomers: stats.inactiveCustomers || 0,
        assignedCustomers: stats.assignedCustomers || 0,
        unassignedCustomers: stats.unassignedCustomers || 0,
        newCustomersThisWeek: stats.newCustomersThisWeek || 0,
        customerGrowthPercentage: stats.customerGrowthPercentage || 0,
        customerSatisfaction: stats.customerSatisfaction || 0,
        customersNeedingAttention: stats.customersNeedingAttention || 0
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
    }
  }

  /**
   * Get customers - Returns customers array directly (role-based)
   */
  static async getCustomers(params = {}) {
    try {
      // Build query parameters including assignment filters
      const queryParams = {};
      
      if (params.search) {
        queryParams.search = params.search;
      }
      
      if (params.assignedTo) {
        queryParams.assignedTo = params.assignedTo;
      }
      
      if (params.unassigned) {
        queryParams.unassigned = params.unassigned;
      }

      const queryString = new URLSearchParams(queryParams).toString();
      const url = `/api/customers${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiHelpers.get(url);
      
      // Backend returns { success: true, data: customers[] }
      // Extract and return just the customers array
      return response.success ? response.data : response;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw new Error(`Failed to fetch customers: ${error.message}`);
    }
  }

  /**
   * Get customers assigned to specific assistant
   */
  static async getCustomersByAssistant(assistantId, params = {}) {
    try {
      const queryParams = { assignedTo: assistantId };
      
      if (params.search) {
        queryParams.search = params.search;
      }

      const queryString = new URLSearchParams(queryParams).toString();
      const url = `/api/customers/by-assistant/${assistantId}${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiHelpers.get(url);
      return response.success ? response.data : response;
    } catch (error) {
      console.error('Error fetching customers by assistant:', error);
      throw new Error(`Failed to fetch customers by assistant: ${error.message}`);
    }
  }

  /**
   * Get unassigned customers
   */
  static async getUnassignedCustomers(params = {}) {
    try {
      const queryParams = { unassigned: 'true' };
      
      if (params.search) {
        queryParams.search = params.search;
      }

      const queryString = new URLSearchParams(queryParams).toString();
      const url = `/api/customers/unassigned${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiHelpers.get(url);
      return response.success ? response.data : response;
    } catch (error) {
      console.error('Error fetching unassigned customers:', error);
      throw new Error(`Failed to fetch unassigned customers: ${error.message}`);
    }
  }

  /**
   * Get my customers (for assistant role)
   */
  static async getMyCustomers(params = {}) {
    try {
      const queryParams = {};
      
      if (params.search) {
        queryParams.search = params.search;
      }
      
      if (params.page) {
        queryParams.page = params.page;
      }
      
      if (params.limit) {
        queryParams.limit = params.limit;
      }

      const queryString = new URLSearchParams(queryParams).toString();
      const url = `/api/assistant/customers${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiHelpers.get(url);
      return response.success ? response.data : response;
    } catch (error) {
      console.error('Error fetching my customers:', error);
      throw new Error(`Failed to fetch my customers: ${error.message}`);
    }
  }

  /**
   * Get customer by ID - Returns customer object directly
   */
  static async getCustomerById(customerId) {
    try {
      const response = await apiHelpers.get(`/api/customers/${customerId}`);
      // Return just the customer data, not wrapped
      return response.success ? response.data : response;
    } catch (error) {
      throw new Error(`Failed to fetch customer: ${error.message}`);
    }
  }

  /**
   * Create customer - Returns created customer object directly
   */
  static async createCustomer(customerData) {
    try {
      const response = await apiHelpers.post('/api/customers', customerData);
      // Return just the customer data, not wrapped
      return response.success ? response.data : response;
    } catch (error) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  /**
   * Update customer - Returns updated customer object directly
   */
  static async updateCustomer(customerId, updateData) {
    try {
      const response = await apiHelpers.put(`/api/customers/${customerId}`, updateData);
      // Return just the customer data, not wrapped
      return response.success ? response.data : response;
    } catch (error) {
      throw new Error(`Failed to update customer: ${error.message}`);
    }
  }

  /**
   * Delete customer - Returns response directly
   */
  static async deleteCustomer(customerId) {
    try {
      const response = await apiHelpers.delete(`/api/customers/${customerId}`);
      return response;
    } catch (error) {
      throw new Error(`Failed to delete customer: ${error.message}`);
    }
  }

  /**
   * Assign customer to assistant
   */
  static async assignCustomer(customerId, assistantId) {
    try {
      const response = await apiHelpers.post(`/api/customers/${customerId}/assign`, {
        assistantId
      });
      return response.success ? response.data : response;
    } catch (error) {
      throw new Error(`Failed to assign customer: ${error.message}`);
    }
  }

  /**
   * Get available assistants for assignment
   */
  static async getAvailableAssistants() {
    try {
      const response = await apiHelpers.get('/api/users/assistants');
      return response.success ? response.data : response;
    } catch (error) {
      throw new Error(`Failed to fetch available assistants: ${error.message}`);
    }
  }

  /**
   * Search customers - Returns customers array directly
   */
  static async searchCustomers(searchTerm) {
    return this.getCustomers({ search: searchTerm });
  }
}

export default CustomerService;