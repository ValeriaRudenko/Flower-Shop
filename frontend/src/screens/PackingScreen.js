import axios from 'axios';
import React, {
    useContext,
    useEffect,
    useReducer,
    useRef,
    useState,
} from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Rating from '../components/Rating';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { getError } from './utils';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import ProductPrice from "../components/Price";

//reducer function for managing state

const reducer = (state, action) => {
    switch (action.type) {
        case 'REFRESH_PRODUCT':
            return { ...state, packing: action.payload };
        case 'CREATE_REQUEST':
            return { ...state, loadingCreateReview: true };
        case 'CREATE_SUCCESS':
            return { ...state, loadingCreateReview: false };
        case 'CREATE_FAIL':
            return { ...state, loadingCreateReview: false };
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, packing: action.payload, loading: false };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};
// PackingScreen component
export default function PackingScreen() {
    // Creating a reference for reviews section
    let reviewsRef = useRef();
    // State variables for rating, comment, and selected image
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [selectedImage, setSelectedImage] = useState('');
    // Getting navigation function from React Router
    const navigate = useNavigate();
    // Getting URL parameters from React Router
    const params = useParams();
    // Destructuring URL parameters
    const { slug } = params;
// Reducer for managing state related to packing screen
    const [{ loading, error, packing, loadingCreateReview }, dispatch] =
        useReducer(reducer, {
            packing: {},
            loading: true,
            error: '',
        });
    // Effect to fetch packing data from the server
    useEffect(() => {
        const fetchData = async () => {
            // Dispatching fetch request action
            dispatch({ type: 'FETCH_REQUEST' });
            try {
                // Fetching packing data
                const result = await axios.get(`/api/packings/slug/${slug}`);
                // Dispatching success action with data
                dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
            } catch (error) {
                // Dispatching fail action with error message
                dispatch({ type: 'FETCH_FAIL', payload: getError(error) });
            }
            //setProducts(result.data);
        };
        // Calling fetch function
        fetchData();
        // Dependency array with slug parameter
    }, [slug]);
    // Accessing global state and dispatch function from Store context
    const { state, dispatch: ctxDispatch } = useContext(Store);
    // Destructuring global state variables
    const { cart, userInfo } = state;

    // Function to handle adding packing to cart
    const addToCartHandler = async () => {
        // Checking if packing is already in cart
        const itemExist = cart.cartItems.find((x) => x._id === packing._id);
        // Incrementing quantity if already exists, otherwise setting it to 1
        const quantity = itemExist ? itemExist.quantity + 1 : 1;
        // Fetching packing data to check stock
        const { data } = await axios.get(`/api/packings/${packing._id}`);
        // Checking if stock is available
        if (data.countInStock < quantity) {
            // Alerting user if out of stock
            window.alert('Sorry. This packing is out of stock');
            return;
        }
        // Dispatching action to add item to cart
        ctxDispatch({
            type: 'CART_ADD_ITEM',
            payload: { ...packing, quantity },
        });
        // Redirecting to cart page
        navigate('/cart');
    };
    // Function to handle review submission
    const submitHandler = async (e) => {
        // Preventing default form submission behavior
        e.preventDefault();
        // Checking if comment and rating are provided
        if (!comment || !rating) {
            // Displaying error message if not provided
            toast.error('Please enter comment and rating');
            return;
        }
        try {
            // Making POST request to create review
            const { data } = await axios.post(
                `/api/packings/${packing._id}/reviews`,
                { rating, comment, name: userInfo.name },
                {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                }
            );

            dispatch({
                // Dispatching success action after review submission
                type: 'CREATE_SUCCESS',
            });
            // Showing success toast notification
            toast.success('Review submitted successfully');
            // Adding newly created review to the packing reviews list
            packing.reviews.unshift(data.review);
            // Updating number of reviews
            packing.numReviews = data.numReviews;
            // Updating average rating
            packing.rating = data.rating;
            // Dispatching action to refresh packing data
            dispatch({ type: 'REFRESH_FLOWER', payload: packing });
            // Scrolling to reviews section
            window.scrollTo({
                behavior: 'smooth',
                top: reviewsRef.current.offsetTop,
            });
        } catch (error) {
            // Displaying error toast notification if request fails
            toast.error(getError(error));
            // Dispatching fail action
            dispatch({ type: 'CREATE_FAIL' });
        }
    };
// Returning loading component if data is still loading
    return loading ? (
        <LoadingBox />
    ) : error ? (
        // Returning error message if data fetching fails
        <MessageBox variant="danger">{error}</MessageBox>
    ) : (
        <div>
            <Row>
                <Col md={6}>
                    <img
                        className="img-large"
                        src={selectedImage || packing.image}
                        alt={packing.name}
                    />
                </Col>
                <Col md={3}>
                    <ListGroup variant="flush">
                        <ListGroup.Item>
                            <h2>{packing.name}</h2>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <Rating
                                rating={packing.rating}
                                numReviews={packing.numReviews}
                            ></Rating>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <ProductPrice
                                price={packing.price}
                            ></ProductPrice>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <Row xs={1} md={2} className="g-2">
                                {[packing.image, ...packing.images].map((x) => (
                                    <Col key={x}>
                                        <Card>
                                            <Button
                                                className="thumbnail"
                                                type="button"
                                                variant="light"
                                                onClick={() => setSelectedImage(x)}
                                            >
                                                <Card.Img variant="top" src={x} alt="product" />
                                            </Button>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </ListGroup.Item>
                        {/*<ListGroup.Item>*/}
                        {/*    Description : <p>{packing.description}</p>*/}
                        {/*    Color: <p>{packing.color}</p>*/}
                        {/*    Size: <p>{packing.size}</p>*/}
                        {/*</ListGroup.Item>*/}
                    </ListGroup>
                </Col>
                <Col md={3}>
                    <Card>
                        <Card.Body>
                            <ListGroup variant="flush">
                                <ListGroup.Item>
                                    <ProductPrice
                                        price={packing.price}
                                    ></ProductPrice>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col>Status:</Col>
                                        <Col>
                                            {packing.countInStock > 0 ? (
                                                <Badge bg="success">In Stock</Badge>
                                            ) : (
                                                <Badge bg="danger">Not Available</Badge>
                                            )}
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                                {packing.countInStock > 0 && (
                                    <ListGroup.Item>
                                        <div className="d-grid">
                                            <Button
                                                variant="outline-primary"
                                                onClick={addToCartHandler}
                                            >
                                                Add to Cart
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                )}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <div className="my-3">
                <h2 ref={reviewsRef}>Reviews</h2>
                <div className="mb-3">
                    {packing.reviews.length === 0 && (
                        <MessageBox>There is no review</MessageBox>
                    )}
                </div>
                <ListGroup>
                    {packing.reviews.map((review) => (
                        <ListGroup.Item key={review._id}>
                            <strong>{review.name}</strong>
                            <Rating rating={review.rating} caption=" "></Rating>
                            <p>{review.createdAt.substring(0, 10)}</p>
                            <p>{review.comment}</p>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
                <div className="my-3">
                    {userInfo ? (
                        <form onSubmit={submitHandler}>
                            <h2>Write a review</h2>
                            <Form.Group className="mb-3" controlId="rating">
                                <Form.Label>Rating</Form.Label>
                                <Form.Select
                                    aria-label="Rating"
                                    value={rating}
                                    onChange={(e) => setRating(e.target.value)}
                                >
                                    <option value="">Select...</option>
                                    <option value="1">1- Poor</option>
                                    <option value="2">2- Fair</option>
                                    <option value="3">3- Good</option>
                                    <option value="4">4- Very good</option>
                                    <option value="5">5- Excelent</option>
                                </Form.Select>
                            </Form.Group>
                            <FloatingLabel
                                controlId="floatingTextarea"
                                label="Comments"
                                className="mb-3"
                            >
                                <Form.Control
                                    as="textarea"
                                    placeholder="Leave a comment here"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </FloatingLabel>

                            <div className="mb-3">
                                <Button
                                    disabled={loadingCreateReview}
                                    type="submit"
                                    variant="outline-primary"
                                >
                                    Submit
                                </Button>
                                {loadingCreateReview && <LoadingBox></LoadingBox>}
                            </div>
                        </form>
                    ) : (
                        <MessageBox>
                            Please{' '}
                            <Link to={`/signin?redirect=/packing/${packing.slug}`}>
                                Sign In
                            </Link>{' '}
                            to write a review
                        </MessageBox>
                    )}
                </div>
            </div>
        </div>
    );
}
