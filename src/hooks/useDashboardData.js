import { useState, useEffect, useCallback } from 'react';
import { AssistantService } from '../services/assistantService';
import customerService from '../services/customerService';
import OrderService from '../services/orderService';

export const useDashboardData = () => {
  // Loading states
  const [loading, setLoading] = useState(true);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // Dashboard data state - initialized with empty/default values
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalCustomers: 0,
      activeChats: 0,
      monthlyRevenue: 0,
      todayOrders: 0,
      totalAssistants: 0,
      responseRate: 0
    },
    recentOrders: [],
    recentCustomers: []
  });

  // Data validation helper functions
  const validateCustomer = (customer) => {
    return {
      ...customer,
      name: customer.fullName || customer.name || 'Unknown Customer',
      phone: customer.phone || 'N/A',
      lastOrder: customer.lastOrderDate || customer.createdAt || 'N/A',
      totalOrders: customer.totalOrders || 0,
      totalSpent: customer.totalSpent || 0,
      id: customer.id || customer._id || null
    };
  };

  const validateOrder = (order) => {
    return {
      ...order,
      id: order.id || order._id || null,
      customer: order.customerId?.fullName || order.customerName || 'Unknown Customer',
      item: order.items?.[0]?.productName || order.items?.[0]?.name || 'Order Items',
      amount: order.orderTotal || 0,
      status: order.status || 'pending',
      date: order.createdAt || new Date().toISOString()
    };
  };

  // Fetch dashboard stats from API - memoized
  const fetchDashboardStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      
      // Try to get stats from customerService if available
      let stats = {};
      try {
        if (customerService.getDashboardStats) {
          stats = await customerService.getDashboardStats();
        }
      } catch (err) {
        console.warn('Dashboard stats not available from customerService:', err);
      }
      
      // Try to get order stats from OrderService
      try {
        const orderStats = await OrderService.getDashboardStats();
        stats = { ...stats, ...orderStats };
      } catch (err) {
        console.warn('Order stats not available from OrderService:', err);
      }

      // Get basic assistant count for overview statistics
      try {
        const assistants = await AssistantService.getAllAssistants();
        const assistantCount = Array.isArray(assistants) ? assistants.length : 0;
        stats.totalAssistants = assistantCount;
      } catch (err) {
        console.warn('Assistant count not available:', err);
        stats.totalAssistants = 0;
      }
      
      setDashboardData(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          ...stats
        }
      }));
      
      return { success: true, data: stats };
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      return { success: false, error: 'Failed to fetch dashboard statistics. Please try again.' };
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch recent customers from API using existing getCustomers method - memoized
  const fetchRecentCustomers = useCallback(async () => {
    try {
      setCustomersLoading(true);
      
      // Use the existing getCustomers method instead of non-existent getRecentCustomers
      const allCustomers = await customerService.getCustomers();
      
      // Get the most recent customers (last 5) and transform data
      const recentCustomers = Array.isArray(allCustomers) 
        ? allCustomers
            .slice(-5) // Get last 5 customers (most recent)
            .reverse() // Reverse to show newest first
            .map(customer => {
              return validateCustomer({
                id: customer._id || customer.id,
                name: customer.fullName || customer.name,
                phone: customer.phone,
                lastOrder: customer.lastOrderDate || customer.createdAt,
                totalOrders: customer.totalOrders || 0,
                totalSpent: customer.totalSpent || 0
              });
            })
        : [];
      
      setDashboardData(prev => ({
        ...prev,
        recentCustomers: recentCustomers,
        stats: {
          ...prev.stats,
          totalCustomers: allCustomers?.length || 0 // Update total customers count
        }
      }));
      
      return { success: true, data: recentCustomers };
    } catch (err) {
      console.error('Error fetching recent customers:', err);
      
      // Set empty array on error to prevent crashes
      setDashboardData(prev => ({
        ...prev,
        recentCustomers: [],
        stats: {
          ...prev.stats,
          totalCustomers: 0
        }
      }));
      
      return { success: false, error: 'Failed to fetch recent customers. Please try again.' };
    } finally {
      setCustomersLoading(false);
    }
  }, []);

  // Fetch recent orders using getAllOrders
  const fetchRecentOrders = useCallback(async () => {
    try {
      console.log('🔍 Fetching recent orders...');
      
      // Use getAllOrders to get proper order objects with populated customer data
      const allOrders = await OrderService.getAllOrders();
      
      console.log('🔍 Raw orders from API:', allOrders);
      
      // Get the most recent orders (first 5 since they're sorted by createdAt desc)
      const recentOrders = Array.isArray(allOrders) 
        ? allOrders.slice(0, 5) // Get first 5 orders (most recent)
        : [];
      
      console.log('🔍 Recent orders to validate:', recentOrders);
      
      // Validate and normalize order data
      const validatedOrders = recentOrders.map(order => {
        console.log('🔍 Validating order:', order._id, 'customer:', order.customerId?.fullName);
        return validateOrder(order);
      });
      
      console.log('🔍 Final validated orders:', validatedOrders);
      
      setDashboardData(prev => ({
        ...prev,
        recentOrders: validatedOrders
      }));
      
      return { success: true, data: validatedOrders };
    } catch (err) {
      console.error('Error fetching recent orders:', err);
      
      // Set empty array on error to prevent crashes
      setDashboardData(prev => ({
        ...prev,
        recentOrders: []
      }));
      
      return { success: false, error: 'Failed to fetch recent orders. Please try again.' };
    }
  }, []);

  // Comprehensive dashboard data fetcher
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all data concurrently
      const results = await Promise.allSettled([
        fetchDashboardStats(),
        fetchRecentCustomers(),
        fetchRecentOrders()
      ]);
      
      // Check for any failures
      const failures = results.filter(result => result.status === 'rejected' || !result.value?.success);
      
      if (failures.length > 0) {
        console.warn('Some dashboard data failed to load:', failures);
      }
      
      return { 
        success: failures.length === 0, 
        partialSuccess: failures.length < results.length,
        errors: failures.map(f => f.reason || f.value?.error).filter(Boolean)
      };
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      return { success: false, error: 'Failed to fetch dashboard data' };
    } finally {
      setLoading(false);
    }
  }, [fetchDashboardStats, fetchRecentCustomers, fetchRecentOrders]);

  // Refresh customer data
  const refreshCustomerData = useCallback(async () => {
    const results = await Promise.allSettled([
      fetchDashboardStats(),
      fetchRecentCustomers()
    ]);
    
    const failures = results.filter(result => result.status === 'rejected' || !result.value?.success);
    
    return {
      success: failures.length === 0,
      partialSuccess: failures.length < results.length,
      errors: failures.map(f => f.reason || f.value?.error).filter(Boolean)
    };
  }, [fetchDashboardStats, fetchRecentCustomers]);

  // Refresh order data method
  const refreshOrderData = useCallback(async () => {
    const results = await Promise.allSettled([
      fetchDashboardStats(),
      fetchRecentOrders()
    ]);
    
    const failures = results.filter(result => result.status === 'rejected' || !result.value?.success);
    
    return {
      success: failures.length === 0,
      partialSuccess: failures.length < results.length,
      errors: failures.map(f => f.reason || f.value?.error).filter(Boolean)
    };
  }, [fetchDashboardStats, fetchRecentOrders]);

  // Initial data fetch
  useEffect(() => {
    const initializeDashboard = async () => {
      const result = await fetchDashboardData();
      
      if (!result.success && !result.partialSuccess) {
        console.error('Failed to initialize dashboard data');
      }
    };

    initializeDashboard();
  }, [fetchDashboardData]);

  // Computed assistant stats with safe fallbacks
  const assistantStats = {
    total: dashboardData.stats.totalAssistants || 0,
    active: 0, // Will be computed from actual assistants data when needed
    inactive: 0 // Will be computed from actual assistants data when needed
  };

  const customerStats = {
    total: dashboardData.recentCustomers?.length || 0,
    totalRevenue: dashboardData.recentCustomers?.reduce((sum, customer) => sum + (customer?.totalSpent || 0), 0) || 0
  };

  const orderStats = {
    total: dashboardData.recentOrders?.length || 0,
    pending: dashboardData.recentOrders?.filter(order => order?.status === 'pending')?.length || 0,
    completed: dashboardData.recentOrders?.filter(order => order?.status === 'completed')?.length || 0,
    totalValue: dashboardData.recentOrders?.reduce((sum, order) => sum + (order?.amount || 0), 0) || 0
  };

  return {
    // Data states
    dashboardData,
    loading,
    customersLoading,
    statsLoading,
    assistantStats,
    customerStats,
    orderStats,
    
    // Fetch methods
    fetchDashboardData,
    fetchDashboardStats,
    fetchRecentCustomers,
    fetchRecentOrders,
    refreshCustomerData,
    refreshOrderData,
    
    // Direct state setters (for advanced usage)
    setDashboardData,
    setLoading,
    setCustomersLoading,
    setStatsLoading
  };
};

export default useDashboardData;