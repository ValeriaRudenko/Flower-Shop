import bcrypt from 'bcryptjs';

const data = {


    users: [
        {
            name: 'Mbe',
            email: 'admin@example.com',
            password: bcrypt.hashSync('123456'),
            isAdmin: true,
        },
        {
            name: 'Aba',
            email: 'user@example.com',
            password: bcrypt.hashSync('123456'),
            isAdmin: false,
        },
    ],
    packings: [
        {
            name: 'Wrapping paper',
            price: 20,
            slug: 'wrapping-paper',
            countInStock: 100,
            rating: 4.5,
            numReviews: 10,

            image: '/images/packings/p1.jpg',
        },
        {
            name: 'Box',
            price: 20,
            slug: 'box',
            image: '/images/packings/p2.jpg',
            countInStock: 50,
            rating: 4.7,
            numReviews: 8,

        }
    ],
    orders: [
        {
            orderItems: [
                {
                    slug: 'roses-bouquet',
                    name: 'Sample Product 2',
                    quantity: 1,
                    image: 'sample-image-2.jpg',
                    price: 15,
                    product: '6643d04f4cd481cb59b0b5e4',
                },
            ],
            shippingAddress: {
                fullName: 'Jane Smith',
                address: '456 Elm Street',
                city: 'Los Angeles',
            },
            paymentMethod: 'PayPal',
            paymentResult: {
                id: 'payment-id-2',
                status: 'Paid',
                update_time: '2024-05-14',
            },
            itemsPrice: 15,
            shippingPrice: 3,
            totalPrice: 18,
            user: '6643d04f4cd481cb59b0b5e4',
            isPaid: true,
            paidAt: new Date(),
            isDelivered: true,
            deliveredAt: new Date()
        },
        {
            orderItems: [
                {
                    slug: 'roses-bouquet',
                    name: 'Sample Product 1',
                    quantity: 2,
                    image: 'sample-image-1.jpg',
                    price: 10,
                    product: '6643d04f4cd481cb59b0b5e4',
                },
            ],
            shippingAddress: {
                fullName: 'John Doe',
                address: '123 Main Street',
                city: 'New York',
            },
            paymentMethod: 'Credit Card',
            paymentResult: {
                id: 'payment-id-1',
                status: 'Paid',
                update_time: '2024-05-14',
            },
            itemsPrice: 20,
            shippingPrice: 5,
            totalPrice: 25,
            user: '6643d04f4cd481cb59b0b5e4',
            isPaid: true,
            paidAt: new Date(),
            isDelivered: false
        }
    ],
};
export default data;
