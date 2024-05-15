import express from 'express';
import Bouquet from '../models/bouquetModel.js';

import data from '../data.js';
import User from '../models/userModel.js';
import {Flower} from "../models/flowerModel.js";
import Packing from '../models/packingModel.js';
import Order from "../models/orderModel.js";

import {faker} from '@faker-js/faker';

const seedRouter = express.Router();
const flowers = ['Rose', 'Tulip', 'Daisy', 'Sunflower', 'Orchid', 'Peony', 'Lily'];
const colors = ['Red', 'Yellow', 'Blue', 'Pink', 'Purple', 'White', 'Orange'];

const imagesBouquets = [];
const imagesFlowers = [];
for (let i = 1; i <= 9; i++) {
    const imageBouquetsPath = `/images/bouquets/bouquet${i}.jpg`;
    const imageFlowersPath = `/images/flowers/flower${i}.jpg`;
    imagesBouquets.push(imageBouquetsPath);
    imagesFlowers.push(imageFlowersPath);
}

function getRandomFlowerWithColor() {
    const randomFlower = flowers[Math.floor(Math.random() * flowers.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    return `${randomColor} ${randomFlower}`;
}

function flowerToSlug(name) {
    const result = name.toLowerCase().replace(/\s+/g, '-');
    return result + Math.floor(Math.random() * 999);
}

seedRouter.get('/', async (req, res) => {
    try {
        let products = [];

        for (let i = 0; i < 100; i++) {
            const name = getRandomFlowerWithColor() + ' Bouquet';
            const product = {
                name: name,
                slug: flowerToSlug(name),
                description: faker.lorem.words(20),
                price: faker.number.int({min: 10, max: 200}),
                countInStock: faker.number.int(50),
                rating: faker.number.float({min: 3, max: 5, multipleOf: 0.1}),
                numReviews: faker.number.int(50),
                image: imagesBouquets[Math.floor(Math.random() * imagesBouquets.length)]
            };
            products.push(product);
        }
        let flowers = [];

        for (let i = 0; i < 100; i++) {
            const name = getRandomFlowerWithColor();
            const flower = {
                name: name,
                slug: flowerToSlug(name),
                description: faker.lorem.words(20),
                price: faker.number.int({min: 10, max: 200}),
                countInStock: faker.number.int(50),
                rating: faker.number.float({min: 3, max: 5, multipleOf: 0.1}),
                numReviews: faker.number.int(50),
                color: faker.color.human(),
                size: faker.lorem.words(1),
                image: imagesFlowers[Math.floor(Math.random() * imagesFlowers.length)]
            };
            flowers.push(flower);
        }

        // Remove existing products
        await Bouquet.deleteMany({});

        // Insert new products
        // const createdProducts = await Bouquet.insertMany(data.products);
        const createdProducts = await Bouquet.insertMany(products);
        // Remove existing flowers
        await Flower.deleteMany({});

        // Insert new flowers
        const createdFlowers = await Flower.insertMany(flowers);

        // Remove existing packages
        await Packing.deleteMany({});

        // Insert new flowers
        const createdPackings = await Packing.insertMany(data.packings);
// Remove existing packages
        await Order.deleteMany({});

        // Remove existing users
        await User.deleteMany({});

        // Insert new users
        const createdUsers = await User.insertMany(data.users);

        res.send({createdProducts, createdFlowers, createdUsers, createdPackings});
    } catch (error) {
        console.error('Error seeding data:', error.message);
        res.status(500).send({message: 'Error seeding data'});
    }


});

export default seedRouter;
