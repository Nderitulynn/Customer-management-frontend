import React, { useState, useEffect } from 'react';
import { customerApi } from '../../services/customerApi';
import { authApi } from '../../services/authApi';
import { isValidCustomerData, isValidEmail, isValidPhone } from '../../utils/validation';

const CustomerForm = ({ customerId = null, onSubmit, onCancel }) => {
  // State management
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    source: '',
    notes: '',
    status: 'active'
  });
  
  const [currentUser, setCurrentUser] = useState(null);
  const [formConfig, setFormConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  // Initialize form on component mount
  useEffect(() => {
    initializeForm();
  }, [customerId]);

  const initializeForm = async () => {
    try {
      setLoading(true);
      
      // Get current user information
      const userResponse = await authApi.getCurrentUser();
      setCurrentUser(userResponse.data);
      
      // Get form configuration based on user role
      const configResponse = await customerApi.getFormConfig();
      setFormConfig(configResponse.data);
      
      // If editing existing customer, load customer data
      if (customerId) {
        const customerResponse = await customerApi.getCustomer(customerId);
        setFormData({
          fullName: customerResponse.data.fullName || '',
          email: customerResponse.data.email || '',
          phone: customerResponse.data.phone || '',
          source: customerResponse.data.source || '',
          notes: customerResponse.data.notes || '',
          status: customerResponse.data.status || 'active'
        });
      }
      
    } catch (error) {
      console.error('Error initializing form:', error);
      setErrors({ general: 'Failed to load form. Please try again.' });
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
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};
    
    // Basic validation using existing validation utilities
    if (!isValidCustomerData(formData)) {
      if (!formData.fullName?.trim()) {
        newErrors.fullName = 'Full name is required';
      }
      if (!isValidEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      if (!isValidPhone(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
      if (!formData.source?.trim()) {
        newErrors.source = 'Source is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Server-side validation
  const validateFormServer = async () => {
    try {
      const response = await customerApi.validateForm(formData);
      setValidationErrors({});
      return response.data.isValid;
    } catch (error) {
      if (error.response?.data?.validationErrors) {
        setValidationErrors(error.response.data.validationErrors);
      }
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Server-side validation with role-specific rules
      const isServerValid = await validateFormServer();
      if (!isServerValid) {
        setSubmitting(false);
        return;
      }
      
      let response;
      
      if (customerId) {
        // Update existing customer
        response = await customerApi.updateCustomer(customerId, formData);
      } else {
        // Create new customer
        // Auto-assignment logic is handled by the backend:
        // - Admin creates customers: start unassigned
        // - Assistant creates customers: auto-assigned to themselves
        response = await customerApi.createCustomer(formData);
      }
      
      // Handle successful submission
      if (onSubmit) {
        onSubmit(response.data);
      }
      
    } catch (error) {
      console.error('Error submitting form:', error);
      
      if (error.response?.data?.validationErrors) {
        setValidationErrors(error.response.data.validationErrors);
      } else {
        setErrors({ 
          general: error.response?.data?.error || 'Failed to save customer. Please try again.' 
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Check if field is visible based on role and form config
  const isFieldVisible = (fieldName) => {
    if (!formConfig?.fields) return true;
    return formConfig.fields[fieldName]?.visible !== false;
  };

  // Check if field is editable based on role and form config
  const isFieldEditable = (fieldName) => {
    if (!formConfig?.fields) return true;
    return formConfig.fields[fieldName]?.editable !== false;
  };

  // Get field error message
  const getFieldError = (fieldName) => {
    return errors[fieldName] || validationErrors[fieldName];
  };

  // Render loading state
  if (loading) {
    return (
      <div className="customer-form-loading">
        <div className="loading-spinner">Loading form...</div>
      </div>
    );
  }

  // Render error state
  if (!currentUser || !formConfig) {
    return (
      <div className="customer-form-error">
        <p>Error loading form. Please refresh the page.</p>
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
            {currentUser.role === 'admin' 
              ? 'New customers will start unassigned and can be assigned later.'
              : 'This customer will be automatically assigned to you.'
            }
          </div>
        )}
        
        {/* Full Name Field */}
        {isFieldVisible('fullName') && (
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
              disabled={!isFieldEditable('fullName')}
              className={`form-input ${getFieldError('fullName') ? 'error' : ''}`}
              placeholder="Enter full name"
            />
            {getFieldError('fullName') && (
              <span className="error-message">{getFieldError('fullName')}</span>
            )}
          </div>
        )}
        
        {/* Email Field */}
        {isFieldVisible('email') && (
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
              disabled={!isFieldEditable('email')}
              className={`form-input ${getFieldError('email') ? 'error' : ''}`}
              placeholder="Enter email address"
            />
            {getFieldError('email') && (
              <span className="error-message">{getFieldError('email')}</span>
            )}
          </div>
        )}
        
        {/* Phone Field */}
        {isFieldVisible('phone') && (
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
              disabled={!isFieldEditable('phone')}
              className={`form-input ${getFieldError('phone') ? 'error' : ''}`}
              placeholder="Enter phone number"
            />
            {getFieldError('phone') && (
              <span className="error-message">{getFieldError('phone')}</span>
            )}
          </div>
        )}
        
        {/* Source Field */}
        {isFieldVisible('source') && (
          <div className="form-group">
            <label htmlFor="source" className="form-label">
              Source *
            </label>
            <select
              id="source"
              name="source"
              value={formData.source}
              onChange={handleInputChange}
              disabled={!isFieldEditable('source')}
              className={`form-select ${getFieldError('source') ? 'error' : ''}`}
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
        )}
        
        {/* Status Field - Admin only */}
        {currentUser.role === 'admin' && isFieldVisible('status') && (
          <div className="form-group">
            <label htmlFor="status" className="form-label">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              disabled={!isFieldEditable('status')}
              className={`form-select ${getFieldError('status') ? 'error' : ''}`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {getFieldError('status') && (
              <span className="error-message">{getFieldError('status')}</span>
            )}
          </div>
        )}
        
        {/* Notes Field */}
        {isFieldVisible('notes') && (
          <div className="form-group">
            <label htmlFor="notes" className="form-label">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              disabled={!isFieldEditable('notes')}
              className={`form-textarea ${getFieldError('notes') ? 'error' : ''}`}
              placeholder="Enter any additional notes"
              rows={4}
            />
            {getFieldError('notes') && (
              <span className="error-message">{getFieldError('notes')}</span>
            )}
          </div>
        )}
        
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
    </div>
  );
};

export default CustomerForm;