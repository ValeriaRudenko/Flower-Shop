import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { isAuth, isAdmin } from '../utils.js';
import  Packing  from '../models/packingModel.js';

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
            type,
            price,
            slug,
            image,
            images,
            countInStock,
            rating,
            numReviews,
        } = req.body;

        const newPacking = new Packing({
            type,
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
                packing.type = req.body.type || packing.type;
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

export default packingRouter;
