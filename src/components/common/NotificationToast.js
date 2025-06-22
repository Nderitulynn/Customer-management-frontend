import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info,
  Bell
} from 'lucide-react';

const NotificationToast = ({ 
  notification, 
  onDismiss, 
  position = 'top-right',
  autoDismiss = true,
  dismissDelay = 5000 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef(null);
  const toastRef = useRef(null);

  // Animation and visibility logic
  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss logic
  useEffect(() => {
    if (autoDismiss && dismissDelay > 0) {
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, dismissDelay);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [autoDismiss, dismissDelay]);

  // Pause auto-dismiss on hover
  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (autoDismiss && dismissDelay > 0) {
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, dismissDelay);
    }
  };

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300); // Match exit animation duration
  };

  // Keyboard accessibility
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleDismiss();
    }
  };

  // Get notification type styling and icon
  const getNotificationStyles = (type) => {
    const baseStyles = "flex items-start gap-3 p-4 rounded-lg shadow-lg border min-w-80 max-w-md";
    
    switch (type) {
      case 'success':
        return {
          className: `${baseStyles} bg-green-50 border-green-200 text-green-800`,
          icon: CheckCircle,
          iconColor: 'text-green-500',
          progressColor: 'bg-green-500'
        };
      case 'error':
        return {
          className: `${baseStyles} bg-red-50 border-red-200 text-red-800`,
          icon: AlertCircle,
          iconColor: 'text-red-500',
          progressColor: 'bg-red-500'
        };
      case 'warning':
        return {
          className: `${baseStyles} bg-yellow-50 border-yellow-200 text-yellow-800`,
          icon: AlertTriangle,
          iconColor: 'text-yellow-500',
          progressColor: 'bg-yellow-500'
        };
      case 'info':
        return {
          className: `${baseStyles} bg-blue-50 border-blue-200 text-blue-800`,
          icon: Info,
          iconColor: 'text-blue-500',
          progressColor: 'bg-blue-500'
        };
      default:
        return {
          className: `${baseStyles} bg-gray-50 border-gray-200 text-gray-800`,
          icon: Bell,
          iconColor: 'text-gray-500',
          progressColor: 'bg-gray-500'
        };
    }
  };

  // Get position-based animation classes
  const getAnimationClasses = () => {
    const baseTransition = "transition-all duration-300 ease-in-out";
    
    if (isExiting) {
      switch (position) {
        case 'top-right':
        case 'bottom-right':
          return `${baseTransition} transform translate-x-full opacity-0`;
        case 'top-left':
        case 'bottom-left':
          return `${baseTransition} transform -translate-x-full opacity-0`;
        case 'top-center':
          return `${baseTransition} transform -translate-y-full opacity-0`;
        case 'bottom-center':
          return `${baseTransition} transform translate-y-full opacity-0`;
        default:
          return `${baseTransition} opacity-0 scale-95`;
      }
    }

    if (!isVisible) {
      switch (position) {
        case 'top-right':
        case 'bottom-right':
          return `${baseTransition} transform translate-x-full opacity-0`;
        case 'top-left':
        case 'bottom-left':
          return `${baseTransition} transform -translate-x-full opacity-0`;
        case 'top-center':
          return `${baseTransition} transform -translate-y-full opacity-0`;
        case 'bottom-center':
          return `${baseTransition} transform translate-y-full opacity-0`;
        default:
          return `${baseTransition} opacity-0 scale-95`;
      }
    }

    return `${baseTransition} transform translate-x-0 translate-y-0 opacity-100 scale-100`;
  };

  const styles = getNotificationStyles(notification.type);
  const IconComponent = styles.icon;

  return (
    <div
      ref={toastRef}
      className={`${styles.className} ${getAnimationClasses()} relative overflow-hidden cursor-pointer`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      onClick={() => notification.onClick && notification.onClick()}
    >
      {/* Progress bar for auto-dismiss */}
      {autoDismiss && dismissDelay > 0 && !isExiting && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-10">
          <div 
            className={`h-full ${styles.progressColor} transition-all ease-linear`}
            style={{
              animation: `shrink ${dismissDelay}ms linear forwards`,
              animationPlayState: isVisible ? 'running' : 'paused'
            }}
          />
        </div>
      )}

      {/* Icon */}
      <div className="flex-shrink-0">
        <IconComponent className={`w-5 h-5 ${styles.iconColor}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {notification.title && (
          <h4 className="font-semibold text-sm mb-1 leading-tight">
            {notification.title}
          </h4>
        )}
        <p className="text-sm leading-relaxed">
          {notification.message}
        </p>
        
        {/* Action buttons */}
        {notification.actions && notification.actions.length > 0 && (
          <div className="flex gap-2 mt-3">
            {notification.actions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  action.handler();
                  if (action.dismissOnClick !== false) {
                    handleDismiss();
                  }
                }}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  action.primary
                    ? 'bg-white bg-opacity-20 hover:bg-opacity-30'
                    : 'hover:bg-white hover:bg-opacity-10'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
        className="flex-shrink-0 ml-2 p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

// Toast container component for managing multiple toasts
export const ToastContainer = ({ 
  notifications = [], 
  onDismiss, 
  position = 'top-right',
  maxToasts = 5,
  spacing = 'gap-3'
}) => {
  // Get container position classes
  const getContainerClasses = () => {
    const baseClasses = `fixed z-50 flex flex-col ${spacing} pointer-events-none`;
    
    switch (position) {
      case 'top-right':
        return `${baseClasses} top-4 right-4`;
      case 'top-left':
        return `${baseClasses} top-4 left-4`;
      case 'top-center':
        return `${baseClasses} top-4 left-1/2 transform -translate-x-1/2`;
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4`;
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`;
      case 'bottom-center':
        return `${baseClasses} bottom-4 left-1/2 transform -translate-x-1/2`;
      default:
        return `${baseClasses} top-4 right-4`;
    }
  };

  // Limit number of visible toasts
  const visibleNotifications = notifications.slice(0, maxToasts);

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className={getContainerClasses()}>
      {visibleNotifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationToast
            notification={notification}
            onDismiss={onDismiss}
            position={position}
          />
        </div>
      ))}
      
      {/* Show count if there are more notifications */}
      {notifications.length > maxToasts && (
        <div className="pointer-events-auto">
          <div className="bg-gray-800 text-white text-xs px-3 py-2 rounded-full text-center">
            +{notifications.length - maxToasts} more notifications
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for easy toast usage
export const useToast = () => {
  // This would typically come from your NotificationContext
  // For now, we'll provide a simple implementation
  const [notifications, setNotifications] = React.useState([]);

  const showToast = (notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      type: 'info',
      autoDismiss: true,
      dismissDelay: 5000,
      ...notification
    };
    
    setNotifications(prev => [...prev, newNotification]);
    return id;
  };

  const dismissToast = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const dismissAll = () => {
    setNotifications([]);
  };

  // Convenience methods
  const success = (message, options = {}) => 
    showToast({ type: 'success', message, ...options });
  
  const error = (message, options = {}) => 
    showToast({ type: 'error', message, autoDismiss: false, ...options });
  
  const warning = (message, options = {}) => 
    showToast({ type: 'warning', message, ...options });
  
  const info = (message, options = {}) => 
    showToast({ type: 'info', message, ...options });

  return {
    notifications,
    showToast,
    dismissToast,
    dismissAll,
    success,
    error,
    warning,
    info
  };
};

export default NotificationToast;