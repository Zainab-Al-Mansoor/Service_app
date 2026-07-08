"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../config/database"));
const Role_1 = __importDefault(require("./Role"));
class User extends sequelize_1.Model {
}
User.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: () => (0, uuid_1.v4)(),
    },
    email: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    full_name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    phone: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    avatar_url: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
    },
    role_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'roles',
            key: 'id',
        },
    },
    is_verified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
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
    tableName: 'users',
    timestamps: false,
    indexes: [
        { fields: ['email'], unique: true },
        { fields: ['role_id'] },
    ],
});
// Associations
User.belongsTo(Role_1.default, { foreignKey: 'role_id', as: 'role' });
Role_1.default.hasMany(User, { foreignKey: 'role_id', as: 'users' });
exports.default = User;
//# sourceMappingURL=User.js.map