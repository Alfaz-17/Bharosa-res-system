import { Router } from 'express';
import * as billingController from '../controllers/billing.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { tenantGuard } from '../middleware/tenant.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.use(authenticate, tenantGuard);

router.post('/:orderId/invoice', authorize('ADMIN', 'MANAGER', 'WAITER'), billingController.generateInvoice);
router.get('/:orderId/invoice', authorize('ADMIN', 'MANAGER', 'WAITER'), billingController.getInvoice);
router.post('/:orderId/payments', authorize('ADMIN', 'MANAGER', 'WAITER'), validate(billingController.paymentSchema), billingController.createPayment);

export default router;
