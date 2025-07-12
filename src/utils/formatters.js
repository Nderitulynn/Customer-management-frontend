/**
 * Data formatting utilities for display purposes
 */

/**
 * Format order status for display
 * @param {string} status - Order status
 * @returns {string} Formatted status
 */
export const formatOrderStatus = (status) => {
  if (!status) return 'Unknown';
  
  const statusMap = {
    'pending': 'Pending',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'returned': 'Returned'
  };
  
  return statusMap[status.toLowerCase()] || status;
};



/**
 * Format date range for display
 * @param {string|Date} start - Start date
 * @param {string|Date} end - End date
 * @returns {string} Formatted date range
 */
export const formatDateRange = (start, end) => {
  if (!start || !end) return '';
  
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  // Check if dates are valid
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return '';
  }
  
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  
  const formattedStart = startDate.toLocaleDateString('en-US', options);
  const formattedEnd = endDate.toLocaleDateString('en-US', options);
  
  return `${formattedStart} - ${formattedEnd}`;
};

/**
 * Format address for display
 * @param {Object} address - Address object
 * @returns {string} Formatted address
 */
export const formatAddress = (address) => {
  if (!address) return '';
  
  const parts = [];
  
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.zipCode) parts.push(address.zipCode);
  if (address.country) parts.push(address.country);
  
  return parts.join(', ');
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length) => {
  if (!text) return '';
  if (typeof text !== 'string') return '';
  if (text.length <= length) return text;
  
  return text.substring(0, length) + '...';
};

// Test code (remove in production)
console.log('Testing formatters...');
console.log(formatOrderStatus('pending')); // Should show "Pending"
console.log(formatOrderStatus('shipped')); // Should show "Shipped"
console.log(formatDateRange('2024-01-01', '2024-01-31')); // Should show date range
console.log(formatAddress({
  street: '123 Main St',
  city: 'Nairobi',
  country: 'Kenya'
})); // Should show formatted address
console.log(truncateText('This is a very long text', 15)); // Should show truncated text