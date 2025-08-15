import React from 'react';

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

const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'customers', label: 'Customers' },
    { id: 'assistants', label: 'Assistants' },
    { id: 'orders', label: 'Orders' }
  ];

  return (
    <div className="mb-6">
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

export default TabNavigation;