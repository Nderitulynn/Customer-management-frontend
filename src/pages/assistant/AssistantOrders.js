import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Edit2, Eye, ArrowLeft, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OrderService from '../../services/orderService';
import OrderForm from '../../components/assistants/orders/OrderForm';
import OrderList from '../../components/assistants/orders/OrderList';

const AssistantOrders = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  // Order management
  const [orders, setOrders] = useState([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // UI state
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);

  useEffect(() => {
    loadOrderData();
  }, []);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Use the actual order service with search and status filters
      const params = {};
      if (orderSearch.trim()) params.search = orderSearch;
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const ordersData = await OrderService.getAllOrders(params);
      setOrders(Array.isArray(ordersData) ? ordersData : []);

    } catch (err) {
      console.error('Error loading order data:', err);
      setError('Failed to load order data: ' + (err.message || 'Unknown error'));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh orders when search or filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!loading) {
        loadOrderData();
      }
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [orderSearch, statusFilter]);

  const handleCreateOrder = () => {
    setEditingOrder(null);
    setShowOrderForm(true);
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setShowOrderForm(true);
  };

  const handleViewOrder = (order) => {
    setViewingOrder(order);
  };

  const handleDeleteOrder = async (order) => {
    if (!window.confirm(`Are you sure you want to delete order ${order.orderNumber || order._id}?`)) {
      return;
    }

    try {
      setLoading(true);
      await OrderService.deleteOrder(order._id);
      setMessage(`Order ${order.orderNumber || order._id} deleted successfully`);
      setTimeout(() => setMessage(''), 3000);
      await loadOrderData();
    } catch (err) {
      console.error('Error deleting order:', err);
      setError('Failed to delete order: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSubmit = async (orderData) => {
    try {
      setMessage(editingOrder ? 'Order updated successfully' : 'Order created successfully');
      setTimeout(() => setMessage(''), 3000);
      setShowOrderForm(false);
      setEditingOrder(null);
      await loadOrderData();
    } catch (err) {
      console.error('Error handling order submit:', err);
      setError('Failed to save order: ' + (err.message || 'Unknown error'));
    }
  };

  const handleOrderFormCancel = () => {
    setShowOrderForm(false);
    setEditingOrder(null);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in progress':
      case 'confirmed': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (!order) return false;
    
    const matchesSearch = !orderSearch || 
      (order.orderNumber && order.orderNumber.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (order.customerId?.fullName && order.customerId.fullName.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (order.items?.[0]?.productName && order.items[0].productName.toLowerCase().includes(orderSearch.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate order statistics
  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    in_progress: orders.filter(o => o.status === 'in progress').length,
    completed: orders.filter(o => o.status === 'completed').length,
    totalValue: orders.reduce((sum, order) => sum + (order.orderTotal || 0), 0)
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/assistant/dashboard')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
               
              </div>
            </div>
            <button
              onClick={handleCreateOrder}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {message}
          </div>
        )}

        {/* Order Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orderStats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{orderStats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">{orderStats.confirmed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{orderStats.in_progress}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{orderStats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">KSh</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('en-KE', {
                    style: 'currency',
                    currency: 'KES'
                  }).format(orderStats.totalValue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Show Order Form or Order List */}
        {showOrderForm ? (
          <OrderForm
            orderId={editingOrder?._id}
            onSubmit={handleOrderSubmit}
            onCancel={handleOrderFormCancel}
            isModal={false}
          />
        ) : (
          <>
            {/* Order Management Section */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Orders</h2>
                  <div className="text-sm text-gray-500">
                    Showing {filteredOrders.length} of {orders.length} orders
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search orders by number, customer, or product..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    {OrderService.getOrderStatusOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Orders Table */}
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {orderSearch || statusFilter !== 'all' 
                        ? 'No orders match your search criteria.' 
                        : 'No orders available.'}
                    </p>
                    <button
                      onClick={handleCreateOrder}
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm mx-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Order
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.map(order => (
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getStatusIcon(order.status)}
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">
                                    #{order.orderNumber || order._id?.slice(-8)}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {order.items?.length || 0} items
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {order.customerId?.fullName || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.customerId?.email || ''}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {order.items?.[0]?.productName || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                Qty: {order.items?.[0]?.quantity || 0}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {new Intl.NumberFormat('en-KE', {
                                  style: 'currency',
                                  currency: 'KES'
                                }).format(order.orderTotal || 0)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-KE', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => handleViewOrder(order)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="View Order"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleEditOrder(order)}
                                  className="text-green-600 hover:text-green-800"
                                  title="Edit Order"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Order View Modal */}
        {viewingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Order Details</h3>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <strong>Order ID:</strong> {viewingOrder.orderNumber || viewingOrder._id}
                </div>
                <div>
                  <strong>Customer:</strong> {viewingOrder.customerId?.fullName || 'N/A'}
                </div>
                <div>
                  <strong>Product:</strong> {viewingOrder.items?.[0]?.productName || 'N/A'}
                </div>
                <div>
                  <strong>Quantity:</strong> {viewingOrder.items?.[0]?.quantity || 0}
                </div>
                <div>
                  <strong>Total:</strong> {new Intl.NumberFormat('en-KE', {
                    style: 'currency',
                    currency: 'KES'
                  }).format(viewingOrder.orderTotal || 0)}
                </div>
                <div>
                  <strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(viewingOrder.status)}`}>
                    {viewingOrder.status}
                  </span>
                </div>
                <div>
                  <strong>Created Date:</strong> {viewingOrder.createdAt ? new Date(viewingOrder.createdAt).toLocaleDateString('en-KE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}
                </div>
                {viewingOrder.notes && (
                  <div>
                    <strong>Notes:</strong> {viewingOrder.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssistantOrders;