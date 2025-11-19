"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const moderation_middleware_1 = require("../middleware/moderation.middleware");
const chat_service_1 = require("../services/chat.service");
const index_1 = require("../index");
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
            chat: {
                ...chat,
                participants: [
                    { id: userId, name: req.user.first_name + ' ' + req.user.last_name, avatarUrl: req.user.avatar_url },
                    chat.otherParticipant
                ]
            }
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
        // Emit real-time message to chat room so connected clients receive it immediately
        try {
            index_1.io.to(`chat:${chatId}`).emit('new_message', {
                ...message,
                timestamp: new Date()
            });
            // Also notify the recipient's user room so their conversation list / unread badge can update
            try {
                const receiverId = message.receiverId;
                if (receiverId) {
                    const { getTimeAgo } = await Promise.resolve().then(() => __importStar(require('../utils')));
                    index_1.io.to(`user:${receiverId}`).emit('conversation_updated', {
                        conversationId: chatId,
                        lastMessage: message.content,
                        lastMessageAt: message.createdAt,
                        timeAgo: getTimeAgo(message.createdAt),
                        incrementUnread: true
                    });
                }
            }
            catch (userEmitError) {
                console.warn('Failed to emit conversation_updated to receiver:', userEmitError);
            }
        }
        catch (emitError) {
            console.warn('Failed to emit new_message via socket:', emitError);
        }
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
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 50;
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
