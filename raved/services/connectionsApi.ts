import api from './api';

export interface FollowRequest {
  id: string;
  requester: {
    id: string;
    username: string;
    name: string;
    avatarUrl?: string;
  };
  requestedAt: string;
  timeAgo?: string;
}

export interface BlockedUser {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string;
  blockedAt: string;
}

export const connectionsApi = {
  /**
   * Send follow request (for private accounts) or follow directly (for public accounts)
   */
  sendFollowRequest: async (userId: string): Promise<{ success: boolean; message: string; status: 'pending' | 'accepted' }> => {
    const response = await api.post(`/connections/request/${userId}`);
    return response.data;
  },

  /**
   * Get pending follow requests
   */
  getPendingFollowRequests: async (): Promise<{ success: boolean; requests: FollowRequest[] }> => {
    const response = await api.get('/connections/requests');
    return response.data;
  },

  /**
   * Approve follow request
   */
  approveFollowRequest: async (requestId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/connections/requests/${requestId}/approve`);
    return response.data;
  },

  /**
   * Reject follow request
   */
  rejectFollowRequest: async (requestId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/connections/requests/${requestId}/reject`);
    return response.data;
  },

  /**
   * Block user
   */
  blockUser: async (userId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/connections/block/${userId}`);
    return response.data;
  },

  /**
   * Unblock user
   */
  unblockUser: async (userId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/connections/block/${userId}`);
    return response.data;
  },

  /**
   * Get blocked users
   */
  getBlockedUsers: async (): Promise<{ success: boolean; blockedUsers: BlockedUser[]; count: number }> => {
    const response = await api.get('/connections/blocked');
    return response.data;
  },
};

export default connectionsApi;

