import { apiHelpers, API_ENDPOINTS, handleApiError } from './api';

/**
 * Customer Service
 * Handles all customer-related API operations
 */
class CustomerService {
  /**
   * Get all customers with pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.search - Search term
   * @param {string} params.status - Customer status filter
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortOrder - Sort order (asc/desc)
   * @returns {Promise<Object>} Paginated customer list
   */
  async getCustomers(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.search && { search: params.search }),
        ...(params.status && { status: params.status }),
        ...(params.sortBy && { sortBy: params.sortBy }),
        ...(params.sortOrder && { sortOrder: params.sortOrder }),
      });

      const response = await apiHelpers.get(`${API_ENDPOINTS.CUSTOMERS.LIST}?${queryParams}`);
      
      return {
        customers: response.data || [],
        pagination: {
          currentPage: response.currentPage || 1,
          totalPages: response.totalPages || 1,
          totalItems: response.totalItems || 0,
          hasNextPage: response.hasNextPage || false,
          hasPrevPage: response.hasPrevPage || false,
        }
      };
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch customers'));
    }
  }

  /**
   * Get customer by ID
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} Customer data
   */
  async getCustomerById(customerId) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const response = await apiHelpers.get(API_ENDPOINTS.CUSTOMERS.GET(customerId));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch customer details'));
    }
  }

  /**
   * Create new customer
   * @param {Object} customerData - Customer information
   * @param {string} customerData.name - Customer name
   * @param {string} customerData.email - Customer email
   * @param {string} customerData.phone - Customer phone
   * @param {string} customerData.address - Customer address
   * @param {Object} customerData.preferences - Customer preferences
   * @returns {Promise<Object>} Created customer data
   */
  async createCustomer(customerData) {
    try {
      // Validate required fields
      this.validateCustomerData(customerData);

      const response = await apiHelpers.post(API_ENDPOINTS.CUSTOMERS.CREATE, customerData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to create customer'));
    }
  }

  /**
   * Update existing customer
   * @param {string} customerId - Customer ID
   * @param {Object} customerData - Updated customer information
   * @returns {Promise<Object>} Updated customer data
   */
  async updateCustomer(customerId, customerData) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      // Validate data if provided
      if (Object.keys(customerData).length > 0) {
        this.validateCustomerData(customerData, false); // partial validation
      }

      const response = await apiHelpers.put(API_ENDPOINTS.CUSTOMERS.UPDATE(customerId), customerData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update customer'));
    }
  }

  /**
   * Delete customer
   * @param {string} customerId - Customer ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteCustomer(customerId) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      await apiHelpers.delete(API_ENDPOINTS.CUSTOMERS.DELETE(customerId));
      return true;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to delete customer'));
    }
  }

  /**
   * Search customers with advanced filters
   * @param {Object} searchParams - Search parameters
   * @param {string} searchParams.query - Search query
   * @param {Array} searchParams.fields - Fields to search in
   * @param {Object} searchParams.filters - Additional filters
   * @returns {Promise<Array>} Search results
   */
  async searchCustomers(searchParams) {
    try {
      const response = await apiHelpers.post(API_ENDPOINTS.CUSTOMERS.SEARCH, searchParams);
      return response.data || [];
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to search customers'));
    }
  }

  /**
   * Get customer statistics
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} Customer statistics
   */
  async getCustomerStats(customerId) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const response = await apiHelpers.get(`${API_ENDPOINTS.CUSTOMERS.GET(customerId)}/stats`);
      return {
        totalOrders: response.data.totalOrders || 0,
        totalSpent: response.data.totalSpent || 0,
        averageOrderValue: response.data.averageOrderValue || 0,
        lastOrderDate: response.data.lastOrderDate || null,
        favoriteProducts: response.data.favoriteProducts || [],
        customerSince: response.data.customerSince || null,
        loyaltyScore: response.data.loyaltyScore || 0,
      };
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch customer statistics'));
    }
  }

  /**
   * Get customer orders
   * @param {string} customerId - Customer ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Customer orders
   */
  async getCustomerOrders(customerId, params = {}) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.status && { status: params.status }),
        ...(params.sortBy && { sortBy: params.sortBy }),
        ...(params.sortOrder && { sortOrder: params.sortOrder }),
      });

      const response = await apiHelpers.get(
        `${API_ENDPOINTS.CUSTOMERS.GET(customerId)}/orders?${queryParams}`
      );
      
      return response.data || [];
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch customer orders'));
    }
  }

  /**
   * Add note to customer
   * @param {string} customerId - Customer ID
   * @param {Object} noteData - Note data
   * @param {string} noteData.content - Note content
   * @param {string} noteData.type - Note type (general, important, follow-up)
   * @returns {Promise<Object>} Created note
   */
  async addCustomerNote(customerId, noteData) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      if (!noteData.content || noteData.content.trim() === '') {
        throw new Error('Note content is required');
      }

      const response = await apiHelpers.post(
        `${API_ENDPOINTS.CUSTOMERS.GET(customerId)}/notes`,
        noteData
      );
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to add customer note'));
    }
  }

  /**
   * Get customer notes
   * @param {string} customerId - Customer ID
   * @returns {Promise<Array>} Customer notes
   */
  async getCustomerNotes(customerId) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const response = await apiHelpers.get(`${API_ENDPOINTS.CUSTOMERS.GET(customerId)}/notes`);
      return response.data || [];
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch customer notes'));
    }
  }

  /**
   * Update customer status
   * @param {string} customerId - Customer ID
   * @param {string} status - New status (active, inactive, blocked)
   * @returns {Promise<Object>} Updated customer
   */
  async updateCustomerStatus(customerId, status) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const validStatuses = ['active', 'inactive', 'blocked'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid customer status');
      }

      const response = await apiHelpers.patch(
        `${API_ENDPOINTS.CUSTOMERS.UPDATE(customerId)}/status`,
        { status }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update customer status'));
    }
  }

  /**
   * Export customers data
   * @param {Object} exportParams - Export parameters
   * @param {string} exportParams.format - Export format (csv, excel, pdf)
   * @param {Array} exportParams.fields - Fields to export
   * @param {Object} exportParams.filters - Export filters
   * @returns {Promise<Blob>} Export file
   */
  async exportCustomers(exportParams = {}) {
    try {
      const params = {
        format: exportParams.format || 'csv',
        fields: exportParams.fields || ['name', 'email', 'phone', 'status', 'createdAt'],
        ...exportParams.filters,
      };

      const response = await apiHelpers.post(API_ENDPOINTS.CUSTOMERS.EXPORT, params, {
        responseType: 'blob'
      });

      return response;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to export customers'));
    }
  }

  /**
   * Import customers from file
   * @param {File} file - CSV or Excel file
   * @param {Object} options - Import options
   * @returns {Promise<Object>} Import results
   */
  async importCustomers(file, options = {}) {
    try {
      if (!file) {
        throw new Error('File is required');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('options', JSON.stringify(options));

      const response = await apiHelpers.uploadFile(
        `${API_ENDPOINTS.CUSTOMERS.BASE}/import`,
        formData
      );

      return {
        success: response.success || false,
        imported: response.imported || 0,
        failed: response.failed || 0,
        errors: response.errors || [],
        duplicates: response.duplicates || 0,
      };
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to import customers'));
    }
  }

  /**
   * Get customer communication history
   * @param {string} customerId - Customer ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Communication history
   */
  async getCustomerCommunications(customerId, params = {}) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        ...(params.type && { type: params.type }), // whatsapp, email, sms
        ...(params.dateFrom && { dateFrom: params.dateFrom }),
        ...(params.dateTo && { dateTo: params.dateTo }),
      });

      const response = await apiHelpers.get(
        `${API_ENDPOINTS.CUSTOMERS.GET(customerId)}/communications?${queryParams}`
      );
      
      return response.data || [];
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch customer communications'));
    }
  }

  /**
   * Validate customer data
   * @param {Object} customerData - Customer data to validate
   * @param {boolean} isComplete - Whether to validate all required fields
   * @throws {Error} Validation error
   */
  validateCustomerData(customerData, isComplete = true) {
    const errors = [];

    // Required fields validation (for complete validation)
    if (isComplete) {
      if (!customerData.name || customerData.name.trim() === '') {
        errors.push('Customer name is required');
      }
    }

    // Email validation
    if (customerData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerData.email)) {
        errors.push('Invalid email format');
      }
    }

    // Phone validation
    if (customerData.phone) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(customerData.phone)) {
        errors.push('Invalid phone format');
      }
    }

    // Name length validation
    if (customerData.name && customerData.name.length > 100) {
      errors.push('Customer name must be less than 100 characters');
    }

    // Address length validation
    if (customerData.address && customerData.address.length > 500) {
      errors.push('Address must be less than 500 characters');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  /**
   * Get customer activity timeline
   * @param {string} customerId - Customer ID
   * @returns {Promise<Array>} Activity timeline
   */
  async getCustomerTimeline(customerId) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const response = await apiHelpers.get(`${API_ENDPOINTS.CUSTOMERS.GET(customerId)}/timeline`);
      return response.data || [];
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch customer timeline'));
    }
  }

  /**
   * Add customer tags
   * @param {string} customerId - Customer ID
   * @param {Array} tags - Tags to add
   * @returns {Promise<Object>} Updated customer
   */
  async addCustomerTags(customerId, tags) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      if (!Array.isArray(tags) || tags.length === 0) {
        throw new Error('Tags array is required');
      }

      const response = await apiHelpers.post(
        `${API_ENDPOINTS.CUSTOMERS.GET(customerId)}/tags`,
        { tags }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to add customer tags'));
    }
  }

  /**
   * Remove customer tags
   * @param {string} customerId - Customer ID
   * @param {Array} tags - Tags to remove
   * @returns {Promise<Object>} Updated customer
   */
  async removeCustomerTags(customerId, tags) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      if (!Array.isArray(tags) || tags.length === 0) {
        throw new Error('Tags array is required');
      }

      const response = await apiHelpers.delete(
        `${API_ENDPOINTS.CUSTOMERS.GET(customerId)}/tags`,
        { data: { tags } }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to remove customer tags'));
    }
  }
}

// Create and export service instance
const customerService = new CustomerService();
export default customerService;