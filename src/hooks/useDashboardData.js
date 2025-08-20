import { useState, useEffect, useCallback } from 'react';
import { dashboardService, dashboardUtils } from '../services/dashboardService';

export const useDashboardData = () => {
  // Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Error states
  const [error, setError] = useState(null);

  // Dashboard data state - using service layer structure
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalCustomers: 0,
      activeChats: 0,
      monthlyRevenue: 0,
      todayOrders: 0,
      totalAssistants: 0,
      responseRate: 0,
      activeCustomers: 0,
      newCustomers: 0
    },
    recentOrders: [],
    assistantStats: {
      total: 0,
      active: 0,
      inactive: 0,
      online: 0,
      responseTime: 0
    },
    customerStats: {
      total: 0,
      active: 0,
      new: 0,
      growth: 0,
      retention: 0
    },
    recentMessages: [],
    lastUpdated: null
  });

  // Fetch complete dashboard data using the new service
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching dashboard data from service...');
      
      // Use the comprehensive dashboard service method
      const data = await dashboardService.getDashboardData();
      
      console.log('✅ Dashboard data received:', data);
      
      setDashboardData(data);
      
      return { success: true, data };
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
      setError(err.message || 'Failed to fetch dashboard data');
      
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh specific dashboard metrics
  const refreshMetric = useCallback(async (metric) => {
    try {
      setRefreshing(true);
      
      console.log(`🔄 Refreshing ${metric} metric...`);
      
      const data = await dashboardService.refreshMetric(metric);
      
      // Update specific part of dashboard data based on metric
      setDashboardData(prev => {
        switch (metric) {
          case 'stats':
            return { ...prev, stats: { ...prev.stats, ...data.stats } };
          case 'orders':
            return { ...prev, recentOrders: data };
          case 'assistants':
            return { ...prev, assistantStats: data };
          case 'customers':
            return { ...prev, customerStats: data };
          case 'messages':
            return { ...prev, recentMessages: data };
          default:
            return prev;
        }
      });
      
      console.log(`✅ ${metric} metric refreshed successfully`);
      
      return { success: true, data };
    } catch (err) {
      console.error(`❌ Error refreshing ${metric} metric:`, err);
      return { success: false, error: err.message };
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Refresh all dashboard data
  const refreshDashboard = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      console.log('🔄 Refreshing complete dashboard...');
      
      const result = await fetchDashboardData();
      
      if (result.success) {
        console.log('✅ Dashboard refreshed successfully');
      }
      
      return result;
    } catch (err) {
      console.error('❌ Error refreshing dashboard:', err);
      setError(err.message || 'Failed to refresh dashboard');
      return { success: false, error: err.message };
    } finally {
      setRefreshing(false);
    }
  }, [fetchDashboardData]);

  // Initial data fetch on mount
  useEffect(() => {
    const initializeDashboard = async () => {
      console.log('🚀 Initializing dashboard...');
      
      // Always fetch dashboard data
      const dashboardResult = await fetchDashboardData();
      
      if (!dashboardResult.success) {
        console.error('❌ Failed to initialize dashboard');
      } else {
        console.log('✅ Dashboard initialized successfully');
      }
    };

    initializeDashboard();
  }, [fetchDashboardData]);

  // Auto-refresh dashboard data every 5 minutes (configurable via environment)
  useEffect(() => {
    // Check if auto-refresh is enabled (default to false for safety)
    const autoRefreshEnabled = window.REACT_APP_AUTO_REFRESH === 'true' || 
                              (typeof window !== 'undefined' && window.location.search.includes('autoRefresh=true'));
    
    if (autoRefreshEnabled) {
      const interval = setInterval(() => {
        console.log('🔄 Auto-refreshing dashboard...');
        refreshDashboard();
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [refreshDashboard]);

  // Computed values for backward compatibility and convenience
  const assistantStats = dashboardData.assistantStats;
  const customerStats = dashboardData.customerStats;
  
  // Enhanced order stats
  const orderStats = {
    total: dashboardData.recentOrders?.length || 0,
    pending: dashboardData.recentOrders?.filter(order => order?.status === 'pending')?.length || 0,
    completed: dashboardData.recentOrders?.filter(order => order?.status === 'completed')?.length || 0,
    processing: dashboardData.recentOrders?.filter(order => order?.status === 'processing')?.length || 0,
    cancelled: dashboardData.recentOrders?.filter(order => order?.status === 'cancelled')?.length || 0,
    totalValue: dashboardData.recentOrders?.reduce((sum, order) => sum + (order?.amount || 0), 0) || 0,
    averageValue: dashboardData.recentOrders?.length > 0 
      ? (dashboardData.recentOrders.reduce((sum, order) => sum + (order?.amount || 0), 0) / dashboardData.recentOrders.length)
      : 0
  };

  // Message stats
  const messageStats = {
    total: dashboardData.recentMessages?.length || 0,
    unread: dashboardData.recentMessages?.filter(msg => msg?.status === 'unread')?.length || 0,
    read: dashboardData.recentMessages?.filter(msg => msg?.status === 'read')?.length || 0,
    responded: dashboardData.recentMessages?.filter(msg => msg?.status === 'responded')?.length || 0
  };

  // Utility functions using the service layer utilities
  const formatCurrency = dashboardUtils.formatCurrency;
  const formatDate = dashboardUtils.formatDate;
  const formatRelativeTime = dashboardUtils.formatRelativeTime;
  const getStatusColor = dashboardUtils.getStatusColor;
  const calculatePercentageChange = dashboardUtils.calculatePercentageChange;

  // Health check function
  const checkSystemHealth = useCallback(async () => {
    try {
      const healthData = await dashboardService.getSystemHealth();
      return {
        success: true,
        data: healthData
      };
    } catch (err) {
      console.error('❌ System health check failed:', err);
      return {
        success: false,
        error: err.message
      };
    }
  }, []);

  // Data validation helpers
  const isDataStale = useCallback(() => {
    if (!dashboardData.lastUpdated) return true;
    
    const lastUpdate = new Date(dashboardData.lastUpdated);
    const now = new Date();
    const diffMinutes = (now - lastUpdate) / (1000 * 60);
    
    // Consider data stale after 10 minutes
    return diffMinutes > 10;
  }, [dashboardData.lastUpdated]);

  return {
    // Core data states
    dashboardData,
    loading,
    refreshing,
    error,
    
    // Computed stats for backward compatibility
    assistantStats,
    customerStats,
    orderStats,
    messageStats,
    
    // Main fetch methods
    fetchDashboardData,
    
    // Refresh methods
    refreshMetric,
    refreshDashboard,
    
    // Utility functions from service layer
    formatCurrency,
    formatDate,
    formatRelativeTime,
    getStatusColor,
    calculatePercentageChange,
    
    // System health
    checkSystemHealth,
    
    // Data validation
    isDataStale,
    
    // Direct state setters (for advanced usage if needed)
    setDashboardData,
    setLoading,
    setError,
    
    // Helper flags
    isInitialized: !loading && !!dashboardData.lastUpdated,
    hasError: !!error,
    hasData: !!dashboardData.stats && dashboardData.stats.totalCustomers >= 0,
    
    // Quick access to key metrics
    totalCustomers: dashboardData.stats.totalCustomers,
    totalOrders: dashboardData.stats.todayOrders,
    totalAssistants: dashboardData.stats.totalAssistants,
    activeChats: dashboardData.stats.activeChats,
    monthlyRevenue: dashboardData.stats.monthlyRevenue,
    
    // Status indicators
    isDashboardHealthy: !error && !loading && dashboardData.lastUpdated,
    needsRefresh: isDataStale()
  };
};

export default useDashboardData;