import { apiHelpers, API_ENDPOINTS, handleApiError } from './api';

/**
 * Customer Service
 * Handles all customer-related API operations with support for assistant claiming and reassignment
 */
class CustomerService {
  /**
   * Get all customers with pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.search - Search term
   * @param {string} params.status - Customer status filter
   * @param {string} params.assignmentStatus - Assignment status filter (assigned, unassigned, all)
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortOrder - Sort order (asc/desc)
   * @returns {Promise<Object>} Response matching CustomerList expectations
   */
  async getCustomers(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.search && { search: params.search }),
        ...(params.status && { status: params.status }),
        ...(params.assignmentStatus && { assignmentStatus: params.assignmentStatus }),
        ...(params.sortBy && { sortBy: params.sortBy }),
        ...(params.sortOrder && { sortOrder: params.sortOrder }),
      });

      const response = await apiHelpers.get(`${API_ENDPOINTS.CUSTOMERS.LIST}?${queryParams}`);
      
      // Transform response to match CustomerList expectations
      return {
        success: true,
        data: {
          customers: this.transformCustomersData(response.data || []),
          currentPage: response.currentPage || 1,
          totalPages: response.totalPages || 1,
          totalCustomers: response.totalItems || 0,
          hasNextPage: response.hasNextPage || false,
          hasPrevPage: response.hasPrevPage || false,
        }
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Failed to fetch customers'),
        data: null
      };
    }
  }

  /**
   * Get available customers (unassigned) for assistant claiming
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.search - Search term
   * @returns {Promise<Object>} Response with unassigned customers
   */
  async getAvailableCustomers(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        assignmentStatus: 'unassigned',
        ...(params.search && { search: params.search }),
      });

      const response = await apiHelpers.get(`${API_ENDPOINTS.CUSTOMERS.LIST}?${queryParams}`);
      
      return {
        success: true,
        data: {
          customers: this.transformCustomersData(response.data || []),
          currentPage: response.currentPage || 1,
          totalPages: response.totalPages || 1,
          totalCustomers: response.totalItems || 0,
          hasNextPage: response.hasNextPage || false,
          hasPrevPage: response.hasPrevPage || false,
        }
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Failed to fetch available customers'),
        data: null
      };
    }
  }

  /**
   * Get customers assigned to current assistant
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.search - Search term
   * @param {string} params.status - Customer status filter
   * @returns {Promise<Object>} Response with assigned customers
   */
  async getMyCustomers(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        assignmentStatus: 'assigned_to_me',
        ...(params.search && { search: params.search }),
        ...(params.status && { status: params.status }),
      });

      const response = await apiHelpers.get(`${API_ENDPOINTS.CUSTOMERS.LIST}?${queryParams}`);
      
      return {
        success: true,
        data: {
          customers: this.transformCustomersData(response.data || []),
          currentPage: response.currentPage || 1,
          totalPages: response.totalPages || 1,
          totalCustomers: response.totalItems || 0,
          hasNextPage: response.hasNextPage || false,
          hasPrevPage: response.hasPrevPage || false,
        }
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Failed to fetch my customers'),
        data: null
      };
    }
  }

  /**
   * Claim a customer (assistant self-assignment)
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} Claim response
   */
  async claimCustomer(customerId) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const response = await apiHelpers.post(
        `${API_ENDPOINTS.CUSTOMERS.UPDATE(customerId)}/claim`,
        {}
      );
      
      return {
        success: true,
        data: this.transformCustomersData([response.data])[0],
        message: 'Customer claimed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Failed to claim customer'),
        data: null
      };
    }
  }

  /**
   * Release a customer (remove assignment)
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} Release response
   */
  async releaseCustomer(customerId) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const response = await apiHelpers.post(
        `${API_ENDPOINTS.CUSTOMERS.UPDATE(customerId)}/release`,
        {}
      );
      
      return {
        success: true,
        data: this.transformCustomersData([response.data])[0],
        message: 'Customer released successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Failed to release customer'),
        data: null
      };
    }
  }

  /**
   * Get all assistants for customer assignment (admin only)
   * @returns {Promise<Object>} Response with assistants list
   */
  async getAssistants() {
    try {
      const response = await apiHelpers.get(`${API_ENDPOINTS.USERS.LIST}?role=assistant`);
      
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Failed to fetch assistants'),
        data: []
      };
    }
  }

  /**
   * Assign customer to assistant (admin only)
   * @param {string} customerId - Customer ID
   * @param {string} assistantId - Assistant ID (null to unassign)
   * @returns {Promise<Object>} Assignment response
   */
  async assignCustomer(customerId, assistantId) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const assignmentData = {
        assistantId: assistantId || null
      };

      const response = await apiHelpers.patch(
        `${API_ENDPOINTS.CUSTOMERS.UPDATE(customerId)}/assign`,
        assignmentData
      );
      
      return {
        success: true,
        data: this.transformCustomersData([response.data])[0],
        message: assistantId ? 'Customer assigned successfully' : 'Customer unassigned successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Failed to assign customer'),
        data: null
      };
    }
  }

  /**
   * Reassign customer to different assistant (admin only)
   * @param {string} customerId - Customer ID
   * @param {string} newAssistantId - New assistant ID
   * @returns {Promise<Object>} Reassignment response
   */
  async reassignCustomer(customerId, newAssistantId) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      if (!newAssistantId) {
        throw new Error('New assistant ID is required');
      }

      const response = await apiHelpers.patch(
        `${API_ENDPOINTS.CUSTOMERS.UPDATE(customerId)}/reassign`,
        { assistantId: newAssistantId }
      );
      
      return {
        success: true,
        data: this.transformCustomersData([response.data])[0],
        message: 'Customer reassigned successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Failed to reassign customer'),
        data: null
      };
    }
  }

  /**
   * Get customer assignment history
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} Assignment history
   */
  async getCustomerAssignmentHistory(customerId) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const response = await apiHelpers.get(
        `${API_ENDPOINTS.CUSTOMERS.GET(customerId)}/assignment-history`
      );
      
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Failed to fetch assignment history'),
        data: []
      };
    }
  }

  /**
   * Get customer assignment statistics
   * @returns {Promise<Object>} Assignment statistics
   */
  async getAssignmentStats() {
    try {
      const response = await apiHelpers.get(`${API_ENDPOINTS.CUSTOMERS.BASE}/assignment-stats`);
      
      return {
        success: true,
        data: {
          totalCustomers: response.data.totalCustomers || 0,
          assignedCustomers: response.data.assignedCustomers || 0,
          unassignedCustomers: response.data.unassignedCustomers || 0,
          myCustomers: response.data.myCustomers || 0,
          assistantStats: response.data.assistantStats || []
        }
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Failed to fetch assignment statistics'),
        data: null
      };
    }
  }

  /**
   * Transform customers data to match CustomerList expectations
   * @param {Array} customers - Raw customer data
   * @returns {Array} Transformed customer data
   */
  transformCustomersData(customers) {
    if (!Array.isArray(customers)) {
      return [];
    }

    return customers.map(customer => ({
      _id: customer._id || customer.id,
      fullName: customer.fullName || customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
      email: customer.email || '',
      phone: customer.phone || '',
      status: customer.status || 'active',
      assignedTo: customer.assignedTo ? {
        _id: customer.assignedTo._id || customer.assignedTo.id,
        firstName: customer.assignedTo.firstName || customer.assignedTo.name?.split(' ')[0] || '',
        lastName: customer.assignedTo.lastName || customer.assignedTo.name?.split(' ').slice(1).join(' ') || '',
        email: customer.assignedTo.email || '',
        role: customer.assignedTo.role || 'assistant'
      } : null,
      assignedAt: customer.assignedAt || null,
      isAssigned: !!customer.assignedTo,
      canClaim: !customer.assignedTo, // Customer can be claimed if not assigned
      canRelease: customer.assignedTo && customer.assignedTo.isCurrentUser, // Can release if assigned to current user
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      // Include any other fields that might be needed
      ...customer
    }));
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
      
      return {
        success: true,
        data: this.transformCustomersData([response.data])[0]
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Failed to fetch customer details'),
        data: null
      };
    }
  }

  /**
   * Create new customer
   * @param {Object} customerData - Customer information
   * @param {string} customerData.fullName - Customer full name
   * @param {string} customerData.email - Customer email
   * @param {string} customerData.phone - Customer phone
   * @param {string} customerData.address - Customer address
   * @param {string} customerData.status - Customer status
   * @param {Object} customerData.preferences - Customer preferences
   * @param {string} customerData.assignedTo - Optional initial assignment
   * @returns {Promise<Object>} Created customer data
   */
  async createCustomer(customerData) {
    try {
      // Validate required fields
      this.validateCustomerData(customerData);

      // Transform data to match backend expectations
      const transformedData = {
        ...customerData,
        name: customerData.fullName || customerData.name,
        status: customerData.status || 'active'
      };

      const response = await apiHelpers.post(API_ENDPOINTS.CUSTOMERS.CREATE, transformedData);
      
      return {
        success: true,
        data: this.transformCustomersData([response.data])[0],
        message: 'Customer created successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Failed to create customer'),
        data: null
      };
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

      // Transform data to match backend expectations
      const transformedData = {
        ...customerData,
        ...(customerData.fullName && { name: customerData.fullName })
      };

      const response = await apiHelpers.put(API_ENDPOINTS.CUSTOMERS.UPDATE(customerId), transformedData);
      
      return {
        success: true,
        data: this.transformCustomersData([response.data])[0],
        message: 'Customer updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Failed to update customer'),
        data: null
      };
    }
  }

  /**
   * Delete customer
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} Success status
   */
  async deleteCustomer(customerId) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      await apiHelpers.delete(API_ENDPOINTS.CUSTOMERS.DELETE(customerId));
      
      return {
        success: true,
        message: 'Customer deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Failed to delete customer')
      };
    }
  }

  /**
   * Search customers with advanced filters
   * @param {Object} searchParams - Search parameters
   * @param {string} searchParams.query - Search query
   * @param {Array} searchParams.fields - Fields to search in
   * @param {Object} searchParams.filters - Additional filters
   * @returns {Promise<Object>} Search results
   */
  async searchCustomers(searchParams) {
    try {
      const response = await apiHelpers.post(API_ENDPOINTS.CUSTOMERS.SEARCH, searchParams);
      
      return {
        success: true,
        data: this.transformCustomersData(response.data || [])
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Failed to search customers'),
        data: []
      };
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
        success: true,
        data: {
          totalOrders: response.data.totalOrders || 0,
          totalSpent: response.data.totalSpent || 0,
          averageOrderValue: response.data.averageOrderValue || 0,
          lastOrderDate: response.data.lastOrderDate || null,
          favoriteProducts: response.data.favoriteProducts || [],
          customerSince: response.data.customerSince || null,
          loyaltyScore: response.data.loyaltyScore || 0,
        }
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Failed to fetch customer statistics'),
        data: null
      };
    }
  }

  /**
   * Get customer orders
   * @param {string} customerId - Customer ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Customer orders
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
      
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Failed to fetch customer orders'),
        data: []
      };
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
      
      return {
        success: true,
        data: response.data,
        message: 'Note added successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Failed to add customer note'),
        data: null
      };
    }
  }

  /**
   * Get customer notes
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} Customer notes
   */
  async getCustomerNotes(customerId) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const response = await apiHelpers.get(`${API_ENDPOINTS.CUSTOMERS.GET(customerId)}/notes`);
      
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Failed to fetch customer notes'),
        data: []
      };
    }
  }

  /**
   * Update customer status
   * @param {string} customerId - Customer ID
   * @param {string} status - New status (active, inactive, pending)
   * @returns {Promise<Object>} Updated customer
   */
  async updateCustomerStatus(customerId, status) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const validStatuses = ['active', 'inactive', 'pending'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid customer status');
      }

      const response = await apiHelpers.patch(
        `${API_ENDPOINTS.CUSTOMERS.UPDATE(customerId)}/status`,
        { status }
      );
      
      return {
        success: true,
        data: this.transformCustomersData([response.data])[0],
        message: 'Customer status updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Failed to update customer status'),
        data: null
      };
    }
  }

  /**
   * Export customers data
   * @param {Object} exportParams - Export parameters
   * @param {string} exportParams.format - Export format (csv, excel, pdf)
   * @param {Array} exportParams.fields - Fields to export
   * @param {Object} exportParams.filters - Export filters
   * @returns {Promise<Object>} Export file
   */
  async exportCustomers(exportParams = {}) {
    try {
      const params = {
        format: exportParams.format || 'csv',
        fields: exportParams.fields || ['fullName', 'email', 'phone', 'status', 'assignedTo', 'createdAt'],
        ...exportParams.filters,
      };

      const response = await apiHelpers.post(API_ENDPOINTS.CUSTOMERS.EXPORT, params, {
        responseType: 'blob'
      });

      return {
        success: true,
        data: response,
        message: 'Customers exported successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Failed to export customers'),
        data: null
      };
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
        success: response.success || true,
        data: {
          imported: response.imported || 0,
          failed: response.failed || 0,
          errors: response.errors || [],
          duplicates: response.duplicates || 0,
        },
        message: 'Import completed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Failed to import customers'),
        data: null
      };
    }
  }

  /**
   * Get customer communication history
   * @param {string} customerId - Customer ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Communication history
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
      
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Failed to fetch customer communications'),
        data: []
      };
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
      if (!customerData.fullName && !customerData.name) {
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
    const name = customerData.fullName || customerData.name;
    if (name && name.length > 100) {
      errors.push('Customer name must be less than 100 characters');
    }

    // Address length validation
    if (customerData.address && customerData.address.length > 500) {
      errors.push('Address must be less than 500 characters');
    }

    // Status validation
    if (customerData.status) {
      const validStatuses = ['active', 'inactive', 'pending'];
      if (!validStatuses.includes(customerData.status)) {
        errors.push('Invalid customer status');
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  /**
   * Get customer activity timeline
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} Activity timeline
   */
  async getCustomerTimeline(customerId) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const response = await apiHelpers.get(`${API_ENDPOINTS.CUSTOMERS.GET(customerId)}/timeline`);
      
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Failed to fetch customer timeline'),
        data: []
      };
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
      
      return {
        success: true,
        data: this.transformCustomersData([response.data])[0],
        message: 'Tags added successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Failed to add customer tags'),
        data: null
      };
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
      
      return {
        success: true,
        data: this.transformCustomersData([response.data])[0],
        message: 'Tags removed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Failed to remove customer tags'),
        data: null
      };
    }
  }
}

// Create and export service instance
const customerService = new CustomerService();
export default customerService;