import React, { useState, useEffect } from 'react';
import customerService from '../../../services/CustomerService';
import authService  from '../../../services/AuthService';

const CustomerProfile = ({ customerId, onEdit, onBack, onDelete }) => {
  const [customer, setCustomer] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadCustomerData();
    loadCurrentUser();
  }, [customerId]);

  const loadCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load customer details
      const customerData = await customerService.getCustomerById(customerId);
      setCustomer(customerData);
      
      // Load customer notes
      const notesData = await customerService.getCustomerNotes(customerId);
      setNotes(notesData);
      
    } catch (error) {
      console.error('Error loading customer data:', error);
      setError('Failed to load customer information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      setAddingNote(true);
      const noteData = {
        content: newNote,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString()
      };
      
      await customerService.addCustomerNote(customerId, noteData);
      setNewNote('');
      
      // Reload notes
      const updatedNotes = await customerService.getCustomerNotes(customerId);
      setNotes(updatedNotes);
      
    } catch (error) {
      console.error('Error adding note:', error);
      setError('Failed to add note. Please try again.');
    } finally {
      setAddingNote(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await customerService.updateCustomerStatus(customerId, newStatus);
      setCustomer({ ...customer, status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update customer status.');
    }
  };

  const canEditCustomer = () => {
    if (!currentUser || !customer) return false;
    
    // Admin can edit any customer
    if (currentUser.role === 'admin') return true;
    
    // Assistant can only edit assigned customers
    if (currentUser.role === 'assistant') {
      return customer.assignedTo === currentUser.id;
    }
    
    return false;
  };

  const canDeleteCustomer = () => {
    return currentUser && currentUser.role === 'admin';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="customer-profile">
        <div className="loading">Loading customer information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-profile">
        <div className="error-message">{error}</div>
        <button onClick={onBack} className="btn btn-secondary">
          Back to List
        </button>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="customer-profile">
        <div className="error-message">Customer not found.</div>
        <button onClick={onBack} className="btn btn-secondary">
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="customer-profile">
      <div className="profile-header">
        <h2>Customer Profile</h2>
        <div className="profile-actions">
          <button onClick={onBack} className="btn btn-secondary">
            Back to List
          </button>
          {canEditCustomer() && (
            <button onClick={() => onEdit(customer)} className="btn btn-primary">
              Edit Customer
            </button>
          )}
          {canDeleteCustomer() && (
            <button 
              onClick={() => onDelete(customer)} 
              className="btn btn-danger"
              style={{ marginLeft: '10px' }}
            >
              Delete Customer
            </button>
          )}
        </div>
      </div>

      <div className="profile-content">
        {/* Customer Information Card */}
        <div className="info-card">
          <h3>Customer Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              <span>{customer.name}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{customer.email}</span>
            </div>
            <div className="info-item">
              <label>Phone:</label>
              <span>{customer.phone || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <span className={`status-badge ${customer.status}`}>
                {customer.status}
              </span>
              {canEditCustomer() && (
                <select 
                  value={customer.status} 
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="status-select"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              )}
            </div>
            <div className="info-item">
              <label>Created:</label>
              <span>{formatDate(customer.createdAt)}</span>
            </div>
            <div className="info-item">
              <label>Last Updated:</label>
              <span>{formatDate(customer.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Assignment Information Card */}
        <div className="info-card">
          <h3>Assignment Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Assigned To:</label>
              <span>{customer.assignedToName || 'Unassigned'}</span>
            </div>
            <div className="info-item">
              <label>Assignment Date:</label>
              <span>{formatDate(customer.assignedAt)}</span>
            </div>
          </div>
        </div>

        {/* Customer Notes Section */}
        <div className="notes-section">
          <h3>Customer Notes</h3>
          
          {/* Add Note Form */}
          {canEditCustomer() && (
            <div className="add-note-form">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note about this customer..."
                className="note-textarea"
                rows="3"
              />
              <button 
                onClick={handleAddNote}
                disabled={addingNote || !newNote.trim()}
                className="btn btn-primary"
              >
                {addingNote ? 'Adding...' : 'Add Note'}
              </button>
            </div>
          )}

          {/* Notes List */}
          <div className="notes-list">
            {notes.length === 0 ? (
              <div className="no-notes">No notes available for this customer.</div>
            ) : (
              notes.map((note, index) => (
                <div key={index} className="note-item">
                  <div className="note-content">{note.content}</div>
                  <div className="note-meta">
                    <span>By: {note.createdByName}</span>
                    <span>On: {formatDate(note.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .customer-profile {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #eee;
        }

        .profile-header h2 {
          margin: 0;
          color: #333;
        }

        .profile-actions {
          display: flex;
          gap: 10px;
        }

        .btn {
          padding: 8px 16px;
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

        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background-color: #545b62;
        }

        .btn-danger {
          background-color: #dc3545;
          color: white;
        }

        .btn-danger:hover {
          background-color: #c82333;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .info-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .info-card h3 {
          margin-top: 0;
          margin-bottom: 20px;
          color: #333;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
        }

        .info-item label {
          font-weight: bold;
          color: #555;
          margin-bottom: 5px;
        }

        .info-item span {
          color: #333;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .status-badge.active {
          background-color: #d4edda;
          color: #155724;
        }

        .status-badge.inactive {
          background-color: #f8d7da;
          color: #721c24;
        }

        .status-badge.pending {
          background-color: #fff3cd;
          color: #856404;
        }

        .status-select {
          margin-top: 10px;
          padding: 4px 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .notes-section {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .notes-section h3 {
          margin-top: 0;
          margin-bottom: 20px;
          color: #333;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }

        .add-note-form {
          margin-bottom: 20px;
        }

        .note-textarea {
          width: 100%;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 10px;
          font-family: inherit;
          resize: vertical;
          margin-bottom: 10px;
        }

        .note-textarea:focus {
          outline: none;
          border-color: #007bff;
        }

        .notes-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .note-item {
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 15px;
          margin-bottom: 10px;
          background: #f9f9f9;
        }

        .note-content {
          margin-bottom: 10px;
          line-height: 1.5;
        }

        .note-meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #666;
        }

        .no-notes {
          text-align: center;
          color: #666;
          font-style: italic;
          padding: 20px;
        }

        .loading, .error-message {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .error-message {
          color: #dc3545;
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .profile-header {
            flex-direction: column;
            gap: 15px;
          }

          .profile-actions {
            width: 100%;
            justify-content: center;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomerProfile;