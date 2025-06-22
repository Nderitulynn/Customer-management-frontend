import { apiHelpers, API_ENDPOINTS, handleApiError } from './api';

/**
 * Order Service
 * Handles all order-related API operations
 */
class OrderService {
  /**
   * Get all orders with pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.search - Search term
   * @param {string} params.status - Order status filter
   * @param {string} params.priority - Order priority filter
   * @param {string} params.customerId - Filter by customer ID
   * @param {string} params.dateFrom - Start date filter
   * @param {string} params.dateTo - End date filter
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortOrder - Sort order (asc/desc)
   * @returns {Promise<Object>} Paginated order list
   */
  async getOrders(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.search && { search: params.search }),
        ...(params.status && { status: params.status }),
        ...(params.priority && { priority: params.priority }),
        ...(params.customerId && { customerId: params.customerId }),
        ...(params.dateFrom && { dateFrom: params.dateFrom }),
        ...(params.dateTo && { dateTo: params.dateTo }),
        ...(params.sortBy && { sortBy: params.sortBy }),
        ...(params.sortOrder && { sortOrder: params.sortOrder }),
      });

      const response = await apiHelpers.get(`${API_ENDPOINTS.ORDERS.LIST}?${queryParams}`);
      
      return {
        orders: response.data || [],
        pagination: {
          currentPage: response.currentPage || 1,
          totalPages: response.totalPages || 1,
          totalItems: response.totalItems || 0,
          hasNextPage: response.hasNextPage || false,
          hasPrevPage: response.hasPrevPage || false,
        },
        summary: {
          totalRevenue: response.summary?.totalRevenue || 0,
          averageOrderValue: response.summary?.averageOrderValue || 0,
          statusCounts: response.summary?.statusCounts || {},
        }
      };
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch orders'));
    }
  }

  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Order data
   */
  async getOrderById(orderId) {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const response = await apiHelpers.get(API_ENDPOINTS.ORDERS.GET(orderId));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch order details'));
    }
  }

  /**
   * Create new order
   * @param {Object} orderData - Order information
   * @param {string} orderData.customerId - Customer ID
   * @param {Array} orderData.items - Order items
   * @param {Object} orderData.pricing - Pricing information
   * @param {Object} orderData.delivery - Delivery information
   * @param {string} orderData.notes - Order notes
   * @returns {Promise<Object>} Created order data
   */
  async createOrder(orderData) {
    try {
      // Validate required fields
      this.validateOrderData(orderData);

      const response = await apiHelpers.post(API_ENDPOINTS.ORDERS.CREATE, orderData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to create order'));
    }
  }

  /**
   * Update existing order
   * @param {string} orderId - Order ID
   * @param {Object} orderData - Updated order information
   * @returns {Promise<Object>} Updated order data
   */
  async updateOrder(orderId, orderData) {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      // Validate data if provided
      if (Object.keys(orderData).length > 0) {
        this.validateOrderData(orderData, false); // partial validation
      }

      const response = await apiHelpers.put(API_ENDPOINTS.ORDERS.UPDATE(orderId), orderData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update order'));
    }
  }

  /**
   * Delete order
   * @param {string} orderId - Order ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteOrder(orderId) {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      await apiHelpers.delete(API_ENDPOINTS.ORDERS.DELETE(orderId));
      return true;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to delete order'));
    }
  }

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} status - New status
   * @param {string} notes - Status change notes
   * @returns {Promise<Object>} Updated order
   */
  async updateOrderStatus(orderId, status, notes = '') {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const validStatuses = [
        'pending', 'confirmed', 'in_progress', 'ready', 
        'shipped', 'delivered', 'completed', 'cancelled', 'refunded'
      ];

      if (!validStatuses.includes(status)) {
        throw new Error('Invalid order status');
      }

      const response = await apiHelpers.patch(
        API_ENDPOINTS.ORDERS.UPDATE_STATUS(orderId),
        { status, notes }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update order status'));
    }
  }

  /**
   * Get orders by customer ID
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
        `${API_ENDPOINTS.ORDERS.CUSTOMER_ORDERS(customerId)}?${queryParams}`
      );
      
      return response.data || [];
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch customer orders'));
    }
  }

  /**
   * Get order status history
   * @param {string} orderId - Order ID
   * @returns {Promise<Array>} Status history
   */
  async getOrderStatusHistory(orderId) {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const response = await apiHelpers.get(`${API_ENDPOINTS.ORDERS.GET(orderId)}/status-history`);
      return response.data || [];
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch order status history'));
    }
  }

  /**
   * Add order note
   * @param {string} orderId - Order ID
   * @param {Object} noteData - Note data
   * @param {string} noteData.content - Note content
   * @param {string} noteData.type - Note type (internal, customer)
   * @param {boolean} noteData.isVisible - Visible to customer
   * @returns {Promise<Object>} Created note
   */
  async addOrderNote(orderId, noteData) {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      if (!noteData.content || noteData.content.trim() === '') {
        throw new Error('Note content is required');
      }

      const response = await apiHelpers.post(
        `${API_ENDPOINTS.ORDERS.GET(orderId)}/notes`,
        noteData
      );
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to add order note'));
    }
  }

  /**
   * Get order notes
   * @param {string} orderId - Order ID
   * @returns {Promise<Array>} Order notes
   */
  async getOrderNotes(orderId) {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const response = await apiHelpers.get(`${API_ENDPOINTS.ORDERS.GET(orderId)}/notes`);
      return response.data || [];
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch order notes'));
    }
  }

  /**
   * Upload order attachments
   * @param {string} orderId - Order ID
   * @param {FileList} files - Files to upload
   * @param {Function} onProgress - Upload progress callback
   * @returns {Promise<Array>} Uploaded file information
   */
  async uploadOrderAttachments(orderId, files, onProgress = null) {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      if (!files || files.length === 0) {
        throw new Error('Files are required');
      }

      const formData = new FormData();
      Array.from(files).forEach((file, index) => {
        formData.append(`files`, file);
      });

      const response = await apiHelpers.uploadFile(
        `${API_ENDPOINTS.ORDERS.GET(orderId)}/attachments`,
        formData,
        onProgress
      );

      return response.data || [];
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to upload order attachments'));
    }
  }

  /**
   * Get order attachments
   * @param {string} orderId - Order ID
   * @returns {Promise<Array>} Order attachments
   */
  async getOrderAttachments(orderId) {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const response = await apiHelpers.get(`${API_ENDPOINTS.ORDERS.GET(orderId)}/attachments`);
      return response.data || [];
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch order attachments'));
    }
  }

  /**
   * Delete order attachment
   * @param {string} orderId - Order ID
   * @param {string} attachmentId - Attachment ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteOrderAttachment(orderId, attachmentId) {
    try {
      if (!orderId || !attachmentId) {
        throw new Error('Order ID and Attachment ID are required');
      }

      await apiHelpers.delete(`${API_ENDPOINTS.ORDERS.GET(orderId)}/attachments/${attachmentId}`);
      return true;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to delete order attachment'));
    }
  }

  /**
   * Calculate order pricing
   * @param {Object} orderData - Order data for calculation
   * @param {Array} orderData.items - Order items
   * @param {Object} orderData.delivery - Delivery information
   * @param {Object} orderData.discounts - Applied discounts
   * @returns {Promise<Object>} Calculated pricing
   */
  async calculateOrderPricing(orderData) {
    try {
      if (!orderData.items || orderData.items.length === 0) {
        throw new Error('Order items are required for pricing calculation');
      }

      const response = await apiHelpers.post(
        `${API_ENDPOINTS.ORDERS.BASE}/calculate-pricing`,
        orderData
      );

      return {
        subtotal: response.data.subtotal || 0,
        tax: response.data.tax || 0,
        delivery: response.data.delivery || 0,
        discount: response.data.discount || 0,
        total: response.data.total || 0,
        breakdown: response.data.breakdown || [],
      };
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to calculate order pricing'));
    }
  }

  /**
   * Get order statistics
   * @param {Object} filters - Date and other filters
   * @returns {Promise<Object>} Order statistics
   */
  async getOrderStatistics(filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.status && { status: filters.status }),
        ...(filters.customerId && { customerId: filters.customerId }),
      });

      const response = await apiHelpers.get(`${API_ENDPOINTS.ORDERS.BASE}/statistics?${queryParams}`);
      
      return {
        totalOrders: response.data.totalOrders || 0,
        totalRevenue: response.data.totalRevenue || 0,
        averageOrderValue: response.data.averageOrderValue || 0,
        statusBreakdown: response.data.statusBreakdown || {},
        dailyStats: response.data.dailyStats || [],
        topProducts: response.data.topProducts || [],
        conversionRate: response.data.conversionRate || 0,
      };
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch order statistics'));
    }
  }

  /**
   * Duplicate order
   * @param {string} orderId - Order ID to duplicate
   * @param {Object} modifications - Modifications to apply
   * @returns {Promise<Object>} New order data
   */
  async duplicateOrder(orderId, modifications = {}) {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const response = await apiHelpers.post(
        `${API_ENDPOINTS.ORDERS.GET(orderId)}/duplicate`,
        modifications
      );
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to duplicate order'));
    }
  }

  /**
   * Export orders
   * @param {Object} exportParams - Export parameters
   * @param {string} exportParams.format - Export format (csv, excel, pdf)
   * @param {Array} exportParams.fields - Fields to export
   * @param {Object} exportParams.filters - Export filters
   * @returns {Promise<Blob>} Export file
   */
  async exportOrders(exportParams = {}) {
    try {
      const params = {
        format: exportParams.format || 'csv',
        fields: exportParams.fields || ['orderNumber', 'customer', 'total', 'status', 'createdAt'],
        ...exportParams.filters,
      };

      const response = await apiHelpers.post(
        `${API_ENDPOINTS.ORDERS.BASE}/export`,
        params,
        { responseType: 'blob' }
      );

      return response;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to export orders'));
    }
  }

  /**
   * Generate order invoice
   * @param {string} orderId - Order ID
   * @param {Object} options - Invoice options
   * @returns {Promise<Blob>} Invoice PDF
   */
  async generateOrderInvoice(orderId, options = {}) {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const response = await apiHelpers.post(
        `${API_ENDPOINTS.ORDERS.GET(orderId)}/invoice`,
        options,
        { responseType: 'blob' }
      );

      return response;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to generate order invoice'));
    }
  }

  /**
   * Update order priority
   * @param {string} orderId - Order ID
   * @param {string} priority - New priority (low, normal, high, urgent)
   * @returns {Promise<Object>} Updated order
   */
  async updateOrderPriority(orderId, priority) {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const validPriorities = ['low', 'normal', 'high', 'urgent'];
      if (!validPriorities.includes(priority)) {
        throw new Error('Invalid order priority');
      }

      const response = await apiHelpers.patch(
        `${API_ENDPOINTS.ORDERS.GET(orderId)}/priority`,
        { priority }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update order priority'));
    }
  }

  /**
   * Get order delivery tracking
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Delivery tracking information
   */
  async getOrderDeliveryTracking(orderId) {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const response = await apiHelpers.get(`${API_ENDPOINTS.ORDERS.GET(orderId)}/tracking`);
      return response.data || {};
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch delivery tracking'));
    }
  }

  /**
   * Update delivery information
   * @param {string} orderId - Order ID
   * @param {Object} deliveryData - Delivery information
   * @returns {Promise<Object>} Updated order
   */
  async updateOrderDelivery(orderId, deliveryData) {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const response = await apiHelpers.patch(
        `${API_ENDPOINTS.ORDERS.GET(orderId)}/delivery`,
        deliveryData
      );
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update order delivery'));
    }
  }

  /**
   * Validate order data
   * @param {Object} orderData - Order data to validate
   * @param {boolean} isComplete - Whether to validate all required fields
   * @throws {Error} Validation error
   */
  validateOrderData(orderData, isComplete = true) {
    const errors = [];

    // Required fields validation (for complete validation)
    if (isComplete) {
      if (!orderData.customerId) {
        errors.push('Customer ID is required');
      }

      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        errors.push('Order items are required');
      }
    }

    // Items validation
    if (orderData.items && Array.isArray(orderData.items)) {
      orderData.items.forEach((item, index) => {
        if (!item.productId) {
          errors.push(`Product ID is required for item ${index + 1}`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Valid quantity is required for item ${index + 1}`);
        }
        if (!item.price || item.price < 0) {
          errors.push(`Valid price is required for item ${index + 1}`);
        }
      });
    }

    // Pricing validation
    if (orderData.pricing) {
      if (orderData.pricing.total < 0) {
        errors.push('Order total cannot be negative');
      }
    }

    // Delivery date validation
    if (orderData.delivery && orderData.delivery.expectedDate) {
      const deliveryDate = new Date(orderData.delivery.expectedDate);
      const today = new Date();
      if (deliveryDate < today) {
        errors.push('Delivery date cannot be in the past');
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }
}

// Create and export service instance
const orderService = new OrderService();
export default orderService;