import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import  { useNotifications } from '../../context/NotificationContext';
import DashboardCard, { PresetCard } from './DashboardCard';
import MetricsChart, { PresetChart } from './MetricsChart';
import {
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
  Calendar,
  Star,
  AlertTriangle,
  Eye,
  Download,
  Filter,
  RefreshCw,
  Settings,
  Bell,
  UserCheck,
  Clock,
  Target,
  BarChart3,
  PieChart,
  CheckCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
 const { showSuccess, showError, showInfo } = useNotifications();

  // Dashboard state
  const [dashboardData, setDashboardData] = useState({
    overview: {},
    charts: {},
    recentActivity: [],
    alerts: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - Replace with actual API calls
  const mockDashboardData = {
    overview: {
      totalRevenue: { value: 127500, trend: 12.5, previousValue: 113300 },
      totalCustomers: { value: 1247, trend: 8.3, previousValue: 1151 },
      totalOrders: { value: 856, trend: -2.1, previousValue: 874 },
      avgOrderValue: { value: 149, trend: 15.2, previousValue: 129 },
      completionRate: { value: 94.2, trend: 3.1, previousValue: 91.3 },
      avgRating: { value: 4.7, trend: 0.2, previousValue: 4.5 },
      activeAssistants: { value: 12, trend: 0, previousValue: 12 },
      pendingTasks: { value: 23, trend: -18.5, previousValue: 28 }
    },
    charts: {
      revenue: [
        { date: '2024-05-01', revenue: 8500, orders: 45, customers: 38 },
        { date: '2024-05-02', revenue: 9200, orders: 52, customers: 42 },
        { date: '2024-05-03', revenue: 7800, orders: 41, customers: 35 },
        { date: '2024-05-04', revenue: 11200, orders: 63, customers: 48 },
        { date: '2024-05-05', revenue: 9800, orders: 54, customers: 41 },
        { date: '2024-05-06', revenue: 12500, orders: 71, customers: 52 },
        { date: '2024-05-07', revenue: 10300, orders: 58, customers: 44 }
      ],
      serviceCategories: [
        { name: 'Cleaning', value: 35, revenue: 44625 },
        { name: 'Maintenance', value: 28, revenue: 35700 },
        { name: 'Delivery', value: 22, revenue: 28050 },
        { name: 'Consultation', value: 15, revenue: 19125 }
      ],
      assistantPerformance: [
        { name: 'John Smith', completedTasks: 24, rating: 4.8, revenue: 3200 },
        { name: 'Sarah Johnson', completedTasks: 28, rating: 4.9, revenue: 3680 },
        { name: 'Mike Davis', completedTasks: 22, rating: 4.6, revenue: 2890 },
        { name: 'Lisa Chen', completedTasks: 26, rating: 4.7, revenue: 3410 }
      ]
    },
    recentActivity: [
      { id: 1, type: 'order', message: 'New order #1247 received', time: '2 minutes ago', priority: 'normal' },
      { id: 2, type: 'customer', message: 'New customer registration: Jane Doe', time: '15 minutes ago', priority: 'normal' },
      { id: 3, type: 'alert', message: 'Assistant John Smith exceeded target', time: '1 hour ago', priority: 'success' },
      { id: 4, type: 'issue', message: 'Service delay reported for order #1244', time: '2 hours ago', priority: 'warning' },
      { id: 5, type: 'payment', message: 'Payment of $450 received', time: '3 hours ago', priority: 'success' }
    ],
    alerts: [
      { id: 1, type: 'warning', title: 'Low Assistant Availability', message: '3 assistants unavailable today', action: 'View Schedule' },
      { id: 2, type: 'info', title: 'Monthly Report Ready', message: 'April performance report is available', action: 'Download' },
      { id: 3, type: 'success', title: 'Revenue Target Achieved', message: 'Monthly revenue goal exceeded by 12%', action: 'View Details' }
    ]
  };

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, [selectedTimeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDashboardData(mockDashboardData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
   showSuccess('Dashboard data refreshed');
  };

  const handleExportData = () => {
    // Implementation for data export
    showInfo('Exporting dashboard data...');
  };

  const handleCardClick = (cardType) => {
    switch (cardType) {
      case 'revenue':
        navigate('/admin/financial-reports');
        break;
      case 'customers':
        navigate('/customers');
        break;
      case 'orders':
        navigate('/orders');
        break;
      case 'assistants':
        navigate('/assistants');
        break;
      default:
        break;
    }
  };

  // Get alert icon and color
  const getAlertStyle = (type) => {
    const styles = {
      warning: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
      info: { icon: Bell, color: 'text-blue-600', bg: 'bg-blue-50' },
      success: { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
      error: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' }
    };
    return styles[type] || styles.info;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName || 'Admin'}! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              Here's what's happening with your business today.
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Time Range Selector */}
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>

            {/* Action Buttons */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm">Refresh</span>
            </button>

            <button
              onClick={handleExportData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <PresetCard
          preset="revenue"
          value={dashboardData.overview.totalRevenue?.value}
          trend={dashboardData.overview.totalRevenue?.trend}
          loading={loading}
          onClick={() => handleCardClick('revenue')}
          showViewMore
        />
        
        <PresetCard
          preset="customers"
          value={dashboardData.overview.totalCustomers?.value}
          trend={dashboardData.overview.totalCustomers?.trend}
          loading={loading}
          onClick={() => handleCardClick('customers')}
          showViewMore
        />
        
        <PresetCard
          preset="orders"
          value={dashboardData.overview.totalOrders?.value}
          trend={dashboardData.overview.totalOrders?.trend}
          loading={loading}
          onClick={() => handleCardClick('orders')}
          showViewMore
        />
        
        <DashboardCard
          title="Avg Order Value"
          value={dashboardData.overview.avgOrderValue?.value}
          trend={dashboardData.overview.avgOrderValue?.trend}
          icon={Target}
          variant="info"
          loading={loading}
          formatValue={(val) => `$${val || '0'}`}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Completion Rate"
          value={dashboardData.overview.completionRate?.value}
          trend={dashboardData.overview.completionRate?.trend}
          icon={CheckCircle}
          variant="success"
          loading={loading}
          formatValue={(val) => `${val || '0'}%`}
        />
        
        <PresetCard
          preset="rating"
          value={dashboardData.overview.avgRating?.value}
          trend={dashboardData.overview.avgRating?.trend}
          loading={loading}
        />
        
        <DashboardCard
          title="Active Assistants"
          value={dashboardData.overview.activeAssistants?.value}
          trend={dashboardData.overview.activeAssistants?.trend}
          icon={UserCheck}
          variant="info"
          loading={loading}
          onClick={() => handleCardClick('assistants')}
          showViewMore
        />
        
        <PresetCard
          preset="pendingTasks"
          value={dashboardData.overview.pendingTasks?.value}
          trend={dashboardData.overview.pendingTasks?.trend}
          loading={loading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <PresetChart
          preset="revenue"
          data={dashboardData.charts.revenue}
          loading={loading}
          onRefresh={handleRefresh}
          onExport={handleExportData}
          additionalLines={[
            { key: 'orders', name: 'Orders' },
            { key: 'customers', name: 'New Customers' }
          ]}
          height={350}
        />

        {/* Service Categories */}
        <MetricsChart
          title="Service Categories"
          subtitle="Revenue by service type"
          type="pie"
          data={dashboardData.charts.serviceCategories}
          xAxisKey="name"
          yAxisKey="value"
          loading={loading}
          onRefresh={handleRefresh}
          onExport={handleExportData}
          height={350}
          formatters={{
            value: (value) => `${value}%`
          }}
        />
      </div>

      {/* Assistant Performance Chart */}
      <div className="mb-8">
        <MetricsChart
          title="Assistant Performance"
          subtitle="Tasks completed and ratings this month"
          type="bar"
          data={dashboardData.charts.assistantPerformance}
          xAxisKey="name"
          yAxisKey="completedTasks"
          loading={loading}
          onRefresh={handleRefresh}
          onExport={handleExportData}
          additionalLines={[
            { key: 'rating', name: 'Rating' }
          ]}
          height={300}
          colors={['#3B82F6', '#10B981']}
        />
      </div>

      {/* Bottom Section: Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {dashboardData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  activity.priority === 'success' ? 'bg-green-500' :
                  activity.priority === 'warning' ? 'bg-yellow-500' :
                  activity.priority === 'error' ? 'bg-red-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Alerts & Notifications</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Manage
            </button>
          </div>
          
          <div className="space-y-4">
            {dashboardData.alerts.map((alert) => {
              const alertStyle = getAlertStyle(alert.type);
              const AlertIcon = alertStyle.icon;
              
              return (
                <div key={alert.id} className={`p-4 rounded-lg ${alertStyle.bg}`}>
                  <div className="flex items-start space-x-3">
                    <AlertIcon className={`w-5 h-5 mt-0.5 ${alertStyle.color}`} />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        {alert.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                      <button className={`text-xs font-medium ${alertStyle.color} hover:underline`}>
                        {alert.action}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;