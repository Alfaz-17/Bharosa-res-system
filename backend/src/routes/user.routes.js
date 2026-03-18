import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { tenantGuard } from '../middleware/tenant.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

// Only SUPER_ADMIN, ADMIN, and MANAGER should manage users
router.use(authenticate, tenantGuard, authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'));

router.get('/', userController.getAll);
router.post('/', validate(userController.createUserSchema), userController.create);
router.patch('/:id', validate(userController.updateUserSchema), userController.update);
router.delete('/:id', authorize('SUPER_ADMIN'), userController.remove);

export default router;
