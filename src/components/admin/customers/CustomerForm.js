import { useState } from 'react';
import { CustomerService } from '../../../services/customerService';

export const CustomerForm = {
  // Default form values matching the customer model
  getDefaultFormData: () => ({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    assignedTo: null
  }),

  // Form validation
  validateForm: (formData) => {
    const errors = {};

    // Full name validation
    if (!formData.fullName || !formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    } else if (formData.fullName.trim().length > 100) {
      errors.fullName = 'Full name cannot exceed 100 characters';
    }

    // Email validation
    if (!formData.email || !formData.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Please enter a valid email';
      }
    }

    // Phone validation
    if (!formData.phone || !formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else {
      const phoneRegex = /^[\+]?[0-9]{1}[0-9]{7,14}$/;
      const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        errors.phone = 'Please enter a valid phone number';
      }
    }

    // Address validation (optional but with length limit)
    if (formData.address && formData.address.length > 500) {
      errors.address = 'Address cannot exceed 500 characters';
    }

    // Notes validation (optional but with length limit)
    if (formData.notes && formData.notes.length > 1000) {
      errors.notes = 'Notes cannot exceed 1000 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Sanitize form data before submission
  sanitizeFormData: (formData) => {
    return {
      fullName: formData.fullName ? formData.fullName.trim() : '',
      email: formData.email ? formData.email.trim().toLowerCase() : '',
      phone: formData.phone ? formData.phone.trim() : '',
      address: formData.address ? formData.address.trim() : '',
      notes: formData.notes ? formData.notes.trim() : '',
      assignedTo: formData.assignedTo || null
    };
  },

  // Create customer submission handler
  handleCreateCustomer: async (formData) => {
    try {
      // Validate form data
      const validation = CustomerForm.validateForm(formData);
      if (!validation.isValid) {
        throw new Error('Form validation failed');
      }

      // Sanitize data
      const sanitizedData = CustomerForm.sanitizeFormData(formData);

      // Submit to API
      const customer = await CustomerService.createCustomer(sanitizedData);
      
      return {
        success: true,
        data: customer,
        errors: null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        errors: { submit: error.message }
      };
    }
  },

  // Update customer submission handler
  handleUpdateCustomer: async (customerId, formData) => {
    try {
      // Validate form data
      const validation = CustomerForm.validateForm(formData);
      if (!validation.isValid) {
        throw new Error('Form validation failed');
      }

      // Sanitize data
      const sanitizedData = CustomerForm.sanitizeFormData(formData);

      // Submit to API
      const customer = await CustomerService.updateCustomer(customerId, sanitizedData);
      
      return {
        success: true,
        data: customer,
        errors: null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        errors: { submit: error.message }
      };
    }
  }
};

// React hook for form state management
export const useCustomerForm = (initialData = null) => {
  const [formData, setFormData] = useState(
    initialData || CustomerForm.getDefaultFormData()
  );
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form field
  const updateField = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: null
      }));
    }
  };

  // Validate current form state
  const validateCurrentForm = () => {
    const validation = CustomerForm.validateForm(formData);
    setErrors(validation.errors);
    return validation.isValid;
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData(initialData || CustomerForm.getDefaultFormData());
    setErrors({});
    setIsSubmitting(false);
  };

  // Submit form (create new customer)
  const submitForm = async () => {
    setIsSubmitting(true);
    
    try {
      const validation = CustomerForm.validateForm(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return { success: false, errors: validation.errors };
      }

      const result = await CustomerForm.handleCreateCustomer(formData);
      
      if (!result.success) {
        setErrors(result.errors);
      }
      
      return result;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update existing customer
  const updateCustomer = async (customerId) => {
    setIsSubmitting(true);
    
    try {
      const validation = CustomerForm.validateForm(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return { success: false, errors: validation.errors };
      }

      const result = await CustomerForm.handleUpdateCustomer(customerId, formData);
      
      if (!result.success) {
        setErrors(result.errors);
      }
      
      return result;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    validateCurrentForm,
    resetForm,
    submitForm,
    updateCustomer
  };
};

export default CustomerForm;