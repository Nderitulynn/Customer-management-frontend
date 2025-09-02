import React, { useState, useCallback } from 'react';
import { navigationHelpers } from '../../config/navigationConfig';
import AdminLayout from '../../components/admin/layout/AdminLayout';

// Import admin section components (avoid circular dependencies)
import AdminDashboard from './AdminDashboard';
import AdminCustomers from './AdminCustomers';
import AssistantsPage from './AssistantsPage';
import AdminOrders from './AdminOrders';
import AdminReports from './AdminReports';

const AdminMain = () => {
  // State management for active section and sidebar
  const [activeSection, setActiveSection] = useState(() => {
    return navigationHelpers.getDefaultActiveSection('admin') || 'overview';
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Handle section changes from sidebar navigation
  const handleSectionChange = useCallback((section) => {
    setActiveSection(section);
  }, []);

  // Handle sidebar toggle
  const handleToggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  // Render the appropriate component based on activeSection
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return <AdminDashboard />;
      case 'customers':
        return <AdminCustomers />;
      case 'assistants':  
        return <AssistantsPage />;
      case 'orders':
        return <AdminOrders />;
      case 'reports':
        return <AdminReports />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <AdminLayout
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
      isSidebarCollapsed={isSidebarCollapsed}
      onToggleSidebar={handleToggleSidebar}
    >
      {renderActiveSection()}
    </AdminLayout>
  );
};

export default AdminMain;