import mongoose from "mongoose";

const packingSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    countInStock: { type: Number, required: true },
    rating: { type: Number, required: true },
    numReviews: { type: Number, required: true },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],

});
const Packing = mongoose.model('Packing', packingSchema);
export default Packing;