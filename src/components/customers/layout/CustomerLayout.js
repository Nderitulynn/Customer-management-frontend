import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { 
  User, 
  Package, 
  Plus, 
  Home, 
  Menu, 
  X, 
  LogOut,
  ChevronLeft
} from 'lucide-react';

const CustomerLayout = ({ children, title, showBackButton = false, maxWidth = 'max-w-3xl' }) => {
  const { user, logout, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleBackClick = () => {
    window.history.back();
  };

  // Navigation items for customers
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/customer-dashboard',
      icon: Home,
      current: window.location.pathname === '/customer-dashboard'
    },
    {
      name: 'My Orders',
      href: '/customer/orders',
      icon: Package,
      current: window.location.pathname.startsWith('/customer/orders') && !window.location.pathname.includes('/new')
    },
    {
      name: 'New Order',
      href: '/customer/orders/new',
      icon: Plus,
      current: window.location.pathname === '/customer/orders/new'
    },
    {
      name: 'Profile',
      href: '/customer/profile',
      icon: User,
      current: window.location.pathname === '/customer/profile'
    }
  ];

  const NavLink = ({ item, mobile = false }) => {
    const baseClasses = mobile
      ? "flex items-center px-3 py-2.5 text-sm font-medium rounded transition-colors"
      : "flex items-center px-3 py-2 text-sm font-medium rounded transition-colors";
    
    const activeClasses = item.current
      ? "bg-blue-50 text-blue-700"
      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50";

    return (
      <a
        href={item.href}
        className={`${baseClasses} ${activeClasses}`}
        onClick={mobile ? closeMobileMenu : undefined}
      >
        <item.icon className={`mr-3 h-4 w-4 ${item.current ? 'text-blue-600' : 'text-gray-400'}`} />
        {item.name}
      </a>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <button
                  onClick={handleBackClick}
                  className="p-1.5 text-gray-400 hover:text-gray-600 lg:hidden"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
          
            </div>

            {/* Right side - Mobile menu button only */}
            <div className="flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-1.5 text-gray-400 hover:text-gray-600"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-3 space-y-1">
              {/* User info (mobile) */}
              <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded mb-3">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || user?.firstName || 'Customer'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>

              {/* Navigation */}
              {navigationItems.map((item) => (
                <NavLink key={item.name} item={item} mobile={true} />
              ))}

              {/* Logout (mobile) */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center px-3 py-2.5 text-sm text-gray-600 hover:text-red-600 rounded transition-colors disabled:opacity-50 mt-3"
              >
                <LogOut className="h-4 w-4 mr-3" />
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <div className="w-56 bg-white shadow-sm h-screen fixed left-0 top-14 border-r">
          <nav className="p-4 space-y-1">
            {navigationItems.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content - Flexible width based on content needs */}
      <main className="md:ml-56 p-4">
        <div className={`mx-auto ${maxWidth}`}>
          {/* Page title (mobile) */}
          {title && (
            <div className="md:hidden mb-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                {showBackButton && (
                  <button
                    onClick={handleBackClick}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              </div>
            </div>
          )}

          {/* Page Content */}
          {children}
        </div>
      </main>
    </div>
  );
};

export default CustomerLayout;