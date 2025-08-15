import React, { useState } from 'react';
import { Search, Plus, Eye, Download, RotateCcw, X } from 'lucide-react';
import CustomerOrderService from '../../../services/customerOrderService';

const OrderList = ({ 
  orders, 
  onView, 
  onReorder, 
  onCancel, 
  onRefresh, 
  onCreateNew,
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // ========== DEBUG CONSOLE LOGS - REMOVE AFTER FIXING ==========
  console.log('🔍 OrderList Debug - Raw orders prop:', orders);
  console.log('🔍 OrderList Debug - Orders type:', typeof orders);
  console.log('🔍 OrderList Debug - Orders length:', orders?.length);
  console.log('🔍 OrderList Debug - First order:', orders?.[0]);
  console.log('🔍 OrderList Debug - Orders array check:', Array.isArray(orders));
  console.log('🔍 OrderList Debug - Orders content:', JSON.stringify(orders, null, 2));
  // ===============================================================

  // Filter orders based on search and status - simplified for customer use
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = !searchTerm || 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items?.[0]?.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  // ========== DEBUG CONSOLE LOGS - REMOVE AFTER FIXING ==========
  console.log('🔍 OrderList Debug - Filtered orders:', filteredOrders);
  console.log('🔍 OrderList Debug - Filtered length:', filteredOrders.length);
  console.log('🔍 OrderList Debug - Search term:', searchTerm);
  console.log('🔍 OrderList Debug - Status filter:', statusFilter);
  // ===============================================================

  const handleExport = () => {
    const csvData = filteredOrders.map(order => ({
      'Order Number': order.orderNumber || 'N/A',
      'Product': order.items?.[0]?.productName || 'N/A',
      'Quantity': order.items?.[0]?.quantity || 0,
      'Total': CustomerOrderService.formatCurrency(order.orderTotal || 0),
      'Status': order.status || 'N/A',
      'Created': order.creationDate ? new Date(order.creationDate).toLocaleDateString() : 'N/A',
      'Notes': order.notes || ''
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`))
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    const statusDisplay = CustomerOrderService.getStatusDisplay(status);
    return `${statusDisplay.bgColor} ${statusDisplay.textColor}`;
  };

  const formatCurrency = (amount) => {
    return CustomerOrderService.formatCurrency(amount);
  };

  const canCancelOrder = (order) => {
    return order.status === 'pending' && onCancel;
  };

  const canReorderOrder = (order) => {
    return ['completed', 'cancelled'].includes(order.status) && onReorder;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          My Orders ({filteredOrders.length})
        </h2>
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center text-sm"
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
                placeholder="Search by order number, product, or notes..."
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
            {CustomerOrderService.getOrderStatusOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleExport}
            disabled={filteredOrders.length === 0}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
            title="Export CSV"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No orders found</p>
            {searchTerm || statusFilter !== 'all' ? (
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
            ) : onCreateNew ? (
              <button
                onClick={onCreateNew}
                className="mt-3 text-blue-600 hover:text-blue-700 text-sm"
              >
                Create your first order
              </button>
            ) : null}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const statusDisplay = CustomerOrderService.getStatusDisplay(order.status);
                  const orderAge = CustomerOrderService.calculateOrderAge(order.creationDate || order.createdAt);
                  const isNewOrder = orderAge <= 1;
                  
                  return (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900 flex items-center gap-2">
                            {order.orderNumber || `#${order._id?.slice(-8)}`}
                            {isNewOrder && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                New
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            {order.items?.[0]?.productName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Qty: {order.items?.[0]?.quantity || 0}
                            {order.items?.length > 1 && (
                              <span className="ml-2 text-blue-600">
                                +{order.items.length - 1} more
                              </span>
                            )}
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
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                        >
                          {statusDisplay.label}
                        </span>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          {CustomerOrderService.formatDate(order.creationDate || order.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {CustomerOrderService.getTimeAgo(order.creationDate || order.createdAt)}
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {onView && (
                            <button
                              onClick={() => onView(order)}
                              className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          
                          {canReorderOrder(order) && (
                            <button
                              onClick={() => onReorder(order)}
                              className="p-1 text-gray-600 hover:text-green-600 transition-colors"
                              title="Reorder"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          )}
                          
                          {canCancelOrder(order) && (
                            <button
                              onClick={() => onCancel(order)}
                              className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                              title="Cancel Order"
                            >
                              <X className="h-4 w-4" />
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

      {/* Summary */}
      {filteredOrders.length > 0 && (
        <div className="bg-gray-50 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Showing {filteredOrders.length} of {orders.length} orders
            </span>
            <span>
              Total Value: {formatCurrency(
                filteredOrders.reduce((sum, order) => sum + (order.orderTotal || 0), 0)
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;