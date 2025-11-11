import { Request, Response } from 'express';
import { connectionService } from '../services/connection.service';
import { getTimeAgo } from '../utils'; // Assuming getTimeAgo is in utils

export const connectionController = {
  sendFollowRequest: async (req: Request, res: Response) => {
    try {
      const followerId = req.user.id;
      const { userId: followingId } = req.params;
      
      const status = await connectionService.sendFollowRequest(followerId, followingId);
      
      res.json({
        success: true,
        message: status === 'pending' ? 'Follow request sent' : 'Successfully followed user',
        status
      });
    } catch (error: any) {
      console.error('Follow Request Error:', error);
      res.status(400).json({ error: error.message });
    }
  },

  getPendingFollowRequests: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const requests = await connectionService.getPendingFollowRequests(userId);
      
      const enrichedRequests = requests.map(request => ({
        ...request,
        timeAgo: getTimeAgo(request.requestedAt)
      }));

      res.json({
        success: true,
        requests: enrichedRequests
      });
    } catch (error) {
      console.error('Get Follow Requests Error:', error);
      res.status(500).json({ error: 'Failed to get follow requests' });
    }
  },

  approveFollowRequest: async (req: Request, res: Response) => {
    try {
      const { requestId } = req.params;
      const userId = req.user.id;
      
      await connectionService.approveFollowRequest(requestId, userId);
      
      res.json({
        success: true,
        message: 'Follow request approved'
      });
    } catch (error: any) {
      console.error('Approve Request Error:', error);
      res.status(404).json({ error: error.message });
    }
  },

  rejectFollowRequest: async (req: Request, res: Response) => {
    try {
      const { requestId } = req.params;
      const userId = req.user.id;
      
      await connectionService.rejectFollowRequest(requestId, userId);
      
      res.json({
        success: true,
        message: 'Follow request rejected'
      });
    } catch (error: any) {
      console.error('Reject Request Error:', error);
      res.status(404).json({ error: error.message });
    }
  },

  blockUser: async (req: Request, res: Response) => {
    try {
      const blockerId = req.user.id;
      const { userId: blockedId } = req.params;
      
      await connectionService.blockUser(blockerId, blockedId);
      
      res.json({
        success: true,
        message: 'User blocked successfully'
      });
    } catch (error: any) {
      console.error('Block User Error:', error);
      res.status(400).json({ error: error.message });
    }
  },

  unblockUser: async (req: Request, res: Response) => {
    try {
      const blockerId = req.user.id;
      const { userId: blockedId } = req.params;
      
      await connectionService.unblockUser(blockerId, blockedId);
      
      res.json({
        success: true,
        message: 'User unblocked successfully'
      });
    } catch (error: any) {
      console.error('Unblock User Error:', error);
      res.status(404).json({ error: error.message });
    }
  },

  getBlockedUsers: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const blockedUsers = await connectionService.getBlockedUsers(userId);
      
      res.json({
        success: true,
        blockedUsers,
        count: blockedUsers.length
      });
    } catch (error) {
      console.error('Get Blocked Users Error:', error);
      res.status(500).json({ error: 'Failed to get blocked users' });
    }
  }
};
