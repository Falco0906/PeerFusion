// client/src/services/messageService.ts - Messaging API service
import api from './api';

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
}

export interface Conversation {
  id: number;
  last_message_at: string;
  last_message_id: number | null;
  last_message_content: string | null;
  last_message_sender_id: number | null;
  other_user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar: string | null;
}

export const messageService = {
  // Get all conversations for the current user
  async getConversations(): Promise<Conversation[]> {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  // Get chat history between two users
  async getChatHistory(userId: number): Promise<Message[]> {
    const response = await api.get(`/messages/chat/${userId}`);
    return response.data;
  },

  // Send a message
  async sendMessage(receiverId: number, content: string, messageType: string = 'text'): Promise<Message> {
    const response = await api.post('/messages/send', {
      receiverId,
      content,
      messageType
    });
    return response.data;
  },

  // Mark messages as read
  async markAsRead(senderId: number): Promise<void> {
    await api.put(`/messages/read/${senderId}`);
  },

  // Get unread message count
  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const response = await api.get('/messages/unread/count');
    return response.data;
  }
};
