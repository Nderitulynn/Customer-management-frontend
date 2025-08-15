import React, { useState, useEffect } from 'react';
import { AssistantService } from '../../../services/AssistantService';

const AssistantForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [passwordConfirmed, setPasswordConfirmed] = useState(false);
  const [showPassword, setShowPassword] = useState(true);

  // Prevent accidental navigation when password is displayed
  useEffect(() => {
    if (successData && successData.tempPassword && !passwordConfirmed) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = 'You have an unsaved temporary password. Are you sure you want to leave?';
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [successData, passwordConfirmed]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

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
    } else if (!formData.email.includes('@') || !formData.email.includes('.')) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 8) {
  newErrors.password = 'Password must be at least 8 characters long (leave empty for auto-generated)';
}

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newAssistant = await AssistantService.createAssistant(formData);
      
      setSuccessData({
        assistant: newAssistant,
        tempPassword: newAssistant.tempPassword
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(newAssistant);
      }
      
    } catch (error) {
      setErrors({
        submit: error.message || 'Failed to create assistant'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPassword = async () => {
    if (!successData?.tempPassword) return;

    try {
      await navigator.clipboard.writeText(successData.tempPassword);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = successData.tempPassword;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handlePrintPassword = () => {
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Assistant Account Details</h2>
        <p><strong>Name:</strong> ${successData.assistant.firstName} ${successData.assistant.lastName}</p>
        <p><strong>Email:</strong> ${successData.assistant.email}</p>
        <p><strong>Temporary Password:</strong> <span style="font-family: monospace; font-size: 18px; background: #f0f0f0; padding: 4px 8px;">${successData.tempPassword}</span></p>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Please share this password with the assistant. They will be required to change it on first login.
        </p>
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    });
    setErrors({});
    setSuccessData(null);
    setCopySuccess(false);
    setPasswordConfirmed(false);
    setShowPassword(true);
  };

  const handleCreateAnother = () => {
    if (!passwordConfirmed) {
      alert('Please confirm that you have saved the password before continuing.');
      return;
    }
    handleReset();
  };

  const handleDone = () => {
    if (!passwordConfirmed) {
      alert('Please confirm that you have saved the password before continuing.');
      return;
    }
    if (onCancel) {
      onCancel();
    }
  };

  // Success view after creating assistant
  if (successData) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Assistant Created Successfully!
          </h2>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-900 mb-2">Assistant Details:</h3>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Name:</span> {successData.assistant.firstName} {successData.assistant.lastName}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Email:</span> {successData.assistant.email}
            </p>
          </div>

          {successData.tempPassword && (
            <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-blue-900">Temporary Password:</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M14.121 14.121l1.415 1.415" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded border-2 border-dashed border-blue-300">
                <div className="font-mono text-xl text-center tracking-wider text-gray-900 select-all">
                  {showPassword ? successData.tempPassword : '••••••••'}
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleCopyPassword}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  {copySuccess ? (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                      Copy
                    </>
                  )}
                </button>
                
                <button
                  onClick={handlePrintPassword}
                  className="flex-1 bg-gray-600 text-white py-2 px-3 rounded text-sm hover:bg-gray-700 transition-colors flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                  </svg>
                  Print
                </button>
              </div>

              <div className="bg-red-50 border border-red-200 p-3 rounded mt-3">
                <p className="text-sm text-red-800 font-medium mb-1">⚠️ Important Security Notice:</p>
                <p className="text-sm text-red-700">
                  This password will not be shown again. Please save it now and share it securely with the assistant.
                </p>
              </div>

              <p className="text-sm text-blue-700 mt-2">
                The assistant will be required to change this password on their first login.
              </p>
            </div>
          )}

          {/* Confirmation Checkbox */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={passwordConfirmed}
                onChange={(e) => setPasswordConfirmed(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-yellow-800">
                <span className="font-medium">I confirm that I have saved the temporary password</span> and will share it securely with the assistant. I understand this password will not be displayed again.
              </span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleCreateAnother}
            disabled={!passwordConfirmed}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Another Assistant
          </button>
          {onCancel && (
            <button
              onClick={handleDone}
              disabled={!passwordConfirmed}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Done
            </button>
          )}
        </div>

        {!passwordConfirmed && (
          <p className="text-center text-sm text-gray-500 mt-2">
            Please confirm you've saved the password to continue
          </p>
        )}
      </div>
    );
  }

  // Form view
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
        Create New Assistant
      </h2>

      <div className="space-y-4">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter first name"
            disabled={isSubmitting}
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter last name"
            disabled={isSubmitting}
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter email address"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="text"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter password (minimum 8 characters)"
            disabled={isSubmitting}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Password must be at least 8 characters long
          </p>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {errors.submit}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              'Create Assistant'
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleReset}
          disabled={isSubmitting}
          className="w-full text-gray-500 hover:text-gray-700 text-sm py-2 transition-colors"
        >
          Reset Form
        </button>
        </div>
    </div>
  );
};

export default AssistantForm;