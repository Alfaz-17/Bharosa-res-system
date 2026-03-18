import { Router } from 'express';
import * as restaurantController from '../controllers/restaurant.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { tenantGuard } from '../middleware/tenant.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

// Apply middleware (must be authenticated and have a valid tenant)
router.use(authenticate, tenantGuard);

// Only SUPER_ADMIN can view and change restaurant settings
router.get('/settings', authorize('SUPER_ADMIN'), restaurantController.getSettings);
router.put('/settings', authorize('SUPER_ADMIN'), validate(restaurantController.updateSettingsSchema), restaurantController.updateSettings);

export default router;
