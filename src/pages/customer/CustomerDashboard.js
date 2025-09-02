import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import customerOrderService from '../../services/customerOrderService';

// Import layout components
import CustomerSidebar from '../../components/customers/layout/CustomerSidebar';
import CustomerHeader from '../../components/customers/layout/CustomerHeader';
import CustomerMain from '../../components/customers/layout/CustomerMain';

// Import section components
import CustomerProfile from './CustomerProfile';
import CustomerOrders from './CustomerOrders';
import CustomerOrderDetails from './CustomerOrderDetails';
import CustomerCreateOrder from './CustomerCreateOrder';

import { 
  Package, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  DollarSign,
  ArrowRight,
  User,
  FileText,
  Star,
  Activity,
  Eye,
  Edit,
  RefreshCw
} from 'lucide-react';

const CustomerDashboard = () => {
  const { user, logout, isAuthenticated, isCustomer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Section switching state
  const [activeSection, setActiveSection] = useState('overview');
  
  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Extract section from URL path - FIXED LOGIC
  useEffect(() => {
    const path = location.pathname;
    console.log('Current path:', path); // Debug log
    
    if (path.includes('/customer/profile')) {
      setActiveSection('profile');
    } else if (path.includes('/customer/orders/new')) {
      setActiveSection('create-order');
    } else if (path.match(/\/customer\/orders\/[^/]+$/)) { // Fixed regex for order details
      setActiveSection('order-details');
    } else if (path === '/customer/orders') { // Exact match for orders list
      setActiveSection('orders');
    } else if (path === '/customer-dashboard' || path === '/customer') {
      setActiveSection('overview');
    } else {
      // Default fallback
      setActiveSection('overview');
    }
  }, [location.pathname]);

  // Load dashboard data on component mount
  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      // Check authentication and role using context
      if (!isAuthenticated || !isCustomer()) {
        navigate('/login');
        return;
      }
      
      console.log('Customer dashboard initialized for user:', user?.email);
      await loadDashboardData();
      
    } catch (err) {
      console.error('Dashboard initialization error:', err);
      setError('Failed to initialize dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Close mobile sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setError(null);

      // Make parallel API calls for all dashboard data
      const [statsResponse, recentOrdersResponse] = await Promise.all([
        customerOrderService.getMyOrderStats(),
        customerOrderService.getMyRecentOrders()
      ]);

      const dashboardData = {
        stats: statsResponse.data || statsResponse,
        recentOrders: recentOrdersResponse.data || recentOrdersResponse,
        // Recent activity will come from API when available
        recentActivity: []
      };

      setDashboardData(dashboardData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
      
      // Set empty data structure to prevent crashes
      setDashboardData({
        stats: {
          totalOrders: 0,
          activeOrders: 0,
          completedOrders: 0,
          totalSpent: 0
        },
        recentOrders: [],
        recentActivity: []
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  // STANDARDIZED STATUS COLORS
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
      case 'canceled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return CheckCircle;
      case 'in_progress':
      case 'processing':
        return Clock;
      case 'pending':
        return AlertCircle;
      default:
        return Package;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount || 0);
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInHours = Math.floor((now - past) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  // Mobile sidebar handlers
  const handleMobileSidebarToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleMobileSidebarClose = () => {
    setIsMobileSidebarOpen(false);
  };

  // Logout handler using auth context
  const handleLogout = async () => {
    try {
      console.log('Initiating logout...');
      await logout(); // This will handle everything: server logout, clear storage, redirect
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, the context will still clear and redirect
    }
  };

  // Settings handler
  const handleSettings = () => {
    setActiveSection('profile');
    // Close mobile sidebar if open
    setIsMobileSidebarOpen(false);
    // Update URL
    navigate('/customer/profile');
  };

  // FIXED SECTION CHANGE HANDLER
  const handleSectionChange = (section) => {
    setActiveSection(section);
    setIsMobileSidebarOpen(false);
    
    // Update URL based on section - CONSISTENT ROUTING
    switch (section) {
      case 'overview':
        navigate('/customer-dashboard');
        break;
      case 'orders':
        navigate('/customer/orders');
        break;
      case 'profile':
        navigate('/customer/profile');
        break;
      case 'create-order':
        navigate('/customer/orders/new');
        break;
      default:
        navigate('/customer-dashboard');
    }
  };

  // Calculate percentage changes (this would ideally come from API)
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return 'New';
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  // Overview section component - REMOVED REDUNDANT ELEMENTS
  const OverviewSection = () => {
    // Get stats from API data
    const stats = dashboardData?.stats || {};
    
    // Summary cards data from API
    const summaryCards = [
      {
        title: 'Total Orders',
        value: stats.totalOrders || 0,
        icon: Package,
        color: 'blue',
        change: stats.totalOrdersChange || 'No data'
      },
      {
        title: 'Active Orders',
        value: stats.activeOrders || 0,
        icon: Clock,
        color: 'orange',
        change: stats.activeOrdersChange || 'No data'
      },
      {
        title: 'Completed Orders',
        value: stats.completedOrders || 0,
        icon: CheckCircle,
        color: 'green',
        change: stats.completedOrdersChange || 'No data'
      },
      {
        title: 'Total Spent',
        value: formatCurrency(stats.totalSpent || 0),
        icon: DollarSign,
        color: 'purple',
        change: stats.totalSpentChange || 'No data'
      }
    ];

    // Quick action buttons
    const quickActions = [
      {
        title: 'Create New Order',
        description: 'Start a new project order',
        icon: Plus,
        section: 'create-order',
        color: 'blue',
        primary: true
      },
      {
        title: 'View All Orders',
        description: 'Browse your order history',
        icon: Package,
        section: 'orders',
        color: 'gray'
      },
      {
        title: 'Update Profile',
        description: 'Manage your account info',
        icon: User,
        section: 'profile',
        color: 'gray'
      }
    ];

    return (
      <div>
       
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
              <button
                onClick={handleRefresh}
                className="ml-auto text-red-600 hover:text-red-700 font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryCards.map((card, index) => {
            const IconComponent = card.icon;
            const colorClasses = {
              blue: 'text-blue-600 bg-blue-100',
              orange: 'text-orange-600 bg-orange-100',
              green: 'text-green-600 bg-green-100',
              purple: 'text-purple-600 bg-purple-100'
            };

            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${colorClasses[card.color]}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">{card.value}</p>
                  <p className="text-xs text-gray-500">{card.change}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              const isPrimary = action.primary;
              
              return (
                <button
                  key={index}
                  onClick={() => handleSectionChange(action.section)}
                  className={`block p-6 rounded-lg border-2 transition-all duration-200 hover:shadow-md text-left w-full ${
                    isPrimary
                      ? 'border-blue-200 bg-blue-50 hover:border-blue-300 hover:bg-blue-100'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-lg ${
                      isPrimary ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
                  </div>
                  <h3 className={`font-semibold mb-1 ${
                    isPrimary ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders - ONLY SHOW PREVIEW IN OVERVIEW */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                <button 
                  onClick={() => handleSectionChange('orders')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all
                </button>
              </div>
            </div>
            <div className="p-6">
              {dashboardData?.recentOrders?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentOrders.slice(0, 3).map((order) => { // LIMIT TO 3 FOR OVERVIEW
                    const StatusIcon = getStatusIcon(order.status);
                    
                    return (
                      <div key={order._id || order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${getStatusColor(order.status)}`}>
                            <StatusIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {order.items?.[0]?.productName || order.title || 'Order'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.orderNumber || order._id} • {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(order.orderTotal || order.total)}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <button
                              onClick={() => {
                                setActiveSection('order-details');
                                navigate(`/customer/orders/${order._id || order.id}`);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700 flex items-center"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No orders yet</p>
                  <button
                    onClick={() => handleSectionChange('create-order')}
                    className="text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
                  >
                    Create your first order
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Placeholder */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              {dashboardData?.recentActivity?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentActivity.map((activity) => (
                    <div key={activity._id || activity.id} className="flex items-start space-x-3">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-sm text-gray-400 mt-2">Activity will appear here as you use the system</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Section renderer function
  const renderSection = () => {
    const commonProps = {
      currentUser: user,
      onSectionChange: handleSectionChange,
      dashboardData,
      refreshDashboard: handleRefresh,
      // PASS STANDARDIZED STATUS FUNCTIONS
      getStatusColor,
      getStatusIcon,
      formatCurrency,
      formatDate
    };

    switch (activeSection) {
      case 'overview':
        return <OverviewSection />;
      
      case 'orders':
        return <CustomerOrders {...commonProps} />;
      
      case 'profile':
        return <CustomerProfile {...commonProps} />;
        
      case 'order-details':
        return <CustomerOrderDetails {...commonProps} />;
        
      case 'create-order':
        return <CustomerCreateOrder {...commonProps} />;
      
      default:
        return <OverviewSection />;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Backdrop - ADDED FOR PROPER MOBILE BEHAVIOR */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" 
          onClick={handleMobileSidebarClose}
        />
      )}

      {/* Sidebar - Fixed width, responsive */}
      <CustomerSidebar
        activeSection={activeSection}
        setActiveSection={handleSectionChange}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={handleMobileSidebarClose}
      />

      {/* Main Content Area - Flex grow */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - REMOVED DUPLICATE SEARCH */}
        <CustomerHeader
          activeSection={activeSection}
          onMobileMenuToggle={handleMobileSidebarToggle}
          currentUser={user}
          onLogout={handleLogout}
          onSettings={handleSettings}
        />

        {/* Main Content */}
        <CustomerMain
          loading={loading}
          error={error}
          onRetry={handleRefresh}
          className="flex-1"
        >
          {renderSection()}
        </CustomerMain>
      </div>
    </div>
  );
};

export default CustomerDashboard;