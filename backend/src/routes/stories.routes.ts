import { Router } from 'express';
import { body } from 'express-validator';
import {
  createStory,
  getStories,
} from '../controllers/stories.controller';
import { authenticate } from '../middleware/auth.middleware';
import { moderateStory } from '../middleware/moderation.middleware';

const router = Router();

router.post('/', authenticate, moderateStory, [
    body('type').isIn(['image', 'video', 'template', 'text']),
    body('content').notEmpty(),
], createStory);

router.get('/', authenticate, getStories);

export default router;
