import { apiHelpers, API_ENDPOINTS, handleApiError } from './api';

/**
 * Assistant Service for School Project
 * Handles assistant management operations (Admin Only)
 * Complete CRUD operations for assistant management
 */
export class AssistantService {
  
  /**
   * Get all assistants
   * @returns {Promise<Array>} List of assistants
   */
  static async getAllAssistants() {
    try {
      const response = await apiHelpers.get(API_ENDPOINTS.USERS.ASSISTANTS.LIST);
      
      // Response should be array of assistants directly
      const assistants = Array.isArray(response) ? response : [];
      
      return assistants.map(AssistantService.transformAssistantData);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch assistants'));
    }
  }

  /**
   * Create a new assistant
   * @param {Object} assistantData - Assistant data
   * @param {string} assistantData.firstName - First name
   * @param {string} assistantData.lastName - Last name  
   * @param {string} assistantData.email - Email address
   * @returns {Promise<Object>} Created assistant
   */
  static async createAssistant(assistantData) {
    try {
      // Basic validation
      AssistantService.validateAssistantData(assistantData);

      const payload = {
        firstName: assistantData.firstName.trim(),
        lastName: assistantData.lastName.trim(),
        email: assistantData.email.trim().toLowerCase()
      };

      const response = await apiHelpers.post(API_ENDPOINTS.USERS.ASSISTANTS.CREATE, payload);
      
      return AssistantService.transformAssistantData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to create assistant'));
    }
  }

  /**
   * Delete an assistant
   * @param {string} id - Assistant ID
   * @returns {Promise<boolean>} Success status
   */
  static async deleteAssistant(id) {
    try {
      if (!id) {
        throw new Error('Assistant ID is required');
      }

      await apiHelpers.delete(API_ENDPOINTS.USERS.ASSISTANTS.DELETE(id));
      
      return true;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to delete assistant'));
    }
  }

  /**
   * Update an existing assistant
   * @param {string} id - Assistant ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated assistant
   */
  static async updateAssistant(id, updateData) {
    try {
      if (!id) {
        throw new Error('Assistant ID is required');
      }

      // Prepare update payload
      const payload = {};
      
      if (updateData.firstName) payload.firstName = updateData.firstName.trim();
      if (updateData.lastName) payload.lastName = updateData.lastName.trim();

      const response = await apiHelpers.put(API_ENDPOINTS.USERS.ASSISTANTS.UPDATE(id), payload);
      
      return AssistantService.transformAssistantData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update assistant'));
    }
  }

  /**
   * Get assistant by ID with details including assigned customers
   * @param {string} id - Assistant ID
   * @returns {Promise<Object>} Assistant data with customers
   */
  static async getAssistantById(id) {
    try {
      if (!id) {
        throw new Error('Assistant ID is required');
      }

      const response = await apiHelpers.get(API_ENDPOINTS.USERS.ASSISTANTS.GET(id));
      
      return AssistantService.transformAssistantData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch assistant'));
    }
  }

  /**
   * Toggle assistant active status
   * @param {string} id - Assistant ID
   * @returns {Promise<Object>} Updated assistant status
   */
  static async toggleAssistantStatus(id) {
    try {
      if (!id) {
        throw new Error('Assistant ID is required');
      }

      const response = await apiHelpers.put(API_ENDPOINTS.USERS.ASSISTANTS.TOGGLE_STATUS(id));
      
      return response;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to toggle assistant status'));
    }
  }

  /**
   * Reset assistant password
   * @param {string} id - Assistant ID
   * @returns {Promise<Object>} New password info
   */
  static async resetAssistantPassword(id) {
    try {
      if (!id) {
        throw new Error('Assistant ID is required');
      }

      const response = await apiHelpers.put(API_ENDPOINTS.USERS.ASSISTANTS.RESET_PASSWORD(id));
      
      return response;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to reset assistant password'));
    }
  }

  /**
   * Assign customer to assistant
   * @param {string} customerId - Customer ID
   * @param {string} assistantId - Assistant ID
   * @returns {Promise<Object>} Updated customer
   */
  static async assignCustomer(customerId, assistantId) {
    try {
      if (!customerId || !assistantId) {
        throw new Error('Both customer ID and assistant ID are required');
      }

      const payload = { customerId, assistantId };
      const response = await apiHelpers.put(API_ENDPOINTS.USERS.ASSIGN_CUSTOMER, payload);
      
      return response;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to assign customer'));
    }
  }

  /**
   * Unassign customer from assistant
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} Updated customer
   */
  static async unassignCustomer(customerId) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const payload = { customerId };
      const response = await apiHelpers.put(API_ENDPOINTS.USERS.UNASSIGN_CUSTOMER, payload);
      
      return response;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to unassign customer'));
    }
  }

  /**
   * Transform assistant data for consistent UI usage
   * @param {Object} assistant - Raw assistant data
   * @returns {Object} Transformed assistant data
   */
  static transformAssistantData(assistant) {
    if (!assistant) return null;

    return {
      id: assistant.id || assistant._id,
      firstName: assistant.firstName || '',
      lastName: assistant.lastName || '',
      email: assistant.email || '',
      role: assistant.role || 'assistant',
      isActive: assistant.isActive !== false, // Default to true
      mustChangePassword: assistant.mustChangePassword || false,
      createdAt: assistant.createdAt || null,
      updatedAt: assistant.updatedAt || null,
      customers: assistant.customers || [], // Assigned customers if included
      tempPassword: assistant.tempPassword || null, // For new assistants
      newPassword: assistant.newPassword || null // For password reset
    };
  }

  /**
   * Validate assistant data
   * @param {Object} data - Assistant data to validate
   * @throws {Error} Validation error
   */
  static validateAssistantData(data) {
    if (!data.firstName || !data.firstName.trim()) {
      throw new Error('First name is required');
    }

    if (!data.lastName || !data.lastName.trim()) {
      throw new Error('Last name is required');
    }

    if (!data.email || !data.email.trim()) {
      throw new Error('Email is required');
    }

    if (!AssistantService.isValidEmail(data.email.trim())) {
      throw new Error('Please enter a valid email address');
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
}

// Export individual methods for convenience
export const createAssistant = AssistantService.createAssistant;
export const getAllAssistants = AssistantService.getAllAssistants;
export const deleteAssistant = AssistantService.deleteAssistant;
export const updateAssistant = AssistantService.updateAssistant;
export const getAssistantById = AssistantService.getAssistantById;
export const toggleAssistantStatus = AssistantService.toggleAssistantStatus;
export const resetAssistantPassword = AssistantService.resetAssistantPassword;
export const assignCustomer = AssistantService.assignCustomer;
export const unassignCustomer = AssistantService.unassignCustomer;

export default AssistantService;