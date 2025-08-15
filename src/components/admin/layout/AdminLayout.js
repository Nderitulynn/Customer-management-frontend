import React, { useState } from 'react';
import { Bell, Menu, X, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ 
  children, 
  activeSection, 
  onSectionChange, 
  isSidebarCollapsed = false,
  onToggleSidebar 
}) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleMobileSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleToggleDesktopSidebar = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 relative z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {/* Mobile sidebar toggle */}
              <button
                onClick={toggleMobileSidebar}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 mr-2"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Desktop sidebar collapse toggle */}
              <button
                onClick={handleToggleDesktopSidebar}
                className="hidden lg:block p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 mr-3 transition-colors"
                title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isSidebarCollapsed ? (
                  <PanelLeftOpen className="h-5 w-5" />
                ) : (
                  <PanelLeftClose className="h-5 w-5" />
                )}
              </button>
              
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {user?.name || 'Admin'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={closeMobileSidebar}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}

      {/* Layout Container */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className={`flex flex-col transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? 'w-16' : 'w-64'
          }`}>
            <AdminSidebar 
              activeSection={activeSection}
              onSectionChange={onSectionChange}
              userRole={user?.role || 'admin'}
              isCollapsed={isSidebarCollapsed}
            />
          </div>
        </div>

        {/* Mobile Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:hidden`}>
          <div className="flex flex-col h-full">
            {/* Mobile sidebar header */}
            <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
              <button
                onClick={closeMobileSidebar}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <AdminSidebar 
              activeSection={activeSection}
              onSectionChange={(section) => {
                onSectionChange(section);
                closeMobileSidebar(); // Close mobile sidebar after selection
              }}
              userRole={user?.role || 'admin'}
              isCollapsed={false} // Mobile sidebar is never collapsed
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content Container */}
          <main className="flex-1 overflow-y-auto">
            <div className="px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;