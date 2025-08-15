import { apiHelpers, API_ENDPOINTS, handleApiError } from './api.js';

class InvoiceService {
  
  // Get all invoices with optional filtering
  static async getAllInvoices(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const url = queryParams.toString() 
        ? `${API_ENDPOINTS.INVOICES.LIST}?${queryParams.toString()}`
        : API_ENDPOINTS.INVOICES.LIST;
        
      return await apiHelpers.get(url);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
  
  // Get single invoice by ID
  static async getInvoiceById(invoiceId) {
    try {
      return await apiHelpers.get(API_ENDPOINTS.INVOICES.GET(invoiceId));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
  
  // Create new manual invoice
  static async createInvoice(invoiceData) {
    try {
      return await apiHelpers.post(API_ENDPOINTS.INVOICES.CREATE, invoiceData);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
  
  // Create invoice from existing order
  static async createInvoiceFromOrder(orderId, additionalData = {}) {
    try {
      return await apiHelpers.post(API_ENDPOINTS.INVOICES.FROM_ORDER(orderId), additionalData);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
  
  // Update invoice
  static async updateInvoice(invoiceId, updateData) {
    try {
      return await apiHelpers.put(API_ENDPOINTS.INVOICES.UPDATE(invoiceId), updateData);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
  
  // Update invoice status only
  static async updateInvoiceStatus(invoiceId, status) {
    try {
      return await apiHelpers.patch(API_ENDPOINTS.INVOICES.UPDATE_STATUS(invoiceId), { status });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
  
  // Delete invoice
  static async deleteInvoice(invoiceId) {
    try {
      return await apiHelpers.delete(API_ENDPOINTS.INVOICES.DELETE(invoiceId));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
  
  // Get invoice statistics
  static async getInvoiceStats() {
    try {
      return await apiHelpers.get(API_ENDPOINTS.INVOICES.STATS);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
  
  // Utility functions for frontend
  
  // Get available invoice status options
  static getInvoiceStatusOptions() {
    return [
      { value: 'draft', label: 'Draft', color: 'gray' },
      { value: 'sent', label: 'Sent', color: 'blue' },
      { value: 'paid', label: 'Paid', color: 'green' },
      { value: 'overdue', label: 'Overdue', color: 'red' },
      { value: 'cancelled', label: 'Cancelled', color: 'red' }
    ];
  }
  
  // Get status badge color for UI
  static getStatusBadgeColor(status) {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }
  
  // Check if invoice is overdue
  static isInvoiceOverdue(invoice) {
    if (invoice.status === 'paid' || invoice.status === 'cancelled') {
      return false;
    }
    return new Date(invoice.dueDate) < new Date();
  }
  
  // Calculate days until due
  static getDaysUntilDue(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  
  // Format currency for display
  static formatCurrency(amount, currency = 'KES') {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount || 0);
  }
  
  // Format date for display
  static formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    };
    
    return new Date(date).toLocaleDateString('en-KE', defaultOptions);
  }
  
  // Format datetime for display
  static formatDateTime(date) {
    return new Date(date).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Generate invoice number preview
  static generateInvoiceNumberPreview() {
    const timestamp = Date.now().toString().slice(-6);
    return `INV-${timestamp}`;
  }
  
  // Validate invoice data on frontend
  static validateInvoiceData(invoiceData) {
    const errors = [];
    
    if (!invoiceData.customerId) {
      errors.push('Please select a customer');
    }
    
    if (!invoiceData.items || invoiceData.items.length === 0) {
      errors.push('Invoice must have at least one item');
    }
    
    if (invoiceData.items) {
      invoiceData.items.forEach((item, index) => {
        if (!item.productName?.trim()) {
          errors.push(`Item ${index + 1}: Product name is required`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
        }
        if (item.unitPrice === undefined || item.unitPrice < 0) {
          errors.push(`Item ${index + 1}: Unit price must be 0 or greater`);
        }
      });
    }
    
    if (invoiceData.dueDate && new Date(invoiceData.dueDate) < new Date()) {
      errors.push('Due date cannot be in the past');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Calculate totals for invoice items
  static calculateInvoiceTotals(items, taxRate = 0) {
    if (!items || items.length === 0) {
      return {
        subtotal: 0,
        taxAmount: 0,
        totalAmount: 0
      };
    }
    
    const subtotal = items.reduce((sum, item) => {
      const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
      return sum + lineTotal;
    }, 0);
    
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;
    
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100
    };
  }
  
  // Search/filter helper
  static buildSearchParams(filters) {
    const params = {};
    
    if (filters.search?.trim()) {
      params.search = filters.search.trim();
    }
    
    if (filters.status && filters.status !== 'all') {
      params.status = filters.status;
    }
    
    if (filters.customerId) {
      params.customerId = filters.customerId;
    }
    
    if (filters.dateFrom) {
      params.dateFrom = filters.dateFrom;
    }
    
    if (filters.dateTo) {
      params.dateTo = filters.dateTo;
    }
    
    if (filters.page) {
      params.page = filters.page;
    }
    
    if (filters.limit) {
      params.limit = filters.limit;
    }
    
    return params;
  }
  
  // Export invoice data (for potential CSV/Excel export)
  static exportInvoiceData(invoices) {
    return invoices.map(invoice => ({
      'Invoice Number': invoice.invoiceNumber,
      'Customer Name': invoice.customerName,
      'Customer Email': invoice.customerEmail,
      'Invoice Date': this.formatDate(invoice.invoiceDate),
      'Due Date': this.formatDate(invoice.dueDate),
      'Status': invoice.status,
      'Subtotal': invoice.subtotal,
      'Tax Amount': invoice.taxAmount,
      'Total Amount': invoice.totalAmount,
      'Created Date': this.formatDateTime(invoice.createdAt)
    }));
  }
}

export default InvoiceService;