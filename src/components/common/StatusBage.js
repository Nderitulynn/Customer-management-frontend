import React from 'react';

const StatusBadge = ({ status, type = 'order' }) => {
  const getStatusColor = (status, type) => {
    const colorMap = {
      order: {
        pending: 'status-pending',
        completed: 'status-completed',
        cancelled: 'status-cancelled',
        processing: 'status-processing',
        shipped: 'status-shipped',
        delivered: 'status-delivered'
      },
      customer: {
        active: 'status-active',
        inactive: 'status-inactive'
      }
    };

    return colorMap[type]?.[status] || 'status-default';
  };

  const getStatusIcon = (status, type) => {
    const iconMap = {
      order: {
        pending: '⏳',
        completed: '✅',
        cancelled: '❌',
        processing: '⚙️',
        shipped: '🚚',
        delivered: '📦'
      },
      customer: {
        active: '🟢',
        inactive: '⚫'
      }
    };

    return iconMap[type]?.[status] || '📋';
  };

  const getStatusText = (status) => {
    if (!status) return 'Unknown';
    
    // Convert status to readable format
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!status) return null;

  const colorClass = getStatusColor(status, type);
  const icon = getStatusIcon(status, type);
  const text = getStatusText(status);

  return (
    <span 
      className={`status-badge ${colorClass} ${type}-badge`}
      title={`${type} status: ${text}`}
    >
      <span className="status-icon">{icon}</span>
      <span className="status-text">{text}</span>
    </span>
  );
};

export default StatusBadge;