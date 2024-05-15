import express from 'express';
import Bouquet from '../models/bouquetModel.js';

import data from '../data.js';
import User from '../models/userModel.js';
import {Flower} from "../models/flowerModel.js";
import Packing from '../models/packingModel.js';
import Order from "../models/orderModel.js";

import { faker } from '@faker-js/faker';

const seedRouter = express.Router();
const flowers = ['Rose', 'Tulip', 'Daisy', 'Sunflower', 'Orchid'];
const colors = ['Red', 'Yellow', 'Blue', 'Pink', 'Purple'];
const images = ['/images/p1.jpg', '/images/p2.jpg', '/images/p3.jpg', '/images/p4.jpg', '/images/p5.jpg', '/images/p6.jpg', '/images/p7.jpg', '/images/p8.jpg', '/images/p9.jpg', '/images/p10.jpg'];

function getRandomFlowerWithColor() {
  const randomFlower = flowers[Math.floor(Math.random() * flowers.length)];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  return `${randomColor} ${randomFlower}`;
}
function flowerToSlug(name) {
  const result = name.toLowerCase().replace(/\s+/g, '-');
  return result+Math.floor(Math.random() * 999);
}
seedRouter.get('/', async (req, res) => {
  try {
    let products = [];

    for (let i = 0; i < 100; i++) {
      const name = getRandomFlowerWithColor();
      const product = {
        name: name ,
        slug: flowerToSlug(name),
        description: faker.lorem.words(20),
        price: faker.number.int({ min: 10, max: 200 }),
        countInStock: faker.number.int(50),
        rating: faker.number.float({ min: 1, max: 5, multipleOf: 0.1 }),
        numReviews: faker.number.int(50),
        image: images[Math.floor(Math.random() * images.length)]
      };
      products.push(product);
    }

    // Remove existing products
    await Bouquet.deleteMany({});

    // Insert new products
    // const createdProducts = await Bouquet.insertMany(data.products);
    const createdProducts = await Bouquet.insertMany(products);
    // Remove existing flowers
    await Flower.deleteMany({});

    // Insert new flowers
    const createdFlowers = await Flower.insertMany(data.flowers);

    // Remove existing packages
    await Packing.deleteMany({});

    // Insert new flowers
    const createdPackings = await Packing.insertMany(data.packings);
// Remove existing packages
    await Order.deleteMany({});

    // Insert new flowers
    const createdOrders = await Order.insertMany(data.orders);

    // Remove existing users
    await User.deleteMany({});

    // Insert new users
    const createdUsers = await User.insertMany(data.users);

    res.send({ createdProducts, createdFlowers, createdUsers, createdPackings });
  } catch (error) {
    console.error('Error seeding data:', error.message);
    res.status(500).send({ message: 'Error seeding data' });
  }



});

export default seedRouter;
