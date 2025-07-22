import React, { useState } from 'react';
import { Trash2, RotateCcw, Power, PowerOff, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { AssistantService } from './AssistantService';

// Simple confirmation modal component
const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "default",
  isLoading = false 
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getButtonStyles = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className={`p-4 rounded-lg border mb-6 ${getTypeStyles()}`}>
          <p className="text-sm">{message}</p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${getButtonStyles()}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Success message component
const SuccessMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm">
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <p className="text-sm text-green-800">{message}</p>
          <button
            onClick={onClose}
            className="ml-2 text-green-400 hover:text-green-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Error message component
const ErrorMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-sm">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
          <p className="text-sm text-red-800">{message}</p>
          <button
            onClick={onClose}
            className="ml-2 text-red-400 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const AssistantActions = ({ 
  assistant, 
  onUpdate, 
  onDelete,
  showLabels = false 
}) => {
  const [modalState, setModalState] = useState({
    type: null,
    isOpen: false,
    isLoading: false
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Clear messages after timeout
  React.useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  React.useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleToggleStatus = async () => {
    setModalState({ ...modalState, isLoading: true });
    
    try {
      const response = await AssistantService.toggleAssistantStatus(assistant.id);
      
      // Update the assistant data
      if (onUpdate) {
        onUpdate({ 
          ...assistant, 
          isActive: !assistant.isActive 
        });
      }
      
      setSuccessMessage(
        `Assistant ${assistant.isActive ? 'deactivated' : 'activated'} successfully`
      );
      setModalState({ type: null, isOpen: false, isLoading: false });
    } catch (error) {
      console.error('Toggle status error:', error);
      setErrorMessage(error.message || 'Failed to update assistant status');
      setModalState({ ...modalState, isLoading: false });
    }
  };

  const handleResetPassword = async () => {
    setModalState({ ...modalState, isLoading: true });
    
    try {
      const response = await AssistantService.resetAssistantPassword(assistant.id);
      
      // Show new password to admin
      if (response.newPassword) {
        setNewPassword(response.newPassword);
        setSuccessMessage('Password reset successfully. New password shown below.');
      } else {
        setSuccessMessage('Password reset successfully');
      }
      
      setModalState({ type: null, isOpen: false, isLoading: false });
    } catch (error) {
      console.error('Reset password error:', error);
      setErrorMessage(error.message || 'Failed to reset password');
      setModalState({ ...modalState, isLoading: false });
    }
  };

  const handleDeleteAssistant = async () => {
    setModalState({ ...modalState, isLoading: true });
    
    try {
      await AssistantService.deleteAssistant(assistant.id);
      
      if (onDelete) {
        onDelete(assistant.id);
      }
      
      setSuccessMessage('Assistant deleted successfully');
      setModalState({ type: null, isOpen: false, isLoading: false });
    } catch (error) {
      console.error('Delete assistant error:', error);
      setErrorMessage(error.message || 'Failed to delete assistant');
      setModalState({ ...modalState, isLoading: false });
    }
  };

  const openModal = (type) => {
    setModalState({ type, isOpen: true, isLoading: false });
  };

  const closeModal = () => {
    setModalState({ type: null, isOpen: false, isLoading: false });
    setNewPassword('');
  };

  const getModalConfig = () => {
    const configs = {
      toggleStatus: {
        title: `${assistant.isActive ? 'Deactivate' : 'Activate'} Assistant`,
        message: assistant.isActive 
          ? `Are you sure you want to deactivate ${assistant.firstName} ${assistant.lastName}? They will not be able to log in while inactive.`
          : `Are you sure you want to activate ${assistant.firstName} ${assistant.lastName}? They will be able to log in once activated.`,
        confirmText: assistant.isActive ? 'Deactivate' : 'Activate',
        type: assistant.isActive ? 'warning' : 'success',
        onConfirm: handleToggleStatus
      },
      resetPassword: {
        title: 'Reset Password',
        message: `Are you sure you want to reset the password for ${assistant.firstName} ${assistant.lastName}? They will be required to change it on their next login.`,
        confirmText: 'Reset Password',
        type: 'warning',
        onConfirm: handleResetPassword
      },
      delete: {
        title: 'Delete Assistant',
        message: `Are you sure you want to permanently delete ${assistant.firstName} ${assistant.lastName}? This action cannot be undone.`,
        confirmText: 'Delete Assistant',
        type: 'danger',
        onConfirm: handleDeleteAssistant
      }
    };

    return configs[modalState.type] || {};
  };

  if (!assistant) {
    return <div className="text-gray-500 text-sm">No assistant data</div>;
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        {/* Toggle Status Button */}
        <button
          onClick={() => openModal('toggleStatus')}
          className={`p-2 rounded-lg transition-colors ${
            assistant.isActive
              ? 'text-green-600 hover:bg-green-50 hover:text-green-700'
              : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
          }`}
          title={assistant.isActive ? 'Deactivate Assistant' : 'Activate Assistant'}
        >
          {assistant.isActive ? (
            <Power className="w-4 h-4" />
          ) : (
            <PowerOff className="w-4 h-4" />
          )}
          {showLabels && (
            <span className="ml-1 text-xs">
              {assistant.isActive ? 'Active' : 'Inactive'}
            </span>
          )}
        </button>

        {/* Reset Password Button */}
        <button
          onClick={() => openModal('resetPassword')}
          className="p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
          title="Reset Password"
        >
          <RotateCcw className="w-4 h-4" />
          {showLabels && <span className="ml-1 text-xs">Reset</span>}
        </button>

        {/* Delete Button */}
        <button
          onClick={() => openModal('delete')}
          className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
          title="Delete Assistant"
        >
          <Trash2 className="w-4 h-4" />
          {showLabels && <span className="ml-1 text-xs">Delete</span>}
        </button>
      </div>

      {/* New Password Display */}
      {newPassword && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg max-w-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-blue-800 mb-2">New Password</h4>
                <div className="bg-white p-2 rounded border font-mono text-sm text-gray-800">
                  {newPassword}
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Assistant must change this password on next login
                </p>
              </div>
              <button
                onClick={() => setNewPassword('')}
                className="ml-2 text-blue-400 hover:text-blue-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={getModalConfig().onConfirm}
        title={getModalConfig().title}
        message={getModalConfig().message}
        confirmText={getModalConfig().confirmText}
        type={getModalConfig().type}
        isLoading={modalState.isLoading}
      />

      {/* Success Message */}
      <SuccessMessage 
        message={successMessage} 
        onClose={() => setSuccessMessage('')} 
      />

      {/* Error Message */}
      <ErrorMessage 
        message={errorMessage} 
        onClose={() => setErrorMessage('')} 
      />
    </>
  );
};

export default AssistantActions;