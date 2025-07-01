// src/services/index.js
// Centralized service exports for Macrame Business CMS
// This file provides clean import paths for all services across the application

// Core Business Services
export { default as customerService } from './customerService';
export { default as orderService } from './orderService';

// Task Management Service (Future Implementation)
// Note: taskService.js is not yet implemented
// Providing a mock service to prevent import errors
const taskService = {
  // Mock methods to prevent dashboard errors
  getTasks: async () => {
    console.warn('taskService.getTasks() - Service not yet implemented');
    return { data: [], total: 0 };
  },
  
  getTaskStats: async () => {
    console.warn('taskService.getTaskStats() - Service not yet implemented');
    return {
      pending: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0
    };
  },
  
  createTask: async (taskData) => {
    console.warn('taskService.createTask() - Service not yet implemented');
    return { success: false, message: 'Task service not available' };
  },
  
  updateTask: async (id, taskData) => {
    console.warn('taskService.updateTask() - Service not yet implemented');
    return { success: false, message: 'Task service not available' };
  },
  
  deleteTask: async (id) => {
    console.warn('taskService.deleteTask() - Service not yet implemented');
    return { success: false, message: 'Task service not available' };
  }
};

export { taskService };

// Additional Services (Future Extensions)
// Uncomment and add as services are implemented

// export { default as inventoryService } from './inventoryService';
// export { default as reportService } from './reportService';
// export { default as notificationService } from './notificationService';
// export { default as settingsService } from './settingsService';
// export { default as userService } from './userService';

// Service Status for Development
export const serviceStatus = {
  customerService: 'implemented',
  orderService: 'implemented',
  taskService: 'mock', // Will be 'implemented' when taskService.js is created
  inventoryService: 'planned',
  reportService: 'planned',
  notificationService: 'planned',
  settingsService: 'planned',
  userService: 'planned'
};

// Helper function to check service availability
export const isServiceAvailable = (serviceName) => {
  return serviceStatus[serviceName] === 'implemented';
};

// Development utility to list available services
export const getAvailableServices = () => {
  return Object.entries(serviceStatus)
    .filter(([, status]) => status === 'implemented')
    .map(([service]) => service);
};

// Development utility to list missing services
export const getMissingServices = () => {
  return Object.entries(serviceStatus)
    .filter(([, status]) => status === 'planned' || status === 'mock')
    .map(([service]) => service);
};