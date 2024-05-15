// Importing JWT for token generation and verification
import jwt from 'jsonwebtoken';

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
                res.status(401).send({message: 'Invalid Token'});
            } else {
                req.user = decoded; // Set the decoded user information in req.user
                next();
            }
        });
    } else {
        res.status(401).send({message: 'No Token'});
    }
};
// Middleware to verify if the user is an admin
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401).send({message: 'Invalid Admin Token'});
    }
};
