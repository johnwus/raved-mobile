import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Story } from '../models/mongoose';
import { pgPool } from '../config/database';

export const createStory = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const userId = req.user.id;
        const { type, content, text, thumbnail, allowReplies, addToHighlights } = req.body;
        
        const story = await Story.create({
            userId,
            type,
            content,
            text,
            thumbnail,
            allowReplies: allowReplies !== false,
            addToHighlights: addToHighlights || false
        });
        
        res.json({
            success: true,
            message: 'Story created successfully',
            story: {
                id: story._id,
                type: story.type,
                content: story.content,
                expiresAt: story.expiresAt,
                createdAt: story.createdAt
            }
        });
        
    } catch (error) {
        console.error('Create Story Error:', error);
        res.status(500).json({ error: 'Failed to create story' });
    }
};

export const getStories = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        
        // Get following users
        const connections = await pgPool.query(
            'SELECT following_id FROM connections WHERE follower_id = $1',
            [userId]
        );
        
        const followingIds = connections.rows.map(r => r.following_id);
        followingIds.push(userId);
        
        // Get active stories
        const stories = await Story.find({
            userId: { $in: followingIds },
            expiresAt: { $gt: new Date() }
        })
        .sort({ createdAt: -1 })
        .lean();
        
        // Group by user and track viewed stories
        const storyGroups: any = {};
        const viewedStories = new Set(); // TODO: In production, get from database table 'story_views'

        // Get viewed stories for current user
        try {
            const viewedResult = await pgPool.query(`
                SELECT story_id FROM story_views
                WHERE user_id = $1
            `, [userId]);

            viewedResult.rows.forEach(row => viewedStories.add(row.story_id));
        } catch (error) {
            console.warn('Could not fetch viewed stories:', error);
        }

        stories.forEach(story => {
            if (!storyGroups[story.userId]) {
                storyGroups[story.userId] = [];
            }
            storyGroups[story.userId].push({
                ...story.toObject(),
                viewed: viewedStories.has(story._id.toString())
            });
        });
        
        // Get user info
        const userIds = Object.keys(storyGroups);
        const users = await pgPool.query(
            'SELECT id, username, first_name, last_name, avatar_url FROM users WHERE id = ANY($1)',
            [userIds]
        );
        
        const result = users.rows.map(u => ({
            user: {
            id: u.id,
            username: u.username,
            name: `${u.first_name} ${u.last_name}`,
            avatarUrl: u.avatar_url
            },
            stories: storyGroups[u.id],
            hasUnviewed: storyGroups[u.id].some((story: any) => !story.viewed)
        }));
        
        res.json({
            success: true,
            storyGroups: result
        });
        
    } catch (error) {
        console.error('Get Stories Error:', error);
        res.status(500).json({ error: 'Failed to get stories' });
    }
};
