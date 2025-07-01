import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import DashboardCard from './DashboardCard';
import MetricsChart from './MetricsChart';
import { 
  Users, 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  MessageSquare,
  TrendingUp,
  Star,
  DollarSign
} from 'lucide-react';
import { customerService, orderService, taskService } from '../../services';

const AssistantDashboard = () => {
  const { user } = useAuth();
  const { showError, showSuccess, showInfo } = useNotification();
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  
  // Dashboard data
  const [dashboardData, setDashboardData] = useState({
    assignedCustomers: 0,
    pendingOrders: 0,
    completedTasks: 0,
    pendingTasks: 0,
    averageRating: 0,
    totalRevenue: 0,
    recentActivity: []
  });
  
  // Chart data
  const [chartData, setChartData] = useState({
    taskCompletion: [],
    customerSatisfaction: [],
    orderProcessing: []
  });
  
  // Recent tasks and activities
  const [recentTasks, setRecentTasks] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
    fetchChartData();
    fetchRecentActivities();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch assistant-specific metrics
      const [
        customersResponse,
        ordersResponse,
        tasksResponse,
        ratingsResponse
      ] = await Promise.all([
        customerService.getAssignedCustomers(user.id),
        orderService.getAssistantOrders(user.id),
        taskService.getAssistantTasks(user.id),
        customerService.getAssistantRatings(user.id)
      ]);

      // Calculate metrics
      const pendingOrders = ordersResponse.data.filter(order => 
        ['pending', 'processing'].includes(order.status)
      ).length;
      
      const completedTasks = tasksResponse.data.filter(task => 
        task.status === 'completed'
      ).length;
      
      const pendingTasks = tasksResponse.data.filter(task => 
        ['pending', 'in_progress'].includes(task.status)
      ).length;

      const totalRevenue = ordersResponse.data
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + order.total, 0);

      const averageRating = ratingsResponse.data.length > 0
        ? ratingsResponse.data.reduce((sum, rating) => sum + rating.score, 0) / ratingsResponse.data.length
        : 0;

      setDashboardData({
        assignedCustomers: customersResponse.data.length,
        pendingOrders,
        completedTasks,
        pendingTasks,
        averageRating: averageRating.toFixed(1),
        totalRevenue,
        recentActivity: ordersResponse.data.slice(0, 5)
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showError('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      setMetricsLoading(true);
      
      // Fetch chart data for the last 7 days
      const [
        taskMetrics,
        satisfactionMetrics,
        orderMetrics
      ] = await Promise.all([
        taskService.getAssistantTaskMetrics(user.id, 7),
        customerService.getAssistantSatisfactionMetrics(user.id, 7),
        orderService.getAssistantOrderMetrics(user.id, 7)
      ]);

      setChartData({
        taskCompletion: taskMetrics.data,
        customerSatisfaction: satisfactionMetrics.data,
        orderProcessing: orderMetrics.data
      });

    } catch (error) {
      console.error('Error fetching chart data:', error);
      showError('Error loading metrics');
    } finally {
      setMetricsLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const [tasksResponse, appointmentsResponse] = await Promise.all([
        taskService.getRecentTasks(user.id, 10),
        customerService.getUpcomingAppointments(user.id)
      ]);

      setRecentTasks(tasksResponse.data);
      setUpcomingAppointments(appointmentsResponse.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleTaskComplete = async (taskId) => {
    try {
      await taskService.completeTask(taskId);
      showSuccess('Task marked as completed');
      fetchDashboardData();
      fetchRecentActivities();
    } catch (error) {
      console.error('Error completing task:', error);
     showError('Error completing task');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'text-green-600 bg-green-100',
      pending: 'text-yellow-600 bg-yellow-100',
      in_progress: 'text-blue-600 bg-blue-100',
      cancelled: 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-blue-100">
          Here's your daily overview and pending tasks
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Assigned Customers"
          value={dashboardData.assignedCustomers}
          icon={Users}
          color="blue"
          loading={loading}
          onClick={() => window.location.href = '/customers'}
        />
        
        <DashboardCard
          title="Pending Orders"
          value={dashboardData.pendingOrders}
          icon={ShoppingCart}
          color="orange"
          loading={loading}
          trend={dashboardData.pendingOrders > 0 ? "urgent" : "stable"}
          onClick={() => window.location.href = '/orders?status=pending'}
        />
        
        <DashboardCard
          title="Pending Tasks"
          value={dashboardData.pendingTasks}
          icon={Clock}
          color="yellow"
          loading={loading}
          trend={dashboardData.pendingTasks > 5 ? "up" : "stable"}
          onClick={() => window.location.href = '/tasks?status=pending'}
        />
        
        <DashboardCard
          title="Average Rating"
          value={`${dashboardData.averageRating}/5`}
          icon={Star}
          color="green"
          loading={loading}
          trend={dashboardData.averageRating >= 4.5 ? "up" : "stable"}
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Completed Tasks"
          value={dashboardData.completedTasks}
          icon={CheckCircle}
          color="green"
          loading={loading}
          subtitle="This month"
        />
        
        <DashboardCard
          title="Revenue Generated"
          value={formatCurrency(dashboardData.totalRevenue)}
          icon={DollarSign}
          color="purple"
          loading={loading}
          subtitle="This month"
        />
        
        <DashboardCard
          title="Customer Messages"
          value="12"
          icon={MessageSquare}
          color="indigo"
          loading={loading}
          subtitle="Unread"
          onClick={() => window.location.href = '/messages'}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Task Completion Rate
          </h3>
          <MetricsChart
            data={chartData.taskCompletion}
            type="line"
            xKey="date"
            yKey="completed"
            loading={metricsLoading}
            height={300}
          />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-600" />
            Customer Satisfaction
          </h3>
          <MetricsChart
            data={chartData.customerSatisfaction}
            type="bar"
            xKey="date"
            yKey="rating"
            loading={metricsLoading}
            height={300}
          />
        </div>
      </div>

      {/* Recent Activities and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Recent Tasks
          </h3>
          
          <div className="space-y-3">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-600">{task.customer_name}</p>
                    <p className="text-xs text-gray-500">{formatDate(task.due_date)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    {task.status === 'pending' && (
                      <button
                        onClick={() => handleTaskComplete(task.id)}
                        className="text-green-600 hover:text-green-800"
                        title="Mark as completed"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent tasks</p>
            )}
          </div>
          
          <button className="w-full mt-4 text-blue-600 hover:text-blue-800 font-medium">
            View All Tasks →
          </button>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-purple-600" />
            Upcoming Appointments
          </h3>
          
          <div className="space-y-3">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{appointment.customer_name}</p>
                    <p className="text-sm text-gray-600">{appointment.service_type}</p>
                    <p className="text-xs text-gray-500">{formatDate(appointment.scheduled_at)}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
            )}
          </div>
          
          <button className="w-full mt-4 text-purple-600 hover:text-purple-800 font-medium">
            View Calendar →
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <Users className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <span className="text-sm font-medium">Add Customer</span>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <span className="text-sm font-medium">New Order</span>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <span className="text-sm font-medium">Schedule Meeting</span>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <span className="text-sm font-medium">Create Task</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssistantDashboard;