import { Model, Optional, BelongsToGetAssociationMixin, BelongsToSetAssociationMixin } from 'sequelize';
import Role from './Role';
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
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'is_verified' | 'is_active' | 'created_at' | 'updated_at'> {
}
declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
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
    getRole: BelongsToGetAssociationMixin<Role>;
    setRole: BelongsToSetAssociationMixin<Role, string>;
}
export default User;
export { UserAttributes, UserCreationAttributes };
//# sourceMappingURL=User.d.ts.map