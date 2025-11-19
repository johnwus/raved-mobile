import { Router } from 'express';
import { opsController } from '../controllers/ops.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Health: index status & TTL for stories
router.get('/health/indexes', authenticate, opsController.getIndexHealth);

// Metrics: sale posts storeId coverage
router.get('/metrics/sales-link-coverage', authenticate, opsController.getSalesLinkCoverage);

export default router;
