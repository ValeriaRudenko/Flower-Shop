import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { isAuth, isAdmin } from '../utils.js';
import Packing from '../models/packingModel.js';
import Product from "../models/productModel.js";
import productRouter from "./productRoutes.js";

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
        const {
            name,
            price,
            slug,
            image,
            images,
            countInStock,
            rating,
            numReviews,
        } = req.body;

        const newPacking = new Packing({
            name,
            price,
            slug,
            image,
            images,
            countInStock,
            rating,
            numReviews,
        });

        const createdPacking = await newPacking.save();
        res.status(201).send({ message: 'Packing Created', packing: createdPacking });
    })
);

const PAGE_SIZE = 3;

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

// Add a review to a packing
packingRouter.post(
    '/:id/reviews',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const packingId = req.params.id;
        const packing = await Packing.findById(packingId);
        if (packing) {
            if (packing.reviews.find((x) => x.name === req.user.name)) {
                return res
                    .status(400)
                    .send({ message: 'You already submitted a review' });
            }

            const review = {
                name: req.user.name,
                rating: Number(req.body.rating),
                comment: req.body.comment,
            };
            packing.reviews.push(review);
            packing.numReviews = packing.reviews.length;
            packing.rating =
                packing.reviews.reduce((a, c) => c.rating + a, 0) /
                packing.reviews.length;
            const updatedPacking = await packing.save();
            res.status(201).send({
                message: 'Review Created',
                review: updatedPacking.reviews[updatedPacking.reviews.length - 1],
                numReviews: packing.numReviews,
                rating: packing.rating,
            });
        } else {
            res.status(404).send({ message: 'Packing Not Found' });
        }
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
                packing.name = req.body.typee || packing.name;
                packing.price = req.body.price || packing.price;
                packing.slug = req.body.slug || packing.slug;
                packing.image = req.body.image || packing.image;
                packing.images = req.body.images || packing.images;
                packing.countInStock = req.body.countInStock || packing.countInStock;
                packing.rating = req.body.rating || packing.rating;
                packing.numReviews = req.body.numReviews || packing.numReviews;

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

// Find packing by slug
packingRouter.get('/slug/:slug', async (req, res) => {
    const packing = await Packing.findOne({ slug: req.params.slug });
    if (packing) {
        res.send(packing);
    } else {
        res.status(404).send({ message: 'Packing Not Found' });
    }
});

// Find packing by ID
packingRouter.get('/:id', async (req, res) => {
    const packing = await Packing.findById(req.params.id);
    if (packing) {
        res.send(packing);
    } else {
        res.status(404).send({ message: 'Packing Not Found' });
    }
});
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
export default packingRouter;
