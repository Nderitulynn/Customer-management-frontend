import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserPlus, 
  RefreshCw,
  AlertCircle,
  X,
  CheckCircle
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AssistantTable from '../../components/admin/assistants/AssistantTable';
import AssistantForm from '../../components/admin/assistants/AssistantForm';
import { AssistantService } from '../../services/assistantService';

const AssistantsPage = () => {
  const [loading, setLoading] = useState(true);
  const [assistantsLoading, setAssistantsLoading] = useState(false);
  const [showAssistantForm, setShowAssistantForm] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [assistants, setAssistants] = useState([]);

  // Fetch assistants from API - memoized
  const fetchAssistants = useCallback(async () => {
    try {
      setAssistantsLoading(true);
      setError(null);
      const assistantsData = await AssistantService.getAllAssistants();
      setAssistants(assistantsData);
    } catch (err) {
      setError('Failed to fetch assistants. Please try again.');
      console.error('Error fetching assistants:', err);
    } finally {
      setAssistantsLoading(false);
    }
  }, []);

  // Handle assistant status toggle
  const handleToggleAssistantStatus = useCallback(async (assistantId) => {
    try {
      const currentAssistant = assistants.find(a => a.id === assistantId);
      if (!currentAssistant) {
        throw new Error('Assistant not found');
      }

      const newStatus = currentAssistant.isActive ? false : true;
      await AssistantService.updateAssistant(assistantId, { isActive: newStatus });
      
      setSuccessMessage('Assistant status updated successfully');
      fetchAssistants();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to update assistant status');
      console.error('Error toggling assistant status:', err);
    }
  }, [assistants, fetchAssistants]);

  // Handle assistant deletion
  const handleDeleteAssistant = useCallback(async (assistantId) => {
    try {
      await AssistantService.deleteAssistant(assistantId);
      setSuccessMessage('Assistant deleted successfully');
      fetchAssistants();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to delete assistant');
      console.error('Error deleting assistant:', err);
    }
  }, [fetchAssistants]);

  // Handle assistant edit
  const handleEditAssistant = useCallback((assistant) => {
    setSelectedAssistant(assistant);
    setShowAssistantForm(true);
  }, []);

  // Handle password reset
  const handleResetPassword = useCallback(async (assistantId) => {
    try {
      const result = await AssistantService.resetPassword(assistantId);
      setSuccessMessage(`Password reset successfully. New temporary password: ${result.temporaryPassword}`);
      
      setTimeout(() => setSuccessMessage(''), 8000);
    } catch (err) {
      setError('Failed to reset password');
      console.error('Error resetting password:', err);
    }
  }, []);

  // Handle view details
  const handleViewDetails = useCallback((assistant) => {
    // This could open a detailed view modal or navigate to a detail page
    console.log('View details for assistant:', assistant);
    // For now, just show an info message
    setSuccessMessage(`Viewing details for ${assistant.firstName} ${assistant.lastName}`);
    setTimeout(() => setSuccessMessage(''), 3000);
  }, []);

  // Handle form success
  const handleFormSuccess = useCallback((result) => {
    if (selectedAssistant) {
      setSuccessMessage(`Assistant ${result.firstName} ${result.lastName} updated successfully!`);
    } else {
      setSuccessMessage(`Assistant ${result.firstName} ${result.lastName} created successfully!`);
    }
    
    setShowAssistantForm(false);
    setSelectedAssistant(null);
    fetchAssistants();
    
    setTimeout(() => setSuccessMessage(''), 5000);
  }, [selectedAssistant, fetchAssistants]);

  // Handle form cancel
  const handleFormCancel = useCallback(() => {
    setShowAssistantForm(false);
    setSelectedAssistant(null);
  }, []);

  // Initial data fetch
  useEffect(() => {
    const initializeAssistants = async () => {
      setLoading(true);
      await fetchAssistants();
      setLoading(false);
    };

    initializeAssistants();
  }, [fetchAssistants]);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" message="Loading Assistants..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assistant Form */}
      {showAssistantForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedAssistant ? 'Edit Assistant' : 'Register New Assistant'}
            </h3>
          </div>
          <AssistantForm
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
            initialData={selectedAssistant}
          />
        </div>
      )}

      {/* Assistant Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Assistants</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchAssistants}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Refresh assistants"
                disabled={assistantsLoading}
              >
                <RefreshCw className={`h-4 w-4 ${assistantsLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => {
                  setSelectedAssistant(null);
                  setShowAssistantForm(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Register Assistant
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          {assistantsLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="medium" message="Loading assistants..." />
            </div>
          ) : assistants.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assistants found</h3>
              <p className="text-gray-500 text-sm mb-6">Get started by registering your first assistant</p>
              <button
                onClick={() => {
                  setSelectedAssistant(null);
                  setShowAssistantForm(true);
                }}
                className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Register First Assistant
              </button>
            </div>
          ) : (
            <AssistantTable
              assistants={assistants}
              loading={assistantsLoading}
              onEdit={handleEditAssistant}
              onDelete={handleDeleteAssistant}
              onToggleStatus={handleToggleAssistantStatus}
              onResetPassword={handleResetPassword}
              onViewDetails={handleViewDetails}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AssistantsPage;