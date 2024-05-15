import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        name: {type: String, required: true},
        comment: {type: String, required: true},
        rating: {type: Number, required: true},
    },
    {
        timestamps: true,
    }
);

const Review = mongoose.model('Review', reviewSchema);
export default Review;