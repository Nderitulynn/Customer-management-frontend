import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Eye, 
  ArrowRight,
  DollarSign,
  Users,
  ShoppingCart,
  Calendar,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

const DashboardCard = ({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  trendType = 'percentage', // 'percentage', 'number', 'currency'
  onClick,
  loading = false,
  icon: IconComponent,
  variant = 'default', // 'default', 'success', 'warning', 'danger', 'info'
  size = 'default', // 'default', 'compact', 'expanded'
  showViewMore = false,
  className = '',
  children,
  formatValue = (val) => val,
  ...props
}) => {
  // Determine trend direction and styling
  const getTrendInfo = () => {
    if (!trend || trend === 0) {
      return {
        icon: Minus,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        direction: 'neutral'
      };
    }
    
    const isPositive = trend > 0;
    return {
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      bgColor: isPositive ? 'bg-green-50' : 'bg-red-50',
      direction: isPositive ? 'up' : 'down'
    };
  };

  // Format trend value based on type
  const formatTrendValue = (value) => {
    if (!value && value !== 0) return '';
    
    switch (trendType) {
      case 'percentage':
        return `${Math.abs(value)}%`;
      case 'currency':
        return `$${Math.abs(value).toLocaleString()}`;
      case 'number':
        return Math.abs(value).toLocaleString();
      default:
        return Math.abs(value);
    }
  };

  // Get variant styling
  const getVariantStyles = () => {
    const variants = {
      default: 'border-gray-200 bg-white hover:bg-gray-50',
      success: 'border-green-200 bg-green-50 hover:bg-green-100',
      warning: 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100',
      danger: 'border-red-200 bg-red-50 hover:bg-red-100',
      info: 'border-blue-200 bg-blue-50 hover:bg-blue-100'
    };
    return variants[variant] || variants.default;
  };

  // Get size styling
  const getSizeStyles = () => {
    const sizes = {
      compact: 'p-4',
      default: 'p-6',
      expanded: 'p-8'
    };
    return sizes[size] || sizes.default;
  };

  // Get icon styling based on variant
  const getIconStyles = () => {
    const iconStyles = {
      default: 'text-blue-600 bg-blue-100',
      success: 'text-green-600 bg-green-100',
      warning: 'text-yellow-600 bg-yellow-100',
      danger: 'text-red-600 bg-red-100',
      info: 'text-blue-600 bg-blue-100'
    };
    return iconStyles[variant] || iconStyles.default;
  };

  const trendInfo = getTrendInfo();
  const isClickable = onClick || showViewMore;

  return (
    <div
      className={`
        relative rounded-lg border transition-all duration-200 shadow-sm
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${isClickable ? 'cursor-pointer hover:shadow-md' : ''}
        ${className}
      `}
      onClick={isClickable ? onClick : undefined}
      {...props}
    >
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Header with Icon and Title */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {IconComponent && (
            <div className={`p-3 rounded-full ${getIconStyles()}`}>
              <IconComponent className="w-6 h-6" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
        
        {showViewMore && (
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Value */}
      <div className="mb-4">
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {loading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
          ) : (
            formatValue(value)
          )}
        </div>
        
        {/* Trend Indicator */}
        {(trend || trend === 0) && !loading && (
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${trendInfo.bgColor}`}>
              <trendInfo.icon className={`w-3 h-3 ${trendInfo.color}`} />
              <span className={`text-xs font-medium ${trendInfo.color}`}>
                {formatTrendValue(trendValue || trend)}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {trendInfo.direction === 'up' && 'vs last period'}
              {trendInfo.direction === 'down' && 'vs last period'}
              {trendInfo.direction === 'neutral' && 'no change'}
            </span>
          </div>
        )}

        {loading && (
          <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mt-2"></div>
        )}
      </div>

      {/* Children Content */}
      {children && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {children}
        </div>
      )}

      {/* Click Indicator */}
      {isClickable && !loading && (
        <div className="absolute bottom-2 right-2 opacity-50">
          <Eye className="w-4 h-4 text-gray-400" />
        </div>
      )}
    </div>
  );
};

// Preset card configurations for common use cases
export const presetCards = {
  revenue: {
    title: 'Total Revenue',
    icon: DollarSign,
    variant: 'success',
    formatValue: (value) => `$${value?.toLocaleString() || '0'}`
  },
  customers: {
    title: 'Total Customers',
    icon: Users,
    variant: 'info',
    formatValue: (value) => value?.toLocaleString() || '0'
  },
  orders: {
    title: 'Total Orders',
    icon: ShoppingCart,
    variant: 'default',
    formatValue: (value) => value?.toLocaleString() || '0'
  },
  appointments: {
    title: 'Appointments',
    icon: Calendar,
    variant: 'warning',
    formatValue: (value) => value?.toLocaleString() || '0'
  },
  completedTasks: {
    title: 'Completed Tasks',
    icon: CheckCircle,
    variant: 'success',
    formatValue: (value) => value?.toLocaleString() || '0'
  },
  pendingTasks: {
    title: 'Pending Tasks',
    icon: Clock,
    variant: 'warning',
    formatValue: (value) => value?.toLocaleString() || '0'
  },
  rating: {
    title: 'Average Rating',
    icon: Star,
    variant: 'info',
    formatValue: (value) => value ? `${value.toFixed(1)}/5` : '0/5'
  },
  alerts: {
    title: 'Active Alerts',
    icon: AlertCircle,
    variant: 'danger',
    formatValue: (value) => value?.toLocaleString() || '0'
  }
};

// Quick preset card component
export const PresetCard = ({ preset, ...props }) => {
  const config = presetCards[preset];
  if (!config) {
    console.warn(`Preset "${preset}" not found. Available presets:`, Object.keys(presetCards));
    return <DashboardCard {...props} />;
  }
  
  return <DashboardCard {...config} {...props} />;
};

export default DashboardCard;