/**
 * Essential formatting and utility functions
 * No API calls - pure utility functions
 */

/**
 * Format dates for display
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'time', 'datetime')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) return '';
  
  const options = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit', hour12: true },
    datetime: { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    }
  };
  
  return dateObj.toLocaleDateString('en-US', options[format] || options.short);
};

/**
 * Format money values with currency symbol
 * @param {number|string} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD', decimals = 2) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
  
  const numAmount = parseFloat(amount);
  
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    KES: 'KSh',
    NGN: '₦',
    ZAR: 'R'
  };
  
  const symbol = currencySymbols[currency] || '$';
  
  return symbol + numAmount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Format phone numbers for WhatsApp
 * @param {string} phone - Phone number to format
 * @param {string} countryCode - Country code (default: '+254' for Kenya)
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone, countryCode = '+254') => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Handle different input formats
  if (cleaned.startsWith('254')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // Add country code
  const formatted = `${countryCode}${cleaned}`;
  
  // Validate Kenya mobile number format (should be 12 digits total)
  if (countryCode === '+254' && formatted.length !== 13) {
    return phone; // Return original if invalid
  }
  
  return formatted;
};

/**
 * Capitalize first letter of each word
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalizeString = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Generate unique order ID
 * @param {string} prefix - Prefix for order ID (default: 'ORD')
 * @returns {string} Generated order ID
 */
export const generateOrderId = (prefix = 'ORD') => {
  const timestamp = Date.now().toString(36); // Convert to base36 for shorter string
  const random = Math.random().toString(36).substring(2, 8); // 6 random characters
  
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
};

/**
 * Generate user initials from name
 * @param {string} name - Full name
 * @param {number} maxInitials - Maximum number of initials (default: 2)
 * @returns {string} User initials
 */
export const getInitials = (name, maxInitials = 2) => {
  if (!name || typeof name !== 'string') return '';
  
  const words = name.trim().split(' ').filter(word => word.length > 0);
  
  if (words.length === 0) return '';
  
  // Get first letter of each word, up to maxInitials
  const initials = words
    .slice(0, maxInitials)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
  
  return initials;
};



// Testing examples (uncomment to test in browser console)
/*
console.log('=== Testing Helper Functions ===');

// Test formatDate
console.log('formatDate(new Date()):', formatDate(new Date()));
console.log('formatDate(new Date(), "long"):', formatDate(new Date(), 'long'));
console.log('formatDate(new Date(), "time"):', formatDate(new Date(), 'time'));
console.log('formatDate(new Date(), "datetime"):', formatDate(new Date(), 'datetime'));

// Test formatCurrency
console.log('formatCurrency(1234.56):', formatCurrency(1234.56));
console.log('formatCurrency(1234.56, "KES"):', formatCurrency(1234.56, 'KES'));
console.log('formatCurrency(0):', formatCurrency(0));

// Test formatPhoneNumber
console.log('formatPhoneNumber("0712345678"):', formatPhoneNumber('0712345678'));
console.log('formatPhoneNumber("712345678"):', formatPhoneNumber('712345678'));
console.log('formatPhoneNumber("254712345678"):', formatPhoneNumber('254712345678'));

// Test capitalizeString
console.log('capitalizeString("hello world"):', capitalizeString('hello world'));
console.log('capitalizeString("JOHN DOE"):', capitalizeString('JOHN DOE'));

// Test generateOrderId
console.log('generateOrderId():', generateOrderId());
console.log('generateOrderId("INV"):', generateOrderId('INV'));

// Test getInitials
console.log('getInitials("John Doe"):', getInitials('John Doe'));
console.log('getInitials("Jane Mary Smith"):', getInitials('Jane Mary Smith'));
*/