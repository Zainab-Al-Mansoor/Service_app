import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Admin routes
router.get('/', authenticate, authorize('admin'), userController.getUsers);
router.get('/:id', authenticate, authorize('admin'), userController.getUserById);
router.put('/:id/status', authenticate, authorize('admin'), userController.updateUserStatus);

// Public routes
router.get('/providers/list', userController.getProviders);

// Stats (admin only)
router.get('/stats/dashboard', authenticate, authorize('admin'), userController.getStats);

export default router;
