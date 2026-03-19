import { Router } from 'express';
import * as tableController from '../controllers/table.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { tenantGuard } from '../middleware/tenant.middleware.js';
import { authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/check/:tableNumber', tableController.checkTable);

router.use(authenticate, tenantGuard);

router.get('/', tableController.getTables);
router.post('/', authorize('ADMIN', 'MANAGER'), tableController.createTable);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), tableController.deleteTable);

export default router;
