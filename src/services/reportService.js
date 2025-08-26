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
  static async getDashboardReports(dateRange = '30d', useCache = true) {
    const cacheKey = `dashboard_${dateRange}`;
    
    if (useCache) {
      const cached = cacheUtils.get(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await retryRequest(() => 
        apiClient.get('/reports/dashboard', {
          params: { dateRange }
        })
      );

      const data = response.data;
      
      if (useCache && data.success) {
        cacheUtils.set(cacheKey, data);
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch dashboard reports:', error);
      throw this.handleError(error);
    }
  }

  // Get revenue reports
  static async getRevenueReports(filters = {}) {
    const cacheKey = `revenue_${JSON.stringify(filters)}`;
    const cached = cacheUtils.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await retryRequest(() =>
        apiClient.get('/reports/revenue', {
          params: filters
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
  static async getPerformanceReports(filters = {}) {
    try {
      const response = await retryRequest(() =>
        apiClient.get('/reports/performance', {
          params: filters
        })
      );

      return response.data;
    } catch (error) {
      console.error('Failed to fetch performance reports:', error);
      throw this.handleError(error);
    }
  }

  // Get activity reports
  static async getActivityReports(filters = {}) {
    try {
      const response = await retryRequest(() =>
        apiClient.get('/reports/activity', {
          params: filters
        })
      );

      return response.data;
    } catch (error) {
      console.error('Failed to fetch activity reports:', error);
      throw this.handleError(error);
    }
  }

  // Get filtered reports data
  static async getFilteredReports(filters = {}) {
    try {
      const response = await retryRequest(() =>
        apiClient.post('/reports/filtered', filters)
      );

      return response.data;
    } catch (error) {
      console.error('Failed to fetch filtered reports:', error);
      throw this.handleError(error);
    }
  }

  // Export functionality
  static async exportReport(reportType, filters = {}, format = 'csv') {
    try {
      const response = await apiClient.post('/reports/export', {
        reportType,
        filters,
        format
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
      const response = await apiClient.get(`/reports/export/status/${exportId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get export status:', error);
      throw this.handleError(error);
    }
  }

  // Download exported file
  static async downloadExport(exportId, filename) {
    try {
      const response = await apiClient.get(`/reports/export/download/${exportId}`, {
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

  // Get summary statistics
  static async getSummaryStats(dateRange = '30d') {
    const cacheKey = `summary_${dateRange}`;
    const cached = cacheUtils.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await retryRequest(() =>
        apiClient.get('/reports/summary', {
          params: { dateRange }
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
  static async exportAndDownload(reportType, filters = {}, format = 'csv') {
    try {
      // Initiate export
      const exportResponse = await this.exportReport(reportType, filters, format);
      
      if (!exportResponse.success) {
        throw new Error(exportResponse.message || 'Failed to start export');
      }

      const { exportId } = exportResponse.data;

      // Poll for completion
      const statusResponse = await this.pollExportStatus(exportId);
      
      // Download file
      const filename = statusResponse.data.filename || `${reportType}_export.${format}`;
      await this.downloadExport(exportId, filename);

      return {
        success: true,
        message: 'Report exported and downloaded successfully',
        filename
      };
    } catch (error) {
      console.error('Export and download failed:', error);
      throw this.handleError(error);
    }
  }

  // Clear all report caches
  static clearCache() {
    cacheUtils.clear();
  }

  // Clear specific report cache
  static clearReportCache(reportType) {
    cacheUtils.clear(reportType);
  }

  // Error handling
  static handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return {
        success: false,
        message: data?.message || 'Server error occurred',
        status,
        details: data?.details || null
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        message: 'Network error - please check your connection',
        status: 0,
        details: 'No response received from server'
      };
    } else {
      // Other error
      return {
        success: false,
        message: error.message || 'An unexpected error occurred',
        status: null,
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

  // Health check
  static async healthCheck() {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      return { success: false, message: 'API health check failed' };
    }
  }
}

export default ReportService;