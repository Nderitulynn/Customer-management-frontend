// utils/reportUtils.js
import { format, parseISO, startOfDay, endOfDay, subDays, subMonths, subYears } from 'date-fns';

// Date formatting utilities
export const dateUtils = {
  // Format date for display
  formatDate: (date, formatString = 'MMM dd, yyyy') => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString);
  },

  // Format date for API requests
  formatDateForAPI: (date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'yyyy-MM-dd');
  },

  // Format date for chart labels
  formatChartLabel: (date, interval = 'day') => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    switch (interval) {
      case 'hour':
        return format(dateObj, 'HH:mm');
      case 'day':
        return format(dateObj, 'MMM dd');
      case 'week':
        return format(dateObj, 'MMM dd');
      case 'month':
        return format(dateObj, 'MMM yyyy');
      case 'quarter':
        return format(dateObj, 'QQQ yyyy');
      case 'year':
        return format(dateObj, 'yyyy');
      default:
        return format(dateObj, 'MMM dd');
    }
  },

  // Get date range from preset
  getDateRangeFromPreset: (preset) => {
    const now = new Date();
    const ranges = {
      '7d': {
        startDate: startOfDay(subDays(now, 6)),
        endDate: endOfDay(now),
        label: 'Last 7 days'
      },
      '30d': {
        startDate: startOfDay(subDays(now, 29)),
        endDate: endOfDay(now),
        label: 'Last 30 days'
      },
      '90d': {
        startDate: startOfDay(subDays(now, 89)),
        endDate: endOfDay(now),
        label: 'Last 90 days'
      },
      '6m': {
        startDate: startOfDay(subMonths(now, 6)),
        endDate: endOfDay(now),
        label: 'Last 6 months'
      },
      '1y': {
        startDate: startOfDay(subYears(now, 1)),
        endDate: endOfDay(now),
        label: 'Last year'
      }
    };
    
    return ranges[preset] || ranges['30d'];
  },

  // Format relative time
  formatRelativeTime: (date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return format(dateObj, 'MMM dd, yyyy');
  }
};

// Chart color schemes and configurations
export const chartConfig = {
  // Color palettes
  colors: {
    primary: ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a'],
    success: ['#10b981', '#059669', '#047857', '#065f46'],
    warning: ['#f59e0b', '#d97706', '#b45309', '#92400e'],
    danger: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b'],
    neutral: ['#6b7280', '#4b5563', '#374151', '#1f2937'],
    rainbow: [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
      '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
    ]
  },

  // Chart default configurations
  defaults: {
    line: {
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: false
    },
    bar: {
      borderWidth: 0,
      borderRadius: 4,
      maxBarThickness: 40
    },
    pie: {
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverBorderWidth: 3
    },
    area: {
      tension: 0.4,
      borderWidth: 2,
      fill: 'origin',
      backgroundColor: 'rgba(59, 130, 246, 0.1)'
    }
  },

  // Chart options templates
  options: {
    responsive: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        }
      }
    },
    minimal: {
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      },
      scales: {
        x: { display: false },
        y: { display: false }
      }
    }
  },

  // Get color by index
  getColor: (index, palette = 'rainbow') => {
    const colors = chartConfig.colors[palette] || chartConfig.colors.rainbow;
    return colors[index % colors.length];
  },

  // Get gradient colors
  getGradientColors: (baseColor, opacity = [0.8, 0.1]) => {
    return {
      start: baseColor,
      end: baseColor.replace('rgb', 'rgba').replace(')', `, ${opacity[1]})`),
      middle: baseColor.replace('rgb', 'rgba').replace(')', `, ${opacity[0]})`)
    };
  }
};

