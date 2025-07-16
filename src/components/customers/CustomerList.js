import React, { useState, useEffect } from 'react';
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

const CustomerList = ({ user }) => {
  // Simplified state management
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [claimingCustomer, setClaimingCustomer] = useState(null);
  const [assigningCustomer, setAssigningCustomer] = useState(null);

  // Role checks
  const isAdmin = user?.role === 'admin';
  const isAssistant = user?.role === 'assistant';

  // Mock customer data
  const mockCustomers = [
    {
      id: 1,
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      status: 'active',
      assignedTo: null,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1234567891',
      status: 'pending',
      assignedTo: { id: 1, name: 'Admin User' },
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      fullName: 'Bob Johnson',
      email: 'bob@example.com',
      phone: '+1234567892',
      status: 'active',
      assignedTo: { id: user?.id, name: user?.name },
      createdAt: new Date().toISOString()
    },
    {
      id: 4,
      fullName: 'Alice Brown',
      email: 'alice@example.com',
      phone: '+1234567893',
      status: 'inactive',
      assignedTo: null,
      createdAt: new Date().toISOString()
    }
  ];

  // Mock assistants data (for admin assignment dropdown)
  const mockAssistants = [
    { id: 1, name: 'Admin User' },
    { id: 2, name: 'Assistant One' },
    { id: 3, name: 'Assistant Two' }
  ];

  // Mock API functions
  const mockApi = {
    getCustomers: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          let filteredCustomers = mockCustomers;
          
          // Filter based on user role
          if (isAssistant) {
            filteredCustomers = mockCustomers.filter(c => 
              !c.assignedTo || c.assignedTo.id === user.id
            );
          }
          
          resolve({ success: true, data: filteredCustomers });
        }, 500);
      });
    },

    assignCustomer: (customerId, assistantId) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const customerIndex = customers.findIndex(c => c.id === customerId);
          if (customerIndex !== -1) {
            const updatedCustomers = [...customers];
            const assistant = mockAssistants.find(a => a.id === assistantId);
            updatedCustomers[customerIndex] = {
              ...updatedCustomers[customerIndex],
              assignedTo: assistant ? { id: assistant.id, name: assistant.name } : null
            };
            setCustomers(updatedCustomers);
          }
          resolve({ success: true });
        }, 800);
      });
    },

    deleteCustomer: (customerId) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          setCustomers(prev => prev.filter(c => c.id !== customerId));
          resolve({ success: true });
        }, 500);
      });
    }
  };

  // Fetch customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await mockApi.getCustomers();
        if (response.success) {
          setCustomers(response.data);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [isAssistant, user.id]);

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => 
    customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  // Handle customer claim (assistants only)
  const handleClaimCustomer = async (customerId) => {
    try {
      setClaimingCustomer(customerId);
      await mockApi.assignCustomer(customerId, user.id);
      alert('Customer claimed successfully!');
    } catch (error) {
      alert('Failed to claim customer');
    } finally {
      setClaimingCustomer(null);
    }
  };

  // Handle customer assignment (admin only)
  const handleAssignCustomer = async (customerId, assistantId) => {
    try {
      setAssigningCustomer(customerId);
      await mockApi.assignCustomer(customerId, assistantId);
      alert(assistantId ? 'Customer assigned successfully!' : 'Customer unassigned successfully!');
    } catch (error) {
      alert('Failed to assign customer');
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
      await mockApi.deleteCustomer(customerId);
      alert('Customer deleted successfully!');
    } catch (error) {
      alert('Failed to delete customer');
    }
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
          {isAssignedToCurrentUser ? 'You' : 'Assigned'}
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
  const getTotalCustomers = () => customers.length;
  const getMyCustomers = () => customers.filter(c => c.assignedTo?.id === user.id).length;
  const getUnassignedCustomers = () => customers.filter(c => !c.assignedTo).length;

  // Loading state
  if (loading) {
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
            {isAdmin ? 'All Customers' : 'Customer Management'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin 
              ? `Manage all customers and assignments (${getTotalCustomers()} total)`
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
              <p className="text-2xl font-bold text-gray-900">{getTotalCustomers()}</p>
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
                {isAdmin ? getTotalCustomers() - getUnassignedCustomers() : getMyCustomers()}
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
        {filteredCustomers.length === 0 ? (
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
                {filteredCustomers.map((customer) => (
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
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getAssignmentBadge(customer)}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={customer.assignedTo?.id || ''}
                          onChange={(e) => handleAssignCustomer(customer.id, e.target.value || null)}
                          disabled={assigningCustomer === customer.id}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Unassigned</option>
                          {mockAssistants.map((assistant) => (
                            <option key={assistant.id} value={assistant.id}>
                              {assistant.name}
                            </option>
                          ))}
                        </select>
                        {assigningCustomer === customer.id && (
                          <Clock className="w-4 h-4 animate-spin text-blue-600 ml-2 inline" />
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
        )}
      </div>
    </div>
  );
};

export default CustomerList;