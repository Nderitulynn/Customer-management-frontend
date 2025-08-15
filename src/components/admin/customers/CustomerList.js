import { useState, useEffect } from 'react';

// Simple CustomerService to match the other files
const CustomerService = {
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  },

  async getCustomers() {
    try {
      const response = await fetch('/api/customers', {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      throw new Error(`Failed to fetch customers: ${error.message}`);
    }
  },

  async createCustomer(customerData) {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(customerData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  },

  async updateCustomer(customerId, customerData) {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(customerData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to update customer: ${error.message}`);
    }
  },

  async deleteCustomer(customerId) {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to delete customer: ${error.message}`);
    }
  }
};

export const CustomerList = {
  /**
   * Simple search customers by name or email
   * @param {Array} customers - Array of customers to search
   * @param {string} searchTerm - Search term
   * @returns {Array} Filtered customers
   */
  searchCustomers: (customers, searchTerm) => {
    if (!searchTerm || !Array.isArray(customers)) {
      return customers || [];
    }

    const term = searchTerm.toLowerCase().trim();
    
    return customers.filter(customer => 
      customer.fullName?.toLowerCase().includes(term) ||
      customer.email?.toLowerCase().includes(term)
    );
  },

  /**
   * Format date for display
   * @param {string} dateString - Date string
   * @returns {string} Formatted date
   */
  formatDate: (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  },

  /**
   * Get basic customer statistics
   * @param {Array} customers - Array of customers
   * @returns {Object} Basic statistics
   */
  getStats: (customers) => {
    if (!Array.isArray(customers)) {
      return { totalCustomers: 0 };
    }

    return {
      totalCustomers: customers.length
    };
  }
};

// Simple React hook for customer list management
export const useCustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load customers from API
  const loadCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await CustomerService.getCustomers();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (err) {
      setError(err.message);
      setCustomers([]);
      setFilteredCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Update search term and filter customers
  const updateSearch = (term) => {
    setSearchTerm(term);
    const filtered = CustomerList.searchCustomers(customers, term);
    setFilteredCustomers(filtered);
  };

  // Delete customer
  const deleteCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      await CustomerService.deleteCustomer(customerId);
      setSuccessMessage('Customer deleted successfully!');
      await loadCustomers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Get basic stats
  const stats = CustomerList.getStats(customers);

  // Load customers on mount
  useEffect(() => {
    loadCustomers();
  }, []);

  // Update filtered customers when customers change
  useEffect(() => {
    const filtered = CustomerList.searchCustomers(customers, searchTerm);
    setFilteredCustomers(filtered);
  }, [customers, searchTerm]);

  return {
    // Data
    customers: filteredCustomers,
    allCustomers: customers,
    stats,
    
    // State
    loading,
    error,
    successMessage,
    searchTerm,
    
    // Actions
    loadCustomers,
    updateSearch,
    deleteCustomer
  };
};

export { CustomerService };
export default CustomerList;