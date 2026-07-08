import { Model, Optional } from 'sequelize';
interface ReviewAttributes {
    id: string;
    booking_id: string;
    customer_id: string;
    provider_id: string;
    rating: number;
    comment?: string;
    created_at: Date;
}
interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'id' | 'comment' | 'created_at'> {
}
declare class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
    id: string;
    booking_id: string;
    customer_id: string;
    provider_id: string;
    rating: number;
    comment?: string;
    created_at: Date;
}
export default Review;
export { ReviewAttributes, ReviewCreationAttributes };
//# sourceMappingURL=Review.d.ts.map