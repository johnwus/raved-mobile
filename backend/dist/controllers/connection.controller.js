"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionController = void 0;
const connection_service_1 = require("../services/connection.service");
const utils_1 = require("../utils"); // Assuming getTimeAgo is in utils
exports.connectionController = {
    sendFollowRequest: async (req, res) => {
        try {
            const followerId = req.user.id;
            const { userId: followingId } = req.params;
            const status = await connection_service_1.connectionService.sendFollowRequest(followerId, followingId);
            res.json({
                success: true,
                message: status === 'pending' ? 'Follow request sent' : 'Successfully followed user',
                status
            });
        }
        catch (error) {
            console.error('Follow Request Error:', error);
            res.status(400).json({ error: error.message });
        }
    },
    getPendingFollowRequests: async (req, res) => {
        try {
            const userId = req.user.id;
            const requests = await connection_service_1.connectionService.getPendingFollowRequests(userId);
            const enrichedRequests = requests.map(request => ({
                ...request,
                timeAgo: (0, utils_1.getTimeAgo)(request.requestedAt)
            }));
            res.json({
                success: true,
                requests: enrichedRequests
            });
        }
        catch (error) {
            console.error('Get Follow Requests Error:', error);
            res.status(500).json({ error: 'Failed to get follow requests' });
        }
    },
    approveFollowRequest: async (req, res) => {
        try {
            const { requestId } = req.params;
            const userId = req.user.id;
            await connection_service_1.connectionService.approveFollowRequest(requestId, userId);
            res.json({
                success: true,
                message: 'Follow request approved'
            });
        }
        catch (error) {
            console.error('Approve Request Error:', error);
            res.status(404).json({ error: error.message });
        }
    },
    rejectFollowRequest: async (req, res) => {
        try {
            const { requestId } = req.params;
            const userId = req.user.id;
            await connection_service_1.connectionService.rejectFollowRequest(requestId, userId);
            res.json({
                success: true,
                message: 'Follow request rejected'
            });
        }
        catch (error) {
            console.error('Reject Request Error:', error);
            res.status(404).json({ error: error.message });
        }
    },
    blockUser: async (req, res) => {
        try {
            const blockerId = req.user.id;
            const { userId: blockedId } = req.params;
            await connection_service_1.connectionService.blockUser(blockerId, blockedId);
            res.json({
                success: true,
                message: 'User blocked successfully'
            });
        }
        catch (error) {
            console.error('Block User Error:', error);
            res.status(400).json({ error: error.message });
        }
    },
    unblockUser: async (req, res) => {
        try {
            const blockerId = req.user.id;
            const { userId: blockedId } = req.params;
            await connection_service_1.connectionService.unblockUser(blockerId, blockedId);
            res.json({
                success: true,
                message: 'User unblocked successfully'
            });
        }
        catch (error) {
            console.error('Unblock User Error:', error);
            res.status(404).json({ error: error.message });
        }
    },
    getBlockedUsers: async (req, res) => {
        try {
            const userId = req.user.id;
            const blockedUsers = await connection_service_1.connectionService.getBlockedUsers(userId);
            res.json({
                success: true,
                blockedUsers,
                count: blockedUsers.length
            });
        }
        catch (error) {
            console.error('Get Blocked Users Error:', error);
            res.status(500).json({ error: 'Failed to get blocked users' });
        }
    }
};
