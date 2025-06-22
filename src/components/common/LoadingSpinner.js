import React from 'react';
import { Loader2, RotateCw } from 'lucide-react';

const LoadingSpinner = ({
  size = 'medium',
  variant = 'circular',
  message = '',
  overlay = false,
  color = 'primary',
  className = '',
  fullScreen = false,
  showMessage = true,
  customIcon = null,
  ...props
}) => {
  // Size configurations
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
    xlarge: 'w-12 h-12'
  };

  // Color configurations
  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    white: 'text-white'
  };

  // Animation classes
  const animationClasses = 'animate-spin';

  // Get appropriate icon based on variant
  const getSpinnerIcon = () => {
    if (customIcon) return customIcon;
    
    switch (variant) {
      case 'circular':
        return <Loader2 className={`${sizeClasses[size]} ${colorClasses[color]} ${animationClasses}`} />;
      case 'rotate':
        return <RotateCw className={`${sizeClasses[size]} ${colorClasses[color]} ${animationClasses}`} />;
      case 'dots':
        return <DotsSpinner size={size} color={color} />;
      case 'pulse':
        return <PulseSpinner size={size} color={color} />;
      case 'skeleton':
        return <SkeletonLoader size={size} />;
      default:
        return <Loader2 className={`${sizeClasses[size]} ${colorClasses[color]} ${animationClasses}`} />;
    }
  };

  // Container classes
  const containerClasses = `
    flex flex-col items-center justify-center gap-2
    ${fullScreen ? 'fixed inset-0 z-50' : ''}
    ${overlay ? 'bg-black bg-opacity-20 backdrop-blur-sm' : ''}
    ${className}
  `;

  // Message classes based on size
  const messageClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
    xlarge: 'text-lg'
  };

  return (
    <div className={containerClasses} {...props}>
      {getSpinnerIcon()}
      {showMessage && message && (
        <p className={`text-gray-600 ${messageClasses[size]} text-center max-w-xs`}>
          {message}
        </p>
      )}
    </div>
  );
};

// Dots spinner variant
const DotsSpinner = ({ size, color }) => {
  const dotSizes = {
    small: 'w-1 h-1',
    medium: 'w-2 h-2',
    large: 'w-3 h-3',
    xlarge: 'w-4 h-4'
  };

  const colorClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600',
    white: 'bg-white'
  };

  return (
    <div className="flex space-x-1">
      <div 
        className={`${dotSizes[size]} ${colorClasses[color]} rounded-full animate-bounce`}
        style={{ animationDelay: '0ms' }}
      />
      <div 
        className={`${dotSizes[size]} ${colorClasses[color]} rounded-full animate-bounce`}
        style={{ animationDelay: '150ms' }}
      />
      <div 
        className={`${dotSizes[size]} ${colorClasses[color]} rounded-full animate-bounce`}
        style={{ animationDelay: '300ms' }}
      />
    </div>
  );
};

// Pulse spinner variant
const PulseSpinner = ({ size, color }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
    xlarge: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600',
    white: 'bg-white'
  };

  return (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse`} />
  );
};

// Skeleton loader variant
const SkeletonLoader = ({ size }) => {
  const heights = {
    small: 'h-3',
    medium: 'h-4',
    large: 'h-5',
    xlarge: 'h-6'
  };

  return (
    <div className="space-y-2 w-full max-w-sm">
      <div className={`bg-gray-300 rounded animate-pulse w-3/4 ${heights[size]}`} />
      <div className={`bg-gray-300 rounded animate-pulse w-1/2 ${heights[size]}`} />
      <div className={`bg-gray-300 rounded animate-pulse w-5/6 ${heights[size]}`} />
    </div>
  );
};

// Pre-configured loading components for common use cases
export const PageLoader = ({ message = 'Loading page...' }) => (
  <LoadingSpinner 
    size="large" 
    message={message} 
    fullScreen 
    overlay 
    color="primary" 
  />
);

export const ButtonLoader = ({ size = 'small', color = 'white' }) => (
  <LoadingSpinner 
    size={size} 
    color={color} 
    showMessage={false} 
    variant="circular"
  />
);

export const CardLoader = ({ message = 'Loading...' }) => (
  <LoadingSpinner 
    size="medium" 
    message={message} 
    variant="skeleton" 
    className="p-4"
  />
);

export const InlineLoader = ({ message = 'Processing...', size = 'small' }) => (
  <LoadingSpinner 
    size={size} 
    message={message} 
    variant="dots" 
    className="inline-flex"
  />
);

// Loading wrapper component
export const LoadingWrapper = ({ 
  isLoading, 
  children, 
  loadingComponent = null,
  message = 'Loading...',
  variant = 'circular'
}) => {
  if (isLoading) {
    return loadingComponent || (
      <LoadingSpinner 
        size="medium" 
        message={message} 
        variant={variant}
        className="py-8"
      />
    );
  }
  
  return children;
};

// HOC for loading states
export const withLoading = (WrappedComponent, loadingProps = {}) => {
  return ({ isLoading, ...props }) => {
    if (isLoading) {
      return <LoadingSpinner {...loadingProps} />;
    }
    return <WrappedComponent {...props} />;
  };
};

export default LoadingSpinner;