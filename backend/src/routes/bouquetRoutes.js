import express from 'express';
import Bouquet from '../models/bouquetModel.js';
import Review from '../models/reviewModel.js';
import expressAsyncHandler from 'express-async-handler';
import { isAuth, isAdmin } from '../utils.js';

const bouquetRouter = express.Router();

bouquetRouter.get('/', async (req, res) => {
  const products = await Bouquet.find();
  res.send(products);
});

bouquetRouter.get(
  '/admin',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;

    const products = await Bouquet.find()
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    const countProducts = await Bouquet.countDocuments();
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

bouquetRouter.post(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const newProduct = new Bouquet({
      name: 'sample name ' + Date.now(),
      slug: 'sample-name-' + Date.now(),
      image: '/images/p1.jpg',
      price: 0,


      countInStock: 0,
      rating: 0,
      numReviews: 0,
      description: 'sample description',
    });
    const product = await newProduct.save();
    res.send({ message: 'Product Created', product });
  })
);

bouquetRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Bouquet.findById(productId);
    if (product) {
      product.name = req.body.name;
      product.slug = req.body.slug;
      product.price = req.body.price;
      product.image = req.body.image;
      product.images = req.body.images;

      product.countInStock = req.body.countInStock;
      product.description = req.body.description;
      await product.save();
      res.send({ message: 'Product Updated' });
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

bouquetRouter.post(
    '/:id/reviews',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const productId = req.params.id;
        const product = await Bouquet.findById(productId);
        if (product) {
            // Check if the user has already submitted a review
            const existingReview = product.reviews.find((review) => review.name === req.user.name);
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
                product: productId, // Set the product reference
                name: req.user.name,
                rating: rating, // Assign the parsed rating
                comment: req.body.comment,
            });

            // Save the new review to the database
            await newReview.save();

            // Update the product's reviews array with the ObjectId reference
            product.reviews.push(newReview._id);

            // Update product's numReviews and rating fields
            product.numReviews = product.reviews.length;
            const totalRating = product.reviews.reduce(async (total, reviewId) => {
                const review = await Review.findById(reviewId);
                return total + review.rating;
            }, 0);
            product.rating = totalRating / product.reviews.length;

            // Save the updated product
            await product.save();

            // Send success response
            res.status(201).send({
                message: 'Review Created',
                review: newReview,
                numReviews: product.numReviews,
                rating: product.rating,
            });
        } else {
            res.status(404).send({ message: 'Product Not Found' });
        }
    })
);



bouquetRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const product = await Bouquet.findById(req.params.id);
    if (product) {
      await product.remove();
      res.send({ message: 'Product Deleted' });
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

const PAGE_SIZE = 20;

bouquetRouter.get(
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
            // 1-50
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

    const products = await Bouquet.find({
      ...queryFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await Bouquet.countDocuments({
      ...queryFilter,
      ...priceFilter,
      ...ratingFilter,
    });
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

bouquetRouter.get('/slug/:slug', async (req, res) => {
  const product = await Bouquet.findOne({ slug: req.params.slug }).populate('reviews');
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
});
bouquetRouter.get('/:id', async (req, res) => {
  const product = await Bouquet.findById(req.params.id);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
});

export default bouquetRouter;

