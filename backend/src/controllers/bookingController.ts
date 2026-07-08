import { Request, Response } from 'express';
import { Booking, Service, User, Category } from '../models';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';
import { BookingStatus } from '../models/Booking';

// Get all bookings (admin/provider/customer based on role)
export const getBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.roleName;
    const { status, page = 1, limit = 10 } = req.query;

    const whereClause: any = {};

    // Role-based filtering
    if (userRole === 'customer') {
      whereClause.customer_id = userId;
    } else if (userRole === 'provider') {
      whereClause.provider_id = userId;
    }
    // Admin sees all bookings

    // Filter by status
    if (status) {
      whereClause.status = status;
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await Booking.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'full_name', 'email', 'phone', 'avatar_url'],
        },
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'full_name', 'email', 'phone', 'avatar_url'],
        },
        {
          model: Service,
          as: 'service',
          include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
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
  } catch (error) {
    throw new AppError('Failed to fetch bookings', 500);
  }
};

// Get booking by ID
export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.roleName;

    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'full_name', 'email', 'phone', 'avatar_url'],
        },
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'full_name', 'email', 'phone', 'avatar_url'],
        },
        {
          model: Service,
          as: 'service',
          include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
        },
      ],
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Check access rights
    if (
      userRole !== 'admin' &&
      booking.customer_id !== userId &&
      booking.provider_id !== userId
    ) {
      throw new AppError('Access denied', 403);
    }

    res.json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch booking', 500);
  }
};

// Create booking (customer only)
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { service_id, scheduled_date, scheduled_time, address, notes } = req.body;

    // Get service details
    const service = await Service.findByPk(service_id, {
      include: [{ model: User, as: 'provider' }],
    });

    if (!service) {
      throw new AppError('Service not found', 404);
    }

    if (!service.is_active) {
      throw new AppError('This service is currently unavailable', 400);
    }

    // Create booking
    const booking = await Booking.create({
      customer_id: userId,
      service_id,
      provider_id: service.provider_id,
      scheduled_date,
      scheduled_time,
      address,
      notes,
      total_amount: service.price,
    });

    const newBooking = await Booking.findByPk(booking.id, {
      include: [
        { model: User, as: 'customer', attributes: ['id', 'full_name'] },
        { model: User, as: 'provider', attributes: ['id', 'full_name'] },
        { model: Service, as: 'service' },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking: newBooking },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create booking', 500);
  }
};

// Update booking status (provider/admin)
export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, cancellation_reason } = req.body;
    const userId = req.user!.userId;
    const userRole = req.user!.roleName;

    const booking = await Booking.findByPk(id);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Permission checks
    const isProvider = booking.provider_id === userId;
    const isCustomer = booking.customer_id === userId;
    const isAdmin = userRole === 'admin';

    // Define valid transitions
    const validTransitions: Record<string, string[]> = {
      pending: ['accepted', 'rejected', 'cancelled'],
      accepted: ['in_progress', 'cancelled'],
      in_progress: ['completed'],
      completed: [],
      rejected: [],
      cancelled: [],
    };

    if (!validTransitions[booking.status].includes(status)) {
      throw new AppError(`Cannot change status from ${booking.status} to ${status}`, 400);
    }

    // Check permissions for specific transitions
    if (['accepted', 'rejected', 'in_progress', 'completed'].includes(status)) {
      if (!isProvider && !isAdmin) {
        throw new AppError('Only the provider can update this booking status', 403);
      }
    }

    if (status === 'cancelled') {
      if (!isCustomer && !isProvider && !isAdmin) {
        throw new AppError('You are not authorized to cancel this booking', 403);
      }
    }

    const updates: any = { status };
    if (cancellation_reason) {
      updates.cancellation_reason = cancellation_reason;
    }

    await booking.update(updates);

    const updatedBooking = await Booking.findByPk(id, {
      include: [
        { model: User, as: 'customer', attributes: ['id', 'full_name'] },
        { model: User, as: 'provider', attributes: ['id', 'full_name'] },
        { model: Service, as: 'service' },
      ],
    });

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: { booking: updatedBooking },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update booking', 500);
  }
};

// Cancel booking (customer only)
export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user!.userId;

    const booking = await Booking.findByPk(id);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.customer_id !== userId) {
      throw new AppError('You can only cancel your own bookings', 403);
    }

    if (!['pending', 'accepted'].includes(booking.status)) {
      throw new AppError('Cannot cancel this booking', 400);
    }

    await booking.update({
      status: 'cancelled',
      cancellation_reason: reason || 'Cancelled by customer',
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to cancel booking', 500);
  }
};

// Get provider stats
export const getProviderStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const totalBookings = await Booking.count({ where: { provider_id: userId } });
    const pendingBookings = await Booking.count({
      where: { provider_id: userId, status: 'pending' },
    });
    const activeBookings = await Booking.count({
      where: { provider_id: userId, status: 'accepted' },
    });
    const completedBookings = await Booking.count({
      where: { provider_id: userId, status: 'completed' },
    });

    const completedBookingData = await Booking.findAll({
      where: { provider_id: userId, status: 'completed' },
      attributes: ['total_amount'],
    });

    const totalRevenue = completedBookingData.reduce(
      (sum: number, b: any) => sum + Number(b.total_amount),
      0
    );

    const totalServices = await Service.count({
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
  } catch (error) {
    throw new AppError('Failed to fetch provider stats', 500);
  }
};

// Get customer stats
export const getCustomerStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const totalBookings = await Booking.count({ where: { customer_id: userId } });
    const pendingBookings = await Booking.count({
      where: { customer_id: userId, status: 'pending' },
    });
    const activeBookings = await Booking.count({
      where: { customer_id: userId, status: 'accepted' },
    });
    const completedBookings = await Booking.count({
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
  } catch (error) {
    throw new AppError('Failed to fetch customer stats', 500);
  }
};
