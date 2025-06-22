import api from './api';

/**
 * WhatsApp Service
 * Handles WhatsApp Business API integration for messaging and chat management
 */
class WhatsAppService {
  constructor() {
    this.baseURL = '/api/whatsapp';
  }

  // ================== Chat Management ==================

  /**
   * Get all WhatsApp chats with pagination and filters
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with chats list
   */
  async getChats(params = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        assigned_to,
        customer_id,
        unread_only,
        search
      } = params;

      const response = await api.get(`${this.baseURL}/chats`, {
        params: {
          page,
          limit,
          ...(status && { status }),
          ...(assigned_to && { assigned_to }),
          ...(customer_id && { customer_id }),
          ...(unread_only && { unread_only }),
          ...(search && { search })
        }
      });

      return {
        success: true,
        data: response.data.chats,
        pagination: response.data.pagination,
        message: 'Chats fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching chats:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch chats',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get specific chat conversation with messages
   * @param {string} chatId - Chat ID
   * @param {Object} params - Query parameters for messages
   * @returns {Promise} API response with chat and messages
   */
  async getChatConversation(chatId, params = {}) {
    try {
      const { page = 1, limit = 50 } = params;

      const response = await api.get(`${this.baseURL}/chats/${chatId}`, {
        params: { page, limit }
      });

      return {
        success: true,
        data: {
          chat: response.data.chat,
          messages: response.data.messages,
          pagination: response.data.pagination
        },
        message: 'Chat conversation fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching chat conversation:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch chat conversation',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Update chat status or assignment
   * @param {string} chatId - Chat ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise} API response
   */
  async updateChat(chatId, updates) {
    try {
      const response = await api.patch(`${this.baseURL}/chats/${chatId}`, updates);

      return {
        success: true,
        data: response.data.chat,
        message: 'Chat updated successfully'
      };
    } catch (error) {
      console.error('Error updating chat:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to update chat',
        error: error.response?.data || error.message
      };
    }
  }

  // ================== Message Management ==================

  /**
   * Send a WhatsApp message
   * @param {Object} messageData - Message information
   * @returns {Promise} API response
   */
  async sendMessage(messageData) {
    try {
      const {
        to,
        type = 'text',
        content,
        template_id,
        chat_id,
        attachments = []
      } = messageData;

      const formData = new FormData();
      formData.append('to', to);
      formData.append('type', type);
      formData.append('content', content);
      
      if (template_id) {
        formData.append('template_id', template_id);
      }
      
      if (chat_id) {
        formData.append('chat_id', chat_id);
      }

      // Handle file attachments
      attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });

      const response = await api.post(`${this.baseURL}/messages/send`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        success: true,
        data: response.data.message,
        message: 'Message sent successfully'
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to send message',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get message history for a specific phone number
   * @param {string} phoneNumber - Phone number
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  async getMessageHistory(phoneNumber, params = {}) {
    try {
      const { page = 1, limit = 50, date_from, date_to } = params;

      const response = await api.get(`${this.baseURL}/messages/history/${phoneNumber}`, {
        params: {
          page,
          limit,
          ...(date_from && { date_from }),
          ...(date_to && { date_to })
        }
      });

      return {
        success: true,
        data: response.data.messages,
        pagination: response.data.pagination,
        message: 'Message history fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching message history:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch message history',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Mark messages as read
   * @param {string} chatId - Chat ID
   * @param {Array} messageIds - Array of message IDs
   * @returns {Promise} API response
   */
  async markAsRead(chatId, messageIds = []) {
    try {
      const response = await api.patch(`${this.baseURL}/chats/${chatId}/read`, {
        message_ids: messageIds
      });

      return {
        success: true,
        data: response.data,
        message: 'Messages marked as read'
      };
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to mark messages as read',
        error: error.response?.data || error.message
      };
    }
  }

  // ================== Quick Responses & Templates ==================

  /**
   * Get all quick response templates
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  async getQuickResponses(params = {}) {
    try {
      const { category, search, is_active = true } = params;

      const response = await api.get(`${this.baseURL}/templates`, {
        params: {
          ...(category && { category }),
          ...(search && { search }),
          is_active
        }
      });

      return {
        success: true,
        data: response.data.templates,
        message: 'Quick responses fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching quick responses:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch quick responses',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Create a new quick response template
   * @param {Object} templateData - Template information
   * @returns {Promise} API response
   */
  async createQuickResponse(templateData) {
    try {
      const response = await api.post(`${this.baseURL}/templates`, templateData);

      return {
        success: true,
        data: response.data.template,
        message: 'Quick response created successfully'
      };
    } catch (error) {
      console.error('Error creating quick response:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to create quick response',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Update a quick response template
   * @param {string} templateId - Template ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise} API response
   */
  async updateQuickResponse(templateId, updates) {
    try {
      const response = await api.patch(`${this.baseURL}/templates/${templateId}`, updates);

      return {
        success: true,
        data: response.data.template,
        message: 'Quick response updated successfully'
      };
    } catch (error) {
      console.error('Error updating quick response:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to update quick response',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Delete a quick response template
   * @param {string} templateId - Template ID
   * @returns {Promise} API response
   */
  async deleteQuickResponse(templateId) {
    try {
      await api.delete(`${this.baseURL}/templates/${templateId}`);

      return {
        success: true,
        message: 'Quick response deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting quick response:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to delete quick response',
        error: error.response?.data || error.message
      };
    }
  }

  // ================== Broadcast Messages ==================

  /**
   * Send broadcast message to multiple contacts
   * @param {Object} broadcastData - Broadcast information
   * @returns {Promise} API response
   */
  async sendBroadcast(broadcastData) {
    try {
      const {
        recipients = [],
        message,
        template_id,
        schedule_time,
        attachments = []
      } = broadcastData;

      const formData = new FormData();
      formData.append('recipients', JSON.stringify(recipients));
      formData.append('message', message);
      
      if (template_id) {
        formData.append('template_id', template_id);
      }
      
      if (schedule_time) {
        formData.append('schedule_time', schedule_time);
      }

      // Handle file attachments
      attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });

      const response = await api.post(`${this.baseURL}/broadcast`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        success: true,
        data: response.data.broadcast,
        message: 'Broadcast message sent successfully'
      };
    } catch (error) {
      console.error('Error sending broadcast:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to send broadcast',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get broadcast history
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  async getBroadcastHistory(params = {}) {
    try {
      const { page = 1, limit = 20, status, date_from, date_to } = params;

      const response = await api.get(`${this.baseURL}/broadcast/history`, {
        params: {
          page,
          limit,
          ...(status && { status }),
          ...(date_from && { date_from }),
          ...(date_to && { date_to })
        }
      });

      return {
        success: true,
        data: response.data.broadcasts,
        pagination: response.data.pagination,
        message: 'Broadcast history fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching broadcast history:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch broadcast history',
        error: error.response?.data || error.message
      };
    }
  }

  // ================== Analytics & Statistics ==================

  /**
   * Get WhatsApp analytics and statistics
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  async getAnalytics(params = {}) {
    try {
      const {
        date_from,
        date_to,
        assistant_id,
        metric_type = 'overview'
      } = params;

      const response = await api.get(`${this.baseURL}/analytics`, {
        params: {
          ...(date_from && { date_from }),
          ...(date_to && { date_to }),
          ...(assistant_id && { assistant_id }),
          metric_type
        }
      });

      return {
        success: true,
        data: response.data.analytics,
        message: 'Analytics fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch analytics',
        error: error.response?.data || error.message
      };
    }
  }

  // ================== Contact Management ==================

  /**
   * Sync WhatsApp contacts
   * @returns {Promise} API response
   */
  async syncContacts() {
    try {
      const response = await api.post(`${this.baseURL}/contacts/sync`);

      return {
        success: true,
        data: response.data,
        message: 'Contacts synced successfully'
      };
    } catch (error) {
      console.error('Error syncing contacts:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to sync contacts',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get contact information
   * @param {string} phoneNumber - Phone number
   * @returns {Promise} API response
   */
  async getContactInfo(phoneNumber) {
    try {
      const response = await api.get(`${this.baseURL}/contacts/${phoneNumber}`);

      return {
        success: true,
        data: response.data.contact,
        message: 'Contact information fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching contact info:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch contact information',
        error: error.response?.data || error.message
      };
    }
  }

  // ================== WebSocket for Real-time Updates ==================

  /**
   * Initialize WebSocket connection for real-time chat updates
   * @param {Function} onMessage - Callback for new messages
   * @param {Function} onStatusUpdate - Callback for status updates
   * @returns {WebSocket} WebSocket instance
   */
  initializeWebSocket(onMessage, onStatusUpdate) {
    try {
      const token = localStorage.getItem('token');
      const wsUrl = `${process.env.REACT_APP_WS_URL}/whatsapp?token=${token}`;
      
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WhatsApp WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'new_message':
              onMessage && onMessage(data.payload);
              break;
            case 'message_status':
              onStatusUpdate && onStatusUpdate(data.payload);
              break;
            case 'chat_update':
              onStatusUpdate && onStatusUpdate(data.payload);
              break;
            default:
              console.log('Unknown WebSocket message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WhatsApp WebSocket disconnected');
      };

      ws.onerror = (error) => {
        console.error('WhatsApp WebSocket error:', error);
      };

      return ws;
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      throw error;
    }
  }

  // ================== File & Media Management ==================

  /**
   * Upload media file for WhatsApp
   * @param {File} file - File to upload
   * @param {string} type - Media type (image, document, audio, video)
   * @returns {Promise} API response
   */
  async uploadMedia(file, type = 'image') {
    try {
      const formData = new FormData();
      formData.append('media', file);
      formData.append('type', type);

      const response = await api.post(`${this.baseURL}/media/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        success: true,
        data: response.data.media,
        message: 'Media uploaded successfully'
      };
    } catch (error) {
      console.error('Error uploading media:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to upload media',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get media file URL
   * @param {string} mediaId - Media ID
   * @returns {Promise} API response
   */
  async getMediaUrl(mediaId) {
    try {
      const response = await api.get(`${this.baseURL}/media/${mediaId}`);

      return {
        success: true,
        data: response.data.url,
        message: 'Media URL fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching media URL:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch media URL',
        error: error.response?.data || error.message
      };
    }
  }
}

// Create and export singleton instance
const whatsappService = new WhatsAppService();
export default whatsappService;