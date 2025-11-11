"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const moderation_middleware_1 = require("../middleware/moderation.middleware");
const chat_service_1 = require("../services/chat.service");
const router = (0, express_1.Router)();
// Get user chats/conversations
router.get('/', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const chats = await chat_service_1.chatService.getUserConversations(userId);
        res.json({
            success: true,
            chats,
            count: chats.length
        });
    }
    catch (error) {
        console.error('Get Chats Error:', error);
        res.status(500).json({ error: error.message || 'Failed to get chats' });
    }
});
// Get single chat/conversation
router.get('/:chatId', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;
        const chat = await chat_service_1.chatService.getConversation(chatId, userId);
        res.json({
            success: true,
            chat
        });
    }
    catch (error) {
        console.error('Get Chat Error:', error);
        res.status(404).json({ error: error.message || 'Chat not found' });
    }
});
// Send message
router.post('/:chatId/messages', auth_middleware_1.authenticate, moderation_middleware_1.moderateMessage, [
    (0, express_validator_1.body)('content').trim().notEmpty().isLength({ max: 1000 }),
    (0, express_validator_1.body)('type').optional().isIn(['text', 'image', 'file'])
], async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;
        const { content, type = 'text' } = req.body;
        const message = await chat_service_1.chatService.sendMessage(chatId, userId, content, type);
        res.json({
            success: true,
            message
        });
    }
    catch (error) {
        console.error('Send Message Error:', error);
        res.status(400).json({ error: error.message || 'Failed to send message' });
    }
});
// Get chat messages
router.get('/:chatId/messages', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const result = await chat_service_1.chatService.getConversationMessages(chatId, userId, page, limit);
        res.json({
            success: true,
            ...result
        });
    }
    catch (error) {
        console.error('Get Messages Error:', error);
        res.status(400).json({ error: error.message || 'Failed to get messages' });
    }
});
// Start new chat
router.post('/', auth_middleware_1.authenticate, [
    (0, express_validator_1.body)('participantId').notEmpty(),
    (0, express_validator_1.body)('initialMessage').optional().trim().isLength({ max: 1000 })
], async (req, res) => {
    try {
        const userId = req.user.id;
        const { participantId, initialMessage } = req.body;
        const conversation = await chat_service_1.chatService.getOrCreateConversation(userId, participantId);
        let message = null;
        if (initialMessage) {
            // Apply moderation to initial message
            const moderationResult = await require('../services/moderation-queue.service').moderationQueueService.processContent(`temp_message_${conversation.id}_${Date.now()}`, 'message', userId, initialMessage);
            if (moderationResult.shouldBlock) {
                return res.status(400).json({
                    error: 'Initial message violates community guidelines',
                    moderation: {
                        flagged_categories: moderationResult.moderationResult.flagged_categories,
                        severity: moderationResult.moderationResult.severity,
                    },
                });
            }
            message = await chat_service_1.chatService.sendMessage(conversation.id, userId, initialMessage, 'text');
        }
        res.json({
            success: true,
            conversation,
            initialMessage: message
        });
    }
    catch (error) {
        console.error('Start Chat Error:', error);
        res.status(400).json({ error: error.message || 'Failed to start chat' });
    }
});
// Legacy start new chat (keeping for compatibility)
router.post('/legacy', auth_middleware_1.authenticate, [
    (0, express_validator_1.body)('participantId').notEmpty(),
    (0, express_validator_1.body)('initialMessage').optional().trim().isLength({ max: 1000 })
], async (req, res) => {
    try {
        const userId = req.user.id;
        const { participantId, initialMessage } = req.body;
        const conversation = await chat_service_1.chatService.getOrCreateConversation(userId, participantId);
        let message = null;
        if (initialMessage) {
            message = await chat_service_1.chatService.sendMessage(conversation.id, userId, initialMessage, 'text');
        }
        res.json({
            success: true,
            conversation,
            initialMessage: message
        });
    }
    catch (error) {
        console.error('Start Chat Error:', error);
        res.status(400).json({ error: error.message || 'Failed to start chat' });
    }
});
// Mark messages as read
router.patch('/:chatId/read', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;
        await chat_service_1.chatService.markMessagesAsRead(chatId, userId);
        res.json({
            success: true,
            message: 'Messages marked as read'
        });
    }
    catch (error) {
        console.error('Mark Read Error:', error);
        res.status(400).json({ error: error.message || 'Failed to mark messages as read' });
    }
});
// Delete chat
router.delete('/:chatId', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;
        await chat_service_1.chatService.deleteConversation(chatId, userId);
        res.json({
            success: true,
            message: 'Chat deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete Chat Error:', error);
        res.status(400).json({ error: error.message || 'Failed to delete chat' });
    }
});
exports.default = router;
