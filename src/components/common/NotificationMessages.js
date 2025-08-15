import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

// Custom hook for managing notifications
export const useNotifications = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  const showSuccess = useCallback((message, duration = 5000) => {
    setSuccessMessage(message);
    if (duration > 0) {
      setTimeout(() => {
        setSuccessMessage('');
      }, duration);
    }
  }, []);

  const showError = useCallback((errorMessage, duration = 5000) => {
    setError(errorMessage);
    if (duration > 0) {
      setTimeout(() => {
        setError(null);
      }, duration);
    }
  }, []);

  const clearSuccess = useCallback(() => {
    setSuccessMessage('');
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    successMessage,
    error,
    showSuccess,
    showError,
    setSuccessMessage,
    setError,
    clearSuccess,
    clearError
  };
};

// Success notification component
const SuccessNotification = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-green-800">
              Success
            </p>
            <p className="mt-1 text-sm text-green-700">
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="inline-flex text-green-400 hover:text-green-600 focus:outline-none focus:text-green-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Error notification component
const ErrorNotification = ({ error, onClose }) => {
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        onClose();
      }, 8000); // Errors stay longer
      return () => clearTimeout(timer);
    }
  }, [error, onClose]);

  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message || 'An unexpected error occurred';

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-red-800">
              Error
            </p>
            <p className="mt-1 text-sm text-red-700">
              {errorMessage}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="inline-flex text-red-400 hover:text-red-600 focus:outline-none focus:text-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main notification display component
export const NotificationDisplay = ({ 
  successMessage, 
  error, 
  onClearSuccess, 
  onClearError 
}) => {
  return (
    <>
      <SuccessNotification 
        message={successMessage} 
        onClose={onClearSuccess} 
      />
      <ErrorNotification 
        error={error} 
        onClose={onClearError} 
      />
    </>
  );
};

// Alternative inline notification components for forms or specific areas
export const InlineSuccessMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
          <p className="text-sm text-green-700">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-green-400 hover:text-green-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export const InlineErrorMessage = ({ error, onClose }) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message || 'An unexpected error occurred';

  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <XCircle className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Toast-style notification that slides in from the top
export const ToastNotification = ({ type, message, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const Icon = type === 'success' ? CheckCircle : XCircle;

  return (
    <div 
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 max-w-md`}>
        <Icon className="h-5 w-5 flex-shrink-0" />
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationDisplay;