import React, { useState, useEffect } from 'react';
import { Plus, Minus, Save, X } from 'lucide-react';
import InvoiceService from '../../../services/InvoiceService';
import CustomerService from '../../../services/customerService';
import OrderService from '../../../services/OrderService';

const InvoiceForm = ({ invoice, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  
  const [formData, setFormData] = useState({
    customerId: '',
    orderId: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'draft',
    items: [{
      productName: '',
      quantity: 1,
      unitPrice: 0,
      lineTotal: 0
    }],
    notes: '',
    paymentTerms: 'Net 30 days'
  });

  useEffect(() => {
    loadCustomers();
    loadOrders();
    
    if (invoice) {
      populateFormWithInvoice(invoice);
    } else {
      // Set default due date (30 days from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      setFormData(prev => ({
        ...prev,
        dueDate: dueDate.toISOString().split('T')[0]
      }));
    }
  }, [invoice]);

  const loadCustomers = async () => {
    try {
      const customersData = await CustomerService.getCustomers();
      setCustomers(customersData || []);
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  };

  const loadOrders = async () => {
    try {
      // Only load orders without existing invoices
      const ordersData = await OrderService.getAllOrders();
      setOrders(ordersData || []);
    } catch (err) {
      console.error('Error loading orders:', err);
    }
  };

  const populateFormWithInvoice = (invoiceData) => {
    setFormData({
      customerId: invoiceData.customerId?._id || invoiceData.customerId || '',
      orderId: invoiceData.orderId?._id || invoiceData.orderId || '',
      invoiceDate: invoiceData.invoiceDate ? invoiceData.invoiceDate.split('T')[0] : '',
      dueDate: invoiceData.dueDate ? invoiceData.dueDate.split('T')[0] : '',
      status: invoiceData.status || 'draft',
      items: invoiceData.items || [{
        productName: '',
        quantity: 1,
        unitPrice: 0,
        lineTotal: 0
      }],
      notes: invoiceData.notes || '',
      paymentTerms: invoiceData.paymentTerms || 'Net 30 days'
    });
  };

  const handleCustomerChange = (customerId) => {
    setFormData(prev => ({ ...prev, customerId }));
    
    // Clear order selection when customer changes
    setFormData(prev => ({ ...prev, orderId: '' }));
  };

  const handleOrderChange = async (orderId) => {
    if (!orderId) {
      setFormData(prev => ({ ...prev, orderId: '' }));
      return;
    }

    try {
      // Get order details and populate items
      const order = orders.find(o => o._id === orderId);
      if (order && order.items) {
        const orderItems = order.items.map(item => ({
          productName: item.productName || '',
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || (item.lineTotal / item.quantity) || 0,
          lineTotal: item.lineTotal || 0
        }));

        setFormData(prev => ({
          ...prev,
          orderId,
          items: orderItems
        }));
      }
    } catch (err) {
      console.error('Error loading order details:', err);
      setError('Failed to load order details');
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // Recalculate line total when quantity or unit price changes
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : updatedItems[index].quantity;
      const unitPrice = field === 'unitPrice' ? parseFloat(value) || 0 : updatedItems[index].unitPrice;
      updatedItems[index].lineTotal = quantity * unitPrice;
    }

    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        productName: '',
        quantity: 1,
        unitPrice: 0,
        lineTotal: 0
      }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: updatedItems }));
    }
  };

  const calculateTotals = () => {
    return InvoiceService.calculateInvoiceTotals(formData.items);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form
    const validation = InvoiceService.validateInvoiceData(formData);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    try {
      setLoading(true);

      const totals = calculateTotals();
      const invoiceData = {
        ...formData,
        customerName: customers.find(c => c._id === formData.customerId)?.fullName || '',
        customerEmail: customers.find(c => c._id === formData.customerId)?.email || '',
        customerPhone: customers.find(c => c._id === formData.customerId)?.phone || '',
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        totalAmount: totals.totalAmount
      };

      if (invoice) {
        // Update existing invoice
        await InvoiceService.updateInvoice(invoice._id, invoiceData);
      } else if (formData.orderId) {
        // Create invoice from order
        await InvoiceService.createInvoiceFromOrder(formData.orderId, {
          notes: formData.notes,
          paymentTerms: formData.paymentTerms
        });
      } else {
        // Create manual invoice
        await InvoiceService.createInvoice(invoiceData);
      }

      onSubmit();

    } catch (err) {
      console.error('Error saving invoice:', err);
      setError('Failed to save invoice: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();
  const selectedCustomer = customers.find(c => c._id === formData.customerId);
  const customerOrders = orders.filter(o => o.customerId?._id === formData.customerId || o.customerId === formData.customerId);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          {invoice ? 'Edit Invoice' : 'Create New Invoice'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Customer and Order Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer *
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Customer</option>
              {customers.map(customer => (
                <option key={customer._id} value={customer._id}>
                  {customer.fullName || customer.name} - {customer.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Create from Order (Optional)
            </label>
            <select
              value={formData.orderId}
              onChange={(e) => handleOrderChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.customerId}
            >
              <option value="">Create Manual Invoice</option>
              {customerOrders.map(order => (
                <option key={order._id} value={order._id}>
                  Order #{order.orderNumber || order._id?.slice(-8)} - {InvoiceService.formatCurrency(order.orderTotal)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Date *
            </label>
            <input
              type="date"
              value={formData.invoiceDate}
              onChange={(e) => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date *
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {InvoiceService.getInvoiceStatusOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Invoice Items */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Invoice Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product/Service *
                  </label>
                  <input
                    type="text"
                    value={item.productName}
                    onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                    placeholder="Enter product or service name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Price *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900">
                      {InvoiceService.formatCurrency(item.lineTotal)}
                    </div>
                  </div>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="ml-2 p-2 text-red-600 hover:text-red-800"
                      title="Remove Item"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice Totals */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="text-sm font-medium">{InvoiceService.formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tax:</span>
              <span className="text-sm font-medium">{InvoiceService.formatCurrency(totals.taxAmount)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-lg font-semibold">{InvoiceService.formatCurrency(totals.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Terms
            </label>
            <input
              type="text"
              value={formData.paymentTerms}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
              placeholder="e.g., Net 30 days"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes or instructions"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Customer Information Display */}
        {selectedCustomer && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Customer Information</h4>
            <div className="text-sm text-blue-800">
              <div><strong>Name:</strong> {selectedCustomer.fullName || selectedCustomer.name}</div>
              <div><strong>Email:</strong> {selectedCustomer.email}</div>
              {selectedCustomer.phone && (
                <div><strong>Phone:</strong> {selectedCustomer.phone}</div>
              )}
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 flex items-center"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : (invoice ? 'Update Invoice' : 'Create Invoice')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;