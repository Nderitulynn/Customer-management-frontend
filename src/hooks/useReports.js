// hooks/useReports.js
import { useState, useEffect, useCallback, useRef } from 'react';
import ReportService from '../services/reportService';

// Default filter and date range values
const DEFAULT_FILTERS = {
  dateRange: '30d',
  status: '',
  category: '',
  assistantId: '',
  customerId: ''
};

const DEFAULT_DATE_RANGE = {
  startDate: null,
  endDate: null,
  preset: '30d'
};

/**
 * Custom React hook for comprehensive report data management
 */
const useReports = (initialFilters = {}, options = {}) => {
  const {
    autoRefresh = false,
    refreshInterval = 300000, // 5 minutes
    enablePolling = false,
    pollInterval = 30000, // 30 seconds
    cacheResults = true
  } = options;

  // State management
  const [data, setData] = useState({
    dashboard: null,
    revenue: null,
    performance: null,
    activity: null,
    summary: null
  });

  const [loading, setLoading] = useState({
    dashboard: false,
    revenue: false,
    performance: false,
    activity: false,
    summary: false,
    export: false
  });

  const [errors, setErrors] = useState({
    dashboard: null,
    revenue: null,
    performance: null,
    activity: null,
    summary: null,
    export: null
  });

  const [success, setSuccess] = useState({
    dashboard: false,
    revenue: false,
    performance: false,
    activity: false,
    summary: false,
    export: false
  });

  // Filter and date range management
  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    ...initialFilters
  });

  const [dateRange, setDateRange] = useState(DEFAULT_DATE_RANGE);

  // Export management
  const [exportStatus, setExportStatus] = useState({
    isExporting: false,
    progress: 0,
    exportId: null,
    filename: null
  });

  // Refs for intervals and cleanup
  const refreshIntervalRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const abortControllerRef = useRef(new AbortController());

  // Utility functions
  const setLoadingState = useCallback((reportType, isLoading) => {
    setLoading(prev => ({ ...prev, [reportType]: isLoading }));
  }, []);

  const setErrorState = useCallback((reportType, error) => {
    setErrors(prev => ({ ...prev, [reportType]: error }));
    setSuccess(prev => ({ ...prev, [reportType]: false }));
  }, []);

  const setSuccessState = useCallback((reportType, isSuccess = true) => {
    setSuccess(prev => ({ ...prev, [reportType]: isSuccess }));
    setErrors(prev => ({ ...prev, [reportType]: null }));
  }, []);

  const setDataState = useCallback((reportType, reportData) => {
    setData(prev => ({ ...prev, [reportType]: reportData }));
  }, []);

  // Main data fetching functions
  const fetchDashboardReports = useCallback(async (customFilters = {}) => {
    const reportType = 'dashboard';
    setLoadingState(reportType, true);

    try {
      const mergedFilters = { ...filters, ...customFilters };
      const response = await ReportService.getDashboardReports(
        mergedFilters.dateRange, 
        cacheResults
      );

      if (response.success) {
        setDataState(reportType, response.data);
        setSuccessState(reportType);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setErrorState(reportType, error.message || 'Failed to fetch dashboard reports');
    } finally {
      setLoadingState(reportType, false);
    }
  }, [filters, cacheResults, setLoadingState, setErrorState, setSuccessState, setDataState]);

  const fetchRevenueReports = useCallback(async (customFilters = {}) => {
    const reportType = 'revenue';
    setLoadingState(reportType, true);

    try {
      const mergedFilters = { ...filters, ...customFilters };
      const response = await ReportService.getRevenueReports(mergedFilters);

      if (response.success) {
        setDataState(reportType, response.data);
        setSuccessState(reportType);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setErrorState(reportType, error.message || 'Failed to fetch revenue reports');
    } finally {
      setLoadingState(reportType, false);
    }
  }, [filters, setLoadingState, setErrorState, setSuccessState, setDataState]);

  const fetchPerformanceReports = useCallback(async (customFilters = {}) => {
    const reportType = 'performance';
    setLoadingState(reportType, true);

    try {
      const mergedFilters = { ...filters, ...customFilters };
      const response = await ReportService.getPerformanceReports(mergedFilters);

      if (response.success) {
        setDataState(reportType, response.data);
        setSuccessState(reportType);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setErrorState(reportType, error.message || 'Failed to fetch performance reports');
    } finally {
      setLoadingState(reportType, false);
    }
  }, [filters, setLoadingState, setErrorState, setSuccessState, setDataState]);

  const fetchActivityReports = useCallback(async (customFilters = {}) => {
    const reportType = 'activity';
    setLoadingState(reportType, true);

    try {
      const mergedFilters = { ...filters, ...customFilters };
      const response = await ReportService.getActivityReports(mergedFilters);

      if (response.success) {
        setDataState(reportType, response.data);
        setSuccessState(reportType);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setErrorState(reportType, error.message || 'Failed to fetch activity reports');
    } finally {
      setLoadingState(reportType, false);
    }
  }, [filters, setLoadingState, setErrorState, setSuccessState, setDataState]);

  const fetchSummaryStats = useCallback(async (customFilters = {}) => {
    const reportType = 'summary';
    setLoadingState(reportType, true);

    try {
      const mergedFilters = { ...filters, ...customFilters };
      const response = await ReportService.getSummaryStats(mergedFilters.dateRange);

      if (response.success) {
        setDataState(reportType, response.data);
        setSuccessState(reportType);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setErrorState(reportType, error.message || 'Failed to fetch summary stats');
    } finally {
      setLoadingState(reportType, false);
    }
  }, [filters, setLoadingState, setErrorState, setSuccessState, setDataState]);

  // Batch fetch all reports
  const fetchAllReports = useCallback(async (customFilters = {}) => {
    const promises = [
      fetchDashboardReports(customFilters),
      fetchRevenueReports(customFilters),
      fetchPerformanceReports(customFilters),
      fetchActivityReports(customFilters),
      fetchSummaryStats(customFilters)
    ];

    await Promise.allSettled(promises);
  }, [fetchDashboardReports, fetchRevenueReports, fetchPerformanceReports, fetchActivityReports, fetchSummaryStats]);

  // Filter management
  const updateFilters = useCallback((newFilters, shouldRefetch = true) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      if (shouldRefetch) {
        // Clear cache when filters change
        ReportService.clearCache();
        fetchAllReports(updated);
      }
      return updated;
    });
  }, [fetchAllReports]);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setDateRange(DEFAULT_DATE_RANGE);
    ReportService.clearCache();
    fetchAllReports(DEFAULT_FILTERS);
  }, [fetchAllReports]);

  // Date range management
  const updateDateRange = useCallback((newDateRange, shouldRefetch = true) => {
    setDateRange(prev => ({ ...prev, ...newDateRange }));
    
    if (shouldRefetch) {
      const updatedFilters = {
        ...filters,
        dateRange: newDateRange.preset || 'custom'
      };
      updateFilters(updatedFilters, true);
    }
  }, [filters, updateFilters]);

  const setPresetDateRange = useCallback((preset) => {
    const presetRange = {
      startDate: null,
      endDate: null,
      preset
    };
    updateDateRange(presetRange, true);
  }, [updateDateRange]);

  // Export functionality
  const exportReport = useCallback(async (reportType, format = 'csv') => {
    setExportStatus(prev => ({ ...prev, isExporting: true, progress: 0 }));
    setLoadingState('export', true);

    try {
      const response = await ReportService.exportAndDownload(reportType, filters, format);
      
      if (response.success) {
        setExportStatus({
          isExporting: false,
          progress: 100,
          exportId: null,
          filename: response.filename
        });
        setSuccessState('export');
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setErrorState('export', error.message || 'Export failed');
      setExportStatus(prev => ({ ...prev, isExporting: false, progress: 0 }));
    } finally {
      setLoadingState('export', false);
    }
  }, [filters, setLoadingState, setErrorState, setSuccessState]);

  // Refresh and polling logic
  const refresh = useCallback(() => {
    ReportService.clearCache();
    fetchAllReports();
  }, [fetchAllReports]);

  const startAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    refreshIntervalRef.current = setInterval(() => {
      fetchAllReports();
    }, refreshInterval);
  }, [fetchAllReports, refreshInterval]);

  const stopAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    pollIntervalRef.current = setInterval(() => {
      fetchSummaryStats(); // Poll summary for real-time updates
    }, pollInterval);
  }, [fetchSummaryStats, pollInterval]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Effects
  useEffect(() => {
    // Initial data fetch
    fetchAllReports();

    return () => {
      // Cleanup
      abortControllerRef.current.abort();
      stopAutoRefresh();
      stopPolling();
    };
  }, []); // Only run once on mount

  useEffect(() => {
    if (autoRefresh) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }

    return stopAutoRefresh;
  }, [autoRefresh, startAutoRefresh, stopAutoRefresh]);

  useEffect(() => {
    if (enablePolling) {
      startPolling();
    } else {
      stopPolling();
    }

    return stopPolling;
  }, [enablePolling, startPolling, stopPolling]);

  // Computed values
  const isAnyLoading = Object.values(loading).some(Boolean);
  const hasAnyError = Object.values(errors).some(Boolean);
  const isAllSuccess = Object.values(success).every(Boolean);

  return {
    // Data
    data,
    loading,
    errors,
    success,
    
    // Computed states
    isAnyLoading,
    hasAnyError,
    isAllSuccess,
    
    // Filter and date management
    filters,
    dateRange,
    updateFilters,
    resetFilters,
    updateDateRange,
    setPresetDateRange,
    
    // Data fetching functions
    fetchDashboardReports,
    fetchRevenueReports,
    fetchPerformanceReports,
    fetchActivityReports,
    fetchSummaryStats,
    fetchAllReports,
    refresh,
    
    // Export functionality
    exportReport,
    exportStatus,
    
    // Auto-refresh and polling controls
    startAutoRefresh,
    stopAutoRefresh,
    startPolling,
    stopPolling,
    
    // Utility functions
    clearCache: ReportService.clearCache,
    clearReportCache: ReportService.clearReportCache
  };
};

export default useReports;