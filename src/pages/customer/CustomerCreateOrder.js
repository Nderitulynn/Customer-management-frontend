import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import OrderForm from '../../components/customers/orders/OrderForm';

const CustomerCreateOrder = ({ 
  currentUser, 
  onSectionChange, 
  dashboardData, 
  refreshDashboard,
  getStatusColor,
  getStatusIcon,
  formatCurrency,
  formatDate 
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleOrderFormSubmit = (newOrder) => {
    setMessage({ text: 'Order created successfully!', type: 'success' });
    
    // Refresh dashboard data to show new order
    if (refreshDashboard) {
      refreshDashboard();
    }
    
    // Navigate to order details after a short delay
    setTimeout(() => {
      if (onSectionChange) {
        onSectionChange('order-details');
      }
      // Update URL if using React Router
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', `/customer/orders/${newOrder._id || newOrder.id}`);
      }
    }, 1500);
  };

  const handleOrderFormCancel = () => {
    if (onSectionChange) {
      onSectionChange('orders');
    }
    // Update URL if using React Router  
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', '/customer/orders');
    }
  };

  return (
    <div className="w-full">
      {/* Success/Error Messages */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* OrderForm - Full width within the dashboard layout */}
      <div className="w-full">
        <OrderForm
          onSubmit={handleOrderFormSubmit}
          onCancel={handleOrderFormCancel}
          isModal={false}
        />
      </div>
    </div>
  );
};

export default CustomerCreateOrder;