import { apiHelpers, API_ENDPOINTS, handleApiError } from './api';

/**
 * Customer Service for School Project
 * Handles core customer management operations
 * Simple CRUD operations for customer data
 */
export class CustomerService {
  
  /**
   * Get all customers
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.search - Search term
   * @returns {Promise<Object>} Response with customers list
   */
  static async getCustomers(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.search && { search: params.search }),
      });

      const response = await apiHelpers.get(`${API_ENDPOINTS.CUSTOMERS.LIST}?${queryParams}`);
      
      const customers = Array.isArray(response) ? response : response.data || [];
      
      return customers.map(CustomerService.transformCustomerData);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch customers'));
    }
  }

  /**
   * Get customer by ID
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} Customer data
   */
  static async getCustomerById(customerId) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const response = await apiHelpers.get(API_ENDPOINTS.CUSTOMERS.GET(customerId));
      
      // Extract customer data from wrapped response
      const customer = response.data || response;
      return CustomerService.transformCustomerData(customer);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch customer'));
    }
  }

  /**
   * Create new customer
   * @param {Object} customerData - Customer information
   * @param {string} customerData.fullName - Customer full name
   * @param {string} customerData.email - Customer email
   * @param {string} customerData.phone - Customer phone
   * @param {string} customerData.notes - Customer notes (optional)
   * @returns {Promise<Object>} Created customer data
   */
  static async createCustomer(customerData) {
    try {
      // Basic validation
      CustomerService.validateCustomerData(customerData);

      const payload = {
        fullName: customerData.fullName.trim(),
        email: customerData.email.trim().toLowerCase(),
        phone: customerData.phone.trim(),
        notes: customerData.notes?.trim() || ''
      };

      const response = await apiHelpers.post(API_ENDPOINTS.CUSTOMERS.CREATE, payload);
      
      // Extract customer data from wrapped response
      const customer = response.data || response;
      return CustomerService.transformCustomerData(customer);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to create customer'));
    }
  }

  /**
   * Update existing customer
   * @param {string} customerId - Customer ID
   * @param {Object} updateData - Updated customer information
   * @returns {Promise<Object>} Updated customer data
   */
  static async updateCustomer(customerId, updateData) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      // Prepare update payload
      const payload = {};
      
      if (updateData.fullName) payload.fullName = updateData.fullName.trim();
      if (updateData.email) payload.email = updateData.email.trim().toLowerCase();
      if (updateData.phone) payload.phone = updateData.phone.trim();
      if (updateData.notes !== undefined) payload.notes = updateData.notes?.trim() || '';

      // Validate provided data
      if (Object.keys(payload).length > 0) {
        CustomerService.validateCustomerData(payload, false);
      }

      const response = await apiHelpers.put(API_ENDPOINTS.CUSTOMERS.UPDATE(customerId), payload);
      
      // Extract customer data from wrapped response
      const customer = response.data || response;
      return CustomerService.transformCustomerData(customer);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update customer'));
    }
  }

  /**
   * Delete customer
   * @param {string} customerId - Customer ID
   * @returns {Promise<boolean>} Success status
   */
  static async deleteCustomer(customerId) {
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
   * Transform customer data for consistent UI usage
   * @param {Object} customer - Raw customer data
   * @returns {Object} Transformed customer data
   */
  static transformCustomerData(customer) {
    if (!customer) return null;

    return {
      id: customer.id || customer._id,
      fullName: customer.fullName || '',
      email: customer.email || '',
      phone: customer.phone || '',
      notes: customer.notes || '',
      createdAt: customer.createdAt || null,
      updatedAt: customer.updatedAt || null
    };
  }

  /**
   * Validate customer data
   * @param {Object} data - Customer data to validate
   * @param {boolean} isComplete - Whether to validate all required fields
   * @throws {Error} Validation error
   */
  static validateCustomerData(data, isComplete = true) {
    // Required field validation
    if (isComplete && (!data.fullName || !data.fullName.trim())) {
      throw new Error('Customer name is required');
    }

    if (isComplete && (!data.email || !data.email.trim())) {
      throw new Error('Email is required');
    }

    if (isComplete && (!data.phone || !data.phone.trim())) {
      throw new Error('Phone is required');
    }

    // Email validation
    if (data.email && !CustomerService.isValidEmail(data.email.trim())) {
      throw new Error('Please enter a valid email address');
    }

    // Phone validation
    if (data.phone && !CustomerService.isValidPhone(data.phone.trim())) {
      throw new Error('Please enter a valid phone number');
    }

    // Length validation
    if (data.fullName && data.fullName.length > 100) {
      throw new Error('Customer name must be less than 100 characters');
    }

    if (data.notes && data.notes.length > 500) {
      throw new Error('Notes must be less than 500 characters');
    }
  }

  /**
   * Simple email validation
   * @param {string} email - Email to validate
   * @returns {boolean} Is valid email
   */
  static isValidEmail(email) {
    return email.includes('@') && email.includes('.');
  }

  /**
   * Simple phone validation
   * @param {string} phone - Phone to validate
   * @returns {boolean} Is valid phone
   */
  static isValidPhone(phone) {
    // Remove all non-digits and check if we have at least 10 digits
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15;
  }
}

// Export individual methods for convenience
export const getCustomers = CustomerService.getCustomers;
export const getCustomerById = CustomerService.getCustomerById;
export const createCustomer = CustomerService.createCustomer;
export const updateCustomer = CustomerService.updateCustomer;
export const deleteCustomer = CustomerService.deleteCustomer;

export default CustomerService;