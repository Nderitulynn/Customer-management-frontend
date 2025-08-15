import { apiHelpers, API_ENDPOINTS, handleApiError } from './api';

/**
 * Assistant Service for School Project
 * Handles assistant management operations (Admin Only)
 * Complete CRUD operations for assistant management
 */
export class AssistantService {
  
  /**
   * Get all assistants
   * @returns {Promise<Array>} Array of transformed assistant objects
   */
  static async getAllAssistants() {
    try {
      const response = await apiHelpers.get(API_ENDPOINTS.USERS.ASSISTANTS.LIST);
      const assistants = response && response.data ? response.data : response;
      
      return Array.isArray(assistants) 
        ? assistants.map(assistant => AssistantService.transformAssistantData(assistant))
        : [];
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch assistants');
    }
  }

  /**
   * Get assistant by ID
   * @param {string} assistantId - The assistant ID
   * @returns {Promise<Object>} Transformed assistant object
   */
  static async getAssistantById(assistantId) {
    try {
      const response = await apiHelpers.get(
        API_ENDPOINTS.USERS.ASSISTANTS.GET(assistantId)
      );
      
      const assistant = response && response.data ? response.data : response;
      return AssistantService.transformAssistantData(assistant);
      
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch assistant');
    }
  }

  /**
   * Create new assistant
   * @param {Object} assistantData - Assistant data to create
   * @returns {Promise<Object>} Created assistant with tempPassword
   */
  static async createAssistant(assistantData) {
    try {
      // Validate input data
      const validation = AssistantService.validateAssistantData(assistantData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

    const payload = {
  firstName: assistantData.firstName?.trim(),
  lastName: assistantData.lastName?.trim(),
  email: assistantData.email?.toLowerCase()?.trim()
};

// Only include password if provided
if (assistantData.password?.trim()) {
  payload.password = assistantData.password.trim();
}

      const response = await apiHelpers.post('/api/users/assistants', payload);
      
      // Fix: Extract the complete response to preserve tempPassword
      const responseData = response && response.data ? response.data : response;
      
      // The backend sends the complete assistant object WITH tempPassword at top level
      // Transform the data to ensure tempPassword is preserved
      const transformedAssistant = AssistantService.transformAssistantData(responseData);
      
      return transformedAssistant;
      
    } catch (error) {
      throw handleApiError(error, 'Failed to create assistant');
    }
  }

  /**
   * Update assistant
   * @param {string} assistantId - The assistant ID to update
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated assistant object
   */
  static async updateAssistant(assistantId, updateData) {
    try {
      // Validate input data
      const validation = AssistantService.validateAssistantData(updateData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      const payload = {
        firstName: updateData.firstName?.trim(),
        lastName: updateData.lastName?.trim(),
        email: updateData.email?.toLowerCase()?.trim(),
        isActive: updateData.isActive
      };

      const response = await apiHelpers.put(
        API_ENDPOINTS.USERS.ASSISTANTS.UPDATE(assistantId), 
        payload
      );
      
      const updatedAssistant = response && response.data ? response.data : response;
      return AssistantService.transformAssistantData(updatedAssistant);
      
    } catch (error) {
      throw handleApiError(error, 'Failed to update assistant');
    }
  }

  /**
   * Delete assistant
   * @param {string} assistantId - The assistant ID to delete
   * @returns {Promise<Object>} Delete confirmation
   */
  static async deleteAssistant(assistantId) {
    try {
      const response = await apiHelpers.delete(
        API_ENDPOINTS.USERS.ASSISTANTS.DELETE(assistantId)
      );
      
      return response && response.data ? response.data : response;
      
    } catch (error) {
      throw handleApiError(error, 'Failed to delete assistant');
    }
  }

  /**
   * Reset assistant password
   * @param {string} assistantId - The assistant ID
   * @returns {Promise<Object>} Assistant with new password
   */
  static async resetPassword(assistantId) {
    try {
      const response = await apiHelpers.put(
        API_ENDPOINTS.USERS.ASSISTANTS.RESET_PASSWORD(assistantId)
      );
      
      const resetData = response && response.data ? response.data : response;
      return AssistantService.transformAssistantData(resetData);
      
    } catch (error) {
      throw handleApiError(error, 'Failed to reset password');
    }
  }

  /**
   * Toggle assistant active status
   * @param {string} assistantId - The assistant ID
   * @param {boolean} isActive - New active status
   * @returns {Promise<Object>} Updated assistant
   */
  static async toggleActiveStatus(assistantId, isActive) {
    try {
      const response = await apiHelpers.put(
        API_ENDPOINTS.USERS.ASSISTANTS.UPDATE(assistantId),
        { isActive }
      );
      
      const updatedAssistant = response && response.data ? response.data : response;
      return AssistantService.transformAssistantData(updatedAssistant);
      
    } catch (error) {
      throw handleApiError(error, 'Failed to update assistant status');
    }
  }

  /**
   * Transform assistant data for consistent frontend usage
   * @param {Object} assistant - Raw assistant data from backend
   * @returns {Object} Transformed assistant object
   */
  static transformAssistantData(assistant) {
    if (!assistant) return null;

    return {
      id: assistant._id || assistant.id,
      firstName: assistant.firstName || '',
      lastName: assistant.lastName || '',
      fullName: assistant.fullName || `${assistant.firstName || ''} ${assistant.lastName || ''}`.trim(),
      email: assistant.email || '',
      role: assistant.role || 'assistant',
      isActive: assistant.isActive !== undefined ? assistant.isActive : true,
      lastLogin: assistant.lastLogin || null,
      mustChangePassword: assistant.mustChangePassword || false,
      createdAt: assistant.createdAt || null,
      updatedAt: assistant.updatedAt || null,
      createdBy: assistant.createdBy || null,
      
      // Fix: Properly handle both tempPassword (new assistant) and newPassword (reset)
      tempPassword: assistant.tempPassword || null,  // For newly created assistants
      newPassword: assistant.newPassword || null     // For password resets
    };
  }

  /**
   * Validate assistant data
   * @param {Object} assistantData - Data to validate
   * @returns {Object} Validation result with isValid and errors
   */
  static validateAssistantData(assistantData) {
    const errors = {};

    // Validate first name
    if (!assistantData.firstName?.trim()) {
      errors.firstName = 'First name is required';
    } else if (assistantData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    } else if (assistantData.firstName.trim().length > 50) {
      errors.firstName = 'First name must not exceed 50 characters';
    }

    // Validate last name
    if (!assistantData.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    } else if (assistantData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    } else if (assistantData.lastName.trim().length > 50) {
      errors.lastName = 'Last name must not exceed 50 characters';
    }

    // Validate email
    if (!assistantData.email?.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(assistantData.email.trim())) {
        errors.email = 'Please enter a valid email address';
      } else if (assistantData.email.trim().length > 255) {
        errors.email = 'Email must not exceed 255 characters';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Format assistant for display
   * @param {Object} assistant - Assistant object
   * @returns {Object} Formatted assistant for UI display
   */
  static formatAssistantForDisplay(assistant) {
    if (!assistant) return null;

    return {
      ...assistant,
      statusText: assistant.isActive ? 'Active' : 'Inactive',
      lastLoginText: assistant.lastLogin 
        ? new Date(assistant.lastLogin).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'Never',
      createdText: assistant.createdAt 
        ? new Date(assistant.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        : 'Unknown',
      updatedText: assistant.updatedAt 
        ? new Date(assistant.updatedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        : 'Never'
    };
  }

  /**
   * Search assistants by name or email
   * @param {Array} assistants - Array of assistants to search
   * @param {string} searchTerm - Search term
   * @returns {Array} Filtered assistants
   */
  static searchAssistants(assistants, searchTerm) {
    if (!searchTerm || !Array.isArray(assistants)) {
      return assistants || [];
    }

    const term = searchTerm.toLowerCase().trim();
    
    return assistants.filter(assistant => 
      assistant.firstName?.toLowerCase().includes(term) ||
      assistant.lastName?.toLowerCase().includes(term) ||
      assistant.fullName?.toLowerCase().includes(term) ||
      assistant.email?.toLowerCase().includes(term)
    );
  }

  /**
   * Sort assistants by specified field
   * @param {Array} assistants - Array of assistants to sort
   * @param {string} sortBy - Field to sort by
   * @param {string} sortOrder - Sort order ('asc' or 'desc')
   * @returns {Array} Sorted assistants
   */
  static sortAssistants(assistants, sortBy = 'fullName', sortOrder = 'asc') {
    if (!Array.isArray(assistants)) {
      return [];
    }

    return [...assistants].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      // Convert to string for comparison
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();

      if (sortOrder === 'desc') {
        return bValue.localeCompare(aValue);
      }
      return aValue.localeCompare(bValue);
    });
  }

  /**
   * Get assistant statistics
   * @param {Array} assistants - Array of assistants
   * @returns {Object} Statistics object
   */
  static getAssistantStats(assistants) {
    if (!Array.isArray(assistants)) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        mustChangePassword: 0,
        recentLogins: 0
      };
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    return {
      total: assistants.length,
      active: assistants.filter(a => a.isActive).length,
      inactive: assistants.filter(a => !a.isActive).length,
      mustChangePassword: assistants.filter(a => a.mustChangePassword).length,
      recentLogins: assistants.filter(a => 
        a.lastLogin && new Date(a.lastLogin) >= thirtyDaysAgo
      ).length
    };
  }
}