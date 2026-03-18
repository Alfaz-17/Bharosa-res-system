import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { tenantGuard } from '../middleware/tenant.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.use(authenticate, tenantGuard);

router.post('/', authorize('ADMIN', 'MANAGER', 'WAITER'), validate(orderController.createOrderSchema), orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrder);
router.put('/:id/status', authorize('ADMIN', 'MANAGER', 'WAITER', 'KITCHEN'), validate(orderController.updateStatusSchema), orderController.updateOrderStatus);

export default router;
