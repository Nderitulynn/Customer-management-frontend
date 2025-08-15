import React, { useState, useEffect } from 'react';
import { useCustomerData } from '../../../hooks/useCustomerData';
import LoadingSpinner from '../../common/LoadingSpinner';

const CustomerForm = ({ 
  customerId = null, 
  user, 
  onSuccess, 
  onCancel,
  initialData = null 
}) => {
  const { createCustomer, updateCustomer, getCustomerById } = useCustomerData();

  // Form state management
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    source: '',
    notes: '',
    isActive: true,
    address: {
      street: '',
      city: '',
      state: ''
    },
    preferences: []
  });
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Source options matching backend enum
  const sourceOptions = [
    { value: '', label: 'Select source' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'referral', label: 'Referral' },
    { value: 'social', label: 'Social Media' },
    { value: 'other', label: 'Other' }
  ];

  // Preference options
  const preferenceOptions = [
    { value: 'email_notifications', label: 'Email Notifications' },
    { value: 'sms_notifications', label: 'SMS Notifications' },
    { value: 'marketing_materials', label: 'Marketing Materials' },
    { value: 'newsletter', label: 'Newsletter' }
  ];

  // Enhanced validation functions
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone) => {
    return /^[\+]?[1-9][\d]{3,14}$/.test(phone.replace(/\s/g, ''));
  };

  // Initialize form on component mount
  useEffect(() => {
    if (initialData) {
      // Use initialData if provided (for edit mode from parent)
      setFormData({
        fullName: initialData.fullName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        source: initialData.source || '',
        notes: initialData.notes || '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        address: {
          street: initialData.address?.street || '',
          city: initialData.address?.city || '',
          state: initialData.address?.state || ''
        },
        preferences: initialData.preferences || []
      });
    } else if (customerId) {
      // Load customer data if customerId provided
      loadCustomer();
    }
  }, [customerId, initialData]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const result = await getCustomerById(customerId);
      
      if (result.success) {
        const customer = result.data;
        setFormData({
          fullName: customer.fullName || '',
          email: customer.email || '',
          phone: customer.phone || '',
          source: customer.source || '',
          notes: customer.notes || '',
          isActive: customer.isActive !== undefined ? customer.isActive : true,
          address: {
            street: customer.address?.street || '',
            city: customer.address?.city || '',
            state: customer.address?.state || ''
          },
          preferences: customer.preferences || []
        });
      } else {
        setErrors({ general: result.error || 'Failed to load customer data' });
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
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else if (type === 'checkbox' && name === 'isActive') {
      setFormData(prev => ({
        ...prev,
        isActive: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear field-specific errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle preference changes
  const handlePreferenceChange = (preferenceValue) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.includes(preferenceValue)
        ? prev.preferences.filter(p => p !== preferenceValue)
        : [...prev.preferences, preferenceValue]
    }));
  };

  // Enhanced client-side validation
  const validateForm = () => {
    const newErrors = {};
    
    // Required field validation
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
    
    // Address validation - at least city is required
    if (!formData.address.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission with real API
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      let result;
      
      if (customerId || initialData?.id) {
        // Update existing customer
        const id = customerId || initialData.id;
        result = await updateCustomer(id, formData);
      } else {
        // Create new customer
        result = await createCustomer(formData);
      }
      
      if (result.success) {
        // Call parent callback if provided
        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        setErrors({ general: result.error || 'Failed to save customer. Please try again.' });
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
          <LoadingSpinner size="medium" message="Loading customer data..." />
        </div>
      </div>
    );
  }

  return (
    <div className="customer-form-container">
      <form onSubmit={handleSubmit} className="customer-form">
        <h2 className="form-title">
          {customerId || initialData?.id ? 'Edit Customer' : 'Add New Customer'}
        </h2>
        
        {/* General error message */}
        {errors.general && (
          <div className="error-message general-error">
            {errors.general}
          </div>
        )}
        
        {/* Assignment info message for new customers */}
        {!customerId && !initialData?.id && (
          <div className="info-message">
            {user?.role === 'admin' 
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
            {sourceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {getFieldError('source') && (
            <span className="error-message">{getFieldError('source')}</span>
          )}
        </div>
        
        {/* Address Fields */}
        <div className="form-section">
          <h3 className="section-title">Address</h3>
          
          <div className="form-group">
            <label htmlFor="address.street" className="form-label">
              Street Address
            </label>
            <input
              type="text"
              id="address.street"
              name="address.street"
              value={formData.address.street}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter street address"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="address.city" className="form-label">
                City *
              </label>
              <input
                type="text"
                id="address.city"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
                className={`form-input ${getFieldError('city') ? 'error' : ''}`}
                placeholder="Enter city"
                required
              />
              {getFieldError('city') && (
                <span className="error-message">{getFieldError('city')}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="address.state" className="form-label">
                State
              </label>
              <input
                type="text"
                id="address.state"
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter state"
              />
            </div>
          </div>
        </div>
        
        {/* Active Status - Checkbox instead of dropdown */}
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="form-checkbox"
            />
            <span className="checkbox-text">Active Customer</span>
          </label>
        </div>
        
        {/* Preferences */}
        <div className="form-section">
          <h3 className="section-title">Preferences</h3>
          <div className="preferences-grid">
            {preferenceOptions.map(option => (
              <label key={option.value} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.preferences.includes(option.value)}
                  onChange={() => handlePreferenceChange(option.value)}
                  className="form-checkbox"
                />
                <span className="checkbox-text">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
        
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
            {submitting ? 'Saving...' : (customerId || initialData?.id ? 'Update Customer' : 'Add Customer')}
          </button>
        </div>
      </form>
      
      {/* Enhanced CSS styles */}
      <style jsx>{`
        .customer-form-container {
          max-width: 700px;
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
        
        .form-section {
          margin: 30px 0;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 6px;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: 500;
          margin-bottom: 15px;
          color: #333;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
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
        
        .checkbox-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          margin-bottom: 10px;
        }
        
        .form-checkbox {
          margin-right: 8px;
          transform: scale(1.2);
        }
        
        .checkbox-text {
          font-size: 16px;
          color: #555;
        }
        
        .preferences-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
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
        
        @media (max-width: 768px) {
          .customer-form-container {
            padding: 10px;
          }
          
          .customer-form {
            padding: 20px;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .preferences-grid {
            grid-template-columns: 1fr;
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