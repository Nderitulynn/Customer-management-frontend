import { apiHelpers as api, API_ENDPOINTS, handleApiError } from './apiService';

// Assistant Service - Handles all assistant-related API operations
export class AssistantService {
  
  // Get all assistants
  static async getAllAssistants() {
    try {
      const response = await api.get(API_ENDPOINTS.USERS.LIST);
      
      // Filter only assistants from the response
      const assistants = Array.isArray(response) ? response : response.users || [];
      
      return assistants
        .filter(user => user.role === 'assistant')
        .map(this.transformAssistantData);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch assistants'));
    }
  }

  // Create a new assistant
  static async createAssistant(assistantData) {
    try {
      // Validate required fields
      this.validateAssistantData(assistantData);

      const payload = {
        firstName: assistantData.firstName.trim(),
        lastName: assistantData.lastName.trim(),
        email: assistantData.email.trim().toLowerCase(),
        role: 'assistant' // Ensure role is always assistant
      };

      const response = await api.post(API_ENDPOINTS.USERS.CREATE, payload);
      
      return {
        success: true,
        message: 'Assistant created successfully',
        assistant: this.transformAssistantData(response.assistant || response),
        tempPassword: response.tempPassword // For displaying to admin
      };
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to create assistant'));
    }
  }

  // Update an existing assistant
  static async updateAssistant(id, updateData) {
    try {
      if (!id) {
        throw new Error('Assistant ID is required');
      }

      // Prepare update payload (only include fields that can be updated)
      const payload = {};
      
      if (updateData.firstName) payload.firstName = updateData.firstName.trim();
      if (updateData.lastName) payload.lastName = updateData.lastName.trim();
      if (updateData.email) payload.email = updateData.email.trim().toLowerCase();
      if (updateData.phone) payload.phone = updateData.phone.trim();
      if (updateData.avatar) payload.avatar = updateData.avatar;

      const response = await api.put(API_ENDPOINTS.USERS.UPDATE(id), payload);
      
      return {
        success: true,
        message: 'Assistant updated successfully',
        assistant: this.transformAssistantData(response.assistant || response)
      };
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update assistant'));
    }
  }

  // Delete an assistant
  static async deleteAssistant(id) {
    try {
      if (!id) {
        throw new Error('Assistant ID is required');
      }

      await api.delete(API_ENDPOINTS.USERS.DELETE(id));
      
      return {
        success: true,
        message: 'Assistant deleted successfully'
      };
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to delete assistant'));
    }
  }

  // Toggle assistant status (active/inactive)
  static async toggleAssistantStatus(id) {
    try {
      if (!id) {
        throw new Error('Assistant ID is required');
      }

      const response = await api.put(`${API_ENDPOINTS.USERS.UPDATE(id)}/status`);
      
      return {
        success: true,
        message: `Assistant ${response.isActive ? 'activated' : 'deactivated'} successfully`,
        assistant: this.transformAssistantData(response.assistant || response)
      };
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to toggle assistant status'));
    }
  }

  // Reset assistant password
  static async resetAssistantPassword(id) {
    try {
      if (!id) {
        throw new Error('Assistant ID is required');
      }

      const response = await api.put(`${API_ENDPOINTS.USERS.UPDATE(id)}/reset-password`);
      
      return {
        success: true,
        message: 'Password reset successfully. New password sent to assistant email.',
        tempPassword: response.tempPassword // For admin notification
      };
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to reset assistant password'));
    }
  }

  // Get assistant by ID
  static async getAssistantById(id) {
    try {
      if (!id) {
        throw new Error('Assistant ID is required');
      }

      const response = await api.get(`${API_ENDPOINTS.USERS.BASE}/${id}`);
      
      if (response.role !== 'assistant') {
        throw new Error('User is not an assistant');
      }

      return {
        success: true,
        assistant: this.transformAssistantData(response)
      };
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch assistant'));
    }
  }

