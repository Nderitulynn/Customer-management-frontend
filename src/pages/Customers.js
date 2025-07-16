import React, { useState, useEffect } from 'react';
import CustomerList from './CustomerList';
import CustomerForm from './CustomerForm';
import CustomerProfile from './CustomerProfile';
import { authService } from '../../services/authService';
import { customerService } from '../../services/customerService';

const CustomerPage = () => {
  // View state management
  const [currentView, setCurrentView] = useState('list'); // 'list', 'form', 'profile'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Global state
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Initialize component
  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load current user
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
      
    } catch (error) {
      console.error('Error initializing page:', error);
      setError('Failed to load page. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions
  const showList = () => {
    setCurrentView('list');
    setSelectedCustomer(null);
    setIsEditing(false);
    clearMessages();
  };

  const showCreateForm = () => {
    setCurrentView('form');
    setSelectedCustomer(null);
    setIsEditing(false);
    clearMessages();
  };

  const showEditForm = (customer) => {
    setCurrentView('form');
    setSelectedCustomer(customer);
    setIsEditing(true);
    clearMessages();
  };

  const showProfile = (customer) => {
    setCurrentView('profile');
    setSelectedCustomer(customer);
    setIsEditing(false);
    clearMessages();
  };

  // Message handling
  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const showError = (message) => {
    setError(message);
    setSuccessMessage(null);
    // Auto-clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setError(null);
    // Auto-clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Customer operations
  const handleCustomerSave = async (customerData) => {
    try {
      if (isEditing) {
        await customerService.updateCustomer(selectedCustomer.id, customerData);
        showSuccess('Customer updated successfully!');
      } else {
        await customerService.createCustomer(customerData);
        showSuccess('Customer created successfully!');
      }
      
      // Return to list view
      showList();
      
    } catch (error) {
      console.error('Error saving customer:', error);
      showError('Failed to save customer. Please try again.');
    }
  };

  const handleCustomerDelete = async (customer) => {
    if (!window.confirm(`Are you sure you want to delete ${customer.name}?`)) {
      return;
    }

    try {
      await customerService.deleteCustomer(customer.id);
      showSuccess('Customer deleted successfully!');
      showList();
      
    } catch (error) {
      console.error('Error deleting customer:', error);
      showError('Failed to delete customer. Please try again.');
    }
  };

  // Permission checks
  const canCreateCustomer = () => {
    return currentUser && (currentUser.role === 'admin' || currentUser.role === 'assistant');
  };

  const canDeleteCustomer = () => {
    return currentUser && currentUser.role === 'admin';
  };

  // Render loading state
  if (loading) {
    return (
      <div className="customer-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading customer management...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (!currentUser) {
    return (
      <div className="customer-page">
        <div className="error-container">
          <h2>Authentication Required</h2>
          <p>Please log in to access customer management.</p>
          <button onClick={initializePage} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-page">
      {/* Header */}
      <div className="page-header">
        <h1>Customer Management</h1>
        <div className="user-info">
          <span>Welcome, {currentUser.name}</span>
          <span className="user-role">({currentUser.role})</span>
        </div>
      </div>

      {/* Navigation Breadcrumb */}
      <div className="breadcrumb">
        <button 
          onClick={showList}
          className={`breadcrumb-item ${currentView === 'list' ? 'active' : ''}`}
        >
          Customer List
        </button>
        
        {currentView === 'form' && (
          <>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item active">
              {isEditing ? 'Edit Customer' : 'Create Customer'}
            </span>
          </>
        )}
        
        {currentView === 'profile' && selectedCustomer && (
          <>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item active">
              {selectedCustomer.name}
            </span>
          </>
        )}
      </div>

      {/* Global Messages */}
      {error && (
        <div className="message error-message">
          <span className="message-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={clearMessages} className="message-close">×</button>
        </div>
      )}

      {successMessage && (
        <div className="message success-message">
          <span className="message-icon">✅</span>
          <span>{successMessage}</span>
          <button onClick={clearMessages} className="message-close">×</button>
        </div>
      )}

      {/* Main Content */}
      <div className="page-content">
        {/* Customer List View */}
        {currentView === 'list' && (
          <CustomerList
            currentUser={currentUser}
            onCreateCustomer={canCreateCustomer() ? showCreateForm : null}
            onEditCustomer={showEditForm}
            onViewCustomer={showProfile}
            onDeleteCustomer={canDeleteCustomer() ? handleCustomerDelete : null}
            onError={showError}
            onSuccess={showSuccess}
          />
        )}

        {/* Customer Form View */}
        {currentView === 'form' && (
          <CustomerForm
            customerId={isEditing ? selectedCustomer?.id : null}
            onSave={handleCustomerSave}
            onCancel={showList}
            onError={showError}
            currentUser={currentUser}
          />
        )}

        {/* Customer Profile View */}
        {currentView === 'profile' && selectedCustomer && (
          <CustomerProfile
            customerId={selectedCustomer.id}
            onEdit={showEditForm}
            onBack={showList}
            onDelete={canDeleteCustomer() ? handleCustomerDelete : null}
            onError={showError}
            onSuccess={showSuccess}
          />
        )}
      </div>

      <style jsx>{`
        .customer-page {
          min-height: 100vh;
          background-color: #f5f5f5;
          padding: 20px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 20px 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .page-header h1 {
          margin: 0;
          color: #333;
          font-size: 28px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #666;
        }

        .user-role {
          background: #e9ecef;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          text-transform: uppercase;
          font-weight: bold;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          background: white;
          padding: 15px 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 20px;
          font-size: 14px;
        }

        .breadcrumb-item {
          background: none;
          border: none;
          color: #007bff;
          cursor: pointer;
          padding: 0;
          font-size: 14px;
          text-decoration: none;
        }

        .breadcrumb-item:hover {
          text-decoration: underline;
        }

        .breadcrumb-item.active {
          color: #6c757d;
          cursor: default;
        }

        .breadcrumb-item.active:hover {
          text-decoration: none;
        }

        .breadcrumb-separator {
          margin: 0 10px;
          color: #6c757d;
        }

        .message {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          position: relative;
        }

        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .success-message {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message-icon {
          font-size: 16px;
        }

        .message-close {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: inherit;
          opacity: 0.7;
        }

        .message-close:hover {
          opacity: 1;
        }

        .page-content {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          min-height: 500px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 400px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 400px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          text-align: center;
        }

        .error-container h2 {
          color: #dc3545;
          margin-bottom: 15px;
        }

        .error-container p {
          color: #6c757d;
          margin-bottom: 20px;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.3s;
        }

        .btn-primary {
          background-color: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background-color: #0056b3;
        }

        @media (max-width: 768px) {
          .customer-page {
            padding: 10px;
          }

          .page-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
            padding: 20px;
          }

          .page-header h1 {
            font-size: 24px;
          }

          .breadcrumb {
            padding: 15px 20px;
          }

          .message {
            padding: 10px 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomerPage;