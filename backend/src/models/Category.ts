import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';

interface CategoryAttributes {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'is_active' | 'sort_order' | 'created_at' | 'updated_at'> {}

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  public id!: string;
  public name!: string;
  public description?: string;
  public icon_url?: string;
  public is_active!: boolean;
  public sort_order!: number;
  public created_at!: Date;
  public updated_at!: Date;
}

Category.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    icon_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
    tableName: 'categories',
    timestamps: false,
  }
);

export default Category;
export { CategoryAttributes, CategoryCreationAttributes };
