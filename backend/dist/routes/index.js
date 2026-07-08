"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const userRoutes_1 = __importDefault(require("./userRoutes"));
const serviceRoutes_1 = __importDefault(require("./serviceRoutes"));
const bookingRoutes_1 = __importDefault(require("./bookingRoutes"));
const router = (0, express_1.Router)();
// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
    });
});
// Mount routes
router.use('/auth', authRoutes_1.default);
router.use('/users', userRoutes_1.default);
router.use('/services', serviceRoutes_1.default);
router.use('/bookings', bookingRoutes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map