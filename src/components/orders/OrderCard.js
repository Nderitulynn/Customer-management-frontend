import React from 'react';
import { useNavigate } from 'react-router-dom';

const OrderCard = ({ order, onEdit, onDelete, showCustomer = true }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'status-pending',
      completed: 'status-completed',
      cancelled: 'status-cancelled'
    };
    return statusColors[status] || 'status-default';
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(order.id);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      if (window.confirm('Are you sure you want to delete this order?')) {
        onDelete(order.id);
      }
    }
  };

  const handleCustomerClick = (e) => {
    e.stopPropagation();
    if (order.customerId) {
      navigate(`/customers/${order.customerId}`);
    }
  };

  const isOverdue = () => {
    if (!order.dueDate || order.status === 'completed') return false;
    return new Date(order.dueDate) < new Date();
  };

  return (
    <div className="order-card">
      <div className="order-card-header">
        <div className="order-info">
          <h3 className="order-id">Order #{order.id}</h3>
          <span className="order-date">{formatDate(order.createdAt)}</span>
        </div>
        <div className="order-actions">
          {onEdit && (
            <button 
              className="edit-btn"
              onClick={handleEdit}
              title="Edit order"
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button 
              className="delete-btn"
              onClick={handleDelete}
              title="Delete order"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <div className="order-card-body">
        {showCustomer && (
          <div className="customer-info">
            <label>Customer:</label>
            <span 
              className="customer-name clickable"
              onClick={handleCustomerClick}
              title="View customer details"
            >
              {order.customerName}
            </span>
          </div>
        )}

        <div className="product-summary">
          <label>Product:</label>
          <span className="product-name">{order.productName}</span>
          <span className="product-quantity">Qty: {order.quantity}</span>
        </div>

        <div className="order-amount">
          <label>Total Amount:</label>
          <span className="amount-value">{formatCurrency(order.totalAmount)}</span>
        </div>

        <div className="order-status">
          <label>Status:</label>
          <span className={`status-badge ${getStatusColor(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        <div className="due-date">
          <label>Due Date:</label>
          <span className={`due-date-value ${isOverdue() ? 'overdue' : ''}`}>
            {formatDate(order.dueDate)}
            {isOverdue() && <span className="overdue-indicator"> (Overdue)</span>}
          </span>
        </div>

        {order.notes && (
          <div className="order-notes">
            <label>Notes:</label>
            <p className="notes-text">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCard;