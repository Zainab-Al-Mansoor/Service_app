"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getMe = exports.login = exports.register = void 0;
const models_1 = require("../models");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const errorHandler_1 = require("../middleware/errorHandler");
const register = async (req, res) => {
    try {
        const { email, password, full_name, phone, role } = req.body;
        // Check if user already exists
        const existingUser = await models_1.User.findOne({ where: { email } });
        if (existingUser) {
            throw new errorHandler_1.AppError('User with this email already exists', 409);
        }
        // Get role
        const requestedRole = role || 'customer';
        const roleRecord = await models_1.Role.findOne({ where: { role_name: requestedRole } });
        if (!roleRecord) {
            throw new errorHandler_1.AppError('Invalid role', 400);
        }
        // Hash password
        const hashedPassword = await (0, password_1.hashPassword)(password);
        // Create user
        const user = await models_1.User.create({
            email,
            password: hashedPassword,
            full_name,
            phone,
            role_id: roleRecord.id,
        });
        // Fetch user with role
        const newUser = await models_1.User.findByPk(user.id, {
            include: [{ model: models_1.Role, as: 'role' }],
        });
        // Generate token
        const token = (0, jwt_1.generateToken)({
            userId: newUser.id,
            email: newUser.email,
            roleId: newUser.role_id,
            roleName: newUser.role.role_name,
        });
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    full_name: newUser.full_name,
                    phone: newUser.phone,
                    role: newUser.role.role_name,
                    is_verified: newUser.is_verified,
                    created_at: newUser.created_at,
                },
                token,
            },
        });
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            throw error;
        }
        throw new errorHandler_1.AppError('Registration failed', 500);
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user with role
        const user = await models_1.User.findOne({
            where: { email },
            include: [{ model: models_1.Role, as: 'role' }],
        });
        if (!user) {
            throw new errorHandler_1.AppError('Invalid email or password', 401);
        }
        // Check if user is active
        if (!user.is_active) {
            throw new errorHandler_1.AppError('Your account has been deactivated', 403);
        }
        // Compare password
        const isPasswordValid = await (0, password_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            throw new errorHandler_1.AppError('Invalid email or password', 401);
        }
        // Generate token
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
            roleId: user.role_id,
            roleName: user.role.role_name,
        });
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    phone: user.phone,
                    role: user.role.role_name,
                    is_verified: user.is_verified,
                    created_at: user.created_at,
                },
                token,
            },
        });
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            throw error;
        }
        throw new errorHandler_1.AppError('Login failed', 500);
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await models_1.User.findByPk(userId, {
            include: [{ model: models_1.Role, as: 'role' }],
            attributes: { exclude: ['password'] },
        });
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404);
        }
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    phone: user.phone,
                    avatar_url: user.avatar_url,
                    role: user.role.role_name,
                    is_verified: user.is_verified,
                    created_at: user.created_at,
                },
            },
        });
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            throw error;
        }
        throw new errorHandler_1.AppError('Failed to get user data', 500);
    }
};
exports.getMe = getMe;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { full_name, phone, avatar_url } = req.body;
        const user = await models_1.User.findByPk(userId);
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404);
        }
        await user.update({
            full_name: full_name || user.full_name,
            phone: phone || user.phone,
            avatar_url: avatar_url || user.avatar_url,
        });
        const updatedUser = await models_1.User.findByPk(userId, {
            include: [{ model: models_1.Role, as: 'role' }],
            attributes: { exclude: ['password'] },
        });
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    full_name: updatedUser.full_name,
                    phone: updatedUser.phone,
                    avatar_url: updatedUser.avatar_url,
                    role: updatedUser.role.role_name,
                    is_verified: updatedUser.is_verified,
                },
            },
        });
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            throw error;
        }
        throw new errorHandler_1.AppError('Failed to update profile', 500);
    }
};
exports.updateProfile = updateProfile;
//# sourceMappingURL=authController.js.map