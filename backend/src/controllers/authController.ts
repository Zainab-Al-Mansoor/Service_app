import { Request, Response } from 'express';
import { User, Role, sequelize } from '../models';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, full_name, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Get role
    const requestedRole = role || 'customer';
    const roleRecord = await Role.findOne({ where: { role_name: requestedRole } });
    if (!roleRecord) {
      throw new AppError('Invalid role', 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      full_name,
      phone,
      role_id: roleRecord.id,
    });

    // Fetch user with role
    const newUser = await User.findByPk(user.id, {
      include: [{ model: Role, as: 'role' }],
    });

    // Generate token
    const token = generateToken({
      userId: newUser!.id,
      email: newUser!.email,
      roleId: newUser!.role_id,
      roleName: (newUser!.role as any).role_name,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser!.id,
          email: newUser!.email,
          full_name: newUser!.full_name,
          phone: newUser!.phone,
          role: (newUser!.role as any).role_name,
          is_verified: newUser!.is_verified,
          created_at: newUser!.created_at,
        },
        token,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Registration failed', 500);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user with role
    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role' }],
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.is_active) {
      throw new AppError('Your account has been deactivated', 403);
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      roleId: user.role_id,
      roleName: (user.role as any).role_name,
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
          role: (user.role as any).role_name,
          is_verified: user.is_verified,
          created_at: user.created_at,
        },
        token,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Login failed', 500);
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const user = await User.findByPk(userId, {
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
          created_at: user.created_at,
        },
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to get user data', 500);
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { full_name, phone, avatar_url } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await user.update({
      full_name: full_name || user.full_name,
      phone: phone || user.phone,
      avatar_url: avatar_url || user.avatar_url,
    });

    const updatedUser = await User.findByPk(userId, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password'] },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser!.id,
          email: updatedUser!.email,
          full_name: updatedUser!.full_name,
          phone: updatedUser!.phone,
          avatar_url: updatedUser!.avatar_url,
          role: (updatedUser!.role as any).role_name,
          is_verified: updatedUser!.is_verified,
        },
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to update profile', 500);
  }
};
