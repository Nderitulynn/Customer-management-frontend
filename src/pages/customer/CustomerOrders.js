import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import customerOrderService from '../../services/customerOrderService'; // Fixed: Use consistent lowercase import
import OrderList from '../../components/customers/orders/OrderList'; // Import OrderList component
import { 
  Package, 
  Plus, 
  Search, 
  Filter
} from 'lucide-react';

const CustomerOrders = ({ 
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
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Status options for filter
  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Load orders on component mount and when filters change
  useEffect(() => {
    loadOrders();
  }, [searchTerm, statusFilter, currentPage]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };

      const response = await customerOrderService.getMyOrders(params);
      
      // ============ FIXED: Use flexible response structure handling like Dashboard ============
      console.log('🔄 API Response:', response);
      
      // Handle multiple possible response structures (same as Dashboard)
      const ordersData = response.data || response.orders || response || [];
      console.log('🔄 Orders data:', ordersData);
      
      setOrders(ordersData);
      
      // Handle pagination data with flexible structure
      setTotalPages(response.totalPages || response.pagination?.totalPages || 1);
      
    } catch (error) {
      console.error('Error loading orders:', error);
      setMessage({ 
        text: 'Failed to load orders. Please try again.', 
        type: 'error' 
      });
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Handle order actions from OrderList component
  const handleOrderView = (order) => {
    navigate(`/customer/orders/${order._id}`);
  };

  const handleOrderEdit = (order) => {
    // For customers, redirect to view details (edit might not be allowed)
    navigate(`/customer/orders/${order._id}`);
  };

  const handleOrderDelete = async (order) => {
    if (order.status !== 'pending') {
      setMessage({ 
        text: 'Only pending orders can be cancelled.', 
        type: 'error' 
      });
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
      return;
    }

    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    try {
      await customerOrderService.cancelMyOrder(order._id);
      setMessage({ text: 'Order cancelled successfully.', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      // Reload orders to reflect the change
      loadOrders();
      // Also refresh dashboard data if available
      if (refreshDashboard) {
        refreshDashboard();
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      setMessage({ 
        text: error.message || 'Failed to cancel order. Please try again.', 
        type: 'error' 
      });
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }
  };

  const handleOrderRefresh = () => {
    loadOrders();
    // Also refresh dashboard data if available
    if (refreshDashboard) {
      refreshDashboard();
    }
  };

  const handleCreateNew = () => {
    navigate('/customer/orders/new');
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle page navigation
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Clear message when user interacts with page
  const clearMessage = () => {
    if (message.text) {
      setMessage({ text: '', type: '' });
    }
  };

  // Check if filters are active
  const hasActiveFilters = searchTerm || statusFilter !== 'all';

  return (
    <div onClick={clearMessage} className="space-y-6">
      {/* Success/Error Messages */}
      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={handleCreateNew}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Order
        </button>
      </div>

      {/* Search and Filters - ONLY SHOW WHEN THERE ARE ORDERS OR ACTIVE FILTERS */}
      {(orders.length > 0 || hasActiveFilters) && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by order number or product..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Status Filter - ONLY SHOW WHEN THERE ARE ORDERS */}
            {orders.length > 0 && (
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders List using OrderList component */}
      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            
            {/* DIFFERENT MESSAGES BASED ON SEARCH/FILTER STATE */}
            {hasActiveFilters ? (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders match your criteria</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search or filter settings.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={handleCreateNew}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Order
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-4">
                  You haven't placed any orders yet. Create your first order to get started.
                </p>
                <button
                  onClick={handleCreateNew}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Order
                </button>
              </>
            )}
          </div>
        ) : (
          <OrderList
            orders={orders}
            onView={handleOrderView}
            onEdit={handleOrderEdit}
            onDelete={handleOrderDelete}
            onRefresh={handleOrderRefresh}
            onCreateNew={handleCreateNew}
            // Pass standardized functions
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        )}
      </div>

      {/* Pagination - ONLY SHOW WHEN THERE ARE ORDERS AND MULTIPLE PAGES */}
      {orders.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;