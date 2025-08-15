// src/services/customerOrderService.js - FRONTEND SERVICE FOR CUSTOMER ORDER API CALLS

import authService from './authService';

class CustomerOrderService {
  constructor() {
    this.baseURL = '/api/customer-orders';
    console.log('🔧 CustomerOrderService initialized');
  }

  /**
   * Get authentication headers
   */
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      ...authService.getAuthHeader()
    };
  }

  /**
   * Get customer's own orders with pagination and search
   * GET /api/customer-orders
   */
  async getMyOrders(params = {}) {
    try {
      console.log('🔍 Fetching my orders with params:', params);
      
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const url = queryParams.toString() ? 
        `${this.baseURL}?${queryParams.toString()}` : 
        this.baseURL;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ My orders fetched successfully');
      
      // Handle both wrapped and direct responses
      return data.success ? data.data : data;
    } catch (error) {
      console.error('❌ Error fetching my orders:', error);
      throw new Error(`Failed to fetch your orders: ${error.message}`);
    }
  }

  /**
   * Get customer's order statistics for dashboard
   * GET /api/customer-orders/stats
   */
  async getMyOrderStats() {
    try {
      console.log('🔍 Fetching my order statistics...');
      
      const response = await fetch(`${this.baseURL}/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Order stats fetched successfully');
      
      // Handle both wrapped and direct responses
      return data.success ? data.data : data;
    } catch (error) {
      console.error('❌ Error fetching order stats:', error);
      throw new Error(`Failed to fetch order statistics: ${error.message}`);
    }
  }

  /**
   * Get customer's recent orders (last 5) for dashboard
   * GET /api/customer-orders/recent
   */
  async getMyRecentOrders() {
    try {
      console.log('🔍 Fetching my recent orders...');
      
      const response = await fetch(`${this.baseURL}/recent`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Recent orders fetched successfully');
      
      // Handle both wrapped and direct responses
      return data.success ? data.data : data;
    } catch (error) {
      console.error('❌ Error fetching recent orders:', error);
      throw new Error(`Failed to fetch recent orders: ${error.message}`);
    }
  }

  /**
   * Create new order for customer
   * POST /api/customer-orders
   */
  async createMyOrder(orderData) {
    try {
      console.log('🔍 Creating new order with data:', {
        itemsCount: orderData.items?.length || 0,
        orderTotal: orderData.orderTotal,
        hasNotes: !!orderData.notes
      });
      
      // Client-side validation
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new Error('At least one item is required');
      }
      
      // Validate each item
      orderData.items.forEach((item, index) => {
        if (!item.productName?.trim()) {
          throw new Error(`Product name is required for item ${index + 1}`);
        }
        if (!item.quantity || item.quantity < 1) {
          throw new Error(`Valid quantity is required for item ${index + 1}`);
        }
        if (!item.unitPrice || item.unitPrice <= 0) {
          throw new Error(`Valid unit price is required for item ${index + 1}`);
        }
      });
      
      if (!orderData.orderTotal || orderData.orderTotal <= 0) {
        throw new Error('Order total must be greater than 0');
      }

      // Prepare clean order data
      const cleanOrderData = {
        items: orderData.items.map(item => ({
          productName: item.productName.trim(),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice)
        })),
        orderTotal: Number(orderData.orderTotal),
        notes: orderData.notes?.trim() || ''
      };

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(cleanOrderData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Order created successfully:', data.orderNumber || data._id);
      
      // Handle both wrapped and direct responses
      return data.success ? data.data : data;
    } catch (error) {
      console.error('❌ Error creating order:', error);
      throw error; // Re-throw as-is since we've already formatted the message
    }
  }

  /**
   * Get specific order details with ownership check
   * GET /api/customer-orders/:orderId
   */
  async getMyOrderDetails(orderId) {
    try {
      console.log('🔍 Fetching order details for:', orderId);
      
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const response = await fetch(`${this.baseURL}/${orderId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 404) {
          throw new Error('Order not found');
        }
        if (response.status === 403) {
          throw new Error('You can only view your own orders');
        }
        
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Order details fetched successfully');
      
      // Handle both wrapped and direct responses
      return data.success ? data.data : data;
    } catch (error) {
      console.error('❌ Error fetching order details:', error);
      throw new Error(`Failed to fetch order details: ${error.message}`);
    }
  }

  /**
   * Cancel customer's own pending order
   * PUT /api/customer-orders/:orderId/cancel
   */
  async cancelMyOrder(orderId) {
    try {
      console.log('🔍 Cancelling order:', orderId);
      
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const response = await fetch(`${this.baseURL}/${orderId}/cancel`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 404) {
          throw new Error('Order not found');
        }
        if (response.status === 403) {
          throw new Error('You can only cancel your own orders');
        }
        if (response.status === 400) {
          throw new Error(errorData.error || 'Order cannot be cancelled');
        }
        
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Order cancelled successfully');
      
      // Handle both wrapped and direct responses
      return data.success ? data.data : data;
    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      throw new Error(`Failed to cancel order: ${error.message}`);
    }
  }

  /**
   * Get customer's orders filtered by status
   * GET /api/customer-orders/status/:status
   */
  async getMyOrdersByStatus(status, params = {}) {
    try {
      console.log('🔍 Fetching orders by status:', status);
      
      if (!status) {
        throw new Error('Status is required');
      }

      // Validate status
      const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled', 'on-hold'];
      if (!validStatuses.includes(status.toLowerCase())) {
        throw new Error(`Invalid status. Valid options: ${validStatuses.join(', ')}`);
      }

      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const url = queryParams.toString() ? 
        `${this.baseURL}/status/${status}?${queryParams.toString()}` : 
        `${this.baseURL}/status/${status}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Orders by status fetched successfully');
      
      // Handle both wrapped and direct responses
      return data.success ? data.data : data;
    } catch (error) {
      console.error('❌ Error fetching orders by status:', error);
      throw new Error(`Failed to fetch orders by status: ${error.message}`);
    }
  }

  /**
   * Create duplicate order based on existing order (reorder)
   * PUT /api/customer-orders/:orderId/reorder
   */
  async reorderOrder(orderId) {
    try {
      console.log('🔍 Reordering order:', orderId);
      
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const response = await fetch(`${this.baseURL}/${orderId}/reorder`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 404) {
          throw new Error('Original order not found');
        }
        if (response.status === 403) {
          throw new Error('You can only reorder your own orders');
        }
        
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Order reordered successfully');
      
      // Handle both wrapped and direct responses
      return data.success ? data.data : data;
    } catch (error) {
      console.error('❌ Error reordering:', error);
      throw new Error(`Failed to reorder: ${error.message}`);
    }
  }

  /**
   * Helper method to get order status options for dropdowns
   */
  getOrderStatusOptions() {
    return [
      { value: 'pending', label: 'Pending', color: 'yellow' },
      { value: 'confirmed', label: 'Confirmed', color: 'blue' },
      { value: 'in_progress', label: 'In Progress', color: 'orange' },
      { value: 'completed', label: 'Completed', color: 'green' },
      { value: 'cancelled', label: 'Cancelled', color: 'red' }
    ];
  }

  /**
   * Helper method to get payment status options for dropdowns
   */
  getPaymentStatusOptions() {
    return [
      { value: 'pending', label: 'Pending', color: 'yellow' },
      { value: 'partial', label: 'Partial Payment', color: 'orange' },
      { value: 'paid', label: 'Paid', color: 'green' },
      { value: 'refunded', label: 'Refunded', color: 'red' }
    ];
  }

  /**
   * Helper method to format order data for display
   */
  formatOrderForDisplay(order) {
    if (!order) return null;

    return {
      ...order,
      formattedTotal: this.formatCurrency(order.orderTotal || 0),
      formattedCreationDate: this.formatDate(order.creationDate || order.createdAt),
      formattedUpdatedDate: this.formatDate(order.updatedAt),
      itemsCount: order.items?.length || 0,
      statusDisplay: this.getStatusDisplay(order.status),
      paymentStatusDisplay: this.getStatusDisplay(order.paymentStatus, 'payment'),
      canBeCancelled: order.status === 'pending',
      canBeReordered: ['completed', 'cancelled'].includes(order.status),
      orderAge: this.calculateOrderAge(order.creationDate || order.createdAt)
    };
  }

  /**
   * Helper method to format currency amounts
   */
  formatCurrency(amount) {
    if (typeof amount !== 'number') {
      amount = parseFloat(amount) || 0;
    }
    
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Helper method to format dates consistently
   */
  formatDate(dateString, options = {}) {
    if (!dateString) return 'Not available';
    
    try {
      const date = new Date(dateString);
      const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options
      };
      
      return date.toLocaleDateString('en-US', defaultOptions);
    } catch (error) {
      console.error('❌ Error formatting date:', error);
      return 'Invalid date';
    }
  }

  /**
   * Helper method to get status display information
   */
  getStatusDisplay(status, type = 'order') {
    const orderStatuses = {
      pending: { label: 'Pending', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
      confirmed: { label: 'Confirmed', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
      in_progress: { label: 'In Progress', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
      completed: { label: 'Completed', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' },
      cancelled: { label: 'Cancelled', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' }
    };

    const paymentStatuses = {
      pending: { label: 'Payment Pending', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
      partial: { label: 'Partially Paid', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
      paid: { label: 'Paid', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' },
      refunded: { label: 'Refunded', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' }
    };

    const statusMap = type === 'payment' ? paymentStatuses : orderStatuses;
    
    return statusMap[status] || { 
      label: status || 'Unknown', 
      color: 'gray', 
      bgColor: 'bg-gray-100', 
      textColor: 'text-gray-800' 
    };
  }

  /**
   * Helper method to calculate order age in days
   */
  calculateOrderAge(creationDate) {
    if (!creationDate) return 0;
    
    try {
      const created = new Date(creationDate);
      const now = new Date();
      const diffTime = now - created;
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      console.error('❌ Error calculating order age:', error);
      return 0;
    }
  }

  /**
   * Helper method to calculate total from items array
   */
  calculateOrderTotal(items) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return 0;
    }
    
    return items.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      return total + (quantity * unitPrice);
    }, 0);
  }

  /**
   * Helper method to validate order data before submission
   */
  validateOrderData(orderData) {
    const errors = [];

    // Validate items
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      errors.push('At least one item is required');
    } else {
      orderData.items.forEach((item, index) => {
        if (!item.productName?.trim()) {
          errors.push(`Product name is required for item ${index + 1}`);
        }
        if (!item.quantity || item.quantity < 1) {
          errors.push(`Valid quantity (minimum 1) is required for item ${index + 1}`);
        }
        if (!item.unitPrice || item.unitPrice <= 0) {
          errors.push(`Valid unit price (greater than 0) is required for item ${index + 1}`);
        }
      });
    }

    // Validate order total
    if (!orderData.orderTotal || orderData.orderTotal <= 0) {
      errors.push('Order total must be greater than 0');
    }

    // Validate notes length if provided
    if (orderData.notes && orderData.notes.length > 500) {
      errors.push('Notes cannot exceed 500 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Helper method to create empty order item template
   */
  createEmptyOrderItem() {
    return {
      productName: '',
      quantity: 1,
      unitPrice: 0
    };
  }

  /**
   * Helper method to get time ago format for activity
   */
  getTimeAgo(timestamp) {
    if (!timestamp) return 'Unknown';
    
    try {
      const now = new Date();
      const past = new Date(timestamp);
      const diffInSeconds = Math.floor((now - past) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;
      
      const diffInWeeks = Math.floor(diffInDays / 7);
      if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
      
      const diffInMonths = Math.floor(diffInDays / 30);
      return `${diffInMonths}mo ago`;
    } catch (error) {
      console.error('❌ Error calculating time ago:', error);
      return 'Unknown';
    }
  }

  /**
   * Helper method to search orders
   */
  async searchMyOrders(searchTerm, params = {}) {
    return this.getMyOrders({ 
      search: searchTerm, 
      ...params 
    });
  }

  /**
   * Debug method to check service status
   */
  getServiceStatus() {
    return {
      baseURL: this.baseURL,
      isAuthenticated: authService.isAuthenticated(),
      authHeaders: this.getAuthHeaders(),
      timestamp: new Date().toISOString()
    };
  }
}

// Create and export service instance
const customerOrderService = new CustomerOrderService();
export default customerOrderService;