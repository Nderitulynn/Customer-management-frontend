import React, { useState, useEffect } from 'react';
import { Plus, X, Search } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import customerOrderService from '../../../services/customerOrderService'; // Updated import

const OrderForm = ({ orderId, onSubmit, onCancel, isModal }) => {
  const { user } = useAuth(); // Get current user from auth context
  const [orderData, setOrderData] = useState({
    customerId: user?._id || user?.id || '',
    productName: '',
    quantity: 1,
    unitPrice: 0,
    status: 'pending',
    notes: ''
  });
  
  const [isCustomProduct, setIsCustomProduct] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(null);
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
    // Load customer information (current user)
    if (user) {
      loadCustomerInfo();
    }
    
    if (orderId) {
      fetchOrder();
    }
  }, [user, orderId]);

  const loadCustomerInfo = () => {
    try {
      // Since this is customer-focused, use the authenticated user directly
      if (!user) {
        console.log('❌ No user found in auth context');
        setErrors({ submit: 'User authentication required. Please log in.' });
        return;
      }
      
      console.log('✅ Loading customer info from authenticated user:', user);
      
      const customer = {
        _id: user._id || user.id,
        fullName: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
        email: user.email || '',
        phone: user.phone || ''
      };
      
      console.log('✅ Customer info prepared:', customer);
      
      setCustomerInfo(customer);
      setOrderData(prev => ({
        ...prev,
        customerId: customer._id
      }));
    } catch (error) {
      console.error('❌ Error loading customer info:', error);
      setErrors({ submit: 'Failed to load user information' });
    }
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      
      // Use CustomerOrderService to get order details
      const data = await customerOrderService.getMyOrderDetails(orderId);
      
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
    } catch (error) {
      console.error('Error fetching order:', error);
      setErrors({ submit: 'Failed to load order data. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return orderData.quantity * orderData.unitPrice;
  };

  const validateOrder = () => {
    const newErrors = {};

    // Customer validation (should always be set for customer orders)
    if (!orderData.customerId) {
      newErrors.customerId = 'Customer information is required';
    }

    // Product validation
    if (!orderData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }

    // Quantity validation
    if (!orderData.quantity || orderData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    // Price validation - allow 0 for custom products (quote required)
    if (orderData.unitPrice < 0) {
      newErrors.unitPrice = 'Unit price cannot be negative';
    }

    // For non-custom products, price must be greater than 0
    if (!isCustomProduct && (!orderData.unitPrice || orderData.unitPrice <= 0)) {
      newErrors.unitPrice = 'Unit price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitOrder = async () => {
    if (!validateOrder()) return;

    // Check if user is authenticated
    if (!user || !getCurrentUserId()) {
      setErrors({ submit: 'User authentication required. Please log in again.' });
      return;
    }

    try {
      setLoading(true);

      const orderTotal = calculateTotal();
      
      // Prepare order payload for CustomerOrderService
      const orderPayload = {
        items: [
          {
            productName: orderData.productName.trim(),
            quantity: orderData.quantity,
            unitPrice: orderData.unitPrice
          }
        ],
        orderTotal: orderTotal,
        notes: orderData.notes?.trim() || ''
      };

      console.log('📤 OrderForm submitting customer order:', JSON.stringify(orderPayload, null, 2));

      let result;
      if (orderId) {
        // For updates - CustomerOrderService doesn't have update method yet
        // This would need to be implemented in the backend
        console.warn('⚠️ Order updates not yet supported in CustomerOrderService');
        setErrors({ submit: 'Order updates are not currently supported. Please create a new order.' });
        return;
      } else {
        // Create new customer order
        result = await customerOrderService.createMyOrder(orderPayload);
      }

      console.log('✅ Customer order created successfully:', result);
      onSubmit(result);
    } catch (error) {
      console.error('❌ Error submitting customer order:', error);
      
      // Handle specific error messages from CustomerOrderService
      let errorMessage = 'Failed to save order. Please try again.';
      
      if (error.message.includes('Too many requests')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.message.includes('authentication') || error.message.includes('unauthorized')) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ submit: errorMessage });
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

  // Status options for customer orders (limited options)
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {orderId ? 'View Order' : 'Create New Order'}
            </h2>
            <p className="text-gray-600 mt-1">
              {orderId ? 'Order details and information' : 'Add a new order to your account'}
            </p>
            {orderId && (
              <p className="text-sm text-amber-600 mt-2 bg-amber-50 px-3 py-1 rounded-md inline-block">
                ⚠️ Order editing is currently not supported. Please create a new order if changes are needed.
              </p>
            )}
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
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Loading...</span>
            </div>
          </div>
        )}
        
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {/* Customer Information Display */}
          {customerInfo && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Order Information</h3>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-semibold text-sm">
                        {customerInfo.fullName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{customerInfo.fullName}</h4>
                      <p className="text-sm text-gray-600">{customerInfo.email}</p>
                      {customerInfo.phone && (
                        <p className="text-sm text-gray-600">{customerInfo.phone}</p>
                      )}
                    </div>
                  </div>
                  {orderId && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Search className="h-4 w-4 mr-1" />
                      <span>Order: #{orderId}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

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
                    disabled={loading || orderId} // Disable editing if viewing existing order
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
                    
                    {!orderId && <option value="custom">🔧 Custom Product</option>}
                  </select>
                  
                  {!orderId && (
                    <button
                      type="button"
                      onClick={() => handleProductSelection('custom')}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Request Custom Product
                    </button>
                  )}
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
                    placeholder="Describe your custom product request..."
                    disabled={loading || orderId}
                  />
                  
                  {!orderId && (
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
                  )}
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
                  disabled={loading || orderId}
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
                  } ${(!isCustomProduct || orderId) ? 'bg-gray-50' : ''}`}
                  min="0"
                  step="0.01"
                  disabled={loading || !isCustomProduct || orderId}
                  readOnly={!isCustomProduct || orderId}
                />
                {!isCustomProduct && (
                  <p className="text-xs text-gray-500 mt-1">
                    Price auto-filled from product selection
                  </p>
                )}
                {isCustomProduct && !orderId && (
                  <p className="text-xs text-gray-500 mt-1">
                    For custom products, please provide an estimated price or leave as 0 for quote
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
                  {isCustomProduct && orderData.unitPrice === 0 && (
                    <span className="text-sm font-normal text-gray-600 ml-2">(Quote Required)</span>
                  )}
                </span>
              </div>
            </div>

            {/* Order Status - Hidden for customer orders, always pending */}
            <input type="hidden" value="pending" />

            {/* Notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions/Notes
              </label>
              <textarea
                value={orderData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any special instructions, size requirements, color preferences, or other details..."
                rows="4"
                disabled={loading || orderId}
                maxLength="500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {orderData.notes.length}/500 characters
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
              {orderId ? 'Close' : 'Cancel'}
            </button>
            
            {!orderId && (
              <button
                type="button"
                onClick={submitOrder}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </span>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Order
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;