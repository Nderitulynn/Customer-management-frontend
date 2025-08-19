import React, { useState, useCallback } from 'react';
import { 
  Users, 
  MessageSquare, 
  DollarSign, 
  TrendingUp, 
  UserPlus, 
  BarChart3,
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import AdminLayout from '../../components/admin/layout/AdminLayout.js';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AdminCustomers from '../../pages/admin/AdminCustomers.js';
import AdminOrders from '../../pages/admin/AdminOrders.js';
import AssistantsPage from '../../pages/admin/AssistantsPage.js';
import StatCard from '../../components/common/StatCard';
import { NotificationDisplay } from '../../components/common/NotificationMessages';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useNotifications } from '../../components/common/NotificationMessages';
import { navigationHelpers } from '../../config/navigationConfig';

const AdminDashboard = () => {
  // Custom hooks
  const {
    dashboardData,
    loading,
    customersLoading,
    statsLoading,
    assistantStats,
    customerStats,
    orderStats,
    fetchDashboardData,
    fetchDashboardStats,
    fetchRecentCustomers,
    fetchRecentOrders,
    refreshCustomerData,
    refreshOrderData
  } = useDashboardData();

  const {
    successMessage,
    error,
    setSuccessMessage,
    setError
  } = useNotifications();

  // Local component state
  const [activeSection, setActiveSection] = useState(() => {
    return navigationHelpers.getDefaultActiveSection('admin') || 'overview';
  });

  const [refreshing, setRefreshing] = useState({
    stats: false,
    customers: false,
    orders: false,
    assistants: false
  });

  const [sectionErrors, setSectionErrors] = useState({
    stats: null,
    customers: null,
    orders: null,
    assistants: null
  });

  // Handle section change from sidebar
  const handleSectionChange = useCallback((section) => {
    setActiveSection(section);
  }, []);

  // Enhanced refresh handlers with error handling
  const handleRefreshStats = useCallback(async () => {
    setRefreshing(prev => ({ ...prev, stats: true }));
    setSectionErrors(prev => ({ ...prev, stats: null }));
    
    try {
      const result = await fetchDashboardStats();
      if (result.success) {
        setSuccessMessage('Dashboard statistics refreshed successfully');
      } else {
        setSectionErrors(prev => ({ ...prev, stats: result.error }));
        setError('Failed to refresh dashboard statistics');
      }
    } catch (err) {
      setSectionErrors(prev => ({ ...prev, stats: err.message }));
      setError('Failed to refresh dashboard statistics');
    } finally {
      setRefreshing(prev => ({ ...prev, stats: false }));
    }
  }, [fetchDashboardStats, setSuccessMessage, setError]);

  const handleRefreshCustomers = useCallback(async () => {
    setRefreshing(prev => ({ ...prev, customers: true }));
    setSectionErrors(prev => ({ ...prev, customers: null }));
    
    try {
      const result = await refreshCustomerData();
      if (result.success) {
        setSuccessMessage('Customer data refreshed successfully');
      } else if (result.partialSuccess) {
        setSuccessMessage('Customer data partially refreshed');
        setSectionErrors(prev => ({ ...prev, customers: result.errors.join(', ') }));
      } else {
        setSectionErrors(prev => ({ ...prev, customers: result.errors.join(', ') }));
        setError('Failed to refresh customer data');
      }
    } catch (err) {
      setSectionErrors(prev => ({ ...prev, customers: err.message }));
      setError('Failed to refresh customer data');
    } finally {
      setRefreshing(prev => ({ ...prev, customers: false }));
    }
  }, [refreshCustomerData, setSuccessMessage, setError]);

  const handleRefreshOrders = useCallback(async () => {
    setRefreshing(prev => ({ ...prev, orders: true }));
    setSectionErrors(prev => ({ ...prev, orders: null }));
    
    try {
      const result = await refreshOrderData();
      if (result.success) {
        setSuccessMessage('Order data refreshed successfully');
      } else if (result.partialSuccess) {
        setSuccessMessage('Order data partially refreshed');
        setSectionErrors(prev => ({ ...prev, orders: result.errors.join(', ') }));
      } else {
        setSectionErrors(prev => ({ ...prev, orders: result.errors.join(', ') }));
        setError('Failed to refresh order data');
      }
    } catch (err) {
      setSectionErrors(prev => ({ ...prev, orders: err.message }));
      setError('Failed to refresh order data');
    } finally {
      setRefreshing(prev => ({ ...prev, orders: false }));
    }
  }, [refreshOrderData, setSuccessMessage, setError]);

  const handleRefreshAll = useCallback(async () => {
    setRefreshing({
      stats: true,
      customers: true,
      orders: true,
      assistants: true
    });
    setSectionErrors({
      stats: null,
      customers: null,
      orders: null,
      assistants: null
    });
    
    try {
      const result = await fetchDashboardData();
      if (result.success) {
        setSuccessMessage('All dashboard data refreshed successfully');
      } else if (result.partialSuccess) {
        setSuccessMessage('Dashboard data partially refreshed');
        if (result.errors.length > 0) {
          setError(`Some sections failed to load: ${result.errors.join(', ')}`);
        }
      } else {
        setError('Failed to refresh dashboard data');
      }
    } catch (err) {
      setError('Failed to refresh dashboard data');
    } finally {
      setRefreshing({
        stats: false,
        customers: false,
        orders: false,
        assistants: false
      });
    }
  }, [fetchDashboardData, setSuccessMessage, setError]);

  // Stats configuration with enhanced error handling
  const statsData = [
    {
      title: "Total Customers",
      value: dashboardData.stats.totalCustomers || 0,
      icon: Users,
      color: "bg-blue-500",
      change: 12,
      loading: statsLoading || refreshing.stats,
      error: sectionErrors.stats
    },
    {
      title: "Active Chats",
      value: dashboardData.stats.activeChats || 0,
      icon: MessageSquare,
      color: "bg-green-500",
      change: 8,
      loading: statsLoading || refreshing.stats,
      error: sectionErrors.stats
    },
    {
      title: "Monthly Revenue",
      value: `KSh ${(dashboardData.stats.monthlyRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-emerald-500",
      change: 15,
      loading: statsLoading || refreshing.stats,
      error: sectionErrors.stats
    },
    {
      title: "Today's Orders",
      value: dashboardData.stats.todayOrders || 0,
      icon: TrendingUp,
      color: "bg-purple-500",
      change: -3,
      loading: statsLoading || refreshing.orders,
      error: sectionErrors.orders
    },
    {
      title: "Total Assistants",
      value: dashboardData.stats.totalAssistants || 0,
      icon: UserPlus,
      color: "bg-orange-500",
      loading: refreshing.assistants,
      error: sectionErrors.assistants
    },
    {
      title: "Response Rate",
      value: `${dashboardData.stats.responseRate || 0}%`,
      icon: BarChart3,
      color: "bg-cyan-500",
      change: 2,
      loading: statsLoading || refreshing.stats,
      error: sectionErrors.stats
    }
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Enhanced section header component with refresh functionality
  const SectionHeader = ({ title, onRefresh, refreshing, error, showViewAll, onViewAll }) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {error && (
          <div className="flex items-center space-x-1 text-red-500" title={error}>
            <WifiOff className="w-4 h-4" />
            <span className="text-xs">Error</span>
          </div>
        )}
        {!error && !refreshing && (
          <Wifi className="w-4 h-4 text-green-500" title="Connected" />
        )}
      </div>
      <div className="flex items-center space-x-2">
        {showViewAll && (
          <button 
            onClick={onViewAll}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View All
          </button>
        )}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
          title="Refresh data"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>
    </div>
  );

  // Enhanced error state component
  const ErrorState = ({ error, onRetry, retrying }) => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load data</h3>
      <p className="text-sm text-gray-600 mb-4">{error}</p>
      <button
        onClick={onRetry}
        disabled={retrying}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
        <span>{retrying ? 'Retrying...' : 'Try Again'}</span>
      </button>
    </div>
  );

  // Enhanced empty state component
  const EmptyState = ({ title, description, action }) => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
        <BarChart3 className="w-6 h-6 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {action.label}
        </button>
      )}
    </div>
  );

  // Skeleton loader component
  const SkeletonCard = () => (
    <div className="animate-pulse p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
    </div>
  );

  // Render content based on active section
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverviewContent();
      case 'customers':
        return <AdminCustomers />;
      case 'assistants':
        return <AssistantsPage />;
      case 'orders':
        return renderOrdersContent();
      case 'analytics':
        return renderAnalyticsContent();
      case 'messages':
        return renderMessagesContent();
      case 'settings':
        return renderSettingsContent();
      default:
        return renderOverviewContent();
    }
  };

  const renderOverviewContent = () => (
    <div className="space-y-6">
     {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statsData.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.loading ? '...' : stat.value}
            icon={stat.icon}
            color={stat.color}
            change={stat.change}
            loading={stat.loading}
            error={stat.error}
          />
        ))}
      </div>

      {/* Overview Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <SectionHeader
              title="Recent Orders"
              onRefresh={handleRefreshOrders}
              refreshing={refreshing.orders}
              error={sectionErrors.orders}
              showViewAll={true}
              onViewAll={() => handleSectionChange('orders')}
            />
          </div>
          <div className="p-6">
            {sectionErrors.orders ? (
              <ErrorState 
                error={sectionErrors.orders}
                onRetry={handleRefreshOrders}
                retrying={refreshing.orders}
              />
            ) : refreshing.orders ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : dashboardData.recentOrders.length === 0 ? (
              <EmptyState
                title="No recent orders"
                description="No orders have been placed recently."
                action={{
                  label: "Refresh",
                  onClick: handleRefreshOrders
                }}
              />
            ) : (
              <div className="space-y-4">
                {dashboardData.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{order.customer || 'Unknown Customer'}</p>
                      <p className="text-sm text-gray-600">{order.item || 'Order Items'}</p>
                      <p className="text-xs text-gray-500">{order.date || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">KSh {(order.amount || 0).toLocaleString()}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status || 'pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Assistant Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <SectionHeader
              title="Assistant Summary"
              onRefresh={() => handleRefreshStats()}
              refreshing={refreshing.assistants || refreshing.stats}
              error={sectionErrors.assistants || sectionErrors.stats}
              showViewAll={true}
              onViewAll={() => handleSectionChange('assistants')}
            />
          </div>
          <div className="p-6">
            {(sectionErrors.assistants || sectionErrors.stats) ? (
              <ErrorState 
                error={sectionErrors.assistants || sectionErrors.stats}
                onRetry={handleRefreshStats}
                retrying={refreshing.stats}
              />
            ) : (refreshing.assistants || refreshing.stats) ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="animate-pulse bg-gray-100 rounded-lg h-20"></div>
                  <div className="animate-pulse bg-gray-100 rounded-lg h-20"></div>
                </div>
                <div className="animate-pulse bg-gray-100 rounded-lg h-20"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {assistantStats.active || 0}
                    </p>
                    <p className="text-sm text-green-700">Active</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-600">
                      {assistantStats.inactive || 0}
                    </p>
                    <p className="text-sm text-gray-700">Inactive</p>
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {assistantStats.total || 0}
                  </p>
                  <p className="text-sm text-blue-700">Total Assistants</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Overview Summary Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <SectionHeader
            title="Customer Overview"
            onRefresh={handleRefreshCustomers}
            refreshing={refreshing.customers}
            error={sectionErrors.customers}
            showViewAll={true}
            onViewAll={() => handleSectionChange('customers')}
          />
        </div>
        <div className="p-6">
          {sectionErrors.customers ? (
            <ErrorState 
              error={sectionErrors.customers}
              onRetry={handleRefreshCustomers}
              retrying={refreshing.customers}
            />
          ) : refreshing.customers ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-20"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardData.stats.totalCustomers || 0}
                </p>
                <p className="text-sm text-blue-700">Total Customers</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData.stats.activeCustomers || 0}
                </p>
                <p className="text-sm text-green-700">Active This Month</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {dashboardData.stats.newCustomers || 0}
                </p>
                <p className="text-sm text-yellow-700">New This Week</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderOrdersContent = () => (
    <AdminOrders standalone={false} />
  );

  const renderAnalyticsContent = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Analytics & Reports</h3>
      </div>
      <div className="p-6">
        <EmptyState
          title="Analytics Coming Soon"
          description="Advanced analytics and reporting features are being developed."
        />
      </div>
    </div>
  );

  const renderMessagesContent = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Messages & Communication</h3>
      </div>
      <div className="p-6">
        <EmptyState
          title="Messages Coming Soon"
          description="Message management and communication features are being developed."
        />
      </div>
    </div>
  );

  const renderSettingsContent = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
      </div>
      <div className="p-6">
        <EmptyState
          title="Settings Coming Soon"
          description="System settings and configuration options are being developed."
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout 
        activeSection={activeSection} 
        onSectionChange={handleSectionChange}
      >
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="large" message="Loading Admin Dashboard..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      activeSection={activeSection} 
      onSectionChange={handleSectionChange}
    >
      {/* Notification Messages */}
      <NotificationDisplay
        successMessage={successMessage}
        error={error}
        onClearSuccess={() => setSuccessMessage('')}
        onClearError={() => setError(null)}
      />

      {/* Render content based on active section */}
      {renderSectionContent()}
    </AdminLayout>
  );
};

export default AdminDashboard;