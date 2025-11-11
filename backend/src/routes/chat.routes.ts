import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { moderateMessage } from '../middleware/moderation.middleware';
import { chatService } from '../services/chat.service';

const router = Router();

// Get user chats/conversations
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const chats = await chatService.getUserConversations(userId);

    res.json({
      success: true,
      chats,
      count: chats.length
    });
  } catch (error: any) {
    console.error('Get Chats Error:', error);
    res.status(500).json({ error: error.message || 'Failed to get chats' });
  }
});

// Get single chat/conversation
router.get('/:chatId', authenticate, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await chatService.getConversation(chatId, userId);

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
  } catch (error: any) {
    console.error('Get Chat Error:', error);
    res.status(404).json({ error: error.message || 'Chat not found' });
  }
});

// Send message
router.post('/:chatId/messages', authenticate, moderateMessage, [
  body('content').trim().notEmpty().isLength({ max: 1000 }),
  body('type').optional().isIn(['text', 'image', 'file'])
], async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const { content, type = 'text' } = req.body;

    const message = await chatService.sendMessage(chatId, userId, content, type);

    res.json({
      success: true,
      message
    });
  } catch (error: any) {
    console.error('Send Message Error:', error);
    res.status(400).json({ error: error.message || 'Failed to send message' });
  }
});

// Get chat messages
router.get('/:chatId/messages', authenticate, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await chatService.getConversationMessages(chatId, userId, page, limit);

    res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Get Messages Error:', error);
    res.status(400).json({ error: error.message || 'Failed to get messages' });
  }
});

// Start new chat
router.post('/', authenticate, [
  body('participantId').notEmpty(),
  body('initialMessage').optional().trim().isLength({ max: 1000 })
], async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { participantId, initialMessage } = req.body;

    const conversation = await chatService.getOrCreateConversation(userId, participantId);

    let message = null;
    if (initialMessage) {
      // Apply moderation to initial message
      const moderationResult = await require('../services/moderation-queue.service').moderationQueueService.processContent(
        `temp_message_${conversation.id}_${Date.now()}`,
        'message',
        userId,
        initialMessage
      );

      if (moderationResult.shouldBlock) {
        return res.status(400).json({
          error: 'Initial message violates community guidelines',
          moderation: {
            flagged_categories: moderationResult.moderationResult.flagged_categories,
            severity: moderationResult.moderationResult.severity,
          },
        });
      }

      message = await chatService.sendMessage(conversation.id, userId, initialMessage, 'text');
    }

    res.json({
      success: true,
      conversation,
      initialMessage: message
    });
  } catch (error: any) {
    console.error('Start Chat Error:', error);
    res.status(400).json({ error: error.message || 'Failed to start chat' });
  }
});

// Legacy start new chat (keeping for compatibility)
router.post('/legacy', authenticate, [
  body('participantId').notEmpty(),
  body('initialMessage').optional().trim().isLength({ max: 1000 })
], async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { participantId, initialMessage } = req.body;

    const conversation = await chatService.getOrCreateConversation(userId, participantId);

    let message = null;
    if (initialMessage) {
      message = await chatService.sendMessage(conversation.id, userId, initialMessage, 'text');
    }

    res.json({
      success: true,
      conversation,
      initialMessage: message
    });
  } catch (error: any) {
    console.error('Start Chat Error:', error);
    res.status(400).json({ error: error.message || 'Failed to start chat' });
  }
});

// Mark messages as read
router.patch('/:chatId/read', authenticate, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    await chatService.markMessagesAsRead(chatId, userId);

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error: any) {
    console.error('Mark Read Error:', error);
    res.status(400).json({ error: error.message || 'Failed to mark messages as read' });
  }
});

// Delete chat
router.delete('/:chatId', authenticate, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    await chatService.deleteConversation(chatId, userId);

    res.json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete Chat Error:', error);
    res.status(400).json({ error: error.message || 'Failed to delete chat' });
  }
});

export default router;