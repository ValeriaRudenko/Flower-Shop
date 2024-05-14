import React, { useContext, useEffect, useReducer } from 'react'; // Import React and necessary hooks
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook for navigation
import { Store } from '../Store'; // Import Store context
import Row from 'react-bootstrap/Row'; // Import Row component from react-bootstrap
import Col from 'react-bootstrap/Col'; // Import Col component from react-bootstrap
import Card from 'react-bootstrap/Card'; // Import Card component from react-bootstrap
import Button from 'react-bootstrap/Button'; // Import Button component from react-bootstrap
import ListGroup from 'react-bootstrap/ListGroup'; // Import ListGroup component from react-bootstrap
import CheckoutSteps from '../components/CheckoutSteps'; // Import custom CheckoutSteps component
import { Helmet } from 'react-helmet-async'; // Import Helmet component from react-helmet-async
import { Link } from 'react-router-dom'; // Import Link component from react-router-dom
import { toast } from 'react-toastify'; // Import toast notification from react-toastify
import { getError } from './utils'; // Import custom utility function getError
import LoadingBox from '../components/LoadingBox'; // Import custom LoadingBox component
import Axios from 'axios'; // Import Axios for HTTP requests
import ProductPrice from "../components/Price"; // Import custom ProductPrice component

// Define reducer function to manage loading state
const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loading: true }; // Set loading to true on request
    case 'CREATE_SUCCESS':
      return { ...state, loading: false }; // Set loading to false on success
    case 'CREATE_FAIL':
      return { ...state, loading: false }; // Set loading to false on failure
    default:
      return state; // Return current state by default
  }
};

// Define PlaceOrderScreen component
export default function PlaceOrderScreen() {
  const navigate = useNavigate(); // Initialize navigate function for routing
  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false, // Initialize loading state using useReducer hook
  });

  const { state, dispatch: ctxDispatch } = useContext(Store); // Access global state and dispatch function from Store context
  const { cart, userInfo } = state; // Destructure cart and userInfo from global state

  // Function to round a number to two decimal places
  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;

  // Calculate prices for items, shipping,  and total
  cart.itemsPrice = round2(
      cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );
  cart.shippingPrice = cart.itemsPrice > 100 ? round2(0) : round2(20);

  cart.totalPrice = cart.itemsPrice + cart.shippingPrice;

  // Function to handle placing an order
  const placeOrderHandler = async () => {
    try {
      dispatch({ type: 'CREATE_REQUEST' }); // Dispatch action to set loading state

      // Send POST request to create order
      const { data } = await Axios.post(
          '/api/orders',
          {
            orderItems: cart.cartItems,
            shippingAddress: cart.shippingAddress,
            paymentMethod: 'PayPal', // Set payment method to PayPal
            itemsPrice: cart.itemsPrice,
            shippingPrice: cart.shippingPrice,
            totalPrice: cart.totalPrice,
          },
          {
            headers: {
              authorization: `Bearer ${userInfo.token}`,
            },
          }
      );
      ctxDispatch({ type: 'CART_CLEAR' }); // Clear cart in global state
      dispatch({ type: 'CREATE_SUCCESS' }); // Dispatch action to indicate success
      localStorage.removeItem('cartItems'); // Remove cart items from local storage
      navigate(`/order/${data.order._id}`); // Navigate to order confirmation page
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' }); // Dispatch action to indicate failure
      toast.error(getError(err)); // Show error message using toast notification
    }
  };

  // Effect hook to navigate to placeorder page if payment method is not set
  useEffect(() => {
    if (!cart.paymentMethod) {
      navigate('/placeorder');
    }
  }, [cart, navigate]);

  // Group cart items by ID or bouquet ID
  const groupedCartItems = cart.cartItems.reduce((acc, item) => {
    if (item.type === 'product') {
      acc[item._id] = [item];
    } else {
      if (!acc[item.bouquetId]) {
        acc[item.bouquetId] = [];
      }
      acc[item.bouquetId].push(item);
    }
    return acc;
  }, {});

  // Return JSX representing the component
  return (
      <div>
        <CheckoutSteps step1 step2 step3 step4 /> {/* Display checkout steps */}
        <Helmet>
          <title>Preview Order</title>
        </Helmet>
        <h1 className="my-3">Preview Order</h1>
        <Row>
          <Col md={8}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Shipping</Card.Title>
                <Card.Text>
                  <strong>Name:</strong> {cart.shippingAddress.fullName} <br />
                  <strong>Address: </strong> {cart.shippingAddress.address},
                  {cart.shippingAddress.city},
                </Card.Text>
                <Link to="/shipping">
                  <Button variant="outline-primary" type="button">
                    Edit
                  </Button>
                </Link>
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Items</Card.Title>
                <ListGroup variant="flush">
                  {/* Iterate over grouped cart items and display */}
                  {Object.keys(groupedCartItems).map((groupId, index) => (
                      <ListGroup.Item key={groupId}>
                        <Row className="align-items-center">
                          {/* Check item type and display accordingly */}
                          {groupedCartItems[groupId][0].type === 'product' ? (
                              <>
                                <Col md={6}>
                                  <img
                                      src={groupedCartItems[groupId][0].image}
                                      alt={groupedCartItems[groupId][0].name}
                                      className="img-fluid rounded img-thumbnail"
                                  ></img>{' '}
                                  <Link
                                      to={`/product/${groupedCartItems[groupId][0].slug}`}
                                  >
                                    {groupedCartItems[groupId][0].name}
                                  </Link>
                                </Col>
                                <Col md={3}>
                            <span>
                              {groupedCartItems[groupId][0].quantity}
                            </span>
                                </Col>
                                <Col md={3}>
                                  <ProductPrice
                                      price={groupedCartItems[groupId][0].price}
                                  ></ProductPrice>
                                </Col>
                              </>
                          ) : (
                              <Col>
                                <h5>Custom Bouquet {index + 1}</h5>
                                <ul>
                                  {/* Iterate over items in bouquet and display */}
                                  {groupedCartItems[groupId].map((item) => (
                                      <li key={item._id}>
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="img-fluid rounded img-thumbnail"
                                        />
                                        {item.name} - {item.quantity}{' '}
                                        <ProductPrice price={item.price}></ProductPrice>
                                      </li>
                                  ))}
                                </ul>
                                <h6>
                                  Total Price:{' '}
                                  <ProductPrice
                                      price={groupedCartItems[groupId].reduce(
                                          (a, c) => a + c.price * c.quantity,
                                          0
                                      )}
                                  />
                                </h6>
                              </Col>
                          )}
                        </Row>
                      </ListGroup.Item>
                  ))}
                </ListGroup>
                <Link to="/cart">
                  <Button variant="outline-primary" type="button">
                    Edit
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card>
              <Card.Body>
                <Card.Title>Order Summary</Card.Title>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <Row>
                      <Col>Items</Col>
                      <Col>€ {cart.itemsPrice.toFixed(2)}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Shipping</Col>
                      <Col>€ {cart.shippingPrice.toFixed(2)}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>
                        <strong> Order Total</strong>
                      </Col>
                      <Col>
                        <strong>€ {cart.totalPrice.toFixed(2)}</strong>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <div className="d-grid">
                      {/* Button to place order */}
                      <Button
                          variant="outline-primary"
                          type="button"
                          onClick={placeOrderHandler}
                          disabled={cart.cartItems.length === 0}
                      >
                        Place Order
                      </Button>
                    </div>
                    {/* Display loading spinner if loading */}
                    {loading && <LoadingBox></LoadingBox>}
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
  );
}
