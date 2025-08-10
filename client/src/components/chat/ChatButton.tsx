// client/src/components/chat/ChatButton.tsx - Chat button with unread count
"use client";

import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { messageService } from '@/services/messageService';
import Chat from './Chat';

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Load initial unread count
    loadUnreadCount();

    // Set up interval to check for new messages
    const interval = setInterval(loadUnreadCount, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const loadUnreadCount = async () => {
    try {
      const { unreadCount } = await messageService.getUnreadCount();
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        title="Messages"
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-6xl h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden transition-colors duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 transition-colors duration-200">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">Chat</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-full">
              <Chat onClose={() => setIsOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
