import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const CustomerMain = ({ 
  children, 
  loading = false, 
  error = null, 
  onRetry = null,
  className = '',
  maxWidth = 'max-w-7xl' // Made this configurable with a wider default
}) => {
  // Loading state
  if (loading) {
    return (
      <main className={`flex-1 overflow-y-auto bg-gray-50 ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-sm text-gray-500">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className={`flex-1 overflow-y-auto bg-gray-50 ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-sm text-gray-500 mb-4">
              {typeof error === 'string' ? error : 'An unexpected error occurred. Please try again.'}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  // Normal content - Made the container wider and more flexible
  return (
    <main className={`flex-1 overflow-y-auto bg-gray-50 ${className}`}>
      <div className="h-full">
        <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-6`}>
          {children}
        </div>
      </div>
    </main>
  );
};

export default CustomerMain;