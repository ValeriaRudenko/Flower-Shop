import express from 'express';

import expressAsyncHandler from 'express-async-handler';
import { isAuth, isAdmin } from '../utils.js';
import {Flower} from "../models/flowerModel.js";


const flowerRouter = express.Router();

// Fetch all flowers
// Отримати всі квіти
flowerRouter.get('/', async (req, res) => {
    const flowers = await Flower.find();
    res.send(flowers);
});

// Create a new flower
// Створити новий квіт
flowerRouter.post(
    '/',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const {
            name,
            slug,
            image,
            images,
            color,
            size,
            description,
            price,
            countInStock,
            rating,
            numReviews,
        } = req.body;

        const newFlower = new Flower({
            name,
            slug,
            image,
            images,
            color,
            size,
            description,
            price,
            countInStock,
            rating,
            numReviews,
        });

        const createdFlower = await newFlower.save();
        res.status(201).send({ message: 'Flower Created', flower: createdFlower });
    })
);

// Update a flower
// Оновити дані квіту
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
            res.send({ message: 'Flower Updated', flower: updatedFlower });
        } else {
            res.status(404).send({ message: 'Flower Not Found' });
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
            res.send({ message: 'Flower Deleted' });
        } else {
            res.status(404).send({ message: 'Flower Not Found' });
        }
    })
);
// Fetch a flower by slug
// Отримати квіт за унікальним ідентифікатором (slug)
flowerRouter.get('/slug/:slug', async (req, res) => {
    const flower = await Flower.findOne({ slug: req.params.slug });
    if (flower) {
        res.send(flower);
    } else {
        res.status(404).send({ message: 'Flower Not Found' });
    }
});
// Fetch a flower by ID
// Отримати квіт за ідентифікатором
flowerRouter.get('/:id', async (req, res) => {
    const flower = await Flower.findById(req.params.id);
    if (flower) {
        res.send(flower);
    } else {
        res.status(404).send({ message: 'Flower Not Found' });
    }
});
export default flowerRouter;
