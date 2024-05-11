import mongoose from 'mongoose';

const flowerReviewSchema = new mongoose.Schema(
    {
        flower: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String, required: true },
        comment: { type: String, required: true },
        rating: { type: Number, required: true },
    },
    {
        timestamps: true,
    }
);

const FlowerReview = mongoose.model('FlowerReview', flowerReviewSchema);
export default FlowerReview;