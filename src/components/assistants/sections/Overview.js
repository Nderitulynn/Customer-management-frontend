import React from 'react';
import { Users, ShoppingCart, Clock, Plus, ArrowRight, TrendingUp, User } from 'lucide-react';

const Overview = ({ 
  stats, 
  recentCustomers, 
  recentOrders, 
  unclaimedCustomers, 
  setActiveSection,
  getStatusBadgeColor 
}) => {
  const quickActions = [
    {
      title: 'Add New Customer',
      description: 'Create a new customer profile',
      icon: Plus,
      color: 'bg-blue-500',
      action: () => setActiveSection('customers')
    },
    {
      title: 'View All Customers',
      description: 'Manage your customer list',
      icon: Users,
      color: 'bg-green-500',
      action: () => setActiveSection('customers')
    },
    {
      title: 'Order Management',
      description: 'Track and update orders',
      icon: ShoppingCart,
      color: 'bg-purple-500',
      action: () => setActiveSection('orders')
    },
    {
      title: 'View Messages',
      description: 'Check customer messages',
      icon: User,
      color: 'bg-orange-500',
      action: () => setActiveSection('messages')
    }
  ];

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount || 0);
  };

  // Helper function to get customer name from order
  const getCustomerName = (order) => {
    if (order.customerId && typeof order.customerId === 'object') {
      return order.customerId.fullName || 'Unknown Customer';
    }
    return order.customerName || 'Unknown Customer';
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">My Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.assignedCustomers || 0}</p>
              <p className="text-xs text-green-600 mt-1">+2 this week</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders || 0}</p>
              <p className="text-xs text-green-600 mt-1">+5 this week</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders || 0}</p>
              <p className="text-xs text-yellow-600 mt-1">Needs attention</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
              <p className="text-xs text-green-600 mt-1">+12% vs last month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center mb-3">
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">{action.title}</h4>
              <p className="text-sm text-gray-600">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Customers */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Recent Customers</h2>
              <button
                onClick={() => setActiveSection('customers')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {recentCustomers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>No customers yet</p>
                <button
                  onClick={() => setActiveSection('customers')}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Add your first customer
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCustomers.map(customer => (
                  <div key={customer.id || customer._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {customer.fullName ? customer.fullName.charAt(0) : '?'}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{customer.fullName || 'Unknown'}</p>
                        <p className="text-sm text-gray-600">{customer.email || 'No email'}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'New'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
              <button
                onClick={() => setActiveSection('orders')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map(order => (
                  <div key={order.id || order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.orderNumber || `#${order.id || order._id}`}
                      </p>
                      <p className="text-sm text-gray-600">{getCustomerName(order)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(order.orderTotal)}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(order.status)}`}>
                        {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unclaimed Customers Alert */}
      {unclaimedCustomers && unclaimedCustomers.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                {unclaimedCustomers.length} unclaimed customer{unclaimedCustomers.length !== 1 ? 's' : ''} available
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                There are customers waiting to be assigned. Would you like to claim them?
              </p>
            </div>
            <div className="ml-4">
              <button
                onClick={() => setActiveSection('customers')}
                className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700"
              >
                View & Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;