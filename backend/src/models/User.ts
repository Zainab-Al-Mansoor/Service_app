import { DataTypes, Model, Optional, BelongsToGetAssociationMixin, BelongsToSetAssociationMixin } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';
import Role, { RoleName } from './Role';

interface UserAttributes {
  id: string;
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  role_id: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  role?: Role;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'is_verified' | 'is_active' | 'created_at' | 'updated_at'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password!: string;
  public full_name?: string;
  public phone?: string;
  public avatar_url?: string;
  public role_id!: string;
  public is_verified!: boolean;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  public role?: Role;

  public getRole!: BelongsToGetAssociationMixin<Role>;
  public setRole!: BelongsToSetAssociationMixin<Role, string>;
}

User.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    avatar_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    role_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id',
      },
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    tableName: 'users',
    timestamps: false,
    indexes: [
      { fields: ['email'], unique: true },
      { fields: ['role_id'] },
    ],
  }
);

// Associations
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });

export default User;
export { UserAttributes, UserCreationAttributes };
