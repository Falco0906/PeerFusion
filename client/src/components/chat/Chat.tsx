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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  
  const { user } = useAuth();
  const { socket, isConnected, sendMessage, sendTyping } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      // Silently fail - messages endpoint not yet migrated
      setConversations([]);
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
      // Silently fail - messages endpoint not yet migrated
      setMessages([]);
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
      sendMessage(selectedConversation.other_user_id, message.content);
      
      // Clear input
      setNewMessage('');
      
      // Update conversation list
      updateConversationWithNewMessage(message);
      
      // Stop typing indicator
      sendTyping(selectedConversation.other_user_id, false);
      setIsTyping(false);
    } catch (error) {
      // Silently fail - messages endpoint not yet migrated
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

  const handleSearchUsers = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/search?q=${encodeURIComponent(query)}&type=users`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const startConversationWithUser = async (selectedUser: any) => {
    // Check if conversation already exists
    const existingConv = conversations.find(conv => conv.other_user_id === selectedUser.id);
    
    if (existingConv) {
      loadChatHistory(existingConv);
    } else {
      // Create a new conversation object
      const newConv: Conversation = {
        id: selectedUser.id,
        other_user_id: selectedUser.id,
        first_name: selectedUser.first_name,
        last_name: selectedUser.last_name,
        email: selectedUser.email,
        avatar: selectedUser.avatar || null,
        last_message_at: new Date().toISOString(),
        last_message_id: null,
        last_message_content: null,
        last_message_sender_id: null
      };
      
      setSelectedConversation(newConv);
      setMessages([]);
      setConversations(prev => [newConv, ...prev]);
    }
    
    // Clear search
    setSearchQuery('');
    setSearchResults([]);
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
    return <div className="p-4 text-center text-muted-foreground">Please log in to use chat</div>;
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-border/50 flex flex-col bg-card/30">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Conversations
            </h2>
          </div>
          
          {/* Search Users */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleSearchUsers(e.target.value)}
              className="input w-full text-sm"
            />
            {searching && (
              <div className="absolute right-3 top-2.5">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
          
          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute z-50 mt-1 w-72 glass-strong border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => startConversationWithUser(result)}
                  className="w-full p-3 hover:bg-primary/10 transition-colors text-left border-b border-border/30 last:border-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {result.first_name?.[0]}{result.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {result.first_name} {result.last_name}
                      </p>
                      {result.institution && (
                        <p className="text-xs text-muted-foreground truncate">
                          {result.institution}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Message Myself Button */}
          <div className="p-4 border-b border-border/30">
            <button
              onClick={() => {
                const selfConversation = conversations.find(conv => conv.other_user_id === user?.id);
                if (selfConversation) {
                  loadChatHistory(selfConversation);
                } else {
                  // Create a temporary self-conversation if none exists
                  const tempSelfConv = {
                    id: user?.id || 0,
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
              className="w-full p-3 glass hover:bg-primary/10 border border-primary/30 rounded-lg transition-all text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-lg">
                  📝
                </div>
                <div>
                  <p className="font-medium text-foreground">Message Myself</p>
                  <p className="text-sm text-muted-foreground">Send notes to yourself</p>
                </div>
              </div>
            </button>
          </div>

          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <p>No conversations yet</p>
              <p className="text-sm">Start chatting with other users!</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => loadChatHistory(conversation)}
                className={`p-4 border-b border-border/30 cursor-pointer hover:bg-muted/30 transition-all ${
                  selectedConversation?.id === conversation.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    isSelfConversation(conversation) ? 'bg-primary' : 'bg-secondary'
                  }`}>
                    {isSelfConversation(conversation) ? '📝' : conversation.first_name?.[0]}{!isSelfConversation(conversation) ? conversation.last_name?.[0] : ''}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {getDisplayName(conversation)}
                    </p>
                    {conversation.last_message_content && (
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.last_message_sender_id === user.id ? 'You: ' : ''}
                        {conversation.last_message_content}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
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
            <div className="p-4 border-b border-border/50 bg-card/30">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                  isSelfConversation(selectedConversation) ? 'bg-primary' : 'bg-secondary'
                }`}>
                  {isSelfConversation(selectedConversation) ? '📝' : selectedConversation.first_name?.[0]}{!isSelfConversation(selectedConversation) ? selectedConversation.last_name?.[0] : ''}
                </div>
                <div>
                  <h3 className="font-medium text-foreground">
                    {getDisplayName(selectedConversation)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isSelfConversation(selectedConversation) ? 'Self Notes' : (isConnected ? 'Online' : 'Offline')}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/30">
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
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'glass text-foreground border border-border/30'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isSelfMessage 
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
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
                  <div className="glass text-foreground px-4 py-2 rounded-lg border border-border/30">
                    <p className="text-sm italic">Typing...</p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border/50 bg-card/30">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="input flex-1"
                  disabled={loading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || loading}
                  className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
