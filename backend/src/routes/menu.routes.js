import { Router } from 'express';
import * as menuController from '../controllers/menu.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { tenantGuard } from '../middleware/tenant.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

// Apply middleware in this order on protected routes
router.use(authenticate, tenantGuard);

// ─── Categories ───────────────────────────────────────────────────────────────

router.get('/categories', menuController.getCategories);
router.get('/categories/:id', menuController.getCategory);
router.post('/categories', authorize('ADMIN', 'MANAGER'), validate(menuController.categorySchema), menuController.createCategory);
router.put('/categories/:id', authorize('ADMIN', 'MANAGER'), menuController.updateCategory);
router.delete('/categories/:id', authorize('ADMIN', 'MANAGER'), menuController.deleteCategory);

// ─── Items ────────────────────────────────────────────────────────────────────

router.get('/items', menuController.getItems);
router.get('/export', authorize('ADMIN', 'MANAGER'), menuController.exportItems);
router.get('/items/:id', menuController.getItem);
router.post('/items', authorize('ADMIN', 'MANAGER'), validate(menuController.itemSchema), menuController.createItem);
router.put('/items/:id', authorize('ADMIN', 'MANAGER'), menuController.updateItem);
router.delete('/items/:id', authorize('ADMIN', 'MANAGER'), menuController.deleteItem);

export default router;
