import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import AssistantDashboard from '../components/dashboard/AssistantDashboard';
import RoleBasedComponent from '../components/auth/RoleBasedComponent';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Welcome back, {user?.name || 'User'}! Here's your business overview.
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RoleBasedComponent allowedRoles={['admin', 'owner']}>
          <AdminDashboard />
        </RoleBasedComponent>

        <RoleBasedComponent allowedRoles={['assistant']}>
          <AssistantDashboard />
        </RoleBasedComponent>

        {/* Fallback for users without specific roles */}
        {!user?.role && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Welcome to Macrame CMS
            </h3>
            <p className="text-gray-600 mb-6">
              Please contact your administrator to assign your role and access the dashboard.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Contact Admin
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;