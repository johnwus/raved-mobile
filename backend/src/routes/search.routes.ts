import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { searchController } from '../controllers/search.controller';
import { searchRateLimit } from '../middleware/rate-limit.middleware';

const router = Router();

// Advanced search with ranking and filters
router.get('/search/advanced', authenticate, searchRateLimit, searchController.advancedSearch);

export default router;
