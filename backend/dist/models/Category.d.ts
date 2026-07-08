import { Model, Optional } from 'sequelize';
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
interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'is_active' | 'sort_order' | 'created_at' | 'updated_at'> {
}
declare class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
    id: string;
    name: string;
    description?: string;
    icon_url?: string;
    is_active: boolean;
    sort_order: number;
    created_at: Date;
    updated_at: Date;
}
export default Category;
export { CategoryAttributes, CategoryCreationAttributes };
//# sourceMappingURL=Category.d.ts.map