  // Get assistant statistics
  static async getAssistantStats(id) {
    try {
      if (!id) {
        throw new Error('Assistant ID is required');
      }

      // This would need corresponding backend endpoint
      const response = await api.get(`${API_ENDPOINTS.USERS.BASE}/${id}/stats`);
      
      return {
        success: true,
        stats: response
      };
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch assistant statistics'));
    }
  }

  // Search assistants
  static async searchAssistants(query, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (query) params.append('search', query);
      if (filters.status) params.append('status', filters.status);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      
      const response = await api.get(`${API_ENDPOINTS.USERS.LIST}?${params.toString()}`);
      
      const assistants = Array.isArray(response) ? response : response.users || [];
      
      return assistants
        .filter(user => user.role === 'assistant')
        .map(this.transformAssistantData);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to search assistants'));
    }
  }

  // Bulk operations
  static async bulkUpdateAssistants(assistantIds, updateData) {
    try {
      if (!Array.isArray(assistantIds) || assistantIds.length === 0) {
        throw new Error('Assistant IDs array is required');
      }

      const payload = {
        assistantIds,
        updateData
      };

      const response = await api.put(`${API_ENDPOINTS.USERS.BASE}/bulk-update`, payload);
      
      return {
        success: true,
        message: `${assistantIds.length} assistants updated successfully`,
        assistants: response.assistants?.map(this.transformAssistantData) || []
      };
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update assistants'));
    }
  }

  // Export assistants data
  static async exportAssistants(format = 'csv') {
    try {
      const response = await api.get(`${API_ENDPOINTS.USERS.BASE}/export?format=${format}`, {
        responseType: 'blob'
      });

      // Create download link
      const blob = new Blob([response], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `assistants_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: 'Assistants data exported successfully'
      };
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to export assistants data'));
    }
  }

  // Transform assistant data for UI consistency
  static transformAssistantData(assistant) {
    if (!assistant) return null;

    return {
      id: assistant.id || assistant._id,
      firstName: assistant.firstName || '',
      lastName: assistant.lastName || '',
      email: assistant.email || '',
      phone: assistant.phone || '',
      avatar: assistant.avatar || null,
      role: assistant.role || 'assistant',
      isActive: assistant.isActive ?? true,
      customerCount: assistant.customerCount || 0,
      activeChats: assistant.activeChats || 0,
      lastLogin: assistant.lastLogin || null,
      createdAt: assistant.createdAt || new Date().toISOString(),
      updatedAt: assistant.updatedAt || new Date().toISOString(),
      mustChangePassword: assistant.mustChangePassword || false,
      fullName: `${assistant.firstName || ''} ${assistant.lastName || ''}`.trim(),
      initials: this.getInitials(assistant.firstName, assistant.lastName),
      status: assistant.isActive ? 'active' : 'inactive',
      statusColor: assistant.isActive ? 'green' : 'red',
      lastLoginFormatted: assistant.lastLogin ? new Date(assistant.lastLogin).toLocaleDateString() : 'Never'
    };
  }

  // Validate assistant data
  static validateAssistantData(data) {
    const errors = [];

    if (!data.firstName?.trim()) {
      errors.push('First name is required');
    }

    if (!data.lastName?.trim()) {
      errors.push('Last name is required');
    }

    if (!data.email?.trim()) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(data.email.trim())) {
      errors.push('Please enter a valid email address');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  // Email validation helper
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Get initials helper
  static getInitials(firstName, lastName) {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return `${first}${last}`;
  }

  // Format date helper
  static formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  }

  // Format time helper
  static formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  }
}

// Export individual functions for convenience
export const {
  getAllAssistants,
  createAssistant,
  updateAssistant,
  deleteAssistant,
  toggleAssistantStatus,
  resetAssistantPassword,
  getAssistantById,
  getAssistantStats,
  searchAssistants,
  bulkUpdateAssistants,
  exportAssistants
} = AssistantService;

export default AssistantService;