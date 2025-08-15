import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  FileText,
  Filter
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/common/StatCard';
import ReportService from '../../services/reportService';

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    period: '7' // Default to last 7 days
  });
  const [activeTab, setActiveTab] = useState('overview');

  // Initialize date filters
  useEffect(() => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    setFilters(prev => ({
      ...prev,
      startDate: weekAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    }));
  }, []);

  // Fetch report data
  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await ReportService.getDashboardReports(filters);
      setReportData(data);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load and when filters change
  useEffect(() => {
    if (filters.startDate && filters.endDate) {
      fetchReportData();
    }
  }, [fetchReportData, filters.startDate, filters.endDate]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // Handle period presets
      if (key === 'period') {
        const today = new Date();
        const daysBack = parseInt(value);
        const startDate = new Date(today.getTime() - (daysBack * 24 * 60 * 60 * 1000));
        
        newFilters.startDate = startDate.toISOString().split('T')[0];
        newFilters.endDate = today.toISOString().split('T')[0];
      }
      
      return newFilters;
    });
  };

  // Export functionality
  const handleExport = async (reportType) => {
    try {
      if (!reportData) {
        setError('No data available to export');
        return;
      }

      const csvData = ReportService.exportToCSV(reportData, reportType);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setSuccessMessage(`${reportType} report exported successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to export report. Please try again.');
    }
  };

  // Chart colors
  const chartColors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    tertiary: '#F59E0B',
    quaternary: '#EF4444',
    accent: '#8B5CF6'
  };

  const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Clear messages
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError('');
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  if (loading && !reportData) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" message="Loading Reports..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Header with Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Reports</h1>
            <p className="text-gray-600">Comprehensive analytics and insights</p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 lg:mt-0">
            <button
              onClick={fetchReportData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filters.period}
              onChange={(e) => handleFilterChange('period', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <select
              onChange={(e) => e.target.value && handleExport(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              defaultValue=""
            >
              <option value="" disabled>Export Report</option>
              <option value="summary">Summary Report</option>
              <option value="orders">Orders Report</option>
              <option value="customers">Customers Report</option>
              <option value="assistants">Assistants Report</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatCard
            title="Total Revenue"
            value={`KSh ${reportData.summary.totalRevenue?.toLocaleString() || '0'}`}
            icon={DollarSign}
            color="bg-green-500"
            change={15}
          />
          <StatCard
            title="Total Orders"
            value={reportData.summary.totalOrders || 0}
            icon={ShoppingCart}
            color="bg-blue-500"
            change={8}
          />
          <StatCard
            title="Total Customers"
            value={reportData.summary.totalCustomers || 0}
            icon={Users}
            color="bg-purple-500"
            change={12}
          />
          <StatCard
            title="Active Assistants"
            value={reportData.summary.activeAssistants || 0}
            icon={Users}
            color="bg-orange-500"
          />
          <StatCard
            title="Avg Order Value"
            value={`KSh ${reportData.summary.averageOrderValue?.toFixed(0) || '0'}`}
            icon={TrendingUp}
            color="bg-cyan-500"
            change={5}
          />
          <StatCard
            title="Completion Rate"
            value={`${reportData.summary.completionRate?.toFixed(1) || 0}%`}
            icon={CheckCircle}
            color="bg-emerald-500"
            change={3}
          />
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'revenue', name: 'Revenue', icon: DollarSign },
              { id: 'performance', name: 'Performance', icon: TrendingUp },
              { id: 'activity', name: 'Recent Activity', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && reportData && (
            <div className="space-y-6">
              {/* Revenue Trend Chart */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reportData.trends.revenueTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis tickFormatter={(value) => `KSh ${value.toLocaleString()}`} />
                      <Tooltip 
                        formatter={(value) => [`KSh ${value.toLocaleString()}`, 'Revenue']}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke={chartColors.primary} 
                        strokeWidth={2}
                        dot={{ fill: chartColors.primary }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Orders by Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(reportData.orderMetrics.ordersByStatus || {}).map(([status, count]) => ({
                            name: status.charAt(0).toUpperCase() + status.slice(1),
                            value: count
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        >
                          {Object.entries(reportData.orderMetrics.ordersByStatus || {}).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Customer Growth */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Growth</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.trends.customersTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [value, 'New Customers']}
                          labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <Bar dataKey="customers" fill={chartColors.secondary} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Revenue Tab */}
          {activeTab === 'revenue' && reportData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
                  <p className="text-3xl font-bold">KSh {reportData.orderMetrics.totalRevenue?.toLocaleString() || '0'}</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold mb-2">Average Order Value</h3>
                  <p className="text-3xl font-bold">KSh {reportData.orderMetrics.averageOrderValue?.toFixed(0) || '0'}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold mb-2">Completed Orders</h3>
                  <p className="text-3xl font-bold">{reportData.orderMetrics.completedOrders || 0}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Revenue</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.orderMetrics.revenueByPeriod}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis tickFormatter={(value) => `KSh ${value.toLocaleString()}`} />
                      <Tooltip 
                        formatter={(value) => [`KSh ${value.toLocaleString()}`, 'Revenue']}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <Bar dataKey="revenue" fill={chartColors.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && reportData && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assistant Performance</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assistant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Orders
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Completed
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Completion Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.assistantMetrics.assistantPerformance?.map((perf, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {perf.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {perf.totalOrders}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {perf.completedOrders}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: `${Math.min(perf.completionRate, 100)}%` }}
                                ></div>
                              </div>
                              {perf.completionRate?.toFixed(1)}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            KSh {perf.totalRevenue?.toLocaleString() || '0'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity Tab */}
          {activeTab === 'activity' && reportData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                  <div className="space-y-3">
                    {reportData.recentActivity.recentOrders?.slice(0, 5).map((order, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.customerId?.fullName || 'Unknown Customer'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            KSh {order.orderTotal?.toLocaleString() || '0'}
                          </p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Customers */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Customers</h3>
                  <div className="space-y-3">
                    {reportData.recentActivity.recentCustomers?.slice(0, 5).map((customer, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            {customer.fullName || 'Unknown Customer'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {customer.email || 'No email'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(customer.createdAt).toLocaleDateString()}
                          </p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            customer.assignedAssistant ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {customer.assignedAssistant ? 'Assigned' : 'Unassigned'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Data State */}
          {!reportData && !loading && (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your date range or refresh the data.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;