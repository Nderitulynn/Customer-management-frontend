import { apiHelpers, API_ENDPOINTS, handleApiError } from './api';

/**
 * Order Service for School Project
 * Handles core order management operations
 * Simple CRUD operations for order data
 */
export class OrderService {
  
  /**
   * Get all orders with basic pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.search - Search term
   * @param {string} params.status - Order status filter
   * @returns {Promise<Object>} Paginated order list
   */
  static async getAllOrders(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.search && { search: params.search }),
        ...(params.status && { status: params.status }),
      });

      const response = await apiHelpers.get(`${API_ENDPOINTS.ORDERS.LIST}?${queryParams}`);
      
      return {
        orders: response.data || [],
        pagination: {
          currentPage: response.currentPage || 1,
          totalPages: response.totalPages || 1,
          totalItems: response.totalItems || 0,
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
  static async getOrderById(orderId) {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const response = await apiHelpers.get(API_ENDPOINTS.ORDERS.GET(orderId));
      return this.transformOrderData(response.data);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch order details'));
    }
  }

  /**
   * Create new order
   * @param {Object} orderData - Order information
   * @param {string} orderData.customerId - Customer ID
   * @param {Array} orderData.items - Order items
   * @param {number} orderData.totalAmount - Total amount
   * @param {string} orderData.status - Order status (default: 'pending')
   * @param {string} orderData.notes - Order notes
   * @returns {Promise<Object>} Created order data
   */
  static async createOrder(orderData) {
    try {
      // Validate required fields
      this.validateOrderData(orderData);

      // Set default status if not provided
      const orderToCreate = {
        ...orderData,
        status: orderData.status || 'pending',
        orderDate: new Date().toISOString()
      };

      const response = await apiHelpers.post(API_ENDPOINTS.ORDERS.CREATE, orderToCreate);
      return this.transformOrderData(response.data);
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
  static async updateOrder(orderId, orderData) {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      // Validate data if provided
      if (Object.keys(orderData).length > 0) {
        this.validateOrderData(orderData, false); // partial validation
      }

      const response = await apiHelpers.put(API_ENDPOINTS.ORDERS.UPDATE(orderId), orderData);
      return this.transformOrderData(response.data);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update order'));
    }
  }

  /**
   * Delete order
   * @param {string} orderId - Order ID
   * @returns {Promise<boolean>} Success status
   */
  static async deleteOrder(orderId) {
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
   * Validate order data
   * @param {Object} orderData - Order data to validate
   * @param {boolean} isComplete - Whether to validate all required fields
   * @throws {Error} Validation error
   */
  static validateOrderData(orderData, isComplete = true) {
    const errors = [];

    // Required fields validation (for complete validation)
    if (isComplete) {
      if (!orderData.customerId) {
        errors.push('Customer ID is required');
      }

      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        errors.push('Order items are required');
      }

      if (!orderData.totalAmount || orderData.totalAmount <= 0) {
        errors.push('Valid total amount is required');
      }
    }

    // Items validation
    if (orderData.items && Array.isArray(orderData.items)) {
      orderData.items.forEach((item, index) => {
        if (!item.productName) {
          errors.push(`Product name is required for item ${index + 1}`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Valid quantity is required for item ${index + 1}`);
        }
        if (!item.price || item.price < 0) {
          errors.push(`Valid price is required for item ${index + 1}`);
        }
      });
    }

    // Status validation
    if (orderData.status) {
      const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
      if (!validStatuses.includes(orderData.status)) {
        errors.push('Invalid order status');
      }
    }

    // Total amount validation
    if (orderData.totalAmount !== undefined && orderData.totalAmount < 0) {
      errors.push('Total amount cannot be negative');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  /**
   * Transform order data for consistent format
   * @param {Object} orderData - Raw order data
   * @returns {Object} Transformed order data
   */
  static transformOrderData(orderData) {
    if (!orderData) return null;

    return {
      id: orderData.id,
      orderId: orderData.orderId || orderData.id,
      customerId: orderData.customerId,
      customerName: orderData.customer?.fullName || orderData.customerName,
      items: orderData.items || [],
      totalAmount: parseFloat(orderData.totalAmount) || 0,
      status: orderData.status,
      notes: orderData.notes || '',
      orderDate: orderData.orderDate,
      createdAt: orderData.createdAt,
      updatedAt: orderData.updatedAt
    };
  }
}

// Individual exports for flexible importing
export const getAllOrders = OrderService.getAllOrders;
export const getOrderById = OrderService.getOrderById;
export const createOrder = OrderService.createOrder;
export const updateOrder = OrderService.updateOrder;
export const deleteOrder = OrderService.deleteOrder;

export default OrderService;