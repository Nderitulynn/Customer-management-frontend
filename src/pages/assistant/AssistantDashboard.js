import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';
import { apiHelpers, API_ENDPOINTS, handleApiError } from '../../services/api';
import CustomerService from '../../services/customerService'; // ADDED: Import CustomerService
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // ADDED: Import useAuth

// Import layout components
import AssistantSidebar from '../../components/assistants/layout/AssistantSidebar';
import AssistantHeader from '../../components/assistants/layout/AssistantHeader';
import AssistantMain from '../../components/assistants/layout/AssistantMain';

// Import section components
import Overview from '../../components/assistants/sections/Overview.js';
import AssistantCustomers from '../../pages/assistant/AssistantCustomers'; // UPDATED: Changed from MyCustomers to AssistantCustomers
import AssistantOrders from '../../pages/assistant/AssistantOrders'; // FIXED: Updated import path to match the component
import Messages from '../../components/assistants/sections/Messages';
import AssistantInvoices from '../../pages/assistant/AssistantInvoices';

const AssistantDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isAssistant } = useAuth(); // ADDED: Use auth context
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Section switching state
  const [activeSection, setActiveSection] = useState('overview');
  
  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Dashboard stats - Updated structure
  const [stats, setStats] = useState({
    assignedCustomers: 0,
    totalCustomers: 0,
    newCustomersThisWeek: 0,
    customerGrowthPercentage: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    monthlyRevenue: 0,
    customerSatisfaction: 0,
    unclaimedCustomers: 0,
    customersNeedingAttention: 0
  });
  
  // Recent activities
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [unclaimedCustomers, setUnclaimedCustomers] = useState([]);

  useEffect(() => {
    initializeDashboard();
  }, []);

  // Close mobile sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initializeDashboard = async () => {
    try {
      // Check authentication and role using context
      if (!isAuthenticated || !isAssistant()) {
        navigate('/login');
        return;
      }
      
      console.log('Dashboard initialized for user:', user?.email);
      await loadDashboardData();
      
    } catch (err) {
      setError('Failed to load dashboard');
      console.error('Dashboard initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      setError(''); // Clear any previous errors
      console.log('Loading dashboard data...');
      
      // FIXED: Load dashboard statistics using CustomerService
      let dashboardStats = {};
      try {
        console.log('Fetching dashboard stats using CustomerService...');
        dashboardStats = await CustomerService.getDashboardStats();
        console.log('Stats response:', dashboardStats);
      } catch (statsError) {
        console.warn('Stats endpoint failed:', handleApiError(statsError));
        // Continue with default stats
        dashboardStats = {
          assignedCustomers: 0,
          totalCustomers: 0,
          newCustomersThisWeek: 0,
          customerGrowthPercentage: 0,
          unclaimedCustomers: 0,
          customersNeedingAttention: 0,
          customerSatisfaction: 85 // Default value
        };
      }
      
      // FIXED: Load recent customers using CustomerService
      let customers = [];
      try {
        console.log('Fetching recent customers using CustomerService...');
        customers = await CustomerService.getRecentCustomers(5);
        console.log('Recent customers response:', customers);
        
        // CustomerService.getRecentCustomers already handles response format
        if (!Array.isArray(customers)) {
          customers = [];
        }
      } catch (customersError) {
        console.warn('Recent customers endpoint failed:', handleApiError(customersError));
        customers = [];
      }
      
      setRecentCustomers(customers || []);

      // Load unclaimed customers - Using CustomerService
      let unclaimed = [];
      try {
        console.log('Fetching unclaimed customers using CustomerService...');
        const unclaimedResponse = await CustomerService.getCustomers({ 
          assigned: false, 
          limit: 10 
        });
        console.log('Unclaimed customers response:', unclaimedResponse);
        
        // Handle CustomerService response format
        if (unclaimedResponse.success && unclaimedResponse.data) {
          unclaimed = unclaimedResponse.data;
        } else if (Array.isArray(unclaimedResponse)) {
          unclaimed = unclaimedResponse;
        }
      } catch (unclaimedError) {
        console.warn('Unclaimed customers endpoint failed:', handleApiError(unclaimedError));
        unclaimed = [];
      }
      
      setUnclaimedCustomers(unclaimed || []);

      // Load recent orders data - Mock data for now since OrderService might not exist
      let ordersData = [];
      let orderStats = {
        totalOrders: 0,
        ordersByStatus: { pending: 0, completed: 0 },
        totalRevenue: 0
      };

      try {
        // Try to load orders if endpoint exists
        console.log('Attempting to fetch orders...');
        const ordersResponse = await apiHelpers.get(`${API_ENDPOINTS.ORDERS.LIST}?limit=5&page=1`);
        console.log('Orders response:', ordersResponse);
        
        if (ordersResponse.success && ordersResponse.data) {
          ordersData = ordersResponse.data.orders || ordersResponse.data;
        } else if (Array.isArray(ordersResponse)) {
          ordersData = ordersResponse;
        } else if (ordersResponse.orders) {
          ordersData = ordersResponse.orders;
        }
        
        // Calculate basic order stats from the data
        orderStats = {
          totalOrders: ordersData.length,
          ordersByStatus: {
            pending: ordersData.filter(order => order.status === 'pending').length,
            completed: ordersData.filter(order => order.status === 'completed').length
          },
          totalRevenue: ordersData.reduce((sum, order) => sum + (order.total || 0), 0)
        };
        
      } catch (orderError) {
        console.warn('Orders endpoint not available:', handleApiError(orderError));
        // Use mock data
        ordersData = [];
        orderStats = {
          totalOrders: 0,
          ordersByStatus: { pending: 0, completed: 0 },
          totalRevenue: 0
        };
      }

      setRecentOrders(ordersData);

      // Combine stats from all sources
      setStats({
        // Customer stats from CustomerService
        assignedCustomers: dashboardStats.assignedCustomers || 0,
        totalCustomers: dashboardStats.totalCustomers || 0,
        newCustomersThisWeek: dashboardStats.newCustomersThisWeek || 0,
        customerGrowthPercentage: dashboardStats.customerGrowthPercentage || 0,
        unclaimedCustomers: unclaimed.length || dashboardStats.unclaimedCustomers || 0,
        customersNeedingAttention: dashboardStats.customersNeedingAttention || 0,
        customerSatisfaction: dashboardStats.customerSatisfaction || 85,
        
        // Order stats (with fallbacks)
        totalOrders: orderStats.totalOrders || 0,
        pendingOrders: orderStats.ordersByStatus?.pending || 0,
        completedOrders: orderStats.ordersByStatus?.completed || 0,
        monthlyRevenue: orderStats.totalRevenue || 0
      });

      console.log('Dashboard data loaded successfully:', {
        customers: customers.length,
        unclaimed: unclaimed.length,
        orders: ordersData.length,
        stats: dashboardStats
      });

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      const errorMessage = handleApiError(err, 'Failed to load dashboard data');
      setError(errorMessage);
      
      // Set empty data to prevent crashes
      setRecentCustomers([]);
      setRecentOrders([]);
      setUnclaimedCustomers([]);
      
      // Set default stats to prevent crashes
      setStats({
        assignedCustomers: 0,
        totalCustomers: 0,
        newCustomersThisWeek: 0,
        customerGrowthPercentage: 0,
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        monthlyRevenue: 0,
        customerSatisfaction: 0,
        unclaimedCustomers: 0,
        customersNeedingAttention: 0
      });
    }
  };

  // Refresh dashboard data
  const refreshDashboard = async () => {
    setLoading(true);
    await loadDashboardData();
    setLoading(false);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Mobile sidebar handlers
  const handleMobileSidebarToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleMobileSidebarClose = () => {
    setIsMobileSidebarOpen(false);
  };

  // ADDED: Logout handler using auth context
  const handleLogout = async () => {
    try {
      console.log('Initiating logout...');
      await logout(); // This will handle everything: server logout, clear storage, redirect
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, the context will still clear and redirect
    }
  };

  // ADDED: Settings handler
  const handleSettings = () => {
    setActiveSection('profile');
    // Close mobile sidebar if open
    setIsMobileSidebarOpen(false);
  };

  // Section renderer function
  const renderSection = () => {
    const commonProps = {
      stats,
      recentCustomers,
      recentOrders,
      unclaimedCustomers,
      setActiveSection,
      getStatusBadgeColor,
      refreshDashboard,
      currentUser: user // UPDATED: Use user from context
    };

    switch (activeSection) {
      case 'overview':
        return <Overview {...commonProps} />;
      
      case 'customers':
        return <AssistantCustomers />; // UPDATED: Using AssistantCustomers component
      
      case 'orders':
        return <AssistantOrders currentUser={user} />; // UPDATED: Use user from context

         case 'invoices':
      return <AssistantInvoices />;
      
      case 'messages':
        return <Messages currentUser={user} />; // UPDATED: Use user from context
      
      case 'profile':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
            <div className="space-y-4">
              {user && (
                <div>
                  <p className="text-gray-600">
                    <strong>Name:</strong> {user.firstName} {user.lastName}
                  </p>
                  <p className="text-gray-600">
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p className="text-gray-600">
                    <strong>Role:</strong> {user.role}
                  </p>
                </div>
              )}
              <p className="text-gray-600">Profile settings section will be implemented here.</p>
            </div>
          </div>
        );
      
      default:
        return <Overview {...commonProps} />;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Fixed width, responsive */}
      <AssistantSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={handleMobileSidebarClose}
      />

      {/* Main Content Area - Flex grow */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - UPDATED: Added onLogout and onSettings handlers */}
        <AssistantHeader
          activeSection={activeSection}
          onMobileMenuToggle={handleMobileSidebarToggle}
          currentUser={user}
          onLogout={handleLogout}
          onSettings={handleSettings}
        />

        {/* Main Content */}
        <AssistantMain
          loading={loading}
          error={error}
          onRetry={refreshDashboard}
          className="flex-1"
        >
          {renderSection()}
        </AssistantMain>
      </div>
    </div>
  );
};

export default AssistantDashboard;