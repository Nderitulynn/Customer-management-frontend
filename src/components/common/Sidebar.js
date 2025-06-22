import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  User,
  Shield,
  Truck,
  FileText,
  Bell,
  LogOut,
  Menu,
  X,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import RoleBasedComponent from '../auth/RoleBasedComponent';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const navigationItems = [
    {
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      roles: ['admin', 'manager', 'employee']
    },
    {
      label: 'Users',
      icon: Users,
      path: '/users',
      roles: ['admin', 'manager']
    },
    {
      label: 'Products',
      icon: Package,
      path: '/products',
      roles: ['admin', 'manager', 'employee']
    },
    {
      label: 'Orders',
      icon: ShoppingCart,
      path: '/orders',
      roles: ['admin', 'manager', 'employee']
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      path: '/analytics',
      roles: ['admin', 'manager']
    },
    {
      label: 'Reports',
      icon: FileText,
      path: '/reports',
      roles: ['admin', 'manager']
    },
    {
      label: 'Notifications',
      icon: Bell,
      path: '/notifications',
      roles: ['admin', 'manager', 'employee']
    },
    {
      label: 'Settings',
      icon: Settings,
      path: '/settings',
      roles: ['admin']
    }
  ];

  const quickStats = [
    { label: 'Active Users', value: '1,234', change: '+12%', color: 'text-green-600' },
    { label: 'Total Orders', value: '856', change: '+8%', color: 'text-blue-600' },
    { label: 'Revenue', value: '$45,678', change: '+15%', color: 'text-purple-600' }
  ];

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return Shield;
      case 'manager':
        return User;
      case 'employee':
        return Activity;
      default:
        return User;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'text-red-500 bg-red-100';
      case 'manager':
        return 'text-blue-500 bg-blue-100';
      case 'employee':
        return 'text-green-500 bg-green-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const isActive = (path) => {
    return location.pathname === path || 
           (path !== '/dashboard' && location.pathname.startsWith(path));
  };

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    
    return (
      <RoleBasedComponent allowedRoles={item.roles}>
        <Link
          to={item.path}
          className={`
            flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
            ${active 
              ? 'bg-blue-600 text-white shadow-md' 
              : isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }
            ${isCollapsed ? 'justify-center' : 'justify-start'}
          `}
          title={isCollapsed ? item.label : ''}
        >
          <Icon size={20} className="flex-shrink-0" />
          {!isCollapsed && (
            <span className="ml-3 transition-opacity duration-200">
              {item.label}
            </span>
          )}
        </Link>
      </RoleBasedComponent>
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Mobile overlay
  if (isMobileOpen) {
    return (
      <>
        {/* Mobile backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
        
        {/* Mobile sidebar */}
        <div className={`
          fixed top-0 left-0 z-50 h-full w-64 transform transition-transform duration-300 ease-in-out lg:hidden
          ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
          shadow-xl
        `}>
          {/* Mobile header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Navigation
            </h2>
            <button
              onClick={() => setIsMobileOpen(false)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Mobile navigation content */}
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </nav>
          </div>
          
          {/* Mobile user section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className={`
                flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <LogOut size={20} />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className={`
          fixed top-4 left-4 z-30 p-2 rounded-lg transition-colors lg:hidden
          ${isDarkMode 
            ? 'bg-gray-800 text-white hover:bg-gray-700' 
            : 'bg-white text-gray-900 hover:bg-gray-50'
          }
          shadow-lg border border-gray-200 dark:border-gray-700
        `}
      >
        <Menu size={20} />
      </button>

      {/* Desktop sidebar */}
      <div className={`
        hidden lg:flex flex-col h-full transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        border-r shadow-sm
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {!isCollapsed && (
            <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Dashboard
            </h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`
              p-2 rounded-lg transition-colors
              ${isDarkMode 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'
              }
            `}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${getRoleColor(user?.role)} dark:bg-opacity-20
            `}>
              {React.createElement(getRoleIcon(user?.role), { size: 20 })}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user?.name || 'User'}
                </h3>
                <p className={`text-xs capitalize truncate ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {user?.role || 'employee'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navigationItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>

        {/* Quick Stats */}
        {!isCollapsed && (
          <RoleBasedComponent allowedRoles={['admin', 'manager']}>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className={`text-xs font-semibold uppercase tracking-wide mb-3 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Quick Stats
              </h4>
              <div className="space-y-3">
                {quickStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs truncate ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {stat.label}
                      </p>
                      <p className={`text-sm font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {stat.value}
                      </p>
                    </div>
                    <span className={`text-xs font-medium ${stat.color}`}>
                      {stat.change}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </RoleBasedComponent>
        )}

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className={`
              flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }
              ${isCollapsed ? 'justify-center' : 'justify-start'}
            `}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;