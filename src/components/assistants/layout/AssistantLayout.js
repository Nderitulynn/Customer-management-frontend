import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Settings,
  FileText,
  Menu,
  X,
  LogOut
} from 'lucide-react';

const AssistantLayout = ({ children, activeSection, onSectionChange, currentUser, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Enhanced navigation items including invoices
  const navigationItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'customers',
      label: 'My Customers',
      icon: Users
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart
    },
    {
      id: 'invoices',
      label: 'Invoices',
      icon: FileText
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  const handleSectionClick = (sectionId) => {
    onSectionChange(sectionId);
    setMobileMenuOpen(false);
  };

  const getPageTitle = () => {
    switch (activeSection) {
      case 'overview':
        return 'Dashboard';
      case 'customers':
        return 'My Customers';
      case 'orders':
        return 'Orders';
      case 'invoices':
        return 'Invoices';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-white shadow-lg border-r border-gray-200 transition-transform duration-300 ease-in-out
        flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Assistant</h2>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>
          
          {/* Mobile close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {currentUser?.firstName?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentUser?.firstName} {currentUser?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleSectionClick(item.id)}
                className={`
                  w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer - Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Mobile menu button and page title */}
              <div className="flex items-center">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <Menu className="h-6 w-6" />
                </button>
                
                <div className="ml-4 lg:ml-0">
                  <h1 className="text-xl font-semibold text-gray-900">
                    {getPageTitle()}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Welcome back, {currentUser?.firstName}!
                  </p>
                </div>
              </div>

              {/* Header Actions - User Info */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </p>
                </div>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {currentUser?.firstName?.charAt(0) || 'A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AssistantLayout;