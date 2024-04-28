// Importing JWT for token generation and verification
import jwt from 'jsonwebtoken';
// Importing Mailgun for sending emails
import mg from 'mailgun-js';

// Function to generate JWT token for user authentication
export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
      // Using JWT secret from environment variables
    {
  // Setting token expiration time
      expiresIn: '30d',
    }
  );
};
// Middleware to verify if the user is authenticated
export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization && authorization.startsWith('Bearer')) {
    const token = authorization.split(' ')[1]; // Extract the token from the Authorization header
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).send({ message: 'Invalid Token' });
      } else {
        req.user = decoded; // Set the decoded user information in req.user
        next();
      }
    });
  } else {
    res.status(401).send({ message: 'No Token' });
  }
};
// Middleware to verify if the user is an admin
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).send({ message: 'Invalid Admin Token' });
  }
};
// Function to initialize Mailgun with API key and domain
export const mailgun = () =>
  mg({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  });
// Function to generate email template for order confirmation
export const payOrderEmailTemplate = (order) => {
  return `<h1>Thank you for shopping with us</h1>
  <p>
  Hi ${order.user.name},</p>
  <p>We have finished processing your order.</p>
  <h2>[Order ${order._id}] (${order.createdAt.toString().substring(0, 10)})</h2>
  <table>
  <thead>
  <tr>
  <td><strong>Product</strong></td>
  <td><strong>Quantity</strong></td>
  <td><strong align="right">Price</strong></td>
  </thead>
  <tbody>
  ${order.orderItems
    .map(
      (item) => `
    <tr>
    <td>${item.name}</td>
    <td align="center">${item.quantity}</td>
    <td align="right"> GH₵${item.price.toFixed(2)}</td>
    </tr>
  `
    )
    .join('\n')}
  </tbody>
  <tfoot>
  <tr>
  <td colspan="2">Items Price:</td>
  <td align="right"> GH₵
  <tr>
  <td colspan="2">Shipping Price:</td>
  <td align="right"> GH₵${order.shippingPrice.toFixed(2)}</td>
  </tr>
  <tr>
  <td colspan="2"><strong>Total Price:</strong></td>
  <td align="right"><strong> GH₵${order.totalPrice.toFixed(2)}</strong></td>
  </tr>
  <tr>
  <td colspan="2">Payment Method:</td>
  <td align="right">${order.paymentMethod}</td>
  </tr>
  </table>
  <h2>Shipping address</h2>
  <p>
  ${order.shippingAddress.fullName},<br/>
  ${order.shippingAddress.address},<br/>
  ${order.shippingAddress.city},<br/>
  </p>
  <hr/>
  <p>
  Thank you and please come again.
  </p>
  `;
};
