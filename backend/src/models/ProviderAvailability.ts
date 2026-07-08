import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';
import User from './User';

interface ProviderAvailabilityAttributes {
  id: string;
  provider_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}

interface ProviderAvailabilityCreationAttributes extends Optional<ProviderAvailabilityAttributes, 'id' | 'is_available' | 'created_at' | 'updated_at'> {}

class ProviderAvailability extends Model<ProviderAvailabilityAttributes, ProviderAvailabilityCreationAttributes> implements ProviderAvailabilityAttributes {
  public id!: string;
  public provider_id!: string;
  public day_of_week!: number;
  public start_time!: string;
  public end_time!: string;
  public is_available!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
}

ProviderAvailability.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    provider_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    day_of_week: {
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: {
        min: 0,
        max: 6,
      },
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'provider_availability',
    timestamps: false,
    indexes: [
      { fields: ['provider_id'] },
    ],
  }
);

// Associations
ProviderAvailability.belongsTo(User, { foreignKey: 'provider_id', as: 'provider' });
User.hasMany(ProviderAvailability, { foreignKey: 'provider_id', as: 'availability' });

export default ProviderAvailability;
export { ProviderAvailabilityAttributes, ProviderAvailabilityCreationAttributes };
