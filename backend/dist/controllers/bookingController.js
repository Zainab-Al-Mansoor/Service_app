"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerStats = exports.getProviderStats = exports.cancelBooking = exports.updateBookingStatus = exports.createBooking = exports.getBookingById = exports.getBookings = void 0;
const models_1 = require("../models");
const errorHandler_1 = require("../middleware/errorHandler");
// Get all bookings (admin/provider/customer based on role)
const getBookings = async (req, res) => {
    try {
        const userId = req.user.userId;
        const userRole = req.user.roleName;
        const { status, page = 1, limit = 10 } = req.query;
        const whereClause = {};
        // Role-based filtering
        if (userRole === 'customer') {
            whereClause.customer_id = userId;
        }
        else if (userRole === 'provider') {
            whereClause.provider_id = userId;
        }
        // Admin sees all bookings
        // Filter by status
        if (status) {
            whereClause.status = status;
        }
        const offset = (Number(page) - 1) * Number(limit);
        const { count, rows } = await models_1.Booking.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: models_1.User,
                    as: 'customer',
                    attributes: ['id', 'full_name', 'email', 'phone', 'avatar_url'],
                },
                {
                    model: models_1.User,
                    as: 'provider',
                    attributes: ['id', 'full_name', 'email', 'phone', 'avatar_url'],
                },
                {
                    model: models_1.Service,
                    as: 'service',
                    include: [{ model: models_1.Category, as: 'category', attributes: ['id', 'name'] }],
                },
            ],
            order: [['created_at', 'DESC']],
            limit: Number(limit),
            offset,
        });
        res.json({
            success: true,
            data: {
                bookings: rows,
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
        throw new errorHandler_1.AppError('Failed to fetch bookings', 500);
    }
};
exports.getBookings = getBookings;
// Get booking by ID
const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.roleName;
        const booking = await models_1.Booking.findByPk(id, {
            include: [
                {
                    model: models_1.User,
                    as: 'customer',
                    attributes: ['id', 'full_name', 'email', 'phone', 'avatar_url'],
                },
                {
                    model: models_1.User,
                    as: 'provider',
                    attributes: ['id', 'full_name', 'email', 'phone', 'avatar_url'],
                },
                {
                    model: models_1.Service,
                    as: 'service',
                    include: [{ model: models_1.Category, as: 'category', attributes: ['id', 'name'] }],
                },
            ],
        });
        if (!booking) {
            throw new errorHandler_1.AppError('Booking not found', 404);
        }
        // Check access rights
        if (userRole !== 'admin' &&
            booking.customer_id !== userId &&
            booking.provider_id !== userId) {
            throw new errorHandler_1.AppError('Access denied', 403);
        }
        res.json({
            success: true,
            data: { booking },
        });
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError)
            throw error;
        throw new errorHandler_1.AppError('Failed to fetch booking', 500);
    }
};
exports.getBookingById = getBookingById;
// Create booking (customer only)
const createBooking = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { service_id, scheduled_date, scheduled_time, address, notes } = req.body;
        // Get service details
        const service = await models_1.Service.findByPk(service_id, {
            include: [{ model: models_1.User, as: 'provider' }],
        });
        if (!service) {
            throw new errorHandler_1.AppError('Service not found', 404);
        }
        if (!service.is_active) {
            throw new errorHandler_1.AppError('This service is currently unavailable', 400);
        }
        // Create booking
        const booking = await models_1.Booking.create({
            customer_id: userId,
            service_id,
            provider_id: service.provider_id,
            scheduled_date,
            scheduled_time,
            address,
            notes,
            total_amount: service.price,
        });
        const newBooking = await models_1.Booking.findByPk(booking.id, {
            include: [
                { model: models_1.User, as: 'customer', attributes: ['id', 'full_name'] },
                { model: models_1.User, as: 'provider', attributes: ['id', 'full_name'] },
                { model: models_1.Service, as: 'service' },
            ],
        });
        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: { booking: newBooking },
        });
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError)
            throw error;
        throw new errorHandler_1.AppError('Failed to create booking', 500);
    }
};
exports.createBooking = createBooking;
// Update booking status (provider/admin)
const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, cancellation_reason } = req.body;
        const userId = req.user.userId;
        const userRole = req.user.roleName;
        const booking = await models_1.Booking.findByPk(id);
        if (!booking) {
            throw new errorHandler_1.AppError('Booking not found', 404);
        }
        // Permission checks
        const isProvider = booking.provider_id === userId;
        const isCustomer = booking.customer_id === userId;
        const isAdmin = userRole === 'admin';
        // Define valid transitions
        const validTransitions = {
            pending: ['accepted', 'rejected', 'cancelled'],
            accepted: ['in_progress', 'cancelled'],
            in_progress: ['completed'],
            completed: [],
            rejected: [],
            cancelled: [],
        };
        if (!validTransitions[booking.status].includes(status)) {
            throw new errorHandler_1.AppError(`Cannot change status from ${booking.status} to ${status}`, 400);
        }
        // Check permissions for specific transitions
        if (['accepted', 'rejected', 'in_progress', 'completed'].includes(status)) {
            if (!isProvider && !isAdmin) {
                throw new errorHandler_1.AppError('Only the provider can update this booking status', 403);
            }
        }
        if (status === 'cancelled') {
            if (!isCustomer && !isProvider && !isAdmin) {
                throw new errorHandler_1.AppError('You are not authorized to cancel this booking', 403);
            }
        }
        const updates = { status };
        if (cancellation_reason) {
            updates.cancellation_reason = cancellation_reason;
        }
        await booking.update(updates);
        const updatedBooking = await models_1.Booking.findByPk(id, {
            include: [
                { model: models_1.User, as: 'customer', attributes: ['id', 'full_name'] },
                { model: models_1.User, as: 'provider', attributes: ['id', 'full_name'] },
                { model: models_1.Service, as: 'service' },
            ],
        });
        res.json({
            success: true,
            message: 'Booking status updated successfully',
            data: { booking: updatedBooking },
        });
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError)
            throw error;
        throw new errorHandler_1.AppError('Failed to update booking', 500);
    }
};
exports.updateBookingStatus = updateBookingStatus;
// Cancel booking (customer only)
const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userId = req.user.userId;
        const booking = await models_1.Booking.findByPk(id);
        if (!booking) {
            throw new errorHandler_1.AppError('Booking not found', 404);
        }
        if (booking.customer_id !== userId) {
            throw new errorHandler_1.AppError('You can only cancel your own bookings', 403);
        }
        if (!['pending', 'accepted'].includes(booking.status)) {
            throw new errorHandler_1.AppError('Cannot cancel this booking', 400);
        }
        await booking.update({
            status: 'cancelled',
            cancellation_reason: reason || 'Cancelled by customer',
        });
        res.json({
            success: true,
            message: 'Booking cancelled successfully',
        });
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError)
            throw error;
        throw new errorHandler_1.AppError('Failed to cancel booking', 500);
    }
};
exports.cancelBooking = cancelBooking;
// Get provider stats
const getProviderStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const totalBookings = await models_1.Booking.count({ where: { provider_id: userId } });
        const pendingBookings = await models_1.Booking.count({
            where: { provider_id: userId, status: 'pending' },
        });
        const activeBookings = await models_1.Booking.count({
            where: { provider_id: userId, status: 'accepted' },
        });
        const completedBookings = await models_1.Booking.count({
            where: { provider_id: userId, status: 'completed' },
        });
        const completedBookingData = await models_1.Booking.findAll({
            where: { provider_id: userId, status: 'completed' },
            attributes: ['total_amount'],
        });
        const totalRevenue = completedBookingData.reduce((sum, b) => sum + Number(b.total_amount), 0);
        const totalServices = await models_1.Service.count({
            where: { provider_id: userId },
        });
        res.json({
            success: true,
            data: {
                totalBookings,
                pendingBookings,
                activeBookings,
                completedBookings,
                totalRevenue,
                totalServices,
            },
        });
    }
    catch (error) {
        throw new errorHandler_1.AppError('Failed to fetch provider stats', 500);
    }
};
exports.getProviderStats = getProviderStats;
// Get customer stats
const getCustomerStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const totalBookings = await models_1.Booking.count({ where: { customer_id: userId } });
        const pendingBookings = await models_1.Booking.count({
            where: { customer_id: userId, status: 'pending' },
        });
        const activeBookings = await models_1.Booking.count({
            where: { customer_id: userId, status: 'accepted' },
        });
        const completedBookings = await models_1.Booking.count({
            where: { customer_id: userId, status: 'completed' },
        });
        res.json({
            success: true,
            data: {
                totalBookings,
                pendingBookings,
                activeBookings,
                completedBookings,
            },
        });
    }
    catch (error) {
        throw new errorHandler_1.AppError('Failed to fetch customer stats', 500);
    }
};
exports.getCustomerStats = getCustomerStats;
//# sourceMappingURL=bookingController.js.map