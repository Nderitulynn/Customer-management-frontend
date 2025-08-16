import React, { useState, useEffect } from 'react';
import { FileText, Search, Plus, Eye, Edit2, ArrowLeft, CheckCircle, Clock, AlertCircle, DollarSign } from 'lucide-react';
import invoiceService from '../../services/invoiceService';
import InvoiceForm from '../../components/assistants/invoices/InvoiceForm';
import InvoicePreview from '../../components/assistants/invoices/InvoicePreview';
import InvoiceStatusBadge from '../../components/assistants/invoices/InvoiceStatusBadge';

const AssistantInvoices = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  // Invoice management
  const [invoices, setInvoices] = useState([]);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    sent: 0,
    paid: 0,
    overdue: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0
  });
  
  // UI state
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);

  useEffect(() => {
    loadInvoiceData();
    loadInvoiceStats();
  }, []);

  // Refresh invoices when search or filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!loading) {
        loadInvoiceData();
      }
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [invoiceSearch, statusFilter]);

  const loadInvoiceData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = invoiceService.buildSearchParams({
        search: invoiceSearch,
        status: statusFilter
      });
      
      const response = await invoiceService.getAllInvoices(params);
      setInvoices(response.invoices || []);

    } catch (err) {
      console.error('Error loading invoice data:', err);
      setError('Failed to load invoice data: ' + (err.message || 'Unknown error'));
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const loadInvoiceStats = async () => {
    try {
      const statsData = await invoiceService.getInvoiceStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading invoice stats:', err);
    }
  };

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setShowInvoiceForm(true);
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setShowInvoiceForm(true);
  };

  const handleViewInvoice = (invoice) => {
    setViewingInvoice(invoice);
  };

  const handleDeleteInvoice = async (invoice) => {
    if (!window.confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
      return;
    }

    try {
      setLoading(true);
      await invoiceService.deleteInvoice(invoice._id);
      setMessage(`Invoice ${invoice.invoiceNumber} deleted successfully`);
      setTimeout(() => setMessage(''), 3000);
      await loadInvoiceData();
      await loadInvoiceStats();
    } catch (err) {
      console.error('Error deleting invoice:', err);
      setError('Failed to delete invoice: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (invoice, newStatus) => {
    try {
      setLoading(true);
      await invoiceService.updateInvoiceStatus(invoice._id, newStatus);
      setMessage(`Invoice status updated to ${newStatus}`);
      setTimeout(() => setMessage(''), 3000);
      await loadInvoiceData();
      await loadInvoiceStats();
    } catch (err) {
      console.error('Error updating invoice status:', err);
      setError('Failed to update invoice status: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceSubmit = async () => {
    try {
      setMessage(editingInvoice ? 'Invoice updated successfully' : 'Invoice created successfully');
      setTimeout(() => setMessage(''), 3000);
      setShowInvoiceForm(false);
      setEditingInvoice(null);
      await loadInvoiceData();
      await loadInvoiceStats();
    } catch (err) {
      console.error('Error handling invoice submit:', err);
      setError('Failed to save invoice: ' + (err.message || 'Unknown error'));
    }
  };

  const handleInvoiceFormCancel = () => {
    setShowInvoiceForm(false);
    setEditingInvoice(null);
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (!invoice) return false;
    
    const matchesSearch = !invoiceSearch || 
      invoice.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      invoice.customerEmail.toLowerCase().includes(invoiceSearch.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading && invoices.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => console.log('Navigate to dashboard')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Invoice Management</h1>
              </div>
            </div>
            <button
              onClick={handleCreateInvoice}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {message}
          </div>
        )}

        {/* Show Invoice Form or Main Content */}
        {showInvoiceForm ? (
          <InvoiceForm
            invoice={editingInvoice}
            onSubmit={handleInvoiceSubmit}
            onCancel={handleInvoiceFormCancel}
          />
        ) : (
          <>
            {/* Invoice Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-gray-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Draft</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Sent</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.sent}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Paid</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.paid}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Overdue</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {invoiceService.formatCurrency(stats.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Management Section */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Invoices</h2>
                  <div className="text-sm text-gray-500">
                    Showing {filteredInvoices.length} of {invoices.length} invoices
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search invoices by number, customer name, or email..."
                      value={invoiceSearch}
                      onChange={(e) => setInvoiceSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    {invoiceService.getInvoiceStatusOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Invoices Table */}
                {filteredInvoices.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {invoiceSearch || statusFilter !== 'all' 
                        ? 'No invoices match your search criteria.' 
                        : 'No invoices available.'}
                    </p>
                    <button
                      onClick={handleCreateInvoice}
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm mx-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Invoice
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Invoice
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Invoice Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Due Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredInvoices.map(invoice => (
                          <tr key={invoice._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-blue-600 mr-2" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {invoice.invoiceNumber}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {invoice.items?.length || 0} items
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {invoice.customerName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {invoice.customerEmail}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {invoiceService.formatCurrency(invoice.totalAmount)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <InvoiceStatusBadge 
                                status={invoice.status} 
                                isOverdue={invoiceService.isInvoiceOverdue(invoice)}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {invoiceService.formatDate(invoice.invoiceDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>
                                {invoiceService.formatDate(invoice.dueDate)}
                              </div>
                              {invoiceService.isInvoiceOverdue(invoice) && (
                                <div className="text-red-500 text-xs">
                                  {Math.abs(invoiceService.getDaysUntilDue(invoice.dueDate))} days overdue
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleViewInvoice(invoice)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="View Invoice"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleEditInvoice(invoice)}
                                  className="text-green-600 hover:text-green-800"
                                  title="Edit Invoice"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <select
                                  value={invoice.status}
                                  onChange={(e) => handleStatusChange(invoice, e.target.value)}
                                  className="text-xs border border-gray-300 rounded px-2 py-1"
                                >
                                  {invoiceService.getInvoiceStatusOptions().map(option => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
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
          </>
        )}

        {/* Invoice Preview Modal */}
        {viewingInvoice && (
          <InvoicePreview
            invoice={viewingInvoice}
            onClose={() => setViewingInvoice(null)}
          />
        )}
      </div>
    </div>
  );
};

export default AssistantInvoices;