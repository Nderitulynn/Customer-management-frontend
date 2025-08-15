import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CustomerLayout from '../../components/customers/layout/CustomerLayout';
import CustomerOrderService from '../../services/customerOrderService';
import OrderForm from '../../components/customers/orders/OrderForm'; // Fixed: Import OrderForm component
import OrderList from '../../components/customers/orders/OrderList'; // Import OrderList component
import { 
  Package, 
  Calendar, 
  DollarSign, 
  User, 
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  X,
  FileText,
  ShoppingCart,
  Edit2,
  Save,
  ArrowLeft
} from 'lucide-react';

const CustomerOrderDetails = () => {
  
  const params = useParams();
  console.log('🔍 All available params:', params);
  console.log('🔍 Params keys:', Object.keys(params));
  console.log('🔍 Params values:', Object.values(params));
  
  // Extract orderId from wildcard parameter
  const orderId = params.orderId;

  
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [cancelling, setCancelling] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // New state for edit mode

  // ========== DEBUG: LOG EXTRACTED VALUES ==========
  console.log('🔍 Extracted orderId from useParams:', orderId);
  console.log('🔍 Type of orderId:', typeof orderId);
  console.log('🔍 orderId is truthy:', !!orderId);
  console.log('🔍 orderId is undefined:', orderId === undefined);
  console.log('🔍 orderId is null:', orderId === null);
  // ================================================

  // Load order details on component mount
  useEffect(() => {
    console.log('🔍 CustomerOrderDetails - useEffect triggered');
    console.log('🔍 orderId from useEffect:', orderId);
    console.log('🔍 user from useEffect:', user);
    
    if (orderId) {
      console.log('✅ orderId exists, calling loadOrderDetails');
      loadOrderDetails();
    } else {
      console.log('❌ No orderId found in useParams - STOPPING LOADING');
      console.log('❌ This is why you have infinite loading!');
      setLoading(false); // IMPORTANT: Stop loading if no orderId
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    console.log('🔍 loadOrderDetails - Starting...');
    console.log('🔍 orderId parameter:', orderId);
    
    setLoading(true);
    try {
      // Check auth before making request
      console.log('🔍 Checking authentication...');
      console.log('🔍 user object:', user);
      
      // Check if CustomerOrderService methods exist
      console.log('🔍 CustomerOrderService methods:', Object.getOwnPropertyNames(CustomerOrderService));
      console.log('🔍 getMyOrderDetails method exists:', typeof CustomerOrderService.getMyOrderDetails === 'function');
      
      console.log('🔍 Making API call to getMyOrderDetails...');
      const response = await CustomerOrderService.getMyOrderDetails(orderId);
      
      console.log('🔍 Raw API response:', response);
      console.log('🔍 Response type:', typeof response);
      console.log('🔍 Response keys:', response ? Object.keys(response) : 'null/undefined');
      
      // Check if response has expected structure
      if (response) {
        console.log('🔍 Response.data:', response.data);
        console.log('🔍 Response.success:', response.success);
        console.log('🔍 Direct response fields:', {
          _id: response._id,
          orderNumber: response.orderNumber,
          status: response.status,
          orderTotal: response.orderTotal
        });
      }
      
      // Set order data - handle different response structures
      let orderData = null;
      if (response) {
        if (response.data) {
          console.log('🔍 Using response.data');
          orderData = response.data;
        } else if (response._id || response.orderNumber) {
          console.log('🔍 Using direct response');
          orderData = response;
        } else {
          console.log('🔍 Unknown response structure');
        }
      }
      
      console.log('🔍 Final orderData to set:', orderData);
      setOrder(orderData);
      
      if (orderData) {
        console.log('✅ Order loaded successfully:', orderData.orderNumber);
      } else {
        console.log('❌ No order data found');
      }
      
    } catch (error) {
      console.error('❌ Error in loadOrderDetails:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Error response:', error.response);
      
      setMessage({ 
        text: error.message || 'Failed to load order details. Please try again.', 
        type: 'error' 
      });
    } finally {
      console.log('🔍 loadOrderDetails - Setting loading to false');
      setLoading(false);
    }
  };

  // Handle order cancellation
  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    setCancelling(true);
    try {
      await CustomerOrderService.cancelMyOrder(orderId);
      setMessage({ text: 'Order cancelled successfully.', type: 'success' });
      // Reload order details to reflect updated status
      setTimeout(() => {
        loadOrderDetails();
      }, 1000);
    } catch (error) {
      console.error('Error cancelling order:', error);
      setMessage({ 
        text: error.message || 'Failed to cancel order. Please try again.', 
        type: 'error' 
      });
    } finally {
      setCancelling(false);
    }
    
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // Handle reorder
  const handleReorder = async () => {
    try {
      const response = await CustomerOrderService.reorderOrder(orderId);
      setMessage({ text: 'New order created successfully!', type: 'success' });
      
      // Redirect to new order details after short delay
      setTimeout(() => {
        window.location.href = `/customer/orders/${response._id}`;
      }, 1500);
    } catch (error) {
      console.error('Error creating reorder:', error);
      setMessage({ 
        text: error.message || 'Failed to reorder. Please try again.', 
        type: 'error' 
      });
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }
  };

  // Handle edit mode toggle
  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
    // Clear any existing messages when toggling edit mode
    setMessage({ text: '', type: '' });
  };

  // Handle order form submission (for edits)
  const handleOrderFormSubmit = (updatedOrder) => {
    setMessage({ text: 'Order updated successfully!', type: 'success' });
    setIsEditMode(false);
    // Update the order state with the new data
    setOrder(updatedOrder);
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  // Handle order form cancellation
  const handleOrderFormCancel = () => {
    setIsEditMode(false);
    setMessage({ text: '', type: '' });
  };

  // Check if order can be edited
  const canEditOrder = () => {
    return order && order.status === 'pending';
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };

    return statusStyles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5" />;
      case 'confirmed':
      case 'in_progress':
        return <AlertCircle className="h-5 w-5" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  // Clear message when user interacts with page
  const clearMessage = () => {
    if (message.text) {
      setMessage({ text: '', type: '' });
    }
  };

  // ========== DEBUG: LOG CURRENT STATE ==========
  console.log('🔍 Current component state:', {
    loading,
    order: order ? { id: order._id, orderNumber: order.orderNumber, status: order.status } : null,
    message,
    orderId,
    user: user ? { id: user.id, email: user.email } : null
  });
  console.log('🔍 About to render. Loading state:', loading);
  // =============================================

  // ========== SPECIAL DEBUG CASE FOR NO ORDER ID ==========
  if (!orderId) {
    console.log('🔍 Rendering NO ORDER ID message...');
    return (
      <CustomerLayout title="Order Details" showBackButton={true}>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Order ID Found</h3>
          <p className="text-gray-500 mb-4">
            The URL doesn't contain a valid order ID parameter.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
            <h4 className="font-medium text-yellow-800 mb-2">Debug Info:</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <div>Available URL params: {JSON.stringify(params)}</div>
              <div>Looking for param: "orderId"</div>
              <div>Current URL: {window.location.pathname}</div>
            </div>
          </div>
          <a
            href="/customer/orders"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Orders
          </a>
        </div>
      </CustomerLayout>
    );
  }
  // ========================================================

  if (loading) {
    console.log('🔍 Rendering loading spinner...');
    return (
      <CustomerLayout title="Order Details" showBackButton={true}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="ml-4 text-gray-600">Loading order details...</div>
        </div>
      </CustomerLayout>
    );
  }

  if (!order) {
    console.log('🔍 Rendering "order not found" message...');
    return (
      <CustomerLayout title="Order Details" showBackButton={true}>
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Order not found</h3>
          <p className="text-gray-500 mb-4">
            The order you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
            <h4 className="font-medium text-blue-800 mb-2">Debug Info:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <div>Order ID used: {orderId}</div>
              <div>API call was made: {orderId ? 'Yes' : 'No'}</div>
              <div>Response received: {order !== null ? 'Yes' : 'No'}</div>
            </div>
          </div>
          <a
            href="/customer/orders"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Orders
          </a>
        </div>
      </CustomerLayout>
    );
  }

  console.log('🔍 Rendering order details for:', order.orderNumber);

  // If in edit mode, show the OrderForm
  if (isEditMode) {
    return (
      <CustomerLayout title="Edit Order" showBackButton={false}>
        <div className="max-w-4xl mx-auto">
          {/* Success/Error Messages */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Back to View Button */}
          <div className="mb-6">
            <button
              onClick={handleOrderFormCancel}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Order Details
            </button>
          </div>

          <OrderForm
            customerId={order.customerId?._id || order.customerId}
            orderId={orderId}
            onSubmit={handleOrderFormSubmit}
            onCancel={handleOrderFormCancel}
            isModal={false}
          />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout title="Order Details" showBackButton={true} onClick={clearMessage}>
      <div className="max-w-4xl mx-auto">
        {/* Success/Error Messages */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Order Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {order.orderNumber}
              </h2>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusBadge(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {/* Edit Button - only show for pending orders */}
              {canEditOrder() && (
                <button
                  onClick={handleEditToggle}
                  className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Order
                </button>
              )}

              {/* Cancel Button - only for pending orders */}
              {order.status === 'pending' && (
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 disabled:opacity-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}
              
              {/* Reorder Button - for completed or cancelled orders */}
              {(order.status === 'completed' || order.status === 'cancelled') && (
                <button
                  onClick={handleReorder}
                  className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reorder
                </button>
              )}
            </div>
          </div>

          {/* Order Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Order Total</p>
                <p className="font-medium text-gray-900">
                  KES {(order.orderTotal || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Items</p>
                <p className="font-medium text-gray-900">
                  {order.items?.length || 0} items
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Package className="h-5 w-5 mr-2 text-blue-600" />
              Order Items
            </h3>
          </div>

          <div className="p-6">
            {order.items && order.items.length > 0 ? (
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.productName}</h4>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity} × KES {(item.unitPrice || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        KES {((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Order Total */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-gray-900">
                    KES {(order.orderTotal || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No items in this order</p>
            )}
          </div>
        </div>

        {/* Order Notes */}
        {order.notes && (
          <div className="bg-white rounded-lg border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Order Notes
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
            </div>
          </div>
        )}

        {/* Customer Information */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Customer Information
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Name</p>
                <p className="font-medium text-gray-900">
                  {user?.name || user?.firstName || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="font-medium text-gray-900">{user?.email || 'N/A'}</p>
              </div>
              {order.createdBy && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Created By</p>
                  <p className="font-medium text-gray-900">{order.createdBy.name || 'System'}</p>
                </div>
              )}
              {order.assignedTo && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Assigned To</p>
                  <p className="font-medium text-gray-900">{order.assignedTo.name || 'Unassigned'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerOrderDetails;