import React from 'react';
import { Menu, Settings, LogOut } from 'lucide-react';

const AssistantHeader = ({ 
  activeSection, 
  onMobileMenuToggle,
  currentUser,
  onLogout,
  onSettings
}) => {
  // Get page title based on active section
  const getPageTitle = () => {
    switch (activeSection) {
      case 'overview':
        return 'Dashboard Overview';
      case 'customers':
        return 'My Customers';
      case 'orders':
        return 'Orders Management';
      case 'invoices':
        return 'Invoice Management';
      case 'messages':
        return 'Messages';
      case 'settings':
        return 'Profile Settings';
      default:
        return 'Dashboard';
    }
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Show greeting banner only on overview section
  const showGreetingBanner = activeSection === 'overview';

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Mobile menu button and page title */}
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={onMobileMenuToggle}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Open sidebar"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              {/* Page title */}
              <div className="ml-4 lg:ml-0">
                <h1 className="text-xl font-semibold text-gray-900">
                  {getPageTitle()}
                </h1>
              </div>
            </div>

            {/* Right side - User info, settings, and logout */}
            <div className="flex items-center space-x-4">
              {/* User avatar and info */}
              <div className="flex items-center space-x-3">
                {/* User details - hidden on mobile */}
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Assistant
                  </p>
                </div>

                {/* User avatar */}
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {currentUser?.firstName?.charAt(0) || 'A'}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2">
                {/* Settings button */}
                <button
                  onClick={onSettings}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Settings"
                  aria-label="Settings"
                >
                  <Settings className="h-5 w-5" />
                </button>

                {/* Logout button */}
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Banner - Only show on overview section, styled as content not header */}
      {showGreetingBanner && (
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-6 mb-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium text-gray-800 mb-1">
                  {getGreeting()}
                </h2>
                <p className="text-sm text-gray-600">Here's what's happening with your customers today.</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Today</p>
                <p className="text-lg font-semibold text-gray-800">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AssistantHeader;