import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Eye, Package, Plus, X, Loader2 } from 'lucide-react';
import OrderService from '../../../services/orderService';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New order form state
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    status: 'pending',
    notes: '',
    items: [{ productName: '', quantity: '', unitPrice: '' }]
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await OrderService.getAllOrders({ page: 1, limit: 50 });
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      setError(error.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewOrder = async (orderId) => {
    try {
      setError('');
      const order = await OrderService.getOrderById(orderId);
      setSelectedOrder(order);
    } catch (error) {
      console.error('Error loading order details:', error);
      setError(error.message || 'Failed to load order details');
    }
  };

  // NEW ORDER FUNCTIONS
  const handleNewOrderClick = () => {
    setShowNewOrderModal(true);
    setError('');
  };

  const handleNewOrderClose = () => {
    setShowNewOrderModal(false);
    setSubmitting(false);
    setError('');
    // Reset form
    setNewOrder({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      status: 'pending',
      notes: '',
      items: [{ productName: '', quantity: '', unitPrice: '' }]
    });
  };

  const handleNewOrderSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (submitting) return;
    
    try {
      setSubmitting(true);
      setError('');
      
      // Validate required fields
      if (!newOrder.customerName.trim()) {
        throw new Error('Customer name is required');
      }
      if (!newOrder.customerEmail.trim()) {
        throw new Error('Customer email is required');
      }
      
      // Validate items
      const validItems = newOrder.items.filter(item => 
        item.productName.trim() && item.quantity && item.unitPrice
      );
      
      if (validItems.length === 0) {
        throw new Error('At least one valid item is required');
      }
      
      // Process items with totalPrice calculation
      const processedItems = validItems.map(item => {
        const quantity = parseInt(item.quantity) || 1;
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const totalPrice = quantity * unitPrice;
        
        return {
          productName: item.productName.trim(),
          quantity: quantity,
          unitPrice: unitPrice,
          totalPrice: totalPrice
        };
      });

      // Structure data to match Order schema exactly
      const orderData = {
        customer: {
          fullName: newOrder.customerName.trim(),
          email: newOrder.customerEmail.trim(),
          phone: newOrder.customerPhone.trim()
        },
        items: processedItems,
        notes: newOrder.notes.trim()
      };

      const createdOrder = await OrderService.createOrder(orderData);
      setOrders([createdOrder, ...orders]);
      handleNewOrderClose();
      
    } catch (error) {
      console.error('Error creating order:', error);
      setError(error.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewOrderInputChange = (field, value) => {
    setNewOrder(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleItemChange = (index, field, value) => {
    setNewOrder(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };
      return {
        ...prev,
        items: updatedItems
      };
    });
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const addNewItem = () => {
    setNewOrder(prev => ({
      ...prev,
      items: [...prev.items, { productName: '', quantity: '', unitPrice: '' }]
    }));
  };

  const removeItem = (index) => {
    if (newOrder.items.length > 1) {
      const updatedItems = newOrder.items.filter((_, i) => i !== index);
      setNewOrder(prev => ({
        ...prev,
        items: updatedItems
      }));
    }
  };

  // Calculate total for display
  const calculateItemTotal = (item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return qty * price;
  };

  const calculateOrderTotal = () => {
    return newOrder.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  // Validate form for button state
  const isFormValid = () => {
    const hasValidCustomer = newOrder.customerName.trim() && newOrder.customerEmail.trim();
    const hasValidItems = newOrder.items.some(item => 
      item.productName.trim() && item.quantity && item.unitPrice
    );
    return hasValidCustomer && hasValidItems;
  };

  // Filter orders based on search term - Updated to use correct field names
  const filteredOrders = orders.filter(order =>
    order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Header with New Order Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <button 
          onClick={handleNewOrderClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>New Order</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders by number, customer name, or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            style={{ color: 'black' }}
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Orders ({filteredOrders.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>No orders found</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map(order => (
                  <tr key={order._id || order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-900">#{order.orderNumber || order._id || order.id}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-gray-900">{order.customer?.fullName || 'Unknown Customer'}</p>
                        <p className="text-sm text-gray-500">{order.customer?.email || 'No email'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-900">${(order.orderTotal || 0).toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        {order.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewOrder(order._id || order.id)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* NEW ORDER MODAL */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Create New Order</h3>
              <button
                onClick={handleNewOrderClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={submitting}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Form Error Message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleNewOrderSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Customer Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newOrder.customerName}
                      onChange={(e) => handleNewOrderInputChange('customerName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all"
                      style={{ color: 'black' }}
                      autoComplete="off"
                      disabled={submitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={newOrder.customerEmail}
                      onChange={(e) => handleNewOrderInputChange('customerEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all"
                      style={{ color: 'black' }}
                      autoComplete="off"
                      disabled={submitting}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Phone
                  </label>
                  <input
                    type="tel"
                    value={newOrder.customerPhone}
                    onChange={(e) => handleNewOrderInputChange('customerPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all"
                    style={{ color: 'black' }}
                    autoComplete="off"
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">Order Items</h4>
                  <button
                    type="button"
                    onClick={addNewItem}
                    className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 transition-colors flex items-center space-x-1"
                    disabled={submitting}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Item</span>
                  </button>
                </div>
                
                {newOrder.items.map((item, index) => (
                  <div key={index} className="border p-4 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={item.productName}
                          onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all"
                          style={{ color: 'black' }}
                          autoComplete="off"
                          disabled={submitting}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all"
                          style={{ color: 'black' }}
                          autoComplete="off"
                          disabled={submitting}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit Price *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all"
                          style={{ color: 'black' }}
                          autoComplete="off"
                          disabled={submitting}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <p className="text-sm text-gray-600">
                        Item Total: ${calculateItemTotal(item).toFixed(2)}
                      </p>
                      {newOrder.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800 text-sm transition-colors"
                          disabled={submitting}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    Order Total: ${calculateOrderTotal().toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={newOrder.notes}
                  onChange={(e) => handleNewOrderInputChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all"
                  style={{ color: 'black' }}
                  placeholder="Add any additional notes for this order..."
                  autoComplete="off"
                  disabled={submitting}
                />
              </div>

              {/* Form Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleNewOrderClose}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 font-medium ${
                    submitting || !isFormValid()
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95'
                  }`}
                  disabled={submitting || !isFormValid()}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating Order...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Create Order</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Order Details - #{selectedOrder.orderNumber || selectedOrder._id || selectedOrder.id}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                <p><span className="font-medium">Name:</span> {selectedOrder.customer?.fullName || 'Unknown'}</p>
                <p><span className="font-medium">Email:</span> {selectedOrder.customer?.email || 'No email'}</p>
                {selectedOrder.customer?.phone && (
                  <p><span className="font-medium">Phone:</span> {selectedOrder.customer.phone}</p>
                )}
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">
                          ${(item.totalPrice || (item.unitPrice * item.quantity) || 0).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No items listed</p>
                )}
              </div>
              
              <div className="border-t pt-4">
                <p className="text-lg font-bold text-gray-900">
                  Total: ${(selectedOrder.orderTotal || 0).toFixed(2)}
                </p>
              </div>
              
              {selectedOrder.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Notes</h4>
                  <p className="text-gray-700">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;