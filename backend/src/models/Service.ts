import { DataTypes, Model, Optional, BelongsToGetAssociationMixin } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';
import User from './User';
import Category from './Category';

interface ServiceAttributes {
  id: string;
  provider_id: string;
  category_id?: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  image_url?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  provider?: User;
  category?: Category;
}

interface ServiceCreationAttributes extends Optional<ServiceAttributes, 'id' | 'category_id' | 'image_url' | 'is_active' | 'duration_minutes' | 'created_at' | 'updated_at'> {}

class Service extends Model<ServiceAttributes, ServiceCreationAttributes> implements ServiceAttributes {
  public id!: string;
  public provider_id!: string;
  public category_id?: string;
  public name!: string;
  public description?: string;
  public price!: number;
  public duration_minutes!: number;
  public image_url?: string;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  public provider?: User;
  public category?: Category;

  public getProvider!: BelongsToGetAssociationMixin<User>;
  public getCategory!: BelongsToGetAssociationMixin<Category>;
}

Service.init(
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
    category_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      defaultValue: 60,
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    is_active: {
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
    tableName: 'services',
    timestamps: false,
    indexes: [
      { fields: ['provider_id'] },
      { fields: ['category_id'] },
      { fields: ['is_active'] },
    ],
  }
);

// Associations
Service.belongsTo(User, { foreignKey: 'provider_id', as: 'provider' });
Service.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
User.hasMany(Service, { foreignKey: 'provider_id', as: 'services' });
Category.hasMany(Service, { foreignKey: 'category_id', as: 'services' });

export default Service;
export { ServiceAttributes, ServiceCreationAttributes };
