"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const bookingController = __importStar(require("../controllers/bookingController"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
// All booking routes require authentication
router.use(auth_1.authenticate);
// Get bookings
router.get('/', bookingController.getBookings);
router.get('/:id', bookingController.getBookingById);
// Create booking (customer)
router.post('/', (0, auth_1.authorize)('customer', 'admin'), [
    (0, express_validator_1.body)('service_id').isUUID().withMessage('Valid service ID is required'),
    (0, express_validator_1.body)('scheduled_date').isDate().withMessage('Valid date is required'),
    (0, express_validator_1.body)('scheduled_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time is required (HH:MM)'),
    (0, express_validator_1.body)('address').notEmpty().withMessage('Address is required'),
    (0, express_validator_1.body)('notes').optional(),
    validate_1.validate,
], bookingController.createBooking);
// Update booking status (provider/admin)
router.put('/:id/status', [
    (0, express_validator_1.body)('status').isIn(['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled']),
    (0, express_validator_1.body)('cancellation_reason').optional(),
    validate_1.validate,
], bookingController.updateBookingStatus);
// Cancel booking (customer)
router.post('/:id/cancel', (0, auth_1.authorize)('customer', 'admin'), bookingController.cancelBooking);
// Stats routes
router.get('/stats/provider', (0, auth_1.authorize)('provider'), bookingController.getProviderStats);
router.get('/stats/customer', (0, auth_1.authorize)('customer'), bookingController.getCustomerStats);
exports.default = router;
//# sourceMappingURL=bookingRoutes.js.map