import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Bell, 
  User, 
  LogOut, 
  Settings,
  MessageCircle
} from 'lucide-react';

const CustomerHeader = ({ 
  activeSection, 
  onMobileMenuToggle, 
  currentUser, 
  onLogout,
  unreadMessageCount = 0
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get section title
  const getSectionTitle = () => {
    switch (activeSection) {
      case 'overview':
        return 'Dashboard Overview';
      case 'orders':
        return 'My Orders';
      case 'order-details':
        return 'Order Details';
      case 'create-order':
        return 'Create New Order';
      case 'profile':
        return 'Account Settings';
      case 'messages':
        return 'Messages';
      default:
        return 'Dashboard Overview';
    }
  };

  // Sample notifications for display
  const notifications = [
    {
      id: 1,
      title: 'Order Update',
      message: 'Your order #ORD-001 has been shipped',
      time: '2 hours ago',
      unread: true,
      type: 'order'
    },
    {
      id: 2,
      title: 'New Message',
      message: 'You have received a new message from support',
      time: '1 day ago',
      unread: true,
      type: 'message'
    }
  ];

  const notificationCount = notifications.filter(n => n.unread).length;
  const totalUnreadCount = unreadMessageCount + notificationCount;

  const handleNotificationClick = (notification) => {
    console.log('Notification clicked:', notification);
  };

  // Get current date
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric', 
      year: 'numeric'
    });
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>

        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getSectionTitle()}
          </h1>
         
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Date Display */}
        <div className="hidden md:block text-right">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Today
          </div>
          <div className="text-lg font-bold text-gray-900">
            {getCurrentDate()}
          </div>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                  {totalUnreadCount > 0 && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      {totalUnreadCount} new
                    </span>
                  )}
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {/* Unread Messages Notice */}
                {unreadMessageCount > 0 && (
                  <div className="px-4 py-3 border-b border-gray-100 bg-blue-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          {unreadMessageCount} unread message{unreadMessageCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                        View All
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Sample Notifications */}
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                        notification.unread ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className={`text-sm ${
                              notification.unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            {notification.unread && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications</p>
                  </div>
                )}
              </div>
              
              {(notifications.length > 0 || unreadMessageCount > 0) && (
                <div className="px-4 py-3 border-t border-gray-200">
                  <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    View all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Info Section */}
        <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-gray-900">
              {currentUser?.name || currentUser?.email?.split('@')[0] || 'Customer'}
            </div>
            <div className="text-xs text-gray-500">
              Customer
            </div>
          </div>
          
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>

          {/* Settings/Logout Menu */}
          <div className="flex items-center space-x-1">
            <button
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-red-600"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;