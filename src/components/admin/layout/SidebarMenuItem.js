import React, { useState } from 'react';

const SidebarMenuItem = ({ 
  id, 
  label, 
  icon: Icon, 
  isActive = false, 
  onClick, 
  variant = 'default',
  isCollapsed = false 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  const baseClasses = `
    relative flex items-center w-full text-left transition-all duration-200 ease-in-out
    ${isCollapsed ? 'px-3 py-3 justify-center' : 'px-3 py-2'}
    rounded-lg group focus:outline-none focus:ring-2 focus:ring-blue-500
  `;

  const getVariantClasses = () => {
    if (variant === 'danger') {
      return isActive
        ? 'bg-red-100 text-red-800 border border-red-200'
        : 'text-red-600 hover:bg-red-50 hover:text-red-700';
    }

    return isActive
      ? 'bg-blue-100 text-blue-800 border border-blue-200'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  };

  const tooltipClasses = `
    absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded
    whitespace-nowrap z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible
    transition-all duration-200 pointer-events-none
  `;

  return (
    <div className="relative">
      <button
        className={`${baseClasses} ${getVariantClasses()}`}
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        title={isCollapsed ? label : undefined}
      >
        {/* Icon */}
        <Icon 
          className={`flex-shrink-0 transition-all duration-200 ${
            isCollapsed ? 'h-5 w-5' : 'h-5 w-5 mr-3'
          }`} 
        />
        
        {/* Label - hidden when collapsed */}
        {!isCollapsed && (
          <span className="font-medium text-sm transition-opacity duration-300">
            {label}
          </span>
        )}

        {/* Active indicator */}
        {isActive && (
          <div className={`absolute transition-all duration-200 ${
            isCollapsed 
              ? 'right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-l'
              : 'right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full'
          }`} />
        )}

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className={tooltipClasses}>
            {label}
            {/* Tooltip arrow */}
            <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900" />
          </div>
        )}
      </button>
    </div>
  );
};

export default SidebarMenuItem;