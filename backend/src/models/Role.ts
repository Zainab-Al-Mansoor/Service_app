import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';

export type RoleName = 'customer' | 'provider' | 'admin';

interface RoleAttributes {
  id: string;
  role_name: RoleName;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

interface RoleCreationAttributes extends Optional<RoleAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: string;
  public role_name!: RoleName;
  public description?: string;
  public created_at!: Date;
  public updated_at!: Date;
}

Role.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    role_name: {
      type: DataTypes.ENUM('customer', 'provider', 'admin'),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(255),
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
    tableName: 'roles',
    timestamps: false,
  }
);

export default Role;
