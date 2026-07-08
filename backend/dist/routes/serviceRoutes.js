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
const serviceController = __importStar(require("../controllers/serviceController"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
// Public routes
router.get('/', serviceController.getServices);
router.get('/categories', serviceController.getCategories);
router.get('/:id', serviceController.getServiceById);
// Provider routes
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('provider', 'admin'), [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Service name is required'),
    (0, express_validator_1.body)('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
    (0, express_validator_1.body)('duration_minutes').optional().isInt({ min: 15 }).withMessage('Duration must be at least 15 minutes'),
    (0, express_validator_1.body)('category_id').optional().isUUID().withMessage('Invalid category ID'),
    validate_1.validate,
], serviceController.createService);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('provider', 'admin'), serviceController.updateService);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('provider', 'admin'), serviceController.deleteService);
// Admin routes for categories
router.post('/categories', auth_1.authenticate, (0, auth_1.authorize)('admin'), [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Category name is required'),
    validate_1.validate,
], serviceController.createCategory);
router.put('/categories/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), serviceController.updateCategory);
exports.default = router;
//# sourceMappingURL=serviceRoutes.js.map