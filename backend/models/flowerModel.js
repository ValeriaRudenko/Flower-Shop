import mongoose from 'mongoose';

// Створення схеми для квітів
const flowerSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        slug: { type: String, required: true, unique: true },
        image: { type: String, required: true },
        images: [String],
        color: { type: String, required: true},
        size: { type: String, required: true},
        description: { type: String, required: true},
        price: { type: Number, required: true},
        countInStock: { type: Number, required: true },
        rating: { type: Number, required: true },
        numReviews: { type: Number, required: true },
        reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    },
);

// Створення моделі для квітів на основі схеми
const Flower = mongoose.model('Flower', flowerSchema);
// const Package = mongoose.model('Package', packageSchema);
// Експортування моделі квітів
export { Flower };

