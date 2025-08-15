import React, { useState, useEffect } from 'react';
import MessageService from '../../../services/messageService';
import { handleApiError } from '../../../services/api';
import {
  MessageCircle,
  Search,
  Filter,
  Plus,
  Mail,
  MailOpen,
  Send,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  Reply,
  MoreHorizontal,
  RefreshCw,
  User,
  Calendar,
  Star,
  Archive,
  Trash2,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const Messages = ({ currentUser }) => {
  // State management
  const [messages, setMessages] = useState([]);
  const [messageStats, setMessageStats] = useState({
    totalMessages: 0,
    unreadMessages: 0,
    repliedMessages: 0,
    highPriorityMessages: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filter and search state
  const [activeFilter, setActiveFilter] = useState('all'); // all, unread, replied, high-priority
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);
  const itemsPerPage = 20;

  // UI state
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageDetails, setShowMessageDetails] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState(new Set());
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [replyingToId, setReplyingToId] = useState(null);

  // Load messages on component mount and when filters change
  useEffect(() => {
    loadMessages();
  }, [activeFilter, searchTerm, sortBy, sortOrder, currentPage]);

  // Load message stats on component mount
  useEffect(() => {
    loadMessageStats();
  }, []);

  /**
   * Load messages from API
   */
  const loadMessages = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('Loading messages with filters:', {
        status: activeFilter,
        search: searchTerm,
        sortBy,
        sortOrder,
        page: currentPage
      });

      const response = await MessageService.getMessages({
        status: activeFilter === 'all' ? '' : activeFilter,
        search: searchTerm,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: itemsPerPage
      });

      console.log('Messages loaded:', response);

      setMessages(response.data || []);
      setTotalMessages(response.total || 0);
      setTotalPages(Math.ceil((response.total || 0) / itemsPerPage));

      // If we have a selected message, update it with fresh data
      if (selectedMessage) {
        const updatedMessage = response.data?.find(msg => msg.id === selectedMessage.id);
        if (updatedMessage) {
          setSelectedMessage(updatedMessage);
        }
      }

    } catch (err) {
      console.error('Error loading messages:', err);
      setError(handleApiError(err, 'Failed to load messages'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Load message statistics
   */
  const loadMessageStats = async () => {
    try {
      console.log('Loading message stats...');
      const stats = await MessageService.getMessageStats();
      console.log('Message stats loaded:', stats);
      setMessageStats(stats);
    } catch (err) {
      console.error('Error loading message stats:', err);
      // Don't show error for stats, just log it
    }
  };

  /**
   * Refresh all data
   */
  const handleRefresh = async () => {
    await Promise.all([
      loadMessages(true),
      loadMessageStats()
    ]);
  };

  /**
   * Handle message selection and mark as read
   */
  const handleMessageSelect = async (message) => {
    setSelectedMessage(message);
    setShowMessageDetails(true);
    setReplyingToId(null);
    setReplyContent('');

    // Mark as read if it's unread
    if (message.status === 'unread') {
      try {
        await MessageService.markAsRead(message.id);
        
        // Update local state
        setMessages(prev => prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, status: 'read' }
            : msg
        ));

        // Update selected message
        setSelectedMessage(prev => ({ ...prev, status: 'read' }));

        // Refresh stats
        loadMessageStats();

      } catch (err) {
        console.error('Error marking message as read:', err);
      }
    }
  };

  /**
   * Handle reply submission
   */
  const handleReplySubmit = async (messageId) => {
    if (!replyContent.trim()) return;

    try {
      setIsReplying(true);

      const replyData = {
        content: replyContent.trim()
      };

      console.log('Sending reply:', { messageId, replyData });

      const response = await MessageService.sendReply(messageId, replyData);
      console.log('Reply sent:', response);

      // Clear reply form
      setReplyContent('');
      setReplyingToId(null);

      // Refresh messages and stats
      await Promise.all([
        loadMessages(true),
        loadMessageStats()
      ]);

      // Show success message (you could add a toast notification here)
      console.log('Reply sent successfully');

    } catch (err) {
      console.error('Error sending reply:', err);
      setError(handleApiError(err, 'Failed to send reply'));
    } finally {
      setIsReplying(false);
    }
  };

  /**
   * Handle priority update
   */
  const handlePriorityUpdate = async (messageId, newPriority) => {
    try {
      await MessageService.updatePriority(messageId, newPriority);
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, priority: newPriority }
          : msg
      ));

      if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => ({ ...prev, priority: newPriority }));
      }

      // Refresh stats
      loadMessageStats();

    } catch (err) {
      console.error('Error updating priority:', err);
      setError(handleApiError(err, 'Failed to update priority'));
    }
  };

  /**
   * Get priority badge styling
   */
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (status) => {
    switch (status) {
      case 'unread':
        return Mail;
      case 'read':
        return MailOpen;
      case 'replied':
        return CheckCircle;
      default:
        return Mail;
    }
  };

  /**
   * Format date for display
   */
  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  /**
   * Handle search
   */
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page
  };

  /**
   * Handle pagination
   */
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  /**
   * Toggle message expansion
   */
  const toggleMessageExpansion = (messageId) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId);
    } else {
      newExpanded.add(messageId);
    }
    setExpandedMessages(newExpanded);
  };

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All Messages', count: messageStats.totalMessages },
    { value: 'unread', label: 'Unread', count: messageStats.unreadMessages },
    { value: 'replied', label: 'Replied', count: messageStats.repliedMessages },
    { value: 'high', label: 'High Priority', count: messageStats.highPriorityMessages }
  ];

  // Loading state
  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600">Customer messages and inquiries</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {filterOptions.map((option, index) => {
            const isActive = activeFilter === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleFilterChange(option.value)}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  isActive
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{option.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{option.count}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${
                    index === 0 ? 'bg-blue-100 text-blue-600' :
                    index === 1 ? 'bg-red-100 text-red-600' :
                    index === 2 ? 'bg-green-100 text-green-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {index === 0 ? <MessageCircle className="h-5 w-5" /> :
                     index === 1 ? <Mail className="h-5 w-5" /> :
                     index === 2 ? <Send className="h-5 w-5" /> :
                     <Clock className="h-5 w-5" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages by customer, subject, or content..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="priority-desc">Priority High-Low</option>
              <option value="priority-asc">Priority Low-High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex-shrink-0 mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages List */}
        <div className={`${showMessageDetails ? 'hidden lg:block lg:w-1/2' : 'w-full'} border-r border-gray-200 overflow-y-auto`}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
              <p className="text-gray-500">
                {activeFilter === 'all' 
                  ? "You don't have any messages yet."
                  : `No ${activeFilter} messages found.`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {messages.map((message) => {
                const StatusIcon = getStatusIcon(message.status);
                const isSelected = selectedMessage?.id === message.id;
                const isExpanded = expandedMessages.has(message.id);
                
                return (
                  <div
                    key={message.id}
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                      isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    } ${message.status === 'unread' ? 'bg-blue-25' : ''}`}
                    onClick={() => handleMessageSelect(message)}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Customer Avatar */}
                      <div className="flex-shrink-0">
                        {message.customerAvatar ? (
                          <img
                            src={message.customerAvatar}
                            alt={message.customerName}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                        )}
                      </div>

                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <h3 className={`text-sm font-medium truncate ${
                              message.status === 'unread' ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {message.customerName}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityBadge(message.priority)}`}>
                              {message.priority}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <StatusIcon className="h-3 w-3" />
                            <span>{formatMessageDate(message.createdAt)}</span>
                          </div>
                        </div>
                        
                        <p className={`text-sm font-medium mb-1 ${
                          message.status === 'unread' ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {message.subject}
                        </p>
                        
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {message.content}
                        </p>

                        {message.replies && message.replies.length > 0 && (
                          <div className="mt-2 text-xs text-gray-500">
                            {message.replies.length} {message.replies.length === 1 ? 'reply' : 'replies'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalMessages)} of {totalMessages} messages
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + Math.max(1, currentPage - 2);
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-sm border rounded ${
                        page === currentPage
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Message Details Panel */}
        {showMessageDetails && selectedMessage && (
          <div className="w-full lg:w-1/2 flex flex-col bg-white">
            {/* Message Details Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowMessageDetails(false)}
                    className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedMessage.subject}</h2>
                    <p className="text-sm text-gray-600">
                      From: {selectedMessage.customerName} ({selectedMessage.customerEmail})
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedMessage.priority}
                    onChange={(e) => handlePriorityUpdate(selectedMessage.id, e.target.value)}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(selectedMessage.priority)}`}>
                  {selectedMessage.priority} priority
                </span>
              </div>
            </div>

            {/* Message Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Original Message */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    {selectedMessage.customerAvatar ? (
                      <img
                        src={selectedMessage.customerAvatar}
                        alt={selectedMessage.customerName}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{selectedMessage.customerName}</p>
                      <p className="text-xs text-gray-500">{formatMessageDate(selectedMessage.createdAt)}</p>
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.content}</p>
                  </div>
                </div>

                {/* Replies */}
                {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900">Replies ({selectedMessage.replies.length})</h3>
                    {selectedMessage.replies.map((reply, index) => (
                      <div key={reply.id || index} className={`rounded-lg p-4 ${
                        reply.isFromAssistant ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'
                      }`}>
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-3 w-3 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {reply.isFromAssistant ? 'You' : selectedMessage.customerName}
                            </p>
                            <p className="text-xs text-gray-500">{formatMessageDate(reply.createdAt)}</p>
                          </div>
                        </div>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Reply Form */}
            <div className="flex-shrink-0 border-t border-gray-200 p-6 bg-white">
              {replyingToId === selectedMessage.id ? (
                <div className="space-y-4">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Type your reply..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={() => {
                        setReplyingToId(null);
                        setReplyContent('');
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      disabled={isReplying}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReplySubmit(selectedMessage.id)}
                      disabled={!replyContent.trim() || isReplying}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isReplying ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Reply
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setReplyingToId(selectedMessage.id)}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Reply className="h-4 w-4 mr-2" />
                  Reply to Message
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;