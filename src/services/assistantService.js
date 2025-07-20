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
      const response = await apiHelpers.get(API_ENDPOINTS.USERS.LIST);
      
      // Filter only assistants from the response
      const users = Array.isArray(response) ? response : response.users || [];
      
      return users
        .filter(user => user.role === 'assistant')
        .map(AssistantService.transformAssistantData);
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
        email: assistantData.email.trim().toLowerCase(),
        role: 'assistant'
      };

      const response = await apiHelpers.post(API_ENDPOINTS.USERS.CREATE, payload);
      
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

      await apiHelpers.delete(API_ENDPOINTS.USERS.DELETE(id));
      
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
      if (updateData.email) payload.email = updateData.email.trim().toLowerCase();

      const response = await apiHelpers.put(API_ENDPOINTS.USERS.UPDATE(id), payload);
      
      return AssistantService.transformAssistantData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update assistant'));
    }
  }

  /**
   * Get assistant by ID
   * @param {string} id - Assistant ID
   * @returns {Promise<Object>} Assistant data
   */
  static async getAssistantById(id) {
    try {
      if (!id) {
        throw new Error('Assistant ID is required');
      }

      const response = await apiHelpers.get(`${API_ENDPOINTS.USERS.BASE}/${id}`);
      
      if (response.role !== 'assistant') {
        throw new Error('User is not an assistant');
      }

      return AssistantService.transformAssistantData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch assistant'));
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
      createdAt: assistant.createdAt || null,
      updatedAt: assistant.updatedAt || null
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
// This allows importing like: import { deleteAssistant } from './assistantService'
export const createAssistant = AssistantService.createAssistant;
export const getAllAssistants = AssistantService.getAllAssistants;
export const deleteAssistant = AssistantService.deleteAssistant;
export const updateAssistant = AssistantService.updateAssistant;
export const getAssistantById = AssistantService.getAssistantById;

export default AssistantService;