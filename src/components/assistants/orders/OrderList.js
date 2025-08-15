import React, { useState } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, Download } from 'lucide-react';
import OrderService from '../../../services/orderService';

const OrderList = ({ orders, onEdit, onDelete, onView, onRefresh, onCreateNew }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items?.[0]?.productName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setLoading(true);
      await OrderService.updateOrderStatus(orderId, newStatus);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csvData = filteredOrders.map(order => ({
      'Order Number': order.orderNumber || 'N/A',
      'Customer': order.customerId?.fullName || 'N/A',
      'Product': order.items?.[0]?.productName || 'N/A',
      'Quantity': order.items?.[0]?.quantity || 0,
      'Total': order.orderTotal || 0,
      'Status': order.status || 'N/A',
      'Due Date': order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'N/A',
      'Created': order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}),
      ...csvData.map(row => Object.values(row))
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount || 0);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Orders ({filteredOrders.length})</h2>
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number, customer, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            {OrderService.getOrderStatusOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleExport}
            disabled={filteredOrders.length === 0}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            title="Export CSV"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const isOverdue = order.dueDate && new Date(order.dueDate) < new Date() && 
                    !['completed', 'cancelled'].includes(order.status);
                  
                  return (
                    <tr key={order._id} className={`hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            {order.orderNumber || `#${order._id?.slice(-8)}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            {order.customerId?.fullName || 'N/A'}
                          </div>
                          {order.customerId?.email && (
                            <div className="text-sm text-gray-500">{order.customerId.email}</div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            {order.items?.[0]?.productName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Qty: {order.items?.[0]?.quantity || 0}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(order.orderTotal)}
                        </div>
                        {order.paymentStatus && (
                          <div className="text-sm text-gray-500 capitalize">
                            Payment: {order.paymentStatus}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          disabled={loading}
                          className={`text-sm rounded-full px-2 py-1 border-0 font-medium ${getStatusColor(order.status)} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          {OrderService.getOrderStatusOptions().map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                          {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'N/A'}
                        </div>
                        {isOverdue && (
                          <div className="text-xs text-red-500">Overdue</div>
                        )}
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {onView && (
                            <button
                              onClick={() => onView(order)}
                              className="p-1 text-gray-600 hover:text-blue-600"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          {onEdit && (
                            <button
                              onClick={() => onEdit(order)}
                              className="p-1 text-gray-600 hover:text-green-600"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(order)}
                              className="p-1 text-gray-600 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;