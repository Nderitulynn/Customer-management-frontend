import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  Calendar,
  Download,
  Maximize2,
  Minimize2,
  RefreshCw,
  Filter,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Activity
} from 'lucide-react';

const MetricsChart = ({
  data = [],
  type = 'line', // 'line', 'area', 'bar', 'pie'
  title,
  subtitle,
  height = 400,
  loading = false,
  error = null,
  onRefresh,
  onExport,
  showDateRange = true,
  showControls = true,
  dateRange = { start: null, end: null },
  onDateRangeChange,
  xAxisKey = 'date',
  yAxisKey = 'value',
  additionalLines = [], // For multi-line charts
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'],
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  animate = true,
  className = '',
  customTooltip,
  formatters = {},
  thresholds = [], // Reference lines for targets/alerts
  ...props
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('7d');
  const [chartData, setChartData] = useState([]);

  // Date range options
  const dateRangeOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' },
    { value: 'custom', label: 'Custom' }
  ];

  // Chart type options
  const chartTypeOptions = [
    { value: 'line', label: 'Line', icon: Activity },
    { value: 'area', label: 'Area', icon: TrendingUp },
    { value: 'bar', label: 'Bar', icon: BarChart3 },
    { value: 'pie', label: 'Pie', icon: PieIcon }
  ];

  // Process and filter data based on date range
  useEffect(() => {
    let processedData = [...data];
    
    if (dateRange.start && dateRange.end) {
      processedData = data.filter(item => {
        const itemDate = new Date(item[xAxisKey]);
        return itemDate >= new Date(dateRange.start) && itemDate <= new Date(dateRange.end);
      });
    }
    
    setChartData(processedData);
  }, [data, dateRange, xAxisKey]);

  // Default formatters
  const defaultFormatters = {
    value: (value) => typeof value === 'number' ? value.toLocaleString() : value,
    currency: (value) => `$${value?.toLocaleString() || '0'}`,
    percentage: (value) => `${value}%`,
    date: (value) => new Date(value).toLocaleDateString(),
    ...formatters
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900 mb-2">
          {defaultFormatters.date ? defaultFormatters.date(label) : label}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium text-gray-900">
              {defaultFormatters[entry.dataKey] ? 
                defaultFormatters[entry.dataKey](entry.value) : 
                defaultFormatters.value(entry.value)
              }
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Handle date range change
  const handleDateRangeChange = (range) => {
    setSelectedDateRange(range);
    if (range !== 'custom' && onDateRangeChange) {
      const now = new Date();
      let start = new Date(now);
      
      switch (range) {
        case '7d':
          start.setDate(now.getDate() - 7);
          break;
        case '30d':
          start.setDate(now.getDate() - 30);
          break;
        case '90d':
          start.setDate(now.getDate() - 90);
          break;
        case '1y':
          start.setFullYear(now.getFullYear() - 1);
          break;
        default:
          start = null;
      }
      
      onDateRangeChange({ start, end: now });
    }
  };

  // Render chart based on type
  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-lg font-medium mb-2">Unable to load chart</p>
          <p className="text-sm">{error}</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      );
    }

    if (!chartData || chartData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <div className="text-6xl mb-4">📈</div>
          <p className="text-lg font-medium mb-2">No data available</p>
          <p className="text-sm">Check your date range or data source</p>
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            {showTooltip && <Tooltip content={customTooltip || <CustomTooltip />} />}
            {showLegend && <Legend />}
            
            {/* Main line */}
            <Line
              type="monotone"
              dataKey={yAxisKey}
              stroke={colors[0]}
              strokeWidth={2}
              dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              animationDuration={animate ? 1000 : 0}
            />
            
            {/* Additional lines */}
            {additionalLines.map((line, index) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={colors[(index + 1) % colors.length]}
                strokeWidth={2}
                dot={{ fill: colors[(index + 1) % colors.length], strokeWidth: 2, r: 4 }}
                name={line.name || line.key}
                animationDuration={animate ? 1000 : 0}
              />
            ))}
            
            {/* Threshold lines */}
            {thresholds.map((threshold, index) => (
              <ReferenceLine
                key={index}
                y={threshold.value}
                stroke={threshold.color || '#EF4444'}
                strokeDasharray="5 5"
                label={threshold.label}
              />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            {showTooltip && <Tooltip content={customTooltip || <CustomTooltip />} />}
            {showLegend && <Legend />}
            
            <Area
              type="monotone"
              dataKey={yAxisKey}
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.3}
              strokeWidth={2}
              animationDuration={animate ? 1000 : 0}
            />
            
            {additionalLines.map((line, index) => (
              <Area
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={colors[(index + 1) % colors.length]}
                fill={colors[(index + 1) % colors.length]}
                fillOpacity={0.3}
                strokeWidth={2}
                name={line.name || line.key}
                animationDuration={animate ? 1000 : 0}
              />
            ))}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            {showTooltip && <Tooltip content={customTooltip || <CustomTooltip />} />}
            {showLegend && <Legend />}
            
            <Bar
              dataKey={yAxisKey}
              fill={colors[0]}
              radius={[4, 4, 0, 0]}
              animationDuration={animate ? 1000 : 0}
            />
            
            {additionalLines.map((line, index) => (
              <Bar
                key={line.key}
                dataKey={line.key}
                fill={colors[(index + 1) % colors.length]}
                radius={[4, 4, 0, 0]}
                name={line.name || line.key}
                animationDuration={animate ? 1000 : 0}
              />
            ))}
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={yAxisKey}
              animationDuration={animate ? 1000 : 0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
          </PieChart>
        );

      default:
        return <div>Unsupported chart type: {type}</div>;
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          
          {showControls && (
            <div className="flex items-center space-x-2">
              {/* Date Range Selector */}
              {showDateRange && (
                <select
                  value={selectedDateRange}
                  onChange={(e) => handleDateRangeChange(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white"
                >
                  {dateRangeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              
              {/* Refresh Button */}
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                  title="Refresh data"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
              
              {/* Export Button */}
              {onExport && (
                <button
                  onClick={onExport}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                  title="Export chart"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
              
              {/* Expand/Collapse Button */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chart Container */}
      <div 
        className="p-6"
        style={{ height: isExpanded ? height * 1.5 : height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Preset chart configurations
export const presetCharts = {
  revenue: {
    title: 'Revenue Overview',
    type: 'area',
    yAxisKey: 'revenue',
    formatters: {
      revenue: (value) => `$${value?.toLocaleString() || '0'}`
    },
    colors: ['#10B981', '#059669']
  },
  orders: {
    title: 'Orders Trend',
    type: 'line',
    yAxisKey: 'orders',
    formatters: {
      orders: (value) => value?.toLocaleString() || '0'
    },
    colors: ['#3B82F6', '#1D4ED8']
  },
  customers: {
    title: 'Customer Growth',
    type: 'area',
    yAxisKey: 'customers',
    formatters: {
      customers: (value) => value?.toLocaleString() || '0'
    },
    colors: ['#8B5CF6', '#7C3AED']
  },
  performance: {
    title: 'Performance Metrics',
    type: 'bar',
    yAxisKey: 'value',
    colors: ['#F59E0B', '#D97706', '#92400E']
  }
};

// Quick preset chart component
export const PresetChart = ({ preset, ...props }) => {
  const config = presetCharts[preset];
  if (!config) {
    console.warn(`Chart preset "${preset}" not found. Available presets:`, Object.keys(presetCharts));
    return <MetricsChart {...props} />;
  }
  
  return <MetricsChart {...config} {...props} />;
};

export default MetricsChart;