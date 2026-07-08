"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const authenticate = (req, res, next) => {
    const token = (0, jwt_1.extractTokenFromHeader)(req.headers.authorization);
    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.',
        });
        return;
    }
    const decoded = (0, jwt_1.verifyToken)(token);
    if (!decoded) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token.',
        });
        return;
    }
    req.user = decoded;
    next();
};
exports.authenticate = authenticate;
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Access denied. User not authenticated.',
            });
            return;
        }
        if (!allowedRoles.includes(req.user.roleName)) {
            res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.',
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
const optionalAuth = (req, res, next) => {
    const token = (0, jwt_1.extractTokenFromHeader)(req.headers.authorization);
    if (token) {
        const decoded = (0, jwt_1.verifyToken)(token);
        if (decoded) {
            req.user = decoded;
        }
    }
    next();
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map