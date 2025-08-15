import { apiHelpers, API_ENDPOINTS, handleApiError } from './api';

class MessageService {
  /**
   * Get messages with filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.status - Filter by status (unread, read, replied)
   * @param {string} params.priority - Filter by priority (low, medium, high)
   * @param {string} params.search - Search query
   * @param {string} params.sortBy - Sort field (date, priority, status)
   * @param {string} params.sortOrder - Sort order (asc, desc)
   * @returns {Promise<Object>} Messages list with pagination
   */
  async getMessages(params = {}) {
    try {
      const response = await apiHelpers.get(API_ENDPOINTS.MESSAGES.LIST, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          status: params.status,
          priority: params.priority,
          search: params.search,
          sortBy: params.sortBy || 'createdAt',
          sortOrder: params.sortOrder || 'desc'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      
      // Development fallback with mock data
      if (process.env.NODE_ENV === 'development') {
        return {
          messages: this.getMockMessages(),
          pagination: {
            page: params.page || 1,
            limit: params.limit || 10,
            total: 5,
            totalPages: 1
          }
        };
      }
      
      throw handleApiError(error);
    }
  }

  /**
   * Get message by ID
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} Message details
   */
  async getMessageById(messageId) {
    try {
      const response = await apiHelpers.get(`${API_ENDPOINTS.MESSAGES.DETAIL}/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching message:', error);
      
      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        const mockMessages = this.getMockMessages();
        const message = mockMessages.find(msg => msg.id === messageId);
        return { message: message || mockMessages[0] };
      }
      
      throw handleApiError(error);
    }
  }

  /**
   * Mark message as read
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} Updated message
   */
  async markAsRead(messageId) {
    try {
      const response = await apiHelpers.put(`${API_ENDPOINTS.MESSAGES.MARK_READ}/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Error marking message as read:', error);
      
      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        return { success: true, messageId };
      }
      
      throw handleApiError(error);
    }
  }

  /**
   * Mark multiple messages as read
   * @param {Array} messageIds - Array of message IDs
   * @returns {Promise<Object>} Update result
   */
  async markMultipleAsRead(messageIds) {
    try {
      const response = await apiHelpers.put(API_ENDPOINTS.MESSAGES.MARK_READ_BULK, {
        messageIds
      });
      return response.data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      
      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        return { success: true, updatedCount: messageIds.length };
      }
      
      throw handleApiError(error);
    }
  }

  /**
   * Send reply to message
   * @param {string} messageId - Message ID
   * @param {Object} replyData - Reply data
   * @param {string} replyData.content - Reply content
   * @returns {Promise<Object>} Reply result
   */
  async sendReply(messageId, replyData) {
    try {
      const response = await apiHelpers.post(`${API_ENDPOINTS.MESSAGES.REPLY}/${messageId}`, {
        content: replyData.content
      });
      return response.data;
    } catch (error) {
      console.error('Error sending reply:', error);
      
      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          reply: {
            id: Date.now().toString(),
            messageId,
            content: replyData.content,
            createdAt: new Date().toISOString(),
            isFromCustomer: false
          }
        };
      }
      
