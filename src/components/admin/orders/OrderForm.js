import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import OrderService from '../../../services/orderService';

const OrderForm = ({ orderId, onSubmit, onCancel, isModal = true }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [formData, setFormData] = useState({
    customerId: '',
    items: [{
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0
    }],
    status: 'pending',
    paymentStatus: 'pending',
    notes: '',
    assignedTo: ''
  });

  useEffect(() => {
    loadFormData();
    if (orderId) {
      loadOrderData();
    }
  }, [orderId]);

  const loadFormData = async () => {
    try {
      // Load customers and products for dropdowns
      // These would come from your actual services
      // const customersData = await CustomerService.getAllCustomers();
      // const productsData = await ProductService.getAllProducts();
      // setCustomers(customersData);
      // setProducts(productsData);
    } catch (err) {
      console.error('Error loading form data:', err);
      setError('Failed to load form data');
    }
  };

  const loadOrderData = async () => {
    try {
      setLoading(true);
      const order = await OrderService.getOrderById(orderId);
      setFormData({
        customerId: order.customerId?._id || order.customerId || '',
        items: order.items || [{
          productId: '',
          productName: '',
          quantity: 1,
          unitPrice: 0
        }],
        status: order.status || 'pending',
        paymentStatus: order.paymentStatus || 'pending',
        notes: order.notes || '',
        assignedTo: order.assignedTo?._id || order.assignedTo || ''
      });
    } catch (err) {
      console.error('Error loading order:', err);
      setError('Failed to load order data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        productId: '',
        productName: '',
        quantity: 1,
        unitPrice: 0
      }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (item.quantity * item.unitPrice);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      const orderData = {
        ...formData,
        orderTotal: calculateTotal()
      };

      if (orderId) {
        await OrderService.updateOrder(orderId, orderData);
      } else {
        await OrderService.createOrder(orderData);
      }

      onSubmit(orderData);
    } catch (err) {
      console.error('Error saving order:', err);
      setError('Failed to save order: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer
          </label>
          <select
            value={formData.customerId}
            onChange={(e) => handleInputChange('customerId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Customer</option>
            {customers.map(customer => (
              <option key={customer._id} value={customer._id}>
                {customer.fullName} - {customer.email}
              </option>
            ))}
          </select>
        </div>

        {/* Order Items */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Order Items
            </label>
            <button
              type="button"
              onClick={addItem}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </button>
          </div>

          {formData.items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product
                  </label>
                  <select
                    value={item.productId}
                    onChange={(e) => {
                      const selectedProduct = products.find(p => p._id === e.target.value);
                      handleItemChange(index, 'productId', e.target.value);
                      if (selectedProduct) {
                        handleItemChange(index, 'productName', selectedProduct.name);
                        handleItemChange(index, 'unitPrice', selectedProduct.price);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={item.productName}
                    onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Price (KSh)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="mt-4 text-right">
                <span className="text-sm font-medium text-gray-700">
                  Subtotal: {new Intl.NumberFormat('en-KE', {
                    style: 'currency',
                    currency: 'KES'
                  }).format(item.quantity * item.unitPrice)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Order Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {OrderService.getOrderStatusOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Status
            </label>
            <select
              value={formData.paymentStatus}
              onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Assigned To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assigned To
          </label>
          <input
            type="text"
            value={formData.assignedTo}
            onChange={(e) => handleInputChange('assignedTo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter assignee name or ID"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any additional notes..."
          />
        </div>

        {/* Order Total */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-900">Order Total:</span>
            <span className="text-xl font-bold text-gray-900">
              {new Intl.NumberFormat('en-KE', {
                style: 'currency',
                currency: 'KES'
              }).format(calculateTotal())}
            </span>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : (orderId ? 'Update Order' : 'Create Order')}
          </button>
        </div>
      </form>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {orderId ? 'Edit Order' : 'Create New Order'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          {formContent}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {orderId ? 'Edit Order' : 'Create New Order'}
        </h2>
      </div>
      {formContent}
    </div>
  );
};

export default OrderForm;