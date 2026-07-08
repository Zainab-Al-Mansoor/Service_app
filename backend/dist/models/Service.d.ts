import { Model, Optional, BelongsToGetAssociationMixin } from 'sequelize';
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
interface ServiceCreationAttributes extends Optional<ServiceAttributes, 'id' | 'category_id' | 'image_url' | 'is_active' | 'duration_minutes' | 'created_at' | 'updated_at'> {
}
declare class Service extends Model<ServiceAttributes, ServiceCreationAttributes> implements ServiceAttributes {
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
    getProvider: BelongsToGetAssociationMixin<User>;
    getCategory: BelongsToGetAssociationMixin<Category>;
}
export default Service;
export { ServiceAttributes, ServiceCreationAttributes };
//# sourceMappingURL=Service.d.ts.map