"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../config/database"));
class Category extends sequelize_1.Model {
}
Category.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: () => (0, uuid_1.v4)(),
    },
    name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    icon_url: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
    },
    is_active: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
    sort_order: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
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
    tableName: 'categories',
    timestamps: false,
});
exports.default = Category;
//# sourceMappingURL=Category.js.map