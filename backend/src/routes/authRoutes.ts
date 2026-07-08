import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

const router = Router();

// Register
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('full_name').notEmpty().withMessage('Full name is required'),
    body('role')
      .optional()
      .isIn(['customer', 'provider'])
      .withMessage('Invalid role'),
    validate,
  ],
  authController.register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  authController.login
);

// Get current user
router.get('/me', authenticate, authController.getMe);

// Update profile
router.put(
  '/profile',
  authenticate,
  [
    body('full_name').optional().notEmpty().withMessage('Full name cannot be empty'),
    body('phone').optional(),
    body('avatar_url').optional().isURL().withMessage('Invalid avatar URL'),
    validate,
  ],
  authController.updateProfile
);

export default router;
