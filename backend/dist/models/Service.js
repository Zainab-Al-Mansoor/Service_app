"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importDefault(require("./User"));
const Category_1 = __importDefault(require("./Category"));
class Service extends sequelize_1.Model {
}
Service.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: () => (0, uuid_1.v4)(),
    },
    provider_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    category_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
        references: {
            model: 'categories',
            key: 'id',
        },
    },
    name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    duration_minutes: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 60,
    },
    image_url: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
    },
    is_active: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updated_at: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.default,
    tableName: 'services',
    timestamps: false,
    indexes: [
        { fields: ['provider_id'] },
        { fields: ['category_id'] },
        { fields: ['is_active'] },
    ],
});
// Associations
Service.belongsTo(User_1.default, { foreignKey: 'provider_id', as: 'provider' });
Service.belongsTo(Category_1.default, { foreignKey: 'category_id', as: 'category' });
User_1.default.hasMany(Service, { foreignKey: 'provider_id', as: 'services' });
Category_1.default.hasMany(Service, { foreignKey: 'category_id', as: 'services' });
exports.default = Service;
//# sourceMappingURL=Service.js.map