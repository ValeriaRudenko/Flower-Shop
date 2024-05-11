import express from 'express'; // Importing express library
import expressAsyncHandler from 'express-async-handler'; // Importing expressAsyncHandler for handling async functions
import Order from '../models/orderModel.js'; // Importing Order model
import User from '../models/userModel.js'; // Importing User model
import Product from '../models/productModel.js'; // Importing Product model
import { isAuth, isAdmin } from '../utils.js'; // Importing authentication middleware functions

const orderRouter = express.Router(); // Creating a new router instance

orderRouter.post(
    '/', // POST route for creating a new order
    isAuth, // Middleware to authenticate user
    expressAsyncHandler(async (req, res) => { // Handling asynchronous request
        const newOrder = new Order({ // Creating a new Order instance
            orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })), // Mapping order items with product IDs
            shippingAddress: req.body.shippingAddress, // Setting shipping address
            paymentMethod: req.body.paymentMethod, // Setting payment method
            itemsPrice: req.body.itemsPrice, // Setting total items price
            shippingPrice: req.body.shippingPrice, // Setting shipping price
            taxPrice: req.body.taxPrice, // Setting tax price
            totalPrice: req.body.totalPrice, // Setting total price
            user: req.user._id, // Setting user ID from authenticated user
        });

        const order = await newOrder.save(); // Saving the new order to database
        res.status(201).send({ message: 'New Order Created', order }); // Sending success response with new order
    })
);

orderRouter.get(
    '/', // GET route for retrieving all orders
    isAuth, // Middleware to authenticate user
    isAdmin, // Middleware to check if user is admin
    expressAsyncHandler(async (req, res) => { // Handling asynchronous request
        const orders = await Order.find().populate('user', 'name'); // Finding all orders and populating user field with name
        res.send(orders); // Sending retrieved orders as response
    })
);

orderRouter.put(
    '/:id/deliver', // PUT route for updating order delivery status
    isAuth, // Middleware to authenticate user
    expressAsyncHandler(async (req, res) => { // Handling asynchronous request
        const order = await Order.findById(req.params.id); // Finding order by ID
        if (order) { // If order is found
            order.isDelivered = true; // Updating isDelivered field to true
            order.deliveredAt = Date.now(); // Setting deliveredAt date
            await order.save(); // Saving the updated order
            res.send({ message: 'Order Delivered' }); // Sending success response
        } else {
            res.status(404).send({ message: 'Order Not Found' }); // Sending error response if order not found
        }
    })
);

orderRouter.delete(
    '/:id', // DELETE route for deleting an order
    isAuth, // Middleware to authenticate user
    isAdmin, // Middleware to check if user is admin
    expressAsyncHandler(async (req, res) => { // Handling asynchronous request
        const order = await Order.findById(req.params.id); // Finding order by ID
        if (order) { // If order is found
            await order.remove(); // Removing the order from database
            res.send({ message: 'Order Deleted' }); // Sending success response
        } else {
            res.status(404).send({ message: 'Order Not Found' }); // Sending error response if order not found
        }
    })
);

orderRouter.get(
    '/summary', // GET route for retrieving summary of orders
    isAuth, // Middleware to authenticate user
    isAdmin, // Middleware to check if user is admin
    expressAsyncHandler(async (req, res) => { // Handling asynchronous request
        const orders = await Order.aggregate([ // Aggregating order data
            {
                $group: { // Grouping orders
                    _id: null, // Grouping all orders
                    numOrders: { $sum: 1 }, // Counting total number of orders
                    totalSales: { $sum: '$totalPrice' }, // Calculating total sales
                },
            },
        ]);
        const users = await User.aggregate([ // Aggregating user data
            {
                $group: { // Grouping users
                    _id: null, // Grouping all users
                    numUsers: { $sum: 1 }, // Counting total number of users
                },
            },
        ]);
        const dailyOrders = await Order.aggregate([ // Aggregating daily order data
            {
                $group: { // Grouping orders
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, // Grouping by date
                    orders: { $sum: 1 }, // Counting total orders
                    sales: { $sum: '$totalPrice' }, // Calculating total sales
                },
            },
            { $sort: { _id: 1 } }, // Sorting results by date
        ]);

        res.send({ users, orders, dailyOrders }); // Sending summary data as response
    })
);

orderRouter.get(
    '/mine', // GET route for retrieving orders of logged-in user
    isAuth, // Middleware to authenticate user
    expressAsyncHandler(async (req, res) => { // Handling asynchronous request
        const orders = await Order.find({ user: req.user._id }); // Finding orders by user ID
        res.send(orders); // Sending retrieved orders as response
    })
);

orderRouter.get(
    '/:id', // GET route for retrieving a specific order by ID
    isAuth, // Middleware to authenticate user
    expressAsyncHandler(async (req, res) => { // Handling asynchronous request
        const order = await Order.findById(req.params.id); // Finding order by ID
        if (order) { // If order is found
            res.send(order); // Sending retrieved order as response
        } else {
            res.status(404).send({ message: 'Order Not Found' }); // Sending error response if order not found
        }
    })
);

orderRouter.put(
    '/:id/pay', // PUT route for updating payment status of an order
    isAuth, // Middleware to authenticate user
    expressAsyncHandler(async (req, res) => { // Handling asynchronous request
        const order = await Order.findById(req.params.id).populate(
            'user',
            'email name'
        ); // Finding order by ID and populating user field with email and name
        if (order) { // If order is found
            order.isPaid = true; // Updating isPaid field to true
            order.paidAt = Date.now(); // Setting paidAt date
            order.paymentResult = { // Setting payment result details
                id: req.body.id,
                status: req.body.status,
                update_time: req.body.update_time,
                email_address: req.body.email_address,
            };

            const updatedOrder = await order.save(); // Saving the updated order

            res.send({ message: 'Order Paid', order: updatedOrder }); // Sending success response with updated order
        } else {
            res.status(404).send({ message: 'Order Not Found' }); // Sending error response if order not found
        }
    })
);

export default orderRouter; // Exporting orderRouter
