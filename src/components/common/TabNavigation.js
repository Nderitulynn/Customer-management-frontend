import React, { useState } from 'react';

// Tab configuration - can be customized based on needs
const DEFAULT_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'customers', label: 'Customers' },
  { id: 'assistants', label: 'Assistants' },
  { id: 'orders', label: 'Orders' }
];

// Individual TabButton component
const TabButton = ({ id, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
      isActive
        ? 'bg-blue-100 text-blue-700 border border-blue-200'
        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
    }`}
  >
    {label}
  </button>
);

// Main TabNavigation component
const TabNavigation = ({ 
  tabs = DEFAULT_TABS, 
  activeTab, 
  onTabChange, 
  className = '' 
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex space-x-2">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            id={tab.id}
            label={tab.label}
            isActive={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
          />
        ))}
      </div>
    </div>
  );
};

// Hook for managing tab state
export const useTabNavigation = (initialTab = 'overview', tabs = DEFAULT_TABS) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (tabId) => {
    // Validate that the tab exists
    const tabExists = tabs.some(tab => tab.id === tabId);
    if (tabExists) {
      setActiveTab(tabId);
    }
  };

  // Get the current active tab object
  const getCurrentTab = () => {
    return tabs.find(tab => tab.id === activeTab) || tabs[0];
  };

  // Check if a specific tab is active
  const isTabActive = (tabId) => {
    return activeTab === tabId;
  };

  // Get next/previous tab for programmatic navigation
  const getNextTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    const nextIndex = (currentIndex + 1) % tabs.length;
    return tabs[nextIndex];
  };

  const getPreviousTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    return tabs[prevIndex];
  };

  const goToNextTab = () => {
    const nextTab = getNextTab();
    setActiveTab(nextTab.id);
  };

  const goToPreviousTab = () => {
    const prevTab = getPreviousTab();
    setActiveTab(prevTab.id);
  };

  return {
    activeTab,
    setActiveTab,
    handleTabChange,
    getCurrentTab,
    isTabActive,
    getNextTab,
    getPreviousTab,
    goToNextTab,
    goToPreviousTab
  };
};

// Enhanced TabNavigation with additional features
export const EnhancedTabNavigation = ({ 
  tabs = DEFAULT_TABS, 
  activeTab, 
  onTabChange,
  showTabCount = false,
  tabCounts = {},
  disabled = [],
  className = '',
  variant = 'default' // 'default', 'pills', 'underline'
}) => {
  const getTabButtonClasses = (tab, isActive) => {
    const baseClasses = "px-4 py-2 font-medium text-sm transition-colors";
    const isDisabled = disabled.includes(tab.id);
    
    if (isDisabled) {
      return `${baseClasses} text-gray-400 cursor-not-allowed opacity-60`;
    }

    switch (variant) {
      case 'pills':
        return `${baseClasses} rounded-full ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        }`;
      
      case 'underline':
        return `${baseClasses} border-b-2 ${
          isActive
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`;
      
      default:
        return `${baseClasses} rounded-lg ${
          isActive
            ? 'bg-blue-100 text-blue-700 border border-blue-200'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        }`;
    }
  };

  const handleTabClick = (tabId) => {
    if (!disabled.includes(tabId)) {
      onTabChange(tabId);
    }
  };

  return (
    <div className={`mb-6 ${className}`}>
      <div className={`flex ${variant === 'underline' ? 'border-b border-gray-200' : 'space-x-2'}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isDisabled = disabled.includes(tab.id);
          const count = tabCounts[tab.id];

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              disabled={isDisabled}
              className={getTabButtonClasses(tab, isActive)}
            >
              <span className="flex items-center space-x-2">
                <span>{tab.label}</span>
                {showTabCount && typeof count !== 'undefined' && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    isActive 
                      ? 'bg-blue-200 text-blue-800' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Vertical tab navigation variant
export const VerticalTabNavigation = ({ 
  tabs = DEFAULT_TABS, 
  activeTab, 
  onTabChange,
  className = '' 
}) => {
  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 text-left font-medium text-sm rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export { TabButton };
export default TabNavigation;