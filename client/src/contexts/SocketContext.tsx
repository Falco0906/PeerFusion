// client/src/contexts/SocketContext.tsx - Socket.IO context for real-time messaging
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (receiverId: number, message: string) => void;
  sendTyping: (receiverId: number, isTyping: boolean) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    // Socket event handlers
    newSocket.on('connect', () => {
      console.log('🔌 Connected to Socket.IO server');
      setIsConnected(true);
      
      // Join user's personal room
      if (user?.id) {
        newSocket.emit('join', user.id);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from Socket.IO server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user, socket]);

  const sendMessage = (receiverId: number, message: string) => {
    if (socket && isConnected) {
      socket.emit('private_message', { receiverId, message });
    }
  };

  const sendTyping = (receiverId: number, isTyping: boolean) => {
    if (socket && isConnected) {
      socket.emit('typing', { receiverId, isTyping });
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    sendMessage,
    sendTyping
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
