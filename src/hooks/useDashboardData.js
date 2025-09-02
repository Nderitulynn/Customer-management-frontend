import { useState, useEffect, useCallback } from 'react';
import { dashboardService, dashboardUtils } from '../services/dashboardService';

export const useDashboardData = () => {
  // Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Error states
  const [error, setError] = useState(null);
  const [serviceError, setServiceError] = useState(null);

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

  // Retry function for failed operations
  const retryOperation = useCallback(async (operation) => {
    try {
      return await dashboardService.retryOperation(operation);
    } catch (err) {
      console.error('❌ Retry operation failed:', err);
      throw err;
    }
  }, []);

  // Fetch complete dashboard data using the new service
  const fetchDashboardData = useCallback(async (skipRetry = false) => {
    const operation = async () => {
      try {
        setLoading(true);
        setError(null);
        setServiceError(null);
        
        console.log('🔄 Fetching dashboard data from service...');
        
        // Use the comprehensive dashboard service method
        const response = await dashboardService.getDashboardData();
        
        console.log('✅ Dashboard response received:', response);
        
        // Handle the flattened service response structure
        if (response.error) {
          // Service returned structured error (network, server, etc.)
          console.warn('⚠️ Service returned error:', response.error);
          setServiceError(response.error);
          
          // Use default data if provided in error response
          if (response.stats || response.recentOrders || response.assistantStats) {
            setDashboardData({
              stats: response.stats || dashboardData.stats,
              recentOrders: response.recentOrders || [],
              assistantStats: response.assistantStats || dashboardData.assistantStats,
              customerStats: response.customerStats || dashboardData.customerStats,
              recentMessages: response.recentMessages || [],
              lastUpdated: response.lastUpdated || null
            });
          }
          
          return { 
            success: false, 
            error: response.error,
            data: response,
            retryable: response.error.retryable
          };
        } else {
          // Success case - use flattened response structure directly
          setDashboardData({
            stats: response.stats || {},
            recentOrders: response.recentOrders || [],
            assistantStats: response.assistantStats || {},
            customerStats: response.customerStats || {},
            recentMessages: response.recentMessages || [],
            lastUpdated: response.lastUpdated || new Date().toISOString()
          });
          setServiceError(null);
          
          return { 
            success: true, 
            data: response,
            lastUpdated: response.lastUpdated
          };
        }
        
      } catch (err) {
        // Auth errors or other thrown errors
        console.error('❌ Error fetching dashboard data:', err);
        
        // Check if this is an auth error (will be caught by interceptor)
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.log('🔄 Authentication error - will be handled by interceptor');
          throw err; // Let auth interceptor handle it
        }
        
        setError(err.message || 'Failed to fetch dashboard data');
        return { success: false, error: err.message, retryable: false };
      } finally {
        setLoading(false);
      }
    };

    // Use retry mechanism for retryable errors
    if (!skipRetry) {
      try {
        return await retryOperation(operation);
      } catch (err) {
        return await operation(); // Fallback to single attempt
      }
    } else {
      return await operation();
    }
  }, [retryOperation]);

  // Refresh specific dashboard metrics
  const refreshMetric = useCallback(async (metric, skipRetry = false) => {
    const operation = async () => {
      try {
        setRefreshing(true);
        
        console.log(`🔄 Refreshing ${metric} metric...`);
        
        const response = await dashboardService.refreshMetric(metric);
        
        console.log(`✅ ${metric} refresh response:`, response);
        
        // Handle flattened service error response
        if (response.error) {
          console.warn(`⚠️ Service error refreshing ${metric}:`, response.error);
          setServiceError(response.error);
          
          // Still update with available data if present
          if (response.stats || response.recentOrders || response.assistantStats) {
            updateDashboardMetric(metric, response);
          }
          
          return { 
            success: false, 
            error: response.error,
            retryable: response.error.retryable
          };
        }
        
        // Success case - update specific part of dashboard data from flattened response
        updateDashboardMetric(metric, response);
        setServiceError(null);
        
        console.log(`✅ ${metric} metric refreshed successfully`);
        
        return { success: true, data: response };
        
      } catch (err) {
        console.error(`❌ Error refreshing ${metric} metric:`, err);
        
        // Check if this is an auth error
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.log('🔄 Authentication error - will be handled by interceptor');
          throw err; // Let auth interceptor handle it
        }
        
        return { success: false, error: err.message, retryable: false };
      } finally {
        setRefreshing(false);
      }
    };

    // Use retry mechanism for retryable errors
    if (!skipRetry) {
      try {
        return await retryOperation(operation);
      } catch (err) {
        return await operation(); // Fallback to single attempt
      }
    } else {
      return await operation();
    }
  }, [retryOperation]);

  // Helper function to update specific dashboard metrics - updated for flattened structure
  const updateDashboardMetric = useCallback((metric, data) => {
    setDashboardData(prev => {
      switch (metric) {
        case 'stats':
          return { ...prev, stats: { ...prev.stats, ...(data.stats || data) } };
        case 'orders':
          return { ...prev, recentOrders: Array.isArray(data.recentOrders) ? data.recentOrders : (Array.isArray(data) ? data : []) };
        case 'assistants':
          return { ...prev, assistantStats: { ...prev.assistantStats, ...(data.assistantStats || data) } };
        case 'customers':
          return { ...prev, customerStats: { ...prev.customerStats, ...(data.customerStats || data) } };
        case 'messages':
          return { ...prev, recentMessages: Array.isArray(data.recentMessages) ? data.recentMessages : (Array.isArray(data) ? data : []) };
        default:
          return prev;
      }
    });
  }, []);

  // Refresh all dashboard data
  const refreshDashboard = useCallback(async (skipRetry = false) => {
    try {
      setRefreshing(true);
      setError(null);
      setServiceError(null);
      
      console.log('🔄 Refreshing complete dashboard...');
      
      const result = await fetchDashboardData(skipRetry);
      
      if (result.success) {
        console.log('✅ Dashboard refreshed successfully');
      } else if (result.retryable) {
        console.log('⚠️ Dashboard refresh failed but is retryable');
      }
      
      return result;
    } catch (err) {
      console.error('❌ Error refreshing dashboard:', err);
      
      // Check if this is an auth error
      if (err.response?.status === 401 || err.response?.status === 403) {
        throw err; // Let auth interceptor handle it
      }
      
      setError(err.message || 'Failed to refresh dashboard');
      return { success: false, error: err.message, retryable: false };
    } finally {
      setRefreshing(false);
    }
  }, [fetchDashboardData]);

  // Retry last failed operation
  const retryLastOperation = useCallback(async () => {
    if (serviceError && serviceError.retryable) {
      console.log('🔄 Retrying last failed operation...');
      
      if (serviceError.operation?.includes('refresh')) {
        return await refreshDashboard(false);
      } else {
        return await fetchDashboardData(false);
      }
    }
    
    return { success: false, error: 'No retryable operation available' };
  }, [serviceError, refreshDashboard, fetchDashboardData]);

  // Initial data fetch on mount
  useEffect(() => {
    const initializeDashboard = async () => {
      console.log('🚀 Initializing dashboard...');
      
      try {
        const dashboardResult = await fetchDashboardData();
        
        if (!dashboardResult.success) {
          if (dashboardResult.retryable) {
            console.log('⚠️ Dashboard initialization failed but is retryable');
          } else {
            console.error('❌ Failed to initialize dashboard');
          }
        } else {
          console.log('✅ Dashboard initialized successfully');
        }
      } catch (err) {
        // Auth errors will be handled by interceptor
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.log('🔄 Auth error during initialization - handled by interceptor');
        } else {
          console.error('❌ Unexpected error during dashboard initialization:', err);
        }
      }
    };

    initializeDashboard();
  }, [fetchDashboardData]);

  // Auto-refresh dashboard data every 5 minutes (configurable via environment)
  useEffect(() => {
    // Check if auto-refresh is enabled (default to false for safety)
    const autoRefreshEnabled = window.REACT_APP_AUTO_REFRESH === 'true' || 
                              (typeof window !== 'undefined' && window.location.search.includes('autoRefresh=true'));
    
    if (autoRefreshEnabled && !serviceError) {
      const interval = setInterval(async () => {
        console.log('🔄 Auto-refreshing dashboard...');
        try {
          await refreshDashboard(true); // Skip retry on auto-refresh
        } catch (err) {
          console.log('⚠️ Auto-refresh failed, will try again next cycle');
        }
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [refreshDashboard, serviceError]);

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

  // Health check function - commented out if service doesn't support it
  const checkSystemHealth = useCallback(async () => {
    try {
      // Check if the service method exists before calling
      if (typeof dashboardService.getSystemHealth !== 'function') {
        console.warn('⚠️ System health check not available in service');
        return {
          success: false,
          error: { type: 'not_available', message: 'Health check endpoint not available' }
        };
      }

      const response = await dashboardService.getSystemHealth();
      
      if (response.error) {
        return {
          success: false,
          error: response.error,
          data: response
        };
      }
      
      return {
        success: true,
        data: response
      };
    } catch (err) {
      console.error('❌ System health check failed:', err);
      
      // Don't let auth errors break health check
      if (err.response?.status === 401 || err.response?.status === 403) {
        return {
          success: false,
          error: { type: 'auth', message: 'Authentication required for health check' }
        };
      }
      
      return {
        success: false,
        error: { type: 'unknown', message: err.message }
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

  // Error message helper
  const getErrorMessage = useCallback(() => {
    if (serviceError) {
      return dashboardUtils.getErrorMessage(serviceError);
    }
    if (error) {
      return error;
    }
    return null;
  }, [serviceError, error]);

  // Check if current error is retryable
  const canRetry = useCallback(() => {
    return serviceError?.retryable === true;
  }, [serviceError]);

  return {
    // Core data states
    dashboardData,
    loading,
    refreshing,
    error,
    serviceError,
    
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
    retryLastOperation,
    
    // Utility functions from service layer
    formatCurrency,
    formatDate,
    formatRelativeTime,
    getStatusColor,
    calculatePercentageChange,
    
    // Error handling utilities
    getErrorMessage,
    canRetry,
    
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
    hasError: !!error || !!serviceError,
    hasRetryableError: !!serviceError?.retryable,
    hasData: !!dashboardData.stats && dashboardData.stats.totalCustomers >= 0,
    
    // Quick access to key metrics
    totalCustomers: dashboardData.stats.totalCustomers,
    totalOrders: dashboardData.stats.todayOrders,
    totalAssistants: dashboardData.stats.totalAssistants,
    activeChats: dashboardData.stats.activeChats,
    monthlyRevenue: dashboardData.stats.monthlyRevenue,
    
    // Status indicators
    isDashboardHealthy: !error && !serviceError && !loading && dashboardData.lastUpdated,
    needsRefresh: isDataStale(),
    isRetryable: canRetry()
  };
};

export default useDashboardData;