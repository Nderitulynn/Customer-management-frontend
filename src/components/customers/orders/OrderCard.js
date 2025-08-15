import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';

const OrderCard = ({ order, onUpdateStatus, onEdit, onDelete, onView }) => {
  // Get status color classes
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <p className="font-medium text-gray-900">#{order.id}</p>
            <p className="text-sm text-gray-600">{order.customerName || 'Unknown Customer'}</p>
            <p className="text-xs text-gray-500">
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : order.date}
            </p>
          </div>
          <div className="text-sm text-gray-600">
            <p>{order.items || order.item || 'No items'}</p>
            {order.assignedTo && (
              <p className="text-xs text-gray-500">
                Assigned to: {order.assignedTo}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="text-right flex items-center space-x-4">
        <div>
          <p className="font-semibold text-gray-900">
            ${(order.totalAmount || order.amount || 0).toFixed(2)}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
        </div>
        
        {/* Status Update Dropdown */}
        {onUpdateStatus && (
          <div>
            <select
              value={order.status}
              onChange={(e) => onUpdateStatus(order.id, e.target.value)}
              className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-1">
          {onView && (
            <button
              onClick={() => onView(order.id)}
              className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(order.id)}
              className="p-1 text-green-600 hover:text-green-800 transition-colors"
              title="Edit order"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(order.id)}
              className="p-1 text-red-600 hover:text-red-800 transition-colors"
              title="Delete order"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;