"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importDefault(require("./User"));
const Service_1 = __importDefault(require("./Service"));
class Booking extends sequelize_1.Model {
}
Booking.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: () => (0, uuid_1.v4)(),
    },
    customer_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    service_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'services',
            key: 'id',
        },
    },
    provider_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    scheduled_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    scheduled_time: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'pending',
    },
    address: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    notes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    total_amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    cancellation_reason: {
        type: sequelize_1.DataTypes.TEXT,
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
    tableName: 'bookings',
    timestamps: false,
    indexes: [
        { fields: ['customer_id'] },
        { fields: ['provider_id'] },
        { fields: ['status'] },
        { fields: ['scheduled_date'] },
    ],
});
// Associations
Booking.belongsTo(User_1.default, { foreignKey: 'customer_id', as: 'customer' });
Booking.belongsTo(User_1.default, { foreignKey: 'provider_id', as: 'provider' });
Booking.belongsTo(Service_1.default, { foreignKey: 'service_id', as: 'service' });
User_1.default.hasMany(Booking, { foreignKey: 'customer_id', as: 'customer_bookings' });
User_1.default.hasMany(Booking, { foreignKey: 'provider_id', as: 'provider_bookings' });
Service_1.default.hasMany(Booking, { foreignKey: 'service_id', as: 'bookings' });
exports.default = Booking;
//# sourceMappingURL=Booking.js.map