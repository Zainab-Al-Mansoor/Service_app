import { Request, Response } from 'express';
import { Service, Category, User, sequelize } from '../models';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';

// Get all services (public)
export const getServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, page = 1, limit = 12, provider_id } = req.query;

    const whereClause: any = { is_active: true };

    // Filter by provider for provider portal
    if (provider_id) {
      whereClause.provider_id = provider_id;
    }

    // Filter by category
    if (category) {
      whereClause.category_id = category;
    }

    // Search by name
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await Service.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'full_name', 'avatar_url', 'phone'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset,
    });

    res.json({
      success: true,
      data: {
        services: rows,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / Number(limit)),
        },
      },
    });
  } catch (error) {
    throw new AppError('Failed to fetch services', 500);
  }
};

// Get service by ID (public)
export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'full_name', 'avatar_url', 'phone', 'email', 'is_verified'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!service) {
      throw new AppError('Service not found', 404);
    }

    res.json({
      success: true,
      data: { service },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch service', 500);
  }
};

// Create service (provider only)
export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { name, description, price, duration_minutes, category_id } = req.body;

    const service = await Service.create({
      provider_id: userId,
      name,
      description,
      price,
      duration_minutes: duration_minutes || 60,
      category_id,
    });

    const newService = await Service.findByPk(service.id, {
      include: [
        { model: User, as: 'provider', attributes: ['id', 'full_name'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: { service: newService },
    });
  } catch (error) {
    throw new AppError('Failed to create service', 500);
  }
};

// Update service (provider only)
export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { name, description, price, duration_minutes, category_id, is_active } = req.body;

    const service = await Service.findByPk(id);

    if (!service) {
      throw new AppError('Service not found', 404);
    }

    // Check ownership (or admin role)
    if (service.provider_id !== userId && req.user!.roleName !== 'admin') {
      throw new AppError('You are not authorized to update this service', 403);
    }

    await service.update({
      name: name || service.name,
      description: description || service.description,
      price: price || service.price,
      duration_minutes: duration_minutes || service.duration_minutes,
      category_id: category_id !== undefined ? category_id : service.category_id,
      is_active: is_active !== undefined ? is_active : service.is_active,
    });

    const updatedService = await Service.findByPk(id, {
      include: [
        { model: User, as: 'provider', attributes: ['id', 'full_name'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
      ],
    });

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: { service: updatedService },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update service', 500);
  }
};

// Delete service (provider only)
export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const service = await Service.findByPk(id);

    if (!service) {
      throw new AppError('Service not found', 404);
    }

    // Check ownership (or admin role)
    if (service.provider_id !== userId && req.user!.roleName !== 'admin') {
      throw new AppError('You are not authorized to delete this service', 403);
    }

    await service.destroy();

    res.json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to delete service', 500);
  }
};

// Get categories (public)
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC']],
    });

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    throw new AppError('Failed to fetch categories', 500);
  }
};

// Create category (admin only)
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, sort_order } = req.body;

    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      throw new AppError('Category with this name already exists', 409);
    }

    const category = await Category.create({
      name,
      description,
      sort_order: sort_order || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create category', 500);
  }
};

// Update category (admin only)
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, is_active, sort_order } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    await category.update({
      name: name || category.name,
      description: description || category.description,
      is_active: is_active !== undefined ? is_active : category.is_active,
      sort_order: sort_order !== undefined ? sort_order : category.sort_order,
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update category', 500);
  }
};
