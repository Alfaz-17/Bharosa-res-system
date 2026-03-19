import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { tenantGuard } from '../middleware/tenant.middleware.js';

const router = Router();

router.use(authenticate, tenantGuard);

// Analytics endpoints are strictly for ADMIN and MANAGER
router.use(authorize('ADMIN', 'MANAGER'));

router.get('/revenue', analyticsController.getRevenue);
router.get('/top-items', analyticsController.getTopItems);
router.get('/order-trends', analyticsController.getOrderTrends);
router.get('/export', analyticsController.exportReport);

export default router;
