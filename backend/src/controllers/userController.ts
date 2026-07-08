import { Request, Response } from 'express';
import { User, Role, Service, Booking } from '../models';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';

// Get all users (admin only)
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;

    const whereClause: any = {};

    // Filter by role
    if (role) {
      const roleRecord = await Role.findOne({ where: { role_name: role as string } });
      if (roleRecord) {
        whereClause.role_id = roleRecord.id;
      }
    }

    // Search by name or email
    if (search) {
      whereClause[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      include: [{ model: Role, as: 'role' }],
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
          role: (user.role as any)?.role_name,
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
  } catch (error) {
    throw new AppError('Failed to fetch users', 500);
  }
};

// Get user by ID (admin only)
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw new AppError('User not found', 404);
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
          role: (user.role as any).role_name,
          is_verified: user.is_verified,
          is_active: user.is_active,
          created_at: user.created_at,
        },
      },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch user', 500);
  }
};

// Update user status (admin only)
export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { is_active, is_verified, role } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updates: any = {};
    if (is_active !== undefined) updates.is_active = is_active;
    if (is_verified !== undefined) updates.is_verified = is_verified;

    if (role) {
      const roleRecord = await Role.findOne({ where: { role_name: role } });
      if (roleRecord) {
        updates.role_id = roleRecord.id;
      }
    }

    await user.update(updates);

    res.json({
      success: true,
      message: 'User updated successfully',
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update user', 500);
  }
};

// Get providers (public)
export const getProviders = async (req: Request, res: Response): Promise<void> => {
  try {
    const providerRole = await Role.findOne({ where: { role_name: 'provider' } });
    if (!providerRole) {
      throw new AppError('Provider role not found', 404);
    }

    const providers = await User.findAll({
      where: { role_id: providerRole.id, is_active: true },
      attributes: ['id', 'full_name', 'avatar_url', 'is_verified', 'created_at'],
      include: [{ model: Service, as: 'services', where: { is_active: true }, required: false }],
    });

    res.json({
      success: true,
      data: { providers },
    });
  } catch (error) {
    throw new AppError('Failed to fetch providers', 500);
  }
};

// Get dashboard stats (admin only)
export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.count();
    const totalServices = await Service.count();
    const totalBookings = await Booking.count();

    const completedBookings = await Booking.findAll({
      where: { status: 'completed' },
      attributes: ['total_amount'],
    });

    const totalRevenue = completedBookings.reduce(
      (sum: number, booking: any) => sum + Number(booking.total_amount),
      0
    );

    const pendingBookings = await Booking.count({ where: { status: 'pending' } });
    const acceptedBookings = await Booking.count({ where: { status: 'accepted' } });
    const completedBookingsCount = await Booking.count({ where: { status: 'completed' } });
    const cancelledBookings = await Booking.count({ where: { status: 'cancelled' } });

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
  } catch (error) {
    throw new AppError('Failed to fetch stats', 500);
  }
};
