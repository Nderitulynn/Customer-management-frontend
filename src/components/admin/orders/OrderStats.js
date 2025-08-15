import React from 'react';
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  CreditCard,
  DollarSign,
  TrendingUp,
  Users
} from 'lucide-react';

const OrderStats = ({ stats }) => {
  const {
    total = 0,
    pending = 0,
    confirmed = 0,
    in_progress = 0,
    completed = 0,
    cancelled = 0,
    totalValue = 0,
    paidOrders = 0,
    pendingPayments = 0
  } = stats || {};

  const statCards = [
    {
      title: 'Total Orders',
      value: total,
      icon: ShoppingCart,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900'
    },
    {
      title: 'Pending',
      value: pending,
      icon: AlertCircle,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-900'
    },
    {
      title: 'Confirmed',
      value: confirmed,
      icon: CheckCircle,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-900'
    },
    {
      title: 'In Progress',
      value: in_progress,
      icon: Clock,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900'
    },
    {
      title: 'Completed',
      value: completed,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      textColor: 'text-green-900'
    },
    {
      title: 'Cancelled',
      value: cancelled,
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      textColor: 'text-red-900'
    }
  ];

  const revenueStats = [
    {
      title: 'Total Revenue',
      value: new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES'
      }).format(totalValue),
      icon: DollarSign,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      textColor: 'text-green-900',
      description: 'Total value of all orders'
    },
    {
      title: 'Paid Orders',
      value: paidOrders,
      icon: CreditCard,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      textColor: 'text-emerald-900',
      description: `${total > 0 ? Math.round((paidOrders / total) * 100) : 0}% of total orders`
    },
    {
      title: 'Pending Payments',
      value: pendingPayments,
      icon: Clock,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-900',
      description: 'Orders awaiting payment'
    },
    {
      title: 'Success Rate',
      value: `${total > 0 ? Math.round((completed / total) * 100) : 0}%`,
      icon: TrendingUp,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      textColor: 'text-indigo-900',
      description: 'Completed vs total orders'
    }
  ];

  const StatCard = ({ title, value, icon: Icon, bgColor, iconColor, textColor, description }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`${bgColor} rounded-lg p-3`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Order Status Statistics */}
      <div>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Order Overview</h2>
          <p className="text-sm text-gray-600 mt-1">Current status of all orders in the system</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {statCards.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Revenue and Performance Statistics */}
      <div>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Revenue & Performance</h2>
          <p className="text-sm text-gray-600 mt-1">Financial overview and order completion metrics</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {revenueStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Quick Insights */}
      {total > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat('en-KE', {
                  style: 'currency',
                  currency: 'KES'
                }).format(totalValue / total)}
              </div>
              <div className="text-sm text-gray-600">Average Order Value</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(((pending + confirmed + in_progress) / total) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Active Orders</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {Math.round((paidOrders / total) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Payment Success Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Status Distribution Chart */}
      {total > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
          <div className="space-y-3">
            {statCards.map((stat, index) => {
              const percentage = total > 0 ? (stat.value / total) * 100 : 0;
              return (
                <div key={index} className="flex items-center">
                  <div className="flex items-center min-w-0 flex-1">
                    <stat.icon className={`h-4 w-4 ${stat.iconColor} mr-3`} />
                    <span className="text-sm font-medium text-gray-900 mr-2">{stat.title}</span>
                    <span className="text-sm text-gray-500">({stat.value})</span>
                  </div>
                  <div className="ml-4 flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className={`h-2 rounded-full bg-${stat.color}-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStats;