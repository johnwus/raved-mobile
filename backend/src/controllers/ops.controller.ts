import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Post } from '../models/mongoose/post.model';
import { Story } from '../models/mongoose/story.model';
import { Comment } from '../models/mongoose/comment.model';
import { Like } from '../models/mongoose/like.model';
import { Notification } from '../models/mongoose/notification.model';

async function getIndexHealth(req: Request, res: Response) {
  try {
    const db = mongoose.connection;

    const postIndexes = await Post.collection.indexes();
    const storyIndexes = await Story.collection.indexes();
    const commentIndexes = await Comment.collection.indexes();
    const likeIndexes = await Like.collection.indexes();
    const notificationIndexes = await Notification.collection.indexes();

    const storyTtl = storyIndexes.find((i: any) => i.name?.includes('expiresAt')) || null;

    res.json({
      success: true,
      mongo: {
        name: db.name,
        host: (db as any).client?.s?.host || undefined,
      },
      indexes: {
        post: postIndexes,
        story: storyIndexes,
        comment: commentIndexes,
        like: likeIndexes,
        notification: notificationIndexes,
      },
      ttl: {
        stories: storyTtl ? { key: 'expiresAt', expireAfterSeconds: storyTtl.expireAfterSeconds } : null,
      }
    });
  } catch (error) {
    console.error('Index health error', error);
    res.status(500).json({ success: false, error: 'Failed to read index health' });
  }
}

async function getSalesLinkCoverage(req: Request, res: Response) {
  try {
    const totalForSale = await Post.countDocuments({ isForSale: true });
    const withLink = await Post.countDocuments({ isForSale: true, 'saleDetails.storeItemId': { $exists: true, $ne: null } });

    res.json({ success: true, totalForSale, withStoreLink: withLink, coverage: totalForSale ? Math.round((withLink / totalForSale) * 100) : 100 });
  } catch (error) {
    console.error('Sales link coverage error', error);
    res.status(500).json({ success: false, error: 'Failed to compute coverage' });
  }
}

export const opsController = {
  getIndexHealth,
  getSalesLinkCoverage,
};
