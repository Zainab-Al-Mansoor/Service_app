import { Router } from 'express';
import { body, query } from 'express-validator';
import * as serviceController from '../controllers/serviceController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Public routes
router.get('/', serviceController.getServices);
router.get('/categories', serviceController.getCategories);
router.get('/:id', serviceController.getServiceById);

// Provider routes
router.post(
  '/',
  authenticate,
  authorize('provider', 'admin'),
  [
    body('name').notEmpty().withMessage('Service name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
    body('duration_minutes').optional().isInt({ min: 15 }).withMessage('Duration must be at least 15 minutes'),
    body('category_id').optional().isUUID().withMessage('Invalid category ID'),
    validate,
  ],
  serviceController.createService
);

router.put(
  '/:id',
  authenticate,
  authorize('provider', 'admin'),
  serviceController.updateService
);

router.delete(
  '/:id',
  authenticate,
  authorize('provider', 'admin'),
  serviceController.deleteService
);

// Admin routes for categories
router.post(
  '/categories',
  authenticate,
  authorize('admin'),
  [
    body('name').notEmpty().withMessage('Category name is required'),
    validate,
  ],
  serviceController.createCategory
);

router.put(
  '/categories/:id',
  authenticate,
  authorize('admin'),
  serviceController.updateCategory
);

export default router;
