// src/services/orderService.js - FRONTEND SERVICE FOR API CALLS

import authService from './authService';

class OrderService {
  constructor() {
    this.baseURL = '/api/orders';
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
   * Get all orders with optional search and filtering
   */
  async getAllOrders(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.customerId) queryParams.append('customerId', params.customerId);

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
      return data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  /**
   * Get single order by ID
   */
  async getOrderById(orderId) {
    try {
      const response = await fetch(`${this.baseURL}/${orderId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  /**
   * Create new order
   * Required fields: customerId, items, orderTotal
   */
  async createOrder(orderData) {
    try {
      if (!orderData.customerId) {
        throw new Error('Customer ID is required');
      }
      
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new Error('Items array is required and cannot be empty');
      }
      
      if (!orderData.orderTotal || orderData.orderTotal <= 0) {
        throw new Error('Order total is required and must be greater than 0');
      }

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Update existing order
   */
  async updateOrder(orderId, updateData) {
    try {
      const response = await fetch(`${this.baseURL}/${orderId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  /**
   * Delete order (soft delete)
   */
  async deleteOrder(orderId) {
    try {
      const response = await fetch(`${this.baseURL}/${orderId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

  /**
   * Get orders for specific customer
   */
  async getCustomerOrders(customerId) {
    try {
      const response = await fetch(`${this.baseURL}/customer/${customerId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      throw error;
    }
  }

  /**
   * Update order status only
   */
  async updateOrderStatus(orderId, status) {
    try {
      if (!status) {
        throw new Error('Status is required');
      }

      const response = await fetch(`${this.baseURL}/${orderId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Update order payment information
   */
  async updateOrderPayment(orderId, paymentData) {
    try {
      const { paymentAmount, paymentStatus } = paymentData;
      
      if (!paymentAmount && !paymentStatus) {
        throw new Error('Payment amount or payment status is required');
      }

      const response = await fetch(`${this.baseURL}/${orderId}/payment`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ paymentAmount, paymentStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating order payment:', error);
      throw error;
    }
  }

  /**
   * Get order dashboard statistics
   */
  async getDashboardStats() {
    try {
      const response = await fetch(`${this.baseURL}/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      throw error;
    }
  }

  /**
   * Get recent order activity (for admin dashboard)
   */
  async getRecentActivity() {
    try {
      const response = await fetch(`${this.baseURL}/activity`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }

  /**
   * Helper method to get order status options
   */
  getOrderStatusOptions() {
    return [
      { value: 'pending', label: 'Pending' },
      { value: 'confirmed', label: 'Confirmed' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' }
    ];
  }

  /**
   * Helper method to get payment status options
   */
  getPaymentStatusOptions() {
    return [
      { value: 'pending', label: 'Pending' },
      { value: 'partial', label: 'Partial' },
      { value: 'paid', label: 'Paid' }
    ];
  }

  /**
   * Helper method to format order data for display
   */
  formatOrderForDisplay(order) {
    return {
      ...order,
      formattedTotal: new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES'
      }).format(order.orderTotal || 0),
      formattedDate: new Date(order.createdAt).toLocaleDateString('en-KE'),
      customerName: order.customerId?.fullName || 'Unknown Customer',
      customerEmail: order.customerId?.email || '',
      assignedToName: order.assignedTo?.name || 'Unassigned'
    };
  }
}

export default new OrderService();