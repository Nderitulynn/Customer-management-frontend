import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  DollarSign, 
  TrendingUp, 
  UserPlus, 
  Settings, 
  BarChart3, 
  Shield,
  Phone,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Sample data - replace with actual API calls
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalCustomers: 156,
      activeChats: 23,
      monthlyRevenue: 8450,
      todayOrders: 12,
      totalAssistants: 3,
      responseRate: 94
    },
    recentOrders: [
      { id: 1, customer: 'Sarah Johnson', item: 'Macrame Wall Hanging', amount: 85, status: 'Processing', date: '2024-01-15' },
      { id: 2, customer: 'Mike Chen', item: 'Plant Hanger Set', amount: 120, status: 'Shipped', date: '2024-01-15' },
      { id: 3, customer: 'Emily Davis', item: 'Macrame Mirror', amount: 95, status: 'Delivered', date: '2024-01-14' },
      { id: 4, customer: 'John Smith', item: 'Boho Curtain', amount: 200, status: 'Processing', date: '2024-01-14' },
      { id: 5, customer: 'Lisa Wilson', item: 'Keychain Set', amount: 35, status: 'Shipped', date: '2024-01-13' }
    ],
    assistants: [
      { id: 1, name: 'Anna Martinez', role: 'Assistant', status: 'Active', lastActive: '2024-01-15 10:30', orders: 45 },
      { id: 2, name: 'David Kim', role: 'Assistant', status: 'Active', lastActive: '2024-01-15 09:15', orders: 38 },
      { id: 3, name: 'Rachel Brown', role: 'Assistant', status: 'Inactive', lastActive: '2024-01-14 16:45', orders: 52 }
    ],
    recentCustomers: [
      { id: 1, name: 'Sarah Johnson', phone: '+1234567890', lastOrder: '2024-01-15', totalOrders: 3, totalSpent: 340 },
      { id: 2, name: 'Mike Chen', phone: '+1234567891', lastOrder: '2024-01-15', totalOrders: 1, totalSpent: 120 },
      { id: 3, name: 'Emily Davis', phone: '+1234567892', lastOrder: '2024-01-14', totalOrders: 2, totalSpent: 190 },
      { id: 4, name: 'John Smith', phone: '+1234567893', lastOrder: '2024-01-14', totalOrders: 1, totalSpent: 200 },
      { id: 5, name: 'Lisa Wilson', phone: '+1234567894', lastOrder: '2024-01-13', totalOrders: 4, totalSpent: 280 }
    ]
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-700 border border-blue-200'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" message="Loading Admin Dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
              <span className="ml-2 text-sm text-gray-500">Macrame Business</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.name || 'Admin'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <StatCard
            title="Total Customers"
            value={dashboardData.stats.totalCustomers}
            icon={Users}
            color="bg-blue-500"
            change={12}
          />
          <StatCard
            title="Active Chats"
            value={dashboardData.stats.activeChats}
            icon={MessageSquare}
            color="bg-green-500"
            change={8}
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${dashboardData.stats.monthlyRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="bg-emerald-500"
            change={15}
          />
          <StatCard
            title="Today's Orders"
            value={dashboardData.stats.todayOrders}
            icon={TrendingUp}
            color="bg-purple-500"
            change={-3}
          />
          <StatCard
            title="Total Assistants"
            value={dashboardData.stats.totalAssistants}
            icon={UserPlus}
            color="bg-orange-500"
          />
          <StatCard
            title="Response Rate"
            value={`${dashboardData.stats.responseRate}%`}
            icon={BarChart3}
            color="bg-cyan-500"
            change={2}
          />
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <TabButton
              id="overview"
              label="Overview"
              isActive={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            />
            <TabButton
              id="customers"
              label="Customers"
              isActive={activeTab === 'customers'}
              onClick={() => setActiveTab('customers')}
            />
            <TabButton
              id="assistants"
              label="Assistants"
              isActive={activeTab === 'assistants'}
              onClick={() => setActiveTab('assistants')}
            />
            <TabButton
              id="orders"
              label="Orders"
              isActive={activeTab === 'orders'}
              onClick={() => setActiveTab('orders')}
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <button className="text-sm text-blue-600 hover:text-blue-800">
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
                      <p className="font-semibold text-gray-900">${order.amount}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Assistant Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Assistant Management</h3>
                <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                  Add Assistant
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.assistants.map((assistant) => (
                  <div key={assistant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {assistant.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{assistant.name}</p>
                        <p className="text-sm text-gray-600">{assistant.orders} orders handled</p>
                        <p className="text-xs text-gray-500">Last active: {assistant.lastActive}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(assistant.status)}`}>
                        {assistant.status}
                      </span>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Table */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Customers</h3>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="h-4 w-4 text-gray-600" />
                </button>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 text-sm font-medium">
                            {customer.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{customer.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.totalOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${customer.totalSpent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.lastOrder}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-800">
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-800">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;