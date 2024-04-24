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
  products: [
    {
      name: 'Tulips bouquet',
      slug: 'tulips-bouquet',
      image: '/images/p1.jpg', // 679px × 829px
      price: 120,
      countInStock: 0,

      rating: 4.5,
      numReviews: 10,
      description: 'white tulips bouquet',
    },
    {
      name: 'Lilies bouquet',
      slug: ' lilies-bouquet',
      image: '/images/p2.jpg',
      price: 250,
      countInStock: 20,

      rating: 4.0,
      numReviews: 10,
      description: 'white lilies bouquet',
    },
    {
      name: 'Roses bouquet',
      slug: 'roses-bouquet',

      image: '/images/p3.jpg',
      price: 25,
      countInStock: 15,

      rating: 4.5,
      numReviews: 14,
      description: 'pink roses bouquet',
    },
    {
      name: 'Pions bouquet',
      slug: 'pions-bouquet',

      image: '/images/p4.jpg',
      price: 65,
      countInStock: 5,

      rating: 4.5,
      numReviews: 10,
      description: 'pink pions bouquet',
    },
  ],
flowers : [
  {
    name: "Rose",
    slug: "rose",
    image: '/images/p6.jpg',
    images: ['/images/p4.jpg'],
    color: "Red",
    size: "Medium",
    description: "Beautiful red rose",
    price: 10,
    countInStock: 10,
    rating: 4.5,
    numReviews: 8,
  },
  {
    name: "Lily",
    slug: "lily",
    image: '/images/p5.jpg',
    images: ['/images/p3.jpg'],
    color: "White",
    size: "Large",
    description: "Elegant white lily",
    price: 12,
    countInStock: 15,
    rating: 4.8,
    numReviews: 12,
  }
],
  packings : [
    {
      type: 'Wrapping paper',
      price: 20,
      slug: 'wrapping-paper',
      countInStock: 100,
      rating: 4.5,
      numReviews: 10,

      image: '/images/p5.jpg',
    },
    {
      type: 'Box',
      price: 20,
      slug: 'box',
      image: '/images/p5.jpg',
      countInStock: 50,
      rating: 4.7,
      numReviews: 8,

    }
  ]

};
export default data;
