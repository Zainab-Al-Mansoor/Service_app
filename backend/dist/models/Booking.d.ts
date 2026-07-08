import { Model, Optional, BelongsToGetAssociationMixin } from 'sequelize';
import User from './User';
import Service from './Service';
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
interface BookingAttributes {
    id: string;
    customer_id: string;
    service_id: string;
    provider_id: string;
    scheduled_date: Date;
    scheduled_time: string;
    status: BookingStatus;
    address: string;
    notes?: string;
    total_amount: number;
    cancellation_reason?: string;
    created_at: Date;
    updated_at: Date;
    customer?: User;
    provider?: User;
    service?: Service;
}
interface BookingCreationAttributes extends Optional<BookingAttributes, 'id' | 'status' | 'notes' | 'cancellation_reason' | 'created_at' | 'updated_at'> {
}
declare class Booking extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {
    id: string;
    customer_id: string;
    service_id: string;
    provider_id: string;
    scheduled_date: Date;
    scheduled_time: string;
    status: BookingStatus;
    address: string;
    notes?: string;
    total_amount: number;
    cancellation_reason?: string;
    created_at: Date;
    updated_at: Date;
    customer?: User;
    provider?: User;
    service?: Service;
    getCustomer: BelongsToGetAssociationMixin<User>;
    getProvider: BelongsToGetAssociationMixin<User>;
    getService: BelongsToGetAssociationMixin<Service>;
}
export default Booking;
export { BookingAttributes, BookingCreationAttributes };
//# sourceMappingURL=Booking.d.ts.map