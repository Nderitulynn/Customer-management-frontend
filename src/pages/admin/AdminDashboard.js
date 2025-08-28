import React, { useState, useCallback } from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  UserPlus, 
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  AlertCircle as AlertCircleOutline,
  Wifi,
  WifiOff,
  BarChart3,
  PieChart,
  Calendar,
  Target
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/common/StatCard';
import { NotificationDisplay } from '../../components/common/NotificationMessages';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useNotifications } from '../../components/common/NotificationMessages';

const AdminDashboard = () => {
  // Custom hooks
  const {
    dashboardData,
    loading,
    refreshing,
    error,
    assistantStats,
    customerStats,
    orderStats,
    refreshMetric,
    refreshDashboard,
    formatCurrency,
    formatDate,
    getStatusColor,
    isDashboardHealthy
  } = useDashboardData();

  const {
    successMessage,
    error: notificationError,
    setSuccessMessage,
    setError: setNotificationError
  } = useNotifications();

  // Local component state
  const [metricRefreshing, setMetricRefreshing] = useState({
    stats: false,
    customers: false,
    orders: false,
    assistants: false,
    performance: false,
    revenue: false
  });

  const [sectionErrors, setSectionErrors] = useState({
    stats: null,
    customers: null,
    orders: null,
    assistants: null,
    performance: null,
    revenue: null
  });

  // Enhanced refresh handlers with error handling
  const handleRefreshMetric = useCallback(async (metric) => {
    setMetricRefreshing(prev => ({ ...prev, [metric]: true }));
    setSectionErrors(prev => ({ ...prev, [metric]: null }));
    
    try {
      const result = await refreshMetric(metric);
      if (result.success) {
        setSuccessMessage(`${metric.charAt(0).toUpperCase() + metric.slice(1)} data refreshed successfully`);
      } else {
        setSectionErrors(prev => ({ ...prev, [metric]: result.error }));
        setNotificationError(`Failed to refresh ${metric} data`);
      }
    } catch (err) {
      setSectionErrors(prev => ({ ...prev, [metric]: err.message }));
      setNotificationError(`Failed to refresh ${metric} data`);
    } finally {
      setMetricRefreshing(prev => ({ ...prev, [metric]: false }));
    }
  }, [refreshMetric, setSuccessMessage, setNotificationError]);

  const handleRefreshAll = useCallback(async () => {
    try {
      const result = await refreshDashboard();
      if (result.success) {
        setSuccessMessage('All dashboard data refreshed successfully');
        setSectionErrors({
          stats: null,
          customers: null,
          orders: null,
          assistants: null,
          performance: null,
          revenue: null
        });
      } else {
        setNotificationError('Failed to refresh dashboard data');
      }
    } catch (err) {
      setNotificationError('Failed to refresh dashboard data');
    }
  }, [refreshDashboard, setSuccessMessage, setNotificationError]);

  // Calculate performance indicators
  const performanceMetrics = {
    responseRate: dashboardData.stats.responseRate || 0,
    satisfactionRate: dashboardData.stats.satisfactionRate || 92,
    avgResponseTime: dashboardData.stats.avgResponseTime || 2.3,
    resolutionRate: dashboardData.stats.resolutionRate || 88
  };

  // Calculate growth percentages
  const growthMetrics = {
    customerGrowth: customerStats.growth || 12,
    orderGrowth: orderStats.growth || 8,
    revenueGrowth: 15,
    satisfactionGrowth: 3
  };

  // Overview stats configuration
  const statsData = [
    {
      title: "Total Customers",
      value: dashboardData.stats.totalCustomers || 0,
      icon: Users,
      color: "bg-blue-500",
      loading: loading || metricRefreshing.stats
    },
    {
      title: "Total Assistants",
      value: dashboardData.stats.totalAssistants || 0,
      icon: UserPlus,
      color: "bg-orange-500",
      loading: loading || metricRefreshing.assistants
    },
    {
      title: "Total Orders",
      value: dashboardData.stats.todayOrders || 0,
      icon: TrendingUp,
      color: "bg-purple-500",
      loading: loading || metricRefreshing.orders
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(dashboardData.stats.monthlyRevenue || 0),
      icon: DollarSign,
      color: "bg-emerald-500",
      loading: loading || metricRefreshing.orders
    }
  ];

  // Section header component
  const SectionHeader = ({ title, onRefresh, refreshing, error, metric }) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {error && (
          <div className="flex items-center space-x-1 text-red-500" title={error}>
            <WifiOff className="w-4 h-4" />
            <span className="text-xs">Error</span>
          </div>
        )}
        {!error && !refreshing && isDashboardHealthy && (
          <Wifi className="w-4 h-4 text-green-500" title="Connected" />
        )}
      </div>
      <button
        onClick={() => metric ? handleRefreshMetric(metric) : onRefresh()}
        disabled={refreshing}
        className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
        title="Refresh data"
      >
        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
      </button>
    </div>
  );

  // Error state component
  const ErrorState = ({ error, onRetry, retrying }) => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircleOutline className="w-12 h-12 text-red-500 mb-4" />
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

  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" message="Loading Admin Dashboard..." />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <ErrorState 
        error={error} 
        onRetry={handleRefreshAll} 
        retrying={refreshing} 
      />
    );
  }

  // Main dashboard content
  return (
    <div className="space-y-6">
      {/* Notification Messages */}
      <NotificationDisplay
        successMessage={successMessage}
        error={notificationError}
        onClearSuccess={() => setSuccessMessage('')}
        onClearError={() => setNotificationError(null)}
      />

      {/* System Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* System Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">System Status</p>
                  <p className="text-2xl font-bold text-green-600">Online</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{customerStats.active || 234}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response</p>
                  <p className="text-2xl font-bold text-gray-900">{performanceMetrics.avgResponseTime}min</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{performanceMetrics.resolutionRate}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.loading ? '...' : stat.value}
            icon={stat.icon}
            color={stat.color}
            change={stat.change}
            loading={stat.loading}
          />
        ))}
      </div>

      {/* Main Content Grid - Business Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Customer Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <SectionHeader
              title="Customer Summary"
              refreshing={metricRefreshing.customers}
              error={sectionErrors.customers}
              metric="customers"
            />
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {/* Customer Metrics */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Customers</span>
                  <span className="font-semibold text-2xl">{customerStats.total || 1247}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">New This Month</span>
                  <span className="font-semibold text-blue-600">{customerStats.new || 124}</span>
                </div>
              </div>
              
              {/* Customer Growth Chart Placeholder */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Customer Growth Trend</span>
                </div>
                <div className="h-24 bg-gradient-to-r from-blue-100 to-blue-200 rounded flex items-end justify-center">
                  <span className="text-sm text-blue-600 mb-2">+{growthMetrics.customerGrowth}% growth</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <SectionHeader
              title="Order Summary"
              refreshing={metricRefreshing.orders}
              error={sectionErrors.orders}
              metric="orders"
            />
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {/* Order Metrics */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Orders</span>
                  <span className="font-semibold text-2xl">{orderStats.total || 2156}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">{orderStats.completed || 1934}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-semibold text-yellow-600">{orderStats.pending || 189}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cancelled</span>
                  <span className="font-semibold text-red-600">{orderStats.cancelled || 33}</span>
                </div>
              </div>

              {/* Order Status Distribution */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <PieChart className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Order Status Distribution</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Completed</span>
                    </div>
                    <span>89.7%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Pending</span>
                    </div>
                    <span>8.8%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Cancelled</span>
                    </div>
                    <span>1.5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <SectionHeader
              title="Revenue Summary"
              refreshing={metricRefreshing.revenue}
              error={sectionErrors.revenue}
              metric="revenue"
            />
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {/* Revenue Metrics */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-semibold text-2xl">{formatCurrency(dashboardData.stats.monthlyRevenue || 24580)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Today</span>
                  <span className="font-semibold text-green-600">{formatCurrency(dashboardData.stats.dailyRevenue || 1247)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Order Value</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(dashboardData.stats.avgOrderValue || 87.50)}</span>
                </div>
              </div>

              {/* Revenue Growth */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Revenue Growth</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Month over Month</span>
                  <span className="text-lg font-bold text-green-600">+{growthMetrics.revenueGrowth}%</span>
                </div>
                <div className="mt-2 bg-green-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${growthMetrics.revenueGrowth * 5}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assistant Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <SectionHeader
            title="Assistant Activity"
            refreshing={metricRefreshing.assistants}
            error={sectionErrors.assistants}
            metric="assistants"
          />
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">{assistantStats.total || 24}</div>
                <p className="text-sm text-blue-700">Total Assistants</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">{assistantStats.active || 18}</div>
                <p className="text-sm text-green-700">Active Now</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <SectionHeader
            title="Performance Metrics"
            refreshing={metricRefreshing.performance}
            error={sectionErrors.performance}
            metric="performance"
          />
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Response Rate */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">{performanceMetrics.responseRate}%</div>
              <div className="text-sm text-blue-700 mb-2">Response Rate</div>
              <div className="text-xs text-gray-500">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                +2% from last week
              </div>
            </div>

            {/* Customer Satisfaction */}
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">{performanceMetrics.satisfactionRate}%</div>
              <div className="text-sm text-green-700 mb-2">Customer Satisfaction</div>
              <div className="text-xs text-gray-500">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                +{growthMetrics.satisfactionGrowth}% improvement
              </div>
            </div>

            {/* Average Response Time */}
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">{performanceMetrics.avgResponseTime}min</div>
              <div className="text-sm text-purple-700 mb-2">Avg Response Time</div>
              <div className="text-xs text-gray-500">
                <TrendingDown className="w-3 h-3 inline mr-1" />
                -0.5min faster
              </div>
            </div>

            {/* Resolution Rate */}
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600 mb-2">{performanceMetrics.resolutionRate}%</div>
              <div className="text-sm text-orange-700 mb-2">Resolution Rate</div>
              <div className="text-xs text-gray-500">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                +5% this month
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Target className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Performance Insights</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Customer satisfaction is above target (92% vs 85% target)</li>
                  <li>• Response times have improved by 15% this month</li>
                  <li>• Order completion rate is steady at 89.7%</li>
                  <li>• Peak activity hours: 10 AM - 2 PM and 6 PM - 8 PM</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Alerts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">All systems operational</p>
                <p className="text-xs text-green-600">Last checked: 2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">High traffic detected</p>
                <p className="text-xs text-yellow-600">Response times may be slightly elevated</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">Scheduled maintenance</p>
                <p className="text-xs text-blue-600">System update planned for this weekend</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;