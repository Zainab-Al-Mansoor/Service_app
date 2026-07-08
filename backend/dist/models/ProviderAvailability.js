"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importDefault(require("./User"));
class ProviderAvailability extends sequelize_1.Model {
}
ProviderAvailability.init({
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
    day_of_week: {
        type: sequelize_1.DataTypes.TINYINT,
        allowNull: false,
        validate: {
            min: 0,
            max: 6,
        },
    },
    start_time: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: false,
    },
    end_time: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: false,
    },
    is_available: {
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
    tableName: 'provider_availability',
    timestamps: false,
    indexes: [
        { fields: ['provider_id'] },
    ],
});
// Associations
ProviderAvailability.belongsTo(User_1.default, { foreignKey: 'provider_id', as: 'provider' });
User_1.default.hasMany(ProviderAvailability, { foreignKey: 'provider_id', as: 'availability' });
exports.default = ProviderAvailability;
//# sourceMappingURL=ProviderAvailability.js.map