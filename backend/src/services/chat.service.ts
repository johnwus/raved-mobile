import { pgPool } from '../config/database';
import { Message } from '../models/mongoose/message.model';
import { getTimeAgo, getAvatarUrl } from '../utils';
import { notificationsController } from '../controllers/notifications.controller';

export const chatService = {
  // Create or get existing conversation between two users
  async getOrCreateConversation(userId1: string, userId2: string) {
    // Check if conversation already exists
    const existingConv = await pgPool.query(`
      SELECT c.* FROM conversations c
      WHERE (c.participant1_id = $1 AND c.participant2_id = $2)
         OR (c.participant1_id = $2 AND c.participant2_id = $1)
    `, [userId1, userId2]);

    if (existingConv.rows.length > 0) {
      return existingConv.rows[0];
    }

    // Create new conversation
    const newConv = await pgPool.query(`
      INSERT INTO conversations (participant1_id, participant2_id, created_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING *
    `, [userId1, userId2]);

    return newConv.rows[0];
  },

  // Get user conversations
  async getUserConversations(userId: string) {
    const conversations = await pgPool.query(`
      SELECT
        c.id,
        c.created_at,
        c.last_message_at,
        CASE
          WHEN c.participant1_id = $1 THEN c.participant2_id
          ELSE c.participant1_id
        END as other_participant_id,
        u.username,
        u.first_name,
        u.last_name,
        u.avatar_url,
        COALESCE(c.unread_count1, 0) as unread_count,
        m.content as last_message,
        m.created_at as last_message_time
      FROM conversations c
      JOIN users u ON (
        CASE
          WHEN c.participant1_id = $1 THEN c.participant2_id = u.id
          ELSE c.participant1_id = u.id
        END
      )
      LEFT JOIN messages m ON c.last_message_id::uuid = m.id
      WHERE (c.participant1_id = $1 OR c.participant2_id = $1)
        AND c.deleted_at IS NULL
      ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC
    `, [userId]);

    return conversations.rows.map(conv => ({
      id: conv.id,
      otherParticipant: {
        id: conv.other_participant_id,
        username: conv.username,
        name: `${conv.first_name} ${conv.last_name}`,
        avatarUrl: getAvatarUrl(conv.avatar_url, conv.other_participant_id)
      },
      lastMessage: conv.last_message ? {
        content: conv.last_message,
        timeAgo: getTimeAgo(conv.last_message_time),
        createdAt: conv.last_message_time
      } : null,
      unreadCount: parseInt(conv.unread_count),
      createdAt: conv.created_at,
      lastMessageAt: conv.last_message_at
    }));
  },

  // Get conversation details
  async getConversation(conversationId: string, userId: string) {
    // Verify user is participant
    const convCheck = await pgPool.query(`
      SELECT c.*, u1.username as p1_username, u1.first_name as p1_first, u1.last_name as p1_last, u1.avatar_url as p1_avatar,
             u2.username as p2_username, u2.first_name as p2_first, u2.last_name as p2_last, u2.avatar_url as p2_avatar
      FROM conversations c
      JOIN users u1 ON c.participant1_id = u1.id
      JOIN users u2 ON c.participant2_id = u2.id
      WHERE c.id = $1 AND (c.participant1_id = $2 OR c.participant2_id = $2)
        AND c.deleted_at IS NULL
    `, [conversationId, userId]);

    if (convCheck.rows.length === 0) {
      throw new Error('Conversation not found');
    }

    const conv = convCheck.rows[0];
    const otherParticipant = conv.participant1_id === userId ? {
      id: conv.participant2_id,
      username: conv.p2_username,
      name: `${conv.p2_first} ${conv.p2_last}`,
      avatarUrl: getAvatarUrl(conv.p2_avatar, conv.participant2_id)
    } : {
      id: conv.participant1_id,
      username: conv.p1_username,
      name: `${conv.p1_first} ${conv.p1_last}`,
      avatarUrl: getAvatarUrl(conv.p1_avatar, conv.participant1_id)
    };

    return {
      id: conv.id,
      otherParticipant,
      createdAt: conv.created_at,
      lastMessageAt: conv.last_message_at
    };
  },

  // Send message
  async sendMessage(conversationId: string, senderId: string, content: string, type: string = 'text') {
    // Verify user is participant
    const convCheck = await pgPool.query(`
      SELECT * FROM conversations
      WHERE id = $1 AND (participant1_id = $2 OR participant2_id = $2)
        AND deleted_at IS NULL
    `, [conversationId, senderId]);

    if (convCheck.rows.length === 0) {
      throw new Error('Conversation not found or access denied');
    }

    // Save message to database
    const message = await Message.create({
      conversationId,
      senderId,
      receiverId: convCheck.rows[0].participant1_id === senderId
        ? convCheck.rows[0].participant2_id
        : convCheck.rows[0].participant1_id,
      messageType: type,
      content,
      isRead: false,
      isDelivered: false
    });

    // Update conversation last message
    const receiverId = convCheck.rows[0].participant1_id === senderId
      ? convCheck.rows[0].participant2_id
      : convCheck.rows[0].participant1_id;

    await pgPool.query(`
      UPDATE conversations
      SET last_message_id = $1,
          last_message_at = CURRENT_TIMESTAMP,
          unread_count2 = CASE WHEN participant1_id = $3 THEN unread_count2 + 1 ELSE unread_count2 END,
          unread_count1 = CASE WHEN participant2_id = $3 THEN unread_count1 + 1 ELSE unread_count1 END
      WHERE id = $2
    `, [message._id.toString(), conversationId, receiverId]);

    // Send push notification for new message
    try {
      // Get sender details for notification
      const senderResult = await pgPool.query(
        'SELECT first_name, last_name FROM users WHERE id = $1',
        [senderId]
      );
      const sender = senderResult.rows[0];

      const senderName = `${sender.first_name} ${sender.last_name}`;

      // Create notification using the controller
      await notificationsController.createNotification(
        receiverId,
        'message',
        'New Message',
        `${senderName} sent you a message`,
        senderId,
        { conversationId, messageId: message._id, type: 'message' }
      );
    } catch (notificationError) {
      console.warn('Failed to send message notification:', notificationError);
    }

    return {
      id: message._id,
      conversationId,
      senderId,
      content,
      type,
      isRead: message.isRead,
      createdAt: message.createdAt,
      timeAgo: getTimeAgo(message.createdAt)
    };
  },

  // Get conversation messages
  async getConversationMessages(conversationId: string, userId: string, page: number = 1, limit: number = 50) {
    // Verify user is participant
    const convCheck = await pgPool.query(`
      SELECT * FROM conversations
      WHERE id = $1 AND (participant1_id = $2 OR participant2_id = $2)
        AND deleted_at IS NULL
    `, [conversationId, userId]);

    if (convCheck.rows.length === 0) {
      throw new Error('Conversation not found or access denied');
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'username first_name last_name avatar_url')
      .lean();

    // Get user info for messages
    const userIds = [...new Set(messages.map(m => m.senderId.toString()))];
    const users = await pgPool.query(
      'SELECT id, username, first_name, last_name, avatar_url FROM users WHERE id = ANY($1)',
      [userIds]
    );

    const userMap: any = {};
    users.rows.forEach(u => {
      userMap[u.id] = {
        id: u.id,
        username: u.username,
        name: `${u.first_name} ${u.last_name}`,
        avatarUrl: getAvatarUrl(u.avatar_url, u.id)
      };
    });

    const enrichedMessages = messages.reverse().map(message => ({
      id: message._id,
      conversationId: message.conversationId,
      sender: userMap[message.senderId.toString()],
      content: message.content,
      type: message.messageType,
      isRead: message.isRead,
      createdAt: message.createdAt,
      timeAgo: getTimeAgo(message.createdAt)
    }));

    return {
      messages: enrichedMessages,
      pagination: {
        page,
        limit,
        hasMore: messages.length === limit
      }
    };
  },

  // Mark messages as read
  async markMessagesAsRead(conversationId: string, userId: string) {
    // Verify user is participant
    const convCheck = await pgPool.query(`
      SELECT * FROM conversations
      WHERE id = $1 AND (participant1_id = $2 OR participant2_id = $2)
        AND deleted_at IS NULL
    `, [conversationId, userId]);

    if (convCheck.rows.length === 0) {
      throw new Error('Conversation not found or access denied');
    }

    // Update unread count
    const isParticipant1 = convCheck.rows[0].participant1_id === userId;
    const updateField = isParticipant1 ? 'unread_count1 = 0' : 'unread_count2 = 0';

    await pgPool.query(`
      UPDATE conversations
      SET ${updateField}
      WHERE id = $1
    `, [conversationId]);

    // Mark messages as read in MongoDB
    await Message.updateMany(
      { conversationId, readBy: { $ne: userId } },
      { $push: { readBy: userId } }
    );

    return { success: true };
  },

  // Delete conversation
  async deleteConversation(conversationId: string, userId: string) {
    // Verify user is participant
    const convCheck = await pgPool.query(`
      SELECT * FROM conversations
      WHERE id = $1 AND (participant1_id = $2 OR participant2_id = $2)
        AND deleted_at IS NULL
    `, [conversationId, userId]);

    if (convCheck.rows.length === 0) {
      throw new Error('Conversation not found or access denied');
    }

    // Soft delete conversation
    await pgPool.query(`
      UPDATE conversations
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [conversationId]);

    // Soft delete messages
    await Message.updateMany(
      { conversationId },
      { deletedAt: new Date() }
    );

    return { success: true };
  }
};