import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OrderList = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders?userId=${user.id}&role=${user.role}`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
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

  const navigateToCustomer = (customerId) => {
    navigate(`/customers/${customerId}`);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toString().includes(searchTerm);
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
      default:
        return 0;
    }
  });

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>Orders</h1>
        <button 
          className="create-order-btn"
          onClick={() => navigate('/orders/create')}
        >
          Create Order
        </button>
      </div>

      <div className="orders-controls">
        <input
          type="text"
          placeholder="Search by customer name or order ID..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
        />
        
        <select 
          value={statusFilter} 
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
          <option value="status">Sort by Status</option>
        </select>
      </div>

      <div className="orders-list">
        {sortedOrders.length === 0 ? (
          <div className="no-orders">No orders found</div>
        ) : (
          sortedOrders.map(order => (
            <div 
              key={order.id} 
              className="order-item"
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              <div className="order-info">
                <div className="order-id">Order #{order.id}</div>
                <div 
                  className="customer-name"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToCustomer(order.customerId);
                  }}
                >
                  {order.customerName}
                </div>
                <div className="order-amount">${order.totalAmount}</div>
                <div className={`order-status ${order.status}`}>
                  {order.status}
                </div>
                <div className="order-date">
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderList;