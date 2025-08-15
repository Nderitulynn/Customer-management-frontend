import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const NotificationMessages = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Clear success message after 3 seconds (can be customized)
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Methods to show messages
  const showSuccess = (message, duration = 3000) => {
    setSuccessMessage(message);
    if (duration !== 3000) {
      setTimeout(() => setSuccessMessage(''), duration);
    }
  };

  const showError = (message) => {
    setError(message);
  };

  const clearMessages = () => {
    setSuccessMessage('');
    setError(null);
  };

  return {
    // State values
    successMessage,
    error,
    
    // Methods
    showSuccess,
    showError,
    clearMessages,
    setSuccessMessage,
    setError,
    
    // JSX Component
    NotificationComponent: () => (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
              <div className="ml-auto">
                <button
                  onClick={() => setSuccessMessage('')}
                  className="text-green-400 hover:text-green-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="ml-auto">
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  };
};

// Hook version for easier usage
export const useNotifications = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Clear success message after 3 seconds (can be customized)
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const showSuccess = (message, duration = 3000) => {
    setSuccessMessage(message);
    if (duration !== 3000) {
      setTimeout(() => setSuccessMessage(''), duration);
    }
  };

  const showError = (message) => {
    setError(message);
  };

  const clearMessages = () => {
    setSuccessMessage('');
    setError(null);
  };

  return {
    successMessage,
    error,
    showSuccess,
    showError,
    clearMessages,
    setSuccessMessage,
    setError
  };
};

// Standalone component version
export const NotificationDisplay = ({ successMessage, error, onClearSuccess, onClearError }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Success Message */}
    {successMessage && (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
          <div className="ml-auto">
            <button
              onClick={onClearSuccess}
              className="text-green-400 hover:text-green-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Error Message */}
    {error && (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <div className="ml-auto">
            <button
              onClick={onClearError}
              className="text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);

export default NotificationMessages;