import React, { useState, useEffect } from 'react';
import MessageService from '../../services/messageService';
import { handleApiError } from '../../services/api';
import {
  MessageCircle,
  Search,
  Plus,
  Mail,
  MailOpen,
  Send,
  User,
  Clock,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const CustomerMessages = () => {
  // State Management
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [newMessageData, setNewMessageData] = useState({
    subject: '',
    content: '',
    priority: 'medium'
  });

  // Load customer messages on component mount
  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await MessageService.getMessages({
        search: searchQuery
      });
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Error loading messages:', handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  // Handle message selection and mark as read
  const handleSelectMessage = async (message) => {
    setSelectedMessage(message);
    
    // Mark as read if unread
    if (message.status === 'unread') {
      try {
        await MessageService.markAsRead(message.id);
        // Update local state
        setMessages(prev => 
          prev.map(msg => 
            msg.id === message.id 
              ? { ...msg, status: 'read' }
              : msg
          )
        );
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  // Send reply to selected message
  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    try {
      setSending(true);
      await MessageService.sendReply(selectedMessage.id, {
        content: replyText.trim()
      });
      
      // Update message status to replied
      setMessages(prev => 
        prev.map(msg => 
          msg.id === selectedMessage.id 
            ? { ...msg, status: 'replied' }
            : msg
        )
      );
      
      setReplyText('');
      // Optionally reload the selected message to show the new reply
      loadMessages();
    } catch (error) {
      console.error('Error sending reply:', handleApiError(error));
    } finally {
      setSending(false);
    }
  };

  // Create new message
  const handleCreateMessage = async () => {
    if (!newMessageData.subject.trim() || !newMessageData.content.trim()) return;

    try {
      setSending(true);
      await MessageService.createMessage(newMessageData);
      
      setNewMessageData({ subject: '', content: '', priority: 'medium' });
      setShowNewMessage(false);
      loadMessages(); // Refresh messages list
    } catch (error) {
      console.error('Error creating message:', handleApiError(error));
    } finally {
      setSending(false);
    }
  };

  // Filter messages based on search
  const filteredMessages = messages.filter(message =>
    message.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get unread count
  const unreadCount = messages.filter(msg => msg.status === 'unread').length;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <RefreshCw className="animate-spin mr-2" size={20} />
        <span>Loading messages...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <MessageCircle className="text-blue-600" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
            <p className="text-gray-600">
              {unreadCount > 0 
                ? `You have ${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}`
                : 'All messages read'
              }
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowNewMessage(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} className="mr-2" />
          New Message
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-medium text-gray-800">Your Messages</h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p>No messages found</p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleSelectMessage(message)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedMessage?.id === message.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {message.status === 'unread' ? (
                        <Mail className="text-blue-600" size={16} />
                      ) : (
                        <MailOpen className="text-gray-400" size={16} />
                      )}
                      <span className={`text-sm font-medium ${
                        message.status === 'unread' ? 'text-gray-900' : 'text-gray-600'
                      }`}>
                        {message.assistantName || 'Support'}
                      </span>
                    </div>
                    
                    {message.priority === 'high' && (
                      <AlertCircle className="text-red-500" size={14} />
                    )}
                  </div>
                  
                  <h4 className={`text-sm mb-1 ${
                    message.status === 'unread' ? 'font-semibold text-gray-900' : 'text-gray-700'
                  }`}>
                    {message.subject}
                  </h4>
                  
                  <p className="text-xs text-gray-500 truncate">
                    {message.content}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      message.status === 'unread' 
                        ? 'bg-blue-100 text-blue-800'
                        : message.status === 'replied'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {message.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Detail/Reply Panel */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border">
          {selectedMessage ? (
            <div className="h-full flex flex-col">
              {/* Message Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="text-gray-600" size={20} />
                    <span className="font-medium text-gray-800">
                      {selectedMessage.assistantName || 'Support Team'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock size={14} />
                    <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedMessage.subject}
                </h2>
              </div>
              
              {/* Message Content */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedMessage.content}
                  </p>
                </div>
                
                {/* Show replies if any */}
                {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h3 className="font-medium text-gray-800 border-b pb-2">Conversation</h3>
                    {selectedMessage.replies.map((reply, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-800">
                            {reply.isFromCustomer ? 'You' : selectedMessage.assistantName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(reply.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Reply Section */}
              <div className="p-4 border-t bg-gray-50">
                <div className="flex space-x-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={sending || !replyText.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {sending ? (
                      <RefreshCw className="animate-spin" size={16} />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>Select a message to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">New Message</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={newMessageData.subject}
                  onChange={(e) => setNewMessageData(prev => ({
                    ...prev,
                    subject: e.target.value
                  }))}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter subject..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newMessageData.priority}
                  onChange={(e) => setNewMessageData(prev => ({
                    ...prev,
                    priority: e.target.value
                  }))}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={newMessageData.content}
                  onChange={(e) => setNewMessageData(prev => ({
                    ...prev,
                    content: e.target.value
                  }))}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Enter your message..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewMessage(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMessage}
                disabled={sending || !newMessageData.subject.trim() || !newMessageData.content.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {sending ? (
                  <>
                    <RefreshCw className="animate-spin mr-2" size={16} />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMessages;