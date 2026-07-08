"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = exports.getProviders = exports.updateUserStatus = exports.getUserById = exports.getUsers = void 0;
const models_1 = require("../models");
const errorHandler_1 = require("../middleware/errorHandler");
const sequelize_1 = require("sequelize");
// Get all users (admin only)
const getUsers = async (req, res) => {
    try {
        const { role, search, page = 1, limit = 10 } = req.query;
        const whereClause = {};
        // Filter by role
        if (role) {
            const roleRecord = await models_1.Role.findOne({ where: { role_name: role } });
            if (roleRecord) {
                whereClause.role_id = roleRecord.id;
            }
        }
        // Search by name or email
        if (search) {
            whereClause[sequelize_1.Op.or] = [
                { full_name: { [sequelize_1.Op.like]: `%${search}%` } },
                { email: { [sequelize_1.Op.like]: `%${search}%` } },
            ];
        }
        const offset = (Number(page) - 1) * Number(limit);
        const { count, rows } = await models_1.User.findAndCountAll({
            where: whereClause,
            include: [{ model: models_1.Role, as: 'role' }],
            attributes: { exclude: ['password'] },
            order: [['created_at', 'DESC']],
            limit: Number(limit),
            offset,
        });
        res.json({
            success: true,
            data: {
                users: rows.map((user) => ({
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    phone: user.phone,
                    role: user.role?.role_name,
                    is_verified: user.is_verified,
                    is_active: user.is_active,
                    created_at: user.created_at,
                })),
                pagination: {
                    total: count,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(count / Number(limit)),
                },
            },
        });
    }
    catch (error) {
        throw new errorHandler_1.AppError('Failed to fetch users', 500);
    }
};
exports.getUsers = getUsers;
// Get user by ID (admin only)
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await models_1.User.findByPk(id, {
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
                    is_active: user.is_active,
                    created_at: user.created_at,
                },
            },
        });
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError)
            throw error;
        throw new errorHandler_1.AppError('Failed to fetch user', 500);
    }
};
exports.getUserById = getUserById;
// Update user status (admin only)
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active, is_verified, role } = req.body;
        const user = await models_1.User.findByPk(id);
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404);
        }
        const updates = {};
        if (is_active !== undefined)
            updates.is_active = is_active;
        if (is_verified !== undefined)
            updates.is_verified = is_verified;
        if (role) {
            const roleRecord = await models_1.Role.findOne({ where: { role_name: role } });
            if (roleRecord) {
                updates.role_id = roleRecord.id;
            }
        }
        await user.update(updates);
        res.json({
            success: true,
            message: 'User updated successfully',
        });
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError)
            throw error;
        throw new errorHandler_1.AppError('Failed to update user', 500);
    }
};
exports.updateUserStatus = updateUserStatus;
// Get providers (public)
const getProviders = async (req, res) => {
    try {
        const providerRole = await models_1.Role.findOne({ where: { role_name: 'provider' } });
        if (!providerRole) {
            throw new errorHandler_1.AppError('Provider role not found', 404);
        }
        const providers = await models_1.User.findAll({
            where: { role_id: providerRole.id, is_active: true },
            attributes: ['id', 'full_name', 'avatar_url', 'is_verified', 'created_at'],
            include: [{ model: models_1.Service, as: 'services', where: { is_active: true }, required: false }],
        });
        res.json({
            success: true,
            data: { providers },
        });
    }
    catch (error) {
        throw new errorHandler_1.AppError('Failed to fetch providers', 500);
    }
};
exports.getProviders = getProviders;
// Get dashboard stats (admin only)
const getStats = async (req, res) => {
    try {
        const totalUsers = await models_1.User.count();
        const totalServices = await models_1.Service.count();
        const totalBookings = await models_1.Booking.count();
        const completedBookings = await models_1.Booking.findAll({
            where: { status: 'completed' },
            attributes: ['total_amount'],
        });
        const totalRevenue = completedBookings.reduce((sum, booking) => sum + Number(booking.total_amount), 0);
        const pendingBookings = await models_1.Booking.count({ where: { status: 'pending' } });
        const acceptedBookings = await models_1.Booking.count({ where: { status: 'accepted' } });
        const completedBookingsCount = await models_1.Booking.count({ where: { status: 'completed' } });
        const cancelledBookings = await models_1.Booking.count({ where: { status: 'cancelled' } });
        res.json({
            success: true,
            data: {
                totalUsers,
                totalServices,
                totalBookings,
                totalRevenue,
                bookingStats: {
                    pending: pendingBookings,
                    accepted: acceptedBookings,
                    completed: completedBookingsCount,
                    cancelled: cancelledBookings,
                },
            },
        });
    }
    catch (error) {
        throw new errorHandler_1.AppError('Failed to fetch stats', 500);
    }
};
exports.getStats = getStats;
//# sourceMappingURL=userController.js.map