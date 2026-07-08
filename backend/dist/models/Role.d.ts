import { Model, Optional } from 'sequelize';
export type RoleName = 'customer' | 'provider' | 'admin';
interface RoleAttributes {
    id: string;
    role_name: RoleName;
    description?: string;
    created_at: Date;
    updated_at: Date;
}
interface RoleCreationAttributes extends Optional<RoleAttributes, 'id' | 'created_at' | 'updated_at'> {
}
declare class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
    id: string;
    role_name: RoleName;
    description?: string;
    created_at: Date;
    updated_at: Date;
}
export default Role;
//# sourceMappingURL=Role.d.ts.map