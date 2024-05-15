import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import {isAdmin, isAuth} from '../utils.js';
import {Flower} from '../models/flowerModel.js';
import Review from "../models/reviewModel.js";

const PAGE_SIZE = 20;

const flowerRouter = express.Router();

// Fetch all flowers
flowerRouter.get('/', async (req, res) => {
    const flowers = await Flower.find();
    res.send(flowers);
});

// Admin flower route
flowerRouter.get(
    '/admin',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const {query} = req;
        const page = query.page || 1;
        const pageSize = query.pageSize || PAGE_SIZE;

        const flowers = await Flower.find()
            .skip(pageSize * (page - 1))
            .limit(pageSize);
        const countFlowers = await Flower.countDocuments();
        res.send({
            flowers,
            countFlowers,
            page,
            pages: Math.ceil(countFlowers / pageSize),
        });
    })
);

// Search flowers
flowerRouter.get(
    '/search',
    expressAsyncHandler(async (req, res) => {
        const {query} = req;
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
                ? {featured: -1}
                : order === 'lowest'
                    ? {price: 1}
                    : order === 'highest'
                        ? {price: -1}
                        : order === 'toprated'
                            ? {rating: -1}
                            : order === 'newest'
                                ? {createdAt: -1}
                                : {_id: -1};

        const flowers = await Flower.find({
            ...queryFilter,
            ...priceFilter,
            ...ratingFilter,
        })
            .sort(sortOrder)
            .skip(pageSize * (page - 1))
            .limit(pageSize);

        const countFlowers = await Flower.countDocuments({
            ...queryFilter,
            ...priceFilter,
            ...ratingFilter,
        });
        res.send({
            flowers,
            countFlowers,
            page,
            pages: Math.ceil(countFlowers / pageSize),
        });
    })
);
flowerRouter.post(
    '/:id/reviews',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const flowerId = req.params.id;
        const flower = await Flower.findById(flowerId);

        if (flower) {
            // Check if the user has already submitted a review
            const existingReview = flower.reviews.find((review) => review.name === req.user.name);
            if (existingReview) {
                return res.status(400).send({message: 'You already submitted a review'});
            }

            // Parse the rating from the request body as a number
            const rating = Number(req.body.rating);

            // Check if the rating is a valid number
            if (isNaN(rating)) {
                return res.status(400).send({message: 'Invalid rating value'});
            }

            // Create a new Review document
            const newReview = new Review({
                product: flowerId, // Set the flower reference
                name: req.user.name,
                rating: rating, // Assign the parsed rating
                comment: req.body.comment,
            });

            // Save the new review to the database
            await newReview.save();
            // Update the flower's reviews array with the ObjectId reference
            flower.reviews.push(newReview._id);

            // Update flower's numReviews and rating fields
            flower.numReviews = flower.reviews.length;
            const totalRating = await flower.reviews.reduce(async (accPromise, reviewId) => {
                const acc = await accPromise;
                const review = await Review.findById(reviewId);
                return acc + review.rating;
            }, Promise.resolve(0));
            flower.rating = totalRating / flower.reviews.length;

            try {
                await flower.save();
                console.log('Flower updated successfully');
            } catch (error) {
                console.error('Error updating flower:', error);
            }

            // Send success response
            res.status(201).send({
                message: 'Review Created',
                review: newReview,
                numReviews: flower.numReviews,
                rating: flower.rating,
            });
        } else {
            res.status(404).send({message: 'Flower Not Found'});
        }
    })
);


// Create a new flower
flowerRouter.post(
    '/',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const newFlower = new Flower({
            name: 'sample name ' + Date.now(),
            slug: 'sample-name-' + Date.now(),
            image: '/images/p1.jpg',
            price: 0,
            size: 'Medium',
            color: 'Red',

            countInStock: 0,
            rating: 0,
            numReviews: 0,
            description: 'sample description',
        });
        const flower = await newFlower.save();
        res.send({message: 'Flower Created', flower});
    })
);

// Update a flower
flowerRouter.put(
    '/:id',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const flowerId = req.params.id;
        const flower = await Flower.findById(flowerId);
        if (flower) {
            flower.name = req.body.name || flower.name;
            flower.slug = req.body.slug || flower.slug;
            flower.image = req.body.image || flower.image;
            flower.images = req.body.images || flower.images;
            flower.color = req.body.color || flower.color;
            flower.size = req.body.size || flower.size;
            flower.description = req.body.description || flower.description;
            flower.price = req.body.price || flower.price;
            flower.countInStock = req.body.countInStock || flower.countInStock;
            flower.rating = req.body.rating || flower.rating;
            flower.numReviews = req.body.numReviews || flower.numReviews;

            const updatedFlower = await flower.save();
            res.send({message: 'Flower Updated', flower: updatedFlower});
        } else {
            res.status(404).send({message: 'Flower Not Found'});
        }
    })
);

// Delete a flower
flowerRouter.delete(
    '/:id',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const flower = await Flower.findById(req.params.id);
        if (flower) {
            await flower.remove();
            res.send({message: 'Flower Deleted'});
        } else {
            res.status(404).send({message: 'Flower Not Found'});
        }
    })
);

// Fetch a flower by slug
flowerRouter.get('/slug/:slug', async (req, res) => {
    const flower = await Flower.findOne({slug: req.params.slug}).populate('reviews');
    if (flower) {
        res.send(flower);
    } else {
        res.status(404).send({message: 'Flower Not Found'});
    }
});

// Fetch a flower by ID
flowerRouter.get('/:id', async (req, res) => {
    const flower = await Flower.findById(req.params.id);
    if (flower) {
        res.send(flower);
    } else {
        res.status(404).send({message: 'Flower Not Found'});
    }
});

export default flowerRouter;
