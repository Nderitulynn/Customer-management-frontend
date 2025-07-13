import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MessageSquare, 
  UserPlus, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Users,
  AlertCircle,
  CheckCircle,
  User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { customerService } from '../../services/api';
import { toast } from 'react-toastify';

const CustomerList = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isAssistant = user?.role === 'assistant';

  // Fetch customers with filters and pagination
  const fetchCustomers = useCallback(async (page = 1, search = '', status = '') => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page,
        limit: 10,
        search: search.trim(),
        status: status || undefined
      };

      const response = await customerService.getCustomers(params);
      
      if (response.success) {
        setCustomers(response.data.customers);
        setCurrentPage(response.data.currentPage);
        setTotalPages(response.data.totalPages);
        setTotalCustomers(response.data.totalCustomers);
      } else {
        setError(response.message || 'Failed to fetch customers');
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch assistants for assignment (admin only)
  const fetchAssistants = useCallback(async () => {
    if (!isAdmin) return;
    
    try {
      const response = await customerService.getAssistants();
      if (response.success) {
        setAssistants(response.data);
      }
    } catch (err) {
      console.error('Error fetching assistants:', err);
    }
  }, [isAdmin]);

  // Initial data fetch
  useEffect(() => {
    fetchCustomers(1, searchTerm, selectedStatus);
    fetchAssistants();
  }, [fetchCustomers, fetchAssistants, searchTerm, selectedStatus]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchCustomers(1, searchTerm, selectedStatus);
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedStatus, fetchCustomers, currentPage]);

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchCustomers(page, searchTerm, selectedStatus);
  };

  // Handle customer assignment
  const handleAssignCustomer = async (customerId, assistantId) => {
    try {
      setAssignmentLoading(true);
      
      const response = await customerService.assignCustomer(customerId, assistantId);
      
      if (response.success) {
        toast.success(
          assistantId 
            ? 'Customer assigned successfully!' 
            : 'Customer unassigned successfully!'
        );
        
        // Refresh customer list
        fetchCustomers(currentPage, searchTerm, selectedStatus);
        setShowAssignModal(false);
        setSelectedCustomer(null);
      } else {
        toast.error(response.message || 'Assignment failed');
      }
    } catch (err) {
      console.error('Error assigning customer:', err);
      toast.error('Failed to assign customer. Please try again.');
    } finally {
      setAssignmentLoading(false);
    }
  };

  // Handle customer deletion
  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      const response = await customerService.deleteCustomer(customerId);
      
      if (response.success) {
        toast.success('Customer deleted successfully!');
        fetchCustomers(currentPage, searchTerm, selectedStatus);
      } else {
        toast.error(response.message || 'Failed to delete customer');
      }
    } catch (err) {
      console.error('Error deleting customer:', err);
      toast.error('Failed to delete customer. Please try again.');
    }
  };

  // Open assignment modal
  const openAssignModal = (customer) => {
    setSelectedCustomer(customer);
    setShowAssignModal(true);
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format phone number
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    return phone.startsWith('+') ? phone : `+${phone}`;
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'All Customers' : 'My Customers'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin 
              ? `Manage all customers and assignments (${totalCustomers} total)`
              : `Manage your assigned customers (${totalCustomers} assigned)`
            }
          </p>
        </div>
        
        <button
          onClick={() => window.location.href = '/customers/new'}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Customer List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedStatus ? 'No customers found' : 'No customers yet'}
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedStatus 
                ? 'Try adjusting your search or filters' 
                : 'Start by adding your first customer'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {customer.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {customer._id.slice(-6)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {customer.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatPhoneNumber(customer.phone)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.assignedTo ? (
                          <div className="flex items-center text-sm text-gray-900">
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            {customer.assignedTo.firstName} {customer.assignedTo.lastName}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Unassigned</span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {/* WhatsApp Message */}
                        <button
                          onClick={() => window.open(`https://wa.me/${customer.phone.replace(/\D/g, '')}`, '_blank')}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Send WhatsApp message"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>

                        {/* Edit Customer */}
                        <button
                          onClick={() => window.location.href = `/customers/${customer._id}/edit`}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Edit customer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Assignment (Admin only) */}
                        {isAdmin && (
                          <button
                            onClick={() => openAssignModal(customer)}
                            className="text-purple-600 hover:text-purple-900 p-1 rounded"
                            title="Assign customer"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete (Admin only) */}
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteCustomer(customer._id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Delete customer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Assign Customer: {selectedCustomer.fullName}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Assignment
                </label>
                <p className="text-sm text-gray-600">
                  {selectedCustomer.assignedTo
                    ? `${selectedCustomer.assignedTo.firstName} ${selectedCustomer.assignedTo.lastName}`
                    : 'Unassigned'
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign To
                </label>
                <select
                  onChange={(e) => {
                    const assistantId = e.target.value || null;
                    handleAssignCustomer(selectedCustomer._id, assistantId);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={assignmentLoading}
                >
                  <option value="">Select an option...</option>
                  <option value="">Unassign</option>
                  {assistants.map((assistant) => (
                    <option key={assistant._id} value={assistant._id}>
                      {assistant.firstName} {assistant.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedCustomer(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={assignmentLoading}
              >
                Cancel
              </button>
            </div>

            {assignmentLoading && (
              <div className="flex items-center justify-center mt-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;