// Data transformation helpers
export const dataTransforms = {
  // Transform API data to chart format
  toLineChart: (data, xField = 'date', yField = 'value', label = 'Data') => {
    return {
      labels: data.map(item => item[xField]),
      datasets: [{
        label,
        data: data.map(item => item[yField]),
        borderColor: chartConfig.getColor(0),
        backgroundColor: chartConfig.getColor(0),
        ...chartConfig.defaults.line
      }]
    };
  },

  toBarChart: (data, xField = 'category', yField = 'value', label = 'Data') => {
    return {
      labels: data.map(item => item[xField]),
      datasets: [{
        label,
        data: data.map(item => item[yField]),
        backgroundColor: data.map((_, index) => chartConfig.getColor(index)),
        ...chartConfig.defaults.bar
      }]
    };
  },

  toPieChart: (data, labelField = 'label', valueField = 'value') => {
    return {
      labels: data.map(item => item[labelField]),
      datasets: [{
        data: data.map(item => item[valueField]),
        backgroundColor: data.map((_, index) => chartConfig.getColor(index)),
        ...chartConfig.defaults.pie
      }]
    };
  },

  toMultiSeriesChart: (data, series, xField = 'date') => {
    return {
      labels: data.map(item => item[xField]),
      datasets: series.map((serie, index) => ({
        label: serie.label,
        data: data.map(item => item[serie.field]),
        borderColor: chartConfig.getColor(index),
        backgroundColor: chartConfig.getColor(index),
        ...chartConfig.defaults.line
      }))
    };
  },

  // Group data by field
  groupBy: (data, field) => {
    return data.reduce((acc, item) => {
      const key = item[field];
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  },

  // Aggregate data
  aggregate: (data, field, operation = 'sum') => {
    if (!data.length) return 0;
    
    const values = data.map(item => Number(item[field]) || 0);
    
    switch (operation) {
      case 'sum':
        return values.reduce((acc, val) => acc + val, 0);
      case 'avg':
        return values.reduce((acc, val) => acc + val, 0) / values.length;
      case 'max':
        return Math.max(...values);
      case 'min':
        return Math.min(...values);
      case 'count':
        return values.length;
      default:
        return 0;
    }
  },

  // Calculate percentage change
  calculateChange: (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  },

  // Format large numbers
  formatNumber: (value, precision = 1) => {
    if (value >= 1000000000) {
      return (value / 1000000000).toFixed(precision) + 'B';
    }
    if (value >= 1000000) {
      return (value / 1000000).toFixed(precision) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(precision) + 'K';
    }
    return value.toString();
  },

  // Format currency
  formatCurrency: (value, currency = 'USD', locale = 'en-US') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  },

  // Format percentage
  formatPercentage: (value, precision = 1) => {
    return `${value.toFixed(precision)}%`;
  }
};

// Export file naming conventions
export const exportUtils = {
  // Generate filename for export
  generateFilename: (reportType, format = 'csv', options = {}) => {
    const {
      dateRange = '30d',
      includeTimestamp = true,
      prefix = 'report',
      suffix = ''
    } = options;

    const timestamp = includeTimestamp 
      ? format(new Date(), 'yyyy-MM-dd-HHmm')
      : format(new Date(), 'yyyy-MM-dd');

    const parts = [
      prefix,
      reportType.toLowerCase().replace(/\s+/g, '-'),
      dateRange,
      suffix,
      timestamp
    ].filter(Boolean);

    return `${parts.join('_')}.${format}`;
  },

  // Get MIME type for export format
  getMimeType: (format) => {
    const mimeTypes = {
      csv: 'text/csv',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pdf: 'application/pdf',
      json: 'application/json',
      xml: 'application/xml'
    };
    return mimeTypes[format.toLowerCase()] || 'application/octet-stream';
  },

  // Sanitize filename
  sanitizeFilename: (filename) => {
    return filename
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase();
  },

  // Generate export metadata
  generateMetadata: (reportType, filters, recordCount) => {
    return {
      exportDate: new Date().toISOString(),
      reportType,
      filters,
      recordCount,
      generatedBy: 'Admin Dashboard',
      version: '1.0'
    };
  }
};

// Common report configurations
export const reportConfigs = {
  dashboard: {
    title: 'Dashboard Overview',
    refreshInterval: 300000, // 5 minutes
    autoRefresh: true,
    charts: ['revenue', 'orders', 'performance']
  },
  revenue: {
    title: 'Revenue Reports',
    refreshInterval: 600000, // 10 minutes
    autoRefresh: false,
    charts: ['line', 'bar', 'pie']
  },
  performance: {
    title: 'Performance Analytics',
    refreshInterval: 180000, // 3 minutes
    autoRefresh: true,
    charts: ['line', 'multiline']
  },
  activity: {
    title: 'Activity Reports',
    refreshInterval: 60000, // 1 minute
    autoRefresh: true,
    charts: ['timeline', 'bar']
  }
};

// Validation utilities
export const validators = {
  isValidDateRange: (startDate, endDate) => {
    if (!startDate || !endDate) return false;
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    return start <= end;
  },

  isValidNumber: (value) => {
    return !isNaN(value) && isFinite(value);
  },

  isValidReportType: (type) => {
    const validTypes = ['dashboard', 'revenue', 'performance', 'activity', 'summary'];
    return validTypes.includes(type.toLowerCase());
  }
};

// Default export with all utilities
const reportUtils = {
  dateUtils,
  chartConfig,
  dataTransforms,
  exportUtils,
  reportConfigs,
  validators
};

export default reportUtils;