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

export const useCustomerData = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load customers from API
  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await CustomerService.getCustomers();
      setCustomers(data);
    } catch (err) {
      setError(err.message);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Create new customer
  const createCustomer = async (customerData) => {
    try {
      await CustomerService.createCustomer(customerData);
      setSuccessMessage('Customer created successfully!');
      await fetchCustomers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Update existing customer
  const updateCustomer = async (customerId, customerData) => {
    try {
      await CustomerService.updateCustomer(customerId, customerData);
      setSuccessMessage('Customer updated successfully!');
      await fetchCustomers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Delete customer
  const deleteCustomer = async (customerId) => {    
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      await CustomerService.deleteCustomer(customerId);
      setSuccessMessage('Customer deleted successfully!');
      await fetchCustomers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Get basic customer statistics
  const getCustomerStats = () => {
    if (!Array.isArray(customers)) {
      return { totalCustomers: 0 };
    }

    return {
      totalCustomers: customers.length
    };
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Load customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    // Data
    customers,
    stats: getCustomerStats(),
    
    // State
    loading,
    error,
    successMessage,
    
    // Actions
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    
    // Utilities
    formatDate
  };
};

export default useCustomerData;