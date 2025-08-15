import React, { useState, useCallback } from 'react';
import { 
  Users, 
  MessageSquare, 
  DollarSign, 
  TrendingUp, 
  UserPlus, 
  BarChart3
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
    assistantStats
  } = useDashboardData();

  const {
    successMessage,
    error,
    setSuccessMessage,
    setError
  } = useNotifications();

  // Local component state - Changed from activeTab to activeSection
  const [activeSection, setActiveSection] = useState(() => {
    // Get default section based on user role (you might want to get actual user role from context)
    return navigationHelpers.getDefaultActiveSection('admin') || 'overview';
  });

  // Handle section change from sidebar
  const handleSectionChange = useCallback((section) => {
    setActiveSection(section);
  }, []);

  // Stats configuration
  const statsData = [
    {
      title: "Total Customers",
      value: dashboardData.stats.totalCustomers,
      icon: Users,
      color: "bg-blue-500",
      change: 12
    },
    {
      title: "Active Chats",
      value: dashboardData.stats.activeChats,
      icon: MessageSquare,
      color: "bg-green-500",
      change: 8
    },
    {
      title: "Monthly Revenue",
      value: `KSh ${dashboardData.stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-emerald-500",
      change: 15
    },
    {
      title: "Today's Orders",
      value: dashboardData.stats.todayOrders,
      icon: TrendingUp,
      color: "bg-purple-500",
      change: -3
    },
    {
      title: "Total Assistants",
      value: dashboardData.stats.totalAssistants,
      icon: UserPlus,
      color: "bg-orange-500"
    },
    {
      title: "Response Rate",
      value: `${dashboardData.stats.responseRate}%`,
      icon: BarChart3,
      color: "bg-cyan-500",
      change: 2
    }
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            change={stat.change}
          />
        ))}
      </div>

      {/* Overview Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <button 
                onClick={() => handleSectionChange('orders')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{order.customer}</p>
                    <p className="text-sm text-gray-600">{order.item}</p>
                    <p className="text-xs text-gray-500">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">KSh {order.amount}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Assistant Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Assistant Summary</h3>
              <button
                onClick={() => handleSectionChange('assistants')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Manage Assistants
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {assistantStats.active}
                  </p>
                  <p className="text-sm text-green-700">Active</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-600">
                    {assistantStats.inactive}
                  </p>
                  <p className="text-sm text-gray-700">Inactive</p>
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {assistantStats.total}
                </p>
                <p className="text-sm text-blue-700">Total Assistants</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Overview Summary Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Customer Overview</h3>
            <button
              onClick={() => handleSectionChange('customers')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Manage Customers
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {dashboardData.stats.totalCustomers}
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
        <p className="text-gray-500">Analytics content will be implemented here.</p>
      </div>
    </div>
  );

  const renderMessagesContent = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Messages & Communication</h3>
      </div>
      <div className="p-6">
        <p className="text-gray-500">Messages content will be implemented here.</p>
      </div>
    </div>
  );

  const renderSettingsContent = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
      </div>
      <div className="p-6">
        <p className="text-gray-500">Settings content will be implemented here.</p>
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