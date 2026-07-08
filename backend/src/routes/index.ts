import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import serviceRoutes from './serviceRoutes';
import bookingRoutes from './bookingRoutes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/services', serviceRoutes);
router.use('/bookings', bookingRoutes);

export default router;
