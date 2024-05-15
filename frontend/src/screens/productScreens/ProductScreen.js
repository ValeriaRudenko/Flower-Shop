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
import Rating from '../../components/Rating';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../../components/LoadingBox';
import MessageBox from '../../components/MessageBox';
import { getError } from '../utils';
import { Store } from '../../Store';
import { toast } from 'react-toastify';
import ProductPrice from "../../components/Price";

import {reducer} from "../../components/reducers/Reducer";


export default function ProductScreen() {
  let reviewsRef = useRef();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedImage, setSelectedImage] = useState('');

  const navigate = useNavigate();
  const params = useParams();
  const { slug } = params;

  const [{ loading, error, product, loadingCreateReview }, dispatch] =
      useReducer(reducer, {
        product: [],
        loading: true,
        error: '',
      });
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get(`/api/products/slug/${slug}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (error) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(error) });
      }
      //setProducts(result.data);
    };
    fetchData();
  }, [slug]);

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const addToCartHandler = async () => {
    const itemExist = cart.cartItems.find((x) => x._id === product._id);
    const quantity = itemExist ? itemExist.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry. This product is out of stock');
      return;
    }
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...product, quantity },
    });
    navigate('/cart');
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!comment || !rating) {
      toast.error('Please enter comment and rating');
      return;
    }
    try {
      const reviewData = {
        rating: rating,
        comment: comment,
        name: userInfo.name, // Assuming userInfo contains user's name
      };

      const response = await axios.post(
          `/api/products/${product._id}/reviews`,
          reviewData,
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          }
      );

      const { data } = response;
      // Update local state with new review data
      product.reviews.unshift(data.review);
      product.numReviews = data.numReviews;
      product.rating = data.rating;

      // Dispatch actions to update state
      dispatch({ type: 'CREATE_SUCCESS' });
      dispatch({ type: 'REFRESH_PRODUCT', payload: product });


      // Scroll to reviews section
      window.scrollTo({
        behavior: 'smooth',
        top: reviewsRef.current.offsetTop,
      });

      toast.success('Review submitted successfully');
    } catch (error) {
      // Handle errors
      const errorMessage = getError(error);
      toast.error(errorMessage);
      dispatch({ type: 'CREATE_FAIL' });
    }
  };

  // Console log all reviews
  console.log('All reviews:', product.reviews);

  return loading ? (
      <LoadingBox />
  ) : error ? (
      <MessageBox variant="danger">{error}</MessageBox>
  ) : (
      <div>
        <Row>
          <Col md={6}>
            <img
                className="img-large"
                src={selectedImage || product.image}
                alt={product.name}
            />
          </Col>
          <Col md={3}>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h2>{product.name}</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Rating
                    rating={product.rating}
                    numReviews={product.numReviews}
                ></Rating>
              </ListGroup.Item>
              <ListGroup.Item>
                <ProductPrice
                    price={product.price}
                ></ProductPrice>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row xs={1} md={2} className="g-2">
                  {[product.image, ...product.images].map((x) => (
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
              <ListGroup.Item>
                Description : <p>{product.description}</p>
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={3}>
            <Card>
              <Card.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <ProductPrice
                        price={product.price}
                    ></ProductPrice>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Status:</Col>
                      <Col>
                        {product.countInStock > 0 ? (
                            <Badge bg="success">In Stock</Badge>
                        ) : (
                            <Badge bg="danger">Not Available</Badge>
                        )}
                      </Col>
                    </Row>
                  </ListGroup.Item>
                  {product.countInStock > 0 && (
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
            {product.reviews.length === 0 && (
                <MessageBox>There is no review</MessageBox>
            )}
          </div>
          <ListGroup>
            {product.reviews.map((review) => (
                <ListGroup.Item key={review._id}>
                  <strong>{review.name}</strong>
                  <Rating rating={review.rating} caption=" "></Rating>
                  {review.createdAt && <p>{review.createdAt.substring(0, 10)}</p>}
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
                  <Link to={`/signin?redirect=/product/${product.slug}`}>
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
