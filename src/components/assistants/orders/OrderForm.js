import React, { useState, useEffect } from 'react';
import { Plus, X, Search } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import CustomerService from '../../../services/CustomerService';
import OrderService from '../../../services/orderService';

const OrderForm = ({ customerId, orderId, onSubmit, onCancel, isModal }) => {
  const { user } = useAuth(); // Get current user from auth context
  const [orderData, setOrderData] = useState({
    customerId: customerId || '',
    productName: '',
    quantity: 1,
    unitPrice: 0,
    status: 'pending',
    notes: ''
  });
  
  const [isCustomProduct, setIsCustomProduct] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Macrame products with pricing
  const macrameProducts = [
    // Wall Decor
    { category: 'Wall Decor', name: 'Small Wall Hanging with Tassels', price: 2500 },
    { category: 'Wall Decor', name: 'Medium Wall Hanging with Tassels', price: 3500 },
    { category: 'Wall Decor', name: 'Large Wall Hanging with Tassels', price: 5000 },
    { category: 'Wall Decor', name: 'Macrame Mirror with Tassel Fringe', price: 4500 },
    
    // Fashion Accessories
    { category: 'Fashion Accessories', name: 'Tassel Earrings - Small', price: 800 },
    { category: 'Fashion Accessories', name: 'Tassel Earrings - Large', price: 1200 },
    { category: 'Fashion Accessories', name: 'Macrame Handbag with Tassels', price: 3500 },
    { category: 'Fashion Accessories', name: 'Boho Belt with Tassel Ends', price: 1800 },
    { category: 'Fashion Accessories', name: 'Tassel Keychain', price: 500 },
    
    // Plant Accessories
    { category: 'Plant Accessories', name: 'Small Plant Hanger with Tassels', price: 1500 },
    { category: 'Plant Accessories', name: 'Medium Plant Hanger with Tassels', price: 2200 },
    { category: 'Plant Accessories', name: 'Large Plant Hanger with Tassels', price: 3000 },
    
    // Home Decor
    { category: 'Home Decor', name: 'Tassel Curtain Tiebacks (Pair)', price: 1800 },
    { category: 'Home Decor', name: 'Table Runner with Tassel Trim', price: 2800 },
    { category: 'Home Decor', name: 'Macrame Coasters with Tassels (Set of 4)', price: 1200 },
    
    // Event/Wedding Decor
    { category: 'Event/Wedding Decor', name: 'Wedding Backdrop Panel with Tassels', price: 8000 },
    { category: 'Event/Wedding Decor', name: 'Tassel Garland (3 meters)', price: 2500 },
    
    // Gift Items
    { category: 'Gift Items', name: 'Bookmark with Tassel', price: 300 },
    { category: 'Gift Items', name: 'Christmas Ornament with Tassels', price: 600 }
  ];

  // Get current user ID from auth context
  const getCurrentUserId = () => {
    return user?._id || user?.id;
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomerData();
    }
    if (orderId) {
      fetchOrder();
    }
  }, [customerId, orderId]);

  const fetchCustomerData = async () => {
    try {
      const customer = await CustomerService.getCustomerById(customerId);
      setSelectedCustomer(customer);
      setOrderData(prev => ({
        ...prev,
        customerId: customer._id
      }));
    } catch (error) {
      console.error('Error fetching customer:', error);
      setErrors({ customer: 'Failed to load customer data' });
    }
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await OrderService.getOrderById(orderId);
      
      setOrderData({
        customerId: data.customerId?._id || data.customerId || '',
        productName: data.items?.[0]?.productName || '',
        quantity: data.items?.[0]?.quantity || 1,
        unitPrice: data.items?.[0]?.unitPrice || 0,
        status: data.status || 'pending',
        notes: data.notes || ''
      });

      // Check if it's a custom product (not in our predefined list)
      const isCustom = !macrameProducts.some(product => product.name === (data.items?.[0]?.productName || ''));
      setIsCustomProduct(isCustom);

      // If customer data is populated, set it
      if (data.customerId && typeof data.customerId === 'object') {
        setSelectedCustomer(data.customerId);
      } else if (data.customerId) {
        // Fetch customer data if only ID is provided
        try {
          const customer = await CustomerService.getCustomerById(data.customerId);
          setSelectedCustomer(customer);
        } catch (error) {
          console.error('Error fetching customer for order:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setErrors({ submit: 'Failed to load order data' });
    } finally {
      setLoading(false);
    }
  };

  const searchCustomers = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setCustomerResults([]);
      setShowCustomerDropdown(false);
      return;
    }

    try {
      const customers = await CustomerService.searchCustomers(searchTerm);
      setCustomerResults(customers || []);
      setShowCustomerDropdown(true);
    } catch (error) {
      console.error('Error searching customers:', error);
      setCustomerResults([]);
    }
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setOrderData(prev => ({
      ...prev,
      customerId: customer._id
    }));
    setCustomerSearch('');
    setShowCustomerDropdown(false);
    setCustomerResults([]);
    
    // Clear customer-related errors
    if (errors.customerId) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.customerId;
        return newErrors;
      });
    }
  };

  const calculateTotal = () => {
    return orderData.quantity * orderData.unitPrice;
  };

  const validateOrder = () => {
    const newErrors = {};

    // Customer validation
    if (!orderData.customerId) {
      newErrors.customerId = 'Please select a customer';
    }

    // Product validation
    if (!orderData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }

    // Quantity validation
    if (!orderData.quantity || orderData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    // Price validation
    if (!orderData.unitPrice || orderData.unitPrice <= 0) {
      newErrors.unitPrice = 'Unit price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitOrder = async () => {
    if (!validateOrder()) return;

    // Check if user is authenticated
    if (!user || !getCurrentUserId()) {
      setErrors({ submit: 'User authentication required' });
      return;
    }

    try {
      setLoading(true);

      const orderTotal = calculateTotal();
      
      // Prepare order payload matching the Order model expectations
      const orderPayload = {
        customerId: orderData.customerId,
        items: [
          {
            productName: orderData.productName,
            quantity: orderData.quantity,
            unitPrice: orderData.unitPrice,
            totalPrice: orderTotal
          }
        ],
        orderTotal: orderTotal,
        status: orderData.status,
        notes: orderData.notes,
        assignedTo: getCurrentUserId(), // Required by model
        createdBy: getCurrentUserId()   // Required by model
      };

      console.log('📤 OrderForm submitting payload:', JSON.stringify(orderPayload, null, 2));

      let result;
      if (orderId) {
        // For updates, we don't need to send createdBy again
        const updatePayload = { ...orderPayload };
        delete updatePayload.createdBy;
        updatePayload.lastUpdatedBy = getCurrentUserId();
        
        result = await OrderService.updateOrder(orderId, updatePayload);
      } else {
        result = await OrderService.createOrder(orderPayload);
      }

      onSubmit(result);
    } catch (error) {
      console.error('Error submitting order:', error);
      setErrors({ submit: error.message || 'Failed to save order' });
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelection = (selectedValue) => {
    if (selectedValue === 'custom') {
      setIsCustomProduct(true);
      setOrderData(prev => ({
        ...prev,
        productName: '',
        unitPrice: 0
      }));
    } else {
      const selectedProduct = macrameProducts.find(product => product.name === selectedValue);
      if (selectedProduct) {
        setIsCustomProduct(false);
        setOrderData(prev => ({
          ...prev,
          productName: selectedProduct.name,
          unitPrice: selectedProduct.price
        }));
      }
    }
    
    // Clear product-related errors
    if (errors.productName) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.productName;
        return newErrors;
      });
    }
  };

  const handleInputChange = (field, value) => {
    setOrderData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Status options matching the Order model
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {orderId ? 'Edit Order' : 'Create New Order'}
            </h2>
            <p className="text-gray-600 mt-1">
              {orderId ? 'Update order details' : 'Add a new order to the system'}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Close form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading...</div>
          </div>
        )}
        
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {/* Customer Selection Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer</h3>
            
            {selectedCustomer ? (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedCustomer.fullName}</h4>
                    <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
                    {selectedCustomer.phone && (
                      <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                    )}
                  </div>
                  {!customerId && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(null);
                        setOrderData(prev => ({ ...prev, customerId: '' }));
                      }}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Change Customer
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      searchCustomers(e.target.value);
                    }}
                    onFocus={() => {
                      if (customerResults.length > 0) {
                        setShowCustomerDropdown(true);
                      }
                    }}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.customerId ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Search for a customer..."
                    disabled={loading || customerId}
                  />
                </div>
                
                {showCustomerDropdown && customerResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {customerResults.map((customer) => (
                      <button
                        key={customer._id}
                        type="button"
                        onClick={() => selectCustomer(customer)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{customer.fullName}</div>
                        <div className="text-sm text-gray-600">{customer.email}</div>
                      </button>
                    ))}
                  </div>
                )}
                
                {errors.customerId && (
                  <p className="text-red-600 text-xs mt-1">{errors.customerId}</p>
                )}
              </div>
            )}
          </div>

          {/* Order Details Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Details</h3>
            
            {/* Product Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product *
              </label>
              
              {!isCustomProduct ? (
                <div className="space-y-3">
                  <select
                    value={orderData.productName}
                    onChange={(e) => handleProductSelection(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.productName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  >
                    <option value="">Select a product...</option>
                    
                    {/* Group products by category */}
                    {['Wall Decor', 'Fashion Accessories', 'Plant Accessories', 'Home Decor', 'Event/Wedding Decor', 'Gift Items'].map(category => (
                      <optgroup key={category} label={category}>
                        {macrameProducts
                          .filter(product => product.category === category)
                          .map(product => (
                            <option key={product.name} value={product.name}>
                              {product.name} - KSh {product.price.toLocaleString()}
                            </option>
                          ))
                        }
                      </optgroup>
                    ))}
                    
                    <option value="custom">🔧 Custom Product</option>
                  </select>
                  
                  <button
                    type="button"
                    onClick={() => handleProductSelection('custom')}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add Custom Product
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={orderData.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.productName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter custom product name"
                    disabled={loading}
                  />
                  
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomProduct(false);
                      setOrderData(prev => ({ ...prev, productName: '', unitPrice: 0 }));
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    ← Back to Product List
                  </button>
                </div>
              )}
              
              {errors.productName && (
                <p className="text-red-600 text-xs mt-1">{errors.productName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  value={orderData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.quantity ? 'border-red-300' : 'border-gray-300'
                  }`}
                  min="1"
                  disabled={loading}
                />
                {errors.quantity && (
                  <p className="text-red-600 text-xs mt-1">{errors.quantity}</p>
                )}
              </div>

              {/* Unit Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Price (KSh) *
                </label>
                <input
                  type="number"
                  value={orderData.unitPrice}
                  onChange={(e) => handleInputChange('unitPrice', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.unitPrice ? 'border-red-300' : 'border-gray-300'
                  } ${!isCustomProduct ? 'bg-gray-50' : ''}`}
                  min="0"
                  step="0.01"
                  disabled={loading || !isCustomProduct}
                  readOnly={!isCustomProduct}
                />
                {!isCustomProduct && (
                  <p className="text-xs text-gray-500 mt-1">
                    Price auto-filled from product selection
                  </p>
                )}
                {errors.unitPrice && (
                  <p className="text-red-600 text-xs mt-1">{errors.unitPrice}</p>
                )}
              </div>
            </div>

            {/* Total Amount */}
            <div className="bg-blue-50 p-4 rounded-lg mt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total Amount</span>
                <span className="text-lg font-semibold text-blue-900">
                  KSh {calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Order Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={orderData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Created Date - Read Only Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Created Date
                </label>
                <input
                  type="text"
                  value={orderId ? "Auto-generated on save" : "Will be set automatically"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 text-gray-600"
                  disabled
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  The creation date is automatically set by the system
                </p>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes/Comments
              </label>
              <textarea
                value={orderData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any additional notes..."
                rows="3"
                disabled={loading}
                maxLength="1000"
              />
              <p className="text-xs text-gray-500 mt-1">
                {orderData.notes.length}/1000 characters
              </p>
            </div>
          </div>

          {/* Form Errors */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitOrder}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                'Saving...'
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {orderId ? 'Update Order' : 'Create Order'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;