// client/src/components/chat/Chat.tsx - Main chat component
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { messageService, Message, Conversation } from '@/services/messageService';
import { Send, MessageCircle, Users, ArrowLeft } from 'lucide-react';

interface ChatProps {
  onClose?: () => void;
}

export default function Chat({ onClose }: ChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  
  const { user } = useAuth();
  const { socket, isConnected, sendMessage, sendTyping } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    socket.on('new_message', (message: Message) => {
      if (selectedConversation && 
          ((message.sender_id === selectedConversation.other_user_id && message.receiver_id === user?.id) ||
           (message.receiver_id === selectedConversation.other_user_id && message.sender_id === user?.id))) {
        setMessages(prev => [...prev, message]);
        // Update conversation list
        updateConversationWithNewMessage(message);
      }
    });

    // Listen for typing indicators
    socket.on('user_typing', (data: { userId: string; isTyping: boolean }) => {
      if (data.isTyping) {
        setTypingUsers(prev => new Set(prev).add(data.userId));
      } else {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    });

    return () => {
      socket.off('new_message');
      socket.off('user_typing');
    };
  }, [socket, selectedConversation, user]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await messageService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChatHistory = async (conversation: Conversation) => {
    try {
      setLoading(true);
      const data = await messageService.getChatHistory(conversation.other_user_id);
      setMessages(data);
      setSelectedConversation(conversation);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const message = await messageService.sendMessage(
        selectedConversation.other_user_id,
        newMessage.trim()
      );

      // Add message to local state
      setMessages(prev => [...prev, message]);
      
      // Send via socket for real-time delivery
      sendMessage(selectedConversation.other_user_id, message);
      
      // Clear input
      setNewMessage('');
      
      // Update conversation list
      updateConversationWithNewMessage(message);
      
      // Stop typing indicator
      sendTyping(selectedConversation.other_user_id, false);
      setIsTyping(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const updateConversationWithNewMessage = (message: Message) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.other_user_id === message.sender_id || conv.other_user_id === message.receiver_id
          ? {
              ...conv,
              last_message_content: message.content,
              last_message_at: message.created_at,
              last_message_sender_id: message.sender_id
            }
          : conv
      )
    );
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (!selectedConversation) return;

    // Send typing indicator
    if (!isTyping) {
      setIsTyping(true);
      sendTyping(selectedConversation.other_user_id, true);
    }

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTyping(selectedConversation.other_user_id, false);
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getDisplayName = (conversation: Conversation) => {
    // Check if this is a self-conversation
    if (conversation.other_user_id === user?.id) {
      return `${conversation.first_name} ${conversation.last_name} (You)`;
    }
    return `${conversation.first_name} ${conversation.last_name}`;
  };

  const isSelfConversation = (conversation: Conversation) => {
    return conversation.other_user_id === user?.id;
  };

  if (!user) {
    return <div className="p-4 text-center">Please log in to use chat</div>;
  }

  return (
    <div className="flex h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-colors duration-200">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-600 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center transition-colors duration-200">
              <MessageCircle className="w-5 h-5 mr-2" />
              Messages
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Message Myself Button */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-600">
            <button
              onClick={() => {
                const selfConversation = conversations.find(conv => conv.other_user_id === user?.id);
                if (selfConversation) {
                  loadChatHistory(selfConversation);
                } else {
                  // Create a temporary self-conversation if none exists
                  const tempSelfConv = {
                    id: `self_${user?.id}`,
                    other_user_id: user?.id || 0,
                    first_name: user?.first_name || '',
                    last_name: user?.last_name || '',
                    email: user?.email || '',
                    avatar: user?.avatar || null,
                    last_message_at: new Date().toISOString(),
                    last_message_id: null,
                    last_message_content: null,
                    last_message_sender_id: null
                  };
                  loadChatHistory(tempSelfConv);
                }
              }}
              className="w-full p-3 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-lg transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-lg">
                  📝
                </div>
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100 transition-colors duration-200">Message Myself</p>
                  <p className="text-sm text-green-600 dark:text-green-300 transition-colors duration-200">Send notes and reminders to yourself</p>
                </div>
              </div>
            </button>
          </div>

          {loading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 transition-colors duration-200">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 transition-colors duration-200">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
              <p>No conversations yet</p>
              <p className="text-sm">Use "Message Myself" above or start chatting with other users!</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => loadChatHistory(conversation)}
                className={`p-4 border-b border-gray-100 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    isSelfConversation(conversation) ? 'bg-green-500' : 'bg-blue-500'
                  }`}>
                    {isSelfConversation(conversation) ? '📝' : conversation.first_name?.[0]}{!isSelfConversation(conversation) ? conversation.last_name?.[0] : ''}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate transition-colors duration-200">
                      {getDisplayName(conversation)}
                    </p>
                    {conversation.last_message_content && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate transition-colors duration-200">
                        {conversation.last_message_sender_id === user.id ? 'You: ' : ''}
                        {conversation.last_message_content}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 transition-colors duration-200">
                      {conversation.last_message_at ? formatTime(conversation.last_message_at) : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                  isSelfConversation(selectedConversation) ? 'bg-green-500' : 'bg-blue-500'
                }`}>
                  {isSelfConversation(selectedConversation) ? '📝' : selectedConversation.first_name?.[0]}{!isSelfConversation(selectedConversation) ? selectedConversation.last_name?.[0] : ''}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white transition-colors duration-200">
                    {getDisplayName(selectedConversation)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                    {isSelfConversation(selectedConversation) ? 'Self Notes' : (isConnected ? 'Online' : 'Offline')}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isSelfMessage = message.sender_id === user.id;
                const isSelfConversation = selectedConversation && selectedConversation.other_user_id === user?.id;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isSelfMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isSelfMessage
                          ? isSelfConversation 
                            ? 'bg-green-500 text-white' 
                            : 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isSelfMessage 
                          ? isSelfConversation 
                            ? 'text-green-100' 
                            : 'text-blue-100'
                          : 'text-gray-500'
                      }`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              
              {/* Typing indicator */}
              {typingUsers.size > 0 && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
                    <p className="text-sm italic">Typing...</p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-600 transition-colors duration-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                  disabled={loading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || loading}
                  className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors duration-200">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-500" />
              <p className="text-lg font-medium transition-colors duration-200">Select a conversation</p>
              <p className="text-sm transition-colors duration-200">Use "Message Myself" or choose a conversation from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
