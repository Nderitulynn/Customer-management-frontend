import React, { useState, useEffect } from 'react';

const CustomerForm = ({ customerId = null, user, onSubmit, onCancel }) => {
  // Simplified state management
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    source: '',
    notes: '',
    status: 'active'
  });
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Mock API functions
  const mockApi = {
    getCustomer: (id) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Mock customer data
          const mockCustomer = {
            id: id,
            fullName: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            source: 'website',
            notes: 'Test customer',
            status: 'active'
          };
          resolve({ success: true, data: mockCustomer });
        }, 500);
      });
    },

    createCustomer: (data) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newCustomer = {
            ...data,
            id: Date.now(),
            assignedTo: user.role === 'assistant' ? user.id : null,
            createdAt: new Date().toISOString()
          };
          resolve({ success: true, data: newCustomer });
        }, 1000);
      });
    },

    updateCustomer: (id, data) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const updatedCustomer = {
            ...data,
            id: id,
            updatedAt: new Date().toISOString()
          };
          resolve({ success: true, data: updatedCustomer });
        }, 1000);
      });
    }
  };

  // Simple validation functions
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone) => {
    return /^[\+]?[1-9][\d]{3,14}$/.test(phone.replace(/\s/g, ''));
  };

  // Initialize form on component mount
  useEffect(() => {
    if (customerId) {
      loadCustomer();
    }
  }, [customerId]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const response = await mockApi.getCustomer(customerId);
      
      if (response.success) {
        setFormData({
          fullName: response.data.fullName || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          source: response.data.source || '',
          notes: response.data.notes || '',
          status: response.data.status || 'active'
        });
      }
    } catch (error) {
      console.error('Error loading customer:', error);
      setErrors({ general: 'Failed to load customer data' });
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Simple client-side validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.source.trim()) {
      newErrors.source = 'Source is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      let response;
      
      if (customerId) {
        // Update existing customer
        response = await mockApi.updateCustomer(customerId, formData);
      } else {
        // Create new customer
        response = await mockApi.createCustomer(formData);
      }
      
      if (response.success) {
        // Show success message
        alert(`Customer ${customerId ? 'updated' : 'created'} successfully!`);
        
        // Call parent callback if provided
        if (onSubmit) {
          onSubmit(response.data);
        }
      } else {
        setErrors({ general: 'Failed to save customer' });
      }
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ general: 'Failed to save customer. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Get field error message
  const getFieldError = (fieldName) => {
    return errors[fieldName];
  };

  // Render loading state
  if (loading) {
    return (
      <div className="customer-form-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading customer data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-form-container">
      <form onSubmit={handleSubmit} className="customer-form">
        <h2 className="form-title">
          {customerId ? 'Edit Customer' : 'Add New Customer'}
        </h2>
        
        {/* General error message */}
        {errors.general && (
          <div className="error-message general-error">
            {errors.general}
          </div>
        )}
        
        {/* Assignment info message for new customers */}
        {!customerId && (
          <div className="info-message">
            {user.role === 'admin' 
              ? 'New customers will start unassigned and can be assigned later.'
              : 'This customer will be automatically assigned to you.'
            }
          </div>
        )}
        
        {/* Full Name Field */}
        <div className="form-group">
          <label htmlFor="fullName" className="form-label">
            Full Name *
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className={`form-input ${getFieldError('fullName') ? 'error' : ''}`}
            placeholder="Enter full name"
            required
          />
          {getFieldError('fullName') && (
            <span className="error-message">{getFieldError('fullName')}</span>
          )}
        </div>
        
        {/* Email Field */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`form-input ${getFieldError('email') ? 'error' : ''}`}
            placeholder="Enter email address"
            required
          />
          {getFieldError('email') && (
            <span className="error-message">{getFieldError('email')}</span>
          )}
        </div>
        
        {/* Phone Field */}
        <div className="form-group">
          <label htmlFor="phone" className="form-label">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`form-input ${getFieldError('phone') ? 'error' : ''}`}
            placeholder="Enter phone number"
            required
          />
          {getFieldError('phone') && (
            <span className="error-message">{getFieldError('phone')}</span>
          )}
        </div>
        
        {/* Source Field */}
        <div className="form-group">
          <label htmlFor="source" className="form-label">
            Source *
          </label>
          <select
            id="source"
            name="source"
            value={formData.source}
            onChange={handleInputChange}
            className={`form-select ${getFieldError('source') ? 'error' : ''}`}
            required
          >
            <option value="">Select source</option>
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="social_media">Social Media</option>
            <option value="advertisement">Advertisement</option>
            <option value="walk_in">Walk-in</option>
            <option value="phone_call">Phone Call</option>
            <option value="other">Other</option>
          </select>
          {getFieldError('source') && (
            <span className="error-message">{getFieldError('source')}</span>
          )}
        </div>
        
        {/* Status Field - Admin only */}
        {user.role === 'admin' && (
          <div className="form-group">
            <label htmlFor="status" className="form-label">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className={`form-select ${getFieldError('status') ? 'error' : ''}`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
            {getFieldError('status') && (
              <span className="error-message">{getFieldError('status')}</span>
            )}
          </div>
        )}
        
        {/* Notes Field */}
        <div className="form-group">
          <label htmlFor="notes" className="form-label">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            className={`form-textarea ${getFieldError('notes') ? 'error' : ''}`}
            placeholder="Enter any additional notes"
            rows={4}
          />
          {getFieldError('notes') && (
            <span className="error-message">{getFieldError('notes')}</span>
          )}
        </div>
        
        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : (customerId ? 'Update Customer' : 'Add Customer')}
          </button>
        </div>
      </form>
      
      {/* Basic CSS styles */}
      <style jsx>{`
        .customer-form-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .customer-form {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .form-title {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #333;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #555;
        }
        
        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
          transition: border-color 0.3s;
        }
        
        .form-input:focus, .form-select:focus, .form-textarea:focus {
          outline: none;
          border-color: #4CAF50;
        }
        
        .form-input.error, .form-select.error, .form-textarea.error {
          border-color: #f44336;
        }
        
        .error-message {
          color: #f44336;
          font-size: 14px;
          margin-top: 5px;
          display: block;
        }
        
        .general-error {
          background: #ffebee;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .info-message {
          background: #e3f2fd;
          color: #1976d2;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 30px;
        }
        
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .btn-primary {
          background-color: #4CAF50;
          color: white;
        }
        
        .btn-primary:hover:not(:disabled) {
          background-color: #45a049;
        }
        
        .btn-secondary {
          background-color: #f5f5f5;
          color: #333;
        }
        
        .btn-secondary:hover:not(:disabled) {
          background-color: #e0e0e0;
        }
        
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }
        
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4CAF50;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 10px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .customer-form-container {
            padding: 10px;
          }
          
          .customer-form {
            padding: 20px;
          }
          
          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomerForm;