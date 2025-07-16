import { apiHelpers, API_ENDPOINTS, handleApiError } from './api';

/**
 * Simplified Customer Service for School Project
 * Handles core customer operations with role-based authentication
 */
class CustomerService {
  /**
   * Get customers with role-based filtering
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.search - Search term
   * @param {string} params.userId - Current user ID
   * @param {string} params.role - User role (admin/assistant)
   * @returns {Promise<Object>} Response with customers list
   */
  async getCustomers(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.search && { search: params.search }),
        ...(params.role === 'assistant' && { assignedTo: params.userId }),
      });

      const response = await apiHelpers.get(`${API_ENDPOINTS.CUSTOMERS.LIST}?${queryParams}`);
      
      return {
        success: true,
        data: {
          customers: this.transformCustomersData(response.data || []),
          currentPage: response.currentPage || 1,
          totalPages: response.totalPages || 1,
          totalCustomers: response.totalItems || 0,
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
   * @param {string} customerData.notes - Customer notes
   * @param {string} customerData.assignedTo - Optional assignment (admin only)
   * @returns {Promise<Object>} Created customer data
   */
  async createCustomer(customerData) {
    try {
      // Basic validation
      this.validateCustomerData(customerData);

      const response = await apiHelpers.post(API_ENDPOINTS.CUSTOMERS.CREATE, customerData);
      
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

      // Basic validation for provided data
      if (Object.keys(customerData).length > 0) {
        this.validateCustomerData(customerData, false);
      }

      const response = await apiHelpers.put(API_ENDPOINTS.CUSTOMERS.UPDATE(customerId), customerData);
      
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
   * Delete customer (admin only)
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
   * Get all assistants (admin only)
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
        assignedTo: assistantId || null
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
   * Add note to customer
   * @param {string} customerId - Customer ID
   * @param {Object} noteData - Note data
   * @param {string} noteData.content - Note content
   * @param {string} noteData.type - Note type (default: 'general')
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
        {
          content: noteData.content,
          type: noteData.type || 'general'
        }
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
   * @param {string} status - New status (active, inactive)
   * @returns {Promise<Object>} Updated customer
   */
  async updateCustomerStatus(customerId, status) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const validStatuses = ['active', 'inactive'];
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
   * Transform customers data to consistent format
   * @param {Array} customers - Raw customer data
   * @returns {Array} Transformed customer data
   */
  transformCustomersData(customers) {
    if (!Array.isArray(customers)) {
      return [];
    }

    return customers.map(customer => ({
      _id: customer._id || customer.id,
      fullName: customer.fullName || customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      notes: customer.notes || '',
      status: customer.status || 'active',
      assignedTo: customer.assignedTo ? {
        _id: customer.assignedTo._id || customer.assignedTo.id,
        firstName: customer.assignedTo.firstName || '',
        lastName: customer.assignedTo.lastName || '',
        email: customer.assignedTo.email || '',
        role: customer.assignedTo.role || 'assistant'
      } : null,
      assignedAt: customer.assignedAt || null,
      isAssigned: !!customer.assignedTo,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    }));
  }

  /**
   * Basic validation for customer data
   * @param {Object} customerData - Customer data to validate
   * @param {boolean} isComplete - Whether to validate all required fields
   * @throws {Error} Validation error
   */
  validateCustomerData(customerData, isComplete = true) {
    const errors = [];

    // Required field validation
    if (isComplete && (!customerData.fullName || customerData.fullName.trim() === '')) {
      errors.push('Customer name is required');
    }

    // Email validation
    if (customerData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerData.email)) {
        errors.push('Invalid email format');
      }
    } else if (isComplete) {
      errors.push('Email is required');
    }

    // Phone validation
    if (customerData.phone) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(customerData.phone)) {
        errors.push('Invalid phone format');
      }
    } else if (isComplete) {
      errors.push('Phone is required');
    }

    // Name length validation
    if (customerData.fullName && customerData.fullName.length > 100) {
      errors.push('Customer name must be less than 100 characters');
    }

    // Notes length validation
    if (customerData.notes && customerData.notes.length > 500) {
      errors.push('Notes must be less than 500 characters');
    }

    // Status validation
    if (customerData.status) {
      const validStatuses = ['active', 'inactive'];
      if (!validStatuses.includes(customerData.status)) {
        errors.push('Invalid customer status');
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  /**
   * Check if user can edit customer (role-based)
   * @param {Object} customer - Customer object
   * @param {string} userId - Current user ID
   * @param {string} userRole - Current user role
   * @returns {boolean} Can edit status
   */
  canEditCustomer(customer, userId, userRole) {
    if (userRole === 'admin') {
      return true;
    }
    
    if (userRole === 'assistant') {
      return customer.assignedTo && customer.assignedTo._id === userId;
    }
    
    return false;
  }

  /**
   * Check if user can delete customer (admin only)
   * @param {string} userRole - Current user role
   * @returns {boolean} Can delete status
   */
  canDeleteCustomer(userRole) {
    return userRole === 'admin';
  }

  /**
   * Check if user can assign customers (admin only)
   * @param {string} userRole - Current user role
   * @returns {boolean} Can assign status
   */
  canAssignCustomer(userRole) {
    return userRole === 'admin';
  }

  /**
   * Get customer summary stats
   * @param {string} userId - Current user ID
   * @param {string} userRole - Current user role
   * @returns {Promise<Object>} Summary statistics
   */
  async getCustomerSummary(userId, userRole) {
    try {
      const params = userRole === 'assistant' ? { assignedTo: userId } : {};
      const response = await this.getCustomers(params);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      const customers = response.data.customers;
      const totalCustomers = customers.length;
      const activeCustomers = customers.filter(c => c.status === 'active').length;
      const assignedCustomers = customers.filter(c => c.isAssigned).length;
      const unassignedCustomers = totalCustomers - assignedCustomers;

      return {
        success: true,
        data: {
          totalCustomers,
          activeCustomers,
          assignedCustomers,
          unassignedCustomers,
          myCustomers: userRole === 'assistant' ? totalCustomers : assignedCustomers
        }
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error, 'Failed to fetch customer summary'),
        data: null
      };
    }
  }
}

// Create and export service instance
const customerService = new CustomerService();
export default customerService;