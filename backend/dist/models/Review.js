"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importDefault(require("./User"));
const Booking_1 = __importDefault(require("./Booking"));
class Review extends sequelize_1.Model {
}
Review.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: () => (0, uuid_1.v4)(),
    },
    booking_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        unique: true,
        references: {
            model: 'bookings',
            key: 'id',
        },
    },
    customer_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'users',
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
    rating: {
        type: sequelize_1.DataTypes.TINYINT,
        allowNull: false,
        validate: {
            min: 1,
            max: 5,
        },
    },
    comment: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.default,
    tableName: 'reviews',
    timestamps: false,
});
// Associations
Review.belongsTo(Booking_1.default, { foreignKey: 'booking_id', as: 'booking' });
Review.belongsTo(User_1.default, { foreignKey: 'customer_id', as: 'customer' });
Review.belongsTo(User_1.default, { foreignKey: 'provider_id', as: 'provider' });
exports.default = Review;
//# sourceMappingURL=Review.js.map