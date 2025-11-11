import api from './api';

export interface Message {
  id: string;
  conversationId: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  type: 'text' | 'image' | 'file';
  isRead: boolean;
  createdAt: string;
  timeAgo?: string;
}

export interface Chat {
  id: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  lastMessage?: Message;
  unreadCount: number;
  lastMessageAt: string | null;
}

export interface ChatResponse {
  success: boolean;
  chats: Chat[];
  count: number;
}

export interface MessagesResponse {
  success: boolean;
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export const chatApi = {
  /**
   * Get user's chats/conversations
   */
  getChats: async (): Promise<ChatResponse> => {
    const response = await api.get('/chats');
    return response.data;
  },

  /**
   * Get single chat/conversation
   */
  getChat: async (chatId: string): Promise<{ success: boolean; chat: Chat }> => {
    const response = await api.get(`/chats/${chatId}`);
    return response.data;
  },

  /**
   * Get chat messages
   */
  getMessages: async (
    chatId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<MessagesResponse> => {
    const response = await api.get(`/chats/${chatId}/messages`, {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Send a message
   */
  sendMessage: async (
    chatId: string,
    content: string,
    type: 'text' | 'image' | 'file' = 'text'
  ): Promise<{ success: boolean; message: Message }> => {
    const response = await api.post(`/chats/${chatId}/messages`, { content, type });
    return response.data;
  },

  /**
   * Start a new chat/conversation
   */
  startChat: async (
    participantId: string,
    initialMessage?: string
  ): Promise<{ success: boolean; conversation: Chat; initialMessage?: Message }> => {
    const response = await api.post('/chats', { participantId, initialMessage });
    return response.data;
  },

  /**
   * Mark messages as read
   */
  markAsRead: async (chatId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.patch(`/chats/${chatId}/read`);
    return response.data;
  },

  /**
   * Delete a chat
   */
  deleteChat: async (chatId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/chats/${chatId}`);
    return response.data;
  },
};

export default chatApi;

