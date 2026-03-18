import { Router } from 'express';
import * as mediaController from '../controllers/media.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { tenantGuard } from '../middleware/tenant.middleware.js';

const router = Router();

// Only ADMIN and MANAGER have permission to upload/manage media
router.use(authenticate, tenantGuard, authorize('ADMIN', 'MANAGER'));

router.post('/upload', mediaController.uploadMedia);

export default router;
