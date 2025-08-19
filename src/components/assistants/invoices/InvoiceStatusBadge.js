import React from 'react';
import { CheckCircle, Clock, AlertCircle, XCircle, Send } from 'lucide-react';
import InvoiceService from '../../../services/invoiceService';

const InvoiceStatusBadge = ({ status, isOverdue = false, size = 'normal' }) => {
  // If invoice is overdue, override status display
  const displayStatus = isOverdue && status !== 'paid' && status !== 'cancelled' ? 'overdue' : status;
  
  const getStatusIcon = (status) => {
    const iconSize = size === 'small' ? 'h-3 w-3' : 'h-4 w-4';
    
    switch (status) {
      case 'draft':
        return <Clock className={iconSize} />;
      case 'sent':
        return <Send className={iconSize} />;
      case 'paid':
        return <CheckCircle className={iconSize} />;
      case 'overdue':
        return <AlertCircle className={iconSize} />;
      case 'cancelled':
        return <XCircle className={iconSize} />;
      default:
        return <Clock className={iconSize} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'sent':
        return 'Sent';
      case 'paid':
        return 'Paid';
      case 'overdue':
        return 'Overdue';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const sizeClasses = size === 'small' 
    ? 'px-2 py-1 text-xs' 
    : 'px-3 py-1 text-sm';

  return (
    <span className={`
      inline-flex items-center 
      ${sizeClasses} 
      font-medium 
      rounded-full 
      border
      ${getStatusColor(displayStatus)}
    `}>
      {getStatusIcon(displayStatus)}
      <span className="ml-1">
        {getStatusLabel(displayStatus)}
      </span>
    </span>
  );
};

export default InvoiceStatusBadge;