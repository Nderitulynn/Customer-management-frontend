import React from 'react';

const AssistantCard = ({ 
  assistant, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onResetPassword,
  onViewDetails 
}) => {
  const {
    id,
    firstName,
    lastName,
    email,
    isActive,
    customers = [],
    createdAt,
    mustChangePassword
  } = assistant;

  const fullName = `${firstName} ${lastName}`;
  const customerCount = customers.length;
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          {/* Assistant Info */}
          <div className="flex items-start space-x-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-700 font-medium text-sm">
                  {getInitials(firstName, lastName)}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {fullName}
                </h3>
                
                {/* Status Badge */}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <p className="text-sm text-gray-500 truncate mt-1">
                {email}
              </p>

              {mustChangePassword && (
                <div className="flex items-center mt-2">
                  <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-yellow-600">Must change password</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(assistant)}
                className="text-gray-400 hover:text-blue-600 transition-colors"
                title="View Details"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            )}
            
            {onEdit && (
              <button
                onClick={() => onEdit(assistant)}
                className="text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit Assistant"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card Body - Stats */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Customer Count */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">{customerCount}</p>
                <p className="text-xs text-gray-500">
                  {customerCount === 1 ? 'Customer' : 'Customers'}
                </p>
              </div>
            </div>
          </div>

          {/* Created Date */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">{formatDate(createdAt)}</p>
                <p className="text-xs text-gray-500">Created</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer - Actions */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {onToggleStatus && (
              <button
                onClick={() => onToggleStatus(id, isActive)}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                  isActive
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {isActive ? 'Deactivate' : 'Activate'}
              </button>
            )}

            {onResetPassword && (
              <button
                onClick={() => onResetPassword(id)}
                className="text-xs px-3 py-1.5 rounded-md font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
              >
                Reset Password
              </button>
            )}
          </div>

          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="text-xs px-3 py-1.5 rounded-md font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssistantCard;