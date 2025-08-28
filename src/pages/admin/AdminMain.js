import React, { useState, useCallback } from 'react';
import { navigationHelpers } from '../../config/navigationConfig';
import AdminLayout from '../../components/admin/layout/AdminLayout';

// Import admin section components (avoid circular dependencies)
import AdminDashboard from './AdminDashboard';
import AdminCustomers from './AdminCustomers';
// Import other admin components as needed
// import AdminAssistants from './AdminAssistants';
// import AdminOrders from './AdminOrders';
// import AdminAnalytics from './AdminAnalytics';
// import AdminReports from './AdminReports';
// import AdminSettings from './AdminSettings';

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
      // Add other cases as you create the components
      // case 'assistants':
      //   return <AdminAssistants />;
      // case 'orders':
      //   return <AdminOrders />;
      // case 'analytics':
      //   return <AdminAnalytics />;
      // case 'reports':
      //   return <AdminReports />;
      // case 'settings':
      //   return <AdminSettings />;
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