      throw handleApiError(error);
    }
  }

  /**
   * Get message statistics for dashboard
   * @returns {Promise<Object>} Message statistics
   */
  async getMessageStats() {
    try {
      const response = await apiHelpers.get(API_ENDPOINTS.MESSAGES.STATS);
      return response.data;
    } catch (error) {
      console.error('Error fetching message stats:', error);
      
      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        return {
          total: 5,
          unread: 2,
          replied: 2,
          highPriority: 1
        };
      }
      
      throw handleApiError(error);
    }
  }

  /**
   * Update message priority
   * @param {string} messageId - Message ID
   * @param {string} priority - New priority (low, medium, high)
   * @returns {Promise<Object>} Update result
   */
  async updatePriority(messageId, priority) {
    try {
      const response = await apiHelpers.put(`${API_ENDPOINTS.MESSAGES.UPDATE_PRIORITY}/${messageId}`, {
        priority
      });
      return response.data;
    } catch (error) {
      console.error('Error updating message priority:', error);
      
      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        return { success: true, messageId, priority };
      }
      
      throw handleApiError(error);
    }
  }

  /**
   * Delete message
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteMessage(messageId) {
    try {
      const response = await apiHelpers.delete(`${API_ENDPOINTS.MESSAGES.DELETE}/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting message:', error);
      
      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        return { success: true, messageId };
      }
      
      throw handleApiError(error);
    }
  }

  /**
   * Get recent messages for dashboard overview
   * @param {number} limit - Number of messages to fetch
   * @returns {Promise<Object>} Recent messages
   */
  async getRecentMessages(limit = 5) {
    try {
      const response = await apiHelpers.get(API_ENDPOINTS.MESSAGES.RECENT, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent messages:', error);
      
      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        return {
          messages: this.getMockMessages().slice(0, limit)
        };
      }
      
      throw handleApiError(error);
    }
  }

  /**
   * Create new message (for customers)
   * @param {Object} messageData - Message data
   * @param {string} messageData.subject - Message subject
   * @param {string} messageData.content - Message content
   * @param {string} messageData.priority - Message priority (low, medium, high)
   * @returns {Promise<Object>} Created message
   */
  async createMessage(messageData) {
    try {
      const response = await apiHelpers.post(API_ENDPOINTS.MESSAGES.CREATE, {
        subject: messageData.subject,
        content: messageData.content,
        priority: messageData.priority || 'medium'
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating message:', error);
      
      // Development fallback - return mock success
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          message: {
            id: Date.now().toString(),
            subject: messageData.subject,
            content: messageData.content,
            priority: messageData.priority || 'medium',
            status: 'unread',
            createdAt: new Date().toISOString(),
            customerId: 'mock-customer-123',
            customerName: 'Current Customer'
          }
        };
      }
      
      throw handleApiError(error);
    }
  }

  /**
   * Get customer conversations (threaded view)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Customer conversations
   */
  async getCustomerConversations(params = {}) {
    try {
      const response = await apiHelpers.get(API_ENDPOINTS.MESSAGES.CUSTOMER_CONVERSATIONS, {
        params
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching customer conversations:', error);
      
      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        return {
          conversations: [
            {
              id: 'conv-1',
              subject: 'Order Status Inquiry',
              lastMessage: 'Thank you for your help!',
              status: 'replied',
              priority: 'medium',
              messageCount: 3,
              createdAt: '2024-01-15T10:30:00Z',
              updatedAt: '2024-01-15T14:20:00Z',
              assistantName: 'Sarah Johnson'
            },
            {
              id: 'conv-2',
              subject: 'Product Return Request',
              lastMessage: 'I would like to return this item...',
              status: 'unread',
              priority: 'high',
              messageCount: 1,
              createdAt: '2024-01-16T09:15:00Z',
              updatedAt: '2024-01-16T09:15:00Z',
              assistantName: 'Mike Chen'
            }
          ],
          pagination: {
            total: 2,
            page: 1,
            totalPages: 1
          }
        };
      }
      
      throw handleApiError(error);
    }
  }

  /**
   * Get conversation thread by ID
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Object>} Conversation thread with all messages
   */
  async getConversationThread(conversationId) {
    try {
      const response = await apiHelpers.get(`${API_ENDPOINTS.MESSAGES.DETAIL}/${conversationId}/thread`);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation thread:', error);
      
      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        return {
          conversation: {
            id: conversationId,
            subject: 'Order Status Inquiry',
            priority: 'medium',
            status: 'replied',
            createdAt: '2024-01-15T10:30:00Z',
            messages: [
              {
                id: 'msg-1',
                content: 'Hello, I need help with my recent order. The tracking shows it was delivered but I never received it.',
                isFromCustomer: true,
                createdAt: '2024-01-15T10:30:00Z',
                sender: 'Customer'
              },
              {
                id: 'msg-2', 
                content: 'Hi! I understand your concern about the missing package. Let me look into this for you. Could you please provide your order number?',
                isFromCustomer: false,
                createdAt: '2024-01-15T11:15:00Z',
                sender: 'Sarah Johnson'
              },
              {
                id: 'msg-3',
                content: 'My order number is #ORD-2024-0145. Thank you for your help!',
                isFromCustomer: true,
                createdAt: '2024-01-15T14:20:00Z',
                sender: 'Customer'
              }
            ]
          }
        };
      }
      
      throw handleApiError(error);
    }
  }

  /**
   * Get assistant information for customer
   * @returns {Promise<Object>} Assigned assistant details
   */
  async getAssignedAssistant() {
    try {
      const response = await apiHelpers.get(API_ENDPOINTS.MESSAGES.ASSIGNED_ASSISTANT);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching assigned assistant:', error);
      
      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        return {
          assistant: {
            id: 'asst-1',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@company.com',
            avatar: null,
            department: 'Customer Support',
            availability: 'available',
            responseTime: '< 2 hours'
          }
        };
      }
      
      throw handleApiError(error);
    }
  }

  /**
   * Search messages with advanced filters
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Search results
   */
  async searchMessages(searchParams) {
    try {
      const response = await apiHelpers.get(API_ENDPOINTS.MESSAGES.SEARCH, {
        params: searchParams
      });
      return response.data;
    } catch (error) {
      console.error('Error searching messages:', error);
      
      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        return {
          messages: this.getMockMessages().filter(msg => 
            msg.subject.toLowerCase().includes((searchParams.query || '').toLowerCase())
          ),
          total: 1
        };
      }
      
      throw handleApiError(error);
    }
  }

  /**
   * Get mock messages for development
   * @returns {Array} Mock messages array
   */
  getMockMessages() {
    return [
      {
        id: '1',
        customerId: 'cust-123',
        customerName: 'John Doe',
        customerEmail: 'john.doe@email.com',
        subject: 'Order Status Inquiry',
        content: 'Hello, I wanted to check on the status of my recent order #ORD-2024-0123. It has been a few days since I placed it and I haven\'t received any updates.',
        status: 'unread',
        priority: 'medium',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        replies: []
      },
      {
        id: '2',
        customerId: 'cust-456',
        customerName: 'Jane Smith',
        customerEmail: 'jane.smith@email.com',
        subject: 'Product Return Request',
        content: 'I received my order but the item is damaged. I would like to initiate a return and get a replacement. The product was a wireless headphone set.',
        status: 'replied',
        priority: 'high',
        createdAt: '2024-01-14T14:20:00Z',
        updatedAt: '2024-01-14T16:45:00Z',
        replies: [
          {
            id: 'reply-1',
            content: 'I understand your concern about the damaged item. I\'ll process a return for you right away. You should receive a return label via email within the next hour.',
            isFromCustomer: false,
            createdAt: '2024-01-14T16:45:00Z',
            sender: 'Support Team'
          }
        ]
      },
      {
        id: '3',
        customerId: 'cust-789',
        customerName: 'Mike Johnson',
        customerEmail: 'mike.j@email.com',
        subject: 'Account Access Issue',
        content: 'I\'m having trouble logging into my account. I keep getting an error message saying my credentials are invalid, but I\'m sure I\'m using the correct email and password.',
        status: 'unread',
        priority: 'high',
        createdAt: '2024-01-16T09:15:00Z',
        updatedAt: '2024-01-16T09:15:00Z',
        replies: []
      },
      {
        id: '4',
        customerId: 'cust-101',
        customerName: 'Sarah Wilson',
        customerEmail: 'sarah.wilson@email.com',
        subject: 'Billing Question',
        content: 'I noticed an unexpected charge on my credit card statement from your company. Could you please help me understand what this charge is for?',
        status: 'replied',
        priority: 'medium',
        createdAt: '2024-01-13T11:00:00Z',
        updatedAt: '2024-01-13T15:30:00Z',
        replies: [
          {
            id: 'reply-2',
            content: 'Thank you for reaching out. I\'ve reviewed your account and can see the charge you\'re referring to. This was for the premium subscription you activated on January 10th.',
            isFromCustomer: false,
            createdAt: '2024-01-13T15:30:00Z',
            sender: 'Billing Team'
          }
        ]
      },
      {
        id: '5',
        customerId: 'cust-202',
        customerName: 'David Brown',
        customerEmail: 'david.brown@email.com',
        subject: 'Feature Request',
        content: 'I love using your platform! I was wondering if you could add a dark mode theme option. It would be great for late-night usage.',
        status: 'read',
        priority: 'low',
        createdAt: '2024-01-12T16:45:00Z',
        updatedAt: '2024-01-12T16:45:00Z',
        replies: []
      }
    ];
  }
}

