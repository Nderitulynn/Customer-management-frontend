import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, 
  Package, 
  Plus, 
  Home, 
  Menu, 
  X, 
  LogOut,
  Bell,
  Settings,
  Search,
  ChevronDown,
  MessageCircle
} from 'lucide-react';

const CustomerNavigation = ({ 
  variant = 'full', // 'full', 'minimal', 'mobile-only'
  showSearch = false,
  showNotifications = false,
  className = '',
  onNavigate
}) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  // Update current path on route changes
  useEffect(() => {
    setCurrentPath(window.location.pathname);
    
    // Listen for navigation changes
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const handleNavigation = (href, itemName) => {
    if (onNavigate) {
      onNavigate(href, itemName);
    } else {
      window.location.href = href;
    }
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsMobileMenuOpen(false);
  };

  // Main navigation items
  const mainNavItems = [
    {
      name: 'Dashboard',
      href: '/customer-dashboard',
      icon: Home,
      current: currentPath === '/customer-dashboard',
      description: 'Overview and quick actions'
    },
    {
      name: 'My Orders',
      href: '/customer/orders',
      icon: Package,
      current: currentPath.startsWith('/customer/orders') && !currentPath.includes('/new'),
      description: 'View and track your orders',
      badge: '3' // Example badge for pending orders
    },
    {
      name: 'Create Order',
      href: '/customer/orders/new',
      icon: Plus,
      current: currentPath === '/customer/orders/new',
      description: 'Place a new order'
    },
    {
      name: 'Support',
      href: '/customer/support',
      icon: MessageCircle,
      current: currentPath.startsWith('/customer/support'),
      description: 'Get help and support'
    }
  ];

  // User menu items
  const userMenuItems = [
    {
      name: 'My Profile',
      href: '/customer/profile',
      icon: User,
      description: 'Manage your account settings'
    },
    {
      name: 'Settings',
      href: '/customer/settings',
      icon: Settings,
      description: 'Preferences and notifications'
    }
  ];

  // Navigation link component
  const NavLink = ({ item, variant = 'default', onClick }) => {
    const isActive = item.current;
    
    const baseClasses = {
      default: "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
      mobile: "flex items-center px-4 py-3 text-base font-medium rounded-lg transition-all duration-200",
      minimal: "flex items-center px-2 py-1 text-sm font-medium rounded-md transition-all duration-200"
    };

    const activeClasses = isActive
      ? "bg-blue-100 text-blue-700 border border-blue-200 shadow-sm"
      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 border border-transparent";

    return (
      <button
        onClick={() => onClick ? onClick() : handleNavigation(item.href, item.name)}
        className={`${baseClasses[variant]} ${activeClasses} w-full text-left relative`}
        title={item.description}
      >
        <item.icon className={`mr-3 h-5 w-5 transition-colors duration-200 ${
          isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'
        }`} />
        <span className="flex-1">{item.name}</span>
        
        {/* Badge for notifications/counts */}
        {item.badge && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {item.badge}
          </span>
        )}
        
        {/* Active indicator */}
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full"></div>
        )}
      </button>
    );
  };

  // User avatar component
  const UserAvatar = ({ size = 'md', showName = true }) => {
    const sizeClasses = {
      sm: 'h-6 w-6',
      md: 'h-8 w-8', 
      lg: 'h-10 w-10'
    };

    const textSizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base'
    };

    return (
      <div className="flex items-center space-x-3">
        {showName && (
          <div className="text-right hidden sm:block">
            <p className={`font-medium text-gray-900 ${textSizeClasses[size]}`}>
              {user?.name || user?.firstName || 'Customer'}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        )}
        <div className={`${sizeClasses[size]} bg-blue-100 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm`}>
          <User className={`h-${size === 'sm' ? '3' : size === 'md' ? '4' : '5'} w-${size === 'sm' ? '3' : size === 'md' ? '4' : '5'} text-blue-600`} />
        </div>
      </div>
    );
  };

  // Search component
  const SearchBar = () => (
    <div className="relative max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Search orders, products..."
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );

  // Notifications button
  const NotificationsButton = () => (
    <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
      <Bell className="h-5 w-5" />
      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
    </button>
  );

  // Render different variants
  if (variant === 'minimal') {
    return (
      <nav className={`flex items-center space-x-2 ${className}`}>
        {mainNavItems.slice(0, 3).map((item) => (
          <NavLink key={item.name} item={item} variant="minimal" />
        ))}
      </nav>
    );
  }

  if (variant === 'mobile-only') {
    return (
      <div className={`md:hidden ${className}`}>
        <button
          onClick={toggleMobileMenu}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          aria-label="Open menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
            <div className="px-4 py-3 space-y-1">
              {/* User info */}
              <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg mb-4">
                <UserAvatar size="lg" showName={true} />
              </div>

              {/* Main navigation */}
              {mainNavItems.map((item) => (
                <NavLink key={item.name} item={item} variant="mobile" />
              ))}

              <hr className="my-4" />

              {/* User menu items */}
              {userMenuItems.map((item) => (
                <NavLink key={item.name} item={item} variant="mobile" />
              ))}

              {/* Logout */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center px-4 py-3 text-base font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50 mt-4 border-t pt-4"
              >
                <LogOut className="h-5 w-5 mr-3" />
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full navigation (default)
  return (
    <nav className={`bg-white ${className}`}>
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Brand */}
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Customer Portal
              </h1>
            </div>

            {/* Center: Search */}
            {showSearch && (
              <div className="flex-1 max-w-2xl mx-8">
                <SearchBar />
              </div>
            )}

            {/* Right: Actions and User */}
            <div className="flex items-center space-x-4">
              {showNotifications && <NotificationsButton />}

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <UserAvatar size="md" showName={true} />
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {userMenuItems.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => handleNavigation(item.href, item.name)}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <item.icon className="h-4 w-4 mr-3 text-gray-400" />
                        <div className="text-left">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.description}</div>
                        </div>
                      </button>
                    ))}
                    
                    <hr className="my-2" />
                    
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1 py-2">
              {mainNavItems.map((item) => (
                <NavLink key={item.name} item={item} variant="default" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="flex justify-between items-center h-16 px-4">
          <h1 className="text-lg font-semibold text-gray-900">Portal</h1>
          
          <div className="flex items-center space-x-2">
            {showNotifications && <NotificationsButton />}
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {/* User info */}
              <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg mb-4">
                <UserAvatar size="lg" showName={true} />
              </div>

              {/* Search (mobile) */}
              {showSearch && (
                <div className="mb-4">
                  <SearchBar />
                </div>
              )}

              {/* Navigation items */}
              {mainNavItems.map((item) => (
                <NavLink key={item.name} item={item} variant="mobile" />
              ))}

              <hr className="my-4" />

              {/* User menu items */}
              {userMenuItems.map((item) => (
                <NavLink key={item.name} item={item} variant="mobile" />
              ))}

              {/* Logout */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center px-4 py-3 text-base font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50 mt-4 border-t pt-4"
              >
                <LogOut className="h-5 w-5 mr-3" />
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default CustomerNavigation;