import { Model, Optional } from 'sequelize';
interface ProviderAvailabilityAttributes {
    id: string;
    provider_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_available: boolean;
    created_at: Date;
    updated_at: Date;
}
interface ProviderAvailabilityCreationAttributes extends Optional<ProviderAvailabilityAttributes, 'id' | 'is_available' | 'created_at' | 'updated_at'> {
}
declare class ProviderAvailability extends Model<ProviderAvailabilityAttributes, ProviderAvailabilityCreationAttributes> implements ProviderAvailabilityAttributes {
    id: string;
    provider_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_available: boolean;
    created_at: Date;
    updated_at: Date;
}
export default ProviderAvailability;
export { ProviderAvailabilityAttributes, ProviderAvailabilityCreationAttributes };
//# sourceMappingURL=ProviderAvailability.d.ts.map