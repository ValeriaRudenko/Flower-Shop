import express from 'express';
import Product from '../models/productModel.js';

import data from '../data.js';
import User from '../models/userModel.js';
import {Flower} from "../models/flowerModel.js";
import Packing from '../models/packingModel.js';

const seedRouter = express.Router();

seedRouter.get('/', async (req, res) => {
  try {
    // Remove existing products
    await Product.deleteMany({});

    // Insert new products
    const createdProducts = await Product.insertMany(data.products);

    // Remove existing flowers
    await Flower.deleteMany({});

    // Insert new flowers
    const createdFlowers = await Flower.insertMany(data.flowers);

    // Remove existing packages
    await Packing.deleteMany({});

    // Insert new flowers
    const createdPackings = await Packing.insertMany(data.packings);


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
