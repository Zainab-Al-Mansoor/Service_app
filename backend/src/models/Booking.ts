import { DataTypes, Model, Optional, BelongsToGetAssociationMixin } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';
import User from './User';
import Service from './Service';

export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';

interface BookingAttributes {
  id: string;
  customer_id: string;
  service_id: string;
  provider_id: string;
  scheduled_date: Date;
  scheduled_time: string;
  status: BookingStatus;
  address: string;
  notes?: string;
  total_amount: number;
  cancellation_reason?: string;
  created_at: Date;
  updated_at: Date;
  customer?: User;
  provider?: User;
  service?: Service;
}

interface BookingCreationAttributes extends Optional<BookingAttributes, 'id' | 'status' | 'notes' | 'cancellation_reason' | 'created_at' | 'updated_at'> {}

class Booking extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {
  public id!: string;
  public customer_id!: string;
  public service_id!: string;
  public provider_id!: string;
  public scheduled_date!: Date;
  public scheduled_time!: string;
  public status!: BookingStatus;
  public address!: string;
  public notes?: string;
  public total_amount!: number;
  public cancellation_reason?: string;
  public created_at!: Date;
  public updated_at!: Date;

  public customer?: User;
  public provider?: User;
  public service?: Service;

  public getCustomer!: BelongsToGetAssociationMixin<User>;
  public getProvider!: BelongsToGetAssociationMixin<User>;
  public getService!: BelongsToGetAssociationMixin<Service>;
}

Booking.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    customer_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    service_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'services',
        key: 'id',
      },
    },
    provider_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    scheduled_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    scheduled_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'pending',
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'bookings',
    timestamps: false,
    indexes: [
      { fields: ['customer_id'] },
      { fields: ['provider_id'] },
      { fields: ['status'] },
      { fields: ['scheduled_date'] },
    ],
  }
);

// Associations
Booking.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
Booking.belongsTo(User, { foreignKey: 'provider_id', as: 'provider' });
Booking.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });
User.hasMany(Booking, { foreignKey: 'customer_id', as: 'customer_bookings' });
User.hasMany(Booking, { foreignKey: 'provider_id', as: 'provider_bookings' });
Service.hasMany(Booking, { foreignKey: 'service_id', as: 'bookings' });

export default Booking;
export { BookingAttributes, BookingCreationAttributes };
