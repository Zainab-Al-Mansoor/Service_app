"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategory = exports.createCategory = exports.getCategories = exports.deleteService = exports.updateService = exports.createService = exports.getServiceById = exports.getServices = void 0;
const models_1 = require("../models");
const errorHandler_1 = require("../middleware/errorHandler");
const sequelize_1 = require("sequelize");
// Get all services (public)
const getServices = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 12, provider_id } = req.query;
        const whereClause = { is_active: true };
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
            whereClause[sequelize_1.Op.or] = [
                { name: { [sequelize_1.Op.like]: `%${search}%` } },
                { description: { [sequelize_1.Op.like]: `%${search}%` } },
            ];
        }
        const offset = (Number(page) - 1) * Number(limit);
        const { count, rows } = await models_1.Service.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: models_1.User,
                    as: 'provider',
                    attributes: ['id', 'full_name', 'avatar_url', 'phone'],
                },
                {
                    model: models_1.Category,
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
    }
    catch (error) {
        throw new errorHandler_1.AppError('Failed to fetch services', 500);
    }
};
exports.getServices = getServices;
// Get service by ID (public)
const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await models_1.Service.findByPk(id, {
            include: [
                {
                    model: models_1.User,
                    as: 'provider',
                    attributes: ['id', 'full_name', 'avatar_url', 'phone', 'email', 'is_verified'],
                },
                {
                    model: models_1.Category,
                    as: 'category',
                    attributes: ['id', 'name'],
                },
            ],
        });
        if (!service) {
            throw new errorHandler_1.AppError('Service not found', 404);
        }
        res.json({
            success: true,
            data: { service },
        });
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError)
            throw error;
        throw new errorHandler_1.AppError('Failed to fetch service', 500);
    }
};
exports.getServiceById = getServiceById;
// Create service (provider only)
const createService = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, description, price, duration_minutes, category_id } = req.body;
        const service = await models_1.Service.create({
            provider_id: userId,
            name,
            description,
            price,
            duration_minutes: duration_minutes || 60,
            category_id,
        });
        const newService = await models_1.Service.findByPk(service.id, {
            include: [
                { model: models_1.User, as: 'provider', attributes: ['id', 'full_name'] },
                { model: models_1.Category, as: 'category', attributes: ['id', 'name'] },
            ],
        });
        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: { service: newService },
        });
    }
    catch (error) {
        throw new errorHandler_1.AppError('Failed to create service', 500);
    }
};
exports.createService = createService;
// Update service (provider only)
const updateService = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const { name, description, price, duration_minutes, category_id, is_active } = req.body;
        const service = await models_1.Service.findByPk(id);
        if (!service) {
            throw new errorHandler_1.AppError('Service not found', 404);
        }
        // Check ownership (or admin role)
        if (service.provider_id !== userId && req.user.roleName !== 'admin') {
            throw new errorHandler_1.AppError('You are not authorized to update this service', 403);
        }
        await service.update({
            name: name || service.name,
            description: description || service.description,
            price: price || service.price,
            duration_minutes: duration_minutes || service.duration_minutes,
            category_id: category_id !== undefined ? category_id : service.category_id,
            is_active: is_active !== undefined ? is_active : service.is_active,
        });
        const updatedService = await models_1.Service.findByPk(id, {
            include: [
                { model: models_1.User, as: 'provider', attributes: ['id', 'full_name'] },
                { model: models_1.Category, as: 'category', attributes: ['id', 'name'] },
            ],
        });
        res.json({
            success: true,
            message: 'Service updated successfully',
            data: { service: updatedService },
        });
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError)
            throw error;
        throw new errorHandler_1.AppError('Failed to update service', 500);
    }
};
exports.updateService = updateService;
// Delete service (provider only)
const deleteService = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const service = await models_1.Service.findByPk(id);
        if (!service) {
            throw new errorHandler_1.AppError('Service not found', 404);
        }
        // Check ownership (or admin role)
        if (service.provider_id !== userId && req.user.roleName !== 'admin') {
            throw new errorHandler_1.AppError('You are not authorized to delete this service', 403);
        }
        await service.destroy();
        res.json({
            success: true,
            message: 'Service deleted successfully',
        });
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError)
            throw error;
        throw new errorHandler_1.AppError('Failed to delete service', 500);
    }
};
exports.deleteService = deleteService;
// Get categories (public)
const getCategories = async (req, res) => {
    try {
        const categories = await models_1.Category.findAll({
            where: { is_active: true },
            order: [['sort_order', 'ASC']],
        });
        res.json({
            success: true,
            data: { categories },
        });
    }
    catch (error) {
        throw new errorHandler_1.AppError('Failed to fetch categories', 500);
    }
};
exports.getCategories = getCategories;
// Create category (admin only)
const createCategory = async (req, res) => {
    try {
        const { name, description, sort_order } = req.body;
        const existingCategory = await models_1.Category.findOne({ where: { name } });
        if (existingCategory) {
            throw new errorHandler_1.AppError('Category with this name already exists', 409);
        }
        const category = await models_1.Category.create({
            name,
            description,
            sort_order: sort_order || 0,
        });
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: { category },
        });
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError)
            throw error;
        throw new errorHandler_1.AppError('Failed to create category', 500);
    }
};
exports.createCategory = createCategory;
// Update category (admin only)
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, is_active, sort_order } = req.body;
        const category = await models_1.Category.findByPk(id);
        if (!category) {
            throw new errorHandler_1.AppError('Category not found', 404);
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
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError)
            throw error;
        throw new errorHandler_1.AppError('Failed to update category', 500);
    }
};
exports.updateCategory = updateCategory;
//# sourceMappingURL=serviceController.js.map