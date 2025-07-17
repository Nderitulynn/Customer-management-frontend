import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderCard from '../components/orders/OrderCard';
import OrderForm from '../components/orders/OrderForm';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';

const OrdersPage = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/orders?userId=${user.id}&role=${user.role}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const handleSort = (sortOption) => {
    setSortBy(sortOption);
  };

  const handleCreateOrder = () => {
    setEditingOrder(null);
    setShowOrderForm(true);
  };

  const handleEditOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setEditingOrder(order);
      setShowOrderForm(true);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setOrders(orders.filter(order => order.id !== orderId));
      } else {
        throw new Error('Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      setError('Failed to delete order. Please try again.');
    }
  };

  const handleOrderSubmit = (savedOrder) => {
    if (editingOrder) {
      // Update existing order
      setOrders(orders.map(order => 
        order.id === savedOrder.id ? savedOrder : order
      ));
    } else {
      // Add new order
      setOrders([savedOrder, ...orders]);
    }
    
    setShowOrderForm(false);
    setEditingOrder(null);
  };

  const handleOrderCancel = () => {
    setShowOrderForm(false);
    setEditingOrder(null);
  };

  const navigateToCustomer = (customerId) => {
    navigate(`/customers/${customerId}`);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toString().includes(searchTerm) ||
                         order.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'amount':
        return b.totalAmount - a.totalAmount;
      case 'status':
        return a.status.localeCompare(b.status);
      case 'customer':
        return a.customerName.localeCompare(b.customerName);
      case 'dueDate':
        return new Date(a.dueDate) - new Date(b.dueDate);
      default:
        return 0;
    }
  });

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      completed: orders.filter(o => o.status === 'completed').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      totalAmount: orders.reduce((sum, order) => sum + order.totalAmount, 0)
    };
    return stats;
  };

  const stats = getOrderStats();

  if (loading) {
    return (
      <div className="orders-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Orders Management</h1>
          <button 
            className="create-order-btn primary-btn"
            onClick={handleCreateOrder}
          >
            + Create Order
          </button>
        </div>
        
        {/* Order Statistics */}
        <div className="order-stats">
          <div className="stat-item">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Orders</span>
          </div>
          <div className="stat-item">
            <StatusBadge status="pending" type="order" />
            <span className="stat-value">{stats.pending}</span>
          </div>
          <div className="stat-item">
            <StatusBadge status="completed" type="order" />
            <span className="stat-value">{stats.completed}</span>
          </div>
          <div className="stat-item">
            <StatusBadge status="cancelled" type="order" />
            <span className="stat-value">{stats.cancelled}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">${stats.totalAmount.toFixed(2)}</span>
            <span className="stat-label">Total Value</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="orders-controls">
        <div className="search-section">
          <SearchBar
            placeholder="Search by customer, order ID, or product..."
            value={searchTerm}
            onChange={handleSearch}
            onClear={() => setSearchTerm('')}
          />
        </div>
        
        <div className="filter-section">
          <select 
            value={statusFilter} 
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => handleSort(e.target.value)}
            className="sort-select"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="status">Sort by Status</option>
            <option value="customer">Sort by Customer</option>
            <option value="dueDate">Sort by Due Date</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
          <button 
            className="retry-btn"
            onClick={fetchOrders}
          >
            Retry
          </button>
        </div>
      )}

      {/* Orders List */}
      <div className="orders-content">
        {sortedOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No orders found</h3>
            <p>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Create your first order to get started'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button 
                className="create-first-order-btn"
                onClick={handleCreateOrder}
              >
                Create First Order
              </button>
            )}
          </div>
        ) : (
          <div className="orders-grid">
            {sortedOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onEdit={handleEditOrder}
                onDelete={handleDeleteOrder}
                showCustomer={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <OrderForm
              orderId={editingOrder?.id}
              onSubmit={handleOrderSubmit}
              onCancel={handleOrderCancel}
              isModal={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;