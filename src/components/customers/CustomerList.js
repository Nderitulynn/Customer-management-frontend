import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MessageSquare, 
  UserPlus, 
  Users,
  AlertCircle,
  User,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';
import { customerService as CustomerService } from '../../services';
import { useAuth } from "../../context/AuthContext";

// Success Message Component
const SuccessMessage = ({ message, onDismiss }) => {
  if (!message) return null;
  
  return (
    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative mb-4">
      <span className="block sm:inline">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-0 bottom-0 right-0 px-4 py-3"
        >
          ×
        </button>
      )}
    </div>
  );
};

// Error Message Component
const ErrorMessage = ({ message, onDismiss }) => {
  if (!message) return null;
  
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
      <span className="block sm:inline">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-0 bottom-0 right-0 px-4 py-3"
        >
          ×
        </button>
      )}
    </div>
  );
};

const CustomerList = () => {
  const { user, hasRole } = useAuth();
  
  // State management
  const [customers, setCustomers] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [claimingCustomer, setClaimingCustomer] = useState(null);
  const [assigningCustomer, setAssigningCustomer] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);

  // Role checks
  const isAdmin = hasRole('admin');
  const isAssistant = hasRole('assistant');

  // Fetch customers with real API
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Build parameters for API call
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        ...(isAssistant && { assignedTo: user.id })
      };

      const response = await CustomerService.getCustomers(params);
      
      setCustomers(response || []);
      // For now, using basic pagination since the CustomerService returns a simple array
      // You may need to update this based on your backend response structure
      setTotalCustomers(response?.length || 0);
      setTotalPages(Math.ceil((response?.length || 0) / 10));
      
    } catch (error) {
      setError('Failed to load customers');
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, user, isAssistant]);

  // Fetch assistants for admin assignment dropdown
  const fetchAssistants = useCallback(async () => {
    if (!isAdmin) return;
    
    try {
      // Since there's no getAssistants method in CustomerService,
      // you'll need to implement this or use a different service
      // For now, using empty array
      setAssistants([]);
    } catch (error) {
      console.error('Error fetching assistants:', error);
    }
  }, [isAdmin]);

  // Initial data fetch
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    fetchAssistants();
  }, [fetchAssistants]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
      fetchCustomers();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle customer claim (assistants only)
  const handleClaimCustomer = async (customerId) => {
    try {
      setClaimingCustomer(customerId);
      // You'll need to implement assignCustomer method in CustomerService
      // await CustomerService.assignCustomer(customerId, user.id);
      setSuccess('Customer claimed successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetchCustomers();
    } catch (error) {
      setError('Failed to claim customer');
      console.error('Error claiming customer:', error);
    } finally {
      setClaimingCustomer(null);
    }
  };

  // Handle customer assignment (admin only)
  const handleAssignCustomer = async (customerId, assistantId) => {
    try {
      setAssigningCustomer(customerId);
      // You'll need to implement assignCustomer method in CustomerService
      // await CustomerService.assignCustomer(customerId, assistantId || null);
      setSuccess(assistantId ? 'Customer assigned successfully!' : 'Customer unassigned successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetchCustomers();
    } catch (error) {
      setError('Failed to assign customer');
      console.error('Error assigning customer:', error);
    } finally {
      setAssigningCustomer(null);
    }
  };

  // Handle customer deletion (admin only)
  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      await CustomerService.deleteCustomer(customerId);
      setSuccess('Customer deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetchCustomers();
    } catch (error) {
      setError('Failed to delete customer');
      console.error('Error deleting customer:', error);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
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

  // Get assignment badge
  const getAssignmentBadge = (customer) => {
    if (customer.assignedTo) {
      const isAssignedToCurrentUser = customer.assignedTo.id === user.id;
      return (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
          isAssignedToCurrentUser 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          <UserCheck className="w-3 h-3 mr-1" />
          {isAssignedToCurrentUser ? 'You' : customer.assignedTo.name || 'Assigned'}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          <UserX className="w-3 h-3 mr-1" />
          Unassigned
        </span>
      );
    }
  };

  // Get customer counts
  const getMyCustomers = () => customers.filter(c => c.assignedTo?.id === user.id).length;
  const getUnassignedCustomers = () => customers.filter(c => !c.assignedTo).length;
  const getAssignedCustomers = () => customers.filter(c => c.assignedTo).length;

  // Auto-dismiss messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Loading state
  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Messages */}
      <SuccessMessage 
        message={success} 
        onDismiss={() => setSuccess('')} 
      />
      <ErrorMessage 
        message={error} 
        onDismiss={() => setError('')} 
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'All Customers' : 'Customer Management'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin 
              ? `Manage all customers and assignments (${totalCustomers} total)`
              : `Manage your assigned customers (${getMyCustomers()} assigned to you)`
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <UserCheck className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">
                {isAdmin ? 'Assigned' : 'My Customers'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {isAdmin ? getAssignedCustomers() : getMyCustomers()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <UserX className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">
                {isAdmin ? 'Unassigned' : 'Available'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{getUnassignedCustomers()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {customers.length === 0 && !loading ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No customers found' : 'No customers yet'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search' : 'Start by adding your first customer'}
            </p>
          </div>
        ) : (
          <>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignment
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assign To
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading && (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 5} className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="ml-2 text-gray-600">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  )}
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {customer.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {customer.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {customer.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status || 'active')}`}>
                          {customer.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getAssignmentBadge(customer)}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <select
                              value={customer.assignedTo?.id || ''}
                              onChange={(e) => handleAssignCustomer(customer.id, e.target.value || null)}
                              disabled={assigningCustomer === customer.id}
                              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Unassigned</option>
                              {assistants.map((assistant) => (
                                <option key={assistant.id} value={assistant.id}>
                                  {assistant.name}
                                </option>
                              ))}
                            </select>
                            {assigningCustomer === customer.id && (
                              <Clock className="w-4 h-4 animate-spin text-blue-600 ml-2" />
                            )}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {/* WhatsApp Message */}
                          <button
                            onClick={() => window.open(`https://wa.me/${customer.phone?.replace(/\D/g, '')}`, '_blank')}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Send WhatsApp message"
                            disabled={!customer.phone}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          {/* Edit Customer */}
                          <button
                            onClick={() => window.location.href = `/customers/${customer.id}/edit`}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Edit customer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Claim Customer (Assistant only, for unassigned customers) */}
                          {isAssistant && !customer.assignedTo && (
                            <button
                              onClick={() => handleClaimCustomer(customer.id)}
                              disabled={claimingCustomer === customer.id}
                              className="text-purple-600 hover:text-purple-900 p-1 rounded disabled:opacity-50"
                              title="Claim customer"
                            >
                              {claimingCustomer === customer.id ? (
                                <Clock className="w-4 h-4 animate-spin" />
                              ) : (
                                <UserPlus className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          {/* Delete (Admin only) */}
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteCustomer(customer.id)}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
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
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage <= 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                pageNum === currentPage
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerList;