// Add these endpoints to your existing API_ENDPOINTS configuration
// Usually in services/api.js or similar file

const MESSAGES_ENDPOINTS = {
  MESSAGES: {
    LIST: '/api/messages',                    // GET - List messages with filters
    DETAIL: '/api/messages',                  // GET /:id - Get message details
    CREATE: '/api/messages',                  // POST - Create new message (customers)
    STATS: '/api/messages/stats',             // GET - Get message statistics
    MARK_READ: '/api/messages/read',          // PUT /:id - Mark single message as read
    MARK_READ_BULK: '/api/messages/read-bulk', // PUT - Mark multiple messages as read
    REPLY: '/api/messages/reply',             // POST /:id - Send reply to message
    UPDATE_PRIORITY: '/api/messages/priority', // PUT /:id - Update message priority
    DELETE: '/api/messages',                  // DELETE /:id - Delete message
    SEARCH: '/api/messages/search',           // GET - Advanced message search
    RECENT: '/api/messages/recent',           // GET - Get recent messages for dashboard
    
    // Customer-specific endpoints
    CUSTOMER_CONVERSATIONS: '/api/customers/messages/conversations', // GET - Customer's conversations
    ASSIGNED_ASSISTANT: '/api/customers/assigned-assistant',          // GET - Get assigned assistant info
    
    // Thread/conversation endpoints
    THREAD: '/api/messages/thread',           // GET /:id/thread - Get conversation thread
    CONVERSATION_HISTORY: '/api/messages/conversations' // GET - Get all conversations for user
  }
};

// If you're using a single API_ENDPOINTS object, merge it like this:
// export const API_ENDPOINTS = {
//   ...existingEndpoints,
//   ...MESSAGES_ENDPOINTS
// };

export { MESSAGES_ENDPOINTS };

// Export the service instance
const messageService = new MessageService();
export default messageService;