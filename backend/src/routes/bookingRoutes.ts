import { Router } from 'express';
import { body } from 'express-validator';
import * as bookingController from '../controllers/bookingController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

// Get bookings
router.get('/', bookingController.getBookings);
router.get('/:id', bookingController.getBookingById);

// Create booking (customer)
router.post(
  '/',
  authorize('customer', 'admin'),
  [
    body('service_id').isUUID().withMessage('Valid service ID is required'),
    body('scheduled_date').isDate().withMessage('Valid date is required'),
    body('scheduled_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time is required (HH:MM)'),
    body('address').notEmpty().withMessage('Address is required'),
    body('notes').optional(),
    validate,
  ],
  bookingController.createBooking
);

// Update booking status (provider/admin)
router.put(
  '/:id/status',
  [
    body('status').isIn(['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled']),
    body('cancellation_reason').optional(),
    validate,
  ],
  bookingController.updateBookingStatus
);

// Cancel booking (customer)
router.post(
  '/:id/cancel',
  authorize('customer', 'admin'),
  bookingController.cancelBooking
);

// Stats routes
router.get('/stats/provider', authorize('provider'), bookingController.getProviderStats);
router.get('/stats/customer', authorize('customer'), bookingController.getCustomerStats);

export default router;
