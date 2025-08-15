import React, { useState, useEffect } from 'react';
import { MessageCircle, Search, Send, Mail, Clock, User, Filter, MoreVertical, AlertCircle } from 'lucide-react';
import messageService from '../../../services/messageService';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [messageStats, setMessageStats] = useState({
    total: 0,
    unread: 0,
    replied: 0,
    high: 0
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);

  // Load messages on component mount and when filters change
  useEffect(() => {
    loadMessages();
  }, [currentPage, statusFilter]);

  // Load message statistics
  useEffect(() => {
    loadMessageStats();
  }, []);

  // Filter messages locally when search term changes
  useEffect(() => {
    if (searchTerm) {
      // Reset to first page when searching
      setCurrentPage(1);
    }
  }, [searchTerm]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      // Add status filter if not 'all'
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      // Add search term if present
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response = await messageService.getMessages(params);
      
      if (response && response.messages) {
        setMessages(response.messages);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalMessages(response.pagination?.total || response.messages.length);
      } else {
        setMessages([]);
        setTotalPages(1);
        setTotalMessages(0);
      }

    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err.message || 'Failed to load messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessageStats = async () => {
    try {
      const stats = await messageService.getMessageStats();
      setMessageStats({
        total: stats.total || 0,
        unread: stats.unread || 0,
        replied: stats.replied || 0,
        high: stats.highPriority || 0
      });
    } catch (err) {
      console.error('Error loading message stats:', err);
      // Keep default stats if loading fails
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return 'bg-red-100 text-red-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'read': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handleReply = async (messageId) => {
    if (!replyText.trim()) return;

    try {
      setSendingReply(true);
      
      await messageService.sendReply(messageId, {
        content: replyText.trim()
      });

      // Update the selected message with the new reply
      const updatedMessage = {
        ...selectedMessage,
        status: 'replied',
        replies: [
          ...(selectedMessage.replies || []),
          {
            id: `reply-${Date.now()}`,
            content: replyText.trim(),
            isFromCustomer: false,
            createdAt: new Date().toISOString(),
            sender: 'Assistant'
          }
        ]
      };

      setSelectedMessage(updatedMessage);

      // Update the message in the main list
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: 'replied' }
            : msg
        )
      );

      setReplyText('');
      
      // Refresh stats
      loadMessageStats();

    } catch (err) {
      console.error('Error sending reply:', err);
      setError('Failed to send reply. Please try again.');
    } finally {
      setSendingReply(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await messageService.markAsRead(messageId);
      
      // Update local state
      setMessages(prevMessages =>
        prevMessages.map(msg => 
          msg.id === messageId && msg.status === 'unread'
            ? { ...msg, status: 'read' }
            : msg
        )
      );

      // Refresh stats
      loadMessageStats();

    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const handleMessageClick = async (message) => {
    try {
      // Get full message details with conversation thread if available
      const fullMessage = await messageService.getMessageById(message.id);
      setSelectedMessage(fullMessage.message || message);
      
      // Mark as read if unread
      if (message.status === 'unread') {
        await markAsRead(message.id);
      }
    } catch (err) {
      console.error('Error loading message details:', err);
      setSelectedMessage(message);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadMessages();
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const getCustomerInitial = (customerName) => {
    return customerName ? customerName.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
          <p className="text-gray-600">Customer messages and inquiries</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Message Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Mail className="h-6 w-6 text-gray-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Messages</p>
              <p className="text-xl font-bold text-gray-900">{messageStats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <MessageCircle className="h-6 w-6 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-xl font-bold text-gray-900">{messageStats.unread}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Send className="h-6 w-6 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Replied</p>
              <p className="text-xl font-bold text-gray-900">{messageStats.replied}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-xl font-bold text-gray-900">{messageStats.high}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages by customer, subject, or content..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="replied">Replied</option>
              <option value="read">Read</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Inbox ({totalMessages})
          </h3>
          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>No messages found</p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCurrentPage(1);
                }}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Clear search and filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`p-6 hover:bg-gray-50 cursor-pointer ${message.status === 'unread' ? 'bg-blue-50' : ''}`}
                onClick={() => handleMessageClick(message)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {getCustomerInitial(message.customerName)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{message.customerName || 'Unknown Customer'}</h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(message.status)}`}>
                            {message.status}
                          </span>
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(message.priority)}`} />
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{formatDate(message.createdAt || message.timestamp)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{message.customerEmail || 'No email provided'}</p>
                      <p className="font-medium text-gray-900 mb-2">{message.subject}</p>
                      <p className="text-gray-600 line-clamp-2">{message.content || message.message}</p>
                      {message.replies && message.replies.length > 0 && (
                        <p className="text-sm text-blue-600 mt-2">
                          {message.replies.length} repl{message.replies.length === 1 ? 'y' : 'ies'}
                        </p>
                      )}
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedMessage.subject}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{selectedMessage.customerName || 'Unknown Customer'}</span>
                  <span className="text-sm text-gray-400">({selectedMessage.customerEmail || 'No email'})</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedMessage.status)}`}>
                    {selectedMessage.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {/* Original Message */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-xs">
                          {getCustomerInitial(selectedMessage.customerName)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selectedMessage.customerName || 'Unknown Customer'}</p>
                        <p className="text-xs text-gray-500">{formatDate(selectedMessage.createdAt || selectedMessage.timestamp)}</p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(selectedMessage.priority)}`} />
                  </div>
                  <p className="text-gray-800">{selectedMessage.content || selectedMessage.message}</p>
                </div>

                {/* Replies */}
                {selectedMessage.replies && selectedMessage.replies.map(reply => (
                  <div key={reply.id} className="bg-blue-50 rounded-lg p-4 ml-8">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-medium text-xs">A</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{reply.sender || 'You (Assistant)'}</p>
                        <p className="text-xs text-gray-500">{formatDate(reply.createdAt || reply.timestamp)}</p>
                      </div>
                    </div>
                    <p className="text-gray-800">{reply.content || reply.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Section */}
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <textarea
                    rows="3"
                    placeholder="Type your reply..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={sendingReply}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => handleReply(selectedMessage.id)}
                    disabled={!replyText.trim() || sendingReply}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>{sendingReply ? 'Sending...' : 'Send'}</span>
                  </button>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;