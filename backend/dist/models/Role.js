"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../config/database"));
class Role extends sequelize_1.Model {
}
Role.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: () => (0, uuid_1.v4)(),
    },
    role_name: {
        type: sequelize_1.DataTypes.ENUM('customer', 'provider', 'admin'),
        allowNull: false,
        unique: true,
    },
    description: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
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
    tableName: 'roles',
    timestamps: false,
});
exports.default = Role;
//# sourceMappingURL=Role.js.map