import mongoose from 'mongoose';

const { Schema } = mongoose;

const productSchema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        slug: { type: String, required: true, unique: true },
        image: { type: String, required: true },
        images: [String],
        description: { type: String, required: true },
        price: { type: Number, required: true },
        countInStock: { type: Number, required: true },
        rating: { type: String,required: true   }, // Not required, will be calculated from reviews
        numReviews: { type: Number, required: true  }, // Not required, will be updated dynamically
        reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
