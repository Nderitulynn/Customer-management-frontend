import React from 'react';
import { 
  X, 
  Edit2, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Package, 
  Calendar, 
  CreditCard,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react';

const OrderViewModal = ({ order, onClose, onEdit, onDelete }) => {
  if (!order) return null;

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid': return 'text-green-600 bg-green-50 border-green-200';
      case 'partial': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'pending': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'refunded': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress':
      case 'confirmed': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount || 0);
  };

  const customer = order.customerId || {};
  const items = order.items || [];
  const orderTotal = order.orderTotal || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {getStatusIcon(order.status)}
              <h2 className="text-xl font-semibold text-gray-900">
                Order #{order.orderNumber || order._id?.slice(-8)}
              </h2>
            </div>
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusBadgeColor(order.status)}`}>
              {order.status === 'in_progress' ? 'In Progress' : order.status}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit && onEdit(order)}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Order"
            >
              <Edit2 className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete && onDelete(order)}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Order"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-8">
            {/* Order Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <User className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{customer.fullName || 'N/A'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{customer.email || 'N/A'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{customer.phone || 'N/A'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{customer.address || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Package className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
                  </div>
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.productName || 'N/A'}</h4>
                          <p className="text-sm text-gray-600">Product ID: {item.productId || 'N/A'}</p>
                        </div>
                        <div className="text-center mx-4">
                          <div className="text-sm text-gray-600">Quantity</div>
                          <div className="font-semibold text-gray-900">{item.quantity || 0}</div>
                        </div>
                        <div className="text-center mx-4">
                          <div className="text-sm text-gray-600">Unit Price</div>
                          <div className="font-semibold text-gray-900">{formatCurrency(item.unitPrice)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Subtotal</div>
                          <div className="font-semibold text-gray-900">
                            {formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Details Sidebar */}
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <DollarSign className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-900">{formatCurrency(orderTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax:</span>
                      <span className="text-gray-900">KSh 0.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="text-gray-900">KSh 0.00</span>
                    </div>
                    <hr className="my-3" />
                    <div className="flex justify-between font-semibold text-lg">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">{formatCurrency(orderTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Payment Status</h3>
                  </div>
                  <div className={`inline-flex px-3 py-2 text-sm font-medium rounded-lg border ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus || 'pending'}
                  </div>
                </div>

                {/* Order Dates */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Calendar className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Important Dates</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <div className="font-medium text-gray-900">
                        {formatDate(order.creationDate || order.createdAt)}
                      </div>
                    </div>
                    {order.updatedAt && (
                      <div>
                        <span className="text-gray-600">Last Updated:</span>
                        <div className="font-medium text-gray-900">
                          {formatDate(order.updatedAt)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignment */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <User className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Assignment</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">Assigned To:</span>
                      <div className="font-medium text-gray-900">
                        {order.assignedTo?.fullName || 
                         (order.assignedTo?.firstName && order.assignedTo?.lastName 
                           ? `${order.assignedTo.firstName} ${order.assignedTo.lastName}` 
                           : 'N/A')}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Created By:</span>
                      <div className="font-medium text-gray-900">
                        {order.createdBy?.fullName || 
                         (order.createdBy?.firstName && order.createdBy?.lastName 
                           ? `${order.createdBy.firstName} ${order.createdBy.lastName}` 
                           : 'N/A')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {order.notes && (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-5 w-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
                </div>
                <div className="text-gray-700 whitespace-pre-wrap">{order.notes}</div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Order ID: {order._id}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => onEdit && onEdit(order)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Order
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderViewModal;