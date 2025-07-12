/**
 * Frontend form validation matching backend rules
 * Returns validation results with errors array
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  if (email.length > 254) {
    return { isValid: false, error: 'Email is too long (maximum 254 characters)' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate phone number (Kenya format)
 * @param {string} phone - Phone number to validate
 * @returns {object} { isValid: boolean, error: string }
 */
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  // Remove all non-digit characters for validation
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's empty after cleaning
  if (cleaned.length === 0) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  // Kenya phone number validation
  // Should be 10 digits (0712345678) or 12 digits (254712345678)
  if (cleaned.length < 9 || cleaned.length > 15) {
    return { isValid: false, error: 'Phone number must be 9-15 digits' };
  }
  
  // Check Kenya format specifically
  const kenyaPattern = /^(254|0)?[17]\d{8}$/;
  if (!kenyaPattern.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid Kenya phone number (e.g., 0712345678)' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateRequired = (value, fieldName) => {
  if (value === null || value === undefined) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  if (typeof value === 'string' && value.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  if (Array.isArray(value) && value.length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate customer form data
 * @param {object} data - Customer form data
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateCustomerForm = (data) => {
  const errors = {};
  
  // Validate required fields
  const requiredFields = ['name', 'email', 'phone'];
  
  requiredFields.forEach(field => {
    const validation = validateRequired(data[field], field);
    if (!validation.isValid) {
      errors[field] = validation.error;
    }
  });
  
  // If required fields are missing, return early
  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }
  
  // Validate name
  if (data.name && data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  }
  
  if (data.name && data.name.trim().length > 100) {
    errors.name = 'Name is too long (maximum 100 characters)';
  }
  
  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }
  
  // Validate phone
  const phoneValidation = validatePhone(data.phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.error;
  }
  
  // Validate optional address
  if (data.address && data.address.trim().length > 200) {
    errors.address = 'Address is too long (maximum 200 characters)';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate order form data
 * @param {object} data - Order form data
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateOrderForm = (data) => {
  const errors = {};
  
  // Validate required fields
  const requiredFields = ['customerId', 'items', 'totalAmount'];
  
  requiredFields.forEach(field => {
    const validation = validateRequired(data[field], field);
    if (!validation.isValid) {
      errors[field] = validation.error;
    }
  });
  
  // If required fields are missing, return early
  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }
  
  // Validate customer ID
  if (data.customerId && !Number.isInteger(Number(data.customerId))) {
    errors.customerId = 'Customer ID must be a valid number';
  }
  
  // Validate items array
  if (!Array.isArray(data.items)) {
    errors.items = 'Items must be an array';
  } else if (data.items.length === 0) {
    errors.items = 'Order must have at least one item';
  } else {
    // Validate each item
    data.items.forEach((item, index) => {
      if (!item.name || typeof item.name !== 'string' || item.name.trim().length === 0) {
        errors[`items[${index}].name`] = `Item ${index + 1} name is required`;
      }
      
      if (!item.quantity || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0) {
        errors[`items[${index}].quantity`] = `Item ${index + 1} quantity must be a positive number`;
      }
      
      if (!item.price || isNaN(Number(item.price)) || Number(item.price) <= 0) {
        errors[`items[${index}].price`] = `Item ${index + 1} price must be a positive number`;
      }
    });
  }
  
  // Validate total amount
  if (data.totalAmount && (isNaN(Number(data.totalAmount)) || Number(data.totalAmount) <= 0)) {
    errors.totalAmount = 'Total amount must be a positive number';
  }
  
  // Validate order status if provided
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.status = `Status must be one of: ${validStatuses.join(', ')}`;
  }
  
  // Validate delivery date if provided
  if (data.deliveryDate) {
    const deliveryDate = new Date(data.deliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(deliveryDate.getTime())) {
      errors.deliveryDate = 'Delivery date must be a valid date';
    } else if (deliveryDate < today) {
      errors.deliveryDate = 'Delivery date cannot be in the past';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate product form data
 * @param {object} data - Product form data
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateProductForm = (data) => {
  const errors = {};
  
  // Validate required fields
  const requiredFields = ['name', 'price'];
  
  requiredFields.forEach(field => {
    const validation = validateRequired(data[field], field);
    if (!validation.isValid) {
      errors[field] = validation.error;
    }
  });
  
  // If required fields are missing, return early
  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }
  
  // Validate name
  if (data.name && data.name.trim().length < 2) {
    errors.name = 'Product name must be at least 2 characters long';
  }
  
  if (data.name && data.name.trim().length > 100) {
    errors.name = 'Product name is too long (maximum 100 characters)';
  }
  
  // Validate price
  if (data.price && (isNaN(Number(data.price)) || Number(data.price) <= 0)) {
    errors.price = 'Price must be a positive number';
  }
  
  // Validate description if provided
  if (data.description && data.description.trim().length > 500) {
    errors.description = 'Description is too long (maximum 500 characters)';
  }
  
  // Validate category if provided
  if (data.category && data.category.trim().length > 50) {
    errors.category = 'Category is too long (maximum 50 characters)';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} { isValid: boolean, error: string, strength: string }
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required', strength: 'none' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long', strength: 'weak' };
  }
  
  if (password.length > 128) {
    return { isValid: false, error: 'Password is too long (maximum 128 characters)', strength: 'weak' };
  }
  
  // Check password strength
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strengthScore = [hasUppercase, hasLowercase, hasNumbers, hasSpecialChar].filter(Boolean).length;
  
  let strength = 'weak';
  if (strengthScore >= 4) strength = 'strong';
  else if (strengthScore >= 3) strength = 'medium';
  
  if (strengthScore < 3) {
    return { 
      isValid: false, 
      error: 'Password must contain at least 3 of: uppercase, lowercase, numbers, special characters',
      strength 
    };
  }
  
  return { isValid: true, error: null, strength };
};

// Testing examples (uncomment to test)
/*
console.log('=== Testing Validator Functions ===');

// Test validateEmail
console.log('validateEmail("test@example.com"):', validateEmail('test@example.com'));
console.log('validateEmail("invalid-email"):', validateEmail('invalid-email'));

// Test validatePhone
console.log('validatePhone("0712345678"):', validatePhone('0712345678'));
console.log('validatePhone("123"):', validatePhone('123'));

// Test validateCustomerForm
const customerData = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '0712345678',
  address: '123 Main St'
};
console.log('validateCustomerForm(customerData):', validateCustomerForm(customerData));

// Test validateOrderForm
const orderData = {
  customerId: 1,
  items: [
    { name: 'Product 1', quantity: 2, price: 10.99 },
    { name: 'Product 2', quantity: 1, price: 15.50 }
  ],
  totalAmount: 37.48,
  status: 'pending'
};
console.log('validateOrderForm(orderData):', validateOrderForm(orderData));
*/