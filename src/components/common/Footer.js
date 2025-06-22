import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Shield, 
  Globe, 
  Server, 
  Clock, 
  Users, 
  Activity, 
  Info,
  ExternalLink,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Footer = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [systemStatus, setSystemStatus] = useState('online');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [buildInfo] = useState({
    version: '2.1.4',
    buildDate: '2024-12-15',
    environment: process.env.NODE_ENV || 'development',
    commitHash: 'a3f7b9c'
  });

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Simulate system status check
  useEffect(() => {
    const checkSystemStatus = () => {
      // In a real app, this would make an API call to check system health
      const statuses = ['online', 'maintenance', 'degraded'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setSystemStatus('online'); // Keep online for demo
    };

    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 300000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'text-green-500';
      case 'maintenance':
        return 'text-yellow-500';
      case 'degraded':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return 'All systems operational';
      case 'maintenance':
        return 'Scheduled maintenance';
      case 'degraded':
        return 'Experiencing issues';
      default:
        return 'Status unknown';
    }
  };

  const supportLinks = [
    {
      label: 'Help Center',
      href: '/help',
      icon: Info,
      external: false
    },
    {
      label: 'Contact Support',
      href: 'mailto:support@company.com',
      icon: Mail,
      external: true
    },
    {
      label: 'System Status',
      href: 'https://status.company.com',
      icon: Activity,
      external: true
    },
    {
      label: 'Privacy Policy',
      href: '/privacy',
      icon: Shield,
      external: false
    }
  ];

  const companyInfo = [
    {
      icon: MapPin,
      text: 'Nairobi, Kenya'
    },
    {
      icon: Phone,
      text: '+254 700 000 000'
    },
    {
      icon: Globe,
      text: 'www.company.com'
    }
  ];

  return (
    <footer className={`
      border-t transition-colors duration-200
      ${isDarkMode 
        ? 'bg-gray-800 border-gray-700 text-gray-300' 
        : 'bg-white border-gray-200 text-gray-600'
      }
    `}>
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* System Status */}
          <div className="space-y-3">
            <h4 className={`text-sm font-semibold uppercase tracking-wide ${
              isDarkMode ? 'text-gray-200' : 'text-gray-900'
            }`}>
              System Status
            </h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(systemStatus).replace('text-', 'bg-')}`} />
                <span className="text-sm">{getStatusText(systemStatus)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Server size={14} className="text-gray-400" />
                <span className="text-xs">Server: {buildInfo.environment}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={14} className="text-gray-400" />
                <span className="text-xs">
                  {currentTime.toLocaleString('en-US', {
                    timeZone: 'Africa/Nairobi',
                    hour12: true,
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZoneName: 'short'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Build Information */}
          <div className="space-y-3">
            <h4 className={`text-sm font-semibold uppercase tracking-wide ${
              isDarkMode ? 'text-gray-200' : 'text-gray-900'
            }`}>
              Version Info
            </h4>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">v{buildInfo.version}</span>
              </div>
              <div className="text-xs space-y-1">
                <div>Build: {buildInfo.buildDate}</div>
                <div>Commit: {buildInfo.commitHash}</div>
                <div className="flex items-center space-x-1">
                  <Users size={12} />
                  <span>User: {user?.name || 'Guest'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Support Links */}
          <div className="space-y-3">
            <h4 className={`text-sm font-semibold uppercase tracking-wide ${
              isDarkMode ? 'text-gray-200' : 'text-gray-900'
            }`}>
              Support
            </h4>
            <div className="space-y-2">
              {supportLinks.map((link, index) => {
                const Icon = link.icon;
                const Component = link.external ? 'a' : 'button';
                const props = link.external 
                  ? { href: link.href, target: '_blank', rel: 'noopener noreferrer' }
                  : { onClick: () => window.location.href = link.href };

                return (
                  <Component
                    key={index}
                    {...props}
                    className={`
                      flex items-center space-x-2 text-sm transition-colors duration-200 hover:text-blue-500
                      ${link.external ? 'cursor-pointer' : 'cursor-pointer text-left w-full'}
                    `}
                  >
                    <Icon size={14} />
                    <span>{link.label}</span>
                    {link.external && <ExternalLink size={12} />}
                  </Component>
                );
              })}
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-3">
            <h4 className={`text-sm font-semibold uppercase tracking-wide ${
              isDarkMode ? 'text-gray-200' : 'text-gray-900'
            }`}>
              Contact
            </h4>
            <div className="space-y-2">
              {companyInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <Icon size={14} className="text-gray-400" />
                    <span>{info.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={`
        border-t px-4 sm:px-6 lg:px-8 py-4
        ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}
      `}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          
          {/* Copyright */}
          <div className="flex items-center space-x-2 text-sm">
            <span>© {new Date().getFullYear()} Your Company Name.</span>
            <span className="hidden sm:inline">All rights reserved.</span>
            <div className="flex items-center space-x-1">
              <span className="hidden sm:inline">Made with</span>
              <Heart size={14} className="text-red-500" fill="currentColor" />
              <span className="hidden sm:inline">in Kenya</span>
            </div>
          </div>

          {/* Additional info */}
          <div className="flex items-center space-x-4 text-xs">
            <span className={`flex items-center space-x-1 ${
              systemStatus === 'online' ? 'text-green-500' : getStatusColor(systemStatus)
            }`}>
              <Activity size={12} />
              <span className="hidden sm:inline">
                {systemStatus === 'online' ? 'System Healthy' : 'Issues Detected'}
              </span>
            </span>
            {user && (
              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Session: {user.role}
              </span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;