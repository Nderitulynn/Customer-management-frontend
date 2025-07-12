import React, { useState, useEffect, useRef } from 'react';
import { X, User, Mail, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { createAssistant } from '../../services/assistantService';

const AssistantRegistrationModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  onError 
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [showTempPassword, setShowTempPassword] = useState(false);
  
  // Add ref for form to handle autofill
  const formRef = useRef(null);

  // DEBUG: Log initial state
  console.log('🔍 Modal rendered - isLoading initial state:', isLoading);

  // Reset form when modal opens/closes + Handle autofill
  useEffect(() => {
    console.log('🔍 useEffect triggered - isOpen:', isOpen);
    if (isOpen) {
      setFormData({
        firstName: '',
        lastName: '',
        email: ''
      });
      setErrors({});
      setShowSuccess(false);
      setTempPassword('');
      setShowTempPassword(false);
      console.log('🔍 Modal opened - resetting states');
      
      // Force clear autofill after a short delay
      setTimeout(() => {
        if (formRef.current) {
          const inputs = formRef.current.querySelectorAll('input[type="text"], input[type="email"]');
          inputs.forEach(input => {
            input.value = '';
            input.setAttribute('value', '');
          });
        }
      }, 100);
    }
  }, [isOpen]);

  // DEBUG: Monitor isLoading changes
  useEffect(() => {
    console.log('🔍 isLoading changed to:', isLoading);
  }, [isLoading]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔍 Form submission started');
    
    if (!validateForm()) {
      console.log('🔍 Form validation failed');
      return;
    }

    console.log('🔍 Setting isLoading to true');
    setIsLoading(true);
    
    try {
      console.log('🔍 Calling createAssistant with data:', formData);
      const result = await createAssistant(formData);
      console.log('🔍 createAssistant succeeded:', result);
      
      setTempPassword(result.tempPassword);
      setShowSuccess(true);
      
      // Call success callback if provided
      if (onSuccess) {
        console.log('🔍 Calling onSuccess callback');
        onSuccess(result);
      }
      
    } catch (error) {
      console.log('🔍 createAssistant failed:', error);
      const errorMessage = error.message || 'Failed to create assistant';
      setErrors({ submit: errorMessage });
      
      // Call error callback if provided
      if (onError) {
        console.log('🔍 Calling onError callback');
        onError(error);
      }
    } finally {
      console.log('🔍 Setting isLoading to false');
      setIsLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    console.log('🔍 handleClose called - isLoading:', isLoading);
    if (!isLoading) {
      console.log('🔍 Closing modal');
      onClose();
    } else {
      console.log('🔍 Modal close blocked - loading in progress');
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && !isLoading) {
      console.log('🔍 Escape key pressed - closing modal');
      handleClose();
    }
  };

  // Copy temp password to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    console.log('🔍 Password copied to clipboard');
    // You might want to show a toast notification here
  };

  // Don't render if not open
  if (!isOpen) {
    console.log('🔍 Modal not open - not rendering');
    return null;
  }

  console.log('🔍 Rendering modal - Current states:', {
    isLoading,
    showSuccess,
    hasErrors: Object.keys(errors).length > 0
  });

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Add New Assistant
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {!showSuccess ? (
            // Registration Form
            <form 
              ref={formRef}
              onSubmit={handleSubmit} 
              className="space-y-4"
              autoComplete="off"
              noValidate
            >
              {/* Hidden fake fields to confuse autofill */}
              <input 
                type="text" 
                style={{display: 'none'}} 
                autoComplete="off" 
                tabIndex="-1"
              />
              <input 
                type="password" 
                style={{display: 'none'}} 
                autoComplete="off" 
                tabIndex="-1"
              />
              
              {/* First Name */}
              <div>
                <label htmlFor="assistantFirstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="assistantFirstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:opacity-50 ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter first name"
                    autoComplete="nope"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-lpignore="true"
                    data-form-type="other"
                    data-1p-ignore="true"
                    autoFocus
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={16} className="mr-1" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="assistantLastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="assistantLastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:opacity-50 ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter last name"
                    autoComplete="nope"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-lpignore="true"
                    data-form-type="other"
                    data-1p-ignore="true"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={16} className="mr-1" />
                    {errors.lastName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="assistantEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    id="assistantEmail"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:opacity-50 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address"
                    autoComplete="nope"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-lpignore="true"
                    data-form-type="other"
                    data-1p-ignore="true"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={16} className="mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle size={16} className="mr-2" />
                    {errors.submit}
                  </p>
                </div>
              )}

              {/* Info Note */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-600">
                  A temporary password will be generated and sent to the assistant's email address.
                  They will be required to change it on first login.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Creating...
                    </>
                  ) : (
                    'Create Assistant'
                  )}
                </button>
              </div>
            </form>
          ) : (
            // Success Message
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Assistant Created Successfully!
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                {formData.firstName} {formData.lastName} has been added as an assistant.
                An email with login credentials has been sent to {formData.email}.
              </p>

              {/* Temporary Password Display */}
              {tempPassword && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temporary Password:
                  </label>
                  <div className="relative">
                    <input
                      type={showTempPassword ? 'text' : 'password'}
                      value={tempPassword}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-center font-mono"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTempPassword(!showTempPassword)}
                      className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600"
                    >
                      {showTempPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <button
                    onClick={() => copyToClipboard(tempPassword)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    Copy to clipboard
                  </button>
                </div>
              )}

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> The assistant must change this password on their first login.
                  Please share this temporary password securely.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssistantRegistrationModal;