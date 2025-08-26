// services/reportService.js
import axios from 'axios';

// HTTP client configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const CACHE_PREFIX = 'report_cache_';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Configure axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Data caching utilities
const cacheUtils = {
  set: (key, data, expiry = CACHE_EXPIRY) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        expiry
      };
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  },

  get: (key) => {
    try {
      const cached = localStorage.getItem(CACHE_PREFIX + key);
      if (!cached) return null;

      const { data, timestamp, expiry } = JSON.parse(cached);
      
      if (Date.now() - timestamp > expiry) {
        localStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  },

  clear: (pattern = '') => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX + pattern)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }
};

// Retry logic utility
const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt === maxRetries || error.response?.status < 500) {
        throw error;
      }
      
      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
};

// Main ReportService class
class ReportService {
  
  // Get dashboard reports with caching
  static async getDashboardReports(params = {}) {
    const { startDate, endDate, period = '30d', timezone = 'UTC' } = params;
    const cacheKey = `dashboard_${JSON.stringify({ startDate, endDate, period, timezone })}`;
    
    const cached = cacheUtils.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await retryRequest(() => 
        apiClient.get('/reports/dashboard', {
          params: { startDate, endDate, period, timezone }
        })
      );

      const data = response.data;
      
      if (data.success) {
        cacheUtils.set(cacheKey, data);
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch dashboard reports:', error);
      throw this.handleError(error);
    }
  }

  // Get summary statistics
  static async getSummaryStats(params = {}) {
    const { startDate, endDate, period = '30d', timezone = 'UTC' } = params;
    const cacheKey = `summary_${JSON.stringify({ startDate, endDate, period, timezone })}`;
    
    const cached = cacheUtils.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await retryRequest(() =>
        apiClient.get('/reports/summary', {
          params: { startDate, endDate, period, timezone }
        })
      );

      const data = response.data;
      if (data.success) {
        cacheUtils.set(cacheKey, data);
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch summary stats:', error);
      throw this.handleError(error);
    }
  }

  // Get revenue reports
  static async getRevenueReports(params = {}) {
    const { startDate, endDate, period, timezone = 'UTC', groupBy } = params;
    const cacheKey = `revenue_${JSON.stringify(params)}`;
    const cached = cacheUtils.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await retryRequest(() =>
        apiClient.get('/reports/revenue', {
          params: { startDate, endDate, period, timezone, groupBy }
        })
      );

      const data = response.data;
      if (data.success) {
        cacheUtils.set(cacheKey, data);
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch revenue reports:', error);
      throw this.handleError(error);
    }
  }

  // Get performance reports
  static async getPerformanceReports(params = {}) {
    const { startDate, endDate, period, timezone = 'UTC', assistantId } = params;
    
    try {
      const response = await retryRequest(() =>
        apiClient.get('/reports/performance', {
          params: { startDate, endDate, period, timezone, assistantId }
        })
      );

      return response.data;
    } catch (error) {
      console.error('Failed to fetch performance reports:', error);
      throw this.handleError(error);
    }
  }

  // Get activity reports
  static async getActivityReports(params = {}) {
    const { startDate, endDate, limit, offset } = params;
    
    try {
      const response = await retryRequest(() =>
        apiClient.get('/reports/activity', {
          params: { startDate, endDate, limit, offset }
        })
      );

      return response.data;
    } catch (error) {
      console.error('Failed to fetch activity reports:', error);
      throw this.handleError(error);
    }
  }

  // Get trend data for specific metrics
  static async getTrendData(type, params = {}) {
    const { startDate, endDate, interval = 'day' } = params;
    const cacheKey = `trends_${type}_${JSON.stringify(params)}`;
    const cached = cacheUtils.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await retryRequest(() =>
        apiClient.get(`/reports/trends/${type}`, {
          params: { startDate, endDate, interval }
        })
      );

      const data = response.data;
      if (data.success) {
        cacheUtils.set(cacheKey, data);
      }

      return data;
    } catch (error) {
      console.error(`Failed to fetch trend data for ${type}:`, error);
      throw this.handleError(error);
    }
  }

  // Get business metrics and ratios
  static async getBusinessMetrics(params = {}) {
    const { startDate, endDate, period = '30d', timezone = 'UTC' } = params;
    const cacheKey = `metrics_${JSON.stringify(params)}`;
    const cached = cacheUtils.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await retryRequest(() =>
        apiClient.get('/reports/metrics', {
          params: { startDate, endDate, period, timezone }
        })
      );

      const data = response.data;
      if (data.success) {
        cacheUtils.set(cacheKey, data);
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch business metrics:', error);
      throw this.handleError(error);
    }
  }

  // Generate custom reports
  static async generateCustomReport(reportConfig) {
    try {
      const response = await retryRequest(() =>
        apiClient.post('/reports/custom', reportConfig)
      );

      return response.data;
    } catch (error) {
      console.error('Failed to generate custom report:', error);
      throw this.handleError(error);
    }
  }

  // Export functionality
  static async exportReport(exportConfig) {
    const { reportType, format = 'csv', startDate, endDate, filters = {} } = exportConfig;
    
    try {
      const response = await apiClient.post('/reports/export', {
        reportType,
        format,
        startDate,
        endDate,
        filters
      });

      return response.data;
    } catch (error) {
      console.error('Failed to initiate report export:', error);
      throw this.handleError(error);
    }
  }

  // Check export status
  static async getExportStatus(exportId) {
    try {
      const response = await apiClient.get(`/reports/status/${exportId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get export status:', error);
      throw this.handleError(error);
    }
  }

  // Download exported file
  static async downloadExport(exportId, filename) {
    try {
      const response = await apiClient.get(`/reports/download/${exportId}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'File downloaded successfully' };
    } catch (error) {
      console.error('Failed to download export:', error);
      throw this.handleError(error);
    }
  }

  // Delete export file
  static async deleteExport(exportId) {
    try {
      const response = await apiClient.delete(`/reports/export/${exportId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete export:', error);
      throw this.handleError(error);
    }
  }

  // Get available report filters
  static async getReportFilters() {
    const cacheKey = 'report_filters';
    const cached = cacheUtils.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await retryRequest(() =>
        apiClient.get('/reports/filters')
      );

      const data = response.data;
      if (data.success) {
        // Cache filters for longer since they don't change often
        cacheUtils.set(cacheKey, data, 30 * 60 * 1000); // 30 minutes
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch report filters:', error);
      throw this.handleError(error);
    }
  }

  // Poll export status until completion
  static async pollExportStatus(exportId, maxAttempts = 30) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const status = await this.getExportStatus(exportId);
        
        if (status.data?.status === 'completed') {
          return status;
        }
        
        if (status.data?.status === 'failed') {
          throw new Error(status.data.error || 'Export failed');
        }

        // Wait 2 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Export polling attempt ${attempt + 1} failed:`, error);
        if (attempt === maxAttempts - 1) throw error;
      }
    }
    
    throw new Error('Export timeout - please check status manually');
  }

  // Complete export workflow
  static async exportAndDownload(exportConfig) {
    try {
      // Initiate export
      const exportResponse = await this.exportReport(exportConfig);
      
      if (!exportResponse.success) {
        throw new Error(exportResponse.message || 'Failed to start export');
      }

      const { exportId } = exportResponse.data;

      // Poll for completion
      const statusResponse = await this.pollExportStatus(exportId);
      
      // Download file
      const filename = statusResponse.data.filename || 
        `${exportConfig.reportType}_export.${exportConfig.format || 'csv'}`;
      await this.downloadExport(exportId, filename);

      return {
        success: true,
        message: 'Report exported and downloaded successfully',
        filename,
        exportId
      };
    } catch (error) {
      console.error('Export and download failed:', error);
      throw this.handleError(error);
    }
  }

  // Clear report cache on backend
  static async clearReportCache() {
    try {
      const response = await apiClient.get('/reports/cache/clear');
      return response.data;
    } catch (error) {
      console.error('Failed to clear report cache:', error);
      throw this.handleError(error);
    }
  }

  // Get report system health
  static async getReportSystemHealth() {
    try {
      const response = await apiClient.get('/reports/health');
      return response.data;
    } catch (error) {
      console.error('Failed to get report system health:', error);
      return { success: false, message: 'Report system health check failed' };
    }
  }

  // Clear local caches
  static clearLocalCache() {
    cacheUtils.clear();
  }

  // Clear specific report cache
  static clearSpecificCache(reportType) {
    cacheUtils.clear(reportType);
  }

  // Error handling
  static handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return {
        success: false,
        message: data?.error || data?.message || 'Server error occurred',
        status,
        code: data?.code || null,
        details: data?.details || null
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        message: 'Network error - please check your connection',
        status: 0,
        code: 'NETWORK_ERROR',
        details: 'No response received from server'
      };
    } else {
      // Other error
      return {
        success: false,
        message: error.message || 'An unexpected error occurred',
        status: null,
        code: 'UNKNOWN_ERROR',
        details: error.toString()
      };
    }
  }

  // Batch request utility
  static async batchRequests(requests, concurrency = 3) {
    const results = [];
    
    for (let i = 0; i < requests.length; i += concurrency) {
      const batch = requests.slice(i, i + concurrency);
      const batchResults = await Promise.allSettled(
        batch.map(request => request())
      );
      results.push(...batchResults);
    }

    return results;
  }

  // Get multiple report types at once
  static async getMultipleReports(reportConfigs) {
    const requests = reportConfigs.map(config => {
      switch (config.type) {
        case 'dashboard':
          return () => this.getDashboardReports(config.params);
        case 'summary':
          return () => this.getSummaryStats(config.params);
        case 'revenue':
          return () => this.getRevenueReports(config.params);
        case 'performance':
          return () => this.getPerformanceReports(config.params);
        case 'activity':
          return () => this.getActivityReports(config.params);
        case 'trends':
          return () => this.getTrendData(config.trendType, config.params);
        case 'metrics':
          return () => this.getBusinessMetrics(config.params);
        default:
          return () => Promise.reject(new Error(`Unknown report type: ${config.type}`));
      }
    });

    return this.batchRequests(requests);
  }

  // Health check (legacy support)
  static async healthCheck() {
    return this.getReportSystemHealth();
  }
}

export default ReportService;