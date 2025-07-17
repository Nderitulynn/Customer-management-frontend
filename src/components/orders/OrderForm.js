import React, { useState, useEffect } from 'react';

const OrderForm = ({ customerId, orderId, onSubmit, onCancel, isModal }) => {
  const [orderData, setOrderData] = useState({
    customerId: customerId || '',
    productName: '',
    quantity: 1,
    price: 0,
    status: 'pending',
    dueDate: '',
    notes: ''
  });
  const [customers, setCustomers] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!customerId) {
      fetchCustomers();
    }
    if (orderId) {
      fetchOrder();
    }
  }, [customerId, orderId]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();
      setOrderData({
        customerId: data.customerId,
        productName: data.productName,
        quantity: data.quantity,
        price: data.price,
        status: data.status,
        dueDate: data.dueDate ? data.dueDate.split('T')[0] : '',
        notes: data.notes || ''
      });
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return orderData.quantity * orderData.price;
  };

  const validateOrder = () => {
    const newErrors = {};

    if (!orderData.customerId) {
      newErrors.customerId = 'Customer is required';
    }
    if (!orderData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }
    if (!orderData.quantity || orderData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    if (!orderData.price || orderData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    if (!orderData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitOrder = async () => {
    if (!validateOrder()) return;

    try {
      setLoading(true);
      const url = orderId ? `/api/orders/${orderId}` : '/api/orders';
      const method = orderId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          totalAmount: calculateTotal()
        }),
      });

      if (response.ok) {
        const result = await response.json();
        onSubmit(result);
      } else {
        const error = await response.json();
        setErrors({ submit: error.message });
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      setErrors({ submit: 'Failed to save order' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setOrderData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const containerClass = isModal ? 'order-form-modal' : 'order-form-page';

  return (
    <div className={containerClass}>
      <div className="order-form-container">
        <h2>{orderId ? 'Edit Order' : 'Create New Order'}</h2>
        
        {loading && <div className="loading">Loading...</div>}
        
        <form onSubmit={(e) => e.preventDefault()}>
          {/* Customer Selection */}
          {!customerId && (
            <div className="form-group">
              <label htmlFor="customerId">Customer *</label>
              <select
                id="customerId"
                value={orderData.customerId}
                onChange={(e) => handleInputChange('customerId', e.target.value)}
                className={errors.customerId ? 'error' : ''}
              >
                <option value="">Select a customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              {errors.customerId && (
                <span className="error-message">{errors.customerId}</span>
              )}
            </div>
          )}

          {/* Product Name */}
          <div className="form-group">
            <label htmlFor="productName">Product Name *</label>
            <input
              type="text"
              id="productName"
              value={orderData.productName}
              onChange={(e) => handleInputChange('productName', e.target.value)}
              className={errors.productName ? 'error' : ''}
              placeholder="Enter product name"
            />
            {errors.productName && (
              <span className="error-message">{errors.productName}</span>
            )}
          </div>

          {/* Quantity */}
          <div className="form-group">
            <label htmlFor="quantity">Quantity *</label>
            <input
              type="number"
              id="quantity"
              value={orderData.quantity}
              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
              className={errors.quantity ? 'error' : ''}
              min="1"
            />
            {errors.quantity && (
              <span className="error-message">{errors.quantity}</span>
            )}
          </div>

          {/* Price */}
          <div className="form-group">
            <label htmlFor="price">Price *</label>
            <input
              type="number"
              id="price"
              value={orderData.price}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
              className={errors.price ? 'error' : ''}
              min="0"
              step="0.01"
            />
            {errors.price && (
              <span className="error-message">{errors.price}</span>
            )}
          </div>

          {/* Total (calculated) */}
          <div className="form-group">
            <label>Total Amount</label>
            <div className="total-amount">
              ${calculateTotal().toFixed(2)}
            </div>
          </div>

          {/* Order Status */}
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={orderData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Due Date */}
          <div className="form-group">
            <label htmlFor="dueDate">Due Date *</label>
            <input
              type="date"
              id="dueDate"
              value={orderData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              className={errors.dueDate ? 'error' : ''}
            />
            {errors.dueDate && (
              <span className="error-message">{errors.dueDate}</span>
            )}
          </div>

          {/* Notes */}
          <div className="form-group">
            <label htmlFor="notes">Notes/Comments</label>
            <textarea
              id="notes"
              value={orderData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any additional notes..."
              rows="3"
            />
          </div>

          {/* Form Errors */}
          {errors.submit && (
            <div className="error-message">{errors.submit}</div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitOrder}
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Saving...' : (orderId ? 'Update Order' : 'Create Order')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;