import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  MessageSquare, 
  User,
  FileText,
  X
} from 'lucide-react';

const AssistantSidebar = ({ 
  activeSection, 
  setActiveSection,
  isMobileOpen = false,
  onMobileClose = () => {}
}) => {
  // Navigation items configuration with invoices added
  const navigationItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      description: 'Dashboard overview'
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      description: 'Manage customers'
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart,
      description: 'Order management'
    },
    {
      id: 'invoices',
      label: 'Invoices',
      icon: FileText,
      description: 'Invoice management'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      description: 'Communication'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: User,
      description: 'Account settings'
    }
  ];

  const handleNavigation = (sectionId) => {
    setActiveSection(sectionId);
    // Close mobile sidebar when navigation item is clicked
    if (isMobileOpen) {
      onMobileClose();
    }
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0 lg:z-auto
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-sm">A</span>
            </div>
            <h2 className="ml-3 text-lg font-semibold text-gray-900">
              Assistant
            </h2>
          </div>
          
          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`
                  w-full flex items-center px-3 py-3 text-left rounded-lg transition-colors duration-200
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`
                  h-5 w-5 mr-3 flex-shrink-0
                  ${isActive ? 'text-blue-600' : 'text-gray-500'}
                `} />
                <div className="flex-1 min-w-0">
                  <p className={`
                    text-sm font-medium truncate
                    ${isActive ? 'text-blue-700' : 'text-gray-900'}
                  `}>
                    {item.label}
                  </p>
                  <p className={`
                    text-xs truncate mt-0.5
                    ${isActive ? 'text-blue-600' : 'text-gray-500'}
                  `}>
                    {item.description}
                  </p>
                </div>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </nav>   
      </div>
    </>
  );
};

export default AssistantSidebar;