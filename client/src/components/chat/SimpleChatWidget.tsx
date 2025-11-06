"use client";

import { useState, useEffect } from 'react';
import { MessageCircle, X, Send, ArrowLeft, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { messageService, Conversation } from '@/services/messageService';
import Link from 'next/link';

export default function SimpleChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const { user } = useAuth();
  const { socket, sendMessage: socketSend } = useSocket();

  useEffect(() => {
    if (isOpen && user) {
      loadConversations();
      loadUnreadCount();
    }
  }, [isOpen, user]);

  const loadConversations = async () => {
    const convs = await messageService.getConversations();
    setConversations(convs);
  };

  const loadUnreadCount = async () => {
    const { unreadCount: count } = await messageService.getUnreadCount();
    setUnreadCount(count);
  };

  const loadMessages = async (conv: Conversation) => {
    setSelectedConv(conv);
    const msgs = await messageService.getChatHistory(conv.other_user_id);
    setMessages(msgs);
    await messageService.markAsRead(conv.other_user_id);
    loadUnreadCount();
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConv) return;
    
    const msg = await messageService.sendMessage(selectedConv.other_user_id, newMessage.trim());
    if (msg) {
      setMessages(prev => [...prev, msg]);
      socketSend?.(selectedConv.other_user_id, newMessage.trim());
    }
    setNewMessage('');
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5051'}/api/search?q=${encodeURIComponent(query)}&type=users`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users?.slice(0, 5) || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const startChat = (user: any) => {
    setSelectedConv({
      other_user_id: user.id,
      first_name: user.first_name,
      last_name: user.last_name
    });
    setMessages([]);
    setSearchQuery('');
    setSearchResults([]);
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9990] w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-24 right-6 z-[9989] w-[380px] h-[550px] bg-background rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary to-primary/80 text-white border-b border-white/10">
              {selectedConv && (
                <button onClick={() => setSelectedConv(null)} className="p-1 hover:bg-white/20 rounded">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex-1 text-center">
                <h3 className="font-semibold">
                  {selectedConv ? `${selectedConv.first_name} ${selectedConv.last_name}` : 'Messages'}
                </h3>
              </div>
              <Link href="/messages" className="text-xs hover:underline">
                View All
              </Link>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {!selectedConv ? (
                <>
                  {/* Search */}
                  <div className="p-3 border-b border-border">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    {searchResults.length > 0 && (
                      <div className="mt-2 bg-card border border-border rounded-lg max-h-40 overflow-y-auto">
                        {searchResults.map((result) => (
                          <button
                            key={result.id}
                            onClick={() => startChat(result)}
                            className="w-full p-2 hover:bg-muted text-left flex items-center gap-2"
                          >
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs">
                              {result.first_name?.[0]}{result.last_name?.[0]}
                            </div>
                            <span className="text-sm text-foreground">{result.first_name} {result.last_name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Conversations List */}
                  <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground text-sm">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No conversations yet</p>
                        <p className="text-xs mt-1">Search for users to start chatting</p>
                      </div>
                    ) : (
                      conversations.map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => loadMessages(conv)}
                          className="w-full p-3 hover:bg-muted border-b border-border/50 text-left transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-sm">
                              {conv.first_name?.[0]}{conv.last_name?.[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm truncate">
                                {conv.first_name} {conv.last_name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {conv.last_message_content || 'No messages yet'}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground text-sm py-8">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                              msg.sender_id === user.id
                                ? 'bg-primary text-white'
                                : 'bg-muted text-foreground'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t border-border">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
