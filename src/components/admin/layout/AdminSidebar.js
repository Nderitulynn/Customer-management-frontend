import React from 'react';
import { 
  LayoutDashboard,
  Users, 
  UserPlus,
  ShoppingCart,
  Settings,
  BarChart3,
  MessageSquare,
  FileText
} from 'lucide-react';
import SidebarMenuItem from './SidebarMenuItem';

const AdminSidebar = ({ 
  activeSection, 
  onSectionChange, 
  userRole = 'admin',
  isCollapsed = false 
}) => {
  // Navigation menu configuration
  const menuItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      section: 'main'
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      section: 'main'
    },
    {
      id: 'assistants',
      label: 'Assistants',
      icon: UserPlus,
      section: 'main'
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart,
      section: 'main'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      section: 'main'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      section: 'secondary'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      section: 'secondary'
    }
  ];

  // Filter menu items based on user role if needed
  const filteredMenuItems = menuItems.filter(item => {
    // Add role-based filtering logic here if needed
    return true;
  });

  // Group menu items by section
  const mainMenuItems = filteredMenuItems.filter(item => item.section === 'main');
  const secondaryMenuItems = filteredMenuItems.filter(item => item.section === 'secondary');

  const handleItemClick = (itemId) => {
    if (onSectionChange) {
      onSectionChange(itemId);
    }
  };

  const renderMenuItem = (item) => {
    const isActive = activeSection === item.id;

    return (
      <SidebarMenuItem
        key={item.id}
        id={item.id}
        label={item.label}
        icon={item.icon}
        isActive={isActive}
        onClick={handleItemClick}
        isCollapsed={isCollapsed}
      />
    );
  };

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Navigation Menu */}
      <nav className={`flex-1 overflow-y-auto transition-all duration-300 ${
        isCollapsed ? 'px-2 py-4' : 'px-4 py-6'
      }`}>
        {/* Main Navigation */}
        <div className="space-y-1">
          {mainMenuItems.map(renderMenuItem)}
        </div>

        {/* Divider */}
        {secondaryMenuItems.length > 0 && (
          <div className={`${isCollapsed ? 'pt-4' : 'pt-6'}`}>
            <div className={`border-t border-gray-200 space-y-1 ${
              isCollapsed ? 'pt-4' : 'pt-6'
            }`}>
              {secondaryMenuItems.map(renderMenuItem)}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default AdminSidebar;