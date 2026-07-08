import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';
import User from './User';
import Booking from './Booking';

interface ReviewAttributes {
  id: string;
  booking_id: string;
  customer_id: string;
  provider_id: string;
  rating: number;
  comment?: string;
  created_at: Date;
}

interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'id' | 'comment' | 'created_at'> {}

class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
  public id!: string;
  public booking_id!: string;
  public customer_id!: string;
  public provider_id!: string;
  public rating!: number;
  public comment?: string;
  public created_at!: Date;
}

Review.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    booking_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      unique: true,
      references: {
        model: 'bookings',
        key: 'id',
      },
    },
    customer_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'users',
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
    rating: {
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'reviews',
    timestamps: false,
  }
);

// Associations
Review.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
Review.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
Review.belongsTo(User, { foreignKey: 'provider_id', as: 'provider' });

export default Review;
export { ReviewAttributes, ReviewCreationAttributes };
