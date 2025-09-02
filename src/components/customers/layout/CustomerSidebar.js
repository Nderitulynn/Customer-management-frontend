import React from 'react';
import { Home, Package, User, FileText, Settings } from 'lucide-react';

const CustomerSidebar = ({ 
  activeSection, 
  setActiveSection, 
  isMobileOpen, 
  onMobileClose,
  currentUser
}) => {
  const menuItems = [
    {
      id: 'overview',
      label: 'Overview',
      description: 'Dashboard overview',
      icon: Home,
    },
    {
      id: 'orders',
      label: 'Orders',
      description: 'Order management',
      icon: Package,
    },
    {
      id: 'create-order',
      label: 'New Order',
      description: 'Create new order',
      icon: FileText,
    },
    // Messages menu item removed
    // {
    //   id: 'messages',
    //   label: 'Messages',
    //   description: 'Communication',
    //   icon: MessageCircle,
    // },
    {
      id: 'profile',
      label: 'Settings',
      description: 'Account settings',
      icon: Settings,
    }
  ];

  const handleItemClick = (sectionId) => {
    setActiveSection(sectionId);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Logo/Brand Section */}
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <span className="ml-3 text-lg font-semibold text-gray-900">Customer</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <div key={item.id} className="relative">
                  <button
                    onClick={() => handleItemClick(item.id)}
                    className={`
                      group w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <IconComponent className={`
                      h-5 w-5 mr-3 flex-shrink-0
                      ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}
                    `} />
                    <div className="flex-1 text-left">
                      <div className={`font-medium ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </button>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-lg"></div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section at Bottom */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {currentUser?.name || currentUser?.email?.split('@')[0] || 'Customer'}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {currentUser?.role || 'Customer'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerSidebar;