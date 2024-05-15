import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { isAuth, isAdmin } from '../utils.js';
import Packing from '../models/packingModel.js';
import Review from "../models/reviewModel.js";


const packingRouter = express.Router();

// Fetch all packings
packingRouter.get('/', async (req, res) => {
    const packings = await Packing.find();
    res.send(packings);
});

// Create a new packing
packingRouter.post(
    '/',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const newPacking = new Packing({
            name: 'sample name ' + Date.now(),
            slug: 'sample-name-' + Date.now(),
            image: '/images/p1.jpg',
            price: 0,
            countInStock: 0,
            rating: 0,
            numReviews: 0,
        });
        const packing = await newPacking.save();
        res.send({ message: 'Packing Created', packing });
    })
);

const PAGE_SIZE = 20;

// Search for packings
packingRouter.get(
    '/search',
    expressAsyncHandler(async (req, res) => {
        const { query } = req;
        const pageSize = query.pageSize || PAGE_SIZE;
        const page = query.page || 1;
        const price = query.price || '';
        const rating = query.rating || '';
        const order = query.order || '';
        const searchQuery = query.query || '';

        const queryFilter =
            searchQuery && searchQuery !== 'all'
                ? {
                    name: {
                        $regex: searchQuery,
                        $options: 'i',
                    },
                }
                : {};
        const ratingFilter =
            rating && rating !== 'all'
                ? {
                    rating: {
                        $gte: Number(rating),
                    },
                }
                : {};
        const priceFilter =
            price && price !== 'all'
                ? {
                    price: {
                        $gte: Number(price.split('-')[0]),
                        $lte: Number(price.split('-')[1]),
                    },
                }
                : {};
        const sortOrder =
            order === 'featured'
                ? { featured: -1 }
                : order === 'lowest'
                    ? { price: 1 }
                    : order === 'highest'
                        ? { price: -1 }
                        : order === 'toprated'
                            ? { rating: -1 }
                            : order === 'newest'
                                ? { createdAt: -1 }
                                : { _id: -1 };

        const packings = await Packing.find({
            ...queryFilter,
            ...priceFilter,
            ...ratingFilter,
        })
            .sort(sortOrder)
            .skip(pageSize * (page - 1))
            .limit(pageSize);

        const countPackings = await Packing.countDocuments({
            ...queryFilter,
            ...priceFilter,
            ...ratingFilter,
        });
        res.send({
            packings,
            countPackings,
            page,
            pages: Math.ceil(countPackings / pageSize),
        });
    })
);



// Update a packing
packingRouter.put(
    '/:id',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        try {
            const packingId = req.params.id;
            const packing = await Packing.findById(packingId);
            if (packing) {
                // Update the product details based on the request body
                packing.name = req.body.typee || packing.name;
                packing.price = req.body.price || packing.price;
                packing.slug = req.body.slug || packing.slug;
                packing.image = req.body.image || packing.image;
                packing.images = req.body.images || packing.images;
                packing.countInStock = req.body.countInStock || packing.countInStock;
                packing.rating = req.body.rating || packing.rating;
                packing.numReviews = req.body.numReviews || packing.numReviews;
                // Save the updated product details
                const updatedPacking = await packing.save();
                res.send({ message: 'Packing Updated', packing: updatedPacking });
            } else {
                res.status(404).send({ message: 'Packing Not Found' });
            }
        } catch (error) {
            res.status(500).send({ message: 'Internal Server Error' });
        }
    })
);

// Delete a packing
packingRouter.delete(
    '/:id',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const packing = await Packing.findById(req.params.id);
        if (packing) {
            await packing.remove();
            res.send({ message: 'Packing Deleted' });
        } else {
            res.status(404).send({ message: 'Packing Not Found' });
        }
    })
);
packingRouter.get(
    '/admin',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const { query } = req;
        const page = query.page || 1;
        const pageSize = query.pageSize || PAGE_SIZE;

        const packings = await Packing.find()
            .skip(pageSize * (page - 1))
            .limit(pageSize);
        const countPackings = await Packing.countDocuments();
        res.send({
            packings,
            countPackings,
            page,
            pages: Math.ceil(countPackings / pageSize),
        });
    })
);
// Find packing by slug
packingRouter.get('/slug/:slug', async (req, res) => {
    const packing = await Packing.findOne({ slug: req.params.slug }).populate('reviews');;
    if (packing) {
        res.send(packing);
    } else {
        res.status(404).send({ message: 'Packing Not Found' });
    }
});
packingRouter.post(
    '/:id/reviews',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const packingId = req.params.id;
        const packing = await Packing.findById(packingId);

        if (packing) {
            // Check if the user has already submitted a review
            const existingReview = packing.reviews.find((review) => review.name === req.user.name);
            if (existingReview) {
                return res.status(400).send({ message: 'You already submitted a review' });
            }

            // Parse the rating from the request body as a number
            const rating = Number(req.body.rating);

            // Check if the rating is a valid number
            if (isNaN(rating)) {
                return res.status(400).send({ message: 'Invalid rating value' });
            }

            // Create a new Review document
            const newReview = new Review({
                product: packingId, // Set the packing reference
                name: req.user.name,
                rating: rating, // Assign the parsed rating
                comment: req.body.comment,
            });

            // Save the new review to the database
            await newReview.save();
            // Update the packing's reviews array with the ObjectId reference
            packing.reviews.push(newReview._id);

            // Update packing's numReviews and rating fields
            packing.numReviews = packing.reviews.length;
            const totalRating = await packing.reviews.reduce(async (accPromise, reviewId) => {
                const acc = await accPromise;
                const review = await Review.findById(reviewId);
                return acc + review.rating;
            }, Promise.resolve(0));
            packing.rating = totalRating / packing.reviews.length;

            try {
                await packing.save();
                console.log('Packing updated successfully');
            } catch (error) {
                console.error('Error updating packing:', error);
            }

            // Send success response
            res.status(201).send({
                message: 'Review Created',
                review: newReview,
                numReviews: packing.numReviews,
                rating: packing.rating,
            });
        } else {
            res.status(404).send({ message: 'Packing Not Found' });
        }
    })
);
packingRouter.get(
    '/admin',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const { query } = req;
        const page = query.page || 1;
        const pageSize = query.pageSize || PAGE_SIZE;

        const packings = await Packing.find()
            .skip(pageSize * (page - 1))
            .limit(pageSize);
        const countPackings = await Packing.countDocuments();
        res.send({
            packings,
            countPackings,
            page,
            pages: Math.ceil(countPackings / pageSize),
        });
    })
);
// Find packing by ID
packingRouter.get('/:id', async (req, res) => {
    const packing = await Packing.findById(req.params.id);
    if (packing) {
        res.send(packing);
    } else {
        res.status(404).send({ message: 'Packing Not Found' });
    }
});


export default packingRouter;
