import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown, ChevronUp } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
      showDetails: false,
      retryCount: 0,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    this.logError(error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      eventId: this.generateEventId()
    });
  }

  logError = (error, errorInfo) => {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught an Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }

    // Trigger notification if available
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  };

  reportError = async (error, errorInfo) => {
    try {
      // Here you would integrate with your error reporting service
      // Example: Sentry, LogRocket, Bugsnag, etc.
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        userId: this.props.userId || 'anonymous',
        sessionId: this.props.sessionId || 'unknown'
      };

      // Replace with your actual error reporting endpoint
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorReport)
      });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  generateEventId = () => {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  handleRetry = () => {
    this.setState({ 
      isRetrying: true,
      retryCount: this.state.retryCount + 1
    });

    // Reset error state after a brief delay
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        eventId: null,
        showDetails: false,
        isRetrying: false
      });
    }, 500);
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  toggleDetails = () => {
    this.setState({ showDetails: !this.state.showDetails });
  };

  render() {
    if (this.state.hasError) {
      const { 
        error, 
        errorInfo, 
        eventId, 
        showDetails, 
        retryCount, 
        isRetrying 
      } = this.state;

      const {
        fallback,
        showRetry = true,
        maxRetries = 3,
        showReportButton = true,
        showDetailsToggle = true,
        level = 'error', // 'error', 'warning', 'info'
        title,
        message,
        className = ''
      } = this.props;

      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Determine if retry should be available
      const canRetry = showRetry && retryCount < maxRetries && !isRetrying;

      // Error level styling
      const levelStyles = {
        error: {
          icon: AlertTriangle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-500',
          titleColor: 'text-red-800',
          textColor: 'text-red-700'
        },
        warning: {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-500',
          titleColor: 'text-yellow-800',
          textColor: 'text-yellow-700'
        },
        info: {
          icon: AlertTriangle,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-500',
          titleColor: 'text-blue-800',
          textColor: 'text-blue-700'
        }
      };

      const styles = levelStyles[level];
      const IconComponent = styles.icon;

      return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${className}`}>
          <div className={`max-w-md w-full ${styles.bgColor} ${styles.borderColor} border rounded-lg shadow-lg p-6`}>
            {/* Error Icon and Title */}
            <div className="flex items-center mb-4">
              <IconComponent className={`w-6 h-6 ${styles.iconColor} mr-3 flex-shrink-0`} />
              <h1 className={`text-lg font-semibold ${styles.titleColor}`}>
                {title || 'Something went wrong'}
              </h1>
            </div>

            {/* Error Message */}
            <div className={`${styles.textColor} mb-6`}>
              <p className="text-sm leading-relaxed">
                {message || 'An unexpected error occurred. We apologize for the inconvenience.'}
              </p>
              
              {eventId && (
                <p className="text-xs mt-2 font-mono">
                  Error ID: {eventId}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  disabled={isRetrying}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                  {isRetrying ? 'Retrying...' : 'Try Again'}
                </button>
              )}

              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </button>

              <button
                onClick={this.handleReload}
                className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </button>
            </div>

            {/* Retry Information */}
            {retryCount > 0 && (
              <div className="text-xs text-gray-500 mb-4">
                Retry attempts: {retryCount}/{maxRetries}
              </div>
            )}

            {/* Error Details Toggle */}
            {showDetailsToggle && process.env.NODE_ENV === 'development' && (
              <div className="border-t pt-4">
                <button
                  onClick={this.toggleDetails}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Error Details
                  {showDetails ? (
                    <ChevronUp className="w-4 h-4 ml-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </button>

                {showDetails && (
                  <div className="mt-3 p-3 bg-gray-100 rounded border text-xs font-mono overflow-auto max-h-40">
                    <div className="mb-2">
                      <strong>Error:</strong> {error?.message}
                    </div>
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap text-xs mt-1">
                        {error?.stack}
                      </pre>
                    </div>
                    {errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap text-xs mt-1">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Report Button */}
            {showReportButton && (
              <div className="border-t pt-4">
                <p className="text-xs text-gray-500 mb-2">
                  Help us improve by reporting this error.
                </p>
                <button
                  onClick={() => {
                    // Open email client or feedback form
                    const subject = `Error Report - ${eventId}`;
                    const body = `Error ID: ${eventId}\nError: ${error?.message}\nURL: ${window.location.href}`;
                    window.location.href = `mailto:support@yourapp.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Report this error
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for easier usage
export const withErrorBoundary = (WrappedComponent, errorBoundaryProps = {}) => {
  return (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
};

// Specialized error boundaries for different contexts
export const PageErrorBoundary = ({ children, ...props }) => (
  <ErrorBoundary
    title="Page Error"
    message="This page encountered an error and couldn't load properly."
    {...props}
  >
    {children}
  </ErrorBoundary>
);

export const ComponentErrorBoundary = ({ children, componentName, ...props }) => (
  <ErrorBoundary
    title={`${componentName} Error`}
    message={`The ${componentName} component encountered an error.`}
    level="warning"
    showRetry={true}
    {...props}
  >
    {children}
  </ErrorBoundary>
);

export const ApiErrorBoundary = ({ children, ...props }) => (
  <ErrorBoundary
    title="Data Loading Error"
    message="Failed to load data from the server. Please check your connection and try again."
    {...props}
  >